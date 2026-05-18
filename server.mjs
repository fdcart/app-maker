import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { basename, extname, join, normalize } from 'node:path';

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['\"]|['\"]$/g, '');
  }
}

const PORT = Number(process.env.PORT || 5173);
const ROOT = process.cwd();
const sessions = new Map();

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function parseCookies(header = '') {
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim().split('='))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value)]),
  );
}

function getSession(request, response) {
  const cookies = parseCookies(request.headers.cookie);
  let id = cookies.codex_app_session;
  if (!id || !sessions.has(id)) {
    id = randomBytes(24).toString('hex');
    sessions.set(id, { createdAt: Date.now() });
    response.setHeader('Set-Cookie', `codex_app_session=${id}; Path=/; HttpOnly; SameSite=Lax`);
  }
  return sessions.get(id);
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function redirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function getPublicOrigin(request) {
  return process.env.PUBLIC_URL || `http://${request.headers.host}`;
}

function requireGitHub(session, response) {
  if (!session.githubToken) {
    sendJson(response, 401, { error: 'Connect GitHub first.' });
    return false;
  }
  return true;
}

async function githubFetch(session, path, options = {}) {
  const result = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${session.githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
  });
  const text = await result.text();
  const data = text ? JSON.parse(text) : null;
  if (!result.ok) {
    throw new Error(data?.message || `GitHub request failed with ${result.status}`);
  }
  return data;
}

async function validateGitHubToken(session, token) {
  session.githubToken = token;
  try {
    session.githubUser = await githubFetch(session, '/user');
    return session.githubUser;
  } catch (error) {
    delete session.githubToken;
    delete session.githubUser;
    throw error;
  }
}

async function validateOpenAIKey(apiKey) {
  const model = process.env.OPENAI_MODEL || 'gpt-5.2-codex';
  const result = await fetch(`https://api.openai.com/v1/models/${encodeURIComponent(model)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (result.status === 404) return { model, warning: 'Model lookup was unavailable, but the API key format is valid.' };
  const data = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(data.error?.message || 'OpenAI API key verification failed.');
  return { model: data.id || model };
}

function sanitizeProjectName(name = 'codex-app') {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'codex-app';
}

async function createVercelDeployment({ token, name, files }) {
  if (!token) throw new Error('Paste a Vercel token or set VERCEL_TOKEN on the server.');
  if (!Array.isArray(files) || files.length === 0) throw new Error('Generate files before deploying.');
  const result = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: sanitizeProjectName(name),
      target: 'production',
      projectSettings: { framework: null, buildCommand: null, installCommand: null, outputDirectory: null },
      files: files.map((file) => ({ file: String(file.path || '').replace(/^\/+/, ''), data: String(file.content || '') })),
    }),
  });
  const data = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(data.error?.message || data.message || 'Vercel deployment failed.');
  return { id: data.id, url: data.url?.startsWith('http') ? data.url : `https://${data.url}` };
}

function getResponseText(data) {
  if (data.output_text) return data.output_text;
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((part) => part.type === 'output_text' || part.text)
    .map((part) => part.text || '')
    .join('');
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('OpenAI did not return a JSON object.');
  return JSON.parse(raw.slice(start, end + 1));
}

async function handleApi(request, response, pathname) {
  const session = getSession(request, response);

  if (pathname === '/api/status') {
    return sendJson(response, 200, {
      githubConnected: Boolean(session.githubToken),
      githubUser: session.githubUser || null,
      openaiConnected: Boolean(session.openaiKey || process.env.OPENAI_API_KEY),
      openaiModel: process.env.OPENAI_MODEL || 'gpt-5.2-codex',
      hasGitHubOAuth: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
      vercelConnected: Boolean(session.vercelToken || process.env.VERCEL_TOKEN),
    });
  }

  if (pathname === '/api/openai/connect' && request.method === 'POST') {
    const { apiKey } = await readJson(request);
    if (!apiKey?.startsWith('sk-')) {
      return sendJson(response, 400, { error: 'Enter an OpenAI API key that starts with sk-.' });
    }
    const validation = await validateOpenAIKey(apiKey);
    session.openaiKey = apiKey;
    return sendJson(response, 200, { ok: true, ...validation });
  }

  if (pathname === '/api/github/connect-token' && request.method === 'POST') {
    const { token } = await readJson(request);
    if (!/^(ghp_|github_pat_|gho_|ghu_|ghs_)/.test(token || '')) {
      return sendJson(response, 400, { error: 'Paste a GitHub token such as ghp_... or github_pat_...' });
    }
    const user = await validateGitHubToken(session, token);
    return sendJson(response, 200, { ok: true, user: { login: user.login, avatarUrl: user.avatar_url } });
  }

  if (pathname === '/api/auth/github/start') {
    if (!process.env.GITHUB_CLIENT_ID) {
      return sendJson(response, 500, { error: 'Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable GitHub login.' });
    }
    const state = randomBytes(16).toString('hex');
    session.githubState = state;
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${getPublicOrigin(request)}/api/auth/github/callback`;
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'repo user:email',
      state,
    });
    return redirect(response, `https://github.com/login/oauth/authorize?${params}`);
  }

  if (pathname === '/api/auth/github/callback') {
    const url = new URL(request.url, getPublicOrigin(request));
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    if (!code || !state || state !== session.githubState) {
      return sendJson(response, 400, { error: 'Invalid GitHub OAuth callback state.' });
    }
    const redirectUri = process.env.GITHUB_REDIRECT_URI || `${getPublicOrigin(request)}/api/auth/github/callback`;
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error || !tokenData.access_token) {
      return sendJson(response, 400, { error: tokenData.error_description || 'GitHub login failed.' });
    }
    await validateGitHubToken(session, tokenData.access_token);
    return redirect(response, '/?github=connected');
  }

  if (pathname === '/api/github/repos') {
    if (!requireGitHub(session, response)) return;
    const repos = await githubFetch(session, '/user/repos?sort=updated&per_page=20');
    return sendJson(response, 200, { repos: repos.map((repo) => ({ fullName: repo.full_name, private: repo.private })) });
  }

  if (pathname === '/api/github/create-repo' && request.method === 'POST') {
    if (!requireGitHub(session, response)) return;
    const { name, private: isPrivate = true } = await readJson(request);
    if (!/^[a-zA-Z0-9._-]{2,100}$/.test(name || '')) {
      return sendJson(response, 400, { error: 'Use a valid GitHub repository name.' });
    }
    const repo = await githubFetch(session, '/user/repos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, private: isPrivate, auto_init: true }),
    });
    return sendJson(response, 200, { repo: repo.full_name, url: repo.html_url });
  }

  if (pathname === '/api/github/publish' && request.method === 'POST') {
    if (!requireGitHub(session, response)) return;
    const { repo, files, message = 'Build app with Codex App Maker' } = await readJson(request);
    if (!repo || !Array.isArray(files) || files.length === 0) {
      return sendJson(response, 400, { error: 'Choose a repository and generate files first.' });
    }
    const committed = [];
    for (const file of files) {
      const path = String(file.path || '').replace(/^\/+/, '');
      if (!path || path.includes('..')) throw new Error(`Unsafe file path: ${path}`);
      let sha;
      try {
        const existing = await githubFetch(session, `/repos/${repo}/contents/${encodeURIComponent(path).replaceAll('%2F', '/')}`);
        sha = existing.sha;
      } catch (error) {
        if (!String(error.message).includes('Not Found')) throw error;
      }
      await githubFetch(session, `/repos/${repo}/contents/${encodeURIComponent(path).replaceAll('%2F', '/')}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          content: Buffer.from(String(file.content || ''), 'utf8').toString('base64'),
          sha,
        }),
      });
      committed.push(path);
    }
    return sendJson(response, 200, { ok: true, committed, repoUrl: `https://github.com/${repo}` });
  }


  if (pathname === '/api/vercel/deploy' && request.method === 'POST') {
    const { token, name, files } = await readJson(request);
    if (token) session.vercelToken = token;
    const deployment = await createVercelDeployment({ token: session.vercelToken || process.env.VERCEL_TOKEN, name, files });
    return sendJson(response, 200, deployment);
  }

  if (pathname === '/api/codex/build' && request.method === 'POST') {
    const openaiKey = session.openaiKey || process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return sendJson(response, 401, { error: 'Connect OpenAI first or set OPENAI_API_KEY on the server.' });
    }
    const { prompt, app } = await readJson(request);
    const model = process.env.OPENAI_MODEL || 'gpt-5.2-codex';
    const responseSchema = {
      type: 'object',
      additionalProperties: false,
      required: ['summary', 'files', 'nextSteps'],
      properties: {
        summary: { type: 'string' },
        nextSteps: { type: 'array', items: { type: 'string' } },
        files: {
          type: 'array',
          minItems: 3,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['path', 'content', 'purpose'],
            properties: {
              path: { type: 'string' },
              content: { type: 'string' },
              purpose: { type: 'string' },
            },
          },
        },
      },
    };
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        input: [
          {
            role: 'developer',
            content:
              'You are Codex inside a visual app builder. Return only JSON for a small production-quality static web app. Include index.html, src/app.js, src/styles.css, and README.md. Do not include secrets.',
          },
          {
            role: 'user',
            content: `Build this app from the visual brief. Prompt: ${prompt}\nCurrent visual plan: ${JSON.stringify(app || {})}`,
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'codex_app_files',
            strict: true,
            schema: responseSchema,
          },
        },
      }),
    });
    const data = await openaiResponse.json();
    if (!openaiResponse.ok) {
      return sendJson(response, openaiResponse.status, { error: data.error?.message || 'OpenAI request failed.' });
    }
    const outputText = getResponseText(data);
    const output = outputText ? extractJson(outputText) : extractJson(JSON.stringify(data));
    return sendJson(response, 200, { model, ...output });
  }

  sendJson(response, 404, { error: 'Unknown API route.' });
}

async function serveStatic(request, response, pathname) {
  const safePath = normalize(pathname === '/' ? '/index.html' : pathname).replace(/^[/\\]+/, '');
  if (safePath.startsWith('..')) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }
  const filePath = join(ROOT, safePath);
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': mimeTypes.get(extname(filePath)) || 'application/octet-stream' });
    response.end(await readFile(filePath));
  } catch {
    if (!extname(safePath)) {
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(await readFile(join(ROOT, 'index.html')));
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(`Not found: ${basename(safePath)}`);
  }
}

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url.pathname);
    } else {
      await serveStatic(request, response, url.pathname);
    }
  } catch (error) {
    sendJson(response, 500, { error: error.message || 'Unexpected server error.' });
  }
}).listen(PORT, () => {
  console.log(`Codex App Maker running on http://localhost:${PORT}`);
});

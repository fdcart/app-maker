const sessions = globalThis.__codexAppSessions || new Map();
globalThis.__codexAppSessions = sessions;

function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').map((part) => part.trim().split('=')).filter(([key, value]) => key && value),
  );
}

function getSession(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  let id = cookies.codex_app_session;
  if (!id || !sessions.has(id)) {
    id = crypto.randomUUID();
    sessions.set(id, { createdAt: Date.now() });
    res.setHeader('Set-Cookie', `codex_app_session=${id}; Path=/; HttpOnly; SameSite=Lax; Secure`);
  }
  return sessions.get(id);
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

function publicOrigin(req) {
  return process.env.PUBLIC_URL || `https://${req.headers.host}`;
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
  if (!result.ok) throw new Error(data?.message || `GitHub request failed with ${result.status}`);
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
  return String(name).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'codex-app';
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
      projectSettings: { framework: 'vite', buildCommand: 'npm run build', installCommand: 'npm install', outputDirectory: 'dist' },
      files: files.map((file) => ({ file: String(file.path || '').replace(/^\/+/, ''), data: String(file.content || '') })),
    }),
  });
  const data = await result.json().catch(() => ({}));
  if (!result.ok) throw new Error(data.error?.message || data.message || 'Vercel deployment failed.');
  return { id: data.id, url: data.url?.startsWith('http') ? data.url : `https://${data.url}` };
}

function responseText(data) {
  if (data.output_text) return data.output_text;
  return (data.output || []).flatMap((item) => item.content || []).map((part) => part.text || '').join('');
}

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  return JSON.parse(raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1));
}

export default async function handler(req, res) {
  try {
    const session = getSession(req, res);
    const path = new URL(req.url, publicOrigin(req)).pathname;

    if (path === '/api/status') {
      return res.status(200).json({
        githubConnected: Boolean(session.githubToken),
        githubUser: session.githubUser || null,
        openaiConnected: Boolean(session.openaiKey || process.env.OPENAI_API_KEY),
        openaiModel: process.env.OPENAI_MODEL || 'gpt-5.2-codex',
        hasGitHubOAuth: Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        vercelConnected: Boolean(session.vercelToken || process.env.VERCEL_TOKEN),
      });
    }

    if (path === '/api/openai/connect' && req.method === 'POST') {
      const { apiKey } = await readBody(req);
      if (!apiKey?.startsWith('sk-')) return res.status(400).json({ error: 'Enter an OpenAI API key that starts with sk-.' });
      const validation = await validateOpenAIKey(apiKey);
      session.openaiKey = apiKey;
      return res.status(200).json({ ok: true, ...validation });
    }

    if (path === '/api/github/connect-token' && req.method === 'POST') {
      const { token } = await readBody(req);
      if (!/^(ghp_|github_pat_|gho_|ghu_|ghs_)/.test(token || '')) return res.status(400).json({ error: 'Paste a GitHub token such as ghp_... or github_pat_...' });
      const user = await validateGitHubToken(session, token);
      return res.status(200).json({ ok: true, user: { login: user.login, avatarUrl: user.avatar_url } });
    }

    if (path === '/api/auth/github/start') {
      if (!process.env.GITHUB_CLIENT_ID) return res.status(500).json({ error: 'Set GitHub OAuth environment variables.' });
      session.githubState = crypto.randomUUID();
      const redirectUri = process.env.GITHUB_REDIRECT_URI || `${publicOrigin(req)}/api/auth/github/callback`;
      const params = new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID, redirect_uri: redirectUri, scope: 'repo user:email', state: session.githubState });
      res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
      return res.end();
    }

    if (path === '/api/auth/github/callback') {
      const url = new URL(req.url, publicOrigin(req));
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      if (!code || state !== session.githubState) return res.status(400).json({ error: 'Invalid GitHub OAuth callback state.' });
      const redirectUri = process.env.GITHUB_REDIRECT_URI || `${publicOrigin(req)}/api/auth/github/callback`;
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code, redirect_uri: redirectUri }),
      });
      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) return res.status(400).json({ error: tokenData.error_description || 'GitHub login failed.' });
      await validateGitHubToken(session, tokenData.access_token);
      res.writeHead(302, { Location: '/?github=connected' });
      return res.end();
    }

    if (!session.githubToken && path.startsWith('/api/github/')) return res.status(401).json({ error: 'Connect GitHub first.' });

    if (path === '/api/github/repos') {
      const repos = await githubFetch(session, '/user/repos?sort=updated&per_page=20');
      return res.status(200).json({ repos: repos.map((repo) => ({ fullName: repo.full_name, private: repo.private })) });
    }

    if (path === '/api/github/create-repo' && req.method === 'POST') {
      const { name, private: isPrivate = true } = await readBody(req);
      const repo = await githubFetch(session, '/user/repos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, private: isPrivate, auto_init: true }) });
      return res.status(200).json({ repo: repo.full_name, url: repo.html_url });
    }

    if (path === '/api/github/publish' && req.method === 'POST') {
      const { repo, files, message = 'Build app with Codex App Maker' } = await readBody(req);
      if (!repo || !Array.isArray(files) || files.length === 0) return res.status(400).json({ error: 'Choose a repository and generate files first.' });
      const committed = [];
      for (const file of files) {
        const filePath = String(file.path || '').replace(/^\/+/, '');
        let sha;
        try {
          sha = (await githubFetch(session, `/repos/${repo}/contents/${encodeURIComponent(filePath).replaceAll('%2F', '/')}`)).sha;
        } catch (error) {
          if (!String(error.message).includes('Not Found')) throw error;
        }
        await githubFetch(session, `/repos/${repo}/contents/${encodeURIComponent(filePath).replaceAll('%2F', '/')}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, content: Buffer.from(String(file.content || '')).toString('base64'), sha }),
        });
        committed.push(filePath);
      }
      return res.status(200).json({ ok: true, committed, repoUrl: `https://github.com/${repo}` });
    }


    if (path === '/api/vercel/deploy' && req.method === 'POST') {
      const { token, name, files } = await readBody(req);
      if (token) session.vercelToken = token;
      const deployment = await createVercelDeployment({ token: session.vercelToken || process.env.VERCEL_TOKEN, name, files });
      return res.status(200).json(deployment);
    }

    if (path === '/api/codex/build' && req.method === 'POST') {
      const openaiKey = session.openaiKey || process.env.OPENAI_API_KEY;
      if (!openaiKey) return res.status(401).json({ error: 'Connect OpenAI first or set OPENAI_API_KEY on the server.' });
      const { prompt, app } = await readBody(req);
      const model = process.env.OPENAI_MODEL || 'gpt-5.2-codex';
      const result = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST', headers: { Authorization: `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          input: [
            { role: 'developer', content: 'You are Codex in a visual app builder. Return only JSON with summary, files, and nextSteps. Generate a native React + Vite app. Include package.json, index.html, src/main.jsx, src/App.jsx, src/styles.css, README.md. Use functional React components, realistic mock data, accessible markup, responsive CSS, and no secrets.' },
            { role: 'user', content: `Build this app. Prompt: ${prompt}\nPlan: ${JSON.stringify(app || {})}` },
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'codex_app_files',
              strict: true,
              schema: {
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
              },
            },
          },
        }),
      });
      const data = await result.json();
      if (!result.ok) return res.status(result.status).json({ error: data.error?.message || 'OpenAI request failed.' });
      return res.status(200).json({ model, ...extractJson(responseText(data)) });
    }

    return res.status(404).json({ error: 'Unknown API route.' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected server error.' });
  }
}

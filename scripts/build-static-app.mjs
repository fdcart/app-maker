import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';

const requiredFiles = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'vercel.json',
  '.github/workflows/vercel.yml',
  'scripts/publish-vercel.mjs',
  'server.mjs',
  'api/[...route].js',
];

const requiredSnippets = [
  ['index.html', 'Codex App Maker'],
  ['index.html', 'Publish to Vercel'],
  ['index.html', 'src/app.js'],
  ['src/app.js', 'function inferApp'],
  ['src/app.js', 'showPublishReadiness'],
  ['index.html', 'Generate app plan'],
  ['src/styles.css', '.workspace'],
  ['src/styles.css', '.vercel-publish-card'],
  ['src/styles.css', '@media'],
  ['vercel.json', 'outputDirectory'],
  ['.github/workflows/vercel.yml', 'vercel deploy --prebuilt --prod'],
  ['scripts/publish-vercel.mjs', 'VERCEL_TOKEN'],
  ['server.mjs', '/api/codex/build'],
  ['server.mjs', '/api/auth/github/start'],
  ['server.mjs', 'https://api.openai.com/v1/responses'],
  ['api/[...route].js', 'https://api.openai.com/v1/responses'],
  ['api/[...route].js', 'https://github.com/login/oauth/authorize'],
  ['server.mjs', '/api/github/connect-token'],
  ['index.html', 'Get an OpenAI API key'],
  ['index.html', 'Create a GitHub token'],
];

for (const file of requiredFiles) {
  readFileSync(file, 'utf8');
}

for (const [file, snippet] of requiredSnippets) {
  const contents = readFileSync(file, 'utf8');
  if (!contents.includes(snippet)) {
    throw new Error(`${file} is missing expected snippet: ${snippet}`);
  }
}

rmSync('dist', { recursive: true, force: true });
for (const file of ['index.html', 'src/app.js', 'src/styles.css']) {
  mkdirSync(dirname(`dist/${file}`), { recursive: true });
  cpSync(file, `dist/${file}`);
}

console.log('Static app and Vercel deployment checks passed. Built dist/.');

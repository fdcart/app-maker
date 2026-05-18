import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

for (const file of ['.env.local', '.env']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['\"]|['\"]$/g, '');
  }
}

const requiredEnv = ['VERCEL_TOKEN', 'VERCEL_ORG_ID', 'VERCEL_PROJECT_ID'];
const missing = requiredEnv.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required Vercel environment variables: ${missing.join(', ')}`);
  console.error('Create a Vercel project, then export these values locally or add them as GitHub repository secrets.');
  console.error('See .env.example and README.md for the exact variable names.');
  process.exit(1);
}

for (const file of ['index.html', 'src/app.js', 'src/styles.css', 'vercel.json']) {
  if (!existsSync(file)) {
    console.error(`Cannot publish because ${file} is missing.`);
    process.exit(1);
  }
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
if (!packageJson.scripts?.build) {
  console.error('Cannot publish because package.json has no build script.');
  process.exit(1);
}

const buildResult = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
if (buildResult.status !== 0) {
  process.exit(buildResult.status ?? 1);
}

const deployArgs = ['vercel@latest', 'deploy', '--yes', '--token', process.env.VERCEL_TOKEN];
if (process.env.VERCEL_PROD !== 'false') {
  deployArgs.splice(2, 0, '--prod');
}

const deployResult = spawnSync('npx', deployArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
    VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID,
  },
});

process.exit(deployResult.status ?? 1);

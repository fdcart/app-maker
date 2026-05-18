# Codex App Maker

A Lovable-style visual app-builder that connects to OpenAI for Codex-style code generation, GitHub for repository creation/commits, and Vercel for deployment.

## Run locally

```bash
npm run dev
```

Open <http://127.0.0.1:5173>. The local server serves the UI and the API routes used for OpenAI, GitHub, and publishing actions.

## Validate

```bash
npm run build
```

The build script is dependency-free, checks that the static app, JavaScript, CSS, and Vercel configuration are present, and writes the deployable site to `dist/`.

## Connect OpenAI and GitHub

1. Copy `.env.example` to `.env` or export the variables in your shell.
2. Set `OPENAI_API_KEY` for server-side OpenAI access, or paste an OpenAI API key into the in-app OpenAI connection card for the current browser session.
3. Create a GitHub OAuth App with callback URL `http://localhost:5173/api/auth/github/callback`, then set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
4. Start the app and click **Login with GitHub** to authorize repo creation and commits.
5. Click **Build with Codex** to generate files with OpenAI, then create/select a repo and commit those files to GitHub.

The default coding model is `gpt-5.2-codex`; override it with `OPENAI_MODEL` if your OpenAI project uses a different model.

## Publish automatically with Vercel

This repo includes two deployment paths:

1. **Automatic GitHub deployment**: `.github/workflows/vercel.yml` validates the static app and deploys to Vercel on every push to `main` or from a manual workflow dispatch.
2. **Local one-command deployment**: `npm run publish:vercel` validates required Vercel environment variables and then runs the Vercel CLI.

### Required secrets or environment variables

Add these to GitHub repository secrets for the workflow, or export them locally before running `npm run publish:vercel`:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `OPENAI_API_KEY` and `OPENAI_MODEL` if you want deployed Codex generation to work without per-session key entry
- `PUBLIC_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `GITHUB_REDIRECT_URI` for deployed GitHub login

The app is configured by `vercel.json` as a static deployment that serves the generated `dist/` directory while the local `server.mjs` provides development API routes.

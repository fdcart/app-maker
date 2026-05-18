# Codex App Maker

A lightweight Lovable-style visual app-builder prototype that lets someone describe an app, preview generated screens, and hand the result to Codex-style implementation tasks.

## Run locally

```bash
npm run dev
```

Open <http://127.0.0.1:5173>.

## Validate

```bash
npm run build
```

The build script is dependency-free, checks that the static app, JavaScript, CSS, and Vercel configuration are present, and writes the deployable site to `dist/`.

## Publish automatically with Vercel

This repo includes two deployment paths:

1. **Automatic GitHub deployment**: `.github/workflows/vercel.yml` validates the static app and deploys to Vercel on every push to `main` or from a manual workflow dispatch.
2. **Local one-command deployment**: `npm run publish:vercel` validates required Vercel environment variables and then runs the Vercel CLI.

### Required secrets or environment variables

Add these to GitHub repository secrets for the workflow, or export them locally before running `npm run publish:vercel`:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The app is configured by `vercel.json` as a static deployment that serves the generated `dist/` directory.

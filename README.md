# EasyCodex

EasyCodex is a Lovable-style visual app builder for non-technical users. You describe an idea in plain language, choose style and features, review a full app blueprint, visualize screen flow, and export a high-quality Codex prompt for building a native React app.

## Stack
- Next.js (App Router)
- React
- Tailwind CSS
- TypeScript
- Supabase-ready data model scaffolding
- Optional OpenAI/Codex prompt refinement hooks

## Pages
- Home (`/`)
- New Project Wizard (`/new-project`)
- Blueprint View (`/blueprint`)
- Visual Screen Map (`/screen-map`)
- Prompt Generator (`/prompt-generator`)
- Saved Projects (`/saved-projects`)
- Settings (`/settings`)

## Run locally
```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Checks
```bash
npm run test
npm run build
npm run typecheck
```

## Notes on Codex integration
This app does **not** pretend to directly control Codex unless a real API/CLI integration is present. Instead it generates clean, complete prompts and structured blueprints that can be sent to Codex workflows.


## Vercel output directory
For Next.js deployments, EasyCodex expects the Next.js default build output (`.next`). If your Vercel project has `Output Directory` set to `dist`, set it to empty/default or `.next`.

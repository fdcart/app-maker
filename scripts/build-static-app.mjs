import { readFileSync } from 'node:fs';

const requiredFiles = [
  'package.json',
  'next.config.ts',
  'tailwind.config.ts',
  'app/layout.tsx',
  'app/page.tsx',
  'app/new-project/page.tsx',
  'app/blueprint/page.tsx',
  'app/screen-map/page.tsx',
  'app/prompt-generator/page.tsx',
  'app/saved-projects/page.tsx',
  'app/settings/page.tsx',
  'lib/blueprint.ts',
  'data/demo-projects.ts',
  'types/project.ts'
];

const requiredSnippets = [
  ['app/page.tsx', 'EasyCodex'],
  ['app/new-project/page.tsx', 'What app do you want to build?'],
  ['app/prompt-generator/page.tsx', 'Copy to clipboard'],
  ['lib/blueprint.ts', 'buildCodexPrompt'],
  ['data/demo-projects.ts', 'StayNest Host OS']
];

for (const file of requiredFiles) {
  readFileSync(file, 'utf8');
}

for (const [file, snippet] of requiredSnippets) {
  const content = readFileSync(file, 'utf8');
  if (!content.includes(snippet)) throw new Error(`${file} missing snippet: ${snippet}`);
}

console.log('EasyCodex structure checks passed.');

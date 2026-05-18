import { readFileSync } from 'node:fs';

const content = readFileSync('data/demo-projects.ts', 'utf8');
if (!content.includes('StayNest Host OS')) throw new Error('Missing demo project name.');
if (!content.includes('databaseTables')) throw new Error('Missing databaseTables in demo project.');
if (!content.includes('screenMap')) throw new Error('Missing screenMap in demo project.');

console.log('Sample project data checks passed.');

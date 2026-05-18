import { AppBlueprint, AppType, FeatureItem, ScreenNode, VisualStyle } from '@/types/project';

export const appTypeOptions: AppType[] = ['Marketplace', 'Social App', 'Dashboard', 'Booking App', 'Portfolio', 'Internal Tool', 'SaaS'];
export const styleOptions: VisualStyle[] = ['Minimal', 'Luxury', 'Playful', 'Old Web', 'Brutalist', 'Glassmorphism', 'iOS-like'];

export const defaultFeatures = [
  'Authentication',
  'Role-based access',
  'Search + filters',
  'Notifications',
  'Dashboard analytics',
  'Billing',
  'Admin panel',
  'API integration'
];

export function createFeatureChecklist(): FeatureItem[] {
  return defaultFeatures.map((label) => ({ label, selected: false }));
}

export function generateBlueprint(input: {
  idea: string;
  appType: AppType;
  style: VisualStyle;
  roles: string[];
  features: FeatureItem[];
}): { blueprint: AppBlueprint; screenMap: ScreenNode[] } {
  const selectedFeatures = input.features.filter((f) => f.selected).map((f) => f.label);
  const appName = inferAppName(input.idea, input.appType);
  const mainScreens = ['Landing', 'Login', `${input.appType} Dashboard`, 'Details', 'Settings'];

  const blueprint: AppBlueprint = {
    appName,
    targetUsers: input.roles.length ? input.roles : ['End User', 'Admin'],
    mainScreens,
    features: selectedFeatures,
    userFlows: [
      'Landing → Login → Dashboard',
      'Dashboard → Details → Action',
      'Dashboard → Settings'
    ],
    designSystem: [
      `${input.style} visual style`,
      'Soft rounded cards and spacing scale',
      'Accessible typography and contrast',
      'Responsive layout from mobile to desktop'
    ],
    deploymentSteps: [
      'Initialize Next.js + Tailwind + TypeScript',
      'Configure Supabase project and auth',
      'Implement screens and flows',
      'Write tests and run lint/typecheck',
      'Deploy to Vercel'
    ],
    databaseTables: [
      { name: 'profiles', columns: ['id', 'email', 'name', 'role', 'created_at'] },
      { name: 'projects', columns: ['id', 'owner_id', 'title', 'status', 'created_at'] },
      { name: 'items', columns: ['id', 'project_id', 'title', 'description', 'state'] },
      { name: 'events', columns: ['id', 'project_id', 'type', 'payload', 'created_at'] }
    ]
  };

  const screenMap: ScreenNode[] = [
    { id: 'landing', title: 'Landing', purpose: 'Introduce value + CTA', next: ['login'] },
    { id: 'login', title: 'Login', purpose: 'Authentication', next: ['dashboard'] },
    { id: 'dashboard', title: `${input.appType} Dashboard`, purpose: 'Primary workspace', next: ['details', 'settings'] },
    { id: 'details', title: 'Details', purpose: 'Focused record view', next: ['dashboard'] },
    { id: 'settings', title: 'Settings', purpose: 'Account and preferences', next: [] }
  ];

  return { blueprint, screenMap };
}

function inferAppName(idea: string, appType: AppType): string {
  const clean = idea.trim();
  if (!clean) return `Easy${appType.replace(/\s+/g, '')}`;
  const first = clean.split(' ').slice(0, 2).join(' ');
  return `${first.replace(/[^a-zA-Z0-9\s]/g, '')} Studio`.trim();
}

export function buildCodexPrompt(input: {
  goal: string;
  appType: AppType;
  style: VisualStyle;
  blueprint: AppBlueprint;
  screenMap: ScreenNode[];
}): string {
  const tables = input.blueprint.databaseTables
    .map((t) => `- ${t.name}: ${t.columns.join(', ')}`)
    .join('\n');
  const screens = input.screenMap.map((s) => `- ${s.title}: ${s.purpose}`).join('\n');
  return `You are Codex. Build a production-ready native React app using Next.js, TypeScript, Tailwind CSS, and Supabase.\n\nProject goal:\n${input.goal}\n\nApp type: ${input.appType}\nStyle: ${input.style}\n\nMain screens:\n${screens}\n\nDatabase schema:\n${tables}\n\nRequirements:\n1) Create modular file structure with app router, components, lib, types, and tests.\n2) Implement responsive, beginner-friendly UI with soft cards and clear hierarchy.\n3) Implement Supabase auth and role-aware data access.\n4) Add seed/demo data and one full demo flow.\n5) Add test checklist + lint/typecheck scripts.\n\nDeliver build tasks in step-by-step order and include testing commands.`;
}

export type AppType =
  | 'Marketplace'
  | 'Social App'
  | 'Dashboard'
  | 'Booking App'
  | 'Portfolio'
  | 'Internal Tool'
  | 'SaaS';

export type VisualStyle =
  | 'Minimal'
  | 'Luxury'
  | 'Playful'
  | 'Old Web'
  | 'Brutalist'
  | 'Glassmorphism'
  | 'iOS-like';

export type ProjectStatus = 'idea' | 'blueprint' | 'ready for codex' | 'in development' | 'deployed';

export type FeatureItem = {
  label: string;
  selected: boolean;
};

export type ScreenNode = {
  id: string;
  title: string;
  purpose: string;
  next: string[];
};

export type DatabaseTable = {
  name: string;
  columns: string[];
};

export type AppBlueprint = {
  appName: string;
  targetUsers: string[];
  mainScreens: string[];
  features: string[];
  userFlows: string[];
  designSystem: string[];
  deploymentSteps: string[];
  databaseTables: DatabaseTable[];
};

export type Project = {
  id: string;
  name: string;
  summary: string;
  createdAt: string;
  status: ProjectStatus;
  appType: AppType;
  style: VisualStyle;
  roles: string[];
  features: FeatureItem[];
  blueprint: AppBlueprint;
  screenMap: ScreenNode[];
  codexPrompt: string;
};

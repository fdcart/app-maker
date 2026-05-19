'use client';

import { demoProjects } from '@/data/demo-projects';
import { SavedProject } from '@/types/project';

const STORAGE_KEY = 'easycodex_projects_v1';
const ACTIVE_KEY = 'easycodex_active_project_id';

export function getProjects(): SavedProject[] {
  if (typeof window === 'undefined') return demoProjects;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return demoProjects;
  try {
    const parsed = JSON.parse(raw) as SavedProject[];
    return parsed.length ? parsed : demoProjects;
  } catch {
    return demoProjects;
  }
}

export function saveProjects(projects: SavedProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function setActiveProjectId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActiveProject(projects: SavedProject[]): SavedProject {
  const id = localStorage.getItem(ACTIVE_KEY);
  return projects.find((p) => p.id === id) ?? projects[0];
}

export function upsertProject(project: SavedProject): SavedProject[] {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  const next = [...projects];
  if (index >= 0) next[index] = project;
  else next.unshift(project);
  saveProjects(next);
  setActiveProjectId(project.id);
  return next;
}

export function deleteProject(id: string): SavedProject[] {
  const next = getProjects().filter((p) => p.id !== id);
  saveProjects(next);
  if (next[0]) setActiveProjectId(next[0].id);
  return next;
}

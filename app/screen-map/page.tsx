'use client';
import { useEffect, useState } from 'react';
import { ProjectCanvas } from '@/components/project-canvas';
import { getActiveProject, getProjects } from '@/lib/project-store';
import { SavedProject } from '@/types/project';

export default function ScreenMapPage() {
  const [project, setProject] = useState<SavedProject | null>(null);
  useEffect(() => {
    const projects = getProjects();
    setProject(getActiveProject(projects));
  }, []);
  if (!project) return null;
  return (<main className="mx-auto max-w-6xl px-4 py-8 md:px-8"><ProjectCanvas screens={project.screenMap} /></main>);
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteProject, getProjects, setActiveProjectId } from '@/lib/project-store';
import { SavedProject } from '@/types/project';

export default function SavedProjectsPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  useEffect(() => setProjects(getProjects()), []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8"><section className="card p-6"><h1 className="text-2xl font-bold">Saved Projects</h1>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{projects.map((project) => (
        <article key={project.id} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs uppercase tracking-wide text-indigo-500">{project.status}</p>
          <h2 className="mt-1 text-lg font-semibold">{project.name}</h2><p className="mt-2 text-sm text-slate-600">{project.summary}</p>
          <div className="mt-3 flex gap-2 text-xs text-slate-500"><span>{project.appType}</span><span>•</span><span>{project.style}</span></div>
          <div className="mt-4 flex gap-2"><Link href="/blueprint" onClick={() => setActiveProjectId(project.id)} className="rounded-full bg-indigo-600 px-3 py-1.5 text-xs text-white">Open</Link>
          <button onClick={() => setProjects(deleteProject(project.id))} className="rounded-full border px-3 py-1.5 text-xs">Delete</button></div>
        </article>))}</div></section></main>
  );
}

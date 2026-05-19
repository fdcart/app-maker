'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getActiveProject, getProjects } from '@/lib/project-store';
import { SavedProject } from '@/types/project';

export default function BlueprintPage() {
  const [project, setProject] = useState<SavedProject | null>(null);
  useEffect(() => {
    const projects = getProjects();
    setProject(getActiveProject(projects));
  }, []);

  if (!project) return null;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Blueprint View</h1><p className="mt-2 text-slate-600">{project.summary}</p>
        <div className="mt-4 flex gap-3"><Link className="rounded-full bg-indigo-600 px-4 py-2 text-white" href="/screen-map">View Screen Map</Link><Link className="rounded-full border px-4 py-2" href="/prompt-generator">Generate Prompt</Link></div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border p-4"><h2 className="font-semibold">Target Users</h2><ul className="mt-2 list-disc pl-5 text-sm">{project.blueprint.targetUsers.map((u) => <li key={u}>{u}</li>)}</ul></article>
          <article className="rounded-2xl border p-4"><h2 className="font-semibold">Database Tables</h2><ul className="mt-2 space-y-2 text-sm">{project.blueprint.databaseTables.map((t) => <li key={t.name}><strong>{t.name}</strong>: {t.columns.join(', ')}</li>)}</ul></article>
        </div>
      </section>
    </main>
  );
}

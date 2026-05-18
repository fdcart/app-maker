import { demoProjects } from '@/data/demo-projects';

export default function BlueprintPage() {
  const project = demoProjects[0];
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Blueprint View</h1>
        <p className="mt-2 text-slate-600">{project.summary}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border p-4"><h2 className="font-semibold">Target Users</h2><ul className="mt-2 list-disc pl-5 text-sm">{project.blueprint.targetUsers.map((u) => <li key={u}>{u}</li>)}</ul></article>
          <article className="rounded-2xl border p-4"><h2 className="font-semibold">Database Tables</h2><ul className="mt-2 space-y-2 text-sm">{project.blueprint.databaseTables.map((t) => <li key={t.name}><strong>{t.name}</strong>: {t.columns.join(', ')}</li>)}</ul></article>
        </div>
      </section>
    </main>
  );
}

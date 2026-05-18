export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-2 text-slate-600">Configure future integrations for Codex workflows, OpenAI refinement, and Supabase persistence.</p>
        <div className="mt-4 grid gap-3">
          <label className="rounded-xl border p-3 text-sm">OpenAI API key <input className="mt-2 w-full rounded border p-2" placeholder="sk-..." /></label>
          <label className="rounded-xl border p-3 text-sm">Supabase URL <input className="mt-2 w-full rounded border p-2" placeholder="https://...supabase.co" /></label>
          <label className="rounded-xl border p-3 text-sm">Supabase anon key <input className="mt-2 w-full rounded border p-2" placeholder="ey..." /></label>
        </div>
      </section>
    </main>
  );
}

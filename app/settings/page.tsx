'use client';

import { useEffect, useState } from 'react';

type Settings = { openaiKey: string; supabaseUrl: string; supabaseAnonKey: string };
const KEY = 'easycodex_settings_v1';

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>({ openaiKey: '', supabaseUrl: '', supabaseAnonKey: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setForm(JSON.parse(raw));
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8"><section className="card p-6"><h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-2 text-slate-600">Configure future integrations for Codex workflows, OpenAI refinement, and Supabase persistence.</p>
      <div className="mt-4 grid gap-3">
        <label className="rounded-xl border p-3 text-sm">OpenAI API key <input value={form.openaiKey} onChange={(e) => setForm({ ...form, openaiKey: e.target.value })} className="mt-2 w-full rounded border p-2" placeholder="sk-..." /></label>
        <label className="rounded-xl border p-3 text-sm">Supabase URL <input value={form.supabaseUrl} onChange={(e) => setForm({ ...form, supabaseUrl: e.target.value })} className="mt-2 w-full rounded border p-2" placeholder="https://...supabase.co" /></label>
        <label className="rounded-xl border p-3 text-sm">Supabase anon key <input value={form.supabaseAnonKey} onChange={(e) => setForm({ ...form, supabaseAnonKey: e.target.value })} className="mt-2 w-full rounded border p-2" placeholder="ey..." /></label>
      </div>
      <button className="mt-4 rounded-full bg-indigo-600 px-5 py-2 text-white" onClick={() => { localStorage.setItem(KEY, JSON.stringify(form)); setSaved(true); }}>Save Settings</button>
      {saved && <p className="mt-2 text-sm text-green-700">Settings saved locally.</p>}
    </section></main>
  );
}

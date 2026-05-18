'use client';

import { useMemo, useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { appTypeOptions, buildCodexPrompt, createFeatureChecklist, generateBlueprint, styleOptions } from '@/lib/blueprint';

export default function NewProjectPage() {
  const [idea, setIdea] = useState('A SaaS tool that helps gyms manage memberships, classes, and trainer schedules.');
  const [appType, setAppType] = useState(appTypeOptions[6]);
  const [style, setStyle] = useState(styleOptions[5]);
  const [roles, setRoles] = useState('Owner, Staff, Member');
  const [features, setFeatures] = useState(createFeatureChecklist());

  const generated = useMemo(() => {
    const roleList = roles.split(',').map((r) => r.trim()).filter(Boolean);
    const { blueprint, screenMap } = generateBlueprint({ idea, appType, style, roles: roleList, features });
    const codexPrompt = buildCodexPrompt({ goal: idea, appType, style, blueprint, screenMap });
    return { blueprint, screenMap, codexPrompt };
  }, [idea, appType, style, roles, features]);

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr_360px] md:px-8">
      <Sidebar />
      <section className="space-y-5">
        <article className="card p-5 md:p-6">
          <h1 className="text-2xl font-bold">New Project Wizard</h1>
          <p className="mt-2 text-sm text-slate-600">Tell EasyCodex what you want to build in plain language, then tune app type, style, roles, and features.</p>
          <label className="mt-4 block text-sm font-medium">What app do you want to build?</label>
          <textarea value={idea} onChange={(e) => setIdea(e.target.value)} className="mt-2 h-32 w-full rounded-2xl border border-slate-200 p-4" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <select value={appType} onChange={(e) => setAppType(e.target.value as any)} className="rounded-xl border border-slate-200 p-3">{appTypeOptions.map((o) => <option key={o}>{o}</option>)}</select>
            <select value={style} onChange={(e) => setStyle(e.target.value as any)} className="rounded-xl border border-slate-200 p-3">{styleOptions.map((o) => <option key={o}>{o}</option>)}</select>
          </div>
          <input value={roles} onChange={(e) => setRoles(e.target.value)} className="mt-3 w-full rounded-xl border border-slate-200 p-3" placeholder="User roles (comma-separated)" />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {features.map((feature, idx) => (
              <label key={feature.label} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <input type="checkbox" checked={feature.selected} onChange={() => setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, selected: !f.selected } : f))} />
                {feature.label}
              </label>
            ))}
          </div>
        </article>
      </section>
      <aside className="space-y-4">
        <article className="card p-5"><h2 className="font-semibold">Generated App Name</h2><p className="mt-2 text-slate-700">{generated.blueprint.appName}</p></article>
        <article className="card p-5"><h2 className="font-semibold">Main Screens</h2><ul className="mt-2 list-disc pl-5 text-sm text-slate-600">{generated.blueprint.mainScreens.map((s) => <li key={s}>{s}</li>)}</ul></article>
      </aside>
    </main>
  );
}

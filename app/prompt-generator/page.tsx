'use client';

import { demoProjects } from '@/data/demo-projects';

export default function PromptGeneratorPage() {
  const prompt = demoProjects[0].codexPrompt;
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Codex Prompt Generator</h1>
        <p className="mt-2 text-slate-600">Export this prompt to Codex CLI, Codex cloud, or another coding-agent workflow.</p>
        <textarea readOnly value={prompt} className="mt-4 h-72 w-full rounded-2xl border border-slate-200 p-4 text-sm" />
        <div className="mt-4 flex gap-3">
          <button onClick={() => navigator.clipboard.writeText(prompt)} className="rounded-full bg-indigo-600 px-5 py-2 text-white">Copy to clipboard</button>
          <a href={`data:text/markdown;charset=utf-8,${encodeURIComponent(`# Codex Prompt\n\n${prompt}`)}`} download="easycodex-prompt.md" className="rounded-full border px-5 py-2">Download Markdown</a>
        </div>
      </section>
    </main>
  );
}

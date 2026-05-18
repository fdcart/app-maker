const steps = ['Home', 'New Project Wizard', 'Blueprint View', 'Visual Screen Map', 'Prompt Generator', 'Saved Projects', 'Settings'];

export function Sidebar() {
  return (
    <aside className="card p-4 lg:sticky lg:top-6 h-fit">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">EasyCodex steps</p>
      <ul className="mt-4 space-y-2">
        {steps.map((step, idx) => (
          <li key={step} className="rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <span className="mr-2 text-slate-400">{idx + 1}.</span>{step}
          </li>
        ))}
      </ul>
    </aside>
  );
}

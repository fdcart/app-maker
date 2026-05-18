import { ScreenNode } from '@/types/project';

export function ProjectCanvas({ screens }: { screens: ScreenNode[] }) {
  return (
    <section className="card p-5">
      <h3 className="text-lg font-semibold">Visual Screen Map</h3>
      <p className="mt-1 text-sm text-slate-500">Drag-and-edit style layout preview of your app flow.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {screens.map((screen) => (
          <article key={screen.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">Screen</p>
            <h4 className="mt-1 font-semibold">{screen.title}</h4>
            <p className="mt-2 text-sm text-slate-600">{screen.purpose}</p>
            <p className="mt-3 text-xs text-slate-500">Next: {screen.next.length ? screen.next.join(', ') : 'End'}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

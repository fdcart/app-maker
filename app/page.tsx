import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <section className="card mx-auto max-w-4xl p-8 text-center md:p-14">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-500">EasyCodex</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">Describe your app → see blueprint → export perfect Codex prompt.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">A visual, beginner-friendly, Lovable-style app builder focused on native React app planning and Codex-ready project instructions.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/new-project" className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500">Start New Project</Link>
          <Link href="/saved-projects" className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-100">View Saved Projects</Link>
        </div>
      </section>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const steps = [
  { label: 'Home', href: '/' },
  { label: 'New Project Wizard', href: '/new-project' },
  { label: 'Blueprint View', href: '/blueprint' },
  { label: 'Visual Screen Map', href: '/screen-map' },
  { label: 'Prompt Generator', href: '/prompt-generator' },
  { label: 'Saved Projects', href: '/saved-projects' },
  { label: 'Settings', href: '/settings' }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="card p-4 lg:sticky lg:top-6 h-fit"><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">EasyCodex steps</p>
      <ul className="mt-4 space-y-2">{steps.map((step, idx) => (<li key={step.label}><Link href={step.href} className={`block rounded-xl px-3 py-2 text-sm ${pathname === step.href ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}><span className="mr-2 text-slate-400">{idx + 1}.</span>{step.label}</Link></li>))}</ul>
    </aside>
  );
}

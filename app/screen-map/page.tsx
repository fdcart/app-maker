import { ProjectCanvas } from '@/components/project-canvas';
import { demoProjects } from '@/data/demo-projects';

export default function ScreenMapPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <ProjectCanvas screens={demoProjects[0].screenMap} />
    </main>
  );
}

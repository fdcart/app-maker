import { SavedProject } from '@/types/project';

export const demoProjects: SavedProject[] = [
  {
    id: 'easycodex-demo-1',
    name: 'StayNest Host OS',
    summary: 'A host dashboard for short-term rental operators to manage listings, guests, and cleaning teams.',
    createdAt: '2026-05-18',
    status: 'Completed',
    appType: 'SaaS',
    style: 'Glassmorphism',
    blueprint: {
      appName: 'StayNest Host OS',
      targetUsers: ['Short-term rental operators', 'Property managers', 'Cleaning teams'],
      mainScreens: ['Landing', 'Login', 'Portfolio Dashboard', 'Listing Details', 'Tasks Board', 'Settings'],
      features: ['Occupancy metrics', 'Booking sync', 'Task checklists', 'Owner-level analytics'],
      userFlows: [
        'Landing → Login → Portfolio Dashboard',
        'Dashboard → Listing Details → Task Creation',
        'Task Board → Task Complete → Notification'
      ],
      designSystem: ['Rounded cards', 'Soft blue gradients', '16px spacing rhythm', 'Inter typography'],
      deploymentSteps: ['Setup Supabase', 'Configure env vars', 'Build and test', 'Deploy to Vercel'],
      databaseTables: [
        { name: 'users', columns: ['id', 'email', 'full_name', 'role', 'created_at'] },
        { name: 'listings', columns: ['id', 'owner_id', 'title', 'city', 'status', 'created_at'] },
        { name: 'bookings', columns: ['id', 'listing_id', 'guest_name', 'check_in', 'check_out', 'status'] },
        { name: 'tasks', columns: ['id', 'listing_id', 'assigned_to', 'title', 'due_date', 'state'] }
      ]
    },
    screenMap: [
      { id: 'landing', title: 'Landing', purpose: 'Value proposition and CTA', next: ['login'] },
      { id: 'login', title: 'Login', purpose: 'Secure sign in', next: ['dashboard'] },
      { id: 'dashboard', title: 'Dashboard', purpose: 'Portfolio KPIs and alerts', next: ['listing-details', 'tasks'] },
      { id: 'listing-details', title: 'Listing Details', purpose: 'Per listing performance and booking info', next: ['tasks'] },
      { id: 'tasks', title: 'Tasks Board', purpose: 'Cleaning and maintenance operations', next: ['settings'] },
      { id: 'settings', title: 'Settings', purpose: 'Team and integration controls', next: [] }
    ],
    codexPrompt: 'Build a production-ready React + Next.js app named StayNest Host OS with Supabase auth, role-based dashboard, booking calendar, team task board, analytics, and responsive glassmorphism UI.'
  }
];

const starterTasks = [
  'Discover user goals and core workflow',
  'Design responsive screens and components',
  'Generate React + TypeScript code',
  'Wire mock data, auth states, and actions',
  'Run checks and prepare a deployable build',
  'Publish automatically to Vercel',
];

const stack = ['React', 'TypeScript', 'Vite', 'Codex plan', 'Visual canvas'];

const promptInput = document.querySelector('#app-prompt');
const generateButton = document.querySelector('#generate-button');
const appName = document.querySelector('#app-name');
const previewAppName = document.querySelector('#preview-app-name');
const appSummary = document.querySelector('#app-summary');
const stackList = document.querySelector('#stack-list');
const codexPlan = document.querySelector('#codex-plan');
const screenTabs = document.querySelector('#screen-tabs');
const screenTitle = document.querySelector('#screen-title');
const screenDescription = document.querySelector('#screen-description');
const widgetGrid = document.querySelector('#widget-grid');
const previewGradient = document.querySelector('#preview-gradient');
const publishButton = document.querySelector('#publish-button');
const publishStatus = document.querySelector('#publish-status');
let selectedScreen = 0;
let currentApp;

function inferApp(prompt) {
  const cleanPrompt = prompt.trim() || 'A booking app for dog groomers with payments and calendar reminders';
  const lower = cleanPrompt.toLowerCase();
  const isBooking = /book|calendar|appointment|schedule|groom/.test(lower);
  const isCrm = /crm|client|invoice|proposal|sales|lead/.test(lower);
  const isFood = /meal|grocery|recipe|food|family/.test(lower);

  const name = isBooking
    ? 'PawSlot Studio'
    : isCrm
      ? 'ClientFlow HQ'
      : isFood
        ? 'TablePlan AI'
        : 'Launchpad App';

  const summary = isBooking
    ? 'A friendly scheduling workspace with service menus, availability, customer notes, and automated reminders.'
    : isCrm
      ? 'A polished client command center for tracking leads, proposals, invoices, project milestones, and follow-ups.'
      : isFood
        ? 'A family meal planner that learns preferences, balances nutrition, and turns plans into organized shopping lists.'
        : `A production-ready concept generated from: “${cleanPrompt}”`;

  return {
    name,
    summary,
    stack,
    tasks: starterTasks,
    screens: [
      {
        title: 'Home dashboard',
        description: 'The daily command center with metrics, alerts, and suggested next actions.',
        accent: 'cyan-blue',
        widgets: ['Metric tiles', 'Activity timeline', 'Smart suggestions'],
      },
      {
        title: isBooking ? 'Booking calendar' : isCrm ? 'Pipeline board' : isFood ? 'Weekly plan' : 'Workflow builder',
        description: isBooking
          ? 'Drag bookings across staff, rooms, and service windows.'
          : isCrm
            ? 'Move prospects from discovery to signed deal with Codex-generated automations.'
            : isFood
              ? 'Plan meals by day, nutrition target, prep time, and household preference.'
              : 'Compose the core user journey visually and ask Codex to fill in the logic.',
        accent: 'fuchsia-violet',
        widgets: ['Drag board', 'Inline edit', 'Automation chips'],
      },
      {
        title: 'Launch checklist',
        description: 'Codex turns the visual brief into code, tests, deployment steps, and handoff notes.',
        accent: 'emerald-teal',
        widgets: ['Code diffs', 'Test status', 'Deploy button'],
      },
    ],
  };
}

function renderPlan(app) {
  codexPlan.innerHTML = app.tasks
    .map((task, index) => `
      <div class="console-line">
        <span class="check">✓</span>
        <span class="step">${String(index + 1).padStart(2, '0')}</span>
        <p>${task}</p>
      </div>
    `)
    .join('');
}

function renderTabs(app) {
  screenTabs.innerHTML = app.screens
    .map((screen, index) => `
      <button class="${selectedScreen === index ? 'active' : ''}" data-screen="${index}" type="button">
        ${screen.title}
      </button>
    `)
    .join('');

  screenTabs.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      selectedScreen = Number(button.dataset.screen);
      render(currentApp);
    });
  });
}

function renderPreview(app) {
  const screen = app.screens[selectedScreen];
  screenTitle.textContent = screen.title;
  screenDescription.textContent = screen.description;
  previewGradient.className = `app-preview-gradient ${screen.accent}`;
  widgetGrid.innerHTML = screen.widgets
    .map((widget) => `
      <div class="widget-card">
        <span class="widget-icon">▧</span>
        <span>${widget}</span>
      </div>
    `)
    .join('');
}

function render(app) {
  currentApp = app;
  appName.textContent = app.name;
  previewAppName.textContent = app.name;
  appSummary.textContent = app.summary;
  stackList.innerHTML = app.stack.map((item) => `<span>${item}</span>`).join('');
  renderPlan(app);
  renderTabs(app);
  renderPreview(app);
}

function regenerate() {
  selectedScreen = 0;
  render(inferApp(promptInput.value));
}

function showPublishReadiness() {
  publishStatus.textContent =
    'Deployment is wired: set Vercel secrets, push to main, or run npm run publish:vercel locally.';
  publishStatus.classList.add('is-ready');
  document.querySelector('#vercel-publish-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

generateButton.addEventListener('click', regenerate);
publishButton.addEventListener('click', showPublishReadiness);
promptInput.addEventListener('input', () => render(inferApp(promptInput.value)));

document.querySelectorAll('[data-idea]').forEach((button) => {
  button.addEventListener('click', () => {
    promptInput.value = button.dataset.idea;
    regenerate();
  });
});

render(inferApp(promptInput.value));

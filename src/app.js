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
const openaiKeyInput = document.querySelector('#openai-key');
const openaiConnectButton = document.querySelector('#openai-connect-button');
const openaiStatus = document.querySelector('#openai-status');
const githubLoginButton = document.querySelector('#github-login-button');
const githubConnectButton = document.querySelector('#github-connect-button');
const refreshReposButton = document.querySelector('#refresh-repos-button');
const githubStatus = document.querySelector('#github-status');
const codexBuildButton = document.querySelector('#codex-build-button');
const buildOutput = document.querySelector('#build-output');
const repoNameInput = document.querySelector('#repo-name');
const repoSelect = document.querySelector('#repo-select');
const createRepoButton = document.querySelector('#create-repo-button');
const publishGitHubButton = document.querySelector('#publish-github-button');
const publishGitHubStatus = document.querySelector('#publish-status-github');
let generatedFiles = [];
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
refreshStatus();
}


async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
  return data;
}

function setStatus(element, message, kind = 'neutral') {
  element.textContent = message;
  element.dataset.kind = kind;
}

async function refreshStatus() {
  try {
    const status = await api('/api/status');
    setStatus(
      openaiStatus,
      status.openaiConnected ? `OpenAI connected using ${status.openaiModel}.` : 'OpenAI is not connected yet.',
      status.openaiConnected ? 'ready' : 'warning',
    );
    setStatus(
      githubStatus,
      status.githubConnected
        ? `GitHub connected as ${status.githubUser?.login || 'authorized user'}.`
        : status.hasGitHubOAuth
          ? 'GitHub OAuth is configured. Login when ready.'
          : 'GitHub OAuth env vars are missing on the server.',
      status.githubConnected ? 'ready' : 'warning',
    );
    if (status.githubConnected) await refreshRepos();
  } catch (error) {
    setStatus(openaiStatus, error.message, 'error');
    setStatus(githubStatus, error.message, 'error');
  }
}

async function connectOpenAI() {
  try {
    const result = await api('/api/openai/connect', {
      method: 'POST',
      body: JSON.stringify({ apiKey: openaiKeyInput.value.trim() }),
    });
    openaiKeyInput.value = '';
    setStatus(openaiStatus, `OpenAI connected. Coding model: ${result.model}.`, 'ready');
  } catch (error) {
    setStatus(openaiStatus, error.message, 'error');
  }
}

function loginGitHub() {
  window.location.href = '/api/auth/github/start';
}

async function refreshRepos() {
  try {
    const { repos } = await api('/api/github/repos');
    repoSelect.innerHTML = '<option value="">Select a connected repo</option>' + repos
      .map((repo) => `<option value="${repo.fullName}">${repo.fullName}${repo.private ? ' (private)' : ''}</option>`)
      .join('');
    setStatus(githubStatus, `Loaded ${repos.length} GitHub repositories.`, 'ready');
  } catch (error) {
    setStatus(githubStatus, error.message, 'error');
  }
}

async function createRepo() {
  try {
    const { repo, url } = await api('/api/github/create-repo', {
      method: 'POST',
      body: JSON.stringify({ name: repoNameInput.value.trim(), private: true }),
    });
    await refreshRepos();
    repoSelect.value = repo;
    setStatus(publishGitHubStatus, `Created ${repo}: ${url}`, 'ready');
  } catch (error) {
    setStatus(publishGitHubStatus, error.message, 'error');
  }
}

async function buildWithCodex() {
  try {
    buildOutput.textContent = 'Codex is planning, coding, and packaging files…';
    const result = await api('/api/codex/build', {
      method: 'POST',
      body: JSON.stringify({ prompt: promptInput.value, app: currentApp }),
    });
    generatedFiles = result.files || [];
    buildOutput.textContent = [
      `Model: ${result.model}`,
      result.summary,
      '',
      ...generatedFiles.map((file) => `• ${file.path} — ${file.purpose}`),
      '',
      'Next steps:',
      ...(result.nextSteps || []).map((step) => `- ${step}`),
    ].join('\n');
    setStatus(publishGitHubStatus, 'Generated files are ready to commit to GitHub.', 'ready');
  } catch (error) {
    buildOutput.textContent = error.message;
  }
}

async function publishGeneratedApp() {
  try {
    const repo = repoSelect.value.trim();
    const result = await api('/api/github/publish', {
      method: 'POST',
      body: JSON.stringify({ repo, files: generatedFiles, message: `Build ${currentApp.name} with Codex App Maker` }),
    });
    setStatus(
      publishGitHubStatus,
      `Committed ${result.committed.length} files to ${result.repoUrl}. Vercel can now deploy from GitHub.`,
      'ready',
    );
  } catch (error) {
    setStatus(publishGitHubStatus, error.message, 'error');
  }
}

function showPublishReadiness() {
  publishStatus.textContent =
    'Deployment is wired: set Vercel secrets, push to main, or run npm run publish:vercel locally.';
  publishStatus.classList.add('is-ready');
  document.querySelector('#vercel-publish-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

generateButton.addEventListener('click', regenerate);
publishButton.addEventListener('click', showPublishReadiness);
openaiConnectButton.addEventListener('click', connectOpenAI);
githubLoginButton.addEventListener('click', loginGitHub);
githubConnectButton.addEventListener('click', loginGitHub);
refreshReposButton.addEventListener('click', refreshRepos);
codexBuildButton.addEventListener('click', buildWithCodex);
createRepoButton.addEventListener('click', createRepo);
publishGitHubButton.addEventListener('click', publishGeneratedApp);
promptInput.addEventListener('input', () => render(inferApp(promptInput.value)));

document.querySelectorAll('[data-idea]').forEach((button) => {
  button.addEventListener('click', () => {
    promptInput.value = button.dataset.idea;
    regenerate();
  });
});

render(inferApp(promptInput.value));
refreshStatus();

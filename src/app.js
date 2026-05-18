const starterTasks = [
  'Discover user goals and core workflow',
  'Design responsive screens and components',
  'Generate a native React + Vite component tree',
  'Wire mock data, state, routes, and interactions',
  'Run checks and prepare a deployable build',
  'Publish automatically to Vercel',
];

const stack = ['React', 'Vite', 'Component tree', 'Responsive CSS', 'GitHub export', 'Vercel deploy'];

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
const chatIdea = document.querySelector('#chat-idea');
const visualBuildButton = document.querySelector('#visual-build-button');
const implementSelectionButton = document.querySelector('#implement-selection-button');
const previewFrame = document.querySelector('#preview-frame');
const selectedComponentName = document.querySelector('#selected-component-name');
const publishButton = document.querySelector('#publish-button');
const publishStatus = document.querySelector('#publish-status');
const openaiKeyInput = document.querySelector('#openai-key');
const openaiConnectButton = document.querySelector('#openai-connect-button');
const openaiStatus = document.querySelector('#openai-status');
const githubLoginButton = document.querySelector('#github-login-button');
const githubConnectButton = document.querySelector('#github-connect-button');
const githubTokenInput = document.querySelector('#github-token');
const refreshReposButton = document.querySelector('#refresh-repos-button');
const githubStatus = document.querySelector('#github-status');
const codexBuildButton = document.querySelector('#codex-build-button');
const buildOutput = document.querySelector('#build-output');
const repoNameInput = document.querySelector('#repo-name');
const repoSelect = document.querySelector('#repo-select');
const createRepoButton = document.querySelector('#create-repo-button');
const publishGitHubButton = document.querySelector('#publish-github-button');
const publishGitHubStatus = document.querySelector('#publish-status-github');
const vercelTokenInput = document.querySelector('#vercel-token');
const deployVercelButton = document.querySelector('#deploy-vercel-button');
const vercelStatus = document.querySelector('#vercel-status');
let generatedFiles = [];
let latestStatus = { hasGitHubOAuth: false, githubConnected: false, openaiConnected: false, vercelConnected: false };
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
  selectedComponentName.textContent = `${screen.title} React section`;
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
  chatIdea.textContent = promptInput.value.trim() || 'Describe the React app you want to build';
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
    latestStatus = status;
    setStatus(
      openaiStatus,
      status.openaiConnected ? `OpenAI is ready using ${status.openaiModel}.` : 'Paste an OpenAI API key to enable Codex.',
      status.openaiConnected ? 'ready' : 'warning',
    );
    setStatus(
      githubStatus,
      status.githubConnected
        ? `GitHub connected as ${status.githubUser?.login || 'authorized user'}.`
        : status.hasGitHubOAuth
          ? 'Paste a GitHub token or use OAuth.'
          : 'Paste a GitHub token to connect instantly. OAuth is optional.',
      status.githubConnected ? 'ready' : 'warning',
    );
    setStatus(
      vercelStatus,
      status.vercelConnected ? 'Vercel is ready for one-button deploy.' : 'Paste a Vercel token or set VERCEL_TOKEN on the server.',
      status.vercelConnected ? 'ready' : 'warning',
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
    setStatus(openaiStatus, `OpenAI verified. Codex model: ${result.model}.`, 'ready');
  } catch (error) {
    setStatus(openaiStatus, error.message, 'error');
  }
}

async function connectGitHub() {
  const token = githubTokenInput.value.trim();
  if (!token) {
    if (latestStatus.hasGitHubOAuth) {
      window.location.href = '/api/auth/github/start';
      return;
    }
    githubTokenInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    githubTokenInput.focus();
    setStatus(
      githubStatus,
      'Paste a GitHub token, then click Connect GitHub. OAuth is not configured on this server.',
      'warning',
    );
    return;
  }
  try {
    setStatus(githubStatus, 'Verifying GitHub token…', 'warning');
    const result = await api('/api/github/connect-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    githubTokenInput.value = '';
    latestStatus.githubConnected = true;
    setStatus(githubStatus, `GitHub verified as ${result.user.login}.`, 'ready');
    await refreshRepos();
  } catch (error) {
    setStatus(githubStatus, error.message, 'error');
  }
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


function fallbackReactFiles() {
  return [
    {
      path: 'package.json',
      purpose: 'Vite React package manifest',
      content: JSON.stringify({
        scripts: { dev: 'vite --host 0.0.0.0', build: 'vite build', preview: 'vite preview --host 0.0.0.0' },
        dependencies: { '@vitejs/plugin-react': 'latest', vite: 'latest', react: 'latest', 'react-dom': 'latest' },
        devDependencies: {},
      }, null, 2),
    },
    {
      path: 'index.html',
      purpose: 'React app shell',
      content: '<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>' + currentApp.name + '</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>',
    },
    {
      path: 'src/main.jsx',
      purpose: 'React entry point',
      content: "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App.jsx';\nimport './styles.css';\n\ncreateRoot(document.getElementById('root')).render(<App />);\n",
    },
    {
      path: 'src/App.jsx',
      purpose: 'Generated React component tree',
      content: `const screens = ${JSON.stringify(currentApp.screens, null, 2)};\n\nexport default function App() {\n  return (\n    <main className="app">\n      <section className="hero">\n        <p className="eyebrow">Generated with Codex App Maker</p>\n        <h1>${currentApp.name}</h1>\n        <p>${currentApp.summary}</p>\n      </section>\n      <section className="grid">\n        {screens.map((screen) => (\n          <article className="card" key={screen.title}>\n            <span>{screen.title}</span>\n            <h2>{screen.description}</h2>\n            <div className="chips">{screen.widgets.map((widget) => <b key={widget}>{widget}</b>)}</div>\n          </article>\n        ))}\n      </section>\n    </main>\n  );\n}\n`,
    },
    {
      path: 'src/styles.css',
      purpose: 'Responsive React app styling',
      content: ':root{font-family:Inter,system-ui,sans-serif;color:#101828;background:#eef4ff}body{margin:0}.app{min-height:100vh;padding:48px}.hero{padding:48px;border-radius:32px;background:linear-gradient(135deg,#155eef,#7a2ce6);color:white}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-weight:900}.hero h1{font-size:clamp(3rem,8vw,7rem);line-height:.9;margin:.2em 0}.hero p{max-width:720px;font-size:1.2rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;margin-top:24px}.card{padding:24px;border-radius:24px;background:white;box-shadow:0 20px 60px #1018281a}.card span{color:#155eef;font-weight:900}.card h2{font-size:1.3rem}.chips{display:flex;flex-wrap:wrap;gap:8px}.chips b{padding:8px 10px;border-radius:999px;background:#eff8ff;color:#1849a9}@media(max-width:720px){.app{padding:18px}.hero{padding:28px}}',
    },
    { path: 'README.md', content: `# ${currentApp.name}\n\n${currentApp.summary}\n\nGenerated as a native React + Vite app.`, purpose: 'Generated app README' },
  ];
}

function localFilesForDeployment() {
  return generatedFiles.length > 0 ? generatedFiles : fallbackReactFiles();
}

async function deployToVercel() {
  try {
    setStatus(vercelStatus, 'Creating Vercel deployment…', 'warning');
    const result = await api('/api/vercel/deploy', {
      method: 'POST',
      body: JSON.stringify({
        token: vercelTokenInput.value.trim(),
        name: currentApp.name,
        files: localFilesForDeployment(),
      }),
    });
    vercelTokenInput.value = '';
    setStatus(vercelStatus, `Deployed: ${result.url}`, 'ready');
    window.open(result.url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    setStatus(vercelStatus, error.message, 'error');
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
githubLoginButton.addEventListener('click', connectGitHub);
githubConnectButton.addEventListener('click', connectGitHub);
refreshReposButton.addEventListener('click', refreshRepos);
codexBuildButton.addEventListener('click', buildWithCodex);
createRepoButton.addEventListener('click', createRepo);
publishGitHubButton.addEventListener('click', publishGeneratedApp);
deployVercelButton.addEventListener('click', deployToVercel);
promptInput.addEventListener('input', () => render(inferApp(promptInput.value)));
visualBuildButton.addEventListener('click', buildWithCodex);
implementSelectionButton.addEventListener('click', buildWithCodex);

document.querySelectorAll('[data-quick-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    const addition = button.dataset.quickPrompt;
    promptInput.value = `${promptInput.value.trim()} ${addition}`.trim();
    regenerate();
  });
});

document.querySelectorAll('[data-device]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-device]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    previewFrame.dataset.device = button.dataset.device;
  });
});

document.querySelectorAll('[data-idea]').forEach((button) => {
  button.addEventListener('click', () => {
    promptInput.value = button.dataset.idea;
    regenerate();
  });
});

render(inferApp(promptInput.value));
refreshStatus();

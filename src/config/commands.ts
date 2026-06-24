export type ThemeKey = 'matrix' | 'cyberpunk' | 'classic' | 'dracula' | 'mars' | 'dos' | 'amber' | 'abyss' | 'moog' | 'xenomorph' | 'lovelace' | 'singularity' | 'umbrella' | 'horizon' | 'cybermesh' | 'obsidian';

export interface ThemeConfig {
  key: ThemeKey;
  bg: string;
  text: string;
  fontClass: string;
  cursor: string;
  divider: string;
  promptAddon?: string;
  containerAnimation?: string;
  historyFade?: boolean;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  matrix: {
    key: 'matrix',
    bg: '#020204',
    text: '#22c55e',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '--------------------------------------------------------------------------------'
  },
  cyberpunk: {
    key: 'cyberpunk',
    bg: '#0f0f1a',
    text: '#ff007f',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '--------------------------------------------------------------------------------'
  },
  classic: {
    key: 'classic',
    bg: '#020204',
    text: '#f3f4f6',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '--------------------------------------------------------------------------------'
  },
  dracula: {
    key: 'dracula',
    bg: '#282a36',
    text: '#bd93f9',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '--------------------------------------------------------------------------------'
  },
  mars: {
    key: 'mars',
    bg: '#3e1313',
    text: '#ff5533',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '--------------------------------------------------------------------------------'
  },
  dos: {
    key: 'dos',
    bg: '#0000aa',
    text: '#aaaaaa',
    fontClass: 'font-mono tracking-normal',
    cursor: '_',
    divider: '--------------------------------------------------------------------------------'
  },
  amber: {
    key: 'amber',
    bg: '#020204',
    text: '#ffb000',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '--------------------------------------------------------------------------------'
  },
  abyss: {
    key: 'abyss',
    bg: '#000b18',
    text: '#00bfff',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '--------------------------------------------------------------------------------'
  },
  moog: {
    key: 'moog',
    bg: '#2e3138',
    text: '#fffbf2',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    promptAddon: 'L [■■■■■░░░] R [■■■░░░░░] ',
    divider: '--------------------------------------------------------------------------------'
  },
  xenomorph: {
    key: 'xenomorph',
    bg: '#030708',
    text: '#00ff66',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    containerAnimation: 'animate-xenomorph',
    divider: '--------------------------------------------------------------------------------'
  },
  lovelace: {
    key: 'lovelace',
    bg: '#1f1913',
    text: '#d4a373',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️─⚙️'
  },
  singularity: {
    key: 'singularity',
    bg: '#000000',
    text: '#ffffff',
    fontClass: 'font-mono font-light tracking-widest',
    cursor: '█',
    historyFade: true,
    divider: '--------------------------------------------------------------------------------'
  },
  umbrella: {
    key: 'umbrella',
    bg: '#f4f4f6',
    text: '#990000',
    fontClass: 'font-mono tracking-normal font-bold',
    cursor: '█',
    promptAddon: '⚠️ [BIO-HAZARD LEVEL 4] ',
    divider: '================================================================================'
  },
  horizon: {
    key: 'horizon',
    bg: '#010103',
    text: '#9d4edd',
    fontClass: 'font-mono tracking-normal horizon-glow',
    cursor: '█',
    divider: '--------------------------------------------------------------------------------'
  },
  cybermesh: {
    key: 'cybermesh',
    bg: '#11141a',
    text: '#e3ff00',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    divider: '101011001101011001010101100110101100101010110011010110010101011001101011'
  },
  obsidian: {
    key: 'obsidian',
    bg: '#0c0a0a',
    text: '#ff3c00',
    fontClass: 'font-mono tracking-normal',
    cursor: '█',
    containerAnimation: 'animate-obsidian-pulse',
    divider: '--------------------------------------------------------------------------------'
  }
};

export const BOOT_SEQUENCE = [
  "BIOS Date 06/23/26 17:35:57 Ver 08.00.15",
  "CPU: Quantum Processing Unit @ 4.2 THz",
  "Memory Test: 1048576K OK",
  "Initializing Kernel Modules...",
  "Loading Core Interface...",
  "Mounting /dev/sda1... OK",
  "Starting Terminal UI Engine..."
];

export const STANDARD_COMMANDS = [
  'profile.txt', 'skills.sys', 'projects.log', 'help', 'clear', 
  'themes', 'system diagnostic', 'telemetry', 'nodes', 'matrix.sys',
  'history', 'volume', 'view resume', 'screensaver', 'clear cache',
  'mirror.sys', 'voice mode',
  'theme matrix', 'theme cyberpunk', 'theme classic', 'theme dracula', 'theme mars', 'theme dos', 'theme amber', 'theme abyss', 'theme moog', 'theme xenomorph', 'theme lovelace', 'theme singularity', 'theme umbrella', 'theme horizon', 'theme cybermesh', 'theme obsidian',
  'sudo access', 'weather ', 'tree', 'ls', 'download resume'
];

export const SECRET_COMMANDS = ['cat classified.bin'];

export const SUGGESTION_TOKENS = ['help', 'profile.txt', 'skills.sys', 'projects.log', 'clear'];

export const ASCII_LOGO = `
  ____  ____  ____  ____  _  _  ___ 
 (  _ \\(  __)(_  _)(  _ \\/ )( \\/ __)
  )   / ) _)   )(   )   /) \\/ (\\__ \\
 (_)\\_)(____) (__) (_)\\_)\\____/(___/
`;

export const COMMAND_REGISTRY = {
  help: [
    { cmd: 'help', desc: 'Displays this system command summary chart.' },
    { cmd: 'themes', desc: 'Displays cosmetic catalog dictionary of custom design variations.' },
    { cmd: 'profile.txt', desc: 'Outputs structured personal bio highlighting Frontend architecture expertise.' },
    { cmd: 'skills.sys', desc: 'Renders a custom chart categorizing my professional software stack.' },
    { cmd: 'projects.log', desc: 'Outputs a matrix of key development nodes and their operational technologies.' },
    { cmd: 'tree / ls', desc: 'Outputs an interactive visual node tree of the local file directory.' },
    { cmd: 'download resume', desc: 'Initiates a secure file transfer of the core developer payload.' },
    { cmd: 'view resume', desc: 'Launches a draggable floating window frame for in-console document viewing.' },
    { cmd: 'history', desc: 'Prints vertical log list of all past entered commands from the cache.' },
    { cmd: 'volume <level>', desc: 'Dynamically maps hardware master volume level (0-100 or mute).' },
    { cmd: 'screensaver', desc: 'Launches full-screen digital matrix rain cascade idle mode.' },
    { cmd: 'clear cache', desc: 'Wipes the physical NVRAM and resets the OS back to factory defaults.' },
    { cmd: 'system diagnostic', desc: 'Evaluates and prints live host platform hardware metrics.' },
    { cmd: 'mirror.sys', desc: 'Hooks into local webcam and renders live feed natively in real-time ASCII.' },
    { cmd: 'voice mode', desc: 'Activates SpeechRecognition API to parse spoken commands via microphone.' },
    { cmd: 'telemetry / nodes', desc: 'Scans and parses current geo-coordinates and connectivity power flows.' },
    { cmd: 'matrix.sys', desc: 'Triggers a simulated terminal override sequence.' },
    { cmd: 'weather <city>', desc: 'Fetches live atmospheric telemetry for a specified node.' },
    { cmd: 'clear', desc: 'Empties out the console trace array state cleanly.' }
  ],
  themesCatalog: [
    { name: 'matrix', desc: 'Default pure phosphor-green retro shell' },
    { name: 'cyberpunk', desc: 'Hot neon pink typography over indigo console shroud' },
    { name: 'dracula', desc: 'Vampiric purple tones over slate slate night' },
    { name: 'mars', desc: 'Abrasive rusted reds and dark crimson shadows' },
    { name: 'dos', desc: 'Classic blue screen with light gray block rendering' },
    { name: 'amber', desc: 'High-contrast vintage CRT amber glow' },
    { name: 'abyss', desc: 'Deep oceanic blues over void black pressure' },
    { name: 'moog', desc: 'Brushed studio gray console with bulb-white readouts' },
    { name: 'xenomorph', desc: 'Breathing bio-fluid black frame with acid green text' },
    { name: 'lovelace', desc: 'Mechanical polished brass metrics on oxidized mahogany' },
    { name: 'singularity', desc: 'Absolute void layout featuring fading historical memory' },
    { name: 'umbrella', desc: 'Sterile laboratory white with critical crimson red alerts' },
    { name: 'horizon', desc: 'Vacuum cosmic black with radiant amethyst violet text glow' },
    { name: 'cybermesh', desc: 'Industrial steel gray with binary stream string dividers' },
    { name: 'obsidian', desc: 'Deep charcoal carbon with magma orange power grid pulsing' }
  ],
  profile: {
    header: "--- DEVELOPER PROFILE: RISHAV RANA ---",
    body: "As a High-Fidelity Frontend Developer, my focus is bridging the gap between robust client architectures and incredibly smooth, responsive user interfaces. I specialize in crafting slick, highly interactive digital landscapes. Driven by a deep passion for system optimization and design precision, I engineer stateful nodes that scale without sacrificing visual impact."
  },
  skills: {
    header: "⚙️ SYSTEM CODE METRIC LOGS // RISHAV RANA CORE EXPERTISE",
    list: [
      { category: 'CORE ENGINES', tools: 'JavaScript (ES6+) / TypeScript / HTML5 / Architecture Design' },
      { category: 'ENGINE PARADIGMS', tools: 'React 19 Ecosystem / Next.js (App Router Production Layouts)' },
      { category: 'SYSTEM TELEMETRY', tools: 'Enterprise State Management / Asynchronous Data Pipelines' },
      { category: 'ENGINEERING PILLARS', tools: 'Frontend Performance Tuning / Client-Side Data Sanitization' },
      { category: 'INTERFACE SCHEMAS', tools: 'Advanced Responsive Layouts / Dynamic CSS Styling Modules' }
    ]
  },
  projects: [
    {
      id: '01',
      title: 'TCDAM Enterprise Asset Management Platform',
      status: 'STATUS :: [Deployed] | CHANNEL :: Enterprise Core Active',
      progress: 'PIPELINE CAPACITY :: [████████████████████] 100% Async Jobs',
      modules: [
        {
          name: '[AI & Discovery Subsystem]',
          bullets: [
            'Programmed scoped AI metadata generation configuring prompt matrices per category.',
            'Integrated reverse vector similarity visual search with cached Redis matches.'
          ]
        },
        {
          name: '[Adobe Integration & Publishing]',
          bullets: [
            'Engineered InDesign IDML template maps with async status polling loops.',
            'Coded custom UXP plugin authentication via a SAML polling authorization flow.'
          ]
        },
        {
          name: '[Governance & Operations Operations]',
          bullets: [
            'Built filter-scoped bulk jobs backed by Redis edit locks and cancellation triggers.',
            'Implemented a 7-tier operational governance matrix constraining role delegation.'
          ]
        },
        {
          name: '[TECH CORE]',
          bullets: [
            'UI Foundation: Material UI 5, Emotion, Advanced Responsive DOM.',
            'Data Pipelines: ag-Grid 33, Formik, Yup Validation, DOMPurify.',
            'System Connectivity: React Router 7, Socket.io-client telemetry streams.'
          ]
        }
      ]
    },
    {
      id: '02',
      title: 'Skyworld Development Hub',
      status: 'STATUS :: [Maintained] | CHANNEL :: Client Production Feed',
      progress: 'INTEGRATION METRIC :: [██████████████████░░] 90% Complete',
      modules: [
        {
          name: 'Operations Bullet Matrix:',
          bullets: [
            'Engineered interactive, highly responsive customer property matrix layout panels.',
            'Standardized complex array data filters optimization query execution speeds.'
          ]
        }
      ]
    }
  ],
  errors: {
    unrecognized: "Error: Command not found. Type 'help' for a list of valid node functions.",
    restricted: "ACCESS DENIED: 'classified.bin' requires root authorization. Run 'sudo access'."
  },
  classified: {
    header: "WARNING: TOP SECRET CLEARANCE RECOGNIZED",
    body: [
      "PROJECT: 'ANTIGRAVITY'",
      "STATUS: ACTIVE",
      "OBJECTIVE: Engineer an autonomous, self-healing frontend architecture capable of anticipating user intent before physical DOM interaction.",
      "NOTE: The React 19 ecosystem is merely a host. The true goal is complete layout synchronization.",
      "END OF FILE."
    ]
  },
  sudo: {
    phases: [
      "Initiating security override...",
      "Decrypting node payload..."
    ],
    badge: `
   _  _  __ _  __    __    ___  __ _  ____  ____ 
  / )( \\(  ( \\(  )  /  \\  / __)(  / )(  __)(    \\
  ) \\/ (/    / ) (_(  O )( (__  )  (  ) _)  ) D (
  \\____/\\_)__)(____/\\__/  \\___)(__\\_)(____)(____/
    `,
    successMessage: "ACCESS GRANTED: Root directory unlocked. Welcome to the core, Architect."
  },
  themes: {
    success: "[SYSTEM SHIFT]: Color telemetry matrix altered successfully."
  },
  weather: {
    syntaxError: "⚠️ SYNTAX ERROR: Please specify a destination node. Example: 'weather new york'.",
    connecting: (city: string) => `📡 [CONNECTING TO WORLD METEOROLOGICAL NETWORK...] Querying telemetry for: ${city.toUpperCase()}...`,
    failure: (input: string) => `❌ LOCAL METEO FAILURE: Unable to locate coordinate matrix for '${input}'. Check string spelling and network infrastructure parameters.`,
    getGraphic: (code: number) => {
      if (code <= 1) return { symbol: '☀️', desc: 'CLEAR / SUNNY' };
      if (code <= 48) return { symbol: '☁️', desc: 'CLOUDY / FOGGY' };
      if (code >= 51 && code <= 67) return { symbol: '🌧️', desc: 'RAIN / DRIZZLE' };
      if (code >= 80 && code <= 82) return { symbol: '🌧️', desc: 'HEAVY RAIN' };
      if (code >= 71 && code <= 77) return { symbol: '❄️', desc: 'SNOWFALL' };
      if (code >= 95 && code <= 99) return { symbol: '⛈️', desc: 'THUNDERSTORM' };
      return { symbol: '☁️', desc: 'UNKNOWN CONDITIONS' };
    }
  }
};

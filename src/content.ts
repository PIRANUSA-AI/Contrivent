// All page copy lives here. Sample numbers and findings are illustrative - replace before launch.
//
// Story: Scout (find the signal) → Forge (build the system) → Orchestrate (it runs) → the triangle.
// The page shows what Contrivent does instead of listing services.

import type { Segment } from './lib/timeline';

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'scout', label: 'Scout' },
  { id: 'forge', label: 'Forge' },
  { id: 'orchestrate', label: 'Orchestrate' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

export const navCta = { label: "Let's build", href: '#contact' };

/**
 * The scroll story: one pinned canvas that plays these clips back to back.
 * `name` = folder in public/frames (from videos/<name>.mp4) · `length` = scroll distance in vh.
 * Reverse / start-from-middle are set per clip in videos/clips.json.
 */
export const storySegments: Segment[] = [
  { name: 'scout', id: 'scout', length: 420 },
  { name: 'transition-1', length: 150 },
  { name: 'forge', id: 'forge', length: 420 },
  { name: 'transition-2', length: 150 },
  { name: 'orchestrate', id: 'orchestrate', length: 420 },
];

/** Scroll distance (vh) over which one clip dissolves into the next. */
export const storyCrossfade = 40;

export const storyTransitions: Record<string, { from: string; to: string; status: string }> = {
  'transition-1': { from: '01 Scout', to: '02 Forge', status: 'Signal locked · forging' },
  'transition-2': { from: '02 Forge', to: '03 Orchestrate', status: 'System built · deploying' },
};

/** Words wrapped in *asterisks* (single or multi-word) render in the italic serif. */
export const manifesto =
  "We don't hand over decks or demos. We build *systems that run*: they find what matters, do the work, and keep going long after launch.";

/** `from` / `to` are 0-1 positions inside the act's own clip. */
export type Beat = { label: string; text: string; from: number; to: number };

export type ActContent = {
  id: string;
  index: string;
  kicker: string;
  title: string;
  verb: string;
  beats: Beat[];
};

/* ---------- 01 Scout ---------- */

export const scoutAct: ActContent = {
  id: 'scout',
  index: '01',
  kicker: 'Discovery',
  title: 'Scout',
  verb: 'Find the signal.',
  beats: [
    { label: 'Map', text: 'We trace every source your business already runs on.', from: 0.16, to: 0.42 },
    { label: 'Read', text: 'Documents, data, and conversations, at machine speed.', from: 0.42, to: 0.68 },
    { label: 'Surface', text: 'Only the insights worth building around.', from: 0.68, to: 0.94 },
  ],
};

export const scoutReadouts = [
  { label: 'Sources mapped', value: 48, from: 0.16, to: 0.42 },
  { label: 'Records read', value: 126400, from: 0.3, to: 0.68 },
  { label: 'Signals worth building', value: 3, from: 0.68, to: 0.86 },
];

export const scoutSignals = [
  { text: 'Weekly reporting eats 30 hours by hand', from: 0.72 },
  { text: 'Leads go cold after 48 hours', from: 0.78 },
  { text: 'Know-how is trapped in 9 different tools', from: 0.84 },
];

/* ---------- 02 Forge ---------- */

export const forgeAct: ActContent = {
  id: 'forge',
  index: '02',
  kicker: 'Build',
  title: 'Forge',
  verb: 'Shape it into a system.',
  beats: [
    { label: 'Blueprint', text: 'Every signal becomes a design with one clear job.', from: 0.16, to: 0.42 },
    { label: 'Build', text: 'Data, models, and agents assembled into one working machine.', from: 0.42, to: 0.68 },
    { label: 'Prove', text: 'Tested against real work until it earns your trust.', from: 0.68, to: 0.94 },
  ],
};

export const forgeSteps = [
  { label: 'Architecture', from: 0.16, to: 0.4 },
  { label: 'Data pipelines', from: 0.3, to: 0.56 },
  { label: 'Agents & models', from: 0.46, to: 0.76 },
  { label: 'Evaluation', from: 0.68, to: 0.9 },
];

export const forgeReadyAt = 0.9;

/* ---------- 03 Orchestrate ---------- */

export const orchestrateAct: ActContent = {
  id: 'orchestrate',
  index: '03',
  kicker: 'Operate',
  title: 'Orchestrate',
  verb: 'Set it in motion.',
  beats: [
    { label: 'Deploy', text: 'The system goes live inside the tools your team already uses.', from: 0.16, to: 0.42 },
    { label: 'Coordinate', text: 'Agents pass work to each other, and to people, without dropping a thing.', from: 0.42, to: 0.68 },
    { label: 'Improve', text: 'It watches its own results and gets sharper every week.', from: 0.68, to: 0.94 },
  ],
};

export const orchestrateLog = [
  { time: '08:59:58', agent: 'scout', text: '14 new inbound leads detected', from: 0.16 },
  { time: '09:00:01', agent: 'qualify', text: 'Leads scored and routed to sales', from: 0.24 },
  { time: '09:00:04', agent: 'writer', text: '14 personal follow-ups drafted', from: 0.32 },
  { time: '09:02:40', agent: 'ops', text: 'Weekly report shipped · 0 manual steps', from: 0.44 },
  { time: '09:05:12', agent: 'support', text: '38 tickets resolved · 2 handed to humans', from: 0.56 },
  { time: '09:10:00', agent: 'finance', text: '1,204 transactions reconciled', from: 0.68 },
  { time: '09:15:27', agent: 'conductor', text: 'All workflows healthy · 6 agents online', from: 0.8 },
];

export const orchestrateTally = [
  { label: 'Tasks automated today', value: 2481, suffix: '', from: 0.16, to: 0.9 },
  { label: 'Hours returned this week', value: 64, suffix: 'h', from: 0.3, to: 0.9 },
];

/* ---------- The triangle ---------- */

export const triangle = {
  vertices: [
    { index: '01', title: 'Scout', role: 'finds it', position: 'top', from: 0.06 },
    { index: '02', title: 'Forge', role: 'builds it', position: 'right', from: 0.26 },
    { index: '03', title: 'Orchestrate', role: 'runs it', position: 'left', from: 0.46 },
  ],
  center: { lead: 'Systems that', emphasis: 'run without you.', from: 0.68 },
  outro: { text: 'One team · from first signal to running system', from: 0.8 },
};

export const contactEmail = 'hello@contrivent.com';

/* ---------- Meet the team ---------- */

/** The closing sequence after the story: transition-3 dissolves into the outro, both starting mid-clip. */
export const teamSegments: Segment[] = [
  { name: 'transition-3', length: 200 },
  { name: 'outro', length: 320 },
];

export const teamCrossfade = 40;

export const teamKicker = 'The people';
export const teamTitle = 'Meet the team.';
export const teamLead = 'Two builders behind the systems. We scout the signal, forge the machine, and stay on it until it runs on its own.';

export type Member = {
  name: string;
  role: string;
  bio: string;
  /** Forward + reverse loop in src/assets, played as the card background. */
  focus: string;
  tags: string[];
};

export const teamMembers: Member[] = [
  {
    name: 'Deska',
    role: 'Systems / Data',
    bio: 'Turns messy sources into pipelines that hold up in production. If a number moves on this page, Deska wired it.',
    focus: 'deska',
    tags: ['Pipelines', 'Evaluation', 'Automation'],
  },
  {
    name: 'Yoel',
    role: 'Product / Agents',
    bio: 'Finds the signal worth building around and shapes it into agents people actually trust. Writes the story the systems tell.',
    focus: 'yoel',
    tags: ['Discovery', 'Agents', 'Interface'],
  },
];


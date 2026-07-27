const { layout } = require('./layout');

// Career timeline, newest first. Each entry is a year, what happened, and what I took from it.
// `year` may repeat; entries are listed in the order below, so keep them newest-first.
// `lead` is the bolded phrase that names what changed; `what` continues the same sentence.
// Keep entries short. This page is a prompt for conversation, not a transcript of one.
const TIMELINE = [
  {
    year: '2026',
    lead: 'Current role: Software Engineering Manager.',
    what:
      'Two teams merged into feature pods built for agentic AI coding. Velocity 50 to 100 story points.',
    parts: [
      'Domain knowledge as markdown, versioned in the repo',
      'Pairing and demos; skeptics convinced, not mandated',
      'Human in the loop on every write',
      'Failing test first, agent fixes, tests verify',
    ],
    learned: 'Tooling gains only reach delivery if the team structure lets them.',
  },
  {
    year: '2025',
    lead: 'Claude Code released.',
    what: 'Rebuilt how I read and write code.',
    parts: [
      'Context efficiency; domain knowledge fed in as markdown',
      'Self-teaching; the model works out how to do the job better',
      'Automate the recurring work: logs, codebase investigation, task triage',
      'Copilot, Cursor, ChatGPT; settled on Claude Code in the terminal',
    ],
  },
  {
    year: '2024',
    lead: 'Scaled to a second team.',
    what: "5 to 10 direct reports in a year, driving our largest customer's rollout.",
    learned: 'Understand what a customer needs, then deliver it as a system.',
  },
  {
    year: '2024',
    lead: 'Certified ScrumMaster.',
    what: 'AWS Developer Associate renewed.',
    learned: 'How to lead an agile team, and current cloud practice.',
  },
  {
    year: '2023',
    lead: 'Promoted to Software Engineering Manager.',
    what: 'Point-of-sale team converted from application-specific to full-stack.',
    learned: 'Fewer barriers between teams and codebases means more throughput.',
  },
  {
    year: '2022',
    lead: 'Harvard Business School CORe.',
    what: 'And the release of ChatGPT.',
    learned: 'Broader business fundamentals, and a better alternative to Stack Overflow.',
  },
  {
    year: '2021',
    lead: 'Selected for an internal architecture team.',
    what: 'Microservices built and integrated into the platform. Promoted to senior software engineer.',
    learned: 'Learn a new codebase fast; communicate across teams.',
  },
  {
    year: '2021',
    lead: 'AWS Developer Associate.',
    what: 'Azure Developer Associate renewed.',
    learned: 'Cloud development best practices.',
  },
  {
    year: '2020',
    lead: 'Hired at PAR Technology.',
    what: 'Customer-facing point-of-sale application.',
    learned: 'What a scrum team looks like inside a SaaS business with hundreds of engineers.',
  },
  {
    year: '2019',
    lead: 'Azure Developer Associate.',
  },
  {
    year: '2017',
    lead: 'Software engineer at Explorica.',
    what: 'Scrum team of four serving the whole company, in education travel.',
    learned: 'End-to-end application ownership.',
  },
  {
    year: '2017',
    lead: 'B.S. Computer Engineering, minor in Mathematics.',
    learned: 'Balancing responsibilities.',
  },
  {
    year: '2017',
    lead: 'Top senior project in computer engineering.',
    what: 'A system to teach vocational skills to people with disabilities, in a greenhouse.',
    learned: 'Build technology that helps people.',
  },
  {
    year: '2017',
    lead: 'Embedded microcontrollers lab technician.',
    what: 'Electrical Engineering Department, Union College.',
    learned: 'Teaching tests your comprehension.',
  },
  {
    year: '2011',
    lead: 'Activities assistant for people with disabilities at Seven Hills.',
    what: 'Landscaping at Flynn Landscaping.',
    learned: 'Work hard, for other people who need help.',
  },
];

function entryItem(entry) {
  const rest = entry.what ? ` ${entry.what}` : '';
  const parts = entry.parts
    ? `<ul class="sub-list">${entry.parts.map((p) => `<li>${p}</li>`).join('')}</ul>`
    : '';
  const learned = entry.learned
    ? `<p class="learned">Learned: ${entry.learned}</p>`
    : '';
  return `<li><i class="year">${entry.year}</i><div class="entry"><p><b>${entry.lead}</b>${rest}</p>${parts}${learned}</div></li>`;
}

function workPage({ isAdmin } = {}) {
  const entries = TIMELINE.map(entryItem).join('');

  const body = `
    <h2>My Work: a 14,000 ft view</h2>
    <ul class="timeline">${entries}</ul>
  `;

  return layout({ title: 'My Work', body, isAdmin });
}

module.exports = { workPage, TIMELINE };

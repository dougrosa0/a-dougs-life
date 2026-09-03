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
      'Two teams merged into feature pods built for agentic AI coding. Increased velocity 100% over 6 months.',
    parts: [
      'Domain knowledge as markdown, versioned in the repo',
      'Pairing and demos; skeptics convinced, not mandated',
      'Human in the loop by design',
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
    what: 'Returned to point-of-sale team and converted it from application-specific to full-stack.',
    learned: 'Fewer barriers between teams and codebases means more throughput.',
  },
  {
    year: '2022',
    lead: 'Harvard Business School Online CORe Certificate.',
    what: 'And the release of ChatGPT.',
    learned: 'Broader business fundamentals, and a better alternative to Stack Overflow.',
  },
  {
    year: '2021',
    lead: 'Promoted to senior software engineer and selected for an internal architecture team.',
    what: 'Microservices built and integrated into the platform.',
    learned: 'Get up to speed on a new codebase fast; communicate across teams.',
  },
  {
    year: '2021',
    lead: 'AWS Developer Associate.',
    what: 'Azure Developer Associate renewed.',
    learned: 'Reinforced cloud best practices.',
  },
  {
    year: '2020',
    lead: 'Hired as a software engineer at PAR Technology.',
    what: 'Started on customer-facing point-of-sale application team.',
    learned: 'What a scrum team looks like inside a SaaS business with hundreds of engineers.',
  },
  {
    year: '2019',
    lead: 'Azure Developer Associate.',
    learned: 'Cloud development best practices.',
  },
  {
    year: '2017',
    lead: 'Software engineer at Explorica.',
    what: 'Scrum team of four serving the whole company, in education travel.',
    learned: 'End-to-end application ownership.',
  },
  {
    year: '2017',
    lead: 'B.S. Computer Engineering, minor in Mathematics, and varsity soccer at Union College.',
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

function workPage() {
  const entries = TIMELINE.map(entryItem).join('');

  const body = `
    <h2>My Work: a 14,000 ft view</h2>
    <p class="lede">An engineering leader passionate about the intersection of technology and business.</p>
    <ul class="timeline">${entries}</ul>
  `;

  return layout({ title: 'My Work', path: '/work', body });
}

module.exports = { workPage, TIMELINE };

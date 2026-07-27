const { layout } = require('./layout');

// Career timeline, newest first. Each entry is a year, what happened, and what I took from it.
// `year` may repeat; entries are listed in the order below, so keep them newest-first.
// `lead` is the bolded phrase that names what changed; `what` continues the same sentence.
const TIMELINE = [
  {
    year: '2026',
    lead: 'Current role: Software Engineering Manager.',
    what:
      'Restructured the team to take advantage of agentic AI coding; combined two teams into one larger team organized into feature pods. Three-month average team velocity went from 50 story points to 100 between January and July.',
    parts: [
      'Domain-knowledge markdown lives in the repository itself, so the whole team iterates on it and the PR tooling reads the same instructions everyone else does.',
      'Spread the practice through pairing and demo sessions; worked through concerns with the skeptics directly instead of mandating the tools.',
      'Kept a human in the loop. The agent asks permission for every write, and critical business operations stay under engineer oversight.',
      'Tests first in the pipeline; write the failing test, let the agent apply the fix, then verify against the tests.',
    ],
    learned: 'Tooling gains only reach delivery if the team structure lets them.',
  },
  {
    year: '2025',
    lead: 'Claude Code released.',
    what: 'Learned agentic AI coding techniques to improve how code gets read and written.',
    parts: [
      'Context efficiency; feeding more domain knowledge into each session through markdown files.',
      'Self-teaching; have the model work out how to do the job better than it did last time.',
      'Replace the process; automate what I do regularly, like reading logs, investigating codebases, and responding to tasks.',
      'Worked across Copilot, Cursor, and ChatGPT; settled on Claude Code in the terminal as the one I reach for.',
    ],
  },
  {
    year: '2024',
    lead: 'Asked to scale out an additional team',
    what:
      'within a year, growing from 5 to 10 direct reports, to drive the rollout for our largest customer.',
    learned: 'How to work with a customer to understand what they need, and deliver on solutions.',
  },
  {
    year: '2024',
    lead: 'Certified ScrumMaster,',
    what: 'and renewed the AWS Certified Developer Associate.',
    learned: 'How to effectively lead an agile scrum team, and current cloud development practices.',
  },
  {
    year: '2023',
    lead: 'Promoted to Software Engineering Manager',
    what:
      'over the point-of-sale team; converted the team to full-stack development instead of application specific.',
    learned: 'Reducing the barriers between teams and codebases increases throughput.',
  },
  {
    year: '2022',
    lead: 'Harvard Business School CORe online program,',
    what: 'and the release of ChatGPT.',
    learned: 'Broader business fundamentals, and a better alternative to Stack Overflow.',
  },
  {
    year: '2021',
    lead: 'Applied for and was selected on an internal architecture team,',
    what:
      'responsible for building and integrating microservices into the system. Promoted to senior software engineer.',
    learned: 'How to learn new codebases quickly, and how to communicate with other teams.',
  },
  {
    year: '2021',
    lead: 'AWS Certified Developer Associate,',
    what: 'and renewed the Azure Developer Associate.',
    learned: 'Cloud development best practices.',
  },
  {
    year: '2020',
    lead: 'Hired at PAR Technology,',
    what: 'working on a customer-facing point-of-sale application.',
    learned: 'Working as part of a scrum team in a SaaS business with hundreds of engineers.',
  },
  {
    year: '2019',
    lead: 'Azure Developer Associate.',
    learned: 'Cloud development best practices.',
  },
  {
    year: '2017',
    lead: 'Worked as a software engineer at Explorica, Inc.,',
    what:
      'on an agile scrum team of four developers serving the entire company in the education travel industry.',
    learned: 'End-to-end application ownership.',
  },
  {
    year: '2017',
    lead: 'Graduated with a Bachelor of Science in Computer Engineering',
    what: 'and a minor in Mathematics.',
    learned: 'Balancing responsibilities.',
  },
  {
    year: '2017',
    lead: 'Awarded top senior project in computer engineering,',
    what:
      'for a system to help teach vocational skills to people with disabilities in a greenhouse.',
    learned: 'Build technology that helps people.',
  },
  {
    year: '2017',
    lead: 'Embedded microcontrollers lab technician,',
    what: 'Electrical Engineering Department, Union College.',
    learned: 'Teaching tests your comprehension.',
  },
  {
    year: '2011',
    lead: 'Activities assistant at Seven Hills,',
    what: 'and landscaping work at Flynn Landscaping.',
    learned: 'Work hard, for other people who need help.',
  },
];

function entryItem(entry) {
  const rest = entry.what ? ` ${entry.what}` : '';
  const parts = entry.parts
    ? `<ul class="sub-list">${entry.parts.map((p) => `<li>${p}</li>`).join('')}</ul>`
    : '';
  const learned = entry.learned
    ? `<p class="learned"><b>Learned:</b> ${entry.learned}</p>`
    : '';
  return `<li><p><i class="year">${entry.year}.</i> <b>${entry.lead}</b>${rest}</p>${parts}${learned}</li>`;
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

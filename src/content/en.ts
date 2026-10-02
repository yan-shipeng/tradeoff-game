// English content — same structure as zh.ts.
// Company: Hengjie Precision, a traditional manufacturer about to go public,
// with an AI-upgrade storyline (AI inspection, lighthouse factory, worker reskilling).
// Impact values and trigger conditions are identical to zh.ts.
import type { GameContent } from './schema';

const en: GameContent = {
  meta: {
    title: 'The Trade-off',
    subtitle: 'Can you balance profit and purpose?',
    start: 'Start game',
    company: 'Hengjie Precision',
  },
  ui: {
    investors: 'Investors',
    stakeholders: 'Stakeholders',
    resources: 'Resources',
    turnOf: (n) => `Turn ${n} of 4`,
    tutorialNext: 'Next',
    tutorialPlay: 'Play',
    allocateTitle: 'Allocate your resources to',
    remaining: 'Resources left',
    cumulative: (cum, lv) => `Total invested ${cum} · Level ${lv}`,
    adjustNote: (delta) =>
      delta > 0
        ? `Strong approval earns you +${delta} resources this turn`
        : `Low approval drags the company down: ${delta} resources this turn`,
    confirm: "Okay, I'm done",
    yearFollows: 'Over the next year, the factory runs on the priorities you set:',
    eventTag: 'Event',
    dilemmaTag: 'What do you do?',
    responseTag: 'Your response',
    pickedBy: (pct) => `${pct}% of players did the same`,
    finalScore: 'Final score',
    finalInvestor: (s, avg) => `Your final investor approval rating was ${s} (player average: ${avg}).`,
    finalStakeholder: (s, avg) => `Your final stakeholder approval rating was ${s} (player average: ${avg}).`,
    recapTitle: 'How you used your resources',
    yourAllocations: 'Your allocations',
    playAgain: 'Play again',
    madeWith: 'Gameplay inspired by the FT’s The Trade-off · all text original and localized',
    impactInvestor: 'Investors',
    impactStakeholder: 'Stakeholders',
    nameTitle: 'Pick a name to play under',
    nameHint: 'Your name and score go on the leaderboard so classmates can compare. It is stored on this device only — no sign-up needed.',
    nameLabel: 'Your name',
    namePlaceholder: 'e.g. Hengjie Team 3 · Lin',
    nameConfirm: 'Start game',
    playingAs: (name) => `Playing as: ${name}`,
    leaderboard: 'Leaderboard',
    leaderboardTitle: 'Leaderboard',
    leaderboardScopeLocal: 'Showing this device’s leaderboard: only names played on this device.',
    leaderboardScopeCloud: 'Class leaderboard: scores from every player, updated live.',
    lbRank: 'Rank',
    lbName: 'Name',
    lbScore: 'Score',
    lbInvestor: 'Investors',
    lbStakeholder: 'Stakeholders',
    lbEmpty: 'No one is on the board yet. Play a round and take first place.',
    lbYou: 'You',
    lbFailed: 'Knocked out',
    lbMyRank: (rank, total) => `Your rank: ${rank} of ${total}`,
    lbNotRanked: 'You are not on the board yet — play a round to see your rank.',
    lbClose: 'Back',
    lbClear: 'Clear this device',
    lbClearConfirm: 'Clear every leaderboard record on this device? This cannot be undone.',
    scoreSubmitted: (rank) => `Your score is on the board — currently ranked ${rank}.`,
  },
  tutorial: {
    pages: [
      'You are the founder and CEO of Hengjie Precision, a manufacturer about to go public. You must keep the factory growing to satisfy your investors. Their approval starts at 5 — if it falls to 0, you lose.',
      'But the factory does not belong to shareholders alone. You also have thousands of workers, customers, suppliers and the surrounding community to keep happy. Stakeholder approval also starts at 5, and hitting 0 also loses the game.',
      'Over the next four years you will constantly trade off near-term orders, emissions, worker wellbeing and AI-powered modernisation. Every choice moves both groups.',
      'Each turn you receive resources (capital, production capacity and management attention) to spread across four areas. Investment accumulates year after year — the more you have invested in an area, the higher its level, and all four can eventually be maxed out. Strong approval from both groups means more resources next year; a bad year shrinks your budget. Then watch how investors and stakeholders react. Good luck!',
    ],
  },
  turns: [
    {
      resources: 10,
      intro:
        "On the eve of the IPO, you write the CEO's letter in the prospectus — the story of how a traditional factory wins the future through AI upgrading. It sets the factory's priorities for the first year and shapes both groups' first impressions.",
    },
    {
      resources: 8,
      bridge:
        'The factory has just hit its stride when a trade war breaks out: tariffs pile up, overseas orders shrink, and the shop floor grows nervous.',
      intro:
        'The recession shrinks your pool — you have only 8 resources this turn. The trade-offs get harder.',
    },
    {
      resources: 10,
      bridge:
        'Hengjie survived the downturn, but new equipment needs fresh capital. Impact-focused industrial fund "VastOcean Capital" steps in — on condition that it appoints two directors and pushes the company to clean up its tax affairs and treat workers and the environment more responsibly.',
      intro: 'Orders recover and your resources return to 10. But the new shareholders are watching your factory.',
    },
    {
      resources: 10,
      bridge:
        'Three years have passed. Your options are about to vest, and you are thinking of handing over the reins. What kind of factory — and what kind of legacy — do you want to leave?',
      intro: 'The final year. These 10 resources will define what you leave behind.',
    },
  ],
  areas: [
    {
      id: 'growth',
      thresholds: [1, 4, 6],
      name: 'Orders & delivery',
      feedback: [
        [
          { text: "You don't even dare print a capacity-ramp plan in the prospectus. Investors are furious.", impact: { investor: -1 } },
          { text: 'You give conservative order guidance. Investors find it unambitious.', impact: { investor: -0.5 } },
          { text: 'You commit to steady delivery targets. Investors are broadly satisfied.', impact: { investor: 0.5 } },
          { text: 'You promise to double capacity in three years, and the roadshow erupts in applause.', impact: { investor: 1 } },
        ],
        [
          { text: 'Orders halve in the recession; you cut full-year guidance outright and the share price sinks.', impact: { investor: -1 } },
          { text: 'You blame delivery delays on "tough conditions". Shareholders are unimpressed.', impact: { investor: -0.5 } },
          { text: 'You hold onto your anchor customers’ orders, and investors credit your resilience.', impact: { investor: 0.5 } },
          { text: 'You chase orders while rivals retrench — even work from their shuttered lines flows to you.', impact: { investor: 1 } },
        ],
        [
          { text: 'You miss the recovery window, and investors start to doubt you.', impact: { investor: -1 } },
          { text: 'You merely break even; half-idle workshops drag down morale.', impact: { investor: -0.5 } },
          { text: 'You deliver a strong recovery, and investors reward you with trust.', impact: { investor: 0.5 } },
          { text: 'You expand aggressively with the new capital, and the market turns bullish again.', impact: { investor: 1 } },
        ],
        [
          { text: 'You publicly renounce quarterly orders. Shareholders howl.', impact: { investor: -1 } },
          { text: 'You tell your successor to "mind delivery" — without specifics.', impact: { investor: -0.5 } },
          { text: 'You ask the company to keep a steady delivery rhythm. Investors relax.', impact: { investor: 0.5 } },
          { text: 'You put an expansion plan into the succession proposal, and markets cheer.', impact: { investor: 1 } },
        ],
      ],
    },
    {
      id: 'environment',
      thresholds: [1, 3, 5],
      name: 'Emissions & environment',
      feedback: [
        [
          { text: 'Green groups put your electroplating shop on a key-polluter watchlist.', impact: { stakeholder: -1 } },
          { text: 'You print glossy carbon-neutral brochures with no action behind them.', impact: { stakeholder: -0.5 } },
          { text: 'You set measurable emissions targets. Environmental groups are cautiously optimistic.', impact: { stakeholder: 0.5 } },
          { text: 'You pledge third-party-audited reduction targets and switch on AI energy optimisation — an instant industry benchmark.', impact: { stakeholder: 1 } },
        ],
        [
          { text: 'To cut costs you switch to a cheap electroplating supplier — just exposed for dumping waste into a river.', impact: { stakeholder: -1 } },
          { text: 'You hire consultants to study a greener supply chain. Little actually changes.', impact: { stakeholder: -0.5 } },
          { text: 'You stick with green suppliers through the recession — costly, but it earns real goodwill.', impact: { investor: -0.5, stakeholder: 1 } },
          { text: 'You issue green bonds to refit boilers and paint lines in a recession. Business and greens applaud together — a first.', impact: { investor: 1, stakeholder: 1 } },
        ],
        [
          { text: 'Your "zero-carbon pledge" is exposed as greenwashing, and social media erupts.', impact: { stakeholder: -1 } },
          { text: 'You switch the plant lighting to LED and issue a press release. That is all it is.', impact: { stakeholder: -0.5 } },
          { text: 'You divert budget into supply-chain decarbonisation, even though new rules may raise your own costs.', impact: { stakeholder: 1 } },
          { text: 'You publish a net-zero roadmap with third-party audits. Even your impact-investor shareholders applaud.', impact: { investor: 0.5, stakeholder: 1 } },
        ],
        [
          { text: 'Your farewell letter never mentions the environment. Young technicians are crestfallen.', impact: { stakeholder: -1 } },
          { text: 'You tell your successor to "sound green" — without meaning it.', impact: { stakeholder: -0.5 } },
          { text: 'You write emissions goals into the company charter, effective indefinitely.', impact: { stakeholder: 1 } },
          { text: 'You announce the plant will become a zero-carbon showcase before you leave. The industry takes notice.', impact: { stakeholder: 1 } },
        ],
      ],
    },
    {
      id: 'social',
      thresholds: [1, 3, 5],
      name: 'Workers & community',
      feedback: [
        [
          { text: 'With the IPO approaching, all you talk about is orders and profit — grumbling spreads across the shop floor.', impact: { stakeholder: -1 } },
          { text: 'You sponsor a few charity galas to show you care. Line workers find it superficial.', impact: { stakeholder: -0.5 } },
          { text: 'You launch paid skills-training leave, and the community responds warmly.', impact: { stakeholder: 0.5 } },
          { text: 'You announce an employee share-ownership plan. The whole plant celebrates.', impact: { stakeholder: 1 } },
        ],
        [
          { text: 'Mass layoffs steady your books, but the factory town fills with ex-Hengjie workers on severance pay.', impact: { investor: 1, stakeholder: -1 } },
          { text: 'You publicise "no layoffs" while quietly swapping permanent staff for agency and gig labour.', impact: { investor: 1, stakeholder: -0.5 } },
          { text: 'You resist layoffs and even raise wages in the downturn. Morale soars.', impact: { investor: -0.5, stakeholder: 1 } },
          { text: 'You hire and expand an "AI-era reskilling" programme through the recession. The press calls you a downturn conscience.', impact: { investor: -1, stakeholder: 1 } },
        ],
        [
          { text: 'After three years of neglect, veteran workers and core crews start quitting in waves.', impact: { stakeholder: -1 } },
          { text: 'You organise a few team-building offsites. The structural grievances remain.', impact: { stakeholder: -0.5 } },
          { text: 'You heed the new shareholders: you unwind aggressive tax schemes and improve agency-worker treatment. Praise all round.', impact: { investor: 0.5, stakeholder: 1 } },
          { text: 'You extend AI-transition reskilling to everyone, and Hengjie makes its first "Best Employer" list.', impact: { investor: 0.5, stakeholder: 1 } },
        ],
        [
          { text: 'You never mention line workers in your farewell letter. Hiring gets noticeably harder.', impact: { stakeholder: -1 } },
          { text: 'You tell your successor to "be kind to the workers" — with no structure behind it.', impact: { stakeholder: -0.5 } },
          { text: 'You put worker representatives on the supervisory board, making governance visibly fairer.', impact: { stakeholder: 1 } },
          { text: 'You write: "If treating workers well means lower dividends, so be it."', impact: { investor: -0.5, stakeholder: 1 } },
        ],
      ],
    },
    {
      id: 'longterm',
      thresholds: [1, 3, 5],
      name: 'AI modernisation',
      feedback: [
        [
          { text: 'With zero modernisation spending, the words "advanced manufacturing" in the prospectus ring hollow.', impact: { investor: -0.5 } },
          { text: 'You open a production line to automation start-ups for pilots — a small bet on the future.', impact: { investor: 0.5 } },
          { text: 'You launch two AI visual-inspection projects, strict on criteria but clear in direction.', impact: { investor: 0.5, stakeholder: 0.5 } },
          { text: 'You announce a "lighthouse factory" programme, and capital markets take notice.', impact: { investor: 1 } },
        ],
        [
          { text: 'You cut the modernisation budget to zero in the recession. Next year’s lines already look dated.', impact: { investor: -1 } },
          { text: 'You keep the core automation team and trim only the fringe projects.', impact: { investor: 0.5 } },
          { text: 'Cash is tight, so you lease equipment instead of buying. You wait for spring.', impact: {} },
          { text: 'You double down on an AI production-scheduling system in the recession. Shareholders grumble, but engineers swear loyalty.', impact: { investor: -0.5, stakeholder: 0.5 } },
        ],
        [
          { text: 'After two lean years on upgrades, a rival’s smart line is already in mass production.', impact: { investor: -1 } },
          { text: 'The automation pilots you funded are starting to show real promise.', impact: { investor: 0.5 } },
          { text: 'Modernisation enters harvest season — AI inspection halves the defect rate, and customers queue up to visit.', impact: { investor: 1 } },
          { text: 'Your "lights-out workshop" plan pulls in applications from world-class engineers.', impact: { investor: 1, stakeholder: 0.5 } },
        ],
        [
          { text: 'Your farewell letter never mentions upgrading. Engineers quietly update their CVs.', impact: { investor: -1 } },
          { text: 'You tell your successor: "Don’t forget to budget for modernisation."', impact: { investor: 0.5 } },
          { text: 'You write R&D intensity into the company charter, permanently.', impact: { investor: 1 } },
          { text: 'You pledge your personal option gains to an "AI reskilling fund for industrial workers" before leaving. The industry salutes.', impact: { investor: 1, stakeholder: 1 } },
        ],
      ],
    },
  ],
  events: [
    {
      id: 'moonshot',
      when: (h) => h.length === 1 && h[0].longterm >= 2,
      text: 'The lighthouse-factory pilot shop launches with great fanfare — AI scheduling, machine vision, digital twins — but near-term returns are scarce.',
      impact: {},
    },
    {
      id: 'charity-gala',
      when: (h) => h.length === 1 && h[0].social === 1,
      text: 'The rural vocational schools you funded are exposed for embezzled construction money and substandard buildings. You cut ties immediately, but the reputational damage is done.',
      impact: { stakeholder: -1 },
    },
    {
      id: 'audit-fail',
      when: (h) => h.length === 2 && h[0].environment >= 2 && h[1].environment <= 1,
      text: 'The third-party environmental auditor you hired issues a negative report on Hengjie’s progress.',
      impact: { stakeholder: -1 },
    },
    {
      id: 'green-boycott',
      when: (h) => h.length === 2 && h[0].environment === 0 && h[1].environment === 0,
      text: 'Green groups launch a joint campaign against your high-pollution electroplating suppliers.',
      impact: { stakeholder: -0.5 },
    },
    {
      id: 'toxic-culture',
      when: (h) => h.length === 2 && h[0].social === 0 && h[1].social <= 1,
      text: 'A long exposé on Hengjie’s "sweatshop culture" appears on workplace forums, and hiring gets noticeably harder.',
      impact: { investor: -1 },
    },
    {
      id: 'best-employer',
      when: (h) => h.length === 2 && h[0].social >= 2 && h[1].social >= 2,
      text: 'Steady investment in people pays off: Hengjie makes a "Best Employer" list for the second year running, and defect rates follow the mood upward.',
      impact: { investor: 1, stakeholder: 1 },
    },
    {
      id: 'rd-backtrack',
      when: (h) => h.length === 2 && h[0].longterm === 3 && h[1].longterm <= 1,
      text: 'You scrap phase two of the lighthouse factory, and the market reads it as a bearish signal. The stock drops.',
      impact: { investor: -1 },
    },
    {
      id: 'activist-fund',
      when: (h) => h.length === 2 && h[1].growth <= 1 && h[1].longterm >= 2,
      text: 'An activist hedge fund publicly attacks your "bloated, inefficient automation spending" and demands a board reshuffle.',
      impact: { investor: -1 },
    },
    {
      id: 'supplier-scandal',
      when: (h) => h.length === 3 && h[2].environment === 0,
      text: 'An undercover report exposes your cheap electroplating supplier: illegal waste dumping and falsified monitoring data. Public outrage follows.',
      impact: { investor: -1 },
    },
    {
      id: 'tech-behind',
      when: (h) => h.length === 3 && h[1].longterm <= 1 && h[2].longterm <= 1,
      text: 'Years of underinvestment catch up: a rival’s smart line runs at a fraction of your defect rate.',
      impact: { investor: -2 },
    },
    {
      id: 'whistleblower',
      when: (h) => h.length === 3 && h.slice(0, 3).every((a) => a.social <= 1),
      text: 'A fed-up line worker leaks internal documents: wage arrears, brutal overtime — and an AI management system secretly scoring workers’ "efficiency" and auto-docking pay. A regulatory probe follows.',
      impact: { investor: -1, stakeholder: -2 },
    },
    {
      id: 'breakthrough',
      when: (h) => h.length === 3 && h[0].longterm >= 2 && h[1].longterm >= 2 && h[2].longterm >= 1,
      text: 'Years of modernisation finally pay off: Hengjie’s AI inspection plus flexible lines define an entirely new manufacturing standard, and the stock soars.',
      impact: { investor: 2 },
    },
  ],
  dilemmas: [
    {
      title: 'An employee asks on the internal forum: "Will this production line need any people at all?"',
      body: 'On the eve of the IPO, a major customer’s tender document lands on your desk: the entire line must run "lights-out" — fully automated, unattended, lowest cost wins. Winning it would complete Hengjie’s capacity story for investors; but the line would not need a single worker. Employees say this betrays the company’s "people first" values. What do you do?',
      options: [
        {
          label: 'Withdraw the bid',
          response: 'Your decisiveness wins admiration from staff, but losing this anchor customer dims the IPO story and next quarter’s numbers. Your investors are not happy.',
          impact: { investor: -1, stakeholder: 0.5 },
          pickedPercent: 63,
        },
        {
          label: 'Bid for it',
          response: 'You send a memo explaining that without automation the order will simply go elsewhere — only a winning company can protect everyone’s jobs. It fails to quell the unease: you win the bid, but anxiety spreads across the shop floor.',
          impact: { stakeholder: -1 },
          pickedPercent: 37,
        },
      ],
    },
    {
      title: 'The recession forces every expense back onto the table. You propose cutting the staff canteen and shuttle bus subsidies — and are surprised by the ferocity of the opposition.',
      body: 'Staff say the cuts betray the company’s stated values of "decency" and "humanity". What do you do?',
      options: [
        {
          label: 'Cut them anyway',
          response: 'You press ahead: losing a free lunch beats losing colleagues. A few staff keep complaining, but privately others admire your resolve.',
          impact: { investor: 0.5, stakeholder: 0.5 },
          pickedPercent: 57,
        },
        {
          label: 'Keep them',
          response: 'You keep the canteen and shuttles, and start an endless consultation on costs and corporate values. It drags on fruitlessly while the factory bleeds through the recession.',
          impact: { investor: -1, stakeholder: -0.5 },
          pickedPercent: 43,
        },
      ],
    },
    {
      title: 'After a typhoon, young workers put up a petition: "It’s time we had our own carbon-reduction timetable."',
      body: 'Riding the national "dual carbon" policy wave, a group of young employees launches a "green factory" initiative: they call on the company to publish firm emissions pledges, and propose halting production for a day on National Low-Carbon Day to make a statement. Posters are already up across the workshops and canteen. Management is waiting for your call.',
      options: [
        {
          label: 'Back the initiative',
          response: 'You shut the plant for Low-Carbon Day, keep only vital lines running, and use the moment to publish Hengjie’s emissions roadmap. Free local headlines — and one lost day of output.',
          impact: { investor: -0.5, stakeholder: 1 },
          pickedPercent: 76,
        },
        {
          label: 'Production as usual',
          response: 'You express sympathy, but delivery commitments come first. The plant runs as normal on the day; some staff switch off their lights for an hour in quiet support, and at least one director privately approves.',
          impact: { investor: 0.5, stakeholder: -0.5 },
          pickedPercent: 24,
        },
      ],
    },
  ],
  endings: {
    sad: {
      sad: 'Four years on, the factory is teetering on the edge of shutdown — and nobody would mourn its passing.',
      neutral: 'The factory keeps running, but orders and reputation are draining away; old customers keep it on life support.',
      happy: 'Workers and the community love Hengjie, but the capital markets vote with their feet. The board soon shows you the door.',
    },
    neutral: {
      sad: 'Investors are content enough, but workers and the community bear a grudge, and the veteran craftsmen keep leaving.',
      neutral: 'Neither good nor bad. Hengjie plods along, soulless like a thousand other traditional factories.',
      happy: 'You are not the shareholders’ favourite, but the factory you leave behind is honest, steady and respected.',
    },
    happy: {
      sad: 'Capital markets cheer you, but workers and the community are left with only disappointment. You exit through a storm of criticism.',
      neutral: 'Investors got their returns and society got by. A standard "successful entrepreneur" ending.',
      happy: 'A rare double standing ovation from investors and stakeholders alike. You turned trade-offs into "both" — that is real leadership.',
    },
    investorFail: 'Your investors lose patience completely. They band together and force you out. Game over.',
    stakeholderFail: 'Workers, customers and the community lose patience with you all at once. Without them, a factory is just a pile of rusting equipment. Game over.',
    averageInvestor: 4.7,
    averageStakeholder: 3.1,
  },
};

export default en;

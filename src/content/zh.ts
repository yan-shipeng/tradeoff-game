// 中文内容（主语言）—— 制造业 + AI 设定
// 公司：恒捷智造 Hengjie Precision —— 一家正准备 IPO 的传统制造厂，
// 主线：智能化改造（AI 质检 / 灯塔工厂 / 再培训）与短期业绩、环保、员工福祉的权衡。
// 注意：数值（impact / 触发条件）与上一版保持一致，改动仅限叙事文本。
import type { GameContent } from './schema';

const zh: GameContent = {
  meta: {
    title: '权衡',
    subtitle: '你能平衡利润与使命吗？',
    start: '开始游戏',
    company: '恒捷智造',
  },
  ui: {
    investors: '投资者',
    stakeholders: '利益相关者',
    resources: '资源',
    turnOf: (n) => `第 ${n} 回合 · 共 4 回合`,
    tutorialNext: '下一步',
    tutorialPlay: '开始',
    allocateTitle: '把资源分配到',
    remaining: '剩余资源',
    cumulative: (cum, lv) => `累计投入 ${cum} · 已达 ${lv} 级`,
    adjustNote: (delta) =>
      delta > 0
        ? `双方支持度良好，本回合资源 +${delta}`
        : `支持度低迷拖累了公司，本回合资源 ${delta}`,
    confirm: '完成分配',
    yearFollows: '接下来这一年，工厂沿着你设定的优先级运转：',
    eventTag: '突发事件',
    dilemmaTag: '你怎么办？',
    responseTag: '你的回应',
    pickedBy: (pct) => `${pct}% 的玩家和你做了同样的选择`,
    finalScore: '最终得分',
    finalInvestor: (s, avg) => `投资者最终支持度 ${s}（全体玩家平均 ${avg}）`,
    finalStakeholder: (s, avg) => `利益相关者最终支持度 ${s}（全体玩家平均 ${avg}）`,
    recapTitle: '你的资源分配',
    yourAllocations: '各回合分配',
    playAgain: '再来一局',
    impactInvestor: '投资者',
    impactStakeholder: '利益相关者',
    nameTitle: '先给自己起个名号',
    nameHint: '名号和积分会进入排行榜，方便同学们互相比一比。名号会显示给全班同学看，不需要注册。',
    nameLabel: '你的名号',
    namePlaceholder: '例如：恒捷三班·小林',
    nameConfirm: '开始游戏',
    playingAs: (name) => `玩家：${name}`,
    leaderboard: '排行榜',
    leaderboardTitle: '积分排行榜',
    leaderboardScopeLocal: '当前为本机排行榜：只统计这台设备上玩过的名号。',
    leaderboardScopeCloud: '全班排行榜：所有同学的成绩实时汇总。',
    lbRank: '名次',
    lbName: '名号',
    lbScore: '积分',
    lbInvestor: '投资者',
    lbStakeholder: '利益相关者',
    lbEmpty: '还没有人上榜。玩一局，你就是第一名。',
    lbYou: '我',
    lbFailed: '出局',
    lbMyRank: (rank, total) => `你的名次：第 ${rank} 名 / 共 ${total} 人`,
    lbNotRanked: '你还没有上榜，玩一局就能看到自己的名次。',
    lbClose: '返回',
    lbClear: '清空本机记录',
    lbClearConfirm: '确定清空这台设备上的全部排行榜记录吗？此操作不可撤销。',
    scoreSubmitted: (rank) => `你的积分已上榜，当前排名第 ${rank} 名。`,
  },
  tutorial: {
    pages: [
      '你是恒捷智造的创始人兼 CEO，公司正准备 IPO。你必须带领工厂持续增长，才能满足投资者的期待。投资者初始支持度为 5——如果降到 0，你就出局。',
      '但工厂不只属于股东。你还有几千名工人、客户、供应商和厂区所在的社区要顾及——利益相关者的初始支持度同样是 5，降到 0 同样出局。',
      '未来四年，你要在短期订单、环保减排、员工福祉和智能化改造之间不断取舍。每个决定都会同时影响这两群人。',
      '每回合你有一笔资源（资金、产能和管理精力），把它分配到四个领域。投入会逐年累计——累计越多，该领域达到的等级越高，四项最终都可以升满。上一年双方支持度越高，下一回合的资源越充裕；玩得差，资源会缩水。然后看看投资者和利益相关者作何反应。祝好运！',
    ],
  },
  turns: [
    {
      resources: 10,
      intro:
        '上市前夜。你要在招股书的 CEO 致投资者信中写下恒捷的故事——一家传统制造厂如何靠 AI 升级赢得未来。这封信将决定工厂第一年的资源投向，也会影响投资者和利益相关者对公司的第一印象。',
    },
    {
      resources: 8,
      bridge:
        '工厂刚上正轨，贸易战爆发：关税层层加征、海外订单萎缩，车间里人心惶惶。',
      intro:
        '衰退让资源缩水——本回合你只有 8 点资源。取舍，将变得更加艰难。',
    },
    {
      resources: 10,
      bridge:
        '恒捷熬过了衰退，但设备更新需要新一轮融资。影响力产业基金"瀚洋资本"伸出援手：条件是委派两名董事，并要求公司改善税务安排、更负责任地对待工人和环境。',
      intro: '订单回暖，资源恢复到 10 点。但新的股东正看着你的工厂。',
    },
    {
      resources: 10,
      bridge:
        '三年过去了。你的期权即将行权，开始认真考虑交棒。你想留下一座怎样的工厂，一个怎样的名字？',
      intro: '最后一年。这 10 点资源，将决定你留下的遗产。',
    },
  ],
  areas: [
    {
      id: 'growth',
      name: '短期订单与交付',
      thresholds: [1, 4, 6],
      feedback: [
        [
          { text: '招股书里你连产能爬坡计划都不敢写，投资者大为光火。', impact: { investor: -1 } },
          { text: '你给出了保守的订单预期，投资者觉得缺乏野心。', impact: { investor: -0.5 } },
          { text: '你承诺了稳健的交付目标，投资者基本满意。', impact: { investor: 0.5 } },
          { text: '你许诺三年产能翻倍，路演现场掌声雷动。', impact: { investor: 1 } },
        ],
        [
          { text: '衰退中订单腰斩，你直接下调全年预期，股价一泻千里。', impact: { investor: -1 } },
          { text: '你把交付延期归咎于"大环境"，股东并不买账。', impact: { investor: -0.5 } },
          { text: '你保住了核心客户的订单，投资者认可你的韧性。', impact: { investor: 0.5 } },
          { text: '别人收缩时你逆势抢单，竞对停掉的产线订单都流向你。', impact: { investor: 1 } },
        ],
        [
          { text: '复苏窗口你没有抓住，投资者开始质疑你的能力。', impact: { investor: -1 } },
          { text: '你只做到盈亏平衡，开工率不足的厂房让团队士气低落。', impact: { investor: -0.5 } },
          { text: '你交出了漂亮的复苏成绩单，投资者回报以信任。', impact: { investor: 0.5 } },
          { text: '借助新资金你大幅扩产，市场重新看好恒捷。', impact: { investor: 1 } },
        ],
        [
          { text: '你公开表示不再追逐季度订单，股东骂声一片。', impact: { investor: -1 } },
          { text: '你提醒继任者关注交付，但语焉不详。', impact: { investor: -0.5 } },
          { text: '你要求公司保持稳健的交付节奏，投资者安心不少。', impact: { investor: 0.5 } },
          { text: '你把扩产计划写进传承方案，资本市场热烈响应。', impact: { investor: 1 } },
        ],
      ],
    },
    {
      id: 'environment',
      name: '环保与减排',
      thresholds: [1, 3, 5],
      feedback: [
        [
          { text: '环保组织盯上你的电镀车间，把你列入重点排污观察名单。', impact: { stakeholder: -1 } },
          { text: '你印刷了精美的碳中和宣传册，却没有配套行动。', impact: { stakeholder: -0.5 } },
          { text: '你制定了可衡量的减排目标，环保圈表示谨慎乐观。', impact: { stakeholder: 0.5 } },
          { text: '你承诺引入第三方审计的减排目标，还上线 AI 能耗优化，一举树立行业标杆形象。', impact: { stakeholder: 1 } },
        ],
        [
          { text: '为省钱你换用廉价电镀供应商——他们刚被曝向河道偷排废水。', impact: { stakeholder: -1 } },
          { text: '你委托咨询公司研究绿色供应链，实质进展寥寥。', impact: { stakeholder: -0.5 } },
          { text: '衰退中你仍与绿色供应商共渡难关，多花了钱，却赢得口碑。', impact: { investor: -0.5, stakeholder: 1 } },
          { text: '你顶着衰退发行绿色债券改造锅炉和涂装线，商界与环保界罕见地同时叫好。', impact: { investor: 1, stakeholder: 1 } },
        ],
        [
          { text: '你的"零碳承诺"被扒出是漂绿，社交媒体上骂声一片。', impact: { stakeholder: -1 } },
          { text: '你把厂区照明换成 LED 并发了新闻稿——也就只有新闻稿。', impact: { stakeholder: -0.5 } },
          { text: '你把部分预算转投供应链减排，哪怕新规会抬高自家成本。', impact: { stakeholder: 1 } },
          { text: '你公布净零路线图并引入第三方审计，连影响力股东都为你鼓掌。', impact: { investor: 0.5, stakeholder: 1 } },
        ],
        [
          { text: '你在告别信里对环保只字未提，年轻技术员很失望。', impact: { stakeholder: -1 } },
          { text: '你嘱咐继任者"环保表态要有"，但不必当真。', impact: { stakeholder: -0.5 } },
          { text: '你把减排目标写进公司章程，长期生效。', impact: { stakeholder: 1 } },
          { text: '你宣布卸任前把厂区改造成零碳示范工厂，业界为之震动。', impact: { stakeholder: 1 } },
        ],
      ],
    },
    {
      id: 'social',
      name: '员工与社区',
      thresholds: [1, 3, 5],
      feedback: [
        [
          { text: '上市前夜只谈订单和利润，车间里的抱怨声越来越大。', impact: { stakeholder: -1 } },
          { text: '你赞助了几场慈善晚宴表明态度，一线工人觉得流于表面。', impact: { stakeholder: -0.5 } },
          { text: '你推出了带薪技能培训假，社区反响不错。', impact: { stakeholder: 0.5 } },
          { text: '你宣布全员持股计划，整个厂区一片欢腾。', impact: { stakeholder: 1 } },
        ],
        [
          { text: '你靠大规模裁员稳住了报表，但厂区所在的镇上全是领遣散费的恒捷前员工。', impact: { investor: 1, stakeholder: -1 } },
          { text: '你一边宣传"不裁员"，一边把正式工换成劳务派遣和零工。', impact: { investor: 1, stakeholder: -0.5 } },
          { text: '你顶住裁员的诱惑，还逆势加薪，工人士气大振。', impact: { investor: -0.5, stakeholder: 1 } },
          { text: '你逆势扩招并扩大"AI 时代再培训"项目，媒体把你当成衰退中的良心企业。', impact: { investor: -1, stakeholder: 1 } },
        ],
        [
          { text: '连续三年忽视一线员工，老师傅和核心班组开始成批离职。', impact: { stakeholder: -1 } },
          { text: '你组织了几场团建，解决不了结构性的不满。', impact: { stakeholder: -0.5 } },
          { text: '你响应新股东要求，清理了激进的避税安排，还改善了劳务派遣待遇，公众赞誉有加。', impact: { investor: 0.5, stakeholder: 1 } },
          { text: '你把"AI 转岗再培训"扩大到全员，恒捷首次登上"最佳雇主"榜。', impact: { investor: 0.5, stakeholder: 1 } },
        ],
        [
          { text: '你对一线员工只字未提，招工越来越难。', impact: { stakeholder: -1 } },
          { text: '你嘱咐继任者"善待工人"，但没有任何制度保障。', impact: { stakeholder: -0.5 } },
          { text: '你把工人代表请进了监事会，公司治理更透明了。', impact: { stakeholder: 1 } },
          { text: '你写道："如果善待工人意味着更低的利润分红，那就这样吧。"', impact: { investor: -0.5, stakeholder: 1 } },
        ],
      ],
    },
    {
      id: 'longterm',
      name: '智能化改造',
      thresholds: [1, 3, 5],
      feedback: [
        [
          { text: '你不投智能化改造，招股书里"先进制造"四个字显得心虚。', impact: { investor: -0.5 } },
          { text: '你给自动化初创公司开放产线做试点，小投入埋伏笔。', impact: { investor: 0.5 } },
          { text: '你启动了两个 AI 质检项目，标准严苛但方向清晰。', impact: { investor: 0.5, stakeholder: 0.5 } },
          { text: '你宣布建设"灯塔工厂"，资本市场为之一振。', impact: { investor: 1 } },
        ],
        [
          { text: '衰退期你砍光了技改预算，明年的产线已经能看到天花板。', impact: { investor: -1 } },
          { text: '你保留了核心自动化团队，只砍掉了边缘项目。', impact: { investor: 0.5 } },
          { text: '资金紧张，你让设备厂商以租代购，等待春天。', impact: {} },
          { text: '衰退中你反而加码 AI 排产系统，股东不解，但工程师团队发誓效忠。', impact: { investor: -0.5, stakeholder: 0.5 } },
        ],
        [
          { text: '连续两年技改投入不足，竞对的智能产线已经量产。', impact: { investor: -1 } },
          { text: '你试点的几个自动化项目开始有了起色。', impact: { investor: 0.5 } },
          { text: '智能化进入收获期——AI 质检把不良率降了一半，客户排队来参观。', impact: { investor: 1 } },
          { text: '你宣布的"黑灯车间"计划引来全球顶尖工程师投递简历。', impact: { investor: 1, stakeholder: 0.5 } },
        ],
        [
          { text: '告别信里你对技改只字未提，工程师们开始悄悄更新简历。', impact: { investor: -1 } },
          { text: '你嘱咐继任者："别忘了给技改留预算。"', impact: { investor: 0.5 } },
          { text: '你把研发占比写进公司宪章，长期生效。', impact: { investor: 1 } },
          { text: '你卸任前把个人期权收益投入"产业工人 AI 再培训基金"，全行业肃然起敬。', impact: { investor: 1, stakeholder: 1 } },
        ],
      ],
    },
  ],
  events: [
    {
      id: 'moonshot',
      when: (h) => h.length === 1 && h[0].longterm >= 2,
      text: '"灯塔工厂"试点车间启动声势浩大——AI 排产、机器视觉、数字孪生一应俱全，但短期内看不到回报。',
      impact: {},
    },
    {
      id: 'charity-gala',
      when: (h) => h.length === 1 && h[0].social === 1,
      text: '你捐建的几所乡村职业学校被曝出工程款挪用、校舍质量不达标。你第一时间切割，但声誉已经受损。',
      impact: { stakeholder: -1 },
    },
    {
      id: 'audit-fail',
      when: (h) => h.length === 2 && h[0].environment >= 2 && h[1].environment <= 1,
      text: '你聘请的第三方环保审计机构发布报告，给恒捷的减排进展打了差评。',
      impact: { stakeholder: -1 },
    },
    {
      id: 'green-boycott',
      when: (h) => h.length === 2 && h[0].environment === 0 && h[1].environment === 0,
      text: '环保组织发起联合抵制，矛头对准你的高污染电镀供应商。',
      impact: { stakeholder: -0.5 },
    },
    {
      id: 'toxic-culture',
      when: (h) => h.length === 2 && h[0].social === 0 && h[1].social <= 1,
      text: '职场论坛上出现"恒捷血汗工厂"的长文爆料，招工成本明显上升。',
      impact: { investor: -1 },
    },
    {
      id: 'best-employer',
      when: (h) => h.length === 2 && h[0].social >= 2 && h[1].social >= 2,
      text: '持续的投入结出果实：恒捷连续第二年入选"最佳雇主"，良品率和产能利用率跟着创新高。',
      impact: { investor: 1, stakeholder: 1 },
    },
    {
      id: 'rd-backtrack',
      when: (h) => h.length === 2 && h[0].longterm === 3 && h[1].longterm <= 1,
      text: '你砍掉了灯塔工厂的二期扩建计划，市场把这读作利空信号，股价下挫。',
      impact: { investor: -1 },
    },
    {
      id: 'activist-fund',
      when: (h) => h.length === 2 && h[1].growth <= 1 && h[1].longterm >= 2,
      text: '一家激进对冲基金公开质疑你"低效的自动化开支"，要求改组董事会。',
      impact: { investor: -1 },
    },
    {
      id: 'supplier-scandal',
      when: (h) => h.length === 3 && h[2].environment === 0,
      text: '你换用的廉价电镀供应商被记者卧底曝光：废水直排、监测数据造假，舆论哗然。',
      impact: { investor: -1 },
    },
    {
      id: 'tech-behind',
      when: (h) => h.length === 3 && h[1].longterm <= 1 && h[2].longterm <= 1,
      text: '技改长期不足的后果显现：竞对的智能产线良品率比你高出一个数量级。',
      impact: { investor: -2 },
    },
    {
      id: 'whistleblower',
      when: (h) => h.length === 3 && h.slice(0, 3).every((a) => a.social <= 1),
      text: '一名忍无可忍的产线员工向媒体泄露内部文件：欠薪加班，还有一套暗中给工人打"效率分"并自动扣绩效的 AI 管理系统，引发监管调查。',
      impact: { investor: -1, stakeholder: -2 },
    },
    {
      id: 'breakthrough',
      when: (h) => h.length === 3 && h[0].longterm >= 2 && h[1].longterm >= 2 && h[2].longterm >= 1,
      text: '多年技改终于爆发：恒捷的 AI 质检 + 柔性产线定义了全新的制造标准，股价大涨。',
      impact: { investor: 2 },
    },
  ],
  dilemmas: [
    {
      title: '员工在内部论坛上发问："这条产线，还要不要人？"',
      body: '上市前夜，一个大客户的招标文件摆在桌上：要求整条产线实现"黑灯生产"——全自动化、无人值守，成本最低者得。拿下它，恒捷的产能故事就完整了；但这条产线一个工人岗位都不需要。员工们说：这与公司"以人为本"的价值观相悖。你怎么办？',
      options: [
        {
          label: '退出竞标',
          response: '你的果断赢得了员工的敬意，但失去这个标杆客户让上市故事失色，下季度财报也随之黯淡。投资者很不高兴。',
          impact: { investor: -1, stakeholder: 0.5 },
          pickedPercent: 63,
        },
        {
          label: '参与竞标',
          response: '你发内部备忘录解释：不自动化，订单就会流向别人，保住公司才能保住大家的岗位。备忘录没能平息争议——竞标成功了，车间里的不安却开始蔓延。',
          impact: { stakeholder: -1 },
          pickedPercent: 37,
        },
      ],
    },
    {
      title: '衰退期，所有开支都要重新过一遍。你提议砍掉员工食堂和班车补贴，没想到反对声浪如此之大。',
      body: '员工们认为，削减福利违背了公司"体面"与"人情味"的价值观。怎么办？',
      options: [
        {
          label: '坚持砍掉',
          response: '你顶住压力推进：少一顿免费午餐，总比裁掉同事好。少数人继续投诉，但私下里也有人佩服你的决断。',
          impact: { investor: 0.5, stakeholder: 0.5 },
          pickedPercent: 57,
        },
        {
          label: '保留福利',
          response: '你保留了食堂和班车，发起一场关于公司价值观的漫长大讨论。讨论无果而终，工厂却在衰退中继续失血。',
          impact: { investor: -1, stakeholder: -0.5 },
          pickedPercent: 43,
        },
      ],
    },
    {
      title: '台风过后，车间里的年轻人贴出倡议："我们该有自己的碳减排时间表了。"',
      body: '一群青年员工借着双碳政策的东风，发起"绿色工厂"倡议：呼吁公司公布明确的减排承诺，并提议在"全国低碳日"当天停产一天表态。海报已经贴进车间和食堂，管理层在等你拍板。',
      options: [
        {
          label: '支持倡议',
          response: '你宣布低碳日当天停产一天，只保留关键产线，并借机公布恒捷的减排路线图。免费上了本地新闻头条，但损失了一天的产能。',
          impact: { investor: -0.5, stakeholder: 1 },
          pickedPercent: 76,
        },
        {
          label: '照常生产',
          response: '你表示理解，但工厂必须完成交付。低碳日当天一切照旧，部分员工自发熄灯一小时表示支持，一位董事私下为你点了赞。',
          impact: { investor: 0.5, stakeholder: -0.5 },
          pickedPercent: 24,
        },
      ],
    },
  ],
  endings: {
    sad: {
      sad: '四年后，工厂濒临关停——没有人为它的消失感到惋惜。',
      neutral: '工厂还在运转，但订单和信誉都在流失，靠老客户勉强续命。',
      happy: '工人和社区爱戴恒捷，但资本市场用脚投票。你很快被董事会请下了台。',
    },
    neutral: {
      sad: '投资者还算满意，但工人与社区积怨已深，老师傅正在陆续离职。',
      neutral: '不好不坏。恒捷像无数家没有灵魂的传统工厂一样，平庸地运转着。',
      happy: '你不是股东的最爱，但你留下的工厂诚实、稳健，值得尊敬。',
    },
    happy: {
      sad: '资本市场为你欢呼，但工人和社区对你只有失望——你在唾骂声中谢幕。',
      neutral: '投资者回报丰厚，社会评价也过得去。一个标准的"成功企业家"结局。',
      happy: '罕见！投资者与利益相关者同时为你鼓掌。你把"权衡"变成了"兼得"——这才是真正的领导力。',
    },
    investorFail: '投资者对你彻底失去了耐心。他们联合发起罢免，董事会别无选择。你出局了。',
    stakeholderFail: '工人、客户和社区一起对你失去了耐心。没有他们，工厂只是一堆生锈的设备。你出局了。',
    averageInvestor: 4.7,
    averageStakeholder: 3.1,
  },
};

export default zh;

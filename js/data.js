(function () {
  'use strict';

  var BRAND = {
    name: 'why哥的情绪陪伴屋',
    shortName: 'why哥的情绪陪伴屋',
    english: "WHY'S COMPANY ROOM",
    author: '王浩宇',
    alias: 'why哥',
    school: '湖南科技大学',
    version: '初版测试'
  };

  var GENDERS = [
    {
      id: 'female',
      label: '女生',
      short: '女',
      icon: '她',
      description: '开局叫「老妹」，熟了改口叫「同学」'
    },
    {
      id: 'male',
      label: '男生',
      short: '男',
      icon: '他',
      description: '用「兄弟」的方式和你说话'
    }
  ];

  var PERSONALITIES = {
    gentle: {
      id: 'gentle',
      label: '温柔倾听',
      short: '像一盏不催你的小灯',
      description: '先把话听完，不急着给答案。',
      icon: '叶',
      accent: '#7F9A86',
      accentSoft: '#E7EEE3',
      welcome: '今天想怎么待着都行，不说话也可以。'
    },
    buddy: {
      id: 'buddy',
      label: '松弛老友',
      short: '像下课后一起晃悠的朋友',
      description: '可以吐槽，可以沉默，也可以被轻轻逗一下。',
      icon: '杯',
      accent: '#C98A68',
      accentSoft: '#F6E5D9',
      welcome: '今天想吐槽谁？还是单纯想坐一会儿？'
    },
    steady: {
      id: 'steady',
      label: '清醒学长',
      short: '会陪你慢慢理一理',
      description: '把乱麻拆小一点，再决定下一步。',
      icon: '灯',
      accent: '#6F8893',
      accentSoft: '#E4EDF0',
      welcome: '今天想先理哪件事？不着急，我们一件件来。'
    },
    direct: {
      id: 'direct',
      label: '直球搭子',
      short: '不绕弯子，但不敷衍',
      description: '说真话，也认真接住你的感受。',
      icon: '火',
      accent: '#A76A55',
      accentSoft: '#F2E0D8',
      welcome: '今天想说什么就直说，不用挑好听的说。'
    }
  };

  var ONBOARDING = {
    greeting: 'Hi 同学你好，我是湖科大的王浩宇',
    greetingNote: '（他把门推开一条缝，探头看了你一眼）',
    choicePrompt: '先选一句你想说的',
    branches: {
      friendly: {
        id: 'friendly',
        label: '啊！你好呀(^∇^)！',
        index: 'i',
        reaction: '你好呀，同学！',
        lines: [
          '欢迎来到我的情绪陪伴屋。这里不是心理咨询室，更像一个可以坐下来说话的小角落。',
          '这里有失恋和孤独两个情境，也有一个还在慢慢长大的创作者。我们可以先认识一下。'
        ],
        setupPrompt: '先告诉我，我该怎么叫你？',
        setupHint: '选一个你愿意被叫的名字就好，不用写真名。',
        welcome: '欢迎进屋，{nickname}。先随便坐，这里不用急着说没事。',
        tone: '热情版'
      },
      tsundere: {
        id: 'tsundere',
        label: '啊！你就是王同学呀！',
        index: 'ii',
        reaction: '呀！我这么出名吗？',
        lines: [
          '（嘴角压不住地翘了一下）行吧，既然你都认出我了，就勉强带你逛逛。',
          '这里不是心理咨询，只有一些故事和一点笨拙的陪伴。先让我认识认识你。'
        ],
        setupPrompt: '喂，先报上名来。我该怎么叫你？',
        setupHint: '名字只留在你自己的浏览器里，不会到处广播。',
        welcome: '进来吧，{nickname}。别站在门口了，我又不会吃了你。',
        tone: '傲娇版'
      },
      playful: {
        id: 'playful',
        label: '呦！原来是你，快给我来首歌！',
        index: 'iii',
        reaction: '呃……那我来唱啦！',
        pauseBeforeLines: 900,
        lines: [
          '哈！我骗你的，想听我唱歌，先陪我聊两句嘛。',
          '这里有失恋、孤独两个情境，还有一个想认真做点东西的王同志。先别急着听歌，认识一下。'
        ],
        setupPrompt: '先别急着听歌，告诉我怎么称呼你？',
        setupHint: '取个顺口的昵称就行，我不会拿去当歌词。',
        welcome: '欢迎光临，{nickname}！本店今日只营业聊天和发呆。',
        tone: '调皮版'
      }
    },
    progress: ['打个招呼', '认识你', '进屋看看'],
    submitLabel: '进屋看看',
    introDisclaimer: '这里不是心理咨询，也不能替代专业帮助。如果它今天只能陪你坐一会儿，也算没白开门。',
    prologue: {
      label: '进门前',
      button: '继续，认识一下',
      sentences: [
        '（他停顿了一下，像是在斟酌用词）',
        '在你进屋之前，我想先说一句。',
        '这里不是心理咨询，也不能替代专业帮助。',
        '你可以慢慢说，也可以什么都不说。',
        '如果愿意，先留下一个称呼，让我知道怎么叫你。'
      ]
    }
  };

  var RUN = {
    kicker: '身体运动汇健康',
    title: '校园跑陪跑',
    badge: '可预约',
    description: '想跑步又不想一个人？why哥可以陪你绕校园跑一圈。先通过个人介绍里的联系方式约好时间，再一起出门。',
    temptations: [
      { icon: 'story', text: '可以给你讲我的恋爱故事哦~' },
      { icon: 'tea', text: '可以请你喝奶茶哦~' },
      { icon: 'film', text: '可以请你吃饭看电影~' },
      { icon: 'run', text: '以及，跑完可以一起在操场边发呆。' }
    ],
    cta: '预约陪跑',
    ctaNote: '先看个人介绍，加微信/QQ 预约',
    others: [
      { title: '运动搭子匹配', note: '帮你找到一起动起来的人', status: '开发中' },
      { title: '健康打卡', note: '睡眠、喝水、走路的小记录', status: '开发中' }
    ],
    dialog: {
      title: '校园跑陪跑 · 预约说明',
      note: '预约方式：先看个人介绍里的微信或 QQ，加好友时备注“校园跑”，再和王同志约时间地点。',
      details: [
        '可约：校园跑 / 夜跑 / 慢跑',
        '时长：绕校园一圈起步，跑不动可以走',
        '集合点：双方在微信/QQ 里提前约定',
        '福利：恋爱故事、奶茶、吃饭看电影（他说的）'
      ],
      contactHint: '请先通过个人介绍里的联系方式联系，确认时间后再出门。',
      close: '先看看'
    }
  };

  var CREATOR = {
    kicker: '创作者王浩宇',
    title: '点我了解王浩宇',
    subtitle: 'why哥 · 湖南科技大学',
    quote: '一个还想继续写故事的人。',
    sectionNote: '点开以后会发生一点对话。放心，他不会咬人。',
    female: {
      addressPool: ['老妹', '女同志', '小姐姐'],
      earlyAddress: '老妹',
      laterAddress: '同学',
      opening: '呦~ 老妹，这么想了解我，会不会被我圈粉呀~！',
      options: [
        {
          label: '呃，正经点同志，信不信我把你发网上！',
          apology: '错了错了，同学，给你看看我的简介吧~'
        },
        {
          label: '行行行，先看看你有多正经。',
          apology: '咳，正经版王同志上线。同学，给你看看我的简介吧~'
        }
      ]
    },
    male: {
      opening: '呀！兄弟！这么想了解我，是不是崇拜我呀。',
      options: [
        {
          label: '王兄弟，别搞呀！',
          apology: '错了错了，给你看看我的简介吧~'
        }
      ]
    },
    autoReply: '这还差不多！',
    introReveal: '个人介绍',
    introNote: '补充：项目会持续定期更新。',
    introLead: [
      '王浩宇，来自江苏，是地信四班的心理委员。',
      '因为没什么本钱，所以现在我把想法落地做成网页，项目免费开放，慢慢开发。'
    ],
    introCards: [
      {
        id: 'about',
        title: '一、关于我',
        hint: '一个仍在长大的小孩',
        body: '虽然已经成年，但我仍然是个小孩，同样会难过，想用内容带给大家快乐。'
      },
      {
        id: 'making',
        title: '二、正在做的事',
        hint: '学习、备考，也在认真生活',
        body: '同时我也在持续学习，准备英语四级，进行大学课程的学习，寻找朋友，交女朋友。'
      },
      {
        id: 'words',
        title: '三、想对你说',
        hint: '接受自己，也继续向前',
        body: '生活不易，困难很多，就算是我也会痛苦。但咱们仍旧要奋勇向前，接纳自己，同时在生活里寻找生命的意义，奔赴精彩的人生。'
      }
    ],
    contact: {
      label: '联系方式',
      wechat: '18994223286',
      qq: '3541252557',
      phone: '18994223286',
      note: '仅用于项目交流，请勿用于其他用途。'
    },
    close: '下次再聊'
  };

  var MEET = {
    kicker: '线下约见',
    title: '线下约见',
    status: '可联系',
    description: '想线下聊聊、一起走走，可以先通过个人介绍里的联系方式联系王同志，约一个双方都方便的时间。',
    note: '不着急，先把想说的话想清楚；见不见面，都可以慢慢来。',
    details: [
      '约见方式：微信 / QQ 先联系',
      '地点：优先校内公共区域',
      '时间：双方提前确认',
      '说明：线下见面为普通交流，不提供心理咨询或诊疗'
    ],
    contactHint: '联系时请备注“线下约见”。如果只是想先聊聊，也可以留在网页里。'
  };

  var SUPPORT = {
    title: '如果此刻需要真人',
    intro: '如果情绪已经影响到吃饭、睡觉、学习或安全，请优先联系专业的人。你不需要先证明自己「够严重」才能求助。',
    hotlines: [
      {
        label: '全国心理援助热线',
        number: '12356',
        tel: '12356',
        note: '24 小时，服务开通情况以当地为准'
      },
      {
        label: '北京心理危机研究与干预中心',
        number: '010-82951332',
        tel: '01082951332',
        note: '24 小时危机干预热线'
      },
      {
        label: '希望 24 热线',
        number: '400-161-9995',
        tel: '4001619995',
        note: '24 小时心理援助热线'
      }
    ],
    emergency: [
      { label: '急救', number: '120', tel: '120' },
      { label: '报警', number: '110', tel: '110' }
    ],
    campus: {
      name: '湖南科技大学心理健康教育中心',
      note: '面向在校学生的心理咨询与支持。具体预约方式与服务时间以学校官网、学院通知为准。',
      url: 'https://xlzx.hnust.edu.cn/'
    },
    disclaimer: '热线与机构信息可能调整，请以官方发布为准。若你在境外，请拨打当地急救电话。'
  };

  var FOOTER = {
    line1: 'why哥的情绪陪伴屋 · 初版测试',
    line2: '这不是心理咨询，不能替代专业帮助。若有立即危险，请拨打 120 / 110。',
    credit: '由 why哥（湖科大 王浩宇）发起 · 所有对话与选择只留在你的浏览器'
  };

  window.WhygeData = {
    BRAND: BRAND,
    GENDERS: GENDERS,
    PERSONALITIES: PERSONALITIES,
    ONBOARDING: ONBOARDING,
    RUN: RUN,
    CREATOR: CREATOR,
    MEET: MEET,
    SUPPORT: SUPPORT,
    FOOTER: FOOTER
  };
})();

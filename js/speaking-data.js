(function () {
  'use strict';

  const categories = [
    {
      id: 'cn-tradition',
      name: '中国传统文化',
      subs: [
        { id: 'objects', name: '传统器物' },
        { id: 'food', name: '传统饮食' },
        { id: 'festivals', name: '传统节日' },
        { id: 'crafts', name: '传统技艺' },
        { id: 'thought', name: '古典思想' }
      ]
    },
    {
      id: 'minority',
      name: '中国少数民族文化',
      subs: [
        { id: 'festivals', name: '少数民族节日' },
        { id: 'folklore', name: '民族民俗' },
        { id: 'crafts', name: '民族手工艺' },
        { id: 'food', name: '民族特色饮食' }
      ]
    },
    {
      id: 'foreign',
      name: '外国人文风情',
      subs: [
        { id: 'festivals', name: '欧美传统节日' },
        { id: 'folklore', name: '异域民俗' },
        { id: 'architecture', name: '特色建筑' },
        { id: 'food', name: '异域饮食' },
        { id: 'customs', name: '海外地方习俗' }
      ]
    },
    {
      id: 'general',
      name: '四级通用口语短句',
      subs: [
        { id: 'campus', name: '校园日常' },
        { id: 'life', name: '生活交际' },
        { id: 'opinion', name: '观点表达' }
      ]
    }
  ];

  const sentences = [
    {
      id: 'mid-autumn',
      region: 'cn-tradition',
      sub: 'festivals',
      title: '中秋节',
      en: 'The Mid-Autumn Festival is a time for family reunion and moon-watching.',
      cn: '中秋节是阖家团圆、赏月的日子。',
      phoneticTips: [
        'time for 连读：/taɪm fə/，m 和 f 之间不要断开。',
        '末尾的 for 弱读为 /fə(r)/，不要读成很重的 /fɔːr/。'
      ],
      marks: [
        { range: 'time for', type: 'link' },
        { range: 'for', type: 'weak' }
      ],
      words: ['reunion', 'festival', 'moon-watching']
    },
    {
      id: 'torch-festival',
      region: 'minority',
      sub: 'festivals',
      title: '火把节',
      en: 'The Torch Festival is one of the most important festivals for the Yi people.',
      cn: '火把节是彝族最重要的节日之一。',
      phoneticTips: [
        'most 末尾的 t 失爆：只做口型，不要读出清晰的 /t/。',
        'one of 可以轻轻连读，语气放松一点。'
      ],
      marks: [
        { range: 'most', type: 'stop' },
        { range: 'one of', type: 'link' }
      ],
      words: ['torch', 'festival', 'important']
    },
    {
      id: 'halloween',
      region: 'foreign',
      sub: 'festivals',
      title: '万圣节',
      en: 'Children will dress up and ask for candies on Halloween.',
      cn: '孩子们会在万圣节装扮起来，讨要糖果。',
      phoneticTips: [
        'dress up 连读：/dres ʌp/，两个词之间不要停顿。',
        'for 在句中弱读，轻轻带过即可。'
      ],
      marks: [
        { range: 'dress up', type: 'link' },
        { range: 'for', type: 'weak' }
      ],
      words: ['candies', 'Halloween', 'dress']
    },
    {
      id: 'oral-english',
      region: 'general',
      sub: 'campus',
      title: '练习口语',
      en: 'I plan to spend more time practicing my oral English.',
      cn: '我打算花更多时间练习英语口语。',
      phoneticTips: [
        'spend 末尾的 d 失爆：只做口型，不要读得很重。',
        'practicing my 可以自然连读，my 不要拖长。'
      ],
      marks: [
        { range: 'spend', type: 'stop' },
        { range: 'practicing my', type: 'link' }
      ],
      words: ['oral', 'practicing', 'spend']
    },
    {
      id: 'dumplings',
      region: 'cn-tradition',
      sub: 'food',
      title: '饺子',
      en: 'Dumplings are usually shared by the whole family during the Spring Festival.',
      cn: '春节期间，饺子通常是一家人一起分享的。',
      phoneticTips: [
        'shared by 连读：/ʃeəd baɪ/，d 和 b 之间不要断开。',
        'the 在辅音前弱读为 /ðə/。'
      ],
      marks: [
        { range: 'shared by', type: 'link' },
        { range: 'the', type: 'weak' }
      ],
      words: ['dumplings', 'shared', 'usually']
    },
    {
      id: 'paper-cutting',
      region: 'cn-tradition',
      sub: 'crafts',
      title: '剪纸',
      en: 'Paper-cutting is a traditional art that has been passed down for generations.',
      cn: '剪纸是一门代代相传的传统艺术。',
      phoneticTips: [
        'has been 连读：/hæz bɪn/，不要拆成两个重读词。',
        'passed down 连读，down 轻轻收住。'
      ],
      marks: [
        { range: 'has been', type: 'link' },
        { range: 'passed down', type: 'link' },
        { range: 'for', type: 'weak' }
      ],
      words: ['paper-cutting', 'traditional', 'generations']
    },
    {
      id: 'embroidery',
      region: 'minority',
      sub: 'crafts',
      title: '民族刺绣',
      en: 'Many Yi women are skilled at embroidery and silver jewelry making.',
      cn: '许多彝族女性擅长刺绣和银饰制作。',
      phoneticTips: [
        'skilled at 连读：/skɪld æt/，d 和 æ 之间不要停。',
        'and 在句中弱读为 /ən/，不要读得太重。'
      ],
      marks: [
        { range: 'skilled at', type: 'link' },
        { range: 'and', type: 'weak' }
      ],
      words: ['embroidery', 'skilled', 'jewelry']
    },
    {
      id: 'gothic',
      region: 'foreign',
      sub: 'architecture',
      title: '哥特式建筑',
      en: 'Gothic cathedrals are famous for their tall towers and colored glass.',
      cn: '哥特式大教堂以高耸的塔楼和彩色玻璃闻名。',
      phoneticTips: [
        'famous for 连读：/ˈfeɪməs fə/，s 和 f 之间自然过渡。',
        'tall towers 连读，towers 的尾音不要拖。'
      ],
      marks: [
        { range: 'famous for', type: 'link' },
        { range: 'tall towers', type: 'link' }
      ],
      words: ['Gothic', 'cathedrals', 'towers']
    },
    {
      id: 'mediterranean',
      region: 'foreign',
      sub: 'food',
      title: '地中海饮食',
      en: 'The Mediterranean diet is rich in vegetables, fish and olive oil.',
      cn: '地中海饮食富含蔬菜、鱼类和橄榄油。',
      phoneticTips: [
        'rich in 连读：/rɪtʃ ɪn/，不要读成两个分开的词。',
        'olive oil 连读，oil 的尾音轻轻收住。'
      ],
      marks: [
        { range: 'rich in', type: 'link' },
        { range: 'olive oil', type: 'link' },
        { range: 'and', type: 'weak' }
      ],
      words: ['Mediterranean', 'diet', 'olive']
    },
    {
      id: 'learning-language',
      region: 'general',
      sub: 'opinion',
      title: '学习语言',
      en: 'In my opinion, learning a language opens a window to the world.',
      cn: '在我看来，学习一门语言会打开一扇看世界的窗。',
      phoneticTips: [
        'In my opinion 可以连贯地说，my 不要重读。',
        'window to 连读：/ˈwɪndəʊ tə/，to 弱读。'
      ],
      marks: [
        { range: 'In my opinion', type: 'link' },
        { range: 'window to', type: 'link' },
        { range: 'to', type: 'weak' }
      ],
      words: ['opinion', 'language', 'window']
    },
    {
      id: 'confucius',
      region: 'cn-tradition',
      sub: 'thought',
      title: '孔子',
      en: 'Confucius believed that learning and reflection should go hand in hand.',
      cn: '孔子认为，学习与思考应当相辅相成。',
      phoneticTips: [
        'hand in hand 连读：/hænd ɪn hænd/，三个词要连成一条线。',
        'should 在句中弱读为 /ʃəd/，不要读成 /ʃʊd/。'
      ],
      marks: [
        { range: 'hand in hand', type: 'link' },
        { range: 'should', type: 'weak' }
      ],
      words: ['Confucius', 'reflection', 'believed']
    },
    {
      id: 'language-lab',
      region: 'general',
      sub: 'campus',
      title: '语言实验室',
      en: 'Could you tell me where the language lab is?',
      cn: '你能告诉我语言实验室在哪里吗？',
      phoneticTips: [
        'Could you 连读：/kʊdʒuː/，d 和 y 之间自然过渡。',
        'tell me 连读，where the 弱读。'
      ],
      marks: [
        { range: 'Could you', type: 'link' },
        { range: 'tell me', type: 'link' },
        { range: 'where the', type: 'weak' }
      ],
      words: ['language', 'lab', 'where']
    },
    {
      id: 'dai-water',
      region: 'minority',
      sub: 'folklore',
      title: '傣族泼水节',
      en: 'The Dai people celebrate the water festival with gentle splashes.',
      cn: '傣族人民用轻柔的泼水庆祝泼水节。',
      phoneticTips: [
        'water 在美音里常读成轻快的闪音，接近 d 的浊化感觉。',
        'with gentle 连读，splashes 的尾音不要拖长。'
      ],
      marks: [
        { range: 'water', type: 'voiced' },
        { range: 'with gentle', type: 'link' }
      ],
      words: ['Dai', 'celebrate', 'splashes']
    },
    {
      id: 'porcelain',
      region: 'cn-tradition',
      sub: 'objects',
      title: '瓷器与丝路',
      en: 'Chinese porcelain was once carried along the ancient Silk Road.',
      cn: '中国瓷器曾沿着古老的丝绸之路被运送出去。',
      phoneticTips: [
        'carried along 连读：/ˈkærid əˈlɒŋ/，d 和 a 之间不要断开。',
        'was 在句中弱读，轻轻带过。'
      ],
      marks: [
        { range: 'carried along', type: 'link' },
        { range: 'was', type: 'weak' }
      ],
      words: ['porcelain', 'ancient', 'silk']
    },
    {
      id: 'mongolian-hot-pot',
      region: 'minority',
      sub: 'food',
      title: '蒙古族火锅',
      en: 'Mongolian hot pot is often shared with family in cold winter.',
      cn: '蒙古族火锅常常是一家人围坐分享的冬日食物。',
      phoneticTips: [
        'hot pot 连读：/hɒt pɒt/，t 和 p 之间不要断开。',
        'with 在句中弱读，不要读得太重。'
      ],
      marks: [
        { range: 'hot pot', type: 'link' },
        { range: 'with', type: 'weak' }
      ],
      words: ['Mongolian', 'hot pot', 'winter']
    },
    {
      id: 'brazil-carnival',
      region: 'foreign',
      sub: 'folklore',
      title: '巴西狂欢节',
      en: 'In Brazil, people celebrate the carnival with music and dancing.',
      cn: '在巴西，人们用音乐和舞蹈庆祝狂欢节。',
      phoneticTips: [
        'with music 连读：/wɪð ˈmjuːzɪk/，不要拆开。',
        'and 在句中弱读为 /ən/。'
      ],
      marks: [
        { range: 'with music', type: 'link' },
        { range: 'and', type: 'weak' }
      ],
      words: ['Brazil', 'carnival', 'dancing']
    },
    {
      id: 'shoes-custom',
      region: 'foreign',
      sub: 'customs',
      title: '进门脱鞋',
      en: 'In some countries, people take off their shoes before entering a home.',
      cn: '在一些国家，人们进门前会脱鞋。',
      phoneticTips: [
        'take off 连读：/teɪk ɒf/，两个词之间不要停顿。',
        'before 在句中弱读，重音放在 entering 上。'
      ],
      marks: [
        { range: 'take off', type: 'link' },
        { range: 'before', type: 'weak' }
      ],
      words: ['countries', 'take off', 'entering']
    },
    {
      id: 'coffee-after-class',
      region: 'general',
      sub: 'life',
      title: '课后喝杯咖啡',
      en: 'Would you like to grab a coffee with me after class?',
      cn: '下课后要不要一起去喝杯咖啡？',
      phoneticTips: [
        'Would you 连读：/wʊdʒuː/，d 和 y 自然过渡。',
        'grab a 连读，after 弱读，语气轻松一点。'
      ],
      marks: [
        { range: 'Would you', type: 'link' },
        { range: 'grab a', type: 'link' },
        { range: 'after', type: 'weak' }
      ],
      words: ['grab', 'coffee', 'class']
    }
  ];

  const lexicon = {
    the: ['/ðə/', 'art.', '这；那（定冠词）'],
    'mid-autumn': ['/ˌmɪd ˈɔːtəm/', 'n.', '中秋'],
    festival: ['/ˈfestɪvl/', 'n.', '节日'],
    is: ['/ɪz/', 'v.', '是'],
    a: ['/ə/', 'art.', '一个'],
    time: ['/taɪm/', 'n.', '时间'],
    for: ['/fə(r)/', 'prep.', '为了；对于'],
    family: ['/ˈfæməli/', 'n.', '家庭；家人'],
    reunion: ['/ˌriːˈjuːniən/', 'n.', '团聚，重聚'],
    and: ['/ənd/', 'conj.', '和；而且'],
    'moon-watching': ['/ˈmuːn wɒtʃɪŋ/', 'n.', '赏月'],
    torch: ['/tɔːtʃ/', 'n.', '火把；火炬'],
    one: ['/wʌn/', 'num.', '一个'],
    of: ['/əv/', 'prep.', '……的'],
    most: ['/məʊst/', 'adv.', '最；非常'],
    important: ['/ɪmˈpɔːtnt/', 'adj.', '重要的'],
    festivals: ['/ˈfestɪvlz/', 'n.', '节日（复数）'],
    yi: ['/jiː/', 'n.', '彝族'],
    people: ['/ˈpiːpl/', 'n.', '人们；民族'],
    children: ['/ˈtʃɪldrən/', 'n.', '孩子们'],
    will: ['/wɪl/', 'modal v.', '将会'],
    dress: ['/dres/', 'v.', '装扮；穿衣'],
    up: ['/ʌp/', 'adv.', '向上；起来'],
    ask: ['/ɑːsk/', 'v.', '询问；请求'],
    candies: ['/ˈkændiz/', 'n.', '糖果（复数）'],
    on: ['/ɒn/', 'prep.', '在……时候'],
    halloween: ['/ˌhæləˈwiːn/', 'n.', '万圣节'],
    i: ['/aɪ/', 'pron.', '我'],
    plan: ['/plæn/', 'v.', '计划'],
    to: ['/tə/', 'prep.', '到；向（弱读）'],
    spend: ['/spend/', 'v.', '花费'],
    more: ['/mɔː(r)/', 'adv.', '更多'],
    practicing: ['/ˈpræktɪsɪŋ/', 'v.', '练习（现在分词）'],
    my: ['/maɪ/', 'pron.', '我的'],
    oral: ['/ˈɔːrəl/', 'adj.', '口头的，口语的'],
    english: ['/ˈɪŋɡlɪʃ/', 'n.', '英语'],
    dumplings: ['/ˈdʌmplɪŋz/', 'n.', '饺子（复数）'],
    are: ['/ɑː(r)/', 'v.', '是（复数）'],
    usually: ['/ˈjuːʒuəli/', 'adv.', '通常'],
    shared: ['/ʃeəd/', 'v.', '分享（过去分词）'],
    by: ['/baɪ/', 'prep.', '被；由'],
    whole: ['/həʊl/', 'adj.', '整个的'],
    during: ['/ˈdjʊərɪŋ/', 'prep.', '在……期间'],
    spring: ['/sprɪŋ/', 'n.', '春天'],
    'paper-cutting': ['/ˈpeɪpə ˈkʌtɪŋ/', 'n.', '剪纸'],
    traditional: ['/trəˈdɪʃənl/', 'adj.', '传统的'],
    art: ['/ɑːt/', 'n.', '艺术'],
    that: ['/ðæt/', 'pron.', '那个；引导从句'],
    has: ['/hæz/', 'v.', '有（第三人称单数）'],
    been: ['/biːn/', 'v.', 'be 的过去分词'],
    passed: ['/pɑːst/', 'v.', '传递（过去分词）'],
    down: ['/daʊn/', 'adv.', '向下'],
    generations: ['/ˌdʒenəˈreɪʃnz/', 'n.', '一代代人'],
    many: ['/ˈmeni/', 'adj.', '许多'],
    women: ['/ˈwɪmɪn/', 'n.', '女性（复数）'],
    skilled: ['/skɪld/', 'adj.', '熟练的'],
    at: ['/ət/', 'prep.', '在；擅长于'],
    embroidery: ['/ɪmˈbrɔɪdəri/', 'n.', '刺绣'],
    silver: ['/ˈsɪlvə(r)/', 'n.', '银'],
    jewelry: ['/ˈdʒuːəlri/', 'n.', '珠宝；首饰'],
    making: ['/ˈmeɪkɪŋ/', 'n.', '制作'],
    gothic: ['/ˈɡɒθɪk/', 'adj.', '哥特式的'],
    cathedrals: ['/kəˈθiːdrəlz/', 'n.', '大教堂（复数）'],
    famous: ['/ˈfeɪməs/', 'adj.', '著名的'],
    their: ['/ðeə(r)/', 'pron.', '他们的'],
    tall: ['/tɔːl/', 'adj.', '高的'],
    towers: ['/ˈtaʊəz/', 'n.', '塔楼（复数）'],
    colored: ['/ˈkʌləd/', 'adj.', '彩色的'],
    glass: ['/ɡlɑːs/', 'n.', '玻璃'],
    mediterranean: ['/ˌmedɪtəˈreɪniən/', 'adj.', '地中海的'],
    diet: ['/ˈdaɪət/', 'n.', '饮食'],
    rich: ['/rɪtʃ/', 'adj.', '丰富的'],
    in: ['/ɪn/', 'prep.', '在……里'],
    vegetables: ['/ˈvedʒtəblz/', 'n.', '蔬菜（复数）'],
    fish: ['/fɪʃ/', 'n.', '鱼'],
    olive: ['/ˈɒlɪv/', 'n.', '橄榄'],
    oil: ['/ɔɪl/', 'n.', '油'],
    opinion: ['/əˈpɪnjən/', 'n.', '观点'],
    learning: ['/ˈlɜːnɪŋ/', 'n.', '学习'],
    language: ['/ˈlæŋɡwɪdʒ/', 'n.', '语言'],
    opens: ['/ˈəʊpənz/', 'v.', '打开（第三人称单数）'],
    window: ['/ˈwɪndəʊ/', 'n.', '窗户'],
    world: ['/wɜːld/', 'n.', '世界'],
    confucius: ['/kənˈfjuːʃəs/', 'n.', '孔子'],
    believed: ['/bɪˈliːvd/', 'v.', '认为（过去式）'],
    reflection: ['/rɪˈflekʃn/', 'n.', '思考；反思'],
    should: ['/ʃəd/', 'modal v.', '应该（弱读）'],
    go: ['/ɡəʊ/', 'v.', '去；进行'],
    hand: ['/hænd/', 'n.', '手'],
    could: ['/kəd/', 'modal v.', '能够（弱读）'],
    you: ['/juː/', 'pron.', '你'],
    tell: ['/tel/', 'v.', '告诉'],
    me: ['/miː/', 'pron.', '我'],
    where: ['/weə(r)/', 'adv.', '在哪里'],
    lab: ['/læb/', 'n.', '实验室'],
    dai: ['/daɪ/', 'n.', '傣族'],
    celebrate: ['/ˈselɪbreɪt/', 'v.', '庆祝'],
    water: ['/ˈwɔːtə(r)/', 'n.', '水'],
    with: ['/wɪð/', 'prep.', '用；和'],
    gentle: ['/ˈdʒentl/', 'adj.', '轻柔的'],
    splashes: ['/ˈsplæʃɪz/', 'n.', '泼水；水花'],
    chinese: ['/ˌtʃaɪˈniːz/', 'adj.', '中国的'],
    porcelain: ['/ˈpɔːsəlɪn/', 'n.', '瓷器'],
    was: ['/wɒz/', 'v.', '是（过去式）'],
    carried: ['/ˈkærid/', 'v.', '运送（过去式）'],
    along: ['/əˈlɒŋ/', 'prep.', '沿着'],
    ancient: ['/ˈeɪnʃənt/', 'adj.', '古老的'],
    silk: ['/sɪlk/', 'n.', '丝绸'],
    road: ['/rəʊd/', 'n.', '道路'],
    once: ['/wʌns/', 'adv.', '曾经；一次'],
    mongolian: ['/mɒŋˈɡəʊliən/', 'adj.', '蒙古族的'],
    hot: ['/hɒt/', 'adj.', '热的'],
    pot: ['/pɒt/', 'n.', '锅'],
    often: ['/ˈɒfn/', 'adv.', '经常'],
    cold: ['/kəʊld/', 'adj.', '寒冷的'],
    winter: ['/ˈwɪntə(r)/', 'n.', '冬天'],
    brazil: ['/brəˈzɪl/', 'n.', '巴西'],
    carnival: ['/ˈkɑːnɪvl/', 'n.', '狂欢节'],
    music: ['/ˈmjuːzɪk/', 'n.', '音乐'],
    dancing: ['/ˈdɑːnsɪŋ/', 'n.', '舞蹈'],
    some: ['/sʌm/', 'det.', '一些'],
    countries: ['/ˈkʌntriz/', 'n.', '国家（复数）'],
    take: ['/teɪk/', 'v.', '拿；带'],
    off: ['/ɒf/', 'adv.', '脱下；离开'],
    shoes: ['/ʃuːz/', 'n.', '鞋子（复数）'],
    before: ['/bɪˈfɔː(r)/', 'prep.', '在……之前'],
    entering: ['/ˈentərɪŋ/', 'v.', '进入（现在分词）'],
    home: ['/həʊm/', 'n.', '家'],
    would: ['/wʊd/', 'modal v.', '愿意；会'],
    like: ['/laɪk/', 'v.', '想要；喜欢'],
    grab: ['/ɡræb/', 'v.', '拿；去喝（口语）'],
    coffee: ['/ˈkɒfi/', 'n.', '咖啡'],
    after: ['/ˈɑːftə(r)/', 'prep.', '在……之后'],
    class: ['/klɑːs/', 'n.', '课；班级'],
    'hot pot': ['/ˌhɒt ˈpɒt/', 'n.', '火锅'],
    'take off': ['/ˌteɪk ˈɒf/', 'phr.', '脱下']
  };

  window.WhygeSpeakingData = {
    categories: categories,
    sentences: sentences,
    lexicon: lexicon
  };
})();

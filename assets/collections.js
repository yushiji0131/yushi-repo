// Editorial notes per collection. Written for this site; specs are the
// commonly published ones for the current generation of each line.

export const COLLECTIONS = [
  {
    id: 'submariner', name: 'Submariner', zh: '潜航者型', match: /^submariner/i,
    tagline: '1953 年问世的潜水表原型，劳力士最具辨识度的运动款。',
    specs: { 表径: '41 mm（现行）', 机芯: '3230 / 3235', 动力储存: '约 70 小时', 防水: '300 米' },
    review: '现行 41 mm 表壳比上一代更修长，表耳收窄后上手比数字更显小。3235 机芯的走时与动储是同价位的标杆，Glidelock 微调表扣是日常佩戴最实用的设计。',
    pros: ['保值稳定，流通量大，买卖都容易', '做工、夜光、表扣微调都很成熟', '无历与日历、钢款与金款选择完整'],
    cons: ['专柜几乎都要排队', '热门款二手价长期高于公价', '撞表率很高'],
  },
  {
    id: 'daytona', name: 'Cosmograph Daytona', zh: '宇宙计型迪通拿', match: /^daytona/i,
    tagline: '为赛车而生的计时码表，劳力士最难买到的系列之一。',
    specs: { 表径: '40 mm', 机芯: '4131（现行）/ 4130', 动力储存: '约 72 小时', 防水: '100 米' },
    review: '2023 年换代后改用 4131 机芯，表圈加了金属包边，表盘比例更精致。40 mm 加上不到 12 mm 的厚度，在自动计时表里算很好戴。钢款“熊猫盘”溢价最高。',
    pros: ['自产计时机芯，可靠性口碑极好', '尺寸克制，正装休闲都合适', '历代款式都有稳定的收藏市场'],
    cons: ['钢款公价基本买不到', '二手溢价是全系最高', '没有日历'],
  },
  {
    id: 'gmt', name: 'GMT-Master II', zh: '格林尼治型 II', match: /^gmt-master/i,
    tagline: '双色陶瓷圈的两地时腕表，昵称最多的系列。',
    specs: { 表径: '40 mm', 机芯: '3285', 动力储存: '约 70 小时', 防水: '100 米' },
    review: '可独立调校的时针让换时区不用停秒，是真正实用的旅行功能。配色决定价格：Pepsi、Batman、Sprite 各有拥趸，五珠链带偏正装，三珠链带更运动。',
    pros: ['两地时功能实用', '配色与链带组合丰富', '佩戴舒适，厚度适中'],
    cons: ['热门配色溢价高且波动大', '红蓝圈配货难度高'],
  },
  {
    id: 'datejust', name: 'Datejust', zh: '日志型', match: /^(lady[- ])?datejust|^date$|^oysterdate/i,
    tagline: '1945 年至今的经典日历表，组合最多、最百搭。',
    specs: { 表径: '28 / 31 / 36 / 41 mm', 机芯: '3235 / 2236', 动力储存: '约 70 / 55 小时', 防水: '100 米' },
    review: '表圈（光圈或三角坑纹）、链带（三珠或五珠）、表盘的组合几乎无穷，是最容易按公价买到的劳力士。36 mm 是最经典的比例，41 mm 更现代。老款五位数型号是入门二手的高性价比选择。',
    pros: ['选择多，较容易买到', '正装休闲通吃', '老款二手价格友好'],
    cons: ['大多数配置保值不如运动款', '型号繁多，挑选需要做功课'],
  },
  {
    id: 'daydate', name: 'Day-Date', zh: '星期日历型', match: /^day-date/i,
    tagline: '只用贵金属制作的“总统表”，表盘上同时显示星期与日期。',
    specs: { 表径: '36 / 40 mm', 机芯: '3255', 动力储存: '约 70 小时', 防水: '100 米' },
    review: '全金或铂金表壳配元首链带，分量感和光泽是钢款无法替代的。36 mm 更传统，40 mm 更有存在感。老款 18038、18238 是进入金表世界的常见起点。',
    pros: ['贵金属质感与辨识度', '星期盘有多种语言可选', '老款选择丰富'],
    cons: ['价格高，受金价影响明显', '金表易留划痕，日常需爱惜'],
  },
  {
    id: 'explorer', name: 'Explorer / Explorer II', zh: '探险家型', match: /^explorer/i,
    tagline: '源自登山探险的工具表，低调耐用。',
    specs: { 表径: '36 / 40 mm（I），42 mm（II）', 机芯: '3230 / 3285', 动力储存: '约 70 小时', 防水: '100 米' },
    review: '探一的 3-6-9 表盘是劳力士最纯粹的设计之一；探二多了固定 24 小时圈与橙色指针，白盘 Polar 尤其受欢迎。两者都是相对容易入手、溢价温和的运动款。',
    pros: ['低调不张扬', '溢价低，接近公价', '可读性好'],
    cons: ['外观朴素，辨识度不如潜水款', '探二 42 mm 对细手腕偏大'],
  },
  {
    id: 'seadweller', name: 'Sea-Dweller / Deepsea', zh: '海使型', match: /^sea-dweller|^deepsea/i,
    tagline: '带排氦阀的专业深潜表，比潜航者更厚更硬核。',
    specs: { 表径: '43 / 44 mm', 机芯: '3235', 动力储存: '约 70 小时', 防水: '1,220 / 3,900 米' },
    review: '更大的尺寸和厚度带来明显的重量感，适合喜欢工具感的人。Deepsea 的 D-Blue 渐变盘很有特色。二手价格通常比潜航者理性。',
    pros: ['防水规格远超日常所需', '比潜航者更容易买到', '二手价格相对理性'],
    cons: ['厚重，衬衫袖口不友好', '日常佩戴存在感过强'],
  },
  {
    id: 'skydweller', name: 'Sky-Dweller', zh: '纵航者型', match: /^sky-dweller/i,
    tagline: '年历加两地时，劳力士功能最复杂的量产表。',
    specs: { 表径: '42 mm', 机芯: '9002', 动力储存: '约 72 小时', 防水: '100 米' },
    review: 'Ring Command 表圈配合表冠调校，年历每年只需在三月初调一次。偏心 24 小时盘很有辨识度。钢款（白金圈）蓝盘最热门。',
    pros: ['年历与两地时都很实用', '调校方式巧妙', '做工扎实'],
    cons: ['42 mm 且偏厚', '钢款配货不易'],
  },
  {
    id: 'yachtmaster', name: 'Yacht-Master', zh: '游艇名仕型', match: /^yacht-master/i,
    tagline: '偏奢华取向的航海运动表，多用贵金属与 Oysterflex 表带。',
    specs: { 表径: '37 / 40 / 42 mm', 机芯: '3235 / 2236', 动力储存: '约 70 小时', 防水: '100 米' },
    review: '双向旋转的浮雕表圈手感细腻，铂金圈配灰盘的 126622 是系列代表。Oysterflex 橡胶表带款佩戴舒适度极高。Yacht-Master II 带帆船倒计时功能，44 mm 体量很大。',
    pros: ['质感精致，不那么常见', 'Oysterflex 表带舒适', '溢价温和'],
    cons: ['喷砂铂金圈较易留痕', '保值略逊潜航者'],
  },
  {
    id: 'op', name: 'Oyster Perpetual', zh: '蚝式恒动型', match: /^oyster perpetual|^oyster precision|^speedking|^chronometer/i,
    tagline: '最纯粹的三针蚝式表，劳力士的入门系列。',
    specs: { 表径: '28 / 31 / 34 / 36 / 41 mm', 机芯: '3230 / 2232', 动力储存: '约 70 / 55 小时', 防水: '100 米' },
    review: '没有日历、没有外圈刻度，只有干净的表盘。2020 年推出的彩色盘曾引发热潮。机芯与更贵的系列同级，是用最低预算体验现代劳力士的方式。',
    pros: ['公价最低', '机芯规格不缩水', '尺寸覆盖全面'],
    cons: ['热门盘色同样难买', '功能单一'],
  },
  {
    id: 'airking', name: 'Air-King', zh: '空中霸王型', match: /^air-king/i,
    tagline: '向航空致敬的 40 mm 钢表，表盘设计独树一帜。',
    specs: { 表径: '40 mm', 机芯: '3230', 动力储存: '约 70 小时', 防水: '100 米' },
    review: '大号 3-6-9 配分钟刻度的表盘风格鲜明，喜欢的人很喜欢。2022 年换代后加了护肩和夜光数字，佩戴感接近探险家。',
    pros: ['设计有个性', '较易买到，溢价低'],
    cons: ['表盘风格比较挑人'],
  },
  {
    id: 'milgauss', name: 'Milgauss', zh: '格磁型', match: /^milgauss/i,
    tagline: '为科研人员设计的防磁表，闪电秒针是标志，已于 2023 年停产。',
    specs: { 表径: '40 mm', 机芯: '3131', 动力储存: '约 48 小时', 防水: '100 米' },
    review: '绿色蓝宝石镜面的 116400GV 是劳力士少有的趣味设计。停产后价格稳定，是有故事又不算贵的选择。',
    pros: ['设计独特', '已停产，有收藏话题'],
    cons: ['机芯为上一代，动储较短', '偏厚'],
  },
  {
    id: 'landdweller', name: 'Land-Dweller', zh: 'Land-Dweller', match: /^land-dweller/i,
    tagline: '2025 年发布的一体式链带新系列，搭载全新高频机芯。',
    specs: { 表径: '36 / 40 mm', 机芯: '7135', 动力储存: '约 66 小时', 防水: '100 米' },
    review: '蜂窝纹表盘与一体式链带是全新的设计语言，7135 机芯采用新型擒纵结构与 5 Hz 振频，是近年劳力士技术含量最高的新品。上市时间短，行情仍在形成。',
    pros: ['全新机芯与设计', '透底可观赏机芯'],
    cons: ['上市不久，溢价高且不稳定', '在售数量少'],
  },
  {
    id: 'dress', name: '1908 / Cellini', zh: '正装系列', match: /^1908|^cellini/i,
    tagline: '劳力士的正装表：现行 1908 与已停产的切利尼。',
    specs: { 表径: '39 mm', 机芯: '7140（1908）', 动力储存: '约 66 小时', 防水: '50 米' },
    review: '1908 采用透底与小秒针布局，是劳力士少见的纤薄正装表。切利尼系列停产后在二手市场价格亲民，适合想要一枚金壳正装表的人。',
    pros: ['纤薄优雅', '切利尼二手性价比高'],
    cons: ['流通量小', '保值不如运动款'],
  },
];

export const OTHER = {
  id: 'other', name: '其他', zh: '其他型号', match: /.*/,
  tagline: '较少见或古董型号。', specs: {}, review: '', pros: [], cons: [],
};

export const collectionOf = (family) => COLLECTIONS.find((c) => c.match.test(family || '')) || OTHER;

export const MATERIAL_ZH = {
  'Stainless Steel': '精钢', 'Two Tone': '间金', 'Yellow Gold': '黄金', 'White Gold': '白金',
  'Rose Gold': '玫瑰金', Platinum: '铂金', Titanium: '钛金属',
};

export const DIAL_ZH = {
  Black: '黑', Blue: '蓝', White: '白', Silver: '银', Champagne: '香槟', Green: '绿', Grey: '灰', Gray: '灰',
  Slate: '石板灰', Pink: '粉', Brown: '棕', Chocolate: '巧克力', 'Mother of Pearl': '珍珠贝母', Red: '红',
  Ivory: '象牙白', Salmon: '三文鱼', Purple: '紫', Yellow: '黄', Turquoise: '松石蓝', Meteorite: '陨石',
};

// Markets shown in the worldwide table. `path` is the rolex.com locale.
export const MARKETS = [
  { code: 'US', zh: '美国', cur: 'USD', path: 'en-us' },
  { code: 'CN', zh: '中国大陆', cur: 'CNY', path: 'zh-hans' },
  { code: 'HK', zh: '中国香港', cur: 'HKD', path: 'zh-hant' },
  { code: 'JP', zh: '日本', cur: 'JPY', path: 'ja' },
  { code: 'CH', zh: '瑞士', cur: 'CHF', path: 'fr' },
  { code: 'EU', zh: '欧元区', cur: 'EUR', path: 'de' },
  { code: 'UK', zh: '英国', cur: 'GBP', path: 'en-gb' },
  { code: 'SG', zh: '新加坡', cur: 'SGD', path: 'en' },
  { code: 'AU', zh: '澳大利亚', cur: 'AUD', path: 'en' },
  { code: 'CA', zh: '加拿大', cur: 'CAD', path: 'en' },
  { code: 'KR', zh: '韩国', cur: 'KRW', path: 'ko' },
];

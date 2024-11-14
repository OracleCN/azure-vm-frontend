// types.ts
export interface CountryInfo {
  name: string
  localName: string
}

export type CountryCode = keyof typeof COUNTRY_CODES

export type Region = keyof typeof REGIONS

// constants.ts
export const COUNTRY_CODES = {
  ac: { name: "Ascension Island", localName: "阿森松岛" },
  ad: { name: "Andorra", localName: "安道尔" },
  ae: { name: "United Arab Emirates", localName: "阿联酋" },
  af: { name: "Afghanistan", localName: "阿富汗" },
  ag: { name: "Antigua and Barbuda", localName: "安提瓜和巴布达" },
  ai: { name: "Anguilla", localName: "安圭拉" },
  al: { name: "Albania", localName: "阿尔巴尼亚" },
  am: { name: "Armenia", localName: "亚美尼亚" },
  ao: { name: "Angola", localName: "安哥拉" },
  aq: { name: "Antarctica", localName: "南极洲" },
  ar: { name: "Argentina", localName: "阿根廷" },
  as: { name: "American Samoa", localName: "美属萨摩亚" },
  at: { name: "Austria", localName: "奥地利" },
  au: { name: "Australia", localName: "澳大利亚" },
  aw: { name: "Aruba", localName: "阿鲁巴" },
  ax: { name: "Åland Islands", localName: "奥兰群岛" },
  az: { name: "Azerbaijan", localName: "阿塞拜疆" },
  ba: { name: "Bosnia and Herzegovina", localName: "波斯尼亚和黑塞哥维那" },
  bb: { name: "Barbados", localName: "巴巴多斯" },
  bd: { name: "Bangladesh", localName: "孟加拉国" },
  be: { name: "Belgium", localName: "比利时" },
  bf: { name: "Burkina Faso", localName: "布基纳法索" },
  bg: { name: "Bulgaria", localName: "保加利亚" },
  bh: { name: "Bahrain", localName: "巴林" },
  bi: { name: "Burundi", localName: "布隆迪" },
  bj: { name: "Benin", localName: "贝宁" },
  bl: { name: "Saint Barthélemy", localName: "圣巴泰勒米" },
  bm: { name: "Bermuda", localName: "百慕大" },
  bn: { name: "Brunei", localName: "文莱" },
  bo: { name: "Bolivia", localName: "玻利维亚" },
  bq: { name: "Caribbean Netherlands", localName: "荷兰加勒比区" },
  br: { name: "Brazil", localName: "巴西" },
  bs: { name: "Bahamas", localName: "巴哈马" },
  bt: { name: "Bhutan", localName: "不丹" },
  bw: { name: "Botswana", localName: "博茨瓦纳" },
  by: { name: "Belarus", localName: "白俄罗斯" },
  bz: { name: "Belize", localName: "伯利兹" },
  ca: { name: "Canada", localName: "加拿大" },
  cc: { name: "Cocos (Keeling) Islands", localName: "科科斯（基林）群岛" },
  cd: { name: "Congo (DRC)", localName: "刚果民主共和国" },
  cf: { name: "Central African Republic", localName: "中非共和国" },
  cg: { name: "Congo (Republic)", localName: "刚果共和国" },
  ch: { name: "Switzerland", localName: "瑞士" },
  ci: { name: "Côte d'Ivoire", localName: "科特迪瓦" },
  ck: { name: "Cook Islands", localName: "库克群岛" },
  cl: { name: "Chile", localName: "智利" },
  cm: { name: "Cameroon", localName: "喀麦隆" },
  cn: { name: "China", localName: "中国" },
  co: { name: "Colombia", localName: "哥伦比亚" },
  cr: { name: "Costa Rica", localName: "哥斯达黎加" },
  cu: { name: "Cuba", localName: "古巴" },
  cv: { name: "Cape Verde", localName: "佛得角" },
  cw: { name: "Curaçao", localName: "库拉索" },
  cx: { name: "Christmas Island", localName: "圣诞岛" },
  cy: { name: "Cyprus", localName: "塞浦路斯" },
  cz: { name: "Czech Republic", localName: "捷克共和国" },
  de: { name: "Germany", localName: "德国" },
  dj: { name: "Djibouti", localName: "吉布提" },
  dk: { name: "Denmark", localName: "丹麦" },
  dm: { name: "Dominica", localName: "多米尼克" },
  do: { name: "Dominican Republic", localName: "多米尼加共和国" },
  dz: { name: "Algeria", localName: "阿尔及利亚" },
  ec: { name: "Ecuador", localName: "厄瓜多尔" },
  ee: { name: "Estonia", localName: "爱沙尼亚" },
  eg: { name: "Egypt", localName: "埃及" },
  eh: { name: "Western Sahara", localName: "西撒哈拉" },
  er: { name: "Eritrea", localName: "厄立特里亚" },
  es: { name: "Spain", localName: "西班牙" },
  et: { name: "Ethiopia", localName: "埃塞俄比亚" },
  eu: { name: "European Union", localName: "欧盟" },
  fi: { name: "Finland", localName: "芬兰" },
  fj: { name: "Fiji", localName: "斐济" },
  fk: { name: "Falkland Islands", localName: "福克兰群岛" },
  fm: { name: "Micronesia", localName: "密克罗尼西亚" },
  fo: { name: "Faroe Islands", localName: "法罗群岛" },
  fr: { name: "France", localName: "法国" },
  ga: { name: "Gabon", localName: "加蓬" },
  gb: { name: "United Kingdom", localName: "英国" },
  "gb-eng": { name: "England", localName: "英格兰" },
  "gb-sct": { name: "Scotland", localName: "苏格兰" },
  "gb-wls": { name: "Wales", localName: "威尔士" },
  gd: { name: "Grenada", localName: "格林纳达" },
  ge: { name: "Georgia", localName: "格鲁吉亚" },
  gf: { name: "French Guiana", localName: "法属圭亚那" },
  gg: { name: "Guernsey", localName: "根西岛" },
  gh: { name: "Ghana", localName: "加纳" },
  gi: { name: "Gibraltar", localName: "直布罗陀" },
  gl: { name: "Greenland", localName: "格陵兰" },
  gm: { name: "Gambia", localName: "冈比亚" },
  gn: { name: "Guinea", localName: "几内亚" },
  gp: { name: "Guadeloupe", localName: "瓜德罗普" },
  gq: { name: "Equatorial Guinea", localName: "赤道几内亚" },
  gr: { name: "Greece", localName: "希腊" },
  gs: { name: "South Georgia", localName: "南乔治亚岛" },
  gt: { name: "Guatemala", localName: "危地马拉" },
  gu: { name: "Guam", localName: "关岛" },
  gw: { name: "Guinea-Bissau", localName: "几内亚比绍" },
  gy: { name: "Guyana", localName: "圭亚那" },
  hk: { name: "Hong Kong", localName: "香港" },
  hn: { name: "Honduras", localName: "洪都拉斯" },
  hr: { name: "Croatia", localName: "克罗地亚" },
  ht: { name: "Haiti", localName: "海地" },
  hu: { name: "Hungary", localName: "匈牙利" },
  ic: { name: "Canary Islands", localName: "加那利群岛" },
  id: { name: "Indonesia", localName: "印度尼西亚" },
  ie: { name: "Ireland", localName: "爱尔兰" },
  il: { name: "Israel", localName: "以色列" },
  im: { name: "Isle of Man", localName: "马恩岛" },
  in: { name: "India", localName: "印度" },
  io: { name: "British Indian Ocean Territory", localName: "英属印度洋领地" },
  iq: { name: "Iraq", localName: "伊拉克" },
  ir: { name: "Iran", localName: "伊朗" },
  is: { name: "Iceland", localName: "冰岛" },
  it: { name: "Italy", localName: "意大利" },
  je: { name: "Jersey", localName: "泽西岛" },
  jm: { name: "Jamaica", localName: "牙买加" },
  jo: { name: "Jordan", localName: "约旦" },
  jp: { name: "Japan", localName: "日本" },
  ke: { name: "Kenya", localName: "肯尼亚" },
  kg: { name: "Kyrgyzstan", localName: "吉尔吉斯斯坦" },
  kh: { name: "Cambodia", localName: "柬埔寨" },
  ki: { name: "Kiribati", localName: "基里巴斯" },
  km: { name: "Comoros", localName: "科摩罗" },
  kn: { name: "Saint Kitts and Nevis", localName: "圣基茨和尼维斯" },
  kp: { name: "North Korea", localName: "朝鲜" },
  kr: { name: "South Korea", localName: "韩国" },
  kw: { name: "Kuwait", localName: "科威特" },
  ky: { name: "Cayman Islands", localName: "开曼群岛" },
  kz: { name: "Kazakhstan", localName: "哈萨克斯坦" },
  la: { name: "Laos", localName: "老挝" },
  lb: { name: "Lebanon", localName: "黎巴嫩" },
  lc: { name: "Saint Lucia", localName: "圣卢西亚" },
  li: { name: "Liechtenstein", localName: "列支敦士登" },
  lk: { name: "Sri Lanka", localName: "斯里兰卡" },
  lr: { name: "Liberia", localName: "利比里亚" },
  ls: { name: "Lesotho", localName: "莱索托" },
  lt: { name: "Lithuania", localName: "立陶宛" },
  lu: { name: "Luxembourg", localName: "卢森堡" },
  lv: { name: "Latvia", localName: "拉脱维亚" },
  ly: { name: "Libya", localName: "利比亚" },
  ma: { name: "Morocco", localName: "摩洛哥" },
  mc: { name: "Monaco", localName: "摩纳哥" },
  md: { name: "Moldova", localName: "摩尔多瓦" },
  me: { name: "Montenegro", localName: "黑山" },
  mg: { name: "Madagascar", localName: "马达加斯加" },
  mh: { name: "Marshall Islands", localName: "马绍尔群岛" },
  mk: { name: "North Macedonia", localName: "北马其顿" },
  ml: { name: "Mali", localName: "马里" },
  mm: { name: "Myanmar", localName: "缅甸" },
  mn: { name: "Mongolia", localName: "蒙古" },
  mo: { name: "Macau", localName: "澳门" },
  mp: { name: "Northern Mariana Islands", localName: "北马里亚纳群岛" },
  mq: { name: "Martinique", localName: "马提尼克" },
  mr: { name: "Mauritania", localName: "毛里塔尼亚" },
  ms: { name: "Montserrat", localName: "蒙特塞拉特" },
  mt: { name: "Malta", localName: "马耳他" },
  mu: { name: "Mauritius", localName: "毛里求斯" },
  mv: { name: "Maldives", localName: "马尔代夫" },
  mw: { name: "Malawi", localName: "马拉维" },
  mx: { name: "Mexico", localName: "墨西哥" },
  my: { name: "Malaysia", localName: "马来西亚" },
  mz: { name: "Mozambique", localName: "莫桑比克" },
  na: { name: "Namibia", localName: "纳米比亚" },
  nc: { name: "New Caledonia", localName: "新喀里多尼亚" },
  ne: { name: "Niger", localName: "尼日尔" },
  nf: { name: "Norfolk Island", localName: "诺福克岛" },
  ng: { name: "Nigeria", localName: "尼日利亚" },
  ni: { name: "Nicaragua", localName: "尼加拉瓜" },
  nl: { name: "Netherlands", localName: "荷兰" },
  no: { name: "Norway", localName: "挪威" },
  np: { name: "Nepal", localName: "尼泊尔" },
  nr: { name: "Nauru", localName: "瑙鲁" },
  nu: { name: "Niue", localName: "纽埃" },
  nz: { name: "New Zealand", localName: "新西兰" },
  om: { name: "Oman", localName: "阿曼" },
  pa: { name: "Panama", localName: "巴拿马" },
  pe: { name: "Peru", localName: "秘鲁" },
  pf: { name: "French Polynesia", localName: "法属波利尼西亚" },
  pg: { name: "Papua New Guinea", localName: "巴布亚新几内亚" },
  ph: { name: "Philippines", localName: "菲律宾" },
  pk: { name: "Pakistan", localName: "巴基斯坦" },
  pl: { name: "Poland", localName: "波兰" },
  pm: { name: "Saint Pierre and Miquelon", localName: "圣皮埃尔和密克隆" },
  pn: { name: "Pitcairn Islands", localName: "皮特凯恩群岛" },
  pr: { name: "Puerto Rico", localName: "波多黎各" },
  ps: { name: "Palestine", localName: "巴勒斯坦" },
  pt: { name: "Portugal", localName: "葡萄牙" },
  pw: { name: "Palau", localName: "帕劳" },
  py: { name: "Paraguay", localName: "巴拉圭" },
  qa: { name: "Qatar", localName: "卡塔尔" },
  re: { name: "Réunion", localName: "留尼旺" },
  ro: { name: "Romania", localName: "罗马尼亚" },
  rs: { name: "Serbia", localName: "塞尔维亚" },
  ru: { name: "Russia", localName: "俄罗斯" },
  rw: { name: "Rwanda", localName: "卢旺达" },
  sa: { name: "Saudi Arabia", localName: "沙特阿拉伯" },
  sb: { name: "Solomon Islands", localName: "所罗门群岛" },
  sc: { name: "Seychelles", localName: "塞舌尔" },
  sd: { name: "Sudan", localName: "苏丹" },
  se: { name: "Sweden", localName: "瑞典" },
  sg: { name: "Singapore", localName: "新加坡" },
  sh: { name: "Saint Helena", localName: "圣赫勒拿" },
  si: { name: "Slovenia", localName: "斯洛文尼亚" },
  sk: { name: "Slovakia", localName: "斯洛伐克" },
  sl: { name: "Sierra Leone", localName: "塞拉利昂" },
  sm: { name: "San Marino", localName: "圣马力诺" },
  sn: { name: "Senegal", localName: "塞内加尔" },
  so: { name: "Somalia", localName: "索马里" },
  sr: { name: "Suriname", localName: "苏里南" },
  ss: { name: "South Sudan", localName: "南苏丹" },
  st: { name: "São Tomé and Príncipe", localName: "圣多美和普林西比" },
  sv: { name: "El Salvador", localName: "萨尔瓦多" },
  sx: { name: "Sint Maarten", localName: "荷属圣马丁" },
  sy: { name: "Syria", localName: "叙利亚" },
  sz: { name: "Eswatini", localName: "斯威士兰" },
  tc: { name: "Turks and Caicos Islands", localName: "特克斯和凯科斯群岛" },
  td: { name: "Chad", localName: "乍得" },
  tf: { name: "French Southern Territories", localName: "法属南部领地" },
  tg: { name: "Togo", localName: "多哥" },
  th: { name: "Thailand", localName: "泰国" },
  tj: { name: "Tajikistan", localName: "塔吉克斯坦" },
  tk: { name: "Tokelau", localName: "托克劳" },
  tl: { name: "Timor-Leste", localName: "东帝汶" },
  tm: { name: "Turkmenistan", localName: "土库曼斯坦" },
  tn: { name: "Tunisia", localName: "突尼斯" },
  to: { name: "Tonga", localName: "汤加" },
  tr: { name: "Turkey", localName: "土耳其" },
  tt: { name: "Trinidad and Tobago", localName: "特立尼达和多巴哥" },
  tv: { name: "Tuvalu", localName: "图瓦卢" },
  tw: { name: "Taiwan", localName: "台湾" },
  tz: { name: "Tanzania", localName: "坦桑尼亚" },
  ua: { name: "Ukraine", localName: "乌克兰" },
  ug: { name: "Uganda", localName: "乌干达" },
  un: { name: "United Nations", localName: "联合国" },
  us: { name: "United States", localName: "美国" },
  uy: { name: "Uruguay", localName: "乌拉圭" },
  uz: { name: "Uzbekistan", localName: "乌兹别克斯坦" },
  va: { name: "Vatican City", localName: "梵蒂冈" },
  vc: { name: "Saint Vincent and the Grenadines", localName: "圣文森特和格林纳丁斯" },
  ve: { name: "Venezuela", localName: "委内瑞拉" },
  vg: { name: "British Virgin Islands", localName: "英属维尔京群岛" },
  vi: { name: "U.S. Virgin Islands", localName: "美属维尔京群岛" },
  vn: { name: "Vietnam", localName: "越南" },
  vu: { name: "Vanuatu", localName: "瓦努阿图" },
  wf: { name: "Wallis and Futuna", localName: "瓦利斯和富图纳" },
  ws: { name: "Samoa", localName: "萨摩亚" },
  xk: { name: "Kosovo", localName: "科索沃" },
  ye: { name: "Yemen", localName: "也门" },
  yt: { name: "Mayotte", localName: "马约特" },
  za: { name: "South Africa", localName: "南非" },
  zm: { name: "Zambia", localName: "赞比亚" },
  zw: { name: "Zimbabwe", localName: "津巴布韦" },
  // 特殊标志
  pirate: { name: "Pirate Flag", localName: "海盗旗" },
  rainbow: { name: "Rainbow Flag", localName: "彩虹旗" },
  transgender: { name: "Transgender Flag", localName: "跨性别旗" }
} as const

export const REGIONS = {
  asia: ["cn", "jp", "kr", "in", "sg", "th", "vn", "my", "id", "ph"] as const,
  europe: ["gb", "fr", "de", "it", "es", "nl", "be", "se", "no", "dk"] as const,
  northAmerica: ["us", "ca", "mx"] as const,
  southAmerica: ["br", "ar", "cl", "pe", "co", "ve", "bo"] as const,
  africa: ["za", "eg", "ng", "ke", "ma", "gh", "tz"] as const,
  oceania: ["au", "nz", "fj", "pg", "sb"] as const
} as const

// Azure 地区代码到 ISO 国家代码的映射
export const AZURE_REGION_TO_COUNTRY: Record<string, CountryCode> = {
  // 美国地区
  eastus: "us",
  eastus2: "us",
  centralus: "us",
  northcentralus: "us",
  southcentralus: "us",
  westus: "us",
  westus2: "us",
  westus3: "us",

  // 欧洲地区
  northeurope: "ie", // 爱尔兰
  westeurope: "nl", // 荷兰
  francecentral: "fr", // 法国
  francesouth: "fr",
  uksouth: "gb", // 英国
  ukwest: "gb",
  germanynorth: "de", // 德国
  germanywestcentral: "de",
  switzerlandnorth: "ch", // 瑞士
  switzerlandwest: "ch",
  norwayeast: "no", // 挪威
  norwaywest: "no",

  // 亚太地区
  eastasia: "hk", // 香港
  southeastasia: "sg", // 新加坡
  japaneast: "jp", // 日本
  japanwest: "jp",
  koreacentral: "kr", // 韩国
  koreasouth: "kr",
  australiaeast: "au", // 澳大利亚
  australiasoutheast: "au",

  // 其他地区
  southafricanorth: "za", // 南非
  southafricawest: "za",
  uaenorth: "ae", // 阿联酋
  uaecentral: "ae",
  brazilsouth: "br", // 巴西
  brazilsoutheast: "br",
  canadacentral: "ca", // 加拿大
  canadaeast: "ca",
  indiawest: "in", // 印度
  indiacentral: "in",
  indiasouth: "in"
}

// utils.ts
export const getCountryInfo = (code: string): CountryInfo => {
  const countryCode = code.toLowerCase() as CountryCode
  return COUNTRY_CODES[countryCode] || { name: "Unknown", localName: "未知" }
}

export const searchCountry = (keyword: string): [CountryCode, CountryInfo][] => {
  const searchKey = keyword.toLowerCase()
  return Object.entries(COUNTRY_CODES).filter(([code, info]) => {
    return (
      code.toLowerCase().includes(searchKey) ||
      info.name.toLowerCase().includes(searchKey) ||
      info.localName.includes(searchKey)
    )
  }) as [CountryCode, CountryInfo][]
}

// 添加获取 Azure 地区对应的国家信息的函数
export const getAzureRegionCountryInfo = (region: string): CountryInfo => {
  // 移除所有空格并转换为小写
  const normalizedRegion = region.replace(/\s+/g, "").toLowerCase()

  // 尝试从映射中获取国家代码
  const countryCode = AZURE_REGION_TO_COUNTRY[normalizedRegion]

  if (countryCode) {
    return COUNTRY_CODES[countryCode]
  }

  // 如果没有找到精确匹配，尝试模糊匹配
  for (const [azureRegion, code] of Object.entries(AZURE_REGION_TO_COUNTRY)) {
    if (normalizedRegion.includes(azureRegion)) {
      return COUNTRY_CODES[code]
    }
  }

  // 如果仍然没有找到匹配，返回未知
  return { name: "Unknown Region", localName: "未知地区" }
}

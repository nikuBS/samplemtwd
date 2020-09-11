import EnvHelper from '../../../../utils/env.helper';

export default class RoamingHelper {
  static getMCC(alpha3: string): string {
    return ISO3166[alpha3][1];
  }

  static getAlpha2By3(alpha3: string): string {
    return ISO3166[alpha3][0];
  }

  static getAlpha2ByMCC(mcc: string): string {
    for (const a3 of Object.keys(ISO3166)) {
      const item = ISO3166[a3];
      if (item[1] === mcc) {
        return item[0];
      }
    }
    return 'KR';
  }

  static getAlpha3ByMCC(mcc: string): string {
    for (const a3 of Object.keys(ISO3166)) {
      const item = ISO3166[a3];
      if (item[1] === mcc) {
        return a3;
      }
    }
    return 'KOR';
  }

  static penetrateUri(uri: string): string {
    const env = String(process.env.NODE_ENV);
    if (env === 'local' && uri.startsWith('/adminupload')) {
      return 'http://cdnm-dev.tworld.co.kr' + uri;
    }
    return EnvHelper.getEnvironment('CDN') + uri;
  }

  static getTariffGroupsHardcoded() {
    return TARIFF_GROUPS;
  }

  static getTariffHardcoded(prodId: string) {
    for (const group of TARIFF_GROUPS) {
      for (const item of group.items) {
        if (item.id === prodId) {
          return item;
        }
      }
    }
    return null;
  }
}

const ISO3166 = {
  'AFG': ['AF', '412'], 'ALB': ['AL', '276'], 'DZA': ['DZ', '603'], 'ASM': ['AS', '544'],
  'AND': ['AD', '213'], 'AGO': ['AO', '631'], 'AIA': ['AI', '365'], 'ATG': ['AG', '344'],
  'ARG': ['AR', '722'], 'ARM': ['AM', '283'], 'ABW': ['AW', '363'], 'AUS': ['AU', '505'],
  'AUT': ['AT', '232'], 'AZE': ['AZ', '400'], 'BHS': ['BS', '364'], 'BHR': ['BH', '426'],
  'BGD': ['BD', '470'], 'BRB': ['BB', '342'], 'BLR': ['BY', '257'], 'BEL': ['BE', '206'],
  'BLZ': ['BZ', '702'], 'BEN': ['BJ', '616'], 'BMU': ['BM', '350'], 'BTN': ['BT', '402'],
  'BOL': ['BO', '736'], 'BES': ['BQ', '362'], 'BIH': ['BA', '218'], 'BWA': ['BW', '652'],
  'BVT': ['BV', '242'], 'BRA': ['BR', '724'], 'BRN': ['BN', '528'], 'BGR': ['BG', '284'],
  'BFA': ['BF', '613'], 'BDI': ['BI', '642'], 'CIV': ['CI', '612'], 'CPV': ['CV', '625'],
  'KHM': ['KH', '456'], 'CMR': ['CM', '624'], 'CAN': ['CA', '302'], 'CYM': ['KY', '346'],
  'CAF': ['CF', '623'], 'TCD': ['TD', '622'], 'CHL': ['CL', '730'], 'CHN': ['CN', '460'],
  'COL': ['CO', '732'], 'COM': ['KM', '654'], 'COG': ['CG', '629'], 'COD': ['CD', '630'],
  'COK': ['CK', '548'], 'CRI': ['CR', '712'], 'HRV': ['HR', '219'], 'CUB': ['CU', '368'],
  'CUW': ['CW', '362'], 'CYP': ['CY', '280'], 'CZE': ['CZ', '230'], 'DNK': ['DK', '238'],
  'DJI': ['DJ', '638'], 'DMA': ['DM', '366'], 'DOM': ['DO', '370'], 'ECU': ['EC', '740'],
  'EGY': ['EG', '602'], 'SLV': ['SV', '706'], 'GNQ': ['GQ', '627'], 'ERI': ['ER', '657'],
  'EST': ['EE', '248'], 'ETH': ['ET', '636'], 'FLK': ['FK', '750'], 'FRO': ['FO', '288'],
  'FJI': ['FJ', '542'], 'FIN': ['FI', '244'], 'FRA': ['FR', '208'], 'GUF': ['GF', '340'],
  'PYF': ['PF', '547'], 'GAB': ['GA', '628'], 'GMB': ['GM', '607'], 'GEO': ['GE', '282'],
  'DEU': ['DE', '262'], 'GHA': ['GH', '620'], 'GIB': ['GI', '266'], 'GRC': ['GR', '202'],
  'GRL': ['GL', '290'], 'GRD': ['GD', '352'], 'GLP': ['GP', '340'],
  'GTM': ['GT', '704'], 'GIN': ['GN', '611'], 'GNB': ['GW', '632'],
  'GUY': ['GY', '738'], 'HTI': ['HT', '372'], 'VAT': ['VA', '225'], 'HND': ['HN', '708'],
  'HKG': ['HK', '454'], 'HUN': ['HU', '216'], 'ISL': ['IS', '274'], 'IND': ['IN', '404'],
  'IDN': ['ID', '510'], 'IRN': ['IR', '432'], 'IRQ': ['IQ', '418'], 'IRL': ['IE', '272'],
  'ISR': ['IL', '425'], 'ITA': ['IT', '222'], 'JAM': ['JM', '338'],
  'JPN': ['JP', '440'], 'JOR': ['JO', '416'], 'KAZ': ['KZ', '401'],
  'KEN': ['KE', '639'], 'KIR': ['KI', '545'], 'PRK': ['KP', '467'], 'KOR': ['KR', '450'],
  'KWT': ['KW', '419'], 'KGZ': ['KG', '437'], 'LAO': ['LA', '457'], 'LVA': ['LV', '247'],
  'LBN': ['LB', '415'], 'LSO': ['LS', '651'], 'LBR': ['LR', '618'], 'LBY': ['LY', '606'],
  'LIE': ['LI', '295'], 'LTU': ['LT', '246'], 'LUX': ['LU', '270'], 'MAC': ['MO', '455'],
  'MKD': ['MK', '294'], 'MDG': ['MG', '646'], 'MWI': ['MW', '650'], 'MYS': ['MY', '502'],
  'MDV': ['MV', '472'], 'MLI': ['ML', '610'], 'MLT': ['MT', '278'], 'MHL': ['MH', '551'],
  'MTQ': ['MQ', '340'], 'MRT': ['MR', '609'], 'MUS': ['MU', '617'], 'MYT': ['YT', '208'],
  'MEX': ['MX', '334'], 'FSM': ['FM', '550'], 'MDA': ['MD', '259'], 'MCO': ['MC', '212'],
  'MNG': ['MN', '428'], 'MNE': ['ME', '297'], 'MSR': ['MS', '354'], 'MAR': ['MA', '604'],
  'MOZ': ['MZ', '643'], 'MMR': ['MM', '414'], 'NAM': ['NA', '649'], 'NRU': ['NR', '536'],
  'NPL': ['NP', '429'], 'NLD': ['NL', '204'], 'NCL': ['NC', '546'], 'NZL': ['NZ', '530'],
  'NIC': ['NI', '710'], 'NER': ['NE', '614'], 'NGA': ['NG', '621'], 'NIU': ['NU', '555'],
  'NFK': ['NF', '505'], 'NOR': ['NO', '242'], 'OMN': ['OM', '422'], 'PAK': ['PK', '410'],
  'PLW': ['PW', '552'], 'PSE': ['PS', '425'], 'PAN': ['PA', '714'], 'PNG': ['PG', '537'],
  'PRY': ['PY', '744'], 'PER': ['PE', '716'], 'PHL': ['PH', '515'], 'POL': ['PL', '260'],
  'PRT': ['PT', '268'], 'QAT': ['QA', '427'], 'REU': ['RE', '647'],
  'ROU': ['RO', '226'], 'RUS': ['RU', '250'], 'RWA': ['RW', '635'], 'KNA': ['KN', '356'],
  'LCA': ['LC', '358'], 'MAF': ['MF', '340'], 'SPM': ['PM', '308'], 'VCT': ['VC', '360'],
  'WSM': ['WS', '549'], 'SMR': ['SM', '292'], 'STP': ['ST', '626'], 'SAU': ['SA', '420'],
  'SEN': ['SN', '608'], 'SRB': ['RS', '220'], 'SYC': ['SC', '633'], 'SLE': ['SL', '619'],
  'SGP': ['SG', '525'], 'SXM': ['SX', '362'], 'SVK': ['SK', '231'], 'SVN': ['SI', '293'],
  'SLB': ['SB', '540'], 'SOM': ['SO', '637'], 'ZAF': ['ZA', '655'], 'SSD': ['SS', '659'],
  'ESP': ['ES', '214'], 'LKA': ['LK', '413'], 'SDN': ['SD', '634'], 'SUR': ['SR', '746'],
  'SWZ': ['SZ', '653'], 'SWE': ['SE', '240'], 'CHE': ['CH', '228'], 'SYR': ['SY', '417'],
  'TWN': ['TW', '466'], 'TJK': ['TJ', '436'], 'TZA': ['TZ', '640'], 'THA': ['TH', '520'],
  'TLS': ['TL', '514'], 'TGO': ['TG', '615'], 'TON': ['TO', '539'], 'TTO': ['TT', '374'],
  'TUN': ['TN', '605'], 'TUR': ['TR', '286'], 'TKM': ['TM', '438'], 'TCA': ['TC', '338'],
  'TUV': ['TV', '553'], 'UGA': ['UG', '641'], 'UKR': ['UA', '255'], 'ARE': ['AE', '424'],
  'GBR': ['GB', '234'], 'USA': ['US', '310'], 'URY': ['UY', '748'], 'UZB': ['UZ', '434'],
  'VUT': ['VU', '541'], 'VEN': ['VE', '734'], 'VNM': ['VN', '452'], 'VGB': ['VG', '348'],
  'ESH': ['EH', '604'], 'YEM': ['YE', '421'], 'ZMB': ['ZM', '645'], 'ZWE': ['ZW', '648'],
  'ALA': ['AX', '244'],
};

const TARIFF_GROUPS = [
  {
    name: 'baro 요금제',
    description: '아시아, 미주, 유럽, 호주 어디에서나 저렴한 가격과<br />넉넉한 데이터로 고품질의 baro통화를 이용하세요',
    id: 'group-baro',
    background: 'img_baro01.png',
    items: [
      {name: 'baro 3GB', data: '3GB', phone: 'baro통화 무제한', price: '29,000원/7일', id: 'NA00006489'},
      {name: 'baro 4GB', data: '4GB', phone: 'baro통화 무제한', price: '39,000원/30일', id: 'NA00006493'},
      {name: 'baro 7GB', data: '7GB', phone: 'baro통화 무제한', price: '59,000원/30일', id: 'NA00006497'},
    ]
  },
  {
    name: 'baro OnePass',
    description: '짧은 여행이나 출장을 자주 갈 때, <br />전 세계에서 1일 단위로 데이터를 이용하세요!',
    id: 'group-onepass',
    background: 'img_baro02.png',
    items: [
      {name: 'baro OnePass 300 기본형', data: '300MB', phone: 'baro통화 무제한', price: '9,900원/1일', id: 'NA00003196'},
      {name: 'baro OnePass 300 기간형', data: '300MB', phone: 'baro통화 무제한', price: '9,900원/1일', id: 'NA00003196'},
      {name: 'baro OnePass 500 기본형', data: '500MB', phone: 'baro통화 무제한', price: '16,500원/1일', id: 'NA00005049'},
      {name: 'baro OnePass 500 기간형', data: '500MB', phone: 'baro통화 무제한', price: '16,500원/1일', id: 'NA00005049'},
    ]
  },
  {
    name: 'baro OnePass Data / VIP',
    description: '전 세계에서 1일 단위로 데이터 걱정 없이<br />무제한으로 이용하세요!',
    id: 'group-vip',
    background: 'img_baro03.png',
    items: [
      {name: 'baro OnePass VIP 기본형', data: '데이터 무제한', phone: '음성30분 / 문자30건 / baro통화 무제한', price: '19,000원/1일', id: 'NA00006486'},
      {name: 'baro OnePass VIP 기간형', data: '데이터 무제한', phone: '음성30분 / 문자30건 / baro통화 무제한', price: '19,000원/1일', id: 'NA00006486'},
      {name: 'baro OnePass Data VIP 기본형', data: '데이터 무제한', phone: 'baro통화 무제한', price: '17,600원/1일', id: 'NA00006744'},
      {name: 'baro OnePass Data VIP', data: '데이터 무제한', phone: 'baro통화 무제한', price: '17,600원/1일', id: 'NA00006744'},
    ]
  },
  {
    name: '괌·사이판',
    description: '괌 사이판 여행, 국내 가입 요금제의 기본제공<br />데이터를 그대로 이용하세요!',
    id: 'group-guam',
    background: 'img_baro04.png',
    items: [
      {name: 'T괌 사이판 국내처럼', data: '요금제 유형별 이용안내 상세참고', phone: 'baro통화 무제한', price: '무료', id: 'NA00006226'},
      {name: 'T괌 사이판 5천원', data: '500MB', phone: '문자 기본제공 / baro통화 무제한', price: '5,000원/10일', id: 'NA00006229'},
    ]
  },
  {
    name: 'T로밍 LongPass',
    description: '괌 사이판 여행, 국내 가입 요금제의 기본제공<br />데이터를 그대로 이용하세요!',
    id: 'group-longpass',
    background: 'img_baro05.png',
    items: [
      {name: 'T로밍 LongPass 2GB', data: '2GB', phone: 'baro통화 무제한', price: '40,000원/30일', id: 'NA00005300'},
      {name: 'T로밍 LongPass 3GB', data: '3GB', phone: 'baro통화 무제한', price: '50,000원/30일', id: 'NA00005505'},
      {name: 'T로밍 LongPass 5GB', data: '5GB', phone: 'baro통화 무제한', price: '65,000원/30일', id: 'NA00005252'},
    ]
  },
];

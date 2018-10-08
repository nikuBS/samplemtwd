export const URL = {

  // Common
  '/common/settings/menu': { login: false, id: 'ST_01_01', title: '설정' },
  '/common/settings/business-info': { login: false, id: 'ST_01_08', title: '사업자 정보' },
  '/common/settings/privacy': { login: false, id: 'ST_01_07', title: '개인정보처리방침' },
  '/common/settings/certificates': { login: false, id: 'ST_01_06', title: '공인인증센터' },
  '/common/settings/notifications': { login: true, id: 'ST_01_05', title: 'T알림 설정' },

  // MyT
  '/myt/fare/bill/set': { login: true, id: 'MF_04', title: '요금 안내서 설정' },
  '/myt/fare/bill/set/return-history': { login: true, id: 'MF_04_04', title: '요금안내서 반송내역' },
  '/myt/fare//bill/set/reissue': { login: true, id: 'MF_04_01', title: '요금안내서 재발행' },
  '/myt/fare//bill/set/change': { login: true, id: 'MF_04_02', title: '요금안내서 변경' },
  '/myt/fare//bill/set/complete': { login: true, id: 'GR_01', title: '안내서 설정 완료' },
  '/myt/fare/bill/hotbill': { login: true, id: 'MF_03', title: '실시간 사용요금' },
  '/myt/join/product/fee-plan': { login: true, id: 'MS_05', title: '나의 요금제' },
  '/myt/join/product/additions': { login: true, id: 'MS_05', title: '나의 부가상품' },
  '/myt/join/product/combinations': { login: true, id: 'MS_05', title: '나의 결합상품' },
  '/myt/join/product/fee-alarm': { login: true, id: 'MS_05_01', title: '요금제 변경 가능일 알림' },
  '/myt/join/product/fee-alarm/change': { login: true, id: 'MS_05_01_01', title: '요금제 변경 가능일 알림 서비스' },
  '/myt/join/info/discount/month': { login: true, id: 'MS_09_01', title: '월별 상세 할인 내역' },
  '/myt/bill/guide': { login: true, id: 'MF_02_01', title: '요금안내서' },
  '/myt/bill/guide/call-gift': { login: true, id: 'MF_02_01_02', title: '요금안내서 콜기프트 사용요금 조회' },
  '/myt/bill/guide/roaming': { login: true, id: 'MF_02_01_03', title: '요금안내서 로밍 사용요금 조회' },
  '/myt/bill/guide/donation': { login: true, id: 'MF_02_01_04', title: '요금안내서 기부금/후원금 사용요금 조회' },
  '/myt/join/info/discount': { login: true, id: 'MS_09', title: '약정할인 및 단말 분할상환 정보' },

  // MyT-data
  '/myt/data': { login: true, id: 'DC', title: '데이터/통화 관리' },
  '/myt/data/usage': { login: true, id: 'DC_01_01', title: '실시간 데이터 잔여량' },
  '/myt/data/usage/child': { login: true, id: 'DC_08_01', title: '자녀 실시간 잔여량' },
  '/myt/data/family': { login: true, id: 'DC_02', title: 'T가족모아 데이터' },
  '/myt/data/gift': { login: true, id: 'DC_03_01', title: 'T끼리 데이터 선물하기' },
  '/myt/data/ting': { login: true, id: 'DC_04_03', title: '팅요금제 충전 선물' },
  '/myt/data/cookiz': { login: true, id: 'DC_04_02', title: '팅/쿠키즈/안심음성 요' },
  '/myt/data/limit': { login: true, id: 'DC_04_01', title: '데이터 한도 요금제' },
  '/myt/data/recharge/coupon': { login: true, id: 'DC_05', title: '나의 리필쿠폰' },
  '/myt/data/recharge/coupon/use': { login: true, id: 'DC_05_01', title: '리필 쿠폰 사용' },
  '/myt/data/recharge/history': { login: true, id: 'DC_07', title: '최근 충전/선물 내역' },

  // Product
  '/product/detail': { login: true, id: 'MP_02_02', title: '상품 상세 정보' },
  '/product/detail/contents': { login: true, id: 'MP_02_02_06', title: '상품 상세 정보 보기' },

};

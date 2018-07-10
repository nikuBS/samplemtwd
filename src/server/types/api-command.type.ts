export enum API_METHOD {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export enum API_SERVER {
  BFF = 'BFF_SERVER',
  TID = 'TID_SERVER',
  TEST = 'TEST_SERVER'
}

export const API_CMD = {
  // SPRINT #3
  SESSION_CHECK: { path: '/mock/session', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0001_mock: { path: '/mock/login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0002_C: { path: '/svc-catalog', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0003_C: { path: '/svc-catalog/detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004_C: { path: '/change-svc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0005_C: { path: '/selected-svc', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0023_C: { path: '/core-recharge/v1/refill-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  // COMMON
  BFF_01_0002: { path: '/common/services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0003: { path: '/svc-catalog/detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0004: { path: '/common/selected-services', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: false },
  BFF_01_0005: { path: '/common/selected-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  // AUTH
  BFF_03_0001: { path: '/test-login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0002: { path: '/core-auth/v1/member-auth', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0003: { path: '/core-auth/v1/members', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004: { path: '/core-auth/v1/services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_03_0005: { path: '/core-auth/v1/multi-svc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
    BFF_03_0006: {path: '/user/nick-names/args-0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true},
  BFF_03_0007: { path: '/user/tid-keys', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_03_0008: { path: '/user/sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0009: { path: '/user/service-password-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0010: { path: '/user/locks', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0011: { path: '/core-auth/v1/members-foreinger', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0012: { path: '/user/biz-real-users-auth/args-0', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0013: { path: '/user/biz-real-users/args-0', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  // MYT
  BFF_05_0001: { path: '/my-t/balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0002: { path: '/my-t/balance-add-ons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0003: { path: '/core-balance/v1/troaming-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0004: { path: '/core-balance/v1/data-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0005: { path: '/core-balance/v1/tdata-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0006: { path: '/core-balance/v1/data-top-up', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0007: { path: '/core-balance/v1/ting', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0008: { path: '/core-balance/v1/data-discount', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0009: { path: '/core-balance/v1/data-sharings/balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0010: { path: '/core-balance/v1/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0011: { path: '/core-balance/v1/data-sharings/args-0', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0028: { path: '/core-bill/v1/bill-types-reissue-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0039: { path: '/core-bill/v1/bill-types-return-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0048: { path: '/core-bill/v1/bill-types-reissue-request/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // RECHARGE
  BFF_06_0001: { path: '/core-recharge/v1/refill-coupons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0002: { path: '/core-recharge/v1/refill-usages', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0003: { path: '/core-recharge/v1/refill-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0004: { path: '/core-recharge/v1/regular-data-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0005: { path: '/core-recharge/v1/regular-data-gifts', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0006: { path: '/core-recharge/v1/regular-data-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0007: { path: '/core-recharge/v1/refill-coupons', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_06_0008: { path: '/core-recharge/v1/data-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0009: { path: '/core-recharge/v1/refill-options', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0010: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0011: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0012: { path: '/core-recharge/v1/data-gift-request-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0013: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0014: { path: '/core-recharge/v1/data-gift-balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0015: { path: '/core-recharge/v1/data-gift-senders', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0016: { path: '/core-recharge/v1/data-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0017: { path: '/core-recharge/v1/data-gift-messages', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0018: { path: '/core-recharge/v1/data-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0019: { path: '/core-recharge/v1/data-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0020: { path: '/core-recharge/v1/ting-gift-providers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0021: { path: '/core-recharge/v1/ting-gift-blocks', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_06_0022: { path: '/core-recharge/v1/ting-gift-benefiters', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0023: { path: '/core-recharge/v1/ting-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0024: { path: '/core-recharge/v1/ting-press-benefiters', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0025: { path: '/core-recharge/v1/ting-press', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0026: { path: '/core-recharge/v1/ting-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0027: { path: '/core-recharge/v1/ting-gift-blocks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0028: { path: '/core-recharge/v1/ting-cookies/recharge/base', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0029: { path: '/core-recharge/v1/ting-cookies/recharge-month', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0030: { path: '/core-recharge/v1/ting-cookies/recharge-auto', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0031: { path: '/core-recharge/v1/ting-cookies/recharge-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0032: { path: '/core-recharge/v1/ting-cookies/recharge/histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0033: { path: '/core-recharge/v1/ting-cookies/recharge-histories-change', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0034: { path: '/services/recharge/info', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0035: { path: '/services/recharge/auto-save', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0036: { path: '/services/recharge/now-save', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0037: { path: '/services/recharge/auto-save-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0038: { path: '/services/recharge/now-cut', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0039: { path: '/services/recharge/now-cut-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0040: { path: '/services/recharge/auto-cut', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0041: { path: '/services/recharge/auto-cut-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0042: { path: '/services/recharge/search', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // PAYMENT
  BFF_07_0021: { path: '/core-bill/v1/bill-pay/settle-unpaid-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0022: { path: '/core-bill/v1/bill-pay/autopay-banks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0023: { path: '/core-bill/v1/bill-pay/settle-pay-bank', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0024: { path: '/core-bill/v1/bill-pay/cardnum-validation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0025: { path: '/core-bill/v1/bill-pay/settle-pay-card', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0026: { path: '/core-bill/v1/bill-pay/settle-vbs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0027: { path: '/core-bill/v1/bill-pay/settle-vb-sms', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0028: { path: '/core-bill/v1/bill-pay/avail-point-search', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0029: { path: '/core-bill/v1/bill-pay/pay-ocb-tpoint-proc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0041: { path: '/core-bill/v1/ocbcard-info-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0042: { path: '/core-bill/v1/rainbow-point-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0043: {path: '/core-bill/v1/ocbcard-no-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true},
  BFF_07_0045: { path: '/core-bill/v1/ocb-point-onetime-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0046: { path: '/core-bill/v1/ocb-point-onetime-result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0047: { path: '/core-bill/v1/ocb-point-onetime-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0048: { path: '/core-bill/v1/rainbow-point-onetime-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0050: { path: '/core-bill/v1/rainbow-point-onetime-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0051: { path: '/core-bill/v1/ocb-point-autopay-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0052: { path: '/core-bill/v1/rainbow-point-autopay-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0054: { path: '/core-bill/v1/ocb-point-autopay-modify', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0055: { path: '/core-bill/v1/ocb-point-autopay-result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0056: { path: '/core-bill/v1/rainbow-point-autopay-change', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0058: { path: '/core-bill/v1/ocb-point-onetime-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0059: { path: '/core-bill/v1/rainbow-point-onetime-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0060: { path: '/core-bill/v1/auto-payments', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0061: { path: '/core-bill/v1/auto-payments', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0062: { path: '/core-bill/v1/auto-payments', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0063: { path: '/core-bill/v1/auto-payments', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_07_0064: { path: '/core-bill/v1/autopay/db-req', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },

  // TID
  OIDC: { path: '/auth/authorize.do', method: API_METHOD.GET, server: API_SERVER.TID, bypass: false },

  TEST_GET_USAGE_BTN: { path: '/usageBtn', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true }
};

export const TID_SVC_TYPE = {
  SSO_LOGIN: 9,
  LOGIN: 14,
  ID_LOGIN: 16,
  SSO_LOGOUT: 19,
  SIGN_UP: 20,
  GET_ACCOUNT: 21,
  FIND_ID: 22,
  FIND_PW: 23,
  CHANGE_PW: 24,
  TERM: 25,
  SECURITY: 26,
  GUIDE: 50
};

export const API_CODE = {
  CODE_00: '00',    // success
  CODE_01: '01',    // 화면 차단
  CODE_02: '02',    // API 차단
  CODE_03: '03',    // 2차 인증
  CODE_04: '04',    // 로그인 필요
  CODE_05: '05',    // 접근 불가 (권한)
  CODE_06: '06',    // 고객 비밀번호 인증 필요
  CODE_07: '07',    // 고객 비밀번호 재설정 필요
  CODE_99: '99',    // Circuit Open
  CODE_200: '200',
  CODE_400: '400'
};

export const API_MYT_ERROR_CODE = [
  'BLN0001', // 잔여기본통화 조회횟수 초과
  'BLN0002', // 정지이력
  'BLN0003', // 조회불가대상
  'BLN0004' // 조회불가대상
];

export const API_GIFT_ERROR = [
  'RCG0001',   // 제공자 선물하기 불가 상태
  'RCG0002',   // 제공자 선물하기 불가 요금제
  'RCG0003',   // 제공자 당월 선물가능 횟수 초과 (월2회)
  'RCG0004',   // 제공자 당월 선물가능 용량 미달
  'RCG0005',   // 제공자가 미성년자이면 선물하기 불가
  'RCG0006',   // 수혜자 선물수신 불가상태
  'RCG0007',   // 수혜자 선물수신 불가 요금제
  'RCG0008',   // 수혜자 당월 선물수신 횟수 초과 (월2회)
  'RCG0011',   // 제공자 회선과 수혜자 회선이 동일한 경우
  'RCG0013',   // 그 외 기타에러
  'RCG0015',   // 기타 불가
];


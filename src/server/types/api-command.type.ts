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
  BFF_01_0002: { path: '/common/sessions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0003: { path: '/svc-catalog/detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0004: { path: '/common/selected-sessions', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0005: { path: '/common/selected-sessions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // AUTH
  BFF_03_0001: { path: '/test-login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0002: { path: '/user/account-auth-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0003: { path: '/core-auth/v1/members', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004: { path: '/core-auth/v1/services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0005: { path: '/core-auth/v1/multi-svc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0006: { path: '/user/nick-names/args-0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0007: { path: '/user/tid-keys', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0008: { path: '/user/sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0009: { path: '/user/service-password-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0010: { path: '/user/locks', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0011: { path: '/core-auth/v1/nationalities', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0012: { path: '/user/biz-auth-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0013: { path: '/user/biz-services', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0014: { path: '/core-auth/v1/marketing-offer-subscriptions/args-0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0015: { path: '/core-auth/v1/marketing-offer-subscriptions/args-0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
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
  BFF_05_0013: { path: '/core-bill/v1/pps-cards', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0014: { path: '/core-bill/v1/pps-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0028: { path: '/core-bill/v1/bill-types-reissue-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0030: { path: '/core-bill/v1/bill-pay/unpaid-bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0031: { path: '/core-bill/v1/bill-pay/payment-possible-day', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0032: { path: '/core-bill/v1/bill-pay/payment-possible-day-input', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_05_0033: { path: '/core-bill/v1/bill-pay/autopay-schedule', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0034: { path: '/core-bill/v1/bill-pay/suspension-cancel', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: false },
  BFF_05_0036: { path: '/core-bill/v1/bill-pay/bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0037: { path: '/core-bill/v1/bill-pay/suspension', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0038: { path: '/core-bill/v1/bill-pay/donation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0039: { path: '/core-bill/v1/bill-types-return-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0040: { path: '/core-product/v1/services/wireless/additions/args-0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0041: { path: '/core-product/v1/services/base-fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0044: { path: '/core-bill/v1/bill-pay/roaming', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0045: { path: '/core-bill/v1/bill-pay/call-gift', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0047: { path: '/core-bill/v1/bill-pay/used-amounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0048: { path: '/core-bill/v1/bill-types-reissue-request/', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0022: { path: '/core-bill/v1/hotbill/fee/hotbill-response', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0024: { path: '/core-bill/v1/child/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0025: { path: '/core-bill/v1/bill-types-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0035: { path: '/core-bill/v1/hotbill/fee/hotbill-request', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0049: { path: '/core-bill/v1/integrated-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0027: { path: '/core-bill/v1/bill-types-change/', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0050: { path: '/core-bill/v1/wire-bill-types', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0051: { path: '/core-bill/v1/wire-bill-reissue/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0052: { path: '/core-bill/v1/wire-bill-reissue/', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
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
  BFF_06_0020: { path: '/core-recharge/v1/ting-gift-senders', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0021: { path: '/core-recharge/v1/ting-gift-blocks', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0022: { path: '/core-recharge/v1/ting-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0023: { path: '/core-recharge/v1/ting-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0024: { path: '/core-recharge/v1/ting-press-benefiters', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0025: { path: '/core-recharge/v1/ting-gift-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0026: { path: '/core-recharge/v1/ting-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0027: { path: '/core-recharge/v1/ting-gift-blocks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0028: { path: '/core-recharge/v1/ting-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0029: { path: '/core-recharge/v1/ting-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0030: { path: '/core-recharge/v1/regular-ting-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0031: { path: '/core-recharge/v1/regular-ting-top-ups', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0032: { path: '/core-recharge/v1/ting-top-ups', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0033: { path: '/core-recharge/v1/ting-permissions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0034: { path: '/core-recharge/v1/data-limitation-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0035: { path: '/core-recharge/v1/regular-data-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0036: { path: '/core-recharge/v1/data-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0037: { path: '/core-recharge/v1/regular-data-top-ups', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0038: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0039: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0040: { path: '/core-recharge/v1/regular-data-limitations', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0041: { path: '/core-recharge/v1/regular-data-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0042: { path: '/core-recharge/v1/data-top-ups', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0043: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // PAYMENT
  BFF_07_0004: { path: '/core-bill/v1/cash-receipts-issue-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0005: { path: '/core-bill/v1/point-autopays-history/cashback', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0006: { path: '/core-bill/v1/point-autopays-history/tpoint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0007: { path: '/core-bill/v1/point-autopays-history/tpoint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0017: { path: '/core-bill/v1/bill-pay/tax-reprint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0018: { path: '/core-bill/v1/bill-pay/tax-reprint-email', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0019: { path: '/core-bill/v1/bill-pay/tax-reprint-fax', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0021: { path: '/payment/settle-unpaids', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0022: { path: '/core-bill/v1/bill-pay/autopay-banks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0023: { path: '/core-bill/v1/bill-pay/settle-pay-bank', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0024: { path: '/core-bill/v1/bill-pay/cardnum-validation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0025: { path: '/core-bill/v1/bill-pay/settle-pay-card', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0026: { path: '/core-bill/v1/bill-pay/settle-vbs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0027: { path: '/core-bill/v1/bill-pay/settle-vb-sms', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0028: { path: '/core-bill/v1/bill-pay/avail-point-search', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0029: { path: '/core-bill/v1/bill-pay/pay-ocb-tpoint-proc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0037: { path: '/core-bill/v1/payment/auto-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0039: { path: '/core-bill/v1/payment/auto-integrated-account-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0041: { path: '/core-bill/v1/ocbcard-info-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0042: { path: '/core-bill/v1/rainbow-point-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0043: { path: '/core-bill/v1/ocbcard-no-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
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
  BFF_07_0058: { path: '/core-bill/v1/ocb-point-onetime-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0059: { path: '/core-bill/v1/rainbow-point-onetime-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0060: { path: '/core-bill/v1/auto-payments', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0061: { path: '/core-bill/v1/auto-payments', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0062: { path: '/core-bill/v1/auto-payments', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0063: { path: '/core-bill/v1/auto-payments', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_07_0064: { path: '/core-bill/v1/autopay/db-req', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0065: { path: '/core-bill/v1/autopay/pay-cycl-chg/args-0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0068: { path: '/core-bill/v1/autopay/card-info/args-0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // TID
  OIDC: { path: '/auth/authorize.do', method: API_METHOD.GET, server: API_SERVER.TID, bypass: false },

  // TEST
  GET: { path: '/posts', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  GET_PARAM: { path: '/comments', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  GET_PATH_PARAM: { path: '/posts/args-0', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  POST: { path: '/posts', method: API_METHOD.POST, server: API_SERVER.TEST, bypass: true },
  POST_PARAM: { path: '/posts', method: API_METHOD.POST, server: API_SERVER.TEST, bypass: true },
  PUT: { path: '/posts/1', method: API_METHOD.PUT, server: API_SERVER.TEST, bypass: true },
  PUT_PARAM: { path: '/posts/1', method: API_METHOD.PUT, server: API_SERVER.TEST, bypass: true },
  DELETE: { path: '/posts/1', method: API_METHOD.DELETE, server: API_SERVER.TEST, bypass: true },
  DELETE_PARAM: {}

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

export const API_LOGIN_ERROR = {
  'ATH1003': 'ATH1003',   // 로그인 30회 초과
  'ATH3236': 'ATH3236',   // 분실정지 (대표회선)
  '3211': '3211',       // 고객보호비밀번호 (대표회선) 입력 필요
  '3213': '3213',       // 고객보호비밀번호 오입력 (3회미만)
  '3212': '3212',       // 고객번호비밀번호 오입력 (3회)
  '3215': '3215',       // 고객번호비밀번호 오입력 (4회)
  '3216': '3216',       // 고객번호비밀번호 잠김 (지점 내점 안내 노출)
  '3235': '3235',       // 휴면계정
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


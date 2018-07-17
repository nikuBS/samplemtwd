Tw.API_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

Tw.API_CMD = {
  TEST_GET_USAGE_BTN: { path: '/usageBtn', method: Tw.API_METHOD.GET },
  SESSION_CHECK: { path: '/mock/session', method: Tw.API_METHOD.GET },
  BFF_03_0002_C: { path: '/svc-catalog', method: Tw.API_METHOD.GET },
  BFF_03_0003_C: { path: '/svc-catalog/detail', method: Tw.API_METHOD.GET },
  BFF_03_0004_C: { path: '/change-svc', method: Tw.API_METHOD.POST },
  BFF_03_0005_C: { path: '/selected-svc', method: Tw.API_METHOD.GET },
  BFF_03_0023_C: { path: '/core-recharge/v1/refill-gifts', method: Tw.API_METHOD.POST },

  // COMMON
  BFF_01_0004: { path: '/common/selected-sessions', method: Tw.API_METHOD.PUT },
  BFF_01_0005: { path: '/common/selected-sessions', method: Tw.API_METHOD.GET },

  // AUTH
  BFF_03_0002: { path: '/user/account-auth-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0003: { path: '/core-auth/v1/members', method: Tw.API_METHOD.DELETE },
  BFF_03_0004: { path: '/core-auth/v1/services', method: Tw.API_METHOD.GET },
  BFF_03_0005: { path: '/core-auth/v1/multi-svc', method: Tw.API_METHOD.POST },
  BFF_03_0006: { path: '/user/nick-names/args-0', method: Tw.API_METHOD.PUT },
  BFF_03_0007: { path: '/user/tid-keys', method: Tw.API_METHOD.GET },
  BFF_03_0009: { path: '/user/service-password-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0010: { path: '/user/locks', method: Tw.API_METHOD.DELETE },
  BFF_03_0011: { path: '/core-auth/v1/nationalities', method: Tw.API_METHOD.GET },
  BFF_03_0012: { path: '/user/biz-auth-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0013: { path: '/user/biz-services', method: Tw.API_METHOD.POST },
  BFF_03_0014: { path: '/core-auth/v1/marketing-offer-subscriptions/args-0', method: Tw.API_METHOD.GET },
  BFF_03_0015: { path: '/core-auth/v1/marketing-offer-subscriptions/args-0', method: Tw.API_METHOD.PUT },

  // MYT
  BFF_05_0001: { path: '/my-t/balances', method: Tw.API_METHOD.GET },
  BFF_05_0002: { path: '/my-t/balance-add-ons', method: Tw.API_METHOD.GET },
  BFF_05_0009: { path: '/core-balance/v1/data-sharings/balances', method: Tw.API_METHOD.GET },
  BFF_05_0010: { path: '/core-balance/v1/children', method: Tw.API_METHOD.GET },
  BFF_05_0011: { path: '/core-balance/v1/data-sharings/args-0', method: Tw.API_METHOD.POST },
  BFF_05_0048: { path: '/core-bill/v1/bill-types-reissue-request/', method: Tw.API_METHOD.POST },
  BFF_05_0022: { path: '/core-bill/v1/hotbill/fee/hotbill-response', method: Tw.API_METHOD.GET },
  BFF_05_0024: { path: '/core-bill/v1/child/children', method: Tw.API_METHOD.GET },
  BFF_05_0027: { path: '/core-bill/v1/bill-types-change', method: Tw.API_METHOD.POST },
  BFF_05_0035: { path: '/core-bill/v1/hotbill/fee/hotbill-request', method: Tw.API_METHOD.GET },
  BFF_05_0041: { path: '/core-product/v1/services/base-fee-plans', method: Tw.API_METHOD.GET },
  BFF_05_0052: { path: '/core-bill/v1/wire-bill-reissue', method: Tw.API_METHOD.POST},

  // RECHARGE
  BFF_06_0001: { path: '/core-recharge/v1/refill-coupons', method: Tw.API_METHOD.GET },
  BFF_06_0002: { path: '/core-recharge/v1/refill-usages', method: Tw.API_METHOD.GET },
  BFF_06_0003: { path: '/core-recharge/v1/refill-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0004: { path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0005: { path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.DELETE },
  BFF_06_0006: { path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0007: { path: '/core-recharge/v1/refill-coupons', method: Tw.API_METHOD.PUT },
  BFF_06_0008: { path: '/core-recharge/v1/data-gift-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0009: { path: '/core-recharge/v1/refill-options', method: Tw.API_METHOD.GET },
  BFF_06_0010: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.GET },
  BFF_06_0011: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.DELETE },
  BFF_06_0012: { path: '/core-recharge/v1/data-gift-request-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0013: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.GET },
  BFF_06_0014: { path: '/core-recharge/v1/data-gift-balances', method: Tw.API_METHOD.GET },
  BFF_06_0015: { path: '/core-recharge/v1/data-gift-senders', method: Tw.API_METHOD.GET },
  BFF_06_0016: { path: '/core-recharge/v1/data-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0017: { path: '/core-recharge/v1/data-gift-messages', method: Tw.API_METHOD.POST },
  BFF_06_0018: { path: '/core-recharge/v1/data-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0019: { path: '/core-recharge/v1/data-gift-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0020: { path: '/core-recharge/v1/ting-gift-senders', method: Tw.API_METHOD.GET },
  BFF_06_0021: { path: '/core-recharge/v1/ting-gift-blocks', method: Tw.API_METHOD.POST },
  BFF_06_0022: { path: '/core-recharge/v1/ting-gift-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0023: { path: '/core-recharge/v1/ting-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0024: { path: '/core-recharge/v1/ting-press-benefiters', method: Tw.API_METHOD.POST },
  BFF_06_0025: { path: '/core-recharge/v1/ting-gift-requests', method: Tw.API_METHOD.POST },
  BFF_06_0026: { path: '/core-recharge/v1/ting-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0027: { path: '/core-recharge/v1/ting-gift-blocks', method: Tw.API_METHOD.GET },
  BFF_06_0028: { path: '/core-recharge/v1/ting-services', method: Tw.API_METHOD.GET },
  BFF_06_0029: { path: '/core-recharge/v1/ting-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0030: { path: '/core-recharge/v1/regular-ting-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0031: { path: '/core-recharge/v1/regular-ting-top-ups', method: Tw.API_METHOD.DELETE },
  BFF_06_0032: { path: '/core-recharge/v1/ting-top-ups', method: Tw.API_METHOD.GET },
  BFF_06_0033: { path: '/core-recharge/v1/ting-permissions', method: Tw.API_METHOD.GET },
  BFF_06_0034: { path: '/core-recharge/v1/data-limitation-services', method: Tw.API_METHOD.GET },
  BFF_06_0035: { path: '/core-recharge/v1/regular-data-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0036: { path: '/core-recharge/v1/data-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0037: { path: '/core-recharge/v1/regular-data-top-ups', method: Tw.API_METHOD.DELETE },
  BFF_06_0038: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.DELETE },
  BFF_06_0039: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.POST },
  BFF_06_0040: { path: '/core-recharge/v1/regular-data-limitations', method: Tw.API_METHOD.DELETE },
  BFF_06_0041: { path: '/core-recharge/v1/regular-data-limitations', method: Tw.API_METHOD.POST },
  BFF_06_0042: { path: '/core-recharge/v1/data-top-ups', method: Tw.API_METHOD.GET },
  BFF_06_0043: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.GET },

  // PAYMENT
  BFF_07_0004: { path: '/core-bill/v1/cash-receipts-issue-history', method: Tw.API_METHOD.GET },
  BFF_07_0005: { path: '/core-bill/v1/point-autopays-history/cashback', method: Tw.API_METHOD.GET },
  BFF_07_0006: { path: '/core-bill/v1/point-autopays-history/tpoint', method: Tw.API_METHOD.GET },
  BFF_07_0007: { path: '/core-bill/v1/point-autopays-history/tpoint', method: Tw.API_METHOD.GET },
  BFF_07_0017: { path: '/core-bill/v1/bill-pay/tax-reprint',  method: Tw.API_METHOD.GET },
  BFF_07_0018: { path: '/core-bill/v1/bill-pay/tax-reprint-email',  method: Tw.API_METHOD.GET },
  BFF_07_0019: { path: '/core-bill/v1/bill-pay/tax-reprint-fax',  method: Tw.API_METHOD.GET },
  BFF_07_0022: { path: '/core-bill/v1/bill-pay/autopay-banks', method: Tw.API_METHOD.GET },
  BFF_07_0023: { path: '/core-bill/v1/bill-pay/settle-pay-bank', method: Tw.API_METHOD.POST },
  BFF_07_0024: { path: '/core-bill/v1/bill-pay/cardnum-validation', method: Tw.API_METHOD.GET },
  BFF_07_0025: { path: '/core-bill/v1/bill-pay/settle-pay-card', method: Tw.API_METHOD.POST },
  BFF_07_0026: { path: '/core-bill/v1/bill-pay/settle-vbs', method: Tw.API_METHOD.GET },
  BFF_07_0027: { path: '/core-bill/v1/bill-pay/settle-vb-sms', method: Tw.API_METHOD.GET },
  BFF_07_0028: { path: '/core-bill/v1/bill-pay/avail-point-search', method: Tw.API_METHOD.GET },
  BFF_07_0029: { path: '/core-bill/v1/bill-pay/pay-ocb-tpoint-proc', method: Tw.API_METHOD.POST },
  BFF_07_0037: { path: '/core-bill/v1/payment/auto-payment', method: Tw.API_METHOD.GET },
  BFF_07_0039: { path: '/core-bill/v1/payment/auto-integrated-account-payment', method: Tw.API_METHOD.GET },
  BFF_07_0043: { path: '/core-bill/v1/ocbcard-no-info', method: Tw.API_METHOD.GET },
  BFF_07_0045: { path: '/core-bill/v1/ocb-point-onetime-reserve', method: Tw.API_METHOD.POST },
  BFF_07_0047: { path: '/core-bill/v1/ocb-point-onetime-cancel', method: Tw.API_METHOD.POST },
  BFF_07_0048: { path: '/core-bill/v1/rainbow-point-onetime-reserve', method: Tw.API_METHOD.POST },
  BFF_07_0050: { path: '/core-bill/v1/rainbow-point-onetime-cancel', method: Tw.API_METHOD.POST },
  BFF_07_0054: { path: '/core-bill/v1/ocb-point-autopay-modify', method: Tw.API_METHOD.POST },
  BFF_07_0056: { path: '/core-bill/v1/rainbow-point-autopay-change', method: Tw.API_METHOD.POST },
  BFF_07_0058: { path: '/core-bill/v1/ocb-point-onetime-history', method: Tw.API_METHOD.GET },
  BFF_07_0059: { path: '/core-bill/v1/rainbow-point-onetime-history', method: Tw.API_METHOD.GET },
  BFF_07_0061: { path: '/core-bill/v1/auto-payments', method: Tw.API_METHOD.POST },
  BFF_07_0062: { path: '/core-bill/v1/auto-payments', method: Tw.API_METHOD.PUT },
  BFF_07_0063: { path: '/core-bill/v1/auto-payments', method: Tw.API_METHOD.DELETE },
  BFF_07_0065: { path: '/core-bill/v1/autopay/pay-cycl-chg/args-0', method: Tw.API_METHOD.PUT },
  BFF_07_0068: { path: '/core-bill/v1/autopay/card-info/args-0', method: Tw.API_METHOD.GET },
  // TEST
  GET: { path: '/posts', method: Tw.API_METHOD.GET },
  GET_PARAM: { path: '/comments', method: Tw.API_METHOD.GET },
  GET_PATH_PARAM: { path: '/posts/args-0', method: Tw.API_METHOD.GET },
  POST: { path: '/posts', method: Tw.API_METHOD.POST },
  POST_PARAM: { path: '/posts', method: Tw.API_METHOD.POST },
  PUT: { path: '/posts/1', method: Tw.API_METHOD.PUT },
  PUT_PARAM: { path: '/posts/1', method: Tw.API_METHOD.PUT },
  DELETE: { path: '/posts/1', method: Tw.API_METHOD.DELETE },
  DELETE_PARAM: {}
};

Tw.NODE_CMD = {
  GET_ENVIRONMENT: { path: '/environment', method: Tw.API_METHOD.GET },
  SET_DEVICE: { path: '/device', method: Tw.API_METHOD.POST },
  CHANGE_SESSION: { path: '/change-session', method: Tw.API_METHOD.POST },
  SVC_PASSWORD_LOGIN: { path: '/service-password-sessions/login', method: Tw.API_METHOD.POST },
  SVC_PASSWORD_SESSION: { path: '/service-password-sessions/session', method: Tw.API_METHOD.POST }
};

Tw.API_CODE = {
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
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

  // AUTH
  BFF_03_0003: { path: '/core-auth/v1/members', method: Tw.API_METHOD.DELETE },

  // MYT
  BFF_05_0001: { path: '/my-t/balances', method: Tw.API_METHOD.GET },
  BFF_05_0002: { path: '/my-t/balance-add-ons', method: Tw.API_METHOD.GET },
  BFF_05_0009: { path: '/core-balance/v1/data-sharings/balances', method: Tw.API_METHOD.GET },
  BFF_05_0010: { path: '/core-balance/v1/children', method: Tw.API_METHOD.GET },
  BFF_05_0011: { path: '/core-balance/v1/data-sharings/args-0', method: Tw.API_METHOD.POST },

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
  BFF_06_0020: { path: '/core-recharge/v1/ting-gift-providers', method: Tw.API_METHOD.GET },
  BFF_06_0021: { path: '/core-recharge/v1/ting-gift-blocks', method: Tw.API_METHOD.PUT },
  BFF_06_0022: { path: '/core-recharge/v1/ting-gift-benefiters', method: Tw.API_METHOD.GET },
  BFF_06_0023: { path: '/core-recharge/v1/ting-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0024: { path: '/core-recharge/v1/ting-press-benefiters', method: Tw.API_METHOD.POST },
  BFF_06_0025: { path: '/core-recharge/v1/ting-press', method: Tw.API_METHOD.POST },
  BFF_06_0026: { path: '/core-recharge/v1/ting-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0027: { path: '/core-recharge/v1/ting-gift-blocks', method: Tw.API_METHOD.GET },
  BFF_06_0028: { path: '/core-recharge/v1/ting-cookies/recharge/base', method: Tw.API_METHOD.GET },
  BFF_06_0029: { path: '/core-recharge/v1/ting-cookies/recharge-month', method: Tw.API_METHOD.POST },
  BFF_06_0030: { path: '/core-recharge/v1/ting-cookies/recharge-auto', method: Tw.API_METHOD.POST },
  BFF_06_0031: { path: '/core-recharge/v1/ting-cookies/recharge-cancel', method: Tw.API_METHOD.POST },
  BFF_06_0032: { path: '/core-recharge/v1/ting-cookies/recharge/histories', method: Tw.API_METHOD.GET },
  BFF_06_0033: { path: '/core-recharge/v1/ting-cookies/recharge-histories-change', method: Tw.API_METHOD.POST },
  BFF_06_0034: { path: '/services/recharge/info', method: Tw.API_METHOD.POST },
  BFF_06_0035: { path: '/services/recharge/auto-save', method: Tw.API_METHOD.POST },
  BFF_06_0036: { path: '/services/recharge/now-save', method: Tw.API_METHOD.POST },
  BFF_06_0037: { path: '/services/recharge/auto-save-cancel', method: Tw.API_METHOD.POST },
  BFF_06_0038: { path: '/services/recharge/now-cut', method: Tw.API_METHOD.POST },
  BFF_06_0039: { path: '/services/recharge/now-cut-cancel', method: Tw.API_METHOD.POST },
  BFF_06_0040: { path: '/services/recharge/auto-cut', method: Tw.API_METHOD.POST },
  BFF_06_0041: { path: '/services/recharge/auto-cut-cancel', method: Tw.API_METHOD.POST },
  BFF_06_0042: { path: '/services/recharge/search', method: Tw.API_METHOD.GET },

  // PAYMENT
  BFF_07_0022: { path: '/core-bill/v1/bill-pay/autopay-banks', method: Tw.API_METHOD.GET }
};

Tw.API_CODE = {
  CODE_00: '00'
};

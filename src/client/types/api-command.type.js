Tw.API_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

Tw.API_CMD = {
  TEST_GET_USAGE_BTN: {path: '/usageBtn', method: Tw.API_METHOD.GET},
  SESSION_CHECK: {path: '/mock/session', method: Tw.API_METHOD.GET},
  BFF_03_0002: {path: '/svc-catalog', method: Tw.API_METHOD.GET},
  BFF_03_0003: {path: '/svc-catalog/detail', method: Tw.API_METHOD.GET},
  BFF_03_0004: {path: '/change-svc', method: Tw.API_METHOD.POST},
  BFF_05_0001: {path: '/my-t/balances', method: Tw.API_METHOD.GET},
  BFF_05_0002: {path: '/my-t/balance-add-ons', method: Tw.API_METHOD.GET},
  BFF_05_0009: {path: '/core-balance/v1/data-sharings/balances', method: Tw.API_METHOD.GET},
  BFF_05_0010: {path: '/core-balance/v1/children', method: Tw.API_METHOD.GET},
  BFF_05_0011: {path: '/core-balance/v1/data-sharings/args-0', method: Tw.API_METHOD.POST},
  BFF_06_0004: {path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.POST},
  BFF_06_0005: {path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.DELETE},
  BFF_06_0006: {path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.GET},
  BFF_06_0007: {path: '/core-recharge/v1/refill-coupons', method: Tw.API_METHOD.PUT},
  BFF_06_0014: {path: '/core-recharge/v1/data-gift-balances', method: Tw.API_METHOD.GET},
  BFF_06_0015: {path: '/core-recharge/v1/data-gift-senders', method: Tw.API_METHOD.GET},
  BFF_06_0016: {path: '/core-recharge/v1/data-gifts', method: Tw.API_METHOD.POST},
  BFF_06_0017: {path: '/core-recharge/v1/data-gift-messages', method: Tw.API_METHOD.POST},
  BFF_06_0019: {path: '/core-recharge/v1/data-gift-receivers', method: Tw.API_METHOD.GET}
};

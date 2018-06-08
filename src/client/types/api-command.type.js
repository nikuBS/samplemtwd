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
  BFF_05_0002: {path: '/my-t/balance-add-ons', method: Tw.API_METHOD.GET},
  BFF_05_0009: {path: '/core-balance/v1/data-sharings/balances', method: Tw.API_METHOD.GET},
  BFF_05_0010: {path: '/core-balance/v1/children', method: Tw.API_METHOD.GET},
  BFF_05_0011: {path: '/core-balance/v1/data-sharings/args-0', method: Tw.API_METHOD.POST}
};

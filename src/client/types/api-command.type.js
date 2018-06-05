Tw.API_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

Tw.API_CMD = {
  TEST_GET_USAGE_BTN: { path: '/usageBtn', method: Tw.API_METHOD.GET },
  SESSION_CHECK: { path: '/mock/session', method: Tw.API_METHOD.GET},
  BFF_05_0010: { path: '/core-balance/v1/children', method: Tw.API_METHOD.GET },
};

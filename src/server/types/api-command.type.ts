export enum API_METHOD {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export enum API_PROTOCOL {
  HTTP = 'http',
  HTTPS = 'https'
}

export enum API_SERVER {
  BFF = 'BFF_SERVER',
  FAKE = 'FAKE_SERVER'
}

export const API_CMD = {
  TEST_LOGIN: { path: '/test-login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  GET_USAGE: {
    path: '/core-balance/vi/services/balance/details',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },

  FAKE_GET: { path: '/comments', method: API_METHOD.GET, server: API_SERVER.FAKE, bypass: true },
  FAKE_POST: { path: '/posts', method: API_METHOD.POST, server: API_SERVER.FAKE, bypass: true },
  FAKE_GET_1: { path: '/posts/{args[0]}/{args[1]}', method: API_METHOD.GET, server: API_SERVER.FAKE, bypass: false }
};

export const API_CODE = {
  CODE_00: '00',    // success
  CODE_200: '200',
  CODE_400: '400'
};

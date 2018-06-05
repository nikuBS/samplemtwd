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
  TEST = 'TEST_SERVER'
}

export const API_CMD = {
  SESSION_CHECK: { path: '/mock/session', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0001: { path: '/test-login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0002: { path: '/svc-catalog', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_03_0003: { path: '/svc-catalog/detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_03_0004: { path: '/change-svc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0005: { path: '/selected-svc', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0001: { path: '/my-t/balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0002: { path: '/my-t/balance-add-ons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0003: { path: '/core-balance/v1/troaming-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0004: { path: '/core-balance/v1/data-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0005: { path: '/core-balance/v1/tdata-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0006: { path: '/core-balance/v1/data-top-up', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0007: { path: '/core-balance/v1/ting', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0008: { path: '/core-balance/v1/data-discount', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0009: { path: '/core-balance/v1/data-sharings/balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0010: { path: '/core-balance/v1/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0011: { path: '/core-balance/v1/data-sharings', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },

  TEST_GET_USAGE_BTN: { path: '/usageBtn', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true }
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

export const API_ERROR_CODE = {
  BLN0001: 'BLN0001', // 잔여기본통화 조회횟수 초과
  BLN0002: 'BLN0002', // 정지이력
  BLN0003: 'BLN0003', // 조회불가대상
  BLN0004: 'BLN0004' // 조회불가대상
};

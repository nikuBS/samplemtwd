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
  SAMPLE: { path: '/books/v1/volumes', method: API_METHOD.GET, server: API_SERVER.BFF },
  FAKE_GET: { path: '/comments', method: API_METHOD.GET, server: API_SERVER.FAKE },
  FAKE_POST: { path: '/posts', method: API_METHOD.POST, server: API_SERVER.FAKE }
};

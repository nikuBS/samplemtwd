const environment = {
  development: {
    BFF_SERVER: {
      url: '211.188.180.73',
      protocol: 'http',
      port: 31010
    },
    CDN: 'http://localhost:3001',
    FAKE_SERVER: {
      url: 'jsonplaceholder.typicode.com',
      protocol: 'http',
      port: 80
    },
    REDIS: {
      host: '150.28.79.190',
      port: 6379,
      pass: 'redis-twd',
      db: 15
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt'
  },
  qa: {
    BFF_SERVER: {
      url: 'bff-spring-mtw-dev-bff',
      protocol: 'http',
      port: 80
    },
    CDN: '/cdn',
    FAKE_SERVER: {
      url: 'jsonplaceholder.typicode.com',
      protocol: 'http',
      port: 80
    },
    REDIS: {},
    TEMP_CDN: 'http://tstore.rbipt.com/skt'
  },
  production: {
    BFF_SERVER: {
      url: '',
      protocol: '',
      port: 80
    },
    CDN: '',
    FAKE_SERVER: {
      url: 'jsonplaceholder.typicode.com',
      protocol: 'http',
      port: 80
    },
    REDIS: {},
    TEMP_CDN: 'http://tstore.rbipt.com/skt'
  }
};

export default environment;

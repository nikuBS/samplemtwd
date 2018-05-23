const environment = {
  development: {
    BFF_SERVER: {
      url: 'www.googleapis.com',
      protocol: 'https',
      port: 443
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
    }
  },
  qa: {
    BFF_SERVER: {
      url: '',
      protocol: '',
      port: 80
    },
    CDN: '/cdn',
    FAKE_SERVER: {
      url: 'jsonplaceholder.typicode.com',
      protocol: 'http',
      port: 80
    },
    REDIS: {}
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
    REDIS: {}
  }
};

export default environment;

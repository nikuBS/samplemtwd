const environment = {
  development: {
    CDN: 'http://localhost:3001',
    REDIS: {
      host: '150.28.79.190',
      port: 6379,
      pass: 'redis-twd',
      db: 15
    }
  },
  qa: {
    CDN: '',
    REDIS: {}
  },
  production: {
    CDN: '',
    REDIS: {}
  }
};

export default environment;

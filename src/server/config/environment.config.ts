const environment = {
  development: {
    BFF_SERVER: {
      url: '211.188.180.73',
      protocol: 'http',
      port: 31010
    },
    CDN: 'http://localhost:3001',
    TEST_SERVER: {
      url: '150.28.69.26',
      protocol: 'http',
      port: 3002
    },
    REDIS: {
      host: '211.188.180.73',
      port: 31200,
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
    REDIS: {
      host: 'dev-backing-redis-mobile-ibm-redis-ha-dev-sentinel.mtw-dev-cch.svc.cluster.local',
      port: 26379,
      pass: 'redis-twd',
      db: 15
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt'
  },
  production: {
    BFF_SERVER: {
      url: '',
      protocol: '',
      port: 80
    },
    CDN: '',
    REDIS: {},
    TEMP_CDN: 'http://tstore.rbipt.com/skt'
  }
};

export default environment;

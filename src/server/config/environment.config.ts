const environment = {
  local: {
    BFF_SERVER: {
      url: '211.188.180.73',
      protocol: 'http',
      port: 31020
    },
    CDN: 'http://localhost:3001',
    REDIS: {
      host: '211.188.180.73',
      port: 32200,
      db: 15
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
  },
  development: {
    BFF_SERVER: {
      url: 'bff-spring.mtw-dev-bff.svc.cluster.local',
      protocol: 'http',
      port: 80
    },
    CDN: '',
    REDIS: {
      host: 'dev-backing-redis-mobile-ibm-redis-ha-dev-master-svc.mtw-dev-rdf.svc.cluster.local',
      port: 6379,
      db: 15
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt'
  },
  qa: {
    BFF_SERVER: {
      url: 'bff-spring.mtw-stg-bff.svc.cluster.local',
      protocol: 'http',
      port: 80
    },
    CDN: '',
    REDIS: {
      host: 'stg-backing-redis-mobile-ibm-redis-ha-dev-master-svc.mtw-stg-rdf.svc.cluster.local',
      port: 6379,
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

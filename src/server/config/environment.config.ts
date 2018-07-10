const environment = {
  local: {
    BFF_SERVER: 'http://211.188.180.73:31020',
    CDN: '',
    REDIS: {
      host: '211.188.180.73',
      port: 32200,
      db: 15
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com'
  },
  development: {
    BFF_SERVER: 'http://bff-spring.mtw-dev-bff.svc.cluster.local',
    CDN: '',
    REDIS: {
      host: 'dev-backing-redis-mobile-ibm-redis-ha-dev-master-svc.mtw-dev-rdf.svc.cluster.local',
      port: 6379,
      db: 15
    },

    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com'
  },
  qa: {
    BFF_SERVER: 'http://bff-spring.mtw-stg-bff.svc.cluster.local',
    CDN: '',
    REDIS: {
      host: 'stg-backing-redis-mobile-ibm-redis-ha-dev-master-svc.mtw-stg-rdf.svc.cluster.local',
      port: 6379,
      db: 15
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com'
  },
  production: {
    BFF_SERVER: '',
    CDN: '',
    REDIS: {},
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: '',
    TEST_SERVER: ''
  }
};

export default environment;

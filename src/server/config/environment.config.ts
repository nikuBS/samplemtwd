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
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    TID_REDIRECT: 'http://m.tworld.co.kr:3000',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441'
  },
  development: {
    BFF_SERVER: 'http://bff-spring.mtw-stg-bff.svc.cluster.local',
    CDN: '',
    REDIS: {
      host: 'stg-backing-redis-mobile-ibm-redis-ha-dev-master-svc.mtw-stg-rdf.svc.cluster.local',
      port: 6379,
      db: 15
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    TID_REDIRECT: 'http://icp-dev.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441'
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
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    TID_REDIRECT: 'http://icp-stg.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441'
  },
  production: {
    BFF_SERVER: '',
    CDN: '',
    REDIS: {},
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: '',
    TEST_SERVER: '',
    TID_REDIRECT: '',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441'
  }
};

export default environment;

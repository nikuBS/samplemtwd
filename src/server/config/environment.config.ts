const environment = {
  local: {
    BFF_SERVER: 'http://61.250.19.37:31020',
    // BFF_SERVER: 'http://211.188.180.73:31020',
    CDN: '',
    REDIS: {
      host: '211.188.180.73',
      port: 31200,
      db: 15
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    DOMAIN: 'http://m.tworld.co.kr:3000',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SIGNGATE: {
      host: '61.250.20.204',
      port: 9014
    }
  },
  development: {
    BFF_SERVER: 'http://bff-spring',
    // BFF_SERVER: 'http://211.188.180.73:31309',
    CDN: '',
    REDIS: {
      host: 'dev-backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-dev-nod',
      port: 6379,
      db: 0
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    DOMAIN: 'http://icp-dev.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SIGNGATE: {
      host: '61.250.20.204',
      port: 9014
    }
  },
  staging: {
    BFF_SERVER: 'http://bff-spring',
    // BFF_SERVER: 'http://211.188.180.73:31309',
    CDN: '',
    REDIS: {
      host: 'stg-backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-stg-nod',
      port: 6379,
      db: 0
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    DOMAIN: 'http://icp-stg.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SIGNGATE: {
      host: '61.250.20.204',
      port: 9014
    }
  },
  production: {
    BFF_SERVER: 'http://bff-spring',
    CDN: '',
    REDIS: {
      host: 'backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-prd-nod',
      port: 6379,
      db: 0
    },
    TEMP_CDN: 'http://tstore.rbipt.com/skt',
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    DOMAIN: 'http://icp-stg.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SIGNGATE: {
      host: 'relay.signgate.com',
      port: 443
    }
  }
};

export default environment;

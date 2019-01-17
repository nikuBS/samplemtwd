const environment = {
  local: {
    BFF_SERVER: 'http://61.250.19.37:31020',  // 개발 61.250.19.37:31010
    BFF_SERVER_G: 'http://211.188.180.73:31010',
    CDN: 'http://localhost:3001',
    CDN_MANIFEST: 'http://localhost:3001',
    REDIS: {
      host: '61.250.19.37',
      // port: 31300,
      port: 32300,
      db: 0
    },
    REDIS_TOS: {
      host: '61.250.19.37',
      port: 32400,
      db: 0
    },
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    SEARCH_SERVER: 'http://61.250.22.114:8180',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    // DOMAIN: 'http://m.tworld.co.kr:3000',
    DOMAIN_G: 'm-dev.tworld.co.kr:3000',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SIGNGATE: {
      host: '61.250.20.204',
      port: 9014
    }
  },
  development: {
    BFF_SERVER: 'http://bff-spring',
    // BFF_SERVER: 'http://211.188.180.73:31309',
    BFF_SERVER_G: 'http://bff-spring-g',
    CDN: 'https://cdnm-dev.tworld.co.kr',
    CDN_MANIFEST: 'http://61.250.20.69',
    REDIS: {
      host: 'dev-backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-dev-nod',
      port: 6379,
      db: 0
    },
    REDIS_TOS: {
      host: 'dev-backing-redis-tos-ibm-redis-ha-dev-master-svc.mtw-dev-tos',
      port: 6379,
      db: 0
    },
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    SEARCH_SERVER: 'http://61.250.22.114:8080',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    // DOMAIN: 'http://icp-dev.tworld.co.kr',
    DOMAIN_G: 'devgm.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SIGNGATE: {
      host: '61.250.20.204',
      port: 9014
    }
  },
  staging: {
    BFF_SERVER: 'http://bff-spring',
    // BFF_SERVER: 'http://211.188.180.73:31309',
    BFF_SERVER_G: 'http://bff-spring-g',
    CDN: 'https://cdnm-stg.tworld.co.kr',
    CDN_MANIFEST: 'http://203.236.19.151',
    REDIS: {
      host: 'stg-backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-stg-nod',
      port: 6379,
      db: 0
    },
    REDIS_TOS: {
      host: 'stg-backing-redis-tos-ibm-redis-ha-dev-master-svc.mtw-stg-tos',
      port: 6379,
      db: 0
    },
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    SEARCH_SERVER: 'http://61.250.22.114:8080',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    // DOMAIN: 'http://icp-stg.tworld.co.kr',
    DOMAIN_G: 'icp-stggm.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SIGNGATE: {
      host: '61.250.20.204',
      port: 9014
    }
  },
  production: {
    BFF_SERVER: 'http://bff-spring',
    BFF_SERVER_G: 'http://bff-spring-g',
    CDN: 'https://cdnm.tworld.co.kr',
    CDN_MANIFEST: 'http://203.236.19.151',
    REDIS: {
      // host: 'backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-prd-nod',
      // port: 6379,
      host: '61.250.19.37',
      port: 32300,
      db: 0
    },
    REDIS_TOS: {
      // host: 'backing-redis-tos-ibm-redis-ha-dev-master-svc.mtw-prd-tos',
      // port: 6379,
      host: '61.250.19.37',
      port: 32400,
      db: 0
    },
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    SEARCH_SERVER: 'http://61.250.22.114:8080',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    // DOMAIN: 'https://beta.m.tworld.co.kr',
    DOMAIN_G: 'appg.m.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SIGNGATE: {
      host: 'relay.signgate.com',
      port: 443
    }
  }
};

export default environment;

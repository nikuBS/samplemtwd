const environment = {
  local: {
    BFF_SERVER: 'http://61.250.19.37:31020',
    BFF_SERVER_G: 'http://211.188.180.73:31010',
    CDN: 'http://localhost:3001',
    CDN_ORIGIN: 'http://localhost:3001',
    SHORTCUT: 'skt.sh:3000',
    REDIS: {
      host: '61.250.19.37',
      // port: 31300,
      port: 32300,
      password: '993d2ac0c060da72f0f8298aa4c11ece',
      db: 0
    },
    REDIS_TOS: {
      host: '61.250.19.37',
      port: 32400,
      db: 0
    },
    REDIS_PWD_KEY: 'cbbfc0a5-099e-4d03-8028-a18263f2b2d6',  // Will be removed
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    SEARCH_SERVER: 'http://211.188.181.123:8080',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    // DOMAIN: 'http://m.tworld.co.kr:3000',
    DOMAIN_GAPP: 'm-dev.tworld.co.kr:3000',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SKPAY_USER: 'https://stg-auth.11pay.co.kr/pages/js/v3/lib/crypto/encryptedUserAgent.js',
    SKPAY_PAY: 'https://stg-auth.11pay.co.kr/pages/skpay/SKpaySDK.js',
    SIGNGATE: {
      host: '61.250.20.26',
      port: 9014
    }
  },
  dev: {
    BFF_SERVER: 'http://bff-spring-mobile',
    // BFF_SERVER: 'http://211.188.180.73:31309',
    BFF_SERVER_G: 'http://bff-spring-mobile-g',
    CDN: 'https://cdnm-dev.tworld.co.kr',
    CDN_ORIGIN: 'http://61.250.20.69',
    SHORTCUT: 'skt.sh',
    REDIS: {
      host: 'dev-backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-dev-nod',
      port: 6379,
      password: 'a935fdca4ac876095bea69cda9ba08c2',
      db: 0
    },
    REDIS_SENTINEL: {
      host: 'dev-backing-redis-node-ibm-redis-ha-dev-sentinel.mtw-dev-nod',
      name: 'mymaster',
      port: 26379
    },
    REDIS_TOS: {
      host: 'dev-backing-redis-tos-ibm-redis-ha-dev-master-svc.mtw-dev-tos',
      port: 6379,
      db: 0
    },
    REDIS_TOS_SENTINEL: {
      host: 'dev-backing-redis-tos-ibm-redis-ha-dev-sentinel.mtw-dev-tos',
      name: 'mymaster',
      port: 26379
    },
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    SEARCH_SERVER: 'http://211.188.181.123:8080',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    // DOMAIN: 'http://icp-dev.tworld.co.kr',
    DOMAIN_GAPP: 'devgm.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SKPAY_USER: 'https://stg-auth.11pay.co.kr/pages/js/v3/lib/crypto/encryptedUserAgent.js',
    SKPAY_PAY: 'https://stg-auth.11pay.co.kr/pages/skpay/SKpaySDK.js',
    SIGNGATE: {
      host: '61.250.20.26',
      port: 9014
    }
  },
  stg: {
    BFF_SERVER: 'http://bff-spring-mobile',
    // BFF_SERVER: 'http://211.188.180.73:31309',
    BFF_SERVER_G: 'http://bff-spring-mobile-g',
    CDN: 'https://cdnm-stg.tworld.co.kr',
    CDN_ORIGIN: 'http://203.236.19.151',
    SHORTCUT: 'skt.sh',
    REDIS: {
      host: 'stg-backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-stg-nod',
      port: 6379,
      password: '993d2ac0c060da72f0f8298aa4c11ece',
      db: 0
    },
    REDIS_SENTINEL: {
      host: 'stg-backing-redis-node-ibm-redis-ha-dev-sentinel.mtw-stg-nod',
      name: 'mymaster',
      port: 26379
    },
    REDIS_TOS: {
      host: 'stg-backing-redis-tos-ibm-redis-ha-dev-master-svc.mtw-stg-tos',
      port: 6379,
      db: 0
    },
    REDIS_TOS_SENTINEL: {
      host: 'stg-backing-redis-tos-ibm-redis-ha-dev-sentinel.mtw-stg-tos',
      name: 'mymaster',
      port: 26379
    },
    TID_SERVER: 'https://auth-stg.skt-id.co.kr',
    SEARCH_SERVER: 'http://211.188.181.123:8080' ,
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    // DOMAIN: 'http://icp-stg.tworld.co.kr',
    DOMAIN_GAPP: 'icp-stggm.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SKPAY_USER: 'https://stg-auth.11pay.co.kr/pages/js/v3/lib/crypto/encryptedUserAgent.js',
    SKPAY_PAY: 'https://stg-auth.11pay.co.kr/pages/skpay/SKpaySDK.js',
    SIGNGATE: {
      host: '61.250.20.26',
      port: 9014
    }
  },
  prd: {
    BFF_SERVER: 'http://bff-spring-mobile',
    BFF_SERVER_G: 'http://bff-spring-mobile-g',
    CDN: 'https://cdnm.tworld.co.kr',
    CDN_ORIGIN: 'http://203.236.19.60',
    SHORTCUT: 'skt.sh',
    REDIS: {
      host: 'backing-redis-node-ibm-redis-ha-dev-master-svc.mtw-prd-nod',
      port: 6379,
      password: 'd86fdf7bd110811a08aab1106b1aa217',
      db: 0
    },
    REDIS_SENTINEL: {
      host: 'backing-redis-node-ibm-redis-ha-dev-sentinel.mtw-prd-nod',
      name: 'mymaster',
      port: 26379
    },
    REDIS_TOS: {
      host: 'backing-redis-tos-ibm-redis-ha-dev-master-svc.mtw-prd-tos',
      port: 6379,
      db: 0
    },
    REDIS_TOS_SENTINEL: {
      host: 'backing-redis-tos-ibm-redis-ha-dev-sentinel.mtw-prd-tos',
      name: 'mymaster',
      port: 26379
    },
    TID_SERVER: 'https://auth.skt-id.co.kr',
    SEARCH_SERVER: 'http://211.188.181.124',
    TEST_SERVER: 'https://jsonplaceholder.typicode.com',
    // DOMAIN: 'https://beta.m.tworld.co.kr',
    DOMAIN_GAPP: 'gapp.tworld.co.kr',
    DOMAIN_GWEB: 'gm.tworld.co.kr',
    TMAP: 'https://api2.sktelecom.com/tmap/js?version=1&format=javascript&appKey=ecfeceac-3660-4618-bc3b-37a11f952441',
    SKPAY_USER: 'https://pay-auth.sk-pay.co.kr/pages/js/v3/lib/crypto/encryptedUserAgent.js',
    SKPAY_PAY: 'https://pay-auth.sk-pay.co.kr/pages/skpay/SKpaySDK.js',
    SIGNGATE: {
      host: 'relay.signgate.com',
      port: 443
    }
  }
};

export default environment;

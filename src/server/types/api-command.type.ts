export enum API_METHOD {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export enum API_SERVER {
  BFF = 'BFF_SERVER',
  TID = 'TID_SERVER',
  SEARCH = 'SEARCH_SERVER',
  TEST = 'TEST_SERVER'
}

export enum API_VERSION {
  V1 = 'v1',
  V2 = 'v2'
}

export const API_CMD = {
  // search
  SEARCH_APP: { path: '/search/tworld/mobile-app', method: API_METHOD.GET, server: API_SERVER.SEARCH, bypass: true },
  SEARCH_WEB: { path: '/search/tworld/mobile-web', method: API_METHOD.GET, server: API_SERVER.SEARCH, bypass: true },
  RELATED_KEYWORD: { path: '/search/tworld/recommend', method: API_METHOD.GET, server: API_SERVER.SEARCH, bypass: true },
  POPULAR_KEYWORD: { path: '/search/tworld/popword', method: API_METHOD.GET, server: API_SERVER.SEARCH, bypass: true },
  SEARCH_AUTO_COMPLETE: { path: '/search/tworld/autocomplete', method: API_METHOD.GET, server: API_SERVER.SEARCH, bypass: true },
  SEARCH_STACK_USER_CLICK: { path: '/search/tworld/log/save', method: API_METHOD.GET, server: API_SERVER.SEARCH, bypass: true },

  BFF_INFO: { path: '/actuator/info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_VERSION: { path: '/actuator/version/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // SPRINT #3
  BFF_03_0003_C: { path: '/svc-catalog/detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004_C: { path: '/change-svc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0005_C: { path: '/selected-svc', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0023_C: { path: '/core-recharge/:version/refill-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  // COMMON
  BFF_01_0002: { path: '/:version/common/sessions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0003: { path: '/:version/common/selected-sessions', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: false },
  BFF_01_0005: { path: '/:version/common/selected-sessions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false, native: true },
  BFF_01_0006: { path: '/core-modification/:version/address/legal-dongs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0007: { path: '/core-modification/:version/address/legal-dongs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0008: { path: '/core-modification/:version/address/street-names', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0009: { path: '/core-modification/:version/address/mailboxes', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0010: { path: '/core-modification/:version/address/lot-numbers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0011: { path: '/core-modification/:version/address/buildings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0012: { path: '/core-modification/:version/address/standard', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0013: { path: '/core-modification/:version/address/standard', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0014: { path: '/core-auth/:version/auth-sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0015: { path: '/:version/auth/skt-sms', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0016: { path: '/core-auth/:version/noti-sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0017: { path: '/core-auth/:version/auth/email', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0018: { path: '/:version/auth/email-authentication', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0019: { path: '/core-auth/:version/auth/motp', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0020: { path: '/:version/auth/motp/auth', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0021: { path: '/core-auth/:version/auth/motp', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0022: { path: '/:version/auth/nice/ipin/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0023: { path: '/:version/auth/nice/ipin/result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0024: { path: '/:version/auth/nice/sms/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0025: { path: '/:version/auth/nice/sms/result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0026: { path: '/:version/cert/success', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0027: { path: '/:version/pwd-cert-chk', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0028: { path: '/core-auth/:version/auth-sms-finance', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0029: { path: '/:version/auth/secure/client-key', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0030: { path: '/:version/auth/secure/server-key', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0031: { path: '/registrationrequestfromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0032: { path: '/registrationresponsefromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0033: { path: '/authenticationrequestfromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0034: { path: '/authenticationresponsefromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0035: { path: '/:version/cert/app', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0036: { path: '/:version/cert/info', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0037: { path: '/core-auth/:version/auth-sms-corporation', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0038: { path: '/deregistrationrequestfromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0039: { path: '/:version/bpcp', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0040: { path: '/core-auth/:version/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0042: { path: '/:version/cancel-refund', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0043: { path: '/core-bill/:version/refund/refund-account-insert', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0044: { path: '/core-bill/:version/refund/donation-insert', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0045: { path: '/core-bill/:version/bill-pay/bank-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0046: { path: '/core-modification/:version/uscan/file-upload', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0047: { path: '/core-auth/:version/anonymous/ipin/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0048: { path: '/:version/auth/anonymous/ipin/result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0049: { path: '/core-auth/:version/anonymous/exsms/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0050: { path: '/:version/auth/anonymous/exsms/result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0051: { path: '/core-auth/:version/refund/skt-auth-sms/send', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0052: { path: '/:version/refund/skt-auth-sms/confirm', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0053: { path: '/:version/captcha/image', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, responseType: 'arraybuffer' },
  BFF_01_0054: { path: '/:version/captcha/audio', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, responseType: 'arraybuffer' },
  BFF_01_0055: { path: '/:version/captcha/answer/:args0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0057: { path: '/:version/auth/skt-sms/representative', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0058: { path: '/:version/auth/skt-sms/legal-agent', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0059: { path: '/v1/auth/skt-sms/key-in', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0061: { path: '/core-auth/:version/user-email', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0063: { path: '/:version/auth/skt-sms/common', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0064: { path: '/:version/mask-methods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0065: { path: '/core-modification/:version/share-scuturl', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // AUTH
  BFF_03_0000_TEST: { path: '/:version/load-test-login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0000: { path: '/:version/test-login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0001: { path: '/:version/logout', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_03_0002: { path: '/:version/user/account-auth-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0003: { path: '/:version/user/accounts', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004: { path: '/core-auth/:version/services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, store: true },
  BFF_03_0005: { path: '/:version/user/services', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: false },
  BFF_03_0006: { path: '/:version/user/nick-names/:args0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0007: { path: '/:version/user/tid-keys', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_03_0007_old: { path: '/:version/user/old-tid-keys', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_03_0008: { path: '/:version/user/sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false, native: true },
  BFF_03_0009: { path: '/:version/user/service-password-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0010: { path: '/:version/user/locks', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0011: { path: '/core-auth/:version/nationalities', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0012: { path: '/:version/user/biz-auth-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0013: { path: '/:version/user/biz-services', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0014: { path: '/core-auth/:version/marketing-offer-subscriptions/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0015: { path: '/core-auth/:version/marketing-offer-subscriptions/:args0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0016: { path: '/:version/my-t/service-passwords', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0017: { path: '/:version/user/login/android', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0018: { path: '/:version/user/login/ios', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0019: { path: '/core-auth/:version/users/:args0/otp', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0020: { path: '/core-auth/:version/passwords-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0021: { path: '/core-auth/:version/tworld-term-agreements', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0022: { path: '/core-auth/:version/tworld-term-agreements', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0023: { path: '/core-auth/:version/t-noti-term-agreements', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0024: { path: '/core-auth/:version/t-noti-term-agreements', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0025: { path: '/core-auth/:version/add-fcm-user-info', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_03_0026: { path: '/core-auth/:version/requestRegistFcmClickInfo', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_03_0027: { path: '/core-auth/:version/users/otp', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0028: { path: '/core-auth/:version/free-sms-availability/:args0', method: API_METHOD.GET,
    server: API_SERVER.BFF, bypass: true, native: true },
  BFF_03_0029: { path: '/core-auth/:version/exposable-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0030: { path: '/core-auth/:version/exposed-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0032: { path: '/core-auth/:version/tworld-terms', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // MainHome T-Notify
  BFF_04_0001: { path: '/core-membership/:version/card/homeinfo', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, store: true },
  BFF_04_0002: { path: '/core-product/:version/t-notice/prod-chg-hst', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_04_0003: { path: '/core-modification/:version/quick-menu/saveInfo', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_04_0004: { path: '/core-auth/:version/get-fcm-push-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_04_0005: { path: '/core-modification/:version/quick-menu/getMbrCond', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_04_0006: { path: '/core-bill/v1/use-contents/total-amt', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_04_0007: { path: '/core-bill/v1/micro-pay/total-amt', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_04_0008: { path: '/core-bill/v1/bill-pay/use-amt-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_04_0009: { path: '/core-bill/v1/bill-pay/bill-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // MYT
  BFF_05_0001: { path: '/:version/my-t/balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true, store: true },
  BFF_05_0002: { path: '/core-balance/:version/balance-add-ons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0003: { path: '/core-balance/:version/troaming-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0004: { path: '/core-balance/:version/data-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0005: { path: '/core-balance/:version/tdata-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0006: { path: '/core-balance/:version/data-top-up', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0007: { path: '/core-balance/:version/ting', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0008: { path: '/core-balance/:version/data-discount', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0009: { path: '/core-balance/:version/data-sharings/child', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0010: { path: '/core-balance/:version/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0011: { path: '/core-balance/:version/tdata-sharings/:args0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0013: { path: '/core-bill/:version/pps-card', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0014: { path: '/core-balance/:version/pps-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0020: { path: '/core-bill/:version/bill-pay/recent-bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0021: { path: '/core-bill/:version/bill-pay/recent-usages', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0028: { path: '/core-bill/:version/bill-reissue', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0030: { path: '/core-bill/:version/bill-pay/unpaid-bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0031: { path: '/core-bill/:version/bill-pay/payment-possible-day', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0032: { path: '/core-bill/:version/bill-pay/payment-possible-day-input', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0033: { path: '/core-bill/:version/bill-pay/autopay-schedule', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0034: { path: '/core-bill/:version/bill-pay/suspension-cancel', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0036: { path: '/core-bill/:version/bill-pay/bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0037: { path: '/core-bill/:version/bill-pay/suspension', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0038: { path: '/core-bill/:version/bill-pay/donation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0039: { path: '/core-bill/:version/bill-types-return-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0039_N: { path: '/core-bill/:version/bill-types-return', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0040: {
    path: '/core-product/:version/services/wireless/addition/:args0',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_05_0044: { path: '/core-bill/:version/bill-pay/roaming', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0045: { path: '/core-bill/:version/bill-pay/call-gift', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0047: { path: '/core-bill/:version/bill-pay/used-amounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0048: { path: '/core-bill/:version/bill-reissue', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0022: { path: '/core-bill/:version/hotbills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0024: { path: '/core-auth/:version/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0025: { path: '/core-bill/:version/bill-types', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0027: { path: '/core-bill/:version/bill-types', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0035: { path: '/core-bill/:version/hotbill/fee/hotbill-request', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0049: { path: '/core-bill/:version/integrated-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0050: { path: '/core-bill/:version/wire-bill-types', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0051: { path: '/core-bill/:version/wire-bill-reissue/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0052: { path: '/core-bill/:version/wire-bill-reissue/', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0058: { path: '/core-bill/:version/accounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0059: { path: '/core-bill/:version/recent-usage-fee-pattern', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0060: { path: '/core-modification/:version/no-contract-plan-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0061: { path: '/core-modification/:version/my-svc-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false, store: true},
  BFF_05_0062: { path: '/core-modification/:version/wire-network-notification', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0063: { path: '/core-modification/:version/myinfo/discount-infos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0064: { path: '/core-bill/:version/use-contents/hist-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0066: { path: '/core-bill/:version/use-contents/limit-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0067: { path: '/core-bill/:version/use-contents/limit-up', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0068: { path: '/:version/my-t/my-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false, store: true },

  BFF_05_0074: { path: '/core-modification/:version/use-data-patterns', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0076: { path: '/core-modification/:version/myinfo/discount-infos-month', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0078: { path: '/core-balance/:version/band-data-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0079: { path: '/core-bill/:version/micro-pay/hist-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0080: { path: '/core-bill/:version/micro-pay/requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0081: { path: '/core-bill/:version/micro-pay/requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0082: { path: '/core-bill/:version/micro-pay/auto-set', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0083: { path: '/core-bill/:version/micro-pay/requests', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0085: { path: '/core-bill/:version/micro-pay/password-status', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0086: { path: '/core-bill/:version/micro-pay/password-create', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0087: { path: '/core-bill/:version/micro-pay/password-changes', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0089: { path: '/core-bill/:version/prepayInfo', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0091: { path: '/core-bill/:version/recent-usage-pattern', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0092: {
    path: '/core-modification/:version/wire-network-notification-smsinfo',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_05_0093: { path: '/core-bill/:version/micro-pay/cphist-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0094: { path: '/core-modification/:version/combination-discounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0096: { path: '/core-product/:version/benefit-suggestions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0098: { path: '/core-membership/:version/card-vip-benefit', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0100: { path: '/core-bill/:version/rainbow-point-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0122: { path: '/core-bill/:version/cookiz-ting-point-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0101: { path: '/core-bill/:version/rainbow-point-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0102: { path: '/core-bill/:version/rainbow-point-adjustments', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0103: { path: '/core-bill/:version/rainbow-point-families', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0104: { path: '/core-bill/:version/rainbow-point-transfers', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0105: { path: '/core-bill/:version/rainbow-point-transfers/:args0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0106: { path: '/core-modification/:version/bill-discounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0107: {
    path: '/core-modification/:version/my-discount-benefit/support-agree-info',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_05_0108: {
    path: '/core-modification/:version/my-discount-benefit/choice-agree-info',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_05_0110: { path: '/core-modification/:version/benefit/ltrm-scrb', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0111: { path: '/core-modification/:version/benefit/wlf-cust-dc', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0115: { path: '/core-bill/:version/cookiz-ting-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0120: { path: '/core-bill/:version/military-service-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0121: { path: '/core-bill/:version/military-service-point-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0123: { path: '/core-product/:version/services/unavailableness', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0124: {
    path: '/core-membership/:version/my-membership-benefit/check-membership',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_05_0125: { path: '/core-product/:version/fee-plans/change-notices', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0126: { path: '/core-product/:version/fee-plans/change-notices', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0127: { path: '/core-product/:version/fee-plans/change-notices', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0128: { path: '/core-product/:version/services/wire/fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0129: { path: '/core-product/:version/services/wire/additions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0130: { path: '/core-bill/:version/rainbow-point-adjustments', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0131: { path: '/core-bill/:version/rainbow-point-transfers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0132: { path: '/core-bill/:version/rainbow-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0133: { path: '/core-product/:version/services/combinations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0134: { path: '/core-product/:version/services/combinations/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0135: { path: '/core-product/:version/services/combinations/data-benefits', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0136: { path: '/core-product/:version/services/wireless/fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0137: { path: '/core-product/:version/services/wireless/additions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0138: { path: '/core-product/:version/services/combinations/data-sharings', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0139: { path: '/core-modification/:version/myinfo/wire-service-contracts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0140: { path: '/core-modification/:version/wire-agreements', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0141: { path: '/core-modification/:version/wire-agreements-penalty', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0142: { path: '/core-modification/:version/wire-agreements', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0143: { path: '/core-modification/:version/wire-agreements-changes', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0144: {
    path: '/core-product/:version/services/combinations/:args0/terminations',
    method: API_METHOD.PUT,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_05_0146: { path: '/core-bill/:version/bill-address', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0147: { path: '/core-bill/:version/bill-address-change', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0149: { path: '/core-modification/:version/phone-pause-states', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0150: { path: '/core-modification/:version/wire-troubles-cancel', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0151: { path: '/:version/my-t/phone-pause-states', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0152: { path: '/:version/my-t/phone-pause-states', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0153: { path: '/core-modification/:version/wire-products-changes', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0155: { path: '/core-modification/:version/myinfo/discount-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0156: { path: '/core-modification/:version/wire-troubles', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0157: { path: '/core-modification/:version/wire-troubles-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0158: { path: '/core-modification/:version/wire/penalty-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0159: { path: '/core-modification/:version//wireInfo/listGiftProvide', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0160: { path: '/core-modification/:version/myinfo/wire-free-call-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0161: { path: '/core-product/:version/services/wireless/additions/cnt', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0162: { path: '/core-modification/:version/myinfo/chg-wire-addr-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0163: { path: '/core-modification/:version/myinfo/chg-wire-addr', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0165: { path: '/core-modification/:version/wire/change-request', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0164: { path: '/core-modification/:version/wire-phone/chang-status', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0166: { path: '/core-product/:version/submain/additions/joininfos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0167: { path: '/core-modification/:version/wire-registration-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0168: { path: '/core-modification/:version/wire/prod-change', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0169: { path: '/core-modification/:version/myinfo/wire-pause-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0170: { path: '/core-modification/:version/myinfo/wire-set-pause', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0171: { path: '/core-modification/:version/myinfo/wire-remove-pause', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0172: { path: '/core-modification/:version/myinfo/get-wire-cancel-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0173: { path: '/core-modification/:version/myinfo/get-wire-cancel-fee', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0174: { path: '/core-modification/:version/myinfo/set-wire-cancel-service', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0175: { path: '/core-bill/:version/no-contract-plan-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0176: { path: '/core-bill/:version/micro-pay/requests-limit-down', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0177: { path: '/core-bill/:version/use-contents/limit-down', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0178: { path: '/core-modification/:version/wire-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0179: { path: '/core-product/:version/services/wire/additions/count', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0180: { path: '/core-modification/:version/new-number-notifications', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0182: { path: '/core-modification/:version/new-number-notifications', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0183: { path: '/core-modification/:version/new-number-notifications', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0184: { path: '/core-modification/:version/number-change/search', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0185: { path: '/core-modification/:version/number-change/process', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0186: { path: '/core-modification/:version/number-change/init', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0194: { path: '/core-modification/:version/longterm-phone-pause', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0195: { path: '/core-modification/:version/longterm-phone-pause', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0196: { path: '/core-modification/:version/loyalty-benefits', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0197: { path: '/core-modification/:version/longterm-phone-pause', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0198: { path: '/core-modification/:version/wire/cancel-request-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0199: { path: '/core-bill/:version/bill-types-email', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0200: { path: '/:version/autosms/custInfo', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0201: { path: '/core-balance/:version/troaming-data', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0202: { path: '/core-balance/:version/troaming-like-home', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0203: { path: '/core-bill/:version/bill-pay/bills-submain', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0204: { path: '/core-bill/:version/bill-pay/used-amounts-submain', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0205: { path: '/core-bill/:version/use-contents/auth/hist-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0206: { path: '/core-bill/:version/micro-pay/auth/hist-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },

  // RECHARGE
  BFF_06_0001: { path: '/core-recharge/:version/refill-coupons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0002: { path: '/core-recharge/:version/refill-usages', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0003: { path: '/core-recharge/:version/refill-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0004: { path: '/core-gift/:version/regular-data-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0005: { path: '/core-gift/:version/regular-data-gifts', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0006: { path: '/core-gift/:version/regular-data-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0007: { path: '/core-recharge/:version/refill-coupons', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_06_0008: { path: '/core-recharge/:version/refill-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0009: { path: '/core-recharge/:version/refill-options', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0010: { path: '/core-recharge/:version/data-gift-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0011: { path: '/core-recharge/:version/data-gift-requests', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0012: { path: '/core-recharge/:version/data-gift-request-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0013: { path: '/core-recharge/:version/data-gift-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0014: { path: '/core-gift/:version/data-gift-balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0015: { path: '/core-gift/:version/data-gift-senders', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0016: { path: '/core-gift/:version/data-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0017: { path: '/core-gift/:version/data-gift-messages', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0018: { path: '/core-gift/:version/data-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0019: { path: '/core-gift/:version/data-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0020: { path: '/core-recharge/:version/ting-gift-senders', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0021: { path: '/core-recharge/:version/ting-gift-blocks', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0022: { path: '/core-recharge/:version/ting-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0023: { path: '/core-recharge/:version/ting-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0024: { path: '/core-recharge/:version/ting-press-benefiters', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0025: { path: '/core-recharge/:version/ting-gift-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0026: { path: '/core-recharge/:version/ting-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0027: { path: '/core-recharge/:version/ting-gift-blocks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0028: { path: '/core-recharge/:version/ting-subscriptions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0029: { path: '/core-recharge/:version/ting-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0030: { path: '/core-recharge/:version/regular-ting-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0031: { path: '/core-recharge/:version/regular-ting-top-ups', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0032: { path: '/core-recharge/:version/ting-top-ups', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0033: { path: '/core-recharge/:version/ting-permissions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0034: { path: '/core-recharge/:version/data-limitation-subscriptions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0035: { path: '/core-recharge/:version/regular-data-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0036: { path: '/core-recharge/:version/data-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0037: { path: '/core-recharge/:version/regular-data-top-ups', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0038: { path: '/core-recharge/:version/data-limitations', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0039: { path: '/core-recharge/:version/data-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0040: { path: '/core-recharge/:version/regular-data-limitations', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0041: { path: '/core-recharge/:version/regular-data-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0042: { path: '/core-recharge/:version/data-top-ups', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0043: { path: '/core-recharge/:version/data-limitations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0044: { path: '/core-balance/:version/tfamily-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0045: { path: '/core-recharge/:version/tfamily-shareable-data', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0046: { path: '/core-recharge/:version/tfamily-sharings', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0047: { path: '/core-recharge/:version/regular-tfamily-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_06_0048: { path: '/core-recharge/:version/regular-tfamily-sharings', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0049: { path: '/core-recharge/:version/regular-tfamily-sharings', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0050: { path: '/core-recharge/:version/tfamily-sharing-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0051: {
    path: '/core-recharge/:version/tfamily-sharing-limitations/:args0',
    method: API_METHOD.DELETE,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_06_0052: { path: '/core-bill/:version/pps-cards', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0053: { path: '/core-bill/:version/pps-credit-cards', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0054: { path: '/core-bill/:version/pps-auto', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0055: { path: '/core-bill/:version/pps-auto', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0057: { path: '/core-bill/:version/pps-auto', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0058: { path: '/core-bill/:version/pps-data', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0059: { path: '/core-bill/:version/pps-data-auto', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0060: { path: '/core-bill/:version/pps-data-auto', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0061: { path: '/core-bill/:version/pps-data-auto', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0062: { path: '/core-bill/:version/pps-recharges', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0063: { path: '/core-bill/:version/pps-data-recharges', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0064: { path: '/core-bill/:version/pps-alram', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0065: { path: '/core-bill/:version/credit-cards', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0066: { path: '/core-product/:version/gift-refill-products', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0067: { path: '/core-bill/:version/pp-cards', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0068: { path: '/core-recharge/:version/ting-permissions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0069: { path: '/core-bill/:version/pps-recharges', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0070: { path: '/core-bill/:version/pps-data-recharges', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0071: { path: '/core-recharge/:version/tfamily-my-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_06_0072: { path: '/core-recharge/:version/tfamily-cancelable-data', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0073: { path: '/core-recharge/:version/tfamily-canceling-data', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0074: { path: '/core-recharge/:version/tfamily-canceling', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0075: { path: '/core-bill/v1/pps-alram', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0076: { path: '/core-bill/v1/pps-alram', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0077: { path: '/core-recharge/v1/refill-gift-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0078: { path: '/core-recharge/v1/5g-data-conversions', method: API_METHOD.GET, server: API_SERVER.BFF, native: true },
  BFF_06_0079: { path: '/core-recharge/v1/5g-convertible-data', method: API_METHOD.GET, server: API_SERVER.BFF, native: true },
  BFF_06_0080: { path: '/core-recharge/v1/5g-data-conversions', method: API_METHOD.POST, server: API_SERVER.BFF, native: true },
  BFF_06_0081: { path: '/core-recharge/v1/5g-data-conversions', method: API_METHOD.DELETE, server: API_SERVER.BFF, native: true },
  BFF_06_0082: { path: '/core-recharge/v1/5g-data-reservations', method: API_METHOD.POST, server: API_SERVER.BFF, native: true },
  BFF_06_0083: { path: '/core-recharge/v1/5g-data-reservations', method: API_METHOD.DELETE, server: API_SERVER.BFF, native: true },
  BFF_06_0084: { path: '/core-recharge/v1/5g-data-conversion-histories', method: API_METHOD.GET, server: API_SERVER.BFF, native: true},
  // PAYMENT
  BFF_07_0004: { path: '/core-bill/:version/cash-receipts-issue-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0005: { path: '/core-bill/:version/point-autopays-history/cashback', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0006: { path: '/core-bill/:version/point-autopays-history/tpoint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0007: { path: '/core-bill/:version/point-autopays-history/tpoint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0017: { path: '/core-bill/:version/bill-pay/tax-reprint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, store: true },
  BFF_07_0018: { path: '/core-bill/:version/bill-pay/tax-reprint-email', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0019: { path: '/core-bill/:version/bill-pay/tax-reprint-fax', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0021: { path: '/core-bill/:version/bill-pay/settle-unpaids', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0022: { path: '/core-bill/:version/bill-pay/autopay-banks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0023: { path: '/:version/payment/settle-pay-bank', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0024: { path: '/core-bill/:version/bill-pay/cardnum-validation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0025: { path: '/:version/payment/settle-pay-card', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0026: { path: '/core-bill/:version/bill-pay/settle-vbs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0027: { path: '/core-bill/:version/bill-pay/settle-vb-sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0028: { path: '/core-bill/:version/bill-pay/avail-point-search', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0029: { path: '/core-bill/:version/bill-pay/pay-ocb-tpoint-proc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0030: { path: '/core-bill/:version/payment/total-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0032: { path: '/core-bill/:version/payment/over-payment-refund-account', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0035: { path: '/core-bill/:version/payment/realtime-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0036: { path: '/core-bill/:version/payment/realtime-payment-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0037: { path: '/core-bill/:version/payment/auto-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0039: {
    path: '/core-bill/:version/payment/auto-integrated-account-payment',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0040: {
    path: '/core-bill/:version/payment/auto-integrated-payment-cancle-request',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0041: { path: '/core-bill/:version/ocbcard-info-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0042: { path: '/core-bill/:version/rainbow-point-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0043: { path: '/core-bill/:version/ocbcard-no-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0045: { path: '/core-bill/:version/ocb-point-onetime-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0046: { path: '/core-bill/:version/ocb-point-onetime-result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0047: { path: '/core-bill/:version/ocb-point-onetime-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0048: { path: '/core-bill/:version/rainbow-point-onetime-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0050: { path: '/core-bill/:version/rainbow-point-onetime-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0051: { path: '/core-bill/:version/ocb-point-autopay-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0052: { path: '/core-bill/:version/rainbow-point-autopay-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0054: { path: '/core-bill/:version/ocb-point-autopay-modify', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0055: { path: '/core-bill/:version/ocb-point-autopay-result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0056: { path: '/core-bill/:version/rainbow-point-autopay-change', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0058: { path: '/core-bill/:version/ocb-point-onetime-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0059: { path: '/core-bill/:version/rainbow-point-onetime-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0060: { path: '/core-bill/:version/auto-payments', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0061: { path: '/:version/auto-payments', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0062: { path: '/:version/auto-payments', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0063: { path: '/core-bill/:version/auto-payments', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_07_0064: { path: '/core-bill/:version/autopay/db-req', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0065: { path: '/core-bill/:version/autopay/pay-cycl-chg', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0068: { path: '/core-bill/:version/autopay/card-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0069: { path: '/core-bill/:version/payment/auto-integrated-payment/cancel', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0070: { path: '/core-bill/:version/payment/auto-integrated-payment/account', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0071: { path: '/core-bill/:version/micro-prepay/hist-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0072: { path: '/core-bill/:version/micro-prepay/auto-prepay-status', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0073: { path: '/core-bill/:version/micro-prepay/requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0074: { path: '/core-bill/:version/micro-prepay/process', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0075: { path: '/core-bill/:version/micro-prepay/auto-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0076: { path: '/core-bill/:version/micro-prepay/auto-process', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0077: { path: '/core-bill/:version/micro-prepay/auto-delete', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0078: { path: '/core-bill/:version/use-contents-prepay/hist-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0079: { path: '/core-bill/:version/use-contents-prepay/auto-hist', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0080: { path: '/core-bill/:version/use-contents-prepay/auto-prepay-status', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0081: { path: '/core-bill/:version/use-contents-prepay/requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0082: { path: '/core-bill/:version/use-contents-prepay/process', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0083: { path: '/core-bill/:version/use-contents-prepay/auto-process', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0084: { path: '/core-bill/:version/use-contents-prepay/auto-delete', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0085: { path: '/core-bill/:version/use-contents-prepay/auto-prepay-amt', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0086: { path: '/core-bill/:version/micro-prepay/auto-prepay-amt', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0087: { path: '/core-bill/:version/ocb-point-pay', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0089: { path: '/core-bill/:version/payment/auto-integrated-account-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0090: { path: '/core-bill/:version/payment/realtime-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0091: { path: '/core-bill/:version/payment/realtime-payment-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0092: { path: '/core-bill/:version/payment/auto-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0093: { path: '/core-bill/:version/point-onetime-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0094: { path: '/core-bill/:version/point-autopay-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },

  // CUSTOMER
  BFF_08_0001: { path: '/core-modification/:version/counsel-time-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0002: { path: '/core-modification/:version/counsel-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0003: { path: '/core-modification/:version/counsel-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0004: { path: '/core-modification/:version/region-store-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0005: { path: '/core-modification/:version/region-addr-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0006: { path: '/core-modification/:version/region-subway-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0007: { path: '/core-modification/:version/region-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0008: { path: '/core-modification/:version/region-close-store-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0009: { path: '/core-modification/:version/voice-certification-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0010: { path: '/core-modification/:version/email-inquiry-categories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0012: { path: '/core-modification/:version/email-inquiry/append-inquiry', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0013: { path: '/core-modification/:version/email-inquiry', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0014: { path: '/:version/cs/file-upload', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0015: { path: '/core-modification/:version/brand-phone-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0016: { path: '/core-modification/:version/direct-shop/order-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0020: { path: '/core-modification/:version/inquiry-direct-shop', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0021: { path: '/core-modification/:version/inquiry-chocolate', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0023: { path: '/core-modification/:version/survey/surveyCustList', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0024: { path: '/core-modification/:version/survey/surveyViewResult', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0025: { path: '/core-modification/:version/survey/surveyMainBanner', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0026: { path: '/core-modification/:version/guide/categories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0028: { path: '/core-modification/:version/notice-tworld-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0029: { path: '/core-modification/:version/notice-tworld', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0031: { path: '/core-modification/:version/notice-membership', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0033: { path: '/core-modification/:version/prevent/notice', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0034: { path: '/core-modification/:version/voice-certification', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0035: { path: '/core-modification/:version/survey/surveyJoin', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0036: { path: '/core-modification/:version/survey/surveyJoinQstn', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0038: { path: '/core-modification/:version/survey/surveyQstn', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0039: { path: '/core-modification/:version/notice-direct', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0040: { path: '/core-modification/:version/notice-roaming', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0041: { path: '/core-modification/:version/prevent/notice/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0042: { path: '/core-modification/:version/email-inquiry/service-mobile', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0043: { path: '/core-modification/:version/email-inquiry/service-internet', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0044: { path: '/core-modification/:version/email-inquiry/quality-mobile', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0045: { path: '/core-modification/:version/email-inquiry/quality-internet', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0049: { path: '/core-modification/:version/region-center-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0050: { path: '/core-modification/:version/ifaq/iFaqList', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0051: { path: '/core-modification/:version/ifaq/iFaq-category-List', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0052: { path: '/core-modification/:version/ifaq/iFaqList-Cate', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0053: { path: '/core-modification/:version/guide/content', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0054: { path: '/core-modification/:version/require-document/reqDocument', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0055: { path: '/core-modification/:version/region-center-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0056: { path: '/core-modification/:version/guide/use-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0057: { path: '/core-modification/:version/guide/site-use', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0058: { path: '/core-modification/:version/praise/savePraiseInfo', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0059: { path: '/core-modification/:version/term/access-terms', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0060: { path: '/core-modification/:version/email-inquiry-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0061: { path: '/core-modification/:version/email-inquiry-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0062: { path: '/core-modification/:version/email-inquiry', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_08_0063: { path: '/core-modification/v1/guide/contents-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0064: { path: '/core-modification/:version/guide/contents-detail/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0065: {
    path: '/core-modification/:version/guide/contents-view-count-up/:args0',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_08_0066: { path: '/core-modification/:version/center/banner', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0067: { path: '/core-modification/v1/region-rent-center', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },

  // SEARCH
  BFF_08_0068: { path: '/core-modification/:version/search/keyword', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0069: { path: '/core-modification/:version/search/smart', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0070: { path: '/core-modification/:version/search/invst-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0071: { path: '/core-modification/:version/search/invst-append', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0072: { path: '/core-modification/:version/search/invst-insert', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0073: { path: '/core-modification/:version/ifaq/iFaq-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0075: { path: '/core-auth/:version/autosms/sendAutoSMSAuthNum', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0076: { path: '/:version/autosms/skt-sms/confirm', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },

  // EVENT
  BFF_09_0001: { path: '/core-membership/:version/event/ing-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0002: { path: '/core-membership/:version/event/detail/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0003: { path: '/core-membership/:version/event/old-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0004: { path: '/core-membership/:version/event/win-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0005: { path: '/core-membership/:version/event/win-detail/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // PRODUCT
  BFF_10_0001: { path: '/core-product/:version/ledger/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0002: { path: '/core-product/:version/ledger/:args0/summaries', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0003: { path: '/core-product/:version/ledger/:args0/tags', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0004: { path: '/core-product/:version/ledger/:args0/contents', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0005: { path: '/core-product/:version/ledger/:args0/series', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0006: { path: '/core-product/:version/ledger/:args0/recommend-prods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0007: {
    path: '/core-product/:version/mobiles/fee-plans/:args0/joins/join-prechecks',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0008: { path: '/:version/products/fee-plans/:args0/join-term-infos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0009: {
    path: '/core-product/:version/mobiles/fee-plans/joins/request-over-chargings',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0010: {
    path: '/core-product/:version/mobiles/fee-plans/joins/over-chargings',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0012: {
    path: '/:version/products/fee-plans/:args0/joins',
    method: API_METHOD.PUT,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0013: {
    path: '/core-product/:version/mobiles/fee-plans/:args0/tplan-sets',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0014: {
    path: '/core-product/:version/mobiles/fee-plans/:args0/tplan-sets',
    method: API_METHOD.PUT,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0015: {
    path: '/core-product/:version/mobiles/fee-plans/:args0/tplan-benefits',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0017: {
    path: '/:version/products/additions/:args0/join-term-infos',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0018: { path: '/core-product/:version/mobiles/additions-set/:args0/joins', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0019: {
    path: '/core-product/:version/mobiles/additions-sets/:args0/sets/lines',
    method: API_METHOD.DELETE,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0020: {
    path: '/core-product/:version/mobiles/additions-sets/:args0/sets/lines',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0021: { path: '/core-product/:version/mobiles/additions-sets/:args0/sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0022: { path: '/core-product/:version/mobiles/additions-sets/:args0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_10_0025: { path: '/core-product/:version/submain/my-filters', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0026: { path: '/core-product/:version/submain/grpprods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0027: { path: '/core-product/:version/submain/sprateprods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0028: { path: '/core-product/:version/submain/addsprateprods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0029: { path: '/core-product/:version/submain/rcmndtags', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0031: { path: '/core-product/:version/submain/products', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0032: { path: '/core-product/:version/submain/filters', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0033: { path: '/core-product/:version/submain/filters/:args0/sub-lists', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0034: { path: '/core-product/:version/mobiles/fee-plans/young-plan-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0035: { path: '/core-product/:version/mobiles/additions/:args0/joins', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0036: { path: '/core-product/:version/mobiles/additions/:args0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_10_0037: { path: '/core-product/:version/mobiles/fee-plans/t-tab-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0038: { path: '/core-product/:version/mobiles/additions/:args0/vas-terms', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0039: { path: '/core-product/:version/combinations/discount-simulation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0040: { path: '/core-product/:version/mobiles/fee-plans/ting-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0041: { path: '/core-product/:version/mobiles/fee-plans/ting-sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0042: { path: '/core-product/:version/mobiles/fee-plans/bandyt-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0043: { path: '/core-product/:version/mobiles/fee-plans/zone-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0044: { path: '/core-product/:version/mobiles/fee-plans/zones', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0045: { path: '/core-product/:version/mobiles/fee-plans/zone-sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0046: { path: '/:version/products/fee-plans/:args0/option-sets', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0048: { path: '/core-modification/:version/wireJoin/listUseAddressService', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0054: { path: '/core-product/:version/submain/benefit-discount-products', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0056: { path: '/core-product/:version/services/roaming/fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0057: { path: '/core-product/:version/services/roaming/additions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0062: {
    path: '/core-product/:version/mobiles/additions-sets/:args0/seldis-sets',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0063: {
    path: '/core-product/:version/mobiles/additions-sets/:args0/seldis-sets',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0065: { path: '/core-product/:version/roaming/tpie-reservation', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0066: { path: '/core-product/:version/roaming/tpie-reservation', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0067: { path: '/core-product/:version/roaming/tpie', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0068: { path: '/core-product/:version/roaming/tpie-reservation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0070: { path: '/core-product/:version/mobiles/fee-plans/num-couple-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0071: { path: '/core-product/:version/mobiles/fee-plans/num-couple-sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0072: { path: '/core-product/:version/mobiles/fee-plans/num-zone-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0073: { path: '/core-product/:version/mobiles/fee-plans/snum-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0074: { path: '/core-product/:version/mobiles/fee-plans/snum-sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0075: { path: '/core-product/:version/mobiles/fee-plans/couple-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0076: { path: '/core-product/:version/wire/joins/counsel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0078: {
    path: '/core-product/:version/combinations/necessary-documents/inspects',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0081: {
    path: '/core-product/:version/mobiles/additions-sets/:args0/tplusdis-sets',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0082: {
    path: '/core-product/:version/mobiles/additions-sets/:args0/tplusdis-sets',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0083: {
    path: '/core-product/:version/mobiles/additions-sets/:args0/tplusdis-sets',
    method: API_METHOD.DELETE,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0084: { path: '/core-product/:version/roaming/fee-plans/:args0/joins', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0085: { path: '/core-product/:version/roaming/fee-plans/:args0/sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0086: {
    path: '/core-product/:version/roaming/fee-plans/:args0/terminations',
    method: API_METHOD.DELETE,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0088: { path: '/core-product/:version/roaming/submain/promBannerList', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0089: { path: '/core-product/:version/roaming/submain/alpaList', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0090: { path: '/core-product/:version//roaming/submain/bannerList', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0091: {
    path: '/core-product/:version/roaming/fee-plans/:args0/rom-use-periods',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0092: {
    path: '/core-product/:version/roaming/services/t-roam-tog/:args0/members',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0093: { path: '/core-product/:version/submain/tapps', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0098: { path: '/core-product/:version/wire/additions/:args0/joins/prechecks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0099: { path: '/core-product/:version/wire/additions/:args0/joins', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0100: { path: '/core-product/:version/wire/additions/:args0/joins', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_10_0109: { path: '/core-product/:version/services/wire/addition/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0111: { path: '/:version/products/wire/additions/:args0/join-term-infos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0112: { path: '/core-product/:version/ledger/:args0/similars', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0113: {
    path: '/core-product/:version/services/combinations/:args0/terminations/prechecks',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0114: {
    path: '/core-product/:version/services/combinations/:args0/terminations/infos',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0115: {
    path: '/core-product/:version/wire/additions/:args0/joins/join-set-term-infos',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0116: { path: '/core-product/:version/ledger/:args0/previews', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0119: {
    path: '/core-product/:version/services/combinations/:args0/scrbcheck',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0137: {
    path: '/core-product/:version/wire/additions/:args0/joins',
    method: API_METHOD.PUT,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0138: {
    path: '/core-product/:version/wire/additions/:args0/joins/reservations',
    method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0139: {
    path: '/core-product/:version/ledger/:args0/recommend-apps',
    method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0142: {
    path: '/core-product/:version/mobiles/combinations/:args0/joins/services',
    method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0143: {
    path: '/core-product/:version/mobiles/combinations/:args0/joins/simulations',
    method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0144: {
    path: '/core-product/:version/mobiles/combinations/:args0/joins',
    method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0151: {
    path: '/core-product/:version/mobiles/fee-plans/:args0/joins/term-prechecks',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0164: {
    path: '/core-product/:version/wire/additions/:args0/joins/ledger-prechecks/joins',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0165: {
    path: '/core-product/:version/wire/additions/:args0/joins/ledger-prechecks/sets',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0166: {
    path: '/core-product/:version/wire/additions/:args0/joins/ledger-prechecks/cancels',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0167: {
    path: '/core-product/:version/wire/additions/:args0/joins/ledger-prechecks/adds',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0168: {
    path: '/core-product/:version/wire/additions/:args0/joins/ledger-prechecks/terms',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0169: {
    path: '/core-product/:version/mobiles/fee-plans/young-plan-mid-sets',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0170: {
    path: '/core-product/:version/mobiles/fee-plans/young-plan-mid-sets',
    method: API_METHOD.PUT,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0171: {
    path: '/core-product/:version/mobiles/combinations/tfamilymoa/join/prechecks',
    method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0172: {
    path: '/core-product/:version/mobiles/combinations/tfamilymoa/join/oppsblcheck',
    method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0173: {
    path: '/core-product/:version/mobiles/combinations/tfamilymoa/join',
    method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0174: {
    path: '/core-product/:version/roaming/auto-dial',
    method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0175: {
    path: '/core-product/:version/roaming/fee-plans/:args0/prechecks',
    method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true
  },
  BFF_10_0176: {
    path: '/core-product/:version/mobiles/additions-sets/addressid-sets',
    method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true
  },

  // ROAMING
  BFF_10_0000: { path: '/core-product/:version/submain/products', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0055: { path: '/core-product/:version/services/roaming/count', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0058: { path: '/core-product/:version/roaming/country-rate', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0059: { path: '/core-product/:version/roaming/modelCode-srch', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0060: { path: '/core-product/:version/roaming/country-srch', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0061: { path: '/core-product/:version/roaming/ManageType-srch', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0097: { path: '/core-product/:version/ledger/:args0/tapps', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0121: { path: '/core-product/:version/services/roaming/add-count', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0122: { path: '/core-product/:version/services/roaming/prod-count', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0123: { path: '/core-product/:version/submain/roaming-sprateprods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0141: { path: '/core-product/:version/services/t-roam-tog/members', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // MEMBERSHIP
  BFF_11_0001: { path: '/core-membership/:version/card/home', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0002: { path: '/core-membership/:version/card/info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0003: { path: '/core-membership/:version/card-reissue-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0004: { path: '/core-membership/:version/card-reissue-process', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0005: { path: '/core-membership/:version/card-reissue-cancel-process', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0006: { path: '/core-membership/:version/card/change', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0007: { path: '/core-membership/:version/card/check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0009: { path: '/core-membership/:version/card/used-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0010: { path: '/core-membership/:version/card/hist', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0011: { path: '/core-membership/:version/card/create', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_11_0012: { path: '/core-membership/:version/card/modify', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0013: { path: '/core-membership/:version/card/cancel-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0014: { path: '/core-membership/:version/card/cancel', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0015: { path: '/core-membership/:version/card/create-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0016: { path: '/core-membership/:version/tmembership/cate-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0017: { path: '/core-membership/:version/tmembership/brand-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0018: { path: '/core-membership/:version/tmembership/brand-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0019: { path: '/core-membership/:version/tmembership/brand-like', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_11_0020: { path: '/core-membership/:version/tmembership/brand-dislike', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_11_0021: { path: '/core-membership/:version/tmembership/area1-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0022: { path: '/core-membership/:version/tmembership/area2-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0023: { path: '/core-membership/:version/tmembership/mrcht-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0024: { path: '/core-membership/:version/tmembership/mrcht-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0025: { path: '/core-membership/:version/tmembership/near-brand', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0026: { path: '/core-membership/:version/tmembership/area-by-geo', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // TID
  OIDC: { path: '/auth/authorize.do', method: API_METHOD.GET, server: API_SERVER.TID, bypass: false },
  LOGOUT: { path: '/sso/web/v1/ssologout.do', method: API_METHOD.GET, server: API_SERVER.TID, bypass: false },

  // TEST
  BFF_08_0029_TEST: { path: '/core-modification/:version/notice-tworld-test', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  GET: { path: '/posts', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  GET_PARAM: { path: '/comments', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  GET_PATH_PARAM: { path: '/posts/:args0', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  POST: { path: '/posts', method: API_METHOD.POST, server: API_SERVER.TEST, bypass: true },
  POST_PARAM: { path: '/posts', method: API_METHOD.POST, server: API_SERVER.TEST, bypass: true },
  PUT: { path: '/posts/1', method: API_METHOD.PUT, server: API_SERVER.TEST, bypass: true },
  PUT_PARAM: { path: '/posts/1', method: API_METHOD.PUT, server: API_SERVER.TEST, bypass: true },
  DELETE: { path: '/posts/1', method: API_METHOD.DELETE, server: API_SERVER.TEST, bypass: true },
  DELETE_PARAM: {}
};

export const SESSION_CMD = {
  BFF_05_0001: 'BFF_05_0001',
  BFF_04_0001: 'BFF_04_0001',
  BFF_05_0068: 'BFF_05_0068',
  BFF_03_0004: 'BFF_03_0004',
  BFF_05_0061: 'BFF_05_0061',
  BFF_07_0017: 'BFF_07_0017'
};

export const API_CODE = {
  CODE_00: '00', // success
  BFF_0003: 'BFF0003', // 로그인 필요
  BFF_0004: 'BFF0004', // 접근 권한 필요
  BFF_0006: 'BFF0006', // BFF API 차단
  BFF_0007: 'BFF0007', // MS API 차단
  BFF_0008: 'BFF0008', // 업무인증 필요
  BFF_0009: 'BFF0009', // 마스킹&업무 인증 필요
  BFF_0010: 'BFF0010', // 상품인증 필요
  BFF_0011: 'BFF0011', // 서비스 자동 차단 (Circuit open 대체 화면)
  BFF_0012: 'BFF0012', // 고객비밀번호 인증 필요
  BFF_0013: 'BFF0013', // 고객비밀번호 인증 필요
  BFF_0014: 'BFF0014', // 고객비밀번호 재설정 필요
  BFF_0015: 'BFF0015', // 비밀번호 인증 필요 (업무인증에 옵션으로 추가되는 인증)

  REDIS_SUCCESS: '00',
  REDIS_EMPTY: '01',
  REDIS_ERROR: '02',

  NODE_1001: '1001',  // login 필요
  NODE_1002: '1002',  // 인증 오류
  NODE_1003: '1003',  // 처리 완료

  CODE_200: '200',
  CODE_400: '400',
  CODE_404: '404',
  CODE_500: '500'
};

export const API_SVC_PWD_ERROR = {
  ATH3000: 'ATH3000', // 변경할 회선 고객보호비밀번호 입력 필요
  BFF9000: 'BFF9000', // 변경할 회선 고객보호비밀번호 입력 필요
  ICAS3481: 'ICAS3481', // 고객보호비밀번호 입력 오류 1회
  ICAS3482: 'ICAS3482', // 고객보호비밀번호 입력 오류 2회
  ICAS3483: 'ICAS3483', // 고객보호비밀번호 입력 오류 3회
  ICAS3484: 'ICAS3484', // 고객보호비밀번호 입력 오류 4회
  ICAS3215: 'ICAS3215', // 고객보호비밀번호 입력 오류 5회 (잠김예정)
  ICAS3216: 'ICAS3216' // 고객보호비밀번호 기 잠김
};

export const API_LOGIN_ERROR = {
  ATH1003: 'ATH1003', // 로그인 30회 초과
  ATH3236: 'ATH3236', // 분실정지(대표회선)
  ICAS3228: 'ICAS3228', // 고객보호비밀번호(대표회선) 입력 필요
  ICAS3235: 'ICAS3235' // 휴면계정
};

export const API_MYT_ERROR_CODE = [
  'BLN0001', // 잔여기본통화 조회횟수 초과
  'BLN0002', // 조회불가대상
  'BLN0003', // 정지이력
  'BLN0004' // 조회불가대상
];

export const API_MYT_ERROR = {
  BIL0011: 'BIL0011', // SK브로드밴드 서비스는 사용이 불가능한 메뉴입니다.
  MBR0001: 'MBR0001', // 타인명의로 카드가 발급되었습니다.
  MBR0002: 'MBR0002' // 발급된 카드정보가 없습니다.
};

export const API_GIFT_ERROR = [
  'RCG0001', // 제공자 선물하기 불가 상태
  'RCG0002', // 제공자 선물하기 불가 요금제
  'RCG0003', // 제공자 당월 선물가능 횟수 초과 (월2회)
  'RCG0004', // 제공자 당월 선물가능 용량 미달
  'RCG0005', // 제공자가 미성년자이면 선물하기 불가
  'RCG0006', // 수혜자 선물수신 불가상태
  'RCG0007', // 수혜자 선물수신 불가 요금제
  'RCG0008', // 수혜자 당월 선물수신 횟수 초과 (월2회)
  'RCG0011', // 제공자 회선과 수혜자 회선이 동일한 경우
  'RCG0013', // 그 외 기타에러
  'RCG0015' // 기타 불가
];

export const API_ADD_SVC_ERROR = {
  // 부가서비스(소액결제, 콘텐츠이용)
  BIL0030: 'BIL0030', // 휴대폰 결제 이용동의 후 사용 가능한 메뉴입니다
  BIL0031: 'BIL0031', // 미성년자는 이용할 수 없습니다
  BIL0033: 'BIL0033', // 휴대폰 결제 차단 고객은 사용이 제한된 메뉴입니다
  BIL0034: 'BIL0034' // 소액결제 부가서비스 미가입자는 이용할 수 없습니다
};

export const API_T_FAMILY_ERROR = {
  BLN0010: 'BLN0010', // T가족모아 가입 가능한 요금제이나 미가입
  BLN0011: 'BLN0011' // 	T가족모아 가입 불가능한 요금제
};

export const API_TAX_REPRINT_ERROR = {
  BIL0018: 'BIL0018' // 사업자 번호를 조회할 수 없습니다.
};

export const API_REFUND_ERROR = {
  ZINVE8169: 'ZINVE8169' // 환불대상금액 존재하지 않습니다.
};

export const API_NEW_NUMBER_ERROR = {
  MOD0030: 'MOD0030', // 번호변경안내서비스 신청 가능한 번호변경 이력이 없습니다.
  MOD0031: 'MOD0031' // 번호변경전 번호가 타사번호인 경우는 지점/대리점/고객센터를 통해 신청 가능합니다.
};

export const API_UNPAID_ERROR = {
  BIL0016: 'BIL0016' // 미납요금이 없습니다.
};

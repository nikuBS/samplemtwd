Tw.API_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

Tw.API_CMD = {
  TEST_GET_USAGE_BTN: { path: '/usageBtn', method: Tw.API_METHOD.GET },
  SESSION_CHECK: { path: '/mock/session', method: Tw.API_METHOD.GET },
  BFF_03_0002_C: { path: '/svc-catalog', method: Tw.API_METHOD.GET },
  BFF_03_0003_C: { path: '/svc-catalog/detail', method: Tw.API_METHOD.GET },
  BFF_03_0004_C: { path: '/change-svc', method: Tw.API_METHOD.POST },
  BFF_03_0005_C: { path: '/selected-svc', method: Tw.API_METHOD.GET },
  BFF_03_0023_C: { path: '/core-recharge/v1/refill-gifts', method: Tw.API_METHOD.POST },

  // COMMON
  BFF_01_0002: { path: '/common/sessions', method: Tw.API_METHOD.GET },
  BFF_01_0005: { path: '/common/selected-sessions', method: Tw.API_METHOD.GET },
  BFF_01_0006: { path: '/core-modification/v1/address/legal-dongs', method: Tw.API_METHOD.GET },
  BFF_01_0007: { path: '/core-modification/v1/address/legal-dongs', method: Tw.API_METHOD.GET },
  BFF_01_0008: { path: '/core-modification/v1/address/street-names', method: Tw.API_METHOD.GET },
  BFF_01_0009: { path: '/core-modification/v1/address/mailboxes', method: Tw.API_METHOD.GET },
  BFF_01_0010: { path: '/core-modification/v1/address/lot-numbers', method: Tw.API_METHOD.GET },
  BFF_01_0011: { path: '/core-modification/v1/address/buildings', method: Tw.API_METHOD.GET },
  BFF_01_0012: { path: '/core-modification/v1/address/standard', method: Tw.API_METHOD.GET },
  BFF_01_0013: { path: '/core-modification/v1/address/standard', method: Tw.API_METHOD.GET },

  // AUTH
  BFF_03_0002: { path: '/user/account-auth-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0003: { path: '/user/accounts', method: Tw.API_METHOD.DELETE },
  BFF_03_0004: { path: '/core-auth/v1/services', method: Tw.API_METHOD.GET },
  BFF_03_0005: { path: '/user/services', method: Tw.API_METHOD.PUT },
  BFF_03_0006: { path: '/user/nick-names/args-0', method: Tw.API_METHOD.PUT },
  BFF_03_0007: { path: '/user/tid-keys', method: Tw.API_METHOD.GET },
  BFF_03_0009: { path: '/user/service-password-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0010: { path: '/user/locks', method: Tw.API_METHOD.DELETE },
  BFF_03_0011: { path: '/core-auth/v1/nationalities', method: Tw.API_METHOD.GET },
  BFF_03_0012: { path: '/user/biz-auth-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0013: { path: '/user/biz-services', method: Tw.API_METHOD.POST },
  BFF_03_0014: { path: '/core-auth/v1/marketing-offer-subscriptions/args-0', method: Tw.API_METHOD.GET },
  BFF_03_0015: { path: '/core-auth/v1/marketing-offer-subscriptions/args-0', method: Tw.API_METHOD.PUT },
  BFF_03_0016: { path: '/core-auth/v1/service-passwords', method: Tw.API_METHOD.PUT },
  BFF_03_0019: { path: '/core-auth/v1/users/args-0/otp', method: Tw.API_METHOD.POST },
  BFF_03_0020: { path: '/core-auth/v1/passwords-check', method: Tw.API_METHOD.GET },

  // MYT
  BFF_05_0001: { path: '/my-t/balances', method: Tw.API_METHOD.GET },
  BFF_05_0002: { path: '/my-t/balance-add-ons', method: Tw.API_METHOD.GET },
  BFF_05_0005: { path: '/core-balance/v1/tdata-sharings', method: Tw.API_METHOD.GET },
  BFF_05_0009: { path: '/core-balance/v1/data-sharings/child', method: Tw.API_METHOD.GET },
  BFF_05_0010: { path: '/core-balance/v1/children', method: Tw.API_METHOD.GET },
  BFF_05_0011: { path: '/core-balance/v1/tdata-sharings/args-0', method: Tw.API_METHOD.DELETE },
  BFF_05_0014: { path: '/core-bill/v1/pps-histories', method: Tw.API_METHOD.GET },
  BFF_05_0048: { path: '/core-bill/v1/bill-types-reissue-request/', method: Tw.API_METHOD.POST },
  BFF_05_0022: { path: '/core-bill/v1/hotbill/fee/hotbill-response', method: Tw.API_METHOD.GET },
  BFF_05_0024: { path: '/core-bill/v1/child/children', method: Tw.API_METHOD.GET },
  BFF_05_0027: { path: '/core-bill/v1/bill-types-change', method: Tw.API_METHOD.POST },
  BFF_05_0031: { path: '/core-bill/v1/bill-pay/payment-possible-day', method: Tw.API_METHOD.GET },
  BFF_05_0032: { path: '/core-bill/v1/bill-pay/payment-possible-day-input', method: Tw.API_METHOD.POST },
  BFF_05_0033: { path: '/core-bill/v1/bill-pay/autopay-schedule', method: Tw.API_METHOD.GET },
  BFF_05_0034: { path: '/core-bill/v1/bill-pay/suspension-cancel', method: Tw.API_METHOD.DELETE },
  BFF_05_0035: { path: '/core-bill/v1/hotbill/fee/hotbill-request', method: Tw.API_METHOD.GET },
  BFF_05_0036: { path: '/core-bill/v1/bill-pay/bills', method: Tw.API_METHOD.GET },
  BFF_05_0038: { path: '/core-bill/v1/bill-pay/donation', method: Tw.API_METHOD.GET },
  BFF_05_0041: { path: '/core-product/v1/services/base-fee-plans', method: Tw.API_METHOD.GET },
  BFF_05_0044: { path: '/core-bill/v1/bill-pay/roaming', method: Tw.API_METHOD.GET },
  BFF_05_0045: { path: '/core-bill/v1/bill-pay/call-gift', method: Tw.API_METHOD.GET },
  BFF_05_0047: { path: '/core-bill/v1/bill-pay/used-amounts', method: Tw.API_METHOD.GET },
  BFF_05_0050: { path: '/core-bill/v1/wire-bill-types', method: Tw.API_METHOD.PUT },
  BFF_05_0052: { path: '/core-bill/v1/wire-bill-reissue', method: Tw.API_METHOD.POST },
  BFF_05_0060: { path: '/core-modification/v1/no-contract-plan-points', method: Tw.API_METHOD.GET },
  BFF_05_0064: { path: '/core-bill/v1/useContents/getUseContents', method: Tw.API_METHOD.GET },
  BFF_05_0066: { path: '/core-bill/v1/useContentsLimit', method: Tw.API_METHOD.GET },
  BFF_05_0067U: { path: '/core-bill/v1/useContents/getUpdateUseContentsLimit', method: Tw.API_METHOD.POST },
  BFF_05_0067D: { path: '/core-bill/v1/useContents/getUpdateUseContentsLimitDown', method: Tw.API_METHOD.POST },
  BFF_05_0069: { path: '/core-auth/v1/service-passwords', method: Tw.API_METHOD.PUT },
  BFF_05_0070: { path: '/core-auth/v1/service-passwords-change', method: Tw.API_METHOD.PUT },
  BFF_05_0071: { path: '/core-auth/v1/service-passwords', method: Tw.API_METHOD.DELETE },
  BFF_05_0079: { path: '/core-bill/v1/microPay-hist-request', method: Tw.API_METHOD.POST },
  BFF_05_0080: { path: '/core-bill/v1/microPay-request', method: Tw.API_METHOD.GET },
  BFF_05_0081U: { path: '/core-bill/v1/microPay-requests', method: Tw.API_METHOD.POST },
  BFF_05_0081D: { path: '/core-bill/v1/microPay-requests/limitDown', method: Tw.API_METHOD.POST },
  BFF_05_0082: { path: '/core-bill/v1/microPay-auto-set', method: Tw.API_METHOD.POST },
  BFF_05_0083: { path: '/core-bill/v1/microPay-requests', method: Tw.API_METHOD.PUT },
  BFF_05_0085: { path: '/core-bill/v1/micropay-password-status', method: Tw.API_METHOD.GET },
  BFF_05_0086: { path: '/core-bill/v1/micropay-password-create', method: Tw.API_METHOD.POST },
  BFF_05_0087: { path: '/core-bill/v1/micropay-password-changes', method: Tw.API_METHOD.PUT },
  BFF_05_0089: { path: '/core-bill/v1/prepayInfo', method: Tw.API_METHOD.GET },
  BFF_05_0076: { path: '/core-modification/v1/myinfo/discount-infos-month', method: Tw.API_METHOD.GET },

  // RECHARGE
  BFF_06_0001: { path: '/core-recharge/v1/refill-coupons', method: Tw.API_METHOD.GET },
  BFF_06_0002: { path: '/core-recharge/v1/refill-usages', method: Tw.API_METHOD.GET },
  BFF_06_0003: { path: '/core-recharge/v1/refill-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0004: { path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0005: { path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.DELETE },
  BFF_06_0006: { path: '/core-recharge/v1/regular-data-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0007: { path: '/core-recharge/v1/refill-coupons', method: Tw.API_METHOD.PUT },
  BFF_06_0008: { path: '/core-recharge/v1/data-gift-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0009: { path: '/core-recharge/v1/refill-options', method: Tw.API_METHOD.GET },
  BFF_06_0010: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.GET },
  BFF_06_0011: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.DELETE },
  BFF_06_0012: { path: '/core-recharge/v1/data-gift-request-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0013: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.GET },
  BFF_06_0014: { path: '/core-recharge/v1/data-gift-balances', method: Tw.API_METHOD.GET },
  BFF_06_0015: { path: '/core-recharge/v1/data-gift-senders', method: Tw.API_METHOD.GET },
  BFF_06_0016: { path: '/core-recharge/v1/data-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0017: { path: '/core-recharge/v1/data-gift-messages', method: Tw.API_METHOD.POST },
  BFF_06_0018: { path: '/core-recharge/v1/data-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0019: { path: '/core-recharge/v1/data-gift-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0020: { path: '/core-recharge/v1/ting-gift-senders', method: Tw.API_METHOD.GET },
  BFF_06_0021: { path: '/core-recharge/v1/ting-gift-blocks', method: Tw.API_METHOD.POST },
  BFF_06_0022: { path: '/core-recharge/v1/ting-gift-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0023: { path: '/core-recharge/v1/ting-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0024: { path: '/core-recharge/v1/ting-press-benefiters', method: Tw.API_METHOD.POST },
  BFF_06_0025: { path: '/core-recharge/v1/ting-gift-requests', method: Tw.API_METHOD.POST },
  BFF_06_0026: { path: '/core-recharge/v1/ting-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0027: { path: '/core-recharge/v1/ting-gift-blocks', method: Tw.API_METHOD.GET },
  BFF_06_0028: { path: '/core-recharge/v1/ting-services', method: Tw.API_METHOD.GET },
  BFF_06_0029: { path: '/core-recharge/v1/ting-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0030: { path: '/core-recharge/v1/regular-ting-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0031: { path: '/core-recharge/v1/regular-ting-top-ups', method: Tw.API_METHOD.DELETE },
  BFF_06_0032: { path: '/core-recharge/v1/ting-top-ups', method: Tw.API_METHOD.GET },
  BFF_06_0033: { path: '/core-recharge/v1/ting-permissions', method: Tw.API_METHOD.GET },
  BFF_06_0034: { path: '/core-recharge/v1/data-limitation-services', method: Tw.API_METHOD.GET },
  BFF_06_0035: { path: '/core-recharge/v1/regular-data-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0036: { path: '/core-recharge/v1/data-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0037: { path: '/core-recharge/v1/regular-data-top-ups', method: Tw.API_METHOD.DELETE },
  BFF_06_0038: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.DELETE },
  BFF_06_0039: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.POST },
  BFF_06_0040: { path: '/core-recharge/v1/regular-data-limitations', method: Tw.API_METHOD.DELETE },
  BFF_06_0041: { path: '/core-recharge/v1/regular-data-limitations', method: Tw.API_METHOD.POST },
  BFF_06_0042: { path: '/core-recharge/v1/data-top-ups', method: Tw.API_METHOD.GET },
  BFF_06_0043: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.GET },

  // PAYMENT
  BFF_07_0004: { path: '/core-bill/v1/cash-receipts-issue-history', method: Tw.API_METHOD.GET },
  BFF_07_0005: { path: '/core-bill/v1/point-autopays-history/cashback', method: Tw.API_METHOD.GET },
  BFF_07_0006: { path: '/core-bill/v1/point-autopays-history/tpoint', method: Tw.API_METHOD.GET },
  BFF_07_0007: { path: '/core-bill/v1/point-autopays-history/tpoint', method: Tw.API_METHOD.GET },
  BFF_07_0017: { path: '/core-bill/v1/bill-pay/tax-reprint', method: Tw.API_METHOD.GET },
  BFF_07_0018: { path: '/core-bill/v1/bill-pay/tax-reprint-email', method: Tw.API_METHOD.GET },
  BFF_07_0019: { path: '/core-bill/v1/bill-pay/tax-reprint-fax', method: Tw.API_METHOD.GET },
  BFF_07_0022: { path: '/core-bill/v1/bill-pay/autopay-banks', method: Tw.API_METHOD.GET },
  BFF_07_0023: { path: '/core-bill/v1/bill-pay/settle-pay-bank', method: Tw.API_METHOD.POST },
  BFF_07_0024: { path: '/core-bill/v1/bill-pay/cardnum-validation', method: Tw.API_METHOD.GET },
  BFF_07_0025: { path: '/core-bill/v1/bill-pay/settle-pay-card', method: Tw.API_METHOD.POST },
  BFF_07_0026: { path: '/core-bill/v1/bill-pay/settle-vbs', method: Tw.API_METHOD.GET },
  BFF_07_0027: { path: '/core-bill/v1/bill-pay/settle-vb-sms/args-0', method: Tw.API_METHOD.POST },
  BFF_07_0028: { path: '/core-bill/v1/bill-pay/avail-point-search', method: Tw.API_METHOD.GET },
  BFF_07_0029: { path: '/core-bill/v1/bill-pay/pay-ocb-tpoint-proc', method: Tw.API_METHOD.POST },
  BFF_07_0030: { path: '/core-bill/v1/payment/total-payment', method: Tw.API_METHOD.GET },
  BFF_07_0032: { path: '/core-bill/v1/payment/over-payment-refund-account', method: Tw.API_METHOD.POST },
  BFF_07_0035: { path: '/core-bill/v1/payment/realtime-payment', method: Tw.API_METHOD.GET },
  BFF_07_0036: { path: '/core-bill/v1/payment/realtime-payment-detail', method: Tw.API_METHOD.GET },
  BFF_07_0037: { path: '/core-bill/v1/payment/auto-payment', method: Tw.API_METHOD.GET },
  BFF_07_0039: { path: '/core-bill/v1/payment/auto-integrated-account-payment', method: Tw.API_METHOD.GET },
  BFF_07_0040: { path: '/core-bill/v1/payment/auto-integrated-payment-cancle-request', method: Tw.API_METHOD.POST },
  BFF_07_0043: { path: '/core-bill/v1/ocbcard-no-info', method: Tw.API_METHOD.GET },
  BFF_07_0045: { path: '/core-bill/v1/ocb-point-onetime-reserve', method: Tw.API_METHOD.POST },
  BFF_07_0047: { path: '/core-bill/v1/ocb-point-onetime-cancel', method: Tw.API_METHOD.POST },
  BFF_07_0048: { path: '/core-bill/v1/rainbow-point-onetime-reserve', method: Tw.API_METHOD.POST },
  BFF_07_0050: { path: '/core-bill/v1/rainbow-point-onetime-cancel', method: Tw.API_METHOD.POST },
  BFF_07_0054: { path: '/core-bill/v1/ocb-point-autopay-modify', method: Tw.API_METHOD.POST },
  BFF_07_0056: { path: '/core-bill/v1/rainbow-point-autopay-change', method: Tw.API_METHOD.POST },
  BFF_07_0058: { path: '/core-bill/v1/ocb-point-onetime-history', method: Tw.API_METHOD.GET },
  BFF_07_0059: { path: '/core-bill/v1/rainbow-point-onetime-history', method: Tw.API_METHOD.GET },
  BFF_07_0061: { path: '/core-bill/v1/auto-payments', method: Tw.API_METHOD.POST },
  BFF_07_0062: { path: '/core-bill/v1/auto-payments', method: Tw.API_METHOD.PUT },
  BFF_07_0063: { path: '/core-bill/v1/auto-payments', method: Tw.API_METHOD.DELETE },
  BFF_07_0065: { path: '/core-bill/v1/autopay/pay-cycl-chg/args-0', method: Tw.API_METHOD.PUT },
  BFF_07_0068: { path: '/core-bill/v1/autopay/card-info/args-0', method: Tw.API_METHOD.GET },
  BFF_07_0073: { path: '/core-bill/v1/microPrepay/microPrepay-requests', method: Tw.API_METHOD.GET },
  BFF_07_0074: { path: '/core-bill/v1/microPrepay/microPrepay-process', method: Tw.API_METHOD.POST },
  BFF_07_0076: { path: '/core-bill/v1/microPrepay/microPrepay-auto-req', method: Tw.API_METHOD.POST },
  BFF_07_0077: { path: '/core-bill/v1/microPrepay/microPrepay-auto-delete', method: Tw.API_METHOD.POST },
  BFF_07_0081: { path: '/core-bill/v1/useContentsPrepay/useContentsPrepay-requests', method: Tw.API_METHOD.GET },
  BFF_07_0082: { path: '/core-bill/v1/useContentsPrepay/useContentsPrepay-process', method: Tw.API_METHOD.POST },
  BFF_07_0083: { path: '/core-bill/v1/useContentsPrepay-auto-req', method: Tw.API_METHOD.POST },
  BFF_07_0084: { path: '/core-bill/v1/useContentsPrepay-auto-delete', method: Tw.API_METHOD.POST },

  //CUSTOMER
  BFF_08_0001: { path: '/core-modification/v1/counsel-time-check', method: Tw.API_METHOD.GET },
  BFF_08_0002: { path: '/core-modification/v1/counsel-reserve', method: Tw.API_METHOD.POST },
  BFF_08_0003: { path: '/core-modification/v1/counsel-histories', method: Tw.API_METHOD.GET },
  BFF_08_0004B: { path: '/core-modification/v1/region-store-list', method: Tw.API_METHOD.GET },
  BFF_08_0005B: { path: '/core-modification/v1/region-addr-list', method: Tw.API_METHOD.GET },
  BFF_08_0006B: { path: '/core-modification/v1/region-subway-list', method: Tw.API_METHOD.GET },
  BFF_08_0008: { path: '/core-modification/v1/region-close-store-list', method: Tw.API_METHOD.GET },
  BFF_08_0009: { path: '/core-modification/v1/voice-certification-check', method: Tw.API_METHOD.GET },
  BFF_08_0010: { path: '/core-modification/v1/email-inquiry-categories', method: Tw.API_METHOD.GET },
  BFF_08_0013: { path: '/core-modification/v1/email-inquiry', method: Tw.API_METHOD.POST },
  BFF_08_0014: { path: '/cs/file-upload', method: Tw.API_METHOD.POST },
  BFF_08_0015: { path: '/core-modification/v1/brand-phone-list', method: Tw.API_METHOD.GET },
  BFF_08_0016: { path: '/core-modification/v1/direct-shop/order-list', method: Tw.API_METHOD.GET },
  BFF_08_0020: { path: '/core-modification/v1/inquiry-direct-shop', method: Tw.API_METHOD.POST },
  BFF_08_0021: { path: '/core-modification/v1/inquiry-chocolate', method: Tw.API_METHOD.POST },
  BFF_08_0025: { path: '/core-modification/v1/survey/surveyMainBanner', method: Tw.API_METHOD.GET },
  BFF_08_0026: { path: '/core-modification/v1/guide/categories', method: Tw.API_METHOD.GET },
  BFF_08_0028: { path: '/core-modification/v1/notice/tworld-submain', method: Tw.API_METHOD.GET },
  BFF_08_0029: { path: '/core-modification/v1/notice-tworld', method: Tw.API_METHOD.GET },
  BFF_08_0031: { path: '/core-modification/v1/notice-membership', method: Tw.API_METHOD.GET },
  BFF_08_0033: { path: '/core-modification/v1/prevent/notice', method: Tw.API_METHOD.GET },
  BFF_08_0034: { path: '/core-modification/v1/voice-certification', method: Tw.API_METHOD.POST },
  BFF_08_0035: { path: '/core-modification/v1/survey/surveyJoin', method: Tw.API_METHOD.POST },
  BFF_08_0036: { path: '/core-modification/v1/survey/surveyJoinQstn', method: Tw.API_METHOD.POST },
  BFF_08_0039: { path: '/core-modification/v1/notice-direct', method: Tw.API_METHOD.GET },
  BFF_08_0040: { path: '/core-modification/v1/notice-roaming', method: Tw.API_METHOD.GET },
  BFF_08_0042: { path: '/core-modification/v1/email-inquiry/service-mobile', method: Tw.API_METHOD.POST },
  BFF_08_0043: { path: '/core-modification/v1/email-inquiry/service-internet', method: Tw.API_METHOD.POST },
  BFF_08_0044: { path: '/core-modification/v1/email-inquiry/quality-mobile', method: Tw.API_METHOD.POST },
  BFF_08_0045: { path: '/core-modification/v1/email-inquiry/quality-internet', method: Tw.API_METHOD.POST },

  // TEST
  GET: { path: '/posts', method: Tw.API_METHOD.GET },
  GET_PARAM: { path: '/comments', method: Tw.API_METHOD.GET },
  GET_PATH_PARAM: { path: '/posts/args-0', method: Tw.API_METHOD.GET },
  POST: { path: '/posts', method: Tw.API_METHOD.POST },
  POST_PARAM: { path: '/posts', method: Tw.API_METHOD.POST },
  PUT: { path: '/posts/1', method: Tw.API_METHOD.PUT },
  PUT_PARAM: { path: '/posts/1', method: Tw.API_METHOD.PUT },
  DELETE: { path: '/posts/1', method: Tw.API_METHOD.DELETE },
  DELETE_PARAM: {}
};

Tw.NODE_CMD = {
  GET_ENVIRONMENT: { path: '/environment', method: Tw.API_METHOD.GET },
  SET_DEVICE: { path: '/device', method: Tw.API_METHOD.POST },
  CHANGE_SESSION: { path: '/change-session', method: Tw.API_METHOD.POST },
  SVC_PASSWORD_LOGIN: { path: '/service-password-sessions/login', method: Tw.API_METHOD.POST },
  LOGIN_TID: { path: '/login-tid', method: Tw.API_METHOD.POST },
  LOGOUT_TID: { path: '/logout-tid', method: Tw.API_METHOD.POST },
  USER_LOCK_LOGIN: { path: '/user-locks/login', method: Tw.API_METHOD.POST },
  EASY_LOGIN_AOS: { path: '/easy-login/aos', method: Tw.API_METHOD.POST },
  EASY_LOGIN_IOS: { path: '/easy-login/ios', method: Tw.API_METHOD.POST }

};

Tw.TMAP = {
  REGION_URL: 'https://api2.sktelecom.com/tmap',
  PIN: '/img/ico/ico-tmap-pin.png',
  COMPASS: '/img/ico/ico-tmap-compass.png',
  APP_KEY: 'ecfeceac-3660-4618-bc3b-37a11f952441'
};

Tw.AJAX_CMD = {
  GET_TMAP_REGION: { path: '/geofencing/regions', method: Tw.API_METHOD.GET, url: Tw.TMAP.REGION_URL }
};

Tw.API_CODE = {
  CODE_00: '00',    // success
  CODE_01: 'RDT0001',    // 화면 차단
  CODE_02: 'RDT0002',    // API 차단
  CODE_03: 'RDT0003',    // 2차 인증
  CODE_04: 'RDT0004',    // 로그인 필요
  CODE_05: 'RDT0005',    // 접근 불가 (권한)
  CODE_06: 'RDT0006',    // 고객 비밀번호 인증 필요
  CODE_07: 'RDT0007',    // 고객 비밀번호 재설정 필요
  CODE_08: 'RDT0008',    // 고객 비밀번호 초기화상
  CODE_99: 'RDT0099',    // Circuit Open
  CODE_BIL0018: 'BIL0018',  // 개인 사업자 번호 조회 불가
  CODE_BIL0030: 'BIL0030',  // 휴대폰 결제 이용동의 후 사용 가능한 메뉴입니다
  CODE_BIL0031: 'BIL0031',  // 미성년자는 이용할 수 없습니다
  CODE_BIL0034: 'BIL0034',  // 소액결제 부가서비스 미가입자는 이용할 수 없습니다
  CODE_200: '200',
  CODE_400: '400'
};

Tw.API_SVC_PWD_ERROR = {
  ATH3000: 'ATH3000',     // 변경할 회선 고객보호비밀번호 입력 필요
  BFF9000: 'BFF9000',     // 변경할 회선 고객보호비밀번호 입력 필요
  ICAS3481: 'ICAS3481',   // 고객보호비밀번호 입력 오류 1회
  ICAS3482: 'ICAS3482',   // 고객보호비밀번호 입력 오류 2회
  ICAS3483: 'ICAS3483',   // 고객보호비밀번호 입력 오류 3회
  ICAS3484: 'ICAS3484',   // 고객보호비밀번호 입력 오류 4회
  ICAS3215: 'ICAS3215',   // 고객보호비밀번호 입력 오류 5회 (잠김예정)
  ICAS3216: 'ICAS3216'    // 고객보호비밀번호 기 잠김
};

Tw.API_LOGIN_ERROR = {
  ATH1003: 'ATH1003',     // 로그인 30회 초과
  ATH3236: 'ATH3236',     // 분실정지(대표회선)
  ICAS3228: 'ICAS3228',   // 고객보호비밀번호(대표회선) 입력 필요
  ICAS3235: 'ICAS3235'    // 휴면계정
};

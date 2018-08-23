export enum API_METHOD {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export enum API_SERVER {
  BFF = 'BFF_SERVER',
  TID = 'TID_SERVER',
  TEST = 'TEST_SERVER'
}

export const API_CMD = {
  // SPRINT #3
  SESSION_CHECK: { path: '/mock/session', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0001_mock: { path: '/mock/login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0002_C: { path: '/svc-catalog', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0003_C: { path: '/svc-catalog/detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004_C: { path: '/change-svc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0005_C: { path: '/selected-svc', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0023_C: { path: '/core-recharge/v1/refill-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  // COMMON
  LOGOUT_BFF: { path: '/logout', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0002: { path: '/common/sessions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0003: { path: '/svc-catalog/detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0004: { path: '/common/selected-sessions', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: false },
  BFF_01_0005: { path: '/common/selected-sessions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0006: { path: '/core-modification/v1/address/legal-dongs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0007: { path: '/core-modification/v1/address/legal-dongs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0008: { path: '/core-modification/v1/address/street-names', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0009: { path: '/core-modification/v1/address/mailboxes', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0010: { path: '/core-modification/v1/address/lot-numbers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0011: { path: '/core-modification/v1/address/buildings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0012: { path: '/core-modification/v1/address/standard', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0013: { path: '/core-modification/v1/address/standard', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0014: { path: '/core-auth/v1/auth/skt/sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0015: { path: '/auth/skt/sms-authentication', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0016: { path: '/core-auth/v1/auth/dca/sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0017: { path: '/core-auth/v1/auth/email', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0018: { path: '/auth/email-authentication', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0019: { path: '/auth/motp/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0020: { path: '/auth/motp/auth', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0021: { path: '/core-auth/v1/auth/motp', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0022: { path: '/auth/nice/ipin/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0023: { path: '/auth/nice/ipin/result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0024: { path: '/auth/nice/sms/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0025: { path: '/auth/nice/sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0026: { path: '/cert/success', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0027: { path: '/pwd-cert-chk', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0028: { path: '/core-auth/v1/auth/skt/sms-finance', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0029: { path: '/core-auth/v1/app-secure', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0030: { path: '/core-auth/v1/server-cert', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  // AUTH
  BFF_03_0001: { path: '/test-login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0002: { path: '/user/account-auth-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0003: { path: '/user/accounts', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004: { path: '/core-auth/v1/services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0005: { path: '/user/services', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: false },
  BFF_03_0006: { path: '/user/nick-names/args-0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0007: { path: '/user/tid-keys', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0008: { path: '/user/sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0009: { path: '/user/service-password-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0010: { path: '/user/locks', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0011: { path: '/core-auth/v1/nationalities', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0012: { path: '/user/biz-auth-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0013: { path: '/user/biz-services', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0014: { path: '/core-auth/v1/marketing-offer-subscriptions/args-0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0015: { path: '/core-auth/v1/marketing-offer-subscriptions/args-0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0016: { path: '/core-auth/v1/service-passwords', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0017: { path: '/user/login/android', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0018: { path: '/user/login/ios', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0019: { path: '/core-auth/v1/users/args-0/otp', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0020: { path: '/core-auth/v1/passwords-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // MYT
  BFF_05_0001: { path: '/my-t/balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0002: { path: '/my-t/balance-add-ons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0003: { path: '/core-balance/v1/troaming-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0004: { path: '/core-balance/v1/data-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0005: { path: '/core-balance/v1/tdata-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0006: { path: '/core-balance/v1/data-top-up', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0007: { path: '/core-balance/v1/ting', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0008: { path: '/core-balance/v1/data-discount', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0009: { path: '/core-balance/v1/data-sharings/child', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0010: { path: '/core-balance/v1/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0011: { path: '/core-balance/v1/tdata-sharings/args-0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0013: { path: '/core-bill/v1/pps-bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0014: { path: '/core-bill/v1/pps-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0028: { path: '/core-bill/v1/bill-types-reissue-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0030: { path: '/core-bill/v1/bill-pay/unpaid-bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0031: { path: '/core-bill/v1/bill-pay/payment-possible-day', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0032: { path: '/core-bill/v1/bill-pay/payment-possible-day-input', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0033: { path: '/core-bill/v1/bill-pay/autopay-schedule', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0034: { path: '/core-bill/v1/bill-pay/suspension-cancel', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0036: { path: '/core-bill/v1/bill-pay/bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0037: { path: '/core-bill/v1/bill-pay/suspension', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0038: { path: '/core-bill/v1/bill-pay/donation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0039: { path: '/core-bill/v1/bill-types-return-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0040: {
    path: '/core-product/v1/services/wireless/additions/args-0',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_05_0041: { path: '/core-product/v1/services/base-fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0044: { path: '/core-bill/v1/bill-pay/roaming', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0045: { path: '/core-bill/v1/bill-pay/call-gift', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0047: { path: '/core-bill/v1/bill-pay/used-amounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0048: { path: '/core-bill/v1/bill-types-reissue-request/', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0022: { path: '/core-bill/v1/hotbill/fee/hotbill-response', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0024: { path: '/core-bill/v1/child/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0025: { path: '/core-bill/v1/bill-types-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0035: { path: '/core-bill/v1/hotbill/fee/hotbill-request', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0049: { path: '/core-bill/v1/integrated-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0027: { path: '/core-bill/v1/bill-types-change/', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0050: { path: '/core-bill/v1/wire-bill-types', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0051: { path: '/core-bill/v1/wire-bill-reissue/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0052: { path: '/core-bill/v1/wire-bill-reissue/', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0058: { path: '/core-bill/v1/accounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0059: { path: '/core-bill/v1/recent-usage-fee-pattern', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0060: { path: '/core-modification/v1/no-contract-plan-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0061: { path: '/core-modification/v1/my-svc-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0062: { path: '/core-modification/v1/wire-network-notification', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0063: { path: '/my-t/myinfo/discount-infos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0064: { path: '/core-bill/v1/useContents/getUseContents', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0066: { path: '/core-bill/v1/useContents/getUseContentsLimit', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0067U: { path: '/core-bill/v1/useContents/getUpdateUseContentsLimit', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0067D: { path: '/core-bill/v1/useContents/getUpdateUseContentsLimitDown', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0068: { path: '/my-t/my-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0069: { path: '/core-auth/v1/service-passwords', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0070: { path: '/core-auth/v1/service-passwords-change', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0071: { path: '/core-auth/v1/service-passwords', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0074: { path: '/core-modification/v1/use-data-patterns', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0076: { path: '/core-modification/v1/myinfo/discount-infos-month', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0078: { path: '/core-balance/v1/band-data-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0079: { path: '/core-bill/v1/microPay-hist-request', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0080: { path: '/core-bill/v1/microPay-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0081U: { path: '/core-bill/v1/microPay-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0081D: { path: '/core-bill/v1/microPay-requests-limitDown', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0082: { path: '/core-bill/v1/microPay-auto-set', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0083: { path: '/core-bill/v1/microPay-requests', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0085: { path: '/core-bill/v1/micropay-password-status', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0086: { path: '/core-bill/v1/micropay-password-create', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0087: { path: '/core-bill/v1/micropay-password-changes', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0089: { path: '/core-bill/v1/prepayInfo', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0091: { path: '/core-bill/v1/recent-usage-pattern', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0092: { path: '/core-modification/v1/wire-network-notification-smsinfo', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0093: { path: '/core-bill/v1/microPay-cphist-request', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0094: { path: '/core-modification/v1/my-discount-benefit/getSKTcombiBenefit', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0096: { path: '/core-product/v1/benefit-suggestions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0098: { path: '/core-membership/v1/card-vip-benefit', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0100: { path: '/core-bill/v1/rainbow-point-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0101: { path: '/core-bill/v1/rainbow-point-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0102: { path: '/core-bill/v1/rainbow-point-adjustments', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0106: { path: '/core-modification/v1/my-discount-benefit/price-agree-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0107: { path: '/core-modification/v1/my-discount-benefit/support-agree-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0108: { path: '/core-modification/v1/my-discount-benefit/choice-agree-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0110: { path: '/core-modification/v1/benefit/ltrm-scrb', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0111: { path: '/core-modification/v1/benefit/wlf-cust-dc', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0115: { path: '/core-bill/v1/cookiz-ting-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0120: { path: '/core-bill/v1/military-service-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0123: { path: '/core-product/v1/services/unavailableness', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0124: { path: '/core-membership/v1/my-membership-benefit/check-membership', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0125: { path: '/core-product/v1/fee-plans/change-notices', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0126: { path: '/core-product/v1/fee-plans/change-notices', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0127: { path: '/core-product/v1/fee-plans/change-notices', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0128: { path: '/core-product/v1/services/wire/fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0129: { path: '/core-product/v1/services/wire/additions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0130: { path: '/core-bill/v1/rainbow-point-adjustments', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0132: { path: '/core-bill/v1/rainbow-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0133: { path: '/core-product/v1/services/combinations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0134: { path: '/core-product/v1/services/combinations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0136: { path: '/core-product/v1/services/wireless/fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0137: { path: '/core-product/v1/services/wireless/additions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0139: { path: '/core-modification/v1/myinfo/wire-service-contracts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // RECHARGE
  BFF_06_0001: { path: '/core-recharge/v1/refill-coupons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0002: { path: '/core-recharge/v1/refill-usages', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0003: { path: '/core-recharge/v1/refill-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0004: { path: '/core-recharge/v1/regular-data-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0005: { path: '/core-recharge/v1/regular-data-gifts', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0006: { path: '/core-recharge/v1/regular-data-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0007: { path: '/core-recharge/v1/refill-coupons', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_06_0008: { path: '/core-recharge/v1/data-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0009: { path: '/core-recharge/v1/refill-options', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0010: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0011: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0012: { path: '/core-recharge/v1/data-gift-request-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0013: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0014: { path: '/core-recharge/v1/data-gift-balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0015: { path: '/core-recharge/v1/data-gift-senders', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0016: { path: '/core-recharge/v1/data-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0017: { path: '/core-recharge/v1/data-gift-messages', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0018: { path: '/core-recharge/v1/data-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0019: { path: '/core-recharge/v1/data-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0020: { path: '/core-recharge/v1/ting-gift-senders', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0021: { path: '/core-recharge/v1/ting-gift-blocks', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0022: { path: '/core-recharge/v1/ting-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0023: { path: '/core-recharge/v1/ting-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0024: { path: '/core-recharge/v1/ting-press-benefiters', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0025: { path: '/core-recharge/v1/ting-gift-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0026: { path: '/core-recharge/v1/ting-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0027: { path: '/core-recharge/v1/ting-gift-blocks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0028: { path: '/core-recharge/v1/ting-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0029: { path: '/core-recharge/v1/ting-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0030: { path: '/core-recharge/v1/regular-ting-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0031: { path: '/core-recharge/v1/regular-ting-top-ups', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0032: { path: '/core-recharge/v1/ting-top-ups', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0033: { path: '/core-recharge/v1/ting-permissions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0034: { path: '/core-recharge/v1/data-limitation-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0035: { path: '/core-recharge/v1/regular-data-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0036: { path: '/core-recharge/v1/data-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0037: { path: '/core-recharge/v1/regular-data-top-ups', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0038: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0039: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0040: { path: '/core-recharge/v1/regular-data-limitations', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0041: { path: '/core-recharge/v1/regular-data-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0042: { path: '/core-recharge/v1/data-top-ups', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0043: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  // PAYMENT
  BFF_07_0004: { path: '/core-bill/v1/cash-receipts-issue-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0005: { path: '/core-bill/v1/point-autopays-history/cashback', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0006: { path: '/core-bill/v1/point-autopays-history/tpoint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0007: { path: '/core-bill/v1/point-autopays-history/tpoint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0017: { path: '/core-bill/v1/bill-pay/tax-reprint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0018: { path: '/core-bill/v1/bill-pay/tax-reprint-email', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0019: { path: '/core-bill/v1/bill-pay/tax-reprint-fax', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0021: { path: '/payment/settle-unpaids', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0022: { path: '/core-bill/v1/bill-pay/autopay-banks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0023: { path: '/core-bill/v1/bill-pay/settle-pay-bank', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0024: { path: '/core-bill/v1/bill-pay/cardnum-validation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0025: { path: '/core-bill/v1/bill-pay/settle-pay-card', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0026: { path: '/core-bill/v1/bill-pay/settle-vbs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0027: { path: '/core-bill/v1/bill-pay/settle-vb-sms/args-0', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0028: { path: '/core-bill/v1/bill-pay/avail-point-search', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0029: { path: '/core-bill/v1/bill-pay/pay-ocb-tpoint-proc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0030: { path: '/core-bill/v1/payment/total-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0032: { path: '/core-bill/v1/payment/over-payment-refund-account', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0035: { path: '/core-bill/v1/payment/realtime-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0036: { path: '/core-bill/v1/payment/realtime-payment-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0037: { path: '/core-bill/v1/payment/auto-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0039: {
    path: '/core-bill/v1/payment/auto-integrated-account-payment',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0040: {
    path: '/core-bill/v1/payment/auto-integrated-payment-cancle-request',
    method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true
  },
  BFF_07_0041: { path: '/core-bill/v1/ocbcard-info-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0042: { path: '/core-bill/v1/rainbow-point-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0043: { path: '/core-bill/v1/ocbcard-no-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0045: { path: '/core-bill/v1/ocb-point-onetime-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0046: { path: '/core-bill/v1/ocb-point-onetime-result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0047: { path: '/core-bill/v1/ocb-point-onetime-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0048: { path: '/core-bill/v1/rainbow-point-onetime-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0050: { path: '/core-bill/v1/rainbow-point-onetime-cancel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0051: { path: '/core-bill/v1/ocb-point-autopay-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0052: { path: '/core-bill/v1/rainbow-point-autopay-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0054: { path: '/core-bill/v1/ocb-point-autopay-modify', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0055: { path: '/core-bill/v1/ocb-point-autopay-result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0056: { path: '/core-bill/v1/rainbow-point-autopay-change', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0058: { path: '/core-bill/v1/ocb-point-onetime-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0059: { path: '/core-bill/v1/rainbow-point-onetime-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0060: { path: '/core-bill/v1/auto-payments', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0061: { path: '/core-bill/v1/auto-payments', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0062: { path: '/core-bill/v1/auto-payments', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0063: { path: '/core-bill/v1/auto-payments', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_07_0064: { path: '/core-bill/v1/autopay/db-req', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0065: { path: '/core-bill/v1/autopay/pay-cycl-chg/args-0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0068: { path: '/core-bill/v1/autopay/card-info/args-0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0071: {
    path: '/core-bill/v1/microPrepay/microPrepay-hist-requests',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_07_0072: {
    path: '/core-bill/v1/microPrepay/microPrepay-auto-prepay-Yn',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_07_0073: { path: '/core-bill/v1/microPrepay/microPrepay-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0074: { path: '/core-bill/v1/microPrepay/microPrepay-process', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0075: { path: '/core-bill/v1/microPrepay/microPrepay-autolist', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0076: { path: '/core-bill/v1/microPrepay/microPrepay-auto-req', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0077: { path: '/core-bill/v1/microPrepay/microPrepay-auto-delete', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0078: {
    path: '/core-bill/v1/useContentsPrepay/useContentsPrepay-hist-requests',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_07_0079: {
    path: '/core-bill/v1/useContentsPrepay/useContents-autoPrepay-hist',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0080: {
    path: '/core-bill/v1/useContentsPrepay/useContents-autoPrepay-reqYn',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_07_0081: {
    path: '/core-bill/v1/useContentsPrepay/useContentsPrepay-requests',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0082: {
    path: '/core-bill/v1/useContentsPrepay/useContentsPrepay-process',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0083: {
    path: '/core-bill/v1/useContentsPrepay/useContents-autoPrepay-process',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0084: {
    path: '/core-bill/v1/useContentsPrepay/useContents-autoPrepay-delete',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0085: {
    path: '/core-bill/v1/useContentsPrepay/useContents-autoPrepay-amt',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_07_0086: {
    path: '/core-bill/v1/microPrepay/microPrepay-autoPrepay-amt',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },

  // CUSTOMER
  BFF_08_0001: { path: '/core-modification/v1/counsel-time-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0002: { path: '/core-modification/v1/counsel-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0003: { path: '/core-modification/v1/counsel-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0004: { path: '/core-modification/v1/region-store-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0004B: { path: '/core-modification/v1/region-store-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0005: { path: '/core-modification/v1/region-addr-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0005B: { path: '/core-modification/v1/region-addr-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0006: { path: '/core-modification/v1/region-subway-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0006B: { path: '/core-modification/v1/region-subway-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0007: { path: '/core-modification/v1/region-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0008: { path: '/core-modification/v1/region-close-store-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0009: { path: '/core-modification/v1/voice-certification-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0010: { path: '/core-modification/v1/email-inquiry-categories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0013: { path: '/core-modification/v1/email-inquiry', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0014: { path: '/cs/file-upload', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0015: { path: '/core-modification/v1/brand-phone-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0016: { path: '/core-modification/v1/direct-shop/order-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0020: { path: '/core-modification/v1/inquiry-direct-shop', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0021: { path: '/core-modification/v1/inquiry-chocolate', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0023: { path: '/core-modification/v1/survey/surveyCustList', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0024: { path: '/core-modification/v1/survey/surveyViewResult', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0025: { path: '/core-modification/v1/survey/surveyMainBanner', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0026: { path: '/core-modification/v1/guide/categories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0028: { path: '/core-modification/v1/notice-tworld-main', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0029: { path: '/core-modification/v1/notice-tworld', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0031: { path: '/core-modification/v1/notice-membership', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0033: { path: '/core-modification/v1/prevent/notice', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0034: { path: '/core-modification/v1/voice-certification', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0035: { path: '/core-modification/v1/survey/surveyJoin', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0036: { path: '/core-modification/v1/survey/surveyJoinQstn', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0038: { path: '/core-modification/v1/survey/surveyQstn', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0039: { path: '/core-modification/v1/notice-direct', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0040: { path: '/core-modification/v1/notice-roaming', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0041: { path: '/core-modification/v1/prevent/notice/args-0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0042: { path: '/core-modification/v1/email-inquiry/service-mobile', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0043: { path: '/core-modification/v1/email-inquiry/service-internet', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0044: { path: '/core-modification/v1/email-inquiry/quality-mobile', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0045: { path: '/core-modification/v1/email-inquiry/quality-internet', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0050: { path: '/core-modification/v1/ifaq/iFaqList', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0051: { path: '/core-modification/v1/ifaq/iFaq-category-List', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0052: { path: '/core-modification/v1/ifaq/iFaqList-Cate', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0053: { path: '/core-modification/v1/guide/content', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0054: { path: '/core-modification/v1/require-document/reqDocument', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0056: { path: '/core-modification/v1/guide/use-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0057: { path: '/core-modification/v1/guide/site-use', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // EVENT
  BFF_09_0001: { path: '/core-membership/v1/event/ing-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0002: { path: '/core-membership/v1/event/detail/args-0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0003: { path: '/core-membership/v1/event/old-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0004: { path: '/core-membership/v1/event/win-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0005: { path: '/core-membership/v1/event/win-detail/args-0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // TID
  OIDC: { path: '/auth/authorize.do', method: API_METHOD.GET, server: API_SERVER.TID, bypass: false },
  LOGOUT: { path: '/sso/web/v1/ssologout.do', method: API_METHOD.GET, server: API_SERVER.TID, bypass: false },

  // TEST
  GET: { path: '/posts', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  GET_PARAM: { path: '/comments', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  GET_PATH_PARAM: { path: '/posts/args-0', method: API_METHOD.GET, server: API_SERVER.TEST, bypass: true },
  POST: { path: '/posts', method: API_METHOD.POST, server: API_SERVER.TEST, bypass: true },
  POST_PARAM: { path: '/posts', method: API_METHOD.POST, server: API_SERVER.TEST, bypass: true },
  PUT: { path: '/posts/1', method: API_METHOD.PUT, server: API_SERVER.TEST, bypass: true },
  PUT_PARAM: { path: '/posts/1', method: API_METHOD.PUT, server: API_SERVER.TEST, bypass: true },
  DELETE: { path: '/posts/1', method: API_METHOD.DELETE, server: API_SERVER.TEST, bypass: true },
  DELETE_PARAM: {}
};

export const API_CODE = {
  CODE_00: '00',    // success
  CODE_01: 'RDT0001',    // 화면 차단
  CODE_02: 'RDT0002',    // API 차단
  CODE_03: 'RDT0003',    // 2차 인증
  CODE_04: 'RDT0004',    // 로그인 필요
  CODE_05: 'RDT0005',    // 접근 불가 (권한)
  // CODE_06: 'RDT0006',    // 고객 비밀번호 인증 필요
  // CODE_07: 'RDT0007',    // 고객 비밀번호 재설정 필요
  // CODE_08: 'RDT0008',    // 고객 비밀번호 초기화상
  CODE_99: 'RDT0099',    // Circuit Open
  CODE_200: '200',
  CODE_400: '400'
};

export const API_SVC_PWD_ERROR = {
  ATH3000: 'ATH3000',     // 변경할 회선 고객보호비밀번호 입력 필요
  BFF9000: 'BFF9000',     // 변경할 회선 고객보호비밀번호 입력 필요
  ICAS3481: 'ICAS3481',   // 고객보호비밀번호 입력 오류 1회
  ICAS3482: 'ICAS3482',   // 고객보호비밀번호 입력 오류 2회
  ICAS3483: 'ICAS3483',   // 고객보호비밀번호 입력 오류 3회
  ICAS3484: 'ICAS3484',   // 고객보호비밀번호 입력 오류 4회
  ICAS3215: 'ICAS3215',   // 고객보호비밀번호 입력 오류 5회 (잠김예정)
  ICAS3216: 'ICAS3216'    // 고객보호비밀번호 기 잠김
};

export const API_LOGIN_ERROR = {
  ATH1003: 'ATH1003',     // 로그인 30회 초과
  ATH3236: 'ATH3236',     // 분실정지(대표회선)
  ICAS3228: 'ICAS3228',   // 고객보호비밀번호(대표회선) 입력 필요
  ICAS3235: 'ICAS3235'    // 휴면계정
};

export const API_MYT_ERROR_CODE = [
  'BLN0001', // 잔여기본통화 조회횟수 초과
  'BLN0002', // 조회불가대상
  'BLN0003', // 정지이력
  'BLN0004', // 조회불가대상
];

export const API_MYT_ERROR = {
  BIL0011: 'BIL0011',  // SK브로드밴드 서비스는 사용이 불가능한 메뉴입니다.
  MBR0001 : 'MBR0001', // 타인명의로 카드가 발급되었습니다.
  MBR0002 : 'MBR0002'  // 발급된 카드정보가 없습니다.
};

export const API_GIFT_ERROR = [
  'RCG0001',   // 제공자 선물하기 불가 상태
  'RCG0002',   // 제공자 선물하기 불가 요금제
  'RCG0003',   // 제공자 당월 선물가능 횟수 초과 (월2회)
  'RCG0004',   // 제공자 당월 선물가능 용량 미달
  'RCG0005',   // 제공자가 미성년자이면 선물하기 불가
  'RCG0006',   // 수혜자 선물수신 불가상태
  'RCG0007',   // 수혜자 선물수신 불가 요금제
  'RCG0008',   // 수혜자 당월 선물수신 횟수 초과 (월2회)
  'RCG0011',   // 제공자 회선과 수혜자 회선이 동일한 경우
  'RCG0013',   // 그 외 기타에러
  'RCG0015',   // 기타 불가
];



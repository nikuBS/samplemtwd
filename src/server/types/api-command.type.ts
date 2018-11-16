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
  BFF_03_0003_C: { path: '/svc-catalog/detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004_C: { path: '/change-svc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0005_C: { path: '/selected-svc', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0023_C: { path: '/core-recharge/v1/refill-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  // COMMON
  BFF_01_0002: { path: '/v1/common/sessions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0003: { path: '/v1/common/selected-sessions', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: false },
  BFF_01_0005: { path: '/v1/common/selected-sessions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false, native: true },
  BFF_01_0006: { path: '/core-modification/v1/address/legal-dongs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0007: { path: '/core-modification/v1/address/legal-dongs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0008: { path: '/core-modification/v1/address/street-names', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0009: { path: '/core-modification/v1/address/mailboxes', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0010: { path: '/core-modification/v1/address/lot-numbers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0011: { path: '/core-modification/v1/address/buildings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0012: { path: '/core-modification/v1/address/standard', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0013: { path: '/core-modification/v1/address/standard', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0014: { path: '/core-auth/v1/auth-sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0015: { path: '/v1/auth/skt-sms', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0016: { path: '/core-auth/v1/noti-sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0017: { path: '/core-auth/v1/auth/email', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0018: { path: '/v1/auth/email-authentication', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_01_0019: { path: '/core-auth/v1/auth/motp', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0020: { path: '/v1/auth/motp/auth', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0021: { path: '/core-auth/v1/auth/motp', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0022: { path: '/v1/auth/nice/ipin/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0023: { path: '/v1/auth/nice/ipin/result', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0024: { path: '/v1/auth/nice/sms/apply', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0025: { path: '/v1/auth/nice/sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_01_0026: { path: '/v1/cert/success', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0027: { path: '/v1/pwd-cert-chk ', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0028: { path: '/core-auth/v1/auth/skt/sms-finance', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0029: { path: '/v1/auth/secure/client-key', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0030: { path: '/v1/auth/secure/server-key', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0031: { path: '/registrationrequestfromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0032: { path: '/registrationresponsefromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0033: { path: '/authenticationrequestfromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0034: { path: '/authenticationresponsefromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0035: { path: '/v1/cert/app', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0036: { path: '/v1/cert/info', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0037: { path: '/core-auth/v1/auth-sms-corporation', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_01_0038: { path: '/deregistrationrequestfromfc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_01_0039: { path: '/v1/bpcp', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0040: { path: '/core-auth/v1/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0042: { path: '/core-bill/v1/refund/cancel-refund-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_01_0044: { path: '/core-bill/v1/bill-pay/bank-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_01_0046: { path: '/core-modification/v1/uscan/file-upload', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  // AUTH
  BFF_03_0000: { path: '/v1/test-login', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0001: { path: '/v1/logout', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_03_0002: { path: '/v1/user/account-auth-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0003: { path: '/v1/user/accounts', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0004: { path: '/core-auth/v1/services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0005: { path: '/v1/user/services', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: false },
  BFF_03_0006: { path: '/v1/user/nick-names/:args0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0007: { path: '/v1/user/tid-keys', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_03_0008: { path: '/v1/user/sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false, native: true },
  BFF_03_0009: { path: '/v1/user/service-password-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0010: { path: '/v1/user/locks', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_03_0011: { path: '/core-auth/v1/nationalities', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0012: { path: '/v1/user/biz-auth-sessions', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0013: { path: '/v1/user/biz-services', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0014: { path: '/core-auth/v1/marketing-offer-subscriptions/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0015: { path: '/core-auth/v1/marketing-offer-subscriptions/:args0', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0016: { path: '/core-auth/v1/service-passwords', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0017: { path: '/v1/user/login/android', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0018: { path: '/v1/user/login/ios', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_03_0019: { path: '/core-auth/v1/users/:args0/otp', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_03_0020: { path: '/core-auth/v1/passwords-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0021: { path: '/core-auth/v1/tworld-term-agreements', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0022: { path: '/core-auth/v1/tworld-term-agreements', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0023: { path: '/core-auth/v1/t-noti-term-agreements', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_03_0024: { path: '/core-auth/v1/t-noti-term-agreements', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0025: { path: '/core-auth/v1/requestRegistFcmUserInfo', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_03_0026: { path: '/core-auth/v1/requestRegistFcmClickInfo', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true, native: true },
  BFF_03_0027: { path: '/core-auth/v1/users/:args0/otp', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_03_0028: { path: '/core-auth/v1/free-sms-availability/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true, native: true },
  // MainHome T-Notify
  BFF_04_0001: { path: '/core-membership/v1/card/home', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_04_0002: { path: '/core-product/v1/t-notice/prod-chg-hst', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  // MYT
  BFF_05_0001: { path: '/v1/my-t/balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0002: { path: '/my-t/balance-add-ons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0003: { path: '/core-balance/v1/troaming-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0004: { path: '/core-balance/v1/data-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0005: { path: '/core-balance/v1/tdata-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0006: { path: '/core-balance/v1/data-top-up', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0007: { path: '/core-balance/v1/ting', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0008: { path: '/core-balance/v1/data-discount', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0009: { path: '/core-balance/v1/data-sharings/child', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0010: { path: '/core-balance/v1/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0011: { path: '/core-balance/v1/tdata-sharings/:args0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0013: { path: '/core-recharge/v1/pps-card', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0014: { path: '/core-balance/v1/pps-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0020: { path: '/core-bill/v1/bill-pay/recent-bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0021: { path: '/core-bill/v1/bill-pay/recent-usages', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0028: { path: '/core-bill/v1/bill-reissue', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0030: { path: '/core-bill/v1/bill-pay/unpaid-bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0031: { path: '/core-bill/v1/bill-pay/payment-possible-day', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0032: { path: '/core-bill/v1/bill-pay/payment-possible-day-input', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0033: { path: '/core-bill/v1/bill-pay/autopay-schedule', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0034: { path: '/core-bill/v1/bill-pay/suspension-cancel', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0036: { path: '/core-bill/v1/bill-pay/bills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0037: { path: '/core-bill/v1/bill-pay/suspension', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0038: { path: '/core-bill/v1/bill-pay/donation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0039: { path: '/core-bill/v1/bill-types-return-list/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0039_N: { path: '/core-bill/v1/bill-types-return', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0040: {
    path: '/core-product/v1/services/wireless/additions/:args0',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_05_0041: { path: '/core-product/v1/services/base-fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0044: { path: '/core-bill/v1/bill-pay/roaming', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0045: { path: '/core-bill/v1/bill-pay/call-gift', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0047: { path: '/core-bill/v1/bill-pay/used-amounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0048: { path: '/core-bill/v1/bill-reissue', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0022: { path: '/core-bill/v1/hotbills', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0024: { path: '/core-auth/v1/children', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0025: { path: '/core-bill/v1/bill-types', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0027: { path: '/core-bill/v1/bill-types', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0035: { path: '/core-bill/v1/hotbill/fee/hotbill-request', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0049: { path: '/core-bill/v1/integrated-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0050: { path: '/core-bill/v1/wire-bill-types', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0051: { path: '/core-bill/v1/wire-bill-reissue/', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0052: { path: '/core-bill/v1/wire-bill-reissue/', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0058: { path: '/core-bill/v1/accounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0059: { path: '/core-bill/v1/recent-usage-fee-pattern', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0060: { path: '/core-modification/v1/no-contract-plan-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0061: { path: '/core-modification/v1/my-svc-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0062: { path: '/core-modification/v1/wire-network-notification', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0063: { path: '/v1/my-t/myinfo/discount-infos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0064: { path: '/core-bill/v1/useContents/getUseContents', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0066: { path: '/core-bill/v1/useContents/getUseContentsLimit', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0067: { path: '/core-bill/v1/useContents/getUpdateUseContentsLimit', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0068: { path: '/v1/my-t/my-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0069: { path: '/core-auth/v1/service-passwords', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0070: { path: '/core-auth/v1/service-passwords-change', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0071: { path: '/core-auth/v1/service-passwords', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0074: { path: '/core-modification/v1/use-data-patterns', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0076: { path: '/core-modification/v1/myinfo/discount-infos-month', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0078: { path: '/core-balance/v1/band-data-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0079: { path: '/core-bill/v1/microPay-hist-request', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0080: { path: '/core-bill/v1/microPay-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0081: { path: '/core-bill/v1/microPay-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0082: { path: '/core-bill/v1/microPay-auto-set', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0083: { path: '/core-bill/v1/microPay-requests', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0085: { path: '/core-bill/v1/micropay-password-status', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0086: { path: '/core-bill/v1/micropay-password-create', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0087: { path: '/core-bill/v1/micropay-password-changes', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0089: { path: '/core-bill/v1/prepayInfo', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0091: { path: '/core-bill/v1/recent-usage-pattern', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0092: { path: '/core-modification/v1/wire-network-notification-smsinfo', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0093: { path: '/core-bill/v1/microPay-cphist-request', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0094: { path: '/core-modification/v1/combination-discounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0096: { path: '/core-product/v1/benefit-suggestions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0098: { path: '/core-membership/v1/card-vip-benefit', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0100: { path: '/core-bill/v1/rainbow-point-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0122: { path: '/core-bill/v1/cookiz-ting-point-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0101: { path: '/core-bill/v1/rainbow-point-services', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0102: { path: '/core-bill/v1/rainbow-point-adjustments', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0103: { path: '/core-bill/v1/rainbow-point-families', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0104: { path: '/core-bill/v1/rainbow-point-transfers', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0105: { path: '/core-bill/v1/rainbow-point-transfers/:args0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0106: { path: '/core-modification/v1/bill-discounts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0107: { path: '/core-modification/v1/my-discount-benefit/support-agree-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0108: { path: '/core-modification/v1/my-discount-benefit/choice-agree-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0110: { path: '/core-modification/v1/benefit/ltrm-scrb', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0111: { path: '/core-modification/v1/benefit/wlf-cust-dc', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0115: { path: '/core-bill/v1/cookiz-ting-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0120: { path: '/core-bill/v1/military-service-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0121: { path: '/core-bill/v1/military-service-point-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0123: { path: '/core-product/v1/services/unavailableness', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0124: { path: '/core-membership/v1/my-membership-benefit/check-membership', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0125: { path: '/core-product/v1/fee-plans/change-notices', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0126: { path: '/core-product/v1/fee-plans/change-notices', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0127: { path: '/core-product/v1/fee-plans/change-notices', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0128: { path: '/core-product/v1/services/wire/fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0129: { path: '/core-product/v1/services/wire/additions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0130: { path: '/core-bill/v1/rainbow-point-adjustments', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0131: { path: '/core-bill/v1/rainbow-point-transfers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0132: { path: '/core-bill/v1/rainbow-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0133: { path: '/core-product/v1/services/combinations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0134: { path: '/core-product/v1/services/combinations/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0135: { path: '/core-product/v1/services/combinations/data-benefits', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0136: { path: '/core-product/v1/services/wireless/fee-plans', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0137: { path: '/core-product/v1/services/wireless/additions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0138: { path: '/core-product/v1/services/combinations/data-sharings', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0139: { path: '/core-modification/v1/myinfo/wire-service-contracts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0140: { path: '/core-modification/v1/wire-agreements', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0141: { path: '/core-modification/v1/wire-agreements-penalty', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0142: { path: '/core-modification/v1/wire-agreements', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0143: { path: '/core-modification/v1/wire-agreements-changes', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0146: { path: '/core-bill/v1/bill-address', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0147: { path: '/core-bill/v1/bill-address-change', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_05_0149: { path: '/core-modification/v1/phone-pause-states', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0150: { path: '/core-modification/v1/wire-troubles-cancel', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0151: { path: '/core-modification/v1/phone-pause-states', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0152: { path: '/core-modification/v1/phone-pause-states', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0153: { path: '/core-modification/v1/wire-products-changes', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0155: { path: '/core-modification/v1/myinfo/discount-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0156: { path: '/core-modification/v1/wire-troubles', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0157: { path: '/core-modification/v1/wire-troubles-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0158: { path: '/core-modification/v1/wire/penalty-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0159: { path: '/core-modification/v1//wireInfo/listGiftProvide', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0160: { path: '/core-modification/v1/myinfo/wire-free-call-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0161: { path: '/core-product/v1/services/wireless/additions/cnt', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0162: { path: '/core-modification/v1/myinfo/chg-wire-addr-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0163: { path: '/core-modification/v1/myinfo/chg-wire-addr', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0165: { path: '/core-modification/v1/wire/change-request', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0164: { path: '/core-modification/v1/wire-phone/chang-status', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0166: { path: '/core-product/v1/submain/additions/joininfos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0167: { path: '/core-modification/v1/wire-registration-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0168: { path: '/core-modification/v1/wire/prod-change', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0169: { path: '/core-modification/v1/myinfo/wire-pause-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0170: { path: '/core-modification/v1/myinfo/wire-set-pause', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0171: { path: '/core-modification/v1/myinfo/wire-remove-pause', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0172: { path: '/core-modification/v1/myinfo/get-wire-cancel-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0173: { path: '/core-modification/v1/myinfo/get-wire-cancel-fee', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0174: { path: '/core-modification/v1/myinfo/set-wire-cancel-service', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0175: { path: '/core-bill/v1/no-contract-plan-points', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0176: { path: '/core-bill/v1/microPay-requests-limitDown', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_05_0177: { path: '/core-bill/v1/useContents/getUpdateUseContentsLimitDown', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: false },
  BFF_05_0178: { path: '/core-modification/v1/wire-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0179: { path: '/core-product/v1/services/wire/additions/count', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0180: { path: '/core-modification/v1/new-number-notifications', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0181: { path: '/core-product/v1/submain/wire/joininfos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0182: { path: '/core-modification/v1/new-number-notifications', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0183: { path: '/core-modification/v1/new-number-notifications', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_05_0184: { path: '/core-modification/v1/numberSearch', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_05_0185: { path: '/core-modification/v1/numberChange', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_05_0186: { path: '/core-modification/v1/numberChangeInit', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_05_0194: { path: '/core-modification/v1/longterm-phone-pause-states', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },

  // RECHARGE
  BFF_06_0001: { path: '/core-recharge/v1/refill-coupons', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0002: { path: '/core-recharge/v1/refill-usages', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0003: { path: '/core-recharge/v1/refill-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0004: { path: '/core-gift/v1/regular-data-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0005: { path: '/core-gift/v1/regular-data-gifts', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0006: { path: '/core-gift/v1/regular-data-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0007: { path: '/core-recharge/v1/refill-coupons', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_06_0008: { path: '/core-recharge/v1/refill-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0009: { path: '/core-recharge/v1/refill-options', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0010: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0011: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0012: { path: '/core-recharge/v1/data-gift-request-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0013: { path: '/core-recharge/v1/data-gift-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0014: { path: '/core-gift/v1/data-gift-balances', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0015: { path: '/core-gift/v1/data-gift-senders', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0016: { path: '/core-gift/v1/data-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0017: { path: '/core-gift/v1/data-gift-messages', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0018: { path: '/core-gift/v1/data-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0019: { path: '/core-gift/v1/data-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0020: { path: '/core-recharge/v1/ting-gift-senders', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0021: { path: '/core-recharge/v1/ting-gift-blocks', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0022: { path: '/core-recharge/v1/ting-gift-receivers', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0023: { path: '/core-recharge/v1/ting-gifts', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0024: { path: '/core-recharge/v1/ting-press-benefiters', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0025: { path: '/core-recharge/v1/ting-gift-requests', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0026: { path: '/core-recharge/v1/ting-gifts', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0027: { path: '/core-recharge/v1/ting-gift-blocks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0028: { path: '/core-recharge/v1/ting-subscriptions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0029: { path: '/core-recharge/v1/ting-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0030: { path: '/core-recharge/v1/regular-ting-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0031: { path: '/core-recharge/v1/regular-ting-top-ups', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0032: { path: '/core-recharge/v1/ting-top-ups', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0033: { path: '/core-recharge/v1/ting-permissions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0034: { path: '/core-recharge/v1/data-limitation-subscriptions', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0035: { path: '/core-recharge/v1/regular-data-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0036: { path: '/core-recharge/v1/data-top-ups', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0037: { path: '/core-recharge/v1/regular-data-top-ups', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0038: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0039: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0040: { path: '/core-recharge/v1/regular-data-limitations', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0041: { path: '/core-recharge/v1/regular-data-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0042: { path: '/core-recharge/v1/data-top-ups', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0043: { path: '/core-recharge/v1/data-limitations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0044: { path: '/core-balance/v1/tfamily-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0045: { path: '/core-recharge/v1/tfamily-shareable-data', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0046: { path: '/core-recharge/v1/tfamily-sharings', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0047: { path: '/core-recharge/v1/regular-tfamily-sharings', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_06_0048: { path: '/core-recharge/v1/regular-tfamily-sharings', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0049: { path: '/core-recharge/v1/regular-tfamily-sharings', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0050: { path: '/core-recharge/v1/tfamily-sharing-limitations', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0051: { path: '/core-recharge/v1/tfamily-sharing-limitations', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0052: { path: '/core-bill/v1/pps-cards', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0053: { path: '/core-bill/v1/pps-credit-cards', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0054: { path: '/core-bill/v1/pps-auto', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0055: { path: '/core-bill/v1/pps-auto', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0057: { path: '/core-bill/v1/pps-auto', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0058: { path: '/core-bill/v1/pps-data', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0059: { path: '/core-bill/v1/pps-data-auto', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0060: { path: '/core-bill/v1/pps-data-auto', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0061: { path: '/core-bill/v1/pps-data-auto', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_06_0062: { path: '/core-bill/v1/pps-recharges', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0063: { path: '/core-bill/v1/pps-data-recharges', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_06_0064: { path: '/core-bill/v1/pps-alram', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0065: { path: '/core-bill/v1/credit-cards', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_06_0066: { path: '/core-product/v1/gift-refill-products', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // PAYMENT
  BFF_07_0004: { path: '/core-bill/v1/cash-receipts-issue-history', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0005: { path: '/core-bill/v1/point-autopays-history/cashback', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0006: { path: '/core-bill/v1/point-autopays-history/tpoint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0007: { path: '/core-bill/v1/point-autopays-history/tpoint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0017: { path: '/core-bill/v1/bill-pay/tax-reprint', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0018: { path: '/core-bill/v1/bill-pay/tax-reprint-email', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0019: { path: '/core-bill/v1/bill-pay/tax-reprint-fax', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0021: { path: '/core-bill/v1/bill-pay/settle-unpaids', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_07_0022: { path: '/core-bill/v1/bill-pay/autopay-banks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0023: { path: '/v1/payment/settle-pay-bank', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0024: { path: '/core-bill/v1/bill-pay/cardnum-validation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0025: { path: '/v1/payment/settle-pay-card', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0026: { path: '/core-bill/v1/bill-pay/settle-vbs', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0027: { path: '/core-bill/v1/bill-pay/settle-vb-sms', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0028: { path: '/core-bill/v1/bill-pay/avail-point-search', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0029: { path: '/core-bill/v1/bill-pay/pay-ocb-tpoint-proc', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0030: { path: '/core-bill/v1/payment/total-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0032: { path: '/core-bill/v1/payment/over-payment-refund-account', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0035: { path: '/core-bill/v1/payment/realtime-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0036: { path: '/core-bill/v1/payment/realtime-payment-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0037: { path: '/core-bill/v1/payment/auto-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0038: { path: '/core-bill/v1/bill-pay/donation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0039: {
    path: '/core-bill/v1/payment/auto-integrated-account-payment',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0040: {
    path: '/core-bill/v1/payment/auto-integrated-payment-cancle-request',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_07_0041: { path: '/core-bill/v1/ocbcard-info-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0042: { path: '/core-bill/v1/rainbow-point-check-show', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
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
  BFF_07_0060: { path: '/core-bill/v1/auto-payments', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0061: { path: '/v1/auto-payments', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0062: { path: '/v1/auto-payments', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0063: { path: '/core-bill/v1/auto-payments', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_07_0064: { path: '/core-bill/v1/autopay/db-req', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0065: { path: '/core-bill/v1/autopay/pay-cycl-chg', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_07_0068: { path: '/core-bill/v1/autopay/card-info/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0070: { path: '/core-bill/v1/payment/auto-integrated-payment/account', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0071: {
    path: '/core-bill/v1/microPrepay/microPrepay-hist-requests',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
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
    bypass: true
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
  BFF_07_0087: { path: '/core-bill/v1/ocb-point-pay', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_07_0089: { path: '/core-bill/v1/payment/auto-integrated-account-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0090: { path: '/core-bill/v1/payment/realtime-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0091: { path: '/core-bill/v1/payment/realtime-payment-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0092: { path: '/core-bill/v1/payment/auto-payment', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_07_0093: { path: '/core-bill/v1/point-onetime-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true},
  BFF_07_0094: { path: '/core-bill/v1/point-autopay-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true},


  // CUSTOMER
  BFF_08_0001: { path: '/core-modification/v1/counsel-time-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0002: { path: '/core-modification/v1/counsel-reserve', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0003: { path: '/core-modification/v1/counsel-histories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0004: { path: '/core-modification/v1/region-store-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0005: { path: '/core-modification/v1/region-addr-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0006: { path: '/core-modification/v1/region-subway-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0007: { path: '/core-modification/v1/region-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0008: { path: '/core-modification/v1/region-close-store-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0009: { path: '/core-modification/v1/voice-certification-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0010: { path: '/core-modification/v1/email-inquiry-categories', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0012: { path: '/core-modification/v1/email-inquiry/append-inquiry', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0013: { path: '/core-modification/v1/email-inquiry', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0014: { path: '/v1/cs/file-upload', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
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
  BFF_08_0041: { path: '/core-modification/v1/prevent/notice/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0042: { path: '/core-modification/v1/email-inquiry/service-mobile', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0043: { path: '/core-modification/v1/email-inquiry/service-internet', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0044: { path: '/core-modification/v1/email-inquiry/quality-mobile', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0045: { path: '/core-modification/v1/email-inquiry/quality-internet', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0049: { path: '/core-modification/v1/region-center-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0050: { path: '/core-modification/v1/ifaq/iFaqList', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0051: { path: '/core-modification/v1/ifaq/iFaq-category-List', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0052: { path: '/core-modification/v1/ifaq/iFaqList-Cate', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0053: { path: '/core-modification/v1/guide/content', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0054: { path: '/core-modification/v1/require-document/reqDocument', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0055: { path: '/core-modification/v1/region-center-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_08_0056: { path: '/core-modification/v1/guide/use-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0057: { path: '/core-modification/v1/guide/site-use', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0058: { path: '/core-modification/v1/praise/savePraiseInfo', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_08_0060: { path: '/core-modification/v1/email-inquiry-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0061: { path: '/core-modification/v1/email-inquiry-detail', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_08_0062: { path: '/core-modification/v1/email-inquiry', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },

  // EVENT
  BFF_09_0001: { path: '/core-membership/v1/event/ing-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0002: { path: '/core-membership/v1/event/detail/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0003: { path: '/core-membership/v1/event/old-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0004: { path: '/core-membership/v1/event/win-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_09_0005: { path: '/core-membership/v1/event/win-detail/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // PRODUCT
  BFF_10_0001: { path: '/core-product/v1/ledger/:args0', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0002: { path: '/core-product/v1/ledger/:args0/summaries', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0003: { path: '/core-product/v1/ledger/:args0/tags', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0004: { path: '/core-product/v1/ledger/:args0/contents', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0005: { path: '/core-product/v1/ledger/:args0/series', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0006: { path: '/core-product/v1/ledger/:args0/recommends', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0007: { path: '/core-product/v1/mobiles/fee-plans/:args0/joins/prechecks', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0008: { path: '/v1/products/fee-plans/:args0/join-term-infos', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0009: {
    path: '/core-product/v1/mobiles/fee-plans/joins/request-over-chargings',
    method: API_METHOD.POST,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0010: {
    path: '/core-product/v1/mobiles/fee-plans/joins/over-chargings',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0012: {
    path: '/v1/products/fee-plans/:args0/joins',
    method: API_METHOD.PUT,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0013: {
    path: '/core-product/v1/mobiles/fee-plans/:args0/tplan-sets',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0014: {
    path: '/core-product/v1/mobiles/fee-plans/:args0/tplan-sets',
    method: API_METHOD.PUT,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0015: {
    path: '/core-product/v1/mobiles/fee-plans/:args0/tplan-benefits',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: true
  },
  BFF_10_0017: {
    path: '/v1/products/additions/:args0/join-term-infos',
    method: API_METHOD.GET,
    server: API_SERVER.BFF,
    bypass: false
  },
  BFF_10_0018: { path: '/core-product/v1/mobiles/additions-set/:args0/joins', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0019: { path: '/core-product/v1/mobiles/additions-sets/:args0/sets/lines', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_10_0020: { path: '/core-product/v1/mobiles/additions-sets/:args0/sets/lines', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0021: { path: '/core-product/v1/mobiles/additions-sets/:args0/sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0022: { path: '/core-product/v1/mobiles/additions-sets/:args0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_10_0024: { path: '/core-product/v1/submain/banners', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0025: { path: '/core-product/v1/submain/my-filters', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0026: { path: '/core-product/v1/submain/grpprods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0027: { path: '/core-product/v1/submain/sprateprods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0028: { path: '/core-product/v1/submain/addsprateprods', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0029: { path: '/core-product/v1/submain/rcmndtags', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0030: { path: '/core-product/v1/submain/popraddbnnr', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0031: { path: '/core-product/v1/submain/products', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0032: { path: '/core-product/v1/submain/filters', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0033: { path: '/core-product/v1/submain/filters/:args0/sub-lists', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0034: { path: '/core-product/v1/mobiles/fee-plans/young-plan-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0035: { path: '/core-product/v1/mobiles/additions/:args0/joins', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0036: { path: '/core-product/v1/mobiles/additions/:args0', method: API_METHOD.DELETE, server: API_SERVER.BFF, bypass: true },
  BFF_10_0037: { path: '/core-product/v1/mobiles/fee-plans/t-tab-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0038: { path: '/core-product/v1/mobiles/additions/:args0/vas-terms', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0039: { path: '/core-product/v1/combinations/discount-simulation', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0040: { path: '/core-product/v1/mobiles/fee-plans/ting-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0041: { path: '/core-product/v1/mobiles/fee-plans/ting-sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0043: { path: '/core-product/v1/mobiles/fee-plans/zone-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0044: { path: '/core-product/v1/mobiles/fee-plans/zones', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0045: { path: '/core-product/v1/mobiles/fee-plans/zone-sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0046: { path: '/v1/products/fee-plans/:args0/option-sets', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0048: { path: '/core-modification/v1/wireJoin/listUseAddressService', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0050: { path: '/core-product/v1/submain/banners', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0054: { path: '/core-product/v1/submain/benefit-discount-products', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0062: { path: '/core-product/v1/mobiles/additions-sets/:args0/seldis-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0063: { path: '/core-product/v1/mobiles/additions-sets/:args0/seldis-sets', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0070: { path: '/core-product/v1/mobiles/fee-plans/num-couple-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0071: { path: '/core-product/v1/mobiles/fee-plans/num-couple-sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0072: { path: '/core-product/v1/mobiles/fee-plans/num-zone-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: false },
  BFF_10_0073: { path: '/core-product/v1/mobiles/fee-plans/snum-sets', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0074: { path: '/core-product/v1/mobiles/fee-plans/snum-sets', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_10_0076: { path: '/core-product/v1/wire/joins/counsel', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_10_0078: { path: '/core-product/v1/combinations/necessary-documents/inspects', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_0093: { path: '/core-product/v1/submain/tapps', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_10_9001: { path: '/v1/products/:args0/auth/:args1', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // MEMBERSHIP
  BFF_11_0001: { path: '/core-membership/v1/card/home', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0002: { path: '/core-membership/v1/card/info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0003: { path: '/core-membership/v1/card-reissue-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0004: { path: '/core-membership/v1/card-reissue-process', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0005: { path: '/core-membership/v1/card-reissue-cancel-process', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0006: { path: '/core-membership/v1/card/change', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0007: { path: '/core-membership/v1/card/check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0009: { path: '/core-membership/v1/card/used-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0010: { path: '/core-membership/v1/card/used-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0011: { path: '/core-membership/v1/card/create', method: API_METHOD.POST, server: API_SERVER.BFF, bypass: true },
  BFF_11_0012: { path: '/core-membership/v1/card/modify', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0013: { path: '/core-membership/v1/card/cancel-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0014: { path: '/core-membership/v1/card/cancel', method: API_METHOD.PUT, server: API_SERVER.BFF, bypass: true },
  BFF_11_0015: { path: '/core-membership/v1/card/create-check', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0021: { path: '/core-membership/v1/tmembership/area1-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0022: { path: '/core-membership/v1/tmembership/area2-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0023: { path: '/core-membership/v1/tmembership/mrcht-list', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },
  BFF_11_0024: { path: '/core-membership/v1/tmembership/mrcht-info', method: API_METHOD.GET, server: API_SERVER.BFF, bypass: true },

  // TID
  OIDC: { path: '/auth/authorize.do', method: API_METHOD.GET, server: API_SERVER.TID, bypass: false },
  LOGOUT: { path: '/sso/web/v1/ssologout.do', method: API_METHOD.GET, server: API_SERVER.TID, bypass: false },

  // TEST
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

export const API_CODE = {
  CODE_00: '00', // success
  CODE_01: 'RDT0001', // 화면 차단
  CODE_02: 'RDT0002', // API 차단
  CODE_03: 'RDT0003', // 2차 인증
  CODE_04: 'RDT0004', // 로그인 필요
  CODE_05: 'RDT0005', // 접근 불가 (권한)

  CODE_99: 'RDT0099', // Circuit Open
  CODE_200: '200',
  CODE_400: '400',
  CODE_404: '404'
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

Tw.API_METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

Tw.API_CMD = {
  BFF_03_0003_C: { path: '/svc-catalog/detail', method: Tw.API_METHOD.GET },
  BFF_03_0004_C: { path: '/change-svc', method: Tw.API_METHOD.POST },
  BFF_03_0005_C: { path: '/selected-svc', method: Tw.API_METHOD.GET },
  BFF_03_0023_C: { path: '/core-recharge/v1/refill-gifts', method: Tw.API_METHOD.POST },

  // COMMON
  BFF_01_0006: { path: '/core-modification/v1/address/legal-dongs', method: Tw.API_METHOD.GET },
  BFF_01_0007: { path: '/core-modification/v1/address/legal-dongs', method: Tw.API_METHOD.GET },
  BFF_01_0008: { path: '/core-modification/v1/address/street-names', method: Tw.API_METHOD.GET },
  BFF_01_0009: { path: '/core-modification/v1/address/mailboxes', method: Tw.API_METHOD.GET },
  BFF_01_0010: { path: '/core-modification/v1/address/lot-numbers', method: Tw.API_METHOD.GET },
  BFF_01_0011: { path: '/core-modification/v1/address/buildings', method: Tw.API_METHOD.GET },
  BFF_01_0012: { path: '/core-modification/v1/address/standard', method: Tw.API_METHOD.GET },
  BFF_01_0013: { path: '/core-modification/v1/address/standard', method: Tw.API_METHOD.GET },
  BFF_01_0014: { path: '/core-auth/v1/auth-sms', method: Tw.API_METHOD.POST },
  BFF_01_0015: { path: '/v1/auth/skt-sms', method: Tw.API_METHOD.PUT },
  BFF_01_0016: { path: '/core-auth/v1/noti-sms', method: Tw.API_METHOD.POST },
  BFF_01_0017: { path: '/core-auth/v1/auth/email', method: Tw.API_METHOD.POST },
  BFF_01_0018: { path: '/v1/auth/email-authentication', method: Tw.API_METHOD.PUT },
  BFF_01_0019: { path: '/core-auth/v1/auth/motp', method: Tw.API_METHOD.POST },
  BFF_01_0020: { path: '/v1/auth/motp/auth', method: Tw.API_METHOD.POST },
  BFF_01_0021: { path: '/core-auth/v1/auth/motp', method: Tw.API_METHOD.GET },
  BFF_01_0026: { path: '/v1/cert/success', method: Tw.API_METHOD.POST },
  BFF_01_0027: { path: '/v1/pwd-cert-chk ', method: Tw.API_METHOD.POST },
  BFF_01_0028: { path: '/core-auth/v1/auth/skt/sms-finance', method: Tw.API_METHOD.POST },
  BFF_01_0029: { path: '/v1/auth/secure/client-key', method: Tw.API_METHOD.POST },
  BFF_01_0030: { path: '/v1/auth/secure/server-key', method: Tw.API_METHOD.POST },
  BFF_01_0031: { path: '/registrationrequestfromfc', method: Tw.API_METHOD.POST },
  BFF_01_0032: { path: '/registrationresponsefromfc', method: Tw.API_METHOD.POST },
  BFF_01_0033: { path: '/authenticationrequestfromfc', method: Tw.API_METHOD.POST },
  BFF_01_0034: { path: '/authenticationresponsefromfc', method: Tw.API_METHOD.POST },
  BFF_01_0035: { path: '/v1/cert/app', method: Tw.API_METHOD.POST },
  BFF_01_0036: { paht: '/v1/cert/info', method: Tw.API_METHOD.POST },
  BFF_01_0037: { path: '/core-auth/v1/auth-sms-corporation', method: Tw.API_METHOD.POST },
  BFF_01_0038: { path: '/deregistrationrequestfromfc', method: Tw.API_METHOD.POST },
  BFF_01_0044: { path: '/core-bill/v1/bill-pay/bank-list', method: Tw.API_METHOD.GET },
  BFF_01_0046: { path: '/core-modification/v1/uscan/file-upload', method: Tw.API_METHOD.POST },

  // AUTH
  BFF_03_0002: { path: '/v1/user/account-auth-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0003: { path: '/v1/user/accounts', method: Tw.API_METHOD.DELETE },
  BFF_03_0004: { path: '/core-auth/v1/services', method: Tw.API_METHOD.GET },
  BFF_03_0006: { path: '/v1/user/nick-names/:args0', method: Tw.API_METHOD.PUT },
  BFF_03_0007: { path: '/v1/user/tid-keys', method: Tw.API_METHOD.GET },
  BFF_03_0009: { path: '/v1/user/service-password-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0010: { path: '/v1/user/locks', method: Tw.API_METHOD.DELETE },
  BFF_03_0011: { path: '/core-auth/v1/nationalities', method: Tw.API_METHOD.GET },
  BFF_03_0012: { path: '/v1/user/biz-auth-sessions', method: Tw.API_METHOD.POST },
  BFF_03_0013: { path: '/v1/user/biz-services', method: Tw.API_METHOD.POST },
  BFF_03_0014: { path: '/core-auth/v1/marketing-offer-subscriptions/:args0', method: Tw.API_METHOD.GET },
  BFF_03_0015: { path: '/core-auth/v1/marketing-offer-subscriptions/:args0', method: Tw.API_METHOD.PUT },
  BFF_03_0016: { path: '/core-auth/v1/service-passwords', method: Tw.API_METHOD.PUT },
  BFF_03_0019: { path: '/core-auth/v1/users/:args0/otp', method: Tw.API_METHOD.POST },
  BFF_03_0020: { path: '/core-auth/v1/passwords-check', method: Tw.API_METHOD.GET },
  BFF_03_0021: { path: '/core-auth/v1/tworld-term-agreements', method: Tw.API_METHOD.GET },
  BFF_03_0022: { path: '/core-auth/v1/tworld-term-agreements', method: Tw.API_METHOD.PUT },
  BFF_03_0023: { path: '/core-auth/v1/t-noti-term-agreements', method: Tw.API_METHOD.GET },
  BFF_03_0024: { path: '/core-auth/v1/t-noti-term-agreements', method: Tw.API_METHOD.PUT },
  BFF_03_0025: { path: '/core-auth/v1/requestRegistFcmUserInfo', method: Tw.API_METHOD.POST },
  BFF_03_0026: { path: '/core-auth/v1/requestRegistFcmClickInfo', method: Tw.API_METHOD.POST },
  BFF_03_0027: { path: '/core-auth/v1/users/:args0/otp', method: Tw.API_METHOD.PUT },
  BFF_03_0028: { path: '/core-auth/v1/free-sms-availability/::args0', method: Tw.API_METHOD.GET },

  // MYT
  BFF_05_0001: { path: '/v1/my-t/balances', method: Tw.API_METHOD.GET },
  BFF_05_0002: { path: '/core-balance/v1/balance-add-ons', method: Tw.API_METHOD.GET },
  BFF_05_0003: { path: '/core-balance/v1/troaming-sharings', method: Tw.API_METHOD.GET },
  BFF_05_0004: { path: '/core-balance/v1/data-sharings', method: Tw.API_METHOD.GET },
  BFF_05_0005: { path: '/core-balance/v1/tdata-sharings', method: Tw.API_METHOD.GET },
  BFF_05_0006: { path: '/core-balance/v1/data-top-up', method: Tw.API_METHOD.GET },
  BFF_05_0007: { path: '/core-balance/v1/ting', method: Tw.API_METHOD.GET },
  BFF_05_0008: { path: '/core-balance/v1/data-discount', method: Tw.API_METHOD.GET },
  BFF_05_0009: { path: '/core-balance/v1/data-sharings/child', method: Tw.API_METHOD.GET },
  BFF_05_0010: { path: '/core-balance/v1/children', method: Tw.API_METHOD.GET },
  BFF_05_0011: { path: '/core-balance/v1/tdata-sharings/:args0', method: Tw.API_METHOD.DELETE },
  BFF_05_0013: { path: '/core-recharge/v1/pps-card', method: Tw.API_METHOD.GET },
  BFF_05_0014: { path: '/core-balance/v1/pps-histories', method: Tw.API_METHOD.GET },
  BFF_05_0020: { path: '/core-bill/v1/bill-pay/recent-bills', method: Tw.API_METHOD.GET },
  BFF_05_0021: { path: '/core-bill/v1/bill-pay/recent-usages', method: Tw.API_METHOD.GET },
  BFF_05_0022: { path: '/core-bill/v1/hotbills', method: Tw.API_METHOD.GET },
  BFF_05_0024: { path: '/core-bill/v1/child/children', method: Tw.API_METHOD.GET },
  BFF_05_0027: { path: '/core-bill/v1/bill-types', method: Tw.API_METHOD.PUT },
  BFF_05_0031: { path: '/core-bill/v1/bill-pay/payment-possible-day', method: Tw.API_METHOD.GET },
  BFF_05_0032: { path: '/core-bill/v1/bill-pay/payment-possible-day-input', method: Tw.API_METHOD.POST },
  BFF_05_0033: { path: '/core-bill/v1/bill-pay/autopay-schedule', method: Tw.API_METHOD.GET },
  BFF_05_0034: { path: '/core-bill/v1/bill-pay/suspension-cancel', method: Tw.API_METHOD.DELETE },
  // BFF_05_0035: { path: '/core-bill/v1/hotbill/fee/hotbill-request', method: Tw.API_METHOD.GET },
  BFF_05_0036: { path: '/core-bill/v1/bill-pay/bills', method: Tw.API_METHOD.GET },
  BFF_05_0038: { path: '/core-bill/v1/bill-pay/donation', method: Tw.API_METHOD.GET },
  BFF_05_0039_N: { path: '/core-bill/v1/bill-types-return', method: Tw.API_METHOD.GET },
  BFF_05_0041: { path: '/core-product/v1/services/base-fee-plans', method: Tw.API_METHOD.GET },
  BFF_05_0044: { path: '/core-bill/v1/bill-pay/roaming', method: Tw.API_METHOD.GET },
  BFF_05_0045: { path: '/core-bill/v1/bill-pay/call-gift', method: Tw.API_METHOD.GET },
  BFF_05_0047: { path: '/core-bill/v1/bill-pay/used-amounts', method: Tw.API_METHOD.GET },
  BFF_05_0048: { path: '/core-bill/v1/bill-reissue', method: Tw.API_METHOD.POST },
  BFF_05_0050: { path: '/core-bill/v1/wire-bill-types', method: Tw.API_METHOD.PUT },
  BFF_05_0052: { path: '/core-bill/v1/wire-bill-reissue', method: Tw.API_METHOD.POST },
  BFF_05_0058: { path: '/core-bill/v1/accounts', method: Tw.API_METHOD.GET },
  BFF_05_0060: { path: '/core-modification/v1/no-contract-plan-points', method: Tw.API_METHOD.GET },
  BFF_05_0062: { path: '/core-modification/v1/wire-network-notification', method: Tw.API_METHOD.POST },
  BFF_05_0064: { path: '/core-bill/v1/useContents/getUseContents', method: Tw.API_METHOD.GET },
  BFF_05_0066: { path: '/core-bill/v1/useContents/getUseContentsLimit', method: Tw.API_METHOD.GET },
  BFF_05_0067: { path: '/core-bill/v1/useContents/getUpdateUseContentsLimit', method: Tw.API_METHOD.POST },
  BFF_05_0069: { path: '/core-auth/v1/service-passwords', method: Tw.API_METHOD.PUT },
  BFF_05_0070: { path: '/core-auth/v1/service-passwords-change', method: Tw.API_METHOD.PUT },
  BFF_05_0071: { path: '/core-auth/v1/service-passwords', method: Tw.API_METHOD.DELETE },
  BFF_05_0076: { path: '/core-modification/v1/myinfo/discount-infos-month', method: Tw.API_METHOD.GET },
  BFF_05_0078: { path: '/core-balance/v1/band-data-sharings', method: Tw.API_METHOD.GET },
  BFF_05_0079: { path: '/core-bill/v1/microPay-hist-request', method: Tw.API_METHOD.POST },
  BFF_05_0080: { path: '/core-bill/v1/microPay-requests', method: Tw.API_METHOD.GET },
  BFF_05_0081: { path: '/core-bill/v1/microPay-requests', method: Tw.API_METHOD.POST },
  BFF_05_0082: { path: '/core-bill/v1/microPay-auto-set', method: Tw.API_METHOD.POST },
  BFF_05_0083: { path: '/core-bill/v1/microPay-requests', method: Tw.API_METHOD.PUT },
  BFF_05_0085: { path: '/core-bill/v1/micropay-password-status', method: Tw.API_METHOD.GET },
  BFF_05_0086: { path: '/core-bill/v1/micropay-password-create', method: Tw.API_METHOD.POST },
  BFF_05_0087: { path: '/core-bill/v1/micropay-password-changes', method: Tw.API_METHOD.PUT },
  BFF_05_0089: { path: '/core-bill/v1/prepayInfo', method: Tw.API_METHOD.GET },
  BFF_05_0093: { path: '/core-bill/v1/microPay-cphist-request', method: Tw.API_METHOD.GET },
  BFF_05_0094: { path: '/core-modification/v1/combination-discounts', method: Tw.API_METHOD.GET },
  BFF_05_0096: { path: '/core-product/v1/benefit-suggestions', method: Tw.API_METHOD.GET },
  BFF_05_0106: { path: '/core-modification/v1/bill-discounts', method: Tw.API_METHOD.GET },
  BFF_05_0115: { path: '/core-bill/v1/cookiz-ting-points', method: Tw.API_METHOD.GET },
  BFF_05_0120: { path: '/core-bill/v1/military-service-points', method: Tw.API_METHOD.GET },
  BFF_05_0102: { path: '/core-bill/v1/rainbow-point-adjustments', method: Tw.API_METHOD.POST },
  BFF_05_0104: { path: '/core-bill/v1/rainbow-point-transfers', method: Tw.API_METHOD.POST },
  BFF_05_0105: { path: '/core-bill/v1/rainbow-point-transfers/:args0', method: Tw.API_METHOD.DELETE },
  BFF_05_0123: { path: '/core-product/v1/services/unavailableness', method: Tw.API_METHOD.GET },
  BFF_05_0100: { path: '/core-bill/v1/rainbow-point-histories', method: Tw.API_METHOD.GET },
  BFF_05_0121: { path: '/core-bill/v1/military-service-point-histories', method: Tw.API_METHOD.GET },
  BFF_05_0122: { path: '/core-bill/v1/cookiz-ting-point-histories', method: Tw.API_METHOD.GET },
  BFF_05_0126: { path: '/core-product/v1/fee-plans/change-notices', method: Tw.API_METHOD.POST },
  BFF_05_0127: { path: '/core-product/v1/fee-plans/change-notices', method: Tw.API_METHOD.DELETE },
  BFF_05_0129: { path: '/core-product/v1/services/wire/additions', method: Tw.API_METHOD.GET },
  BFF_05_0132: { path: '/core-bill/v1/rainbow-points', method: Tw.API_METHOD.GET },
  BFF_05_0134: { path: '/core-product/v1/services/combinations/:args0', method: Tw.API_METHOD.GET },
  BFF_05_0135: { path: '/core-product/v1/services/combinations/data-benefits', method: Tw.API_METHOD.PUT },
  BFF_05_0137: { path: '/core-product/v1/services/wireless/additions', method: Tw.API_METHOD.GET },
  BFF_05_0138: { path: '/core-product/v1/services/combinations/data-sharings', method: Tw.API_METHOD.PUT },
  BFF_05_0139: { path: '/core-modification/v1/myinfo/wire-service-contracts', method: Tw.API_METHOD.GET },
  BFF_05_0141: { path: '/core-modification/v1/wire-agreements-penalty', method: Tw.API_METHOD.GET },
  BFF_05_0142: { path: '/core-modification/v1/wire-agreements', method: Tw.API_METHOD.PUT },
  BFF_05_0147: { path: '/core-bill/v1/bill-address-change', method: Tw.API_METHOD.PUT },
  BFF_05_0149: { path: '/core-modification/v1/phone-pause-states', method: Tw.API_METHOD.GET },
  BFF_05_0150: { path: '/core-modification/v1/wire-troubles-cancel', method: Tw.API_METHOD.DELETE },
  BFF_05_0151: { path: '/core-modification/v1/phone-pause-states', method: Tw.API_METHOD.POST },
  BFF_05_0152: { path: '/core-modification/v1/phone-pause-states', method: Tw.API_METHOD.DELETE },
  BFF_05_0155: { path: '/core-modification/v1/myinfo/discount-info', method: Tw.API_METHOD.GET },
  BFF_05_0156: { path: '/core-modification/v1/wire-troubles', method: Tw.API_METHOD.GET },
  BFF_05_0158: { path: '/core-modification/v1/wire/penalty-info', method: Tw.API_METHOD.GET },
  BFF_05_0159: { path: '/core-modification/v1//wireInfo/listGiftProvide', method: Tw.API_METHOD.GET },
  BFF_05_0160: { path: '/core-modification/v1/myinfo/wire-free-call-check', method: Tw.API_METHOD.GET },
  BFF_05_0163: { path: '/core-modification/v1/myinfo/chg-wire-addr', method: Tw.API_METHOD.POST },
  BFF_05_0164: { path: '/core-modification/v1/wire-phone/chang-status', method: Tw.API_METHOD.GET },
  BFF_05_0165: { path: '/core-modification/v1/wire/change-request', method: Tw.API_METHOD.POST },
  BFF_05_0161: { path: '/core-product/v1/services/wireless/additions/cnt', method: Tw.API_METHOD.GET },
  BFF_05_0170: { path: '/core-modification/v1/myinfo/wire-set-pause', method: Tw.API_METHOD.POST },
  BFF_05_0171: { path: '/core-modification/v1/myinfo/wire-remove-pause', method: Tw.API_METHOD.POST },
  BFF_05_0172: { path: '/core-modification/v1/myinfo/get-wire-cancel-info', method: Tw.API_METHOD.GET },
  BFF_05_0173: { path: '/core-modification/v1/myinfo/get-wire-cancel-fee', method: Tw.API_METHOD.GET },
  BFF_05_0174: { path: '/core-modification/v1/myinfo/set-wire-cancel-service', method: Tw.API_METHOD.POST },
  BFF_05_0175: { path: '/core-bill/v1/no-contract-plan-points', method: Tw.API_METHOD.GET },
  BFF_05_0176: { path: '/core-bill/v1/microPay-requests-limitDown', method: Tw.API_METHOD.POST },
  BFF_05_0177: { path: '/core-bill/v1/useContents/getUpdateUseContentsLimitDown', method: Tw.API_METHOD.POST },
  BFF_05_0182: { path: '/core-modification/v1/new-number-notifications', method: Tw.API_METHOD.POST },
  BFF_05_0183: { path: '/core-modification/v1/new-number-notifications', method: Tw.API_METHOD.DELETE },
  BFF_05_0184: { path: '/core-modification/v1/numberSearch', method: Tw.API_METHOD.GET },
  BFF_05_0185: { path: '/core-modification/v1/numberChange', method: Tw.API_METHOD.POST },

  // RECHARGE
  BFF_06_0001: { path: '/core-recharge/v1/refill-coupons', method: Tw.API_METHOD.GET },
  BFF_06_0002: { path: '/core-recharge/v1/refill-usages', method: Tw.API_METHOD.GET },
  BFF_06_0003: { path: '/core-recharge/v1/refill-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0004: { path: '/core-gift/v1/regular-data-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0005: { path: '/core-gift/v1/regular-data-gifts', method: Tw.API_METHOD.DELETE },
  BFF_06_0006: { path: '/core-gift/v1/regular-data-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0007: { path: '/core-recharge/v1/refill-coupons', method: Tw.API_METHOD.PUT },
  BFF_06_0008: { path: '/core-recharge/v1/refill-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0009: { path: '/core-recharge/v1/refill-options', method: Tw.API_METHOD.GET },
  BFF_06_0010: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.GET },
  BFF_06_0011: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.DELETE },
  BFF_06_0012: { path: '/core-recharge/v1/data-gift-request-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0013: { path: '/core-recharge/v1/data-gift-requests', method: Tw.API_METHOD.GET },
  BFF_06_0014: { path: '/core-gift/v1/data-gift-balances', method: Tw.API_METHOD.GET },
  BFF_06_0015: { path: '/core-gift/v1/data-gift-senders', method: Tw.API_METHOD.GET },
  BFF_06_0016: { path: '/core-gift/v1/data-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0017: { path: '/core-gift/v1/data-gift-messages', method: Tw.API_METHOD.POST },
  BFF_06_0018: { path: '/core-gift/v1/data-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0019: { path: '/core-gift/v1/data-gift-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0020: { path: '/core-recharge/v1/ting-gift-senders', method: Tw.API_METHOD.GET },
  BFF_06_0021: { path: '/core-recharge/v1/ting-gift-blocks', method: Tw.API_METHOD.POST },
  BFF_06_0022: { path: '/core-recharge/v1/ting-gift-receivers', method: Tw.API_METHOD.GET },
  BFF_06_0023: { path: '/core-recharge/v1/ting-gifts', method: Tw.API_METHOD.POST },
  BFF_06_0024: { path: '/core-recharge/v1/ting-press-benefiters', method: Tw.API_METHOD.POST },
  BFF_06_0025: { path: '/core-recharge/v1/ting-gift-requests', method: Tw.API_METHOD.POST },
  BFF_06_0026: { path: '/core-recharge/v1/ting-gifts', method: Tw.API_METHOD.GET },
  BFF_06_0027: { path: '/core-recharge/v1/ting-gift-blocks', method: Tw.API_METHOD.GET },
  BFF_06_0028: { path: '/core-recharge/v1/ting-subscriptions', method: Tw.API_METHOD.GET },
  BFF_06_0029: { path: '/core-recharge/v1/ting-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0030: { path: '/core-recharge/v1/regular-ting-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0031: { path: '/core-recharge/v1/regular-ting-top-ups', method: Tw.API_METHOD.DELETE },
  BFF_06_0032: { path: '/core-recharge/v1/ting-top-ups', method: Tw.API_METHOD.GET },
  BFF_06_0033: { path: '/core-recharge/v1/ting-permissions', method: Tw.API_METHOD.GET },
  BFF_06_0034: { path: '/core-recharge/v1/data-limitation-subscriptions', method: Tw.API_METHOD.GET },
  BFF_06_0035: { path: '/core-recharge/v1/regular-data-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0036: { path: '/core-recharge/v1/data-top-ups', method: Tw.API_METHOD.POST },
  BFF_06_0037: { path: '/core-recharge/v1/regular-data-top-ups', method: Tw.API_METHOD.DELETE },
  BFF_06_0038: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.DELETE },
  BFF_06_0039: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.POST },
  BFF_06_0040: { path: '/core-recharge/v1/regular-data-limitations', method: Tw.API_METHOD.DELETE },
  BFF_06_0041: { path: '/core-recharge/v1/regular-data-limitations', method: Tw.API_METHOD.POST },
  BFF_06_0042: { path: '/core-recharge/v1/data-top-ups', method: Tw.API_METHOD.GET },
  BFF_06_0043: { path: '/core-recharge/v1/data-limitations', method: Tw.API_METHOD.GET },
  BFF_06_0044: { path: '/core-balance/v1/tfamily-sharings', method: Tw.API_METHOD.GET },
  BFF_06_0045: { path: '/core-recharge/v1/tfamily-shareable-data', method: Tw.API_METHOD.GET },
  BFF_06_0046: { path: '/core-recharge/v1/tfamily-sharings', method: Tw.API_METHOD.POST },
  BFF_06_0048: { path: '/core-recharge/v1/regular-tfamily-sharings', method: Tw.API_METHOD.POST },
  BFF_06_0049: { path: '/core-recharge/v1/regular-tfamily-sharings', method: Tw.API_METHOD.DELETE },
  BFF_06_0050: { path: '/core-recharge/v1/tfamily-sharing-limitations', method: Tw.API_METHOD.POST },
  BFF_06_0051: { path: '/core-recharge/v1/tfamily-sharing-limitations', method: Tw.API_METHOD.DELETE },
  BFF_06_0052: { path: '/core-bill/v1/pps-cards', method: Tw.API_METHOD.POST },
  BFF_06_0053: { path: '/core-bill/v1/pps-credit-cards', method: Tw.API_METHOD.POST },
  BFF_06_0054: { path: '/core-bill/v1/pps-auto', method: Tw.API_METHOD.POST },
  BFF_06_0055: { path: '/core-bill/v1/pps-auto', method: Tw.API_METHOD.GET },
  BFF_06_0057: { path: '/core-bill/v1/pps-auto', method: Tw.API_METHOD.DELETE },
  BFF_06_0058: { path: '/core-bill/v1/pps-data', method: Tw.API_METHOD.POST },
  BFF_06_0059: { path: '/core-bill/v1/pps-data-auto', method: Tw.API_METHOD.POST },
  BFF_06_0060: { path: '/core-bill/v1/pps-data-auto', method: Tw.API_METHOD.GET },
  BFF_06_0061: { path: '/core-bill/v1/pps-data-auto', method: Tw.API_METHOD.DELETE },
  BFF_06_0062: { path: '/core-bill/v1/pps-recharges', method: Tw.API_METHOD.GET },
  BFF_06_0063: { path: '/core-bill/v1/pps-data-recharges', method: Tw.API_METHOD.GET },
  BFF_06_0064: { path: '/core-bill/v1/pps-alram', method: Tw.API_METHOD.POST },
  BFF_06_0065: { path: '/core-bill/v1/credit-cards', method: Tw.API_METHOD.POST },
  BFF_06_0066: { path: '/core-product/v1/gift-refill-products', method: Tw.API_METHOD.GET },

  // PAYMENT
  BFF_07_0004: { path: '/core-bill/v1/cash-receipts-issue-history', method: Tw.API_METHOD.GET },
  BFF_07_0005: { path: '/core-bill/v1/point-autopays-history/cashback', method: Tw.API_METHOD.GET },
  BFF_07_0006: { path: '/core-bill/v1/point-autopays-history/tpoint', method: Tw.API_METHOD.GET },
  BFF_07_0007: { path: '/core-bill/v1/point-autopays-history/tpoint', method: Tw.API_METHOD.GET },
  BFF_07_0017: { path: '/core-bill/v1/bill-pay/tax-reprint', method: Tw.API_METHOD.GET },
  BFF_07_0018: { path: '/core-bill/v1/bill-pay/tax-reprint-email', method: Tw.API_METHOD.GET },
  BFF_07_0019: { path: '/core-bill/v1/bill-pay/tax-reprint-fax', method: Tw.API_METHOD.GET },
  BFF_07_0022: { path: '/core-bill/v1/bill-pay/autopay-banks', method: Tw.API_METHOD.GET },
  BFF_07_0023: { path: '/v1/payment/settle-pay-bank', method: Tw.API_METHOD.POST },
  BFF_07_0024: { path: '/core-bill/v1/bill-pay/cardnum-validation', method: Tw.API_METHOD.GET },
  BFF_07_0025: { path: '/v1/payment/settle-pay-card', method: Tw.API_METHOD.POST },
  BFF_07_0026: { path: '/core-bill/v1/bill-pay/settle-vbs', method: Tw.API_METHOD.GET },
  BFF_07_0027: { path: '/core-bill/v1/bill-pay/settle-vb-sms', method: Tw.API_METHOD.POST },
  BFF_07_0028: { path: '/core-bill/v1/bill-pay/avail-point-search', method: Tw.API_METHOD.GET },
  BFF_07_0029: { path: '/core-bill/v1/bill-pay/pay-ocb-tpoint-proc', method: Tw.API_METHOD.POST },
  BFF_07_0030: { path: '/core-bill/v1/payment/total-payment', method: Tw.API_METHOD.GET },
  BFF_07_0032: { path: '/core-bill/v1/payment/over-payment-refund-account', method: Tw.API_METHOD.POST },
  BFF_07_0035: { path: '/core-bill/v1/payment/realtime-payment', method: Tw.API_METHOD.GET },
  BFF_07_0036: { path: '/core-bill/v1/payment/realtime-payment-detail', method: Tw.API_METHOD.GET },
  BFF_07_0037: { path: '/core-bill/v1/payment/auto-payment', method: Tw.API_METHOD.GET },
  BFF_07_0038: { path: '/core-bill/v1/bill-pay/donation', method: Tw.API_METHOD.GET },
  BFF_07_0039: { path: '/core-bill/v1/payment/auto-integrated-account-payment', method: Tw.API_METHOD.GET },
  BFF_07_0040: { path: '/core-bill/v1/payment/auto-integrated-payment-cancle-request', method: Tw.API_METHOD.POST },
  BFF_07_0041: { path: '/core-bill/v1/ocbcard-info-check-show', method: Tw.API_METHOD.GET },
  BFF_07_0042: { path: '/core-bill/v1/rainbow-point-check-show', method: Tw.API_METHOD.GET },
  BFF_07_0043: { path: '/core-bill/v1/ocbcard-no-info', method: Tw.API_METHOD.GET },
  BFF_07_0045: { path: '/core-bill/v1/ocb-point-onetime-reserve', method: Tw.API_METHOD.POST },
  BFF_07_0047: { path: '/core-bill/v1/ocb-point-onetime-cancel', method: Tw.API_METHOD.POST },
  BFF_07_0048: { path: '/core-bill/v1/rainbow-point-onetime-reserve', method: Tw.API_METHOD.POST },
  BFF_07_0050: { path: '/core-bill/v1/rainbow-point-onetime-cancel', method: Tw.API_METHOD.POST },
  BFF_07_0054: { path: '/core-bill/v1/ocb-point-autopay-modify', method: Tw.API_METHOD.POST },
  BFF_07_0056: { path: '/core-bill/v1/rainbow-point-autopay-change', method: Tw.API_METHOD.POST },
  BFF_07_0058: { path: '/core-bill/v1/ocb-point-onetime-history', method: Tw.API_METHOD.GET },
  BFF_07_0059: { path: '/core-bill/v1/rainbow-point-onetime-history', method: Tw.API_METHOD.GET },
  BFF_07_0060: { path: '/core-bill/v1/auto-payments', method: Tw.API_METHOD.GET },
  BFF_07_0061: { path: '/v1/auto-payments', method: Tw.API_METHOD.POST },
  BFF_07_0062: { path: '/v1/auto-payments', method: Tw.API_METHOD.PUT },
  BFF_07_0063: { path: '/core-bill/v1/auto-payments', method: Tw.API_METHOD.DELETE },
  BFF_07_0064: { path: '/core-bill/v1/autopay/db-req', method: Tw.API_METHOD.POST },
  BFF_07_0065: { path: '/core-bill/v1/autopay/pay-cycl-chg', method: Tw.API_METHOD.PUT },
  BFF_07_0068: { path: '/core-bill/v1/autopay/card-info/:args0', method: Tw.API_METHOD.GET },
  BFF_07_0069: { path: '/core-bill/v1/payment/auto-integrated-payment/cancel', method: Tw.API_METHOD.POST },
  BFF_07_0071: { path: '/core-bill/v1/microPrepay/microPrepay-hist-requests', method: Tw.API_METHOD.GET },
  BFF_07_0073: { path: '/core-bill/v1/microPrepay/microPrepay-requests', method: Tw.API_METHOD.GET },
  BFF_07_0074: { path: '/core-bill/v1/microPrepay/microPrepay-process', method: Tw.API_METHOD.POST },
  BFF_07_0076: { path: '/core-bill/v1/microPrepay/microPrepay-auto-req', method: Tw.API_METHOD.POST },
  BFF_07_0077: { path: '/core-bill/v1/microPrepay/microPrepay-auto-delete', method: Tw.API_METHOD.POST },
  BFF_07_0078: { path: '/core-bill/v1/useContentsPrepay/useContentsPrepay-hist-requests', method: Tw.API_METHOD.GET },
  BFF_07_0079: { path: '/core-bill/v1/useContentsPrepay/useContents-autoPrepay-hist', method: Tw.API_METHOD.GET },
  BFF_07_0081: { path: '/core-bill/v1/useContentsPrepay/useContentsPrepay-requests', method: Tw.API_METHOD.GET },
  BFF_07_0082: { path: '/core-bill/v1/useContentsPrepay/useContentsPrepay-process', method: Tw.API_METHOD.POST },
  BFF_07_0083: { path: '/core-bill/v1/useContentsPrepay/useContents-autoPrepay-process', method: Tw.API_METHOD.POST },
  BFF_07_0084: { path: '/core-bill/v1/useContentsPrepay/useContents-autoPrepay-delete', method: Tw.API_METHOD.POST },
  BFF_07_0087: { path: '/core-bill/v1/ocb-point-pay', method: Tw.API_METHOD.POST },

  //CUSTOMER
  BFF_08_0001: { path: '/core-modification/v1/counsel-time-check', method: Tw.API_METHOD.GET },
  BFF_08_0002: { path: '/core-modification/v1/counsel-reserve', method: Tw.API_METHOD.POST },
  BFF_08_0003: { path: '/core-modification/v1/counsel-histories', method: Tw.API_METHOD.GET },
  BFF_08_0004: { path: '/core-modification/v1/region-store-list', method: Tw.API_METHOD.GET },
  BFF_08_0005: { path: '/core-modification/v1/region-addr-list', method: Tw.API_METHOD.GET },
  BFF_08_0006: { path: '/core-modification/v1/region-subway-list', method: Tw.API_METHOD.GET },
  BFF_08_0008: { path: '/core-modification/v1/region-close-store-list', method: Tw.API_METHOD.GET },
  BFF_08_0009: { path: '/core-modification/v1/voice-certification-check', method: Tw.API_METHOD.GET },
  BFF_08_0010: { path: '/core-modification/v1/email-inquiry-categories', method: Tw.API_METHOD.GET },
  BFF_08_0012: { path: '/core-modification/v1/email-inquiry/append-inquiry', method: Tw.API_METHOD.POST },
  BFF_08_0013: { path: '/core-modification/v1/email-inquiry', method: Tw.API_METHOD.POST },
  BFF_08_0014: { path: '/v1/cs/file-upload', method: Tw.API_METHOD.POST },
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
  BFF_08_0050: { path: '/core-modification/v1/ifaq/iFaqList', method: Tw.API_METHOD.GET },
  BFF_08_0051: { path: '/core-modification/v1/ifaq/iFaq-category-List', method: Tw.API_METHOD.GET },
  BFF_08_0052: { path: '/core-modification/v1/ifaq/iFaqList-Cate', method: Tw.API_METHOD.GET },
  BFF_08_0054: { path: '/core-modification/v1/require-document/reqDocument', method: Tw.API_METHOD.GET },
  BFF_08_0056: { path: '/core-modification/v1/guide/use-detail', method: Tw.API_METHOD.GET },
  BFF_08_0057: { path: '/core-modification/v1/guide/site-use', method: Tw.API_METHOD.GET },
  BFF_08_0058: { path: '/core-modification/v1/praise/savePraiseInfo', method: Tw.API_METHOD.POST },

  BFF_08_0060: { path: '/core-modification/v1/email-inquiry-list', method: Tw.API_METHOD.GET },
  BFF_08_0061: { path: '/core-modification/v1/email-inquiry-detail', method: Tw.API_METHOD.GET },
  BFF_08_0062: { path: '/core-modification/v1/email-inquiry', method: Tw.API_METHOD.DELETE },

  // EVENT
  BFF_09_0001: { path: '/core-membership/v1/event/ing-list', method: Tw.API_METHOD.GET },
  BFF_09_0002: { path: '/core-membership/v1/event/detail/:args0', method: Tw.API_METHOD.GET },
  BFF_09_0003: { path: '/core-membership/v1/event/old-list', method: Tw.API_METHOD.GET },
  BFF_09_0004: { path: '/core-membership/v1/event/win-list', method: Tw.API_METHOD.GET },
  BFF_09_0005: { path: '/core-membership/v1/event/win-detail/:args0', method: Tw.API_METHOD.GET },

  // PRODUCT
  BFF_10_0007: { path: '/core-product/v1/mobiles/fee-plans/:args0/joins/prechecks', method: Tw.API_METHOD.GET },
  BFF_10_0010: { path: '/core-product/v1/mobiles/fee-plans/joins/over-chargings', method: Tw.API_METHOD.GET },
  BFF_10_0012: { path: '/v1/products/fee-plans/:args0/joins', method: Tw.API_METHOD.PUT },
  BFF_10_0013: { path: '/core-product/v1/mobiles/fee-plans/:args0/tplan-sets', method: Tw.API_METHOD.GET },
  BFF_10_0014: { path: '/core-product/v1/mobiles/fee-plans/:args0/tplan-sets', method: Tw.API_METHOD.PUT },
  BFF_10_0015: { path: '/core-product/v1/mobiles/fee-plans/:args0/tplan-benefits', method: Tw.API_METHOD.GET },
  BFF_10_0018: { path: '/core-product/v1/mobiles/additions-set/:args0/joins', method: Tw.API_METHOD.POST },
  BFF_10_0019: { path: '/core-product/v1/mobiles/additions-sets/:args0/sets/lines', method: Tw.API_METHOD.DELETE },
  BFF_10_0020: { path: '/core-product/v1/mobiles/additions-sets/:args0/sets/lines', method: Tw.API_METHOD.POST },
  BFF_10_0021: { path: '/core-product/v1/mobiles/additions-sets/:args0/sets', method: Tw.API_METHOD.GET },
  BFF_10_0022: { path: '/core-product/v1/mobiles/additions-sets/:args0', method: Tw.API_METHOD.DELETE },
  BFF_10_0031: { path: '/core-product/v1/submain/products', method: Tw.API_METHOD.GET },
  BFF_10_0032: { path: '/core-product/v1/submain/filters', method: Tw.API_METHOD.GET },
  BFF_10_0034: { path: '/core-product/v1/mobiles/fee-plans/young-plan-sets', method: Tw.API_METHOD.GET },
  BFF_10_0035: { path: '/core-product/v1/mobiles/additions/:args0/joins', method: Tw.API_METHOD.POST },
  BFF_10_0036: { path: '/core-product/v1/mobiles/additions/:args0', method: Tw.API_METHOD.DELETE },
  BFF_10_0037: { path: '/core-product/v1/mobiles/fee-plans/t-tab-sets', method: Tw.API_METHOD.GET },
  BFF_10_0038: { path: '/core-product/v1/mobiles/additions/:args0/vas-terms', method: Tw.API_METHOD.GET },
  BFF_10_0039: { path: '/core-product/v1/combinations/discount-simulation', method: Tw.API_METHOD.GET },
  BFF_10_0041: { path: '/core-product/v1/mobiles/fee-plans/ting-sets', method: Tw.API_METHOD.PUT },
  BFF_10_0043: { path: '/core-product/v1/mobiles/fee-plans/zone-sets', method: Tw.API_METHOD.GET },
  BFF_10_0044: { path: '/core-product/v1/mobiles/fee-plans/zones', method: Tw.API_METHOD.GET },
  BFF_10_0045: { path: '/core-product/v1/mobiles/fee-plans/zone-sets', method: Tw.API_METHOD.PUT },
  BFF_10_0046: { path: '/v1/products/fee-plans/:args0/option-sets', method: Tw.API_METHOD.POST },
  BFF_10_0048: { path: '/core-modification/v1/wireJoin/listUseAddressService', method: Tw.API_METHOD.POST },
  BFF_10_0054: { path: '/core-product/v1/submain/benefit-discount-products', method: Tw.API_METHOD.GET },
  BFF_10_0071: { path: '/core-product/v1/mobiles/fee-plans/num-couple-sets', method: Tw.API_METHOD.PUT },
  BFF_10_0073: { path: '/core-product/v1/mobiles/fee-plans/snum-sets', method: Tw.API_METHOD.GET },
  BFF_10_0074: { path: '/core-product/v1/mobiles/fee-plans/snum-sets', method: Tw.API_METHOD.PUT },
  BFF_10_0076: { path: '/core-product/v1/wire/joins/counsel', method: Tw.API_METHOD.POST },
  BFF_10_0093: { path: '/core-product/v1/submain/tapps', method: Tw.API_METHOD.GET },
  BFF_10_9001: { path: '/v1/products/:args0/auth/:args1', method: Tw.API_METHOD.GET },

  // MEMBERSHIP
  BFF_11_0001: { path: '/core-membership/v1/card/home', method: Tw.API_METHOD.GET },
  BFF_11_0002: { path: '/core-membership/v1/card/info', method: Tw.API_METHOD.GET },
  BFF_11_0003: { path: '/core-membership/v1/card-reissue-info', method: Tw.API_METHOD.GET },
  BFF_11_0004: { path: '/core-membership/v1/card-reissue-process', method: Tw.API_METHOD.PUT },
  BFF_11_0005: { path: '/core-membership/v1/card-reissue-cancel-process', method: Tw.API_METHOD.PUT },
  BFF_11_0006: { path: '/core-membership/v1/card/change', method: Tw.API_METHOD.PUT },
  BFF_11_0007: { path: '/core-membership/v1/card/check', method: Tw.API_METHOD.GET },
  BFF_11_0009: { path: '/core-membership/v1/card/used-list', method: Tw.API_METHOD.GET },
  BFF_11_0010: { path: '/core-membership/v1/card/used-list', method: Tw.API_METHOD.GET },
  BFF_11_0011: { path: '/core-membership/v1/card/create', method: Tw.API_METHOD.POST },
  BFF_11_0012: { path: '/core-membership/v1/card/modify', method: Tw.API_METHOD.PUT },
  BFF_11_0013: { path: '/core-membership/v1/card/cancel-info', method: Tw.API_METHOD.GET },
  BFF_11_0014: { path: '/core-membership/v1/card/cancel', method: Tw.API_METHOD.PUT },
  BFF_11_0015: { path: '/core-membership/v1/card/create-check', method: Tw.API_METHOD.GET },
  BFF_11_0021: { path: '/core-membership/v1/tmembership/area1-list', method: Tw.API_METHOD.GET },
  BFF_11_0022: { path: '/core-membership/v1/tmembership/area2-list', method: Tw.API_METHOD.GET },
  BFF_11_0023: { path: '/core-membership/v1/tmembership/mrcht-list', method: Tw.API_METHOD.GET },
  BFF_11_0024: { path: '/core-membership/v1/tmembership/mrcht-info', method: Tw.API_METHOD.GET },
  BFF_10_0062: { path: '/core-product/v1/mobiles/additions-sets/:args0/seldis-sets', method: Tw.API_METHOD.GET },
  BFF_10_0063: { path: '/core-product/v1/mobiles/additions-sets/:args0/seldis-sets', method: Tw.API_METHOD.POST },

  // TEST
  GET: { path: '/posts', method: Tw.API_METHOD.GET },
  GET_PARAM: { path: '/comments', method: Tw.API_METHOD.GET },
  GET_PATH_PARAM: { path: '/posts/:args0', method: Tw.API_METHOD.GET },
  POST: { path: '/posts', method: Tw.API_METHOD.POST },
  POST_PARAM: { path: '/posts', method: Tw.API_METHOD.POST },
  PUT: { path: '/posts/1', method: Tw.API_METHOD.PUT },
  PUT_PARAM: { path: '/posts/1', method: Tw.API_METHOD.PUT },
  DELETE: { path: '/posts/1', method: Tw.API_METHOD.DELETE },
  DELETE_PARAM: {}
};

Tw.NODE_CMD = {
  GET_ENVIRONMENT: { path: '/environment', method: Tw.API_METHOD.GET },
  GET_DOMAIN: { path: '/domain', method: Tw.API_METHOD.GET },
  SET_DEVICE: { path: '/device', method: Tw.API_METHOD.POST },
  LOGIN_TID: { path: '/user/sessions', method: Tw.API_METHOD.POST },
  LOGOUT_TID: { path: '/logout-tid', method: Tw.API_METHOD.POST },
  EASY_LOGIN_AOS: { path: '/user/login/android', method: Tw.API_METHOD.POST },
  EASY_LOGIN_IOS: { path: '/user/login/ios', method: Tw.API_METHOD.POST },
  CHANGE_SESSION: { path: '/common/selected-sessions', method: Tw.API_METHOD.PUT },
  LOGIN_SVC_PASSWORD: { path: '/user/service-password-sessions', method: Tw.API_METHOD.POST },
  LOGIN_USER_LOCK: { path: '/user/locks', method: Tw.API_METHOD.DELETE },
  CHANGE_SVC_PASSWORD: { path: '/core-auth/v1/service-passwords', method: Tw.API_METHOD.PUT },
  CHANGE_LINE: { path: '/user/services', method: Tw.API_METHOD.PUT },
  UPDATE_SVC: { path: '/common/selected-sessions', method: Tw.API_METHOD.GET },

  UPLOAD_FILE: { path: '/uploads', method: Tw.API_METHOD.POST },
  SET_CERT: { path: '/cert', method: Tw.API_METHOD.POST },
  GET_SERVER_SERSSION: { path: '/serverSession', method: Tw.API_METHOD.GET },
  GET_SVC_INFO: { path: '/svcInfo', method: Tw.API_METHOD.GET },
  GET_ALL_SVC: { path: '/allSvcInfo', method: Tw.API_METHOD.GET },
  GET_CHILD_INFO: { path: '/childInfo', method: Tw.API_METHOD.GET },
  GET_VERSION: { path: '/version', method: Tw.API_METHOD.GET },
  GET_SPLASH: { path: '/splash', method: Tw.API_METHOD.GET },
  GET_SERVICE_NOTICE: { path: '/service-notice', method: Tw.API_METHOD.GET },

  GET_URL_META: { path: '/urlMeta', method: Tw.API_METHOD.GET }
};

Tw.TMAP = {
  URL: 'https://api2.sktelecom.com/tmap',
  PIN: '/img/ico/ico-tmap-pin.png',
  COMPASS: '/img/ico/ico-tmap-compass.png',
  APP_KEY: 'ecfeceac-3660-4618-bc3b-37a11f952441'
};

Tw.AJAX_CMD = {
  GET_TMAP_REGION: { path: '/geofencing/regions', method: Tw.API_METHOD.GET, url: Tw.TMAP.URL },
  GET_TMAP_AREASCODE: { path: '/poi/areascode', method: Tw.API_METHOD.GET, url: Tw.TMAP.URL },
  GET_TMAP_ADDR_GEO: { path: '/geo/fullAddrGeo', method: Tw.API_METHOD.GET, url: Tw.TMAP.URL },
  GET_TMAP_POI: { path: '/pois', method: Tw.API_METHOD.GET, url: Tw.TMAP.URL },
  OPEN_NICE_AUTH: {
    path: '',
    method: Tw.API_METHOD.POST,
    url: Tw.NICE_URL,
    contentType: 'application/x-www-form-urlencoded'
  },
  OPEN_IPIN_AUTH: {
    path: '',
    method: Tw.API_METHOD.POST,
    url: Tw.IPIN_URL,
    contentType: 'application/x-www-form-urlencoded'
  }
};

Tw.API_CODE = {
  CODE_00: '00',    // success
  CODE_01: 'RDT0001',    // 화면 차단
  CODE_02: 'RDT0002',    // API 차단
  CODE_03: 'RDT0003',    // 2차 인증
  CODE_04: 'RDT0004',    // 로그인 필요
  CODE_05: 'RDT0005',    // 접근 불가 (권한)

  CERT_SUCCESS: 'TWM0001',
  CERT_FAIL: 'TWM0002',

  CODE_99: 'RDT0099',    // Circuit Open
  CODE_200: '200',
  CODE_400: '400',

  NOT_FAMILY: 'ZORDE4011' // 쿠폰 선물 가능한 가족그룹 아님
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

Tw.API_ADD_SVC_ERROR = {
  // 부가서비스(소액결제, 콘텐츠이용)
  BIL0030: 'BIL0030', // 휴대폰 결제 이용동의 후 사용 가능한 메뉴입니다
  BIL0031: 'BIL0031', // 미성년자는 이용할 수 없습니다
  BIL0033: 'BIL0033', // 휴대폰 결제 차단 고객은 사용이 제한된 메뉴입니다
  BIL0034: 'BIL0034' // 소액결제 부가서비스 미가입자는 이용할 수 없습니다
};

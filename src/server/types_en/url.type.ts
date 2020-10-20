export const URL = {
  // Main
  '/en/main/home': { login: false, id: 'ST_01_01', title: 'home' },
  '/en/main/menu/settings': { login: false, id: 'ST_01_01', title: 'Settings' },
  '/en/main/menu/settings/terms': { login: false, id: 'GU_02', title: 'TERMS AND CONDITIONS' },
  '/en/main/menu/settings/terms/t-world-terms': { login: false, id: 'GU_02', title: 'T world Terms and Conditions' },

  // MyT
  '/en/myt-fare/submain': { login: true, id: 'MF1', title: 'MY BILLS' },
  '/en/myt-fare/billguide/guide': { login: true, id: 'MF_02_01', title: 'BILLS' },
  '/en/myt-fare/bill/hotbill': { login: true, id: 'MF_03', title: 'REAL-TIME MONTHLY FEES' },


  '/en/myt-join/submain': { login: true, id: 'MS_05', title: 'MY INFORMATION' },
  '/en/myt-join/custpassword': { login: true, id: 'MS_01_01_01', title: 'PRIVACY PROTECTION PASSCODE SERVICE' },

  // MyT-data
  '/en/myt-data/hotdata': { login: true, id: 'DC_01_01', title: 'MY DATA / TALK / TEXT' },
  
  // Product
  '/en/product/mobileplan': { login: false, id: 'MP', title: 'PLANS' },
  '/en/product/callplan': { login: false, id: 'MV', title: 'PLANS DETAIL' },
  '/en/product/callplan/miri': { login: false, id: 'MP_02', title: 'Miri DETAIL' },


  // Customer
  '/en/customer/agentsearch/videoguide': { login: false, id: 'CS_02_01', title: 'VIDEO GUIDE' },
  '/en/customer/agentsearch': { login: false, id: 'CS_02_01', title: 'STORE INFORMATION' },
  '/en/customer/agentsearch/seoul': { login: false, id: 'CS_02_02', title: 'STORE INFORMATION' },
  '/en/customer/agentsearch/busan': { login: false, id: 'CS_02_01', title: 'STORE INFORMATION' },
  '/en/customer/agentsearch/gwangju': { login: false, id: 'CS_02_01', title: 'STORE INFORMATION' },
  '/en/customer/agentsearch/gyeonggido': { login: false, id: 'CS_02_01', title: 'STORE INFORMATION' },
  '/en/customer/agentsearch/gyeongsangnamdo': { login: false, id: 'CS_02_01', title: 'STORE INFORMATION' },
  '/en/customer/agentsearch/ulsan': { login: true, id: 'CS_02_03', title: 'STORE INFORMATION' },
  '/en/customer/document': { login: false, id: 'CS_09_01', title: 'REQUIRED DOCUMENTS' },
  '/en/customer/faq': { login: false, id: 'CS_05_01', title: 'FAQ' },
   
  // Common
  '/en/common/member/tid-pwd': { login: false, id: 'CO_ME_01_04', title: '아이디 찾기/비밀번호 재설정' }
  
};

/**
 * target parameter가 포함되는 URL(target 값이 내부 URL인 경우)
 */
export const TARGET_PARAM_VALIDATION_CHECK_URL = [
  '/en/common/member/login/route',
  '/en/common/member/logout/route',
  '/en/common/member/login/cust-pwd',
  '/en/common/member/login/reactive',
  '/en/common/member/login/lost',
  '/en/common/tid/login',
  '/en/common/tid/change-pw',
  '/en/common/tid/find-id',
  '/en/common/tid/route'
];
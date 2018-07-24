export const URL = {
  // home
  '/home': { login: false, id: '' },
  // myt
  '/myt': { login: true, id: '' },
  '/myt/usage/change': { login: true, id: '' },
  '/myt/usage/children': { login: true, id: '' },
  '/myt/usage/datalimit': { login: true, id: '' },
  '/myt/usage/datashare': { login: true, id: '' },
  '/myt/usage/tdatashare': { login: true, id: '' },
  '/myt/usage/tdatashare/info': { login: true, id: '' },
  '/myt/usage/tdatashare/close': { login: true, id: '' },
  '/myt/usage/troaming': { login: true, id: '' },
  '/myt/usage/ting': { login: true, id: '' },
  '/usage/24hourdiscount': { login: true, id: '' },
  '/myt/bill/hotbill': { login: true, id: '' },
  '/myt/bill/guidechange/reissue': { login: true, id: '' },
  '/myt/bill/guidechange/reissue/complete': { login: true, id: '' },
  '/myt/bill/billguide/returnhistory': { login: true, id: '' },
  '/myt/bill/billguide': { login: true, id: '' },
  '/myt/bill/hotbill/child': { login: true, id: '' },
  '/myt/bill/guidechange': { login: true, id: '' },
  '/myt/bill/guidechange/change': { login: true, id: '' },
  '/myt/bill/guidechange/change-complete': { login: true, id: '' },
  '/myt/bill/guidechange/update': { login: true, id: '' },
  '/myt/bill/guidechange/update-complete': { login: true, id: '' },
  // recharge
  '/recharge/refill': { login: true, id: 'DA_01_01_01' }, // 리필하기
  '/recharge/refill/history': { login: true, id: '' },
  '/recharge/refill/select': { login: true, id: 'DA_01_01_03_01' }, // 리필하기 > 데이터/음성 선택
  '/recharge/refill/complete': { login: true, id: 'DA_01_01_03_02' }, // 리필완료
  '/recharge/refill/error': { login: true, id: 'DA_01_01_03_02' }, // 리필 실패
  '/recharge/refill/gift': { login: true, id: '' },
  '/recharge/refill/gift-complete': { login: true, id: '' },
  '/recharge/refill/gift-products': { login: true, id: '' },
  '/recharge/gift': { login: true, id: '' },
  '/recharge/gift/process/family': { login: true, id: '' },
  '/recharge/gift/process/members': { login: true, id: '' },
  '/recharge/gift/process/request': { login: true, id: '' },
  '/recharge/gift/history': { login: true, id: '' },
  '/recharge/cookiz': { login: true, id: '' },
  '/recharge/cookiz/history': { login: true, id: '' },
  '/recharge/limit': { login: true, id: 'DA_05_01' },
  '/recharge/limit/history': { login: true, id: 'DA_05_04_01' },
  '/recharge/ting': { login: true, id: '' },
  '/recharge/ting/history': { login: true, id: '' },
  // payment
  '/payment/realtime': { login: true, id: 'PA_02_01' }, // 즉시납부
  '/payment/auto': { login: true, id: 'PA_03_01' }, // 자동납부 신청 및 변경
  '/payment/point': { login: true, id: 'PA_05_01' }, // 포인트 요금납부
  '/payment/history': { login: true, id: '' },
  '/payment/history/realtime': { login: true, id: '' },
  '/payment/history/auto': { login: true, id: '' },
  '/payment/history/auto/unitedwithdrawal': { login: true, id: '' },
  '/payment/history/point/reserve': { login: true, id: '' },
  '/payment/history/point/auto': { login: true, id: '' },
  '/payment/history/receipt/tax': { login: true, id: '' },
  '/payment/history/receipt/cash': { login: true, id: '' },
  '/payment/history/excesspay': { login: true, id: '' },
  '/payment/history/excesspay/account': { login: true, id: '' },
  '/payment/prepay/micro': { login: true, id: 'PA_08_01_01' }, // 소액결제 선결제/자동선결제
  '/payment/prepay/contents': { login: true, id: 'PA_07_01_01' }, // 콘텐츠이용료 선결제/자동선결제
  '/payment/prepay/micro/history': { login: true, id: 'PA_08_04' }, // 소액결제 선결제 내역
  '/payment/prepay/contents/history': { login: true, id: 'PA_07_04' }, // 콘텐츠이용료 선결제 내역
  '/payment/prepay/micro/auto/history': { login: true, id: 'PA_08_05' }, // 소액결제 자동선결제 내역
  '/payment/prepay/contents/auto/history': { login: true, id: 'PA_07_05' }, // 콘텐츠이용료 자동선결제 내역
  // management
  // membership
  // product
  // direct
  // customer
  '/customer/notice': { login: false },
  '/customer/prevent-damage': { login: false },
  '/customer/prevent-damage/guide': { login: false },
  '/customer/prevent-damage/our-activity': { login: false },
  '/customer/prevent-damage/useful-service': { login: false },
  '/customer/prevent-damage/relate-site': { login: false },
  // auth
  '/auth/line': { login: true, id: 'CO_01_05_02' }, // 회선관리
  '/auth/line/edit': { login: true, id: 'CO_01_05_02_01' }, // 회선편집
  '/auth/line/register/corporation': { login: true, id: 'CO_01_05_02_03' }, // 법인회선등록
  '/auth/line/register/empty': { login: true, id: 'CO_01_05_02_02' }, // 가입된 회선 없음
  '/auth/login/exceed-fail': { login: false, id: 'CO_01_02_01_02' },  // 로그인 횟수 초과
  '/auth/login/fail': { login: false, id: 'CO_01_02_01_01' },  // 로그인 실패
  '/auth/login/dormancy': { login: false, id: 'CO_01_02_02' },
  '/auth/login/find-id-pwd': { login: false, id: 'CO_01_04' },
  '/auth/login/service-pwd': { login: true, id: 'CO_01_02_03_01' },
  '/auth/login/service-pwd-fail': { login: true, id: 'CO_01_02_03_01_01' },
  '/auth/login/route': { login: false, id: '' },
  '/auth/logout/complete': { login: true, id: 'CO_01_03_01' },  // 로그아웃 성공
  '/auth/logout/expire': { login: true, id: 'CO_01_03_02' },  // 세션 만료
  '/auth/logout/route': { login: true, id: '' },
  '/auth/member/management': { login: true, id: 'CO_01_05' }, // 회원 정보 관리
  '/auth/signup/guide': { login: false, id: 'CO_01_01' },
  '/auth/tid/login': { login: false, id: '' },
  '/auth/tid/account': { login: true, id: '' },
  '/auth/tid/change/pw': { login: true, id: '' },
  '/auth/tid/find/id': { login: false, id: '' },
  '/auth/tid/find/pw': { login: false, id: '' },
  '/auth/tid/logout': { login: true, id: '' },
  '/auth/tid/signup-local': { login: false, id: '' },
  '/auth/tid/signup-foreigner': { login: false, id: '' },
  '/auth/tid/guide': { login: false, id: '' },
  '/auth/tid/route': { login: false, id: '' },
  '/auth/withdrawal/guide': { login: true, id: 'CO_01_05_01_01' },
  '/auth/withdrawal/survey': { login: true, id: 'CO_01_05_01_03' },
  '/auth/withdrawal/complete': { login: false, id: 'CO_01_05_01_04_01' }
};

export const URL = {
  // home
  '/home': { login: false, id: '', title: 'home' },
  // myt
  '/myt': { login: true, id: '', title: '' },
  '/myt/usage/change': { login: true, id: '', title: '' },
  '/myt/usage/children': { login: true, id: 'MY_02_02_01_04_06', title: '자녀 사용량 조회' },
  '/myt/usage/datalimit': { login: true, id: 'MY_02_02_01_04_08', title: '데이터 한도요금제 사용량 조회' },
  '/myt/usage/datashare': { login: true, id: 'MY_02_02_01_04_07', title: '데이터 함께쓰기 사용량 조회' },
  '/myt/usage/tdatashare': { login: true, id: 'MY_02_02_01_04_02', title: 'T데이터셰어링 사용량 조회' },
  '/myt/usage/tdatashare/info': { login: true, id: 'MY_02_02_01_04_01', title: 'T데이터셰어링 미가입 안내' },
  '/myt/usage/tdatashare/close': { login: true, id: 'MY_02_02_01_04_03', title: 'T데이터셰어링 USIM 해지' },
  '/myt/usage/troaming': { login: true, id: 'MY_02_02_01_04_05', title: 'T로밍 함께쓰기 사용량 조회' },
  '/myt/usage/24hourdiscount': { login: true, id: 'MY_02_02_01_04_10', title: '24시간 데이터 50% 할인' },
  '/myt/usage/band-data-sharings': { login: true, id: 'MY_02_02_01_04_11', title: '내폰끼리 결합 사용량 조회' },
  '/myt/usage/ting': { login: true, id: 'MY_02_02_01_04_09', title: '팅요금상품 사용량 조회' },
  '/myt/usage/pattern': { login: true, id: 'MY_02_02_02_03_01', title: '최근 사용패턴' },
  '/myt/usage/pattern/detail': { login: true, id: 'MY_02_02_02_01_03', title: '최근 사용패턴' },
  '/myt/bill/hotbill': { login: true, id: 'MY_03_01_01', title: '' }, // 실시간 사용요금
  '/myt/bill/guidechange/reissue': { login: true, id: '', title: '요금안내서 재발행' },
  '/myt/bill/guidechange/reissue/complete': { login: true, id: '', title: '요금안내서 재발행' },
  '/myt/bill/billguide/returnhistory': { login: true, id: '', title: '요금안내서 반송내역' },
  '/myt/bill/billguide': { login: true, id: '', title: '' },
  '/myt/bill/billguide/subDetailSpecification': { login: true, id: '', title: '' },
  '/myt/bill/billguide/subSelPayment': { login: true, id: '', title: '' },
  '/myt/bill/billguide/subSusRelease': { login: true, id: '', title: '' },
  '/myt/bill/billguide/subChildBill': { login: true, id: '', title: '' },
  '/myt/bill/billguide/subCallBill': { login: true, id: '', title: '' },
  '/myt/bill/billguide/subRoamingBill': { login: true, id: '', title: '' },
  '/myt/bill/billguide/subDonationBill': { login: true, id: '', title: '' },
  '/myt/bill/hotbill/child': { login: true, id: 'MY_03_01_01_01' }, // 실시간 사용요금 자녀회선
  '/myt/bill/guidechange': { login: true, id: '', title: '' },
  '/myt/bill/guidechange/change': { login: true, id: '', title: '' },
  '/myt/bill/guidechange/change-complete': { login: true, id: '', title: '' },
  '/myt/bill/guidechange/update': { login: true, id: '', title: '' },
  '/myt/bill/guidechange/update-complete': { login: true, id: '', title: '' },
  '/myt/bill/history/micro': { login: true, id: 'MY_02_03_04_01', title: '소액결제 이용내역' }, // 나의 요금 > 소액결제 이용내역
  '/myt/bill/history/micro/detail': { login: true, id: 'MY_02_03_04_01_04', title: '소액결제 이용내역 상세' }, // 나의 요금 > 소액결제 이용내역 상세
  '/myt/bill/history/micro/password': { login: true, id: 'MY_02_03_04_01_05', title: '소액결제 비밀번호 설정/변경' }, // 나의 요금 > 소액결제 이용내역 > 소액결제 비밀번호 번경
  '/myt/bill/history/micro/limit': { login: true, id: 'MY_02_03_04_01_06', title: '소액결제 한도 확인' }, // 나의 요금 > 소액결제 이용내역 > 소액결제 한도 확인
  '/myt/bill/history/micro/limit/change': { login: true, id: 'MY_02_03_04_01_01', title: '소액결제 한도 변경' }, // 나의 요금 > 소액결제 이용내역 > 소액결제 한도 변경
  '/myt/bill/history/contents': { login: true, id: 'My_02_03_05_01', title: '콘텐츠 이용료 이용내역' },  // 나의 요금 > 콘텐츠 이용료 이용내역
  '/myt/bill/history/contents/limit': { login: true, id: 'My_02_03_05_01_02', title: '콘텐츠 이용 한도 확인' },  // 나의 요금 > 콘텐츠 이용료 이용내역 > 콘텐츠 이용 한도 확인
  '/myt/bill/history/contents/limit/change': { login: true, id: 'My_02_03_05_01_01', title: '콘텐츠 이용 한도 변경' },  // 나의 요금 > 콘텐츠 이용료 이용내역 > 콘텐츠 이용 한도 변경
  '/myt/bill/history/contents/detail': { login: true, id: 'MY_02_03_05_01_03', title: '콘텐츠 이용료 이용내역 상세' },  // 나의 요금 > 콘텐츠 이용료 이용내역 상세
  '/myt/join/protect/change': { login: true, id: 'MY_01_02_08', title: '고객보호 비밀번호 설정' },
  '/myt/join/join-info': { login: true, id: 'MY_01_02', title: '' }, // 가입정보
  '/myt/join/join-info/no-contract': { login: true, id: 'MY_01_02_10', title: '' }, // 무약정 플랜 포인트 내역
  '/myt/join/join-info/sms': { login: true, id: 'MY_01_02_02_L01', title: '망 작업 안내 SMS 알림 신청' }, // 망 작업 안내 SMS 알림 신청
  '/myt/join/pay-claim/phone': { login: true, id: 'MY_01_05', title: '납부/청구정보' },
  '/myt/join/pay-claim/iptv': { login: true, id: 'MY_01_05_01', title: '납부/청구정보' },
  '/myt/join/pay-claim/iptvSk': { login: true, id: 'MY_01_05_02', title: '납부/청구정보' },
  '/myt/join/pay-claim/tlogin': { login: true, id: 'MY_01_05_03', title: '납부/청구정보' },
  '/myt/join/pay-claim/twibro': { login: true, id: 'MY_01_05_04', title: '납부/청구정보' },
  '/myt/join/pay-claim/tpocketfi': { login: true, id: 'MY_01_05_05', title: '납부/청구정보' },
  '/myt/join/pay-claim/pointcam': { login: true, id: 'MY_01_05_06', title: '납부/청구정보' },
  '/myt/join/contract-terminal/phone': { login: true, id: 'MY_01_04', title: '약정 할인 및 단말 분할상환 정보' },
  '/myt/join/contract-terminal/phone/detail': { login: true, id: 'MY_01_04_L01', title: '월별 상세 할인내역' },
  '/myt/join/contract-terminal/tpocketfi': { login: true, id: 'MY_01_04_03', title: '약정 할인 및 단말 분할상환 정보' },
  '/myt/join/contract-terminal/tpocketfi/detail': { login: true, id: 'MY_01_04_L01', title: '월별 상세 할인내역' },
  '/myt/join/contract-terminal/twibro': { login: true, id: 'MY_01_04_01', title: '약정 할인 및 단말 분할상환 정보' },
  '/myt/join/contract-terminal/tlogin': { login: true, id: 'MY_01_04_02', title: '약정 할인 및 단말 분할상환 정보' },
  '/myt/join/contract-terminal/tlogin/detail': { login: true, id: 'MY_01_04_L01', title: '월별 상세 할인내역' },
  '/myt/join/product-service#fee-plan': { login: true, id: 'MY_01_01', title: '나의 가입서비스/요금제'},
  '/myt/join/product-service#additions': { login: true, id: 'MY_01_01_51', title: '나의 가입서비스/부가서비스'},
  '/myt/join/product-service#combinations': { login: true, id: 'MY_01_01_100', title: '나의 가입서비스/결합상품'},

  // recharge
  '/recharge/refill': { login: true, id: 'DA_01_01_01', title: '리필하기' }, // 리필하기
  '/recharge/refill/history': { login: true, id: 'DA_01_02_01', title: '리필내역' }, // 리필 히스토리
  '/recharge/refill/select': { login: true, id: 'DA_01_01_03_01', title: '리필하기' }, // 리필하기 > 데이터/음성 선택
  '/recharge/refill/complete': { login: true, id: 'DA_01_01_03_02', title: '리필완료' }, // 리필완료
  '/recharge/refill/error': { login: true, id: 'DA_01_01_03_02', title: '리필하기' }, // 리필 실패
  '/recharge/refill/gift': { login: true, id: '', title: '' },
  '/recharge/refill/gift-complete': { login: true, id: '', title: '' },
  '/recharge/refill/gift-products': { login: true, id: '', title: '' },
  '/recharge/gift': { login: true, id: '', title: '' },
  '/recharge/gift/process/family': { login: true, id: '', title: '' },
  '/recharge/gift/process/members': { login: true, id: '', title: '' },
  '/recharge/gift/process/request': { login: true, id: '', title: '' },
  '/recharge/gift/history': { login: true, id: '', title: '' },
  '/recharge/cookiz': { login: true, id: 'DA_04_01', title: '' }, // 팅/쿠키즈/안심음성 충전하기
  '/recharge/cookiz/history': { login: true, id: 'DA_04_04_01', title: '' }, // 팅/쿠키즈/안심음성 내역
  '/recharge/limit': { login: true, id: 'DA_05_01', title: '데이터 한도 요금 충전' }, // 데이터한도요금 충전
  '/recharge/limit/history': { login: true, id: 'DA_05_04_01', title: '데이터 한도 요금 충전 내역' }, // 데이터한도요금 충전내역
  '/recharge/ting': { login: true, id: 'DA_03_01', title: '' }, // 팅 선물하기
  '/recharge/ting/history': { login: true, id: 'DA_03_03_01', title: '' }, // 팅 선물하기 내역
  // payment
  '/payment/realtime': { login: true, id: 'PA_02_01', title: '즉시납부' }, // 즉시납부
  '/payment/auto': { login: true, id: 'PA_03_01', title: '자동납부 신청 및 변경' }, // 자동납부 신청 및 변경
  '/payment/point': { login: true, id: 'PA_05_01', title: '포인트 요금납부' }, // 포인트 요금납부
  '/payment/history': { login: true, id: 'PA_06_01', title: '' },  // 전체납부내역
  '/payment/history/realtime': { login: true, id: 'PA_06_02', title: '' }, // 즉시납부내역
  '/payment/history/auto': { login: true, id: 'PA_06_03', title: '' },  // 자동납부내역
  '/payment/history/auto/unitedwithdrawal': { login: true, id: 'PA_06_04', title: '' },  // 자동납부 통합인출 내역
  '/payment/history/point/reserve': { login: true, id: 'PA_06_05', title: '' },  // 포인트 납부 예약 내역
  '/payment/history/point/auto': { login: true, id: 'PA_06_06', title: '' }, // 포인트 자동 납부 내역
  '/payment/history/receipt/tax': { login: true, id: 'PA_06_09', title: '' },  // 세금 계산서 발행내역
  '/payment/history/receipt/cash': { login: true, id: 'PA_06_10', title: '' }, // 현금 영수증 발행내역
  '/payment/history/excesspay': { login: true, id: 'PA_06_07', title: '' },  // 과납금액 환불 내역
  '/payment/history/excesspay/account': { login: true, id: 'PA_06_07_01', title: '' },  // 과납금액 환불 계좌 입력
  '/payment/prepay/micro': { login: true, id: 'PA_08_01_01', title: '소액결제 선결제' }, // 소액결제 선결제
  '/payment/prepay/contents': { login: true, id: 'PA_07_01_01', title: '콘텐츠이용료 선결제' }, // 콘텐츠이용료 선결제
  '/payment/prepay/micro/pay': { login: true, id: 'PA_08_03_01', title: '소액결제 선결제하기' }, // 소액결제 선결제하기
  '/payment/prepay/contents/pay': { login: true, id: 'PA_07_03_01', title: '콘텐츠이용료 선결제하기' }, // 콘텐츠이용료 선결제
  '/payment/prepay/micro/history': { login: true, id: 'PA_08_04', title: '소액결제 선결제 내역' }, // 소액결제 선결제 내역
  '/payment/prepay/contents/history': { login: true, id: 'PA_07_04', title: '콘텐츠이용료 선결제 내역' }, // 콘텐츠이용료 선결제 내역
  '/payment/prepay/micro/auto': { login: true, id: 'PA_08_07_01', title: '소액결제 자동선결제' }, // 소액결제 자동선결제
  '/payment/prepay/contents/auto': { login: true, id: 'PA_07_07_01', title: '콘텐츠이용료 자동선결제' }, // 콘텐츠이용료 자동선결제
  '/payment/prepay/micro/auto/change': { login: true, id: 'PA_08_07_02', title: '소액결제 자동선결제 변경' }, // 소액결제 자동선결제 변경
  '/payment/prepay/contents/auto/change': { login: true, id: 'PA_07_07_02', title: '콘텐츠이용료 자동선결제 변경' }, // 콘텐츠이용료 자동선결제 변경
  '/payment/prepay/micro/auto/history': { login: true, id: 'PA_08_05', title: '소액결제 자동선결제 내역' }, // 소액결제 자동선결제 내역
  '/payment/prepay/contents/auto/history': { login: true, id: 'PA_07_05', title: '콘텐츠이용료 자동선결제 내역' }, // 콘텐츠이용료 자동선결제 내역
  // management
  // membership
  // product
  // direct
  // customer
  '/customer': { login: false, id: 'CI_01_01', title: '고객센터 서브메인' }, // 고객센터 서브메인
  '/customer/email': { login: false, id: 'CI_04_09', title: '이메일 문의' }, // 이메일 문의
  '/customer/voice/info': { login: false, id: 'CI_10_01', title: '목소리인증 안내' }, // 목소리인증 안내
  '/customer/voice/sms': { login: false, id: 'CI_10_02', title: '목소리인증 문자발송' }, // 목소리인증 문자발송
  '/customer/notice': { login: false, id: 'CI_06_01', title: '공지사항' }, // 공지사항
  '/customer/prevent-damage': { login: false, id: 'CI_07_01', title: '이용자 피해예방 센터' }, // 이용자 피해예방 센터 메인
  '/customer/prevent-damage/guide': { login: false, id: 'CI_07_03', title: '이용자 피해예방 가이드' }, // 이용자 피해예방 가이드
  '/customer/prevent-damage/guide/view': { login: false, id: 'CI_07_05', title: '이용자 피해예방 가이드' }, // 이용자 피해예방 가이드 - 상세
  '/customer/prevent-damage/latest-warning': { login: false, id: 'CI_07_07', title: '최신 이용자 피해예방 주의보' },  // 최신 이용자 피해예방 주의보
  '/customer/prevent-damage/latest-warning/view': { login: false, id: 'CI_07_08', title: '최신 이용자 피해예방 주의보' },  // 최신 이용자 피해예방 주의보 - 상세
  '/customer/prevent-damage/useful-service': { login: false, id: 'CI_07_09', title: '유용한 부가서비스' },  // 유용한 부가서비스
  '/customer/prevent-damage/relate-site': { login: false, id: 'CI_07_10', title: '이용자 피해예방 관련 사이트' }, // 이용자 피해예방 관련 사이트
  '/customer/helpline': { login: true, id: 'CI_05_01', title: '전화상담 예약' }, // 전화상담예약
  '/customer/shop/detail': { login: false, id: 'CI_02_04', title: '매장정보' }, // 매장 및 AS센터 > 매장정보
  '/customer/shop/near': { login: false, id: 'CI_02_05', title: '내 위치와 가까운 매장' }, // 매장 및 AS센터 > 내 위치와 가까운 매장 검색
  '/customer/shop/repair': { login: false, id: 'CI_03_01', title: '매장 및 AS 센터' }, // 매장 및 AS센터 > 지역 별 AS센터
  '/customer/shop/repair-manufacturer': { login: false, id: 'CI_03_02', title: '매장 및 AS 센터' }, // 매장 및 AS센터 > 제조사 별 AS센터
  '/customer/shop/search': { login: false, id: 'CI_02_01', title: '매장 및 AS 센터' }, // 매장 및 AS센터 > 지점/대리점 찾기
  '/customer/researches': { login: true, id: 'CI_09_02', title: '고객의견' }, // 설문조사 리스트
  '/customer/result': { login: false, id: 'CI_09_04', title: '설문조사 결과' }, // 설문조사 결과
  // auth
  '/auth/line': { login: true, id: 'CO_01_05_02', title: '' }, // 회선관리
  '/auth/line/edit': { login: true, id: 'CO_01_05_02_01', title: '' }, // 회선편집
  '/auth/line/register/corporation': { login: true, id: 'CO_01_05_02_03', title: '' }, // 법인회선등록
  '/auth/line/register/empty': { login: true, id: 'CO_01_05_02_02', title: '' }, // 가입된 회선 없음
  '/auth/login/exceed-fail': { login: false, id: 'CO_01_02_01_02', title: '' },  // 로그인 횟수 초과
  '/auth/login/fail': { login: false, id: 'CO_01_02_01_01', title: '' },  // 로그인 실패
  '/auth/login/dormancy': { login: false, id: 'CO_01_02_02', title: '휴면 해제' },
  '/auth/login/find-id-pwd': { login: false, id: 'CO_01_04', title: '아이디 찾기/비밀번호 재설정' },
  '/auth/login/customer-pwd': { login: false, id: 'CO_01_02_03_01', title: '고객보호 비밀번호 서비스 로그인' },
  '/auth/login/customer-pwd-fail': { login: false, id: 'CO_01_02_03_01_01', title: '로그인 실패' },
  '/auth/login/route': { login: false, id: '', title: '' },
  '/auth/login/easy-aos': { login: false, id: 'CO_01_02_06_01', title: '' }, // 간편로그인 안드로이드
  '/auth/login/easy-ios': { login: false, id: 'CO_01_02_06_02', title: '' }, // 간편로그인 IOS
  '/auth/login/easy-fail': { login: false, id: 'CO_01_02_06_03', title: '' },  // 간편로그인 이용불가
  '/auth/logout/complete': { login: false, id: 'CO_01_03_01', title: '' },  // 로그아웃 성공
  '/auth/logout/expire': { login: false, id: 'CO_01_03_02', title: '' },  // 세션 만료
  '/auth/logout/route': { login: false, id: '', title: '' },
  '/auth/member/management': { login: true, id: 'CO_01_05', title: '' }, // 회원 정보 관리
  '/auth/signup/guide': { login: false, id: 'CO_01_01', title: '회원가입 안내' },
  '/auth/tid/login': { login: false, id: '', title: '' },
  '/auth/tid/account': { login: true, id: '', title: '' },
  '/auth/tid/change-pw': { login: true, id: '', title: '' },
  '/auth/tid/find-id': { login: false, id: '', title: '' },
  '/auth/tid/find-pw': { login: false, id: '', title: '' },
  '/auth/tid/logout': { login: false, id: '', title: '' },
  '/auth/tid/signup-local': { login: false, id: '', title: '' },
  '/auth/tid/signup-foreigner': { login: false, id: '', title: '' },
  '/auth/tid/guide': { login: false, id: '', title: '' },
  '/auth/tid/route': { login: false, id: '', title: '' },
  '/auth/withdrawal/guide': { login: true, id: 'CO_01_05_01_01', title: '회원탈퇴' },
  '/auth/withdrawal/survey': { login: true, id: 'CO_01_05_01_03', title: '회원탈퇴' },
  '/auth/withdrawal/complete': { login: false, id: 'CO_01_05_01_04_01', title: '회원탈퇴' }
};

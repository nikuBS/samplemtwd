export const URL = {
  // Main
  '/main/menu/settings': { login: false, id: 'ST_01_01', title: '설정' },
  '/main/menu/settings/business-info': { login: false, id: 'ST_01_08', title: '사업자 정보' },
  '/main/menu/settings/privacy': { login: false, id: 'ST_01_07', title: '개인정보처리방침' },
  '/main/menu/settings/certificates': { login: false, id: 'ST_01_06', title: '공인인증센터' },
  '/main/menu/settings/notification': { login: true, id: 'ST_01_05', title: 'T알림 설정' },
  '/main/menu/settings/terms': { login: false, id: 'GU_02', title: '이용약관' },
  '/main/menu/settings/location': { login: true, id: 'ST_01_04', title: '위치정보 이용 동의 설정' },
  '/main/menu/refund': { login: false, id: 'MN_01_04_01_01', title: '미환급금 조회' },

  // MyT
  '/myt-fare/submain': { login: true, id: 'MF1', title: '나의 요금' },
  '/myt-fare/unbill': { login: true, id: 'MF_02', title: '미납요금' },
  '/myt-fare/bill/account': { login: true, id: 'MF_01_01', title: '계좌이체 납부' },
  '/myt-fare/bill/card': { login: true, id: 'MF_01_02', title: '체크/신용카드 납부' },
  '/myt-fare/bill/point': { login: true, id: 'MF_01_03', title: 'OK캐쉬백/T포인트 납부' },
  '/myt-fare/bill/sms': { login: true, id: 'MF_01_04', title: '입금전용계좌 신청' },
  '/myt-fare/bill/cashbag': { login: true, id: 'MF_01_05', title: 'OK캐쉬백 요금납부' },
  '/myt-fare/bill/tpoint': { login: true, id: 'MF_01_06', title: 'T포인트 요금납부' },
  '/myt-fare/billguide/guide': { login: true, id: 'MF_02_01', title: '요금안내서' },
  '/myt-fare/billguide/callgift': { login: true, id: 'MF_02_01_02', title: '요금안내서 콜기프트 사용요금 조회' },
  '/myt-fare/billguide/roaming': { login: true, id: 'MF_02_01_03', title: '요금안내서 로밍 사용요금 조회' },
  '/myt-fare/billguide/donation': { login: true, id: 'MF_02_01_04', title: '요금안내서 기부금/후원금 사용요금 조회' },
  '/myt-fare/bill/option': { login: true, id: 'MF_05_01', title: '납부방법' },
  '/myt-fare/bill/option/register': { login: true, id: 'MF_05_01_01', title: '자동납부 신청 및 변경' },
  '/myt-fare/bill/small': { login: true, id: 'MF_06', title: '소액결제' },
  '/myt-fare/bill/small/auto': { login: true, id: 'MF_06_04', title: '소액결제 자동선결제 신청' },
  '/myt-fare/bill/small/auto/info': { login: true, id: 'MF_06_05', title: '소액결제 자동선결제 변경 및 해지 정보' },
  '/myt-fare/bill/small/auto/change': { login: true, id: 'MF_06_05_01', title: '소액결제 자동선결제 변경' },
  '/myt-fare/bill/contents': { login: true, id: 'MF_07', title: '콘텐츠이용료' },
  '/myt-fare/bill/contents/auto': { login: true, id: 'MF_07_04', title: '콘텐츠이용료 자동선결제 신청' },
  '/myt-fare/bill/contents/auto/info': { login: true, id: 'MF_07_05', title: '콘텐츠이용료 자동선결제 변경 및 해지 정보' },
  '/myt-fare/bill/contents/auto/change': { login: true, id: 'MF_07_05_01', title: '콘텐츠이용료 자동선결제 변경' },
  '/myt-fare/billsetup': { login: true, id: 'MF_04', title: '요금 안내서 설정' },
  '/myt-fare/billsetup/historyreturn': { login: true, id: 'MF_04_04', title: '요금안내서 반송내역' },
  '/myt-fare/billsetup/reissue': { login: true, id: 'MF_04_01', title: '요금안내서 재발행' },
  '/myt-fare/billsetup/change': { login: true, id: 'MF_04_02', title: '요금안내서 변경' },
  '/myt-fare/bill/hotbill': { login: true, id: 'MF_03', title: '실시간 사용요금' },

  '/myt-fare/info/bill-tax': { login: true, id: 'MF_08_01_01', title: '세금계산서 발급 내역' },
  '/myt-fare/info/bill-cash': { login: true, id: 'MF_08_01_02', title: '현금 영수증 발행 내역' },

  '/myt-join': { login: true, id: 'MS', title: '나의 가입 정보' },
  '/myt-join/myplan': { login: true, id: 'MS_05', title: '나의 요금제' },
  '/myt-join/additions': { login: true, id: 'MS_06', title: '나의 부가상품' },
  '/myt-join/combinations': { login: true, id: 'MS_07', title: '나의 결합상품' },
  '/myt-join/myplan/alarm': { login: true, id: 'MS_05_01', title: '요금제 변경 가능일 알람' },
  '/myt-join/myplan/alarmterminate': { login: true, id: 'MS_05_01_01', title: '요금제 변경 가능일 알림 서비스' },
  '/myt-join/myplancombine/infodiscount/month': { login: true, id: 'MS_09_01', title: '월별 상세 할인 내역' },
  '/myt-join/myplancombine/infodiscount': { login: true, id: 'MS_09', title: '약정할인 및 단말 분할상환 정보' },
  '/myt-join/myplancombine/noagreement': { login: true, id: 'MS_08', title: '무약정 플랜포인트 내역' },
  '/myt-join/myinfo/contract': { login: true, id: 'MS_02_01', title: '이용계약 정보' },
  '/myt-join/wire/wiredo/sms': { login: true, id: 'MS_02_02', title: '망 작업 SMS 알림 신청' },
  '/myt-join/submain/phone/alarm': { login: true, id: 'MS_03_01_03', title: '번호변경 안내서비스 신청' },
  '/myt-join/submain/phone/extalarm': { login: true, id: 'MS_03_01_04', title: '번호변경 안내서비스 연장 및 해지' },
  '/myt-join/submain/numchange': { login: true, id: 'MS_03_02', title: '010 전환 번호변경' },
  '/myt-join/submain/wire': { login: true, id: 'MS_04_01', title: '인터넷/집전화/IPTV 신청현황' },
  '/myt-join/submain/wire/history': { login: true, id: 'MS_04_01_01', title: '인터넷/집전화/IPTV 신청내역' },
  '/myt-join/submain/wire/historydetail': { login: true, id: 'MS_04_01_01_01', title: '인터넷/집전화/IPTV 신청내역 상세' },
  '/myt-join/submain/wire/inetphone': { login: true, id: 'MS_04_01_02', title: '인터넷 전화 번호이동 신청 현황' },
  '/myt-join/submain/wire/as': { login: true, id: 'MS_04_01_03', title: '장애 A/S 신청 현황' },
  '/myt-join/submain/wire/asdetail': { login: true, id: 'MS_04_01_03_01', title: '장애 A/S 상세 내역' },
  '/myt-join/submain/wire/gifts': { login: true, id: 'MS_04_01_04', title: '사은품 조회' },
  '/myt-join/submain/wire/discountrefund': { login: true, id: 'MS_04_01_05', title: '할인 반환금 조회' },
  '/myt-join/submain/wire/freecallcheck': { login: true, id: 'MS_04_02', title: 'B끼리 무료 통화 대상자 조회' },
  '/myt-join/submain/wire/wirestopgo': { login: true, id: 'MS_04_03', title: '일시 정지/해제' },
  '/myt-join/submain/wire/modifyaddress': { login: true, id: 'MS_04_04', title: '설치장소 변경' },
  '/myt-join/submain/wire/modifyproduct': { login: true, id: 'MS_04_05', title: '상품 변경' },
  '/myt-join/submain/wire/modifyperiod': { login: true, id: 'MS_04_06', title: '약정기간 변경' },
  '/myt-join/submain/wire/changeowner': { login: true, id: 'MS_04_07', title: '명의 변경' },
  '/myt-join/submain/wire/cancelsvc': { login: true, id: 'MS_04_08', title: '서비스 해지 신청' },
  '/myt-join/custpassword': { login: true, id: 'MS_01_01_01', title: '고객보호 비밀번호 설정/변경' },

  // MyT-data
  '/myt-data/submain': { login: true, id: 'DC', title: '데이터/통화 관리' },
  '/myt-data/hotdata': { login: true, id: 'DC_01_01', title: '실시간 데이터 잔여량' },
  '/myt-data/submain/child-hotdata': { login: true, id: 'DC_08_01', title: '자녀 실시간 잔여량' },
  '/myt-data/submain/child-hotdata/recharge': { login: true, id: 'DC_08_02', title: '충전허용금액' },
  '/myt-data/hotdata/total-sharing': { login: true, id: 'DC_01_01_01', title: '통합공유 데이터' },
  '/myt-data/hotdata/cancel-tshare': { login: true, id: 'DC_01_01_02', title: 'T데이터 셰어링 USIM 해지' },
  '/myt-data/familydata': { login: true, id: 'DC_02', title: 'T가족모아 데이터' },
  '/myt-data/giftdata': { login: true, id: 'DC_03_01', title: 'T끼리 데이터 선물하기' },
  '/myt-data/recharge/ting': { login: true, id: 'DC_04_03', title: '팅요금제 충전 선물' },
  '/myt-data/recharge/cookiz': { login: true, id: 'DC_04_02', title: '팅/쿠키즈/안심음성 요' },
  '/myt-data/recharge/limit': { login: true, id: 'DC_04_01', title: '데이터 한도 요금제' },
  '/myt-data/recharge/coupon': { login: true, id: 'DC_05', title: '나의 리필쿠폰' },
  '/myt-data/recharge/coupon/use': { login: true, id: 'DC_05_01', title: '리필 쿠폰 사용' },
  '/myt-data/history': { login: true, id: 'DC_07', title: '최근 충전/선물 내역' },

  // Product
  '/product/mobileplan': { login: false, id: 'MP', title: '모바일 요금제' },
  '/product/mobileplan/compare-plans': { login: true, id: 'MP_02_02_01', title: '요금제 비교하기' },
  '/product/mobileplan-add': { login: false, id: 'MV', title: '부가서비스' },
  '/product/mobileplan/list': { login: false, id: 'MP_02', title: '모바일 요금제' },
  '/product/mobileplan-add/list': { login: false, id: 'MV_01', title: '부가서비스' },
  '/product/wireplan': { login: false, id: 'WP', title: '인터넷/전화/TV' },
  '/product/wireplan/internet': { login: false, id: 'WP_01', title: '인터넷' },
  '/product/wireplan/phone': { login: false, id: 'WP_01', title: '전화' },
  '/product/wireplan/tv': { login: false, id: 'WP_01', title: 'TV' },
  '/product/apps': { login: false, id: 'TA', title: 'T apps' },
  '/product/roaming/join/roaming-setup': { login: true, id: 'RM_11_01_02_02', title: '가입' },
  '/product/roaming/join/roaming-begin-setup': { login: true, id: 'RM_11_01_02_03', title: '가입' },
  '/product/roaming/join/roaming-auto': { login: true, id: 'RM_11_01_02_05', title: '가입' },
  '/product/roaming/join/confirm-info': { login: true, id: 'RM_11_01_01_02', title: '가입' },
  '/product/roaming/join/roaming-alarm': { login: true, id: 'RM_11_01_02_01', title: '가입' },
  '/product/roaming/join/roaming-combine': { login: true, id: 'RM_11_01_02_07', title: '설정' },
  '/product/roaming/setting/roaming-setup': { login: true, id: 'RM_11_01_02_02', title: '설정' },
  '/product/roaming/setting/roaming-begin-setup': { login: true, id: 'RM_11_01_02_03', title: '가입' },
  '/product/roaming/setting/roaming-auto': { login: true, id: 'RM_11_01_02_05', title: '설정' },
  '/product/roaming/setting/roaming-alarm': { login: true, id: 'RM_11_01_02_01', title: '설정' },
  '/product/roaming/setting/roaming-combine': { login: true, id: 'RM_11_01_02_07', title: '설정' },
  '/product/roaming/lookup': { login: true, id: 'RM_11_01_02_06', title: '설정' },
  '/product/roaming/terminate': { login: true, id: 'MV_01_02_03', title: '해지' },
  '/product/roaming/coupon': { login: false, id: 'RM_13', title: '로밍 카드/쿠폰' },
  '/product/roaming/fi/guide': { login: false, id: 'RM_14_01', title: 'T파이 이용안내' },
  '/product/roaming/fi/reservation1step': { login: true, id: 'RM_14_02_01', title: 'T파이 예약 1단계' },
  '/product/roaming/fi/reservation2step': { login: true, id: 'RM_14_02_02', title: 'T파이 예약 2단계' },
  '/product/roaming/fi/reservation3step': { login: true, id: 'RM_14_02_03', title: 'T파이 예약 3단계' },
  '/product/roaming/fi/inquire': { login: true, id: 'RM_14_03_01', title: 'T파이 조회/취소' },
  '/product/roaming/fi/inquire-auth': { login: true, id: 'RM_14_03_02_01', title: 'T파이 조회/취소' },
  '/product/roaming/info/center': { login: false, id: 'RM_15_01_01', title: '공항 로밍센터' },
  '/product/roaming': { login: false, id: 'RM', title: '로밍' },
  '/product/roaming/my-use': { login: false, id: 'RM_02_01_01', title: '나의 로밍 이용현황' },
  '/product/roaming/do/search-before': { login: false, id: 'RM_03_01_01_01', title: '국가별 로밍 요금 조회' },
  '/product/roaming/search-result': { login: false, id: 'RM_04', title: '국가별 로밍 요금 조회' },
  '/product/roaming/info/guide': { login: false, id: 'RM_16_01', title: '로밍안내' },
  '/product/roaming/info/lte': { login: false, id: 'RM_16_02_01', title: '자동로밍' },
  '/product/roaming/info/secure-troaming': { login: false, id: 'RM_16_03', title: '자동안심 T로밍이란?' },
  '/product/roaming/info/data-roaming': { login: false, id: 'RM_16_04', title: 'SMS / DATA 로밍' },
  '/product/roaming/fee': { login: false, id: 'RM_11', title: '로밍 요금제' },
  '/product/roaming/planadd': { login: false, id: 'RM_12', title: '로밍 부가서비스' },


    // Customer
  '/customer/agentsearch': { login: false, id: 'CS_02_01', title: '지점/대리점 찾기' },
  '/customer/agentsearch/search': { login: false, id: 'CS_02_01', title: '지점/대리점 찾기' },
  '/customer/agentsearch/detail': { login: false, id: 'CS_02_02', title: '매장정보' },
  '/customer/agentsearch/near': { login: true, id: 'CS_02_03', title: '내 위치와 가까운 매장' },
  '/customer/agentsearch/repair': { login: false, id: 'CS_03_01', title: 'AS센터 찾기' },
  '/customer/agentsearch/repair-detail': { login: false, id: 'CS_03_02', title: 'AS센터 정보' },
  '/customer/agentsearch/repair-manufacturer': { login: false, id: 'CS_03_03', title: '제조사 별 AS센터' },
  '/customer/document': { login: false, id: 'CS_09_01', title: '구비서류' },
  '/customer/faq': { login: false, id: 'CS_05_01', title: '자주 찾는 질문' },
  '/customer/faq/search': { login: false, id: 'CS_05_04', title: 'FAQ' },
  '/customer/helpline': { login: false, id: 'CS_14_01', title: '전화상담 예약하기' },
  '/customer/notice': { login: false, id: 'CS_10_01', title: '공지사항' },
  '/customer/svc-info/praise': { login: false, id: 'CS_11_01', title: '칭찬합니다' },
  '/customer/damage-info': { login: false, id: 'CS_13_01', title: '이용자 피해예방 센터' },
  '/customer/damage-info/guide': { login: false, id: 'CS_13_03', title: '이용자 피해예방 가이드' },
  '/customer/damage-info/warning': { login: false, id: 'CS_13_05', title: '최신 이용자 피해예방 주의보' },
  '/customer/damage-info/additions': { login: false, id: 'CS_13_07', title: '유용한 부가서비스' },
  '/customer/damage-info/related': { login: false, id: 'CS_13_08', title: '이용자 피해예방 관련 사이트' },

  // Benefit
  '/benefit/submain': { login: false, id: 'BS', title: '혜택.할인 Index' },
  '/benefit/submain/fare/info/restrict-law': { login: false, id: 'BS_03_01_01_01', title: '단통법관련문의안내 팝업' },
  '/benefit/submain/fare/info/joinable-product': { login: false, id: 'BS_03_01_01_02', title: '가입가능한 요금제 안내' },
  '/benefit/my': { login: false, id: 'BS_01', title: '나의 혜택 · 할인정보' },
  '/benefit/my/rainbowpoint': { login: true, id: 'BS_01_01', title: '레인보우 포인트' },
  '/benefit/my/rainbowpoint/adjustment': { login: true, id: 'BS_01_01_03', title: '포인트 합산' },
  '/benefit/my/rainbowpoint/transfer': { login: true, id: 'BS_01_01_04', title: '포인트 양도' },
  '/benefit/my/cookiz': { login: false, id: 'BS_01_01_06', title: '쿠키즈팅 포인트' },
  '/benefit/my/military': { login: false, id: 'BS_01_01_05', title: '현역플랜 포인트' },

  // Common
  '/common/member/tid-pwd': { login: false, id: 'CO_ME_01_04', title: '아이디 찾기/비밀번호 재설정' },
  '/common/member/manage': { login: true, id: 'CO_ME_01_05', title: '회원정보' },

  // Membership
  '/membership_benefit/mbrs_0001': { login: false, id: 'BE_03_01', title: '제휴브랜드' },
  '/membership/membership_info/mbrs_0001': { login: false, id: 'BE_04_01', title: '멤버십 카드 및 등급 안내' },

  // T Event
  '/tevent/ing': { login: false, id: 'EV_01_01', title: '진행중 이벤트' },
  '/tevent/last': { login: false, id: 'EV_01_01', title: '지난 이벤트' },
  '/tevent/win': { login: false, id: 'EV_01_01', title: '당첨자 발표' },
  '/tevent/detail': { login: false, id: 'EV_01_02', title: '진행중 이벤트/지난 이벤트 상세' },
  '/tevent/win/detail': { login: false, id: 'EV_01_04', title: '당첨자 발표 상세' }
};

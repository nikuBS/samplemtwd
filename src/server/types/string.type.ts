export enum SKIP_NAME {
  UNLIMIT = '무제한',
  DEFAULT = '기본제공량',
  EXCEED = 'LT', // 초과
  DAILY = 'PA' // 일별사용량
}
// 요금 안내서 설정 > 안내서 유형(복합은 컨트롤러에서 만들고 단수만 표현한다)
export const MYT_FARE_BILL_TYPE = {
  'P' : 'T world 확인',
  'H' : 'Bill Letter', // 무선 case
  'J' : 'Bill Letter', // 유선 case
  'B' : '문자',
  '2' : '이메일',
  '1' : '기타(우편)',
  'X' : '선택안함'
};
export const MYT_FARE_BILL_GUIDE = {
  DATE_FORMAT: {
    YYYYMM_TYPE: 'YYYY년 MM월'
  },
  FIRST_SVCTYPE: '서비스 전체',
  PHONE_SVCTYPE: '휴대폰'
};

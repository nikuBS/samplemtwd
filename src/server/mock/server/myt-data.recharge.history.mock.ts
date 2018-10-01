const DATA_GIFTS = {
  code: '00',
  msg: 'success',
  result: [
    {
      opDt: "20180627", // "선물일자(YYYYMMDD)"
      dataQty: "1024", // "선물데이터량(MB)"
      custNm: "김*진",// "제공자 or 수혜자 고객명"
      svcNum: "01062**50**", // "제공자 or 수혜자 서비스번호"
      type: "1",  // "선물유형(1: 보낸선물 2: 받은선물)"
      giftType: "GC" // "자동선물유형(G1: 일반선물, GC: 자동선물, GD: 1+1선물데이)"
    }, {
      opDt: "20180628", // "선물일자(YYYYMMDD)"
      dataQty: "1024", // "선물데이터량(MB)"
      custNm: "김*진",// "제공자 or 수혜자 고객명"
      svcNum: "01062**50**", // "제공자 or 수혜자 서비스번호"
      type: "1",  // "선물유형(1: 보낸선물 2: 받은선물)"
      giftType: "GC" // "자동선물유형(G1: 일반선물, GC: 자동선물, GD: 1+1선물데이)"
    }
  ]
};
const LIMIT_CHARGES = {
  code: '00', msg: 'success', result: [
    {
      opDt: "20180627", // "처리일"
      amt: "10000", // "충전금액"
      opTypCd: "1",  // "처리유형코드"
      opTypNm: "후불충전", // "처리유형명"
      opOrgNm: "모바일 Tworld" // "처리영업장"
    },
    {
      opDt: "20180628", // "처리일"
      amt: "10000", // "충전금액"
      opTypCd: "1",  // "처리유형코드"
      opTypNm: "후불충전", // "처리유형명"
      opOrgNm: "모바일 Tworld" // "처리영업장"
    }
  ]
};
const TING_CHARGES = {
  code: '00', msg: 'success', result: [
    {
      opDt: "20180623", // "처리일(YYYYMMDD)"
      amt: "2000", // "충전금액"
      opTypCd: "1", // "충전유형코드" → Appendix 1.
      opTypNm: "후불충전", // "충전유형명"
      refundableYn: "Y"  // "당일환불가능여부"
    },
    {
      opDt: "20180624", // "처리일(YYYYMMDD)"
      amt: "2000", // "충전금액"
      opTypCd: "1", // "충전유형코드" → Appendix 1.
      opTypNm: "후불충전", // "충전유형명"
      refundableYn: "Y"  // "당일환불가능여부"
    }
  ]
};
const TING_GIFTS = {
  code: '00', msg: 'success', result: [
    {
      opDt: "20180508", // 처리일
      opTypCd: "2", // 처리구분코드(1 보낸선물, 2 받은선물)
      opTypNm: "후불선물충전", // 처리구분명
      amt: "1000", // 선물금액
      svcNum: "01062**50**", // 서비스번호(보낸목록:수혜자, 받은목록:제공자)
      custNm: "홍*동" // 고객명(보낸목록:수혜자, 받은목록:제공자)
    },
    {
      opDt: "20180509", // 처리일
      opTypCd: "2", // 처리구분코드(1 보낸선물, 2 받은선물)
      opTypNm: "후불선물충전", // 처리구분명
      amt: "1000", // 선물금액
      svcNum: "01062**50**", // 서비스번호(보낸목록:수혜자, 받은목록:제공자)
      custNm: "홍*동" // 고객명(보낸목록:수혜자, 받은목록:제공자)
    },
  ]
};
const REFILL_USAGES = {
  code: '00',
  msg: 'success',
  result:
    [{
      copnIsueNum: 'AAA000000420059947',
      copnNm: '선물 받은 리필쿠폰',
      copnUseDt: '20180307',
      copnDtlClCd: 'AAA10',
      copnDtlClNm: '데이터 100%'
    },
    {
      copnIsueNum: 'AAA000000323777818',
      copnNm: '장기가입쿠폰',
      copnUseDt: '20170211',
      copnDtlClCd: 'AAA10',
      copnDtlClNm: '데이터 100%'
    },
    {
      copnIsueNum: 'AAA000000310748074',
      copnNm: '선물 받은 리필쿠폰',
      copnUseDt: '20170108',
      copnDtlClCd: 'AAA10',
      copnDtlClNm: '데이터 100%'
    },
    {
      copnIsueNum: 'AAA000000323777819',
      copnNm: '장기가입쿠폰',
      copnUseDt: '20161212',
      copnDtlClCd: 'AAA10',
      copnDtlClNm: '데이터 100%'
    },
    {
      copnIsueNum: 'AAA000000323777817',
      copnNm: '장기가입쿠폰',
      copnUseDt: '20160920',
      copnDtlClCd: 'AAA10',
      copnDtlClNm: '데이터 100%'
    },
    {
      copnIsueNum: 'AAA000000323777816',
      copnNm: '장기가입쿠폰',
      copnUseDt: '20160707',
      copnDtlClCd: 'AAA10',
      copnDtlClNm: '데이터 100%'
    }]
};
const REFILL_GIFTS = {
  code: '00',
  msg: 'success',
  result:
    [{
      copnIsueNum: 'AAA000000529426976',
      copnNm: '장기가입쿠폰',
      usePsblStaDt: '20180701',
      usePsblEndDt: '20190630',
      copnOpDt: '20180720',
      svcNum: '01050**78**',
      type: '1'
    },
    {
      copnIsueNum: 'AAA000000420059947',
      copnNm: '장기가입쿠폰',
      usePsblStaDt: '20170601',
      usePsblEndDt: '20180531',
      copnOpDt: '20180301',
      svcNum: '01072**19**',
      type: '2'
    },
    {
      copnIsueNum: 'AAA000000310748074',
      copnNm: '장기가입쿠폰',
      usePsblStaDt: '20160601',
      usePsblEndDt: '20170531',
      copnOpDt: '20170101',
      svcNum: '01072**19**',
      type: '2'
    }]
}

export { DATA_GIFTS, LIMIT_CHARGES, TING_CHARGES, TING_GIFTS, REFILL_USAGES, REFILL_GIFTS };
//선택회선조회
/*
* svcAttrCd
* sk브로드밴드 : 'S1', 'S2', 'S3'
* 기업솔루션 : 'O1'
* 선불폰 : 'M2'
* 기본 : 'M1' //개별청구 휴대폰, 통합청구대표 휴대폰, 통합청구일반 휴대폰
 */
const billguide_BFF_01_0005 = {//휴대폰
  "code": "00",
  "msg": "success",
  "result":
    {
      "svcMgmtNum": "7100000001",
      "svcGr": "A",
      "svcAttrCd": "M2",//서비스 속성
      "repSvcYn": "Y",
      "svcNum": "010-12**-56**",
      "nickNm": "내휴대폰",
      "addr": ""
    }
};

export default billguide_BFF_01_0005;


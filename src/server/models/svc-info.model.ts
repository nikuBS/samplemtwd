export interface ISvcInfo {
  svcMgmtNum: string;       // 서비스 관리번호
  svcNum: string;           // 서비스 번호
  svcGr: string;            // 서비스 등급
  svcAttrCd: string;        // 서비스 속석
  repSvcYn: string;         // 기준회선 여부
  nickNm: string;           // 닉네임
  addr: string;             // 주소
  eqpMdlNm: string;         // 펫네임 or 단말모델명
  svcScrbDt: string;       // 가입일
  svcLastUpdDtm: string;    // 최종변경일
  mbrNm: string;            // 고객명
  totalSvcCnt: string;      // 전체 회선수
  expsSvcCnt: string;       // 등록된 회선수
  loginType: string;        // 로그인 형태  E: 간편로그인 T: TID 로그인
}

export class SvcInfoModel implements ISvcInfo {
  svcMgmtNum: string = '';
  svcNum: string = '';
  svcGr: string = '';
  svcAttrCd: string = '';
  repSvcYn: string = '';
  nickNm: string = '';
  addr: string = '';
  eqpMdlNm: string = '';
  svcScrbDt: string = '';
  svcLastUpdDtm: string = '';
  mbrNm: string = '';
  totalSvcCnt: string = '';
  expsSvcCnt: string = '';
  loginType: string = '';

  constructor(object) {
    this.svcMgmtNum = object.svcMgmtNum || this.svcMgmtNum;
    this.svcNum = object.svcNum || this.svcNum;
    this.svcGr = object.svcGr || this.svcGr;
    this.svcAttrCd = object.svcAttrCd || this.svcAttrCd;
    this.repSvcYn = object.repSvcYn || this.repSvcYn;
    this.nickNm = object.nickNm || this.nickNm;
    this.addr = object.addr || this.addr;
    this.eqpMdlNm = object.eqpMdlNm || this.eqpMdlNm;
    this.svcScrbDt = object.svcScrbDt || this.svcScrbDt;
    this.svcLastUpdDtm = object.svcLastUpdDtm || this.svcLastUpdDtm;
    this.mbrNm = object.mbrNm || this.mbrNm;
    this.totalSvcCnt = object.totalSvcCnt || this.totalSvcCnt;
    this.expsSvcCnt = object.expsSvcCnt || this.expsSvcCnt;
    this.loginType = object.loginType || this.loginType;
  }
}

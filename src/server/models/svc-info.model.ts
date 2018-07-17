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

  constructor(object) {
    this.svcMgmtNum = object.svcMgmtNum;
    this.svcNum = object.svcNum;
    this.svcGr = object.svcGr;
    this.svcAttrCd = object.svcAttrCd;
    this.repSvcYn = object.repSvcYn;
    this.nickNm = object.nickNm;
    this.addr = object.addr;
    this.eqpMdlNm = object.eqpMdlNm;
    this.svcScrbDt = object.svcScrbDt;
    this.svcLastUpdDtm = object.svcLastUpdDtm;
    this.mbrNm = object.mbrNm;
  }
}

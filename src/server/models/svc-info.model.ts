export interface ISvcInfo {
  svcMgmtNum: string;       // 서비스 관리번호
  svcNum: string;           // 서비스 번호
  svcGr: string;            // 서비스 등급
  svcAttrCd: string;        // 서비스 속석
  repSvcYn: string;         // 기준회선 여부
  pwdStCd: string;          // 고객보호비밀번호상태
  nickNm: string;           // 닉네임
  addr: string;             // 주소
  actRepYn: string;         // 청구대표서비스여부
  smsYn: string;            // SMS 착신가능여부
  motpYn: string;           // MOTP 사용가능 여부
  totalSvcCnt: string;      // 전체 회선수
  expsSvcCnt: string;       // 등록된 회선수
  mbrNm: string;            // 고객명
  loginType: string;        // 로그인 형태  E: 간편로그인 T: TID 로그인
}

export class SvcInfoModel implements ISvcInfo {
  svcMgmtNum: string = '';
  svcNum: string = '';
  svcGr: string = '';
  svcAttrCd: string = '';
  repSvcYn: string = '';
  pwdStCd: string = '';
  nickNm: string = '';
  addr: string = '';
  actRepYn: string = '';
  smsYn: string = '';
  motpYn: string = '';
  totalSvcCnt: string = '';
  expsSvcCnt: string = '';
  mbrNm: string = '';
  loginType: string = '';

  constructor(object) {
    this.svcMgmtNum = object.svcMgmtNum || this.svcMgmtNum;
    this.svcNum = object.svcNum || this.svcNum;
    this.svcGr = object.svcGr || this.svcGr;
    this.svcAttrCd = object.svcAttrCd || this.svcAttrCd;
    this.repSvcYn = object.repSvcYn || this.repSvcYn;
    this.pwdStCd = object.pwdStCd || this.pwdStCd;
    this.nickNm = object.nickNm || this.nickNm;
    this.addr = object.addr || this.addr;
    this.actRepYn = object.actRepYn || this.actRepYn;
    this.smsYn = object.smsYn || this.smsYn;
    this.motpYn = object.motpYn || this.motpYn;
    this.totalSvcCnt = object.totalSvcCnt || this.totalSvcCnt;
    this.expsSvcCnt = object.expsSvcCnt || this.expsSvcCnt;
    this.mbrNm = object.mbrNm || this.mbrNm;
    this.loginType = object.loginType || this.loginType;
  }
}

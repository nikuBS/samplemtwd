export interface ISvcInfo {
  svcMgmtNum: string;       // 서비스 관리번호
  xtSvcMgmtNum: string;     // xtractor 암호화 서비스 관리번호
  svcNum: string;           // 서비스 번호
  svcGr: string;            // 서비스 등급
  svcAttrCd: string;        // 서비스 속석
  repSvcYn: string;         // 기준회선 여부
  pwdStCd: string;          // 고객보호비밀번호상태
  nickNm: string;           // 닉네임
  prodId: string;           // 기본요금제ID
  prodNm: string;           // 기본요금제명
  addr: string;             // 주소
  actRepYn: string;         // 청구대표서비스여부
  smsUsableYn: string;      // SMS 착신가능여부
  motpUsableYn: string;     // MOTP 사용가능 여부
  svcStCd: string;          // 현재서비스의 서비스상태코드
  eqpMdlNm: string;         // 펫네임
  svcScrbDt: string;        // 가입일자
  svcLastUpdDtm: string;    // 최종변경일시
  userId: string;           // TID
  xtUserId: string;         // xtractor용 암호화 ID
  totalSvcCnt: string;      // 전체 회선수
  expsSvcCnt: string;       // 등록된 회선수
  mbrNm: string;            // 고객명
  loginType: string;        // 로그인 형태  E: 간편로그인 T: TID 로그인
  twdAdRcvAgreeYn: string;  // T world 광고정보수신동의여부(Y/N)
  twdInfoRcvAgreeYn: string; // T world 개인정보수집이용동의여부(Y/N)
  twdLocUseAgreeYn: string; // T world 위치정보 이용동의여부(Y/N)
  tplaceUseAgreeYn: string; // T place 이용동의여부(Y/N)
  mbrChlId: string;         // 멤버채널ID
  // noticeType: string;
}

export class SvcInfoModel implements ISvcInfo {
  svcMgmtNum: string = '';
  xtSvcMgmtNum: string = '';
  svcNum: string = '';
  svcGr: string = '';
  svcAttrCd: string = '';
  repSvcYn: string = '';
  pwdStCd: string = '';
  nickNm: string = '';
  prodId: string = '';
  prodNm: string = '';
  addr: string = '';
  actRepYn: string = '';
  smsUsableYn: string = '';
  motpUsableYn: string = '';
  svcStCd: string = '';
  eqpMdlNm: string = '';
  svcScrbDt: string = '';
  svcLastUpdDtm: string = '';
  // BFF_01_0002
  userId: string = '';
  xtUserId: string = '';
  totalSvcCnt: string = '';
  expsSvcCnt: string = '';
  // Login
  mbrNm: string = '';
  // noticeType: string = '';
  twdAdRcvAgreeYn: string = '';
  twdInfoRcvAgreeYn: string = '';
  twdLocUseAgreeYn: string = '';
  tplaceUseAgreeYn: string = '';
  loginType: string = '';
  mbrChlId: string = '';

  constructor(object) {
    this.svcMgmtNum = object.svcMgmtNum || this.svcMgmtNum;
    this.xtSvcMgmtNum = object.xtSvcMgmtNum || this.xtSvcMgmtNum;
    this.svcNum = object.svcNum || this.svcNum;
    this.svcGr = object.svcGr || this.svcGr;
    this.svcAttrCd = object.svcAttrCd || this.svcAttrCd;
    this.repSvcYn = object.repSvcYn || this.repSvcYn;
    this.pwdStCd = object.pwdStCd || this.pwdStCd;
    this.nickNm = object.nickNm || this.nickNm;
    this.prodId = object.prodId || this.prodId;
    this.prodNm = object.prodNm || this.prodNm;
    this.addr = object.addr || this.addr;
    this.actRepYn = object.actRepYn || this.actRepYn;
    this.smsUsableYn = object.smsUsableYn || this.smsUsableYn;
    this.motpUsableYn = object.motpUsableYn || this.motpUsableYn;
    this.svcStCd = object.svcStCd || this.svcStCd;
    this.eqpMdlNm = object.eqpMdlNm || this.eqpMdlNm;
    this.svcScrbDt = object.svcScrbDt || this.svcScrbDt;
    this.svcLastUpdDtm = object.svcLastUpdDtm || this.svcLastUpdDtm;
    this.userId = object.userId || this.userId;
    this.xtUserId = object.xtUserId || this.xtUserId;
    this.totalSvcCnt = object.totalSvcCnt || this.totalSvcCnt;
    this.expsSvcCnt = object.expsSvcCnt || this.expsSvcCnt;
    this.mbrNm = object.mbrNm || this.mbrNm;
    this.loginType = object.loginType || this.loginType;
    this.twdAdRcvAgreeYn = object.twdAdRcvAgreeYn || this.twdAdRcvAgreeYn;
    this.twdInfoRcvAgreeYn = object.twdInfoRcvAgreeYn || this.twdInfoRcvAgreeYn;
    this.twdLocUseAgreeYn = object.twdLocUseAgreeYn || this.twdLocUseAgreeYn;
    this.tplaceUseAgreeYn = object.tplaceUseAgreeYn || this.tplaceUseAgreeYn;
    this.mbrChlId = object.mbrChlId || this.mbrChlId;
    // this.noticeType = object.noticeType || this.noticeType;
  }
}

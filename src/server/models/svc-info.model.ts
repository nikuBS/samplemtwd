export interface ISvcInfo {
  svcMgmtNum: string;
  svcNum: string;
  svcGr: string;
  svcAttrCd: string;
  repSvcYn: string;
  nickNm: string;
  addr: string;
  svcCnt: string;
  mbrNm: string;
}

export class SvcInfoModel implements ISvcInfo {
  svcMgmtNum: string = '';
  svcNum: string = '';
  svcGr: string = '';
  svcAttrCd: string = '';
  repSvcYn: string = '';
  nickNm: string = '';
  addr: string = '';
  svcCnt: string = '';
  mbrNm: string = '';

  constructor(object) {
    this.svcMgmtNum = object.svcMgmtNum;
    this.svcNum = object.svcNum;
    this.svcGr = object.svcGr;
    this.svcAttrCd = object.svcAttrCd;
    this.repSvcYn = object.respSvcYn;
    this.nickNm = object.nickNm;
    this.addr = object.addr;
    this.svcCnt = object.svcCnt;
    this.mbrNm = object.mbrNm;
  }
}

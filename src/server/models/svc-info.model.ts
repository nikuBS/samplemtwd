export interface ISvcInfo {
  custNm: string;
  svcCd: string;
  svcNum: string;
  svcNickNm: string;
  repSvcYn: string;
  svcCnt: string;
}

export class SvcInfoModel implements ISvcInfo {
  custNm: string = '';
  svcCd: string = '';
  svcNum: string = '';
  svcNickNm: string = '';
  repSvcYn: string = '';
  svcCnt: string = '';

  constructor(object) {
    this.custNm = object.custNm;
    this.svcCd = object.svcCd;
    this.svcNum = object.svcNum;
    this.svcNickNm = object.svcNickNm;
    this.repSvcYn = object.respSvcYn;
    this.svcCnt = object.svcCnt;
  }
}

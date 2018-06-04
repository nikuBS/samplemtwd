export interface ISvcInfo {
  custNm: string;
  svcCd: string;
  svcNum: string;
  svcNickNm: string;
  repSvcYn: string;
  svcCnt: string;

  serverSession: string;
}

export class SvcInfoModel implements ISvcInfo {
  static instance;
  custNm: string = '';
  svcCd: string = '';
  svcNum: string = '';
  svcNickNm: string = '';
  repSvcYn: string = '';
  svcCnt: string = '';

  _serverSession: string = '';

  constructor(object) {
    if ( SvcInfoModel.instance ) {
      return SvcInfoModel.instance;
    }

    this.custNm = object.custNm;
    this.svcCd = object.svcCd;
    this.svcNum = object.svcNum;
    this.svcNickNm = object.svcNickNm;
    this.repSvcYn = object.respSvcYn;
    this.svcCnt = object.svcCnt;
    SvcInfoModel.instance = this;
  }

  get svcInfo(): any {
    return {
      custNm: this.custNm,
      svcCd: this.svcCd,
      svcNum: this.svcNum,
      svcNickNm: this.svcNickNm,
      repSvcYn: this.repSvcYn,
      svcCnt: this.svcCnt
    };
  }

  set svcInfo(object: any) {
    this.custNm = object.custNm || '';
    this.svcCd = object.svcCd || '';
    this.svcNum = object.svcNum || '';
    this.svcNickNm = object.svcNickNm || '';
    this.repSvcYn = object.respSvcYn || '';
    this.svcCnt = object.svcCnt || '';
  }

  get serverSession(): string {
    return this._serverSession;
  }

  set serverSession(serverSession: string) {
    this._serverSession = serverSession;
  }
}

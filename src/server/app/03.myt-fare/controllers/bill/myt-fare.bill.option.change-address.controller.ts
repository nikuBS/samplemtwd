/**
 * FileName: myt-fare.bill.option.change-address.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2019.01.18
 * Annotation: 자동납부 미사용자 연락처 및 주소 변경 관리
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import {Observable} from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import {SVC_ATTR_NAME} from '../../../../types/bff.type';

class MyTFareBillOptionChangeAddress extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.getAddrInfo().subscribe((addrInfo) => {
      if (addrInfo.code === API_CODE.CODE_00) {
        res.render('bill/myt-fare.bill.option.change-address.html', {
          svcInfo: this.getSvcInfo(svcInfo),
          pageInfo: pageInfo,
          addrInfo: this.parseInfo(addrInfo.result)
        });
      } else {
        this.error.render(res, {
          code: addrInfo.code,
          msg: addrInfo.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  private getAddrInfo(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0146, {}).map((res) => {
      return res;
    });
  }

  private getSvcInfo(svcInfo: any): any {
    svcInfo.svcName = SVC_ATTR_NAME[svcInfo.svcAttrCd];
    svcInfo.phoneNum = StringHelper.phoneStringToDash(svcInfo.svcNum);

    return svcInfo;
  }

  private parseInfo(info: any): any {
    if (info.svcNum) {
      info.phoneNum = StringHelper.phoneStringToDash(info.svcNum);
    }

    if (info.basAddr) {
      info.baseAddr = info.basAddr.replace('<br>', '');
      info.baseAddr = info.basAddr.replace('<br/>', '');
    }

    if (info.dtlAddr) {
      info.detailAddr = info.dtlAddr.replace('<br>', '');
      info.detailAddr = info.dtlAddr.replace('<br/>', '');
    }
    return info;
  }
}

export default MyTFareBillOptionChangeAddress;

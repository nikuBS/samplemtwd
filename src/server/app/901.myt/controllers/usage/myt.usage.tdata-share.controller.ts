/**
 * FileName: myt.usage.tdata-share.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';

class MyTUsageTDataShare extends TwViewController {
  constructor() {
    super();
  }

  private parseData(data: any): any {
    data.opmdBasic = FormatHelper.convDataFormat(data.opmdBasic, DATA_UNIT.KB);
    data.totShar = FormatHelper.convDataFormat(data.totShar, DATA_UNIT.KB);
    if ( data.opmdBasic.unit !== DATA_UNIT.KB ) {
      data.opmdBasicSub = this.getSubData(data.opmdBasic);
    }
    if ( data.totShar.unit !== DATA_UNIT.KB ) {
      data.totSharSub = this.getSubData(data.totShar);
    }
    return data;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const tDataShareRequest: Observable<any> = this.apiService.request(API_CMD.BFF_05_0005, {});
    Observable.combineLatest(
      tDataShareRequest,
    ).subscribe(([tDataShareData]) => {
      const result = this.getResult(tDataShareData);
      const parsedResult = this.parseData(result);
      res.render('usage/myt.usage.tdata-share.html', {
        result: parsedResult,
        svcInfo
      });
    });
  }

  private getSubData(data: any): any {
    const subData = {
      data: FormatHelper.convNumFormat(data.data.replace(/,/gi, '') * 1024)
    };
    switch ( data.unit ) {
      case DATA_UNIT.GB:
        subData['unit'] = DATA_UNIT.MB;
        break;
      case DATA_UNIT.MB:
        subData['unit'] = DATA_UNIT.KB;
        break;
    }
    return subData;

  }

  private getResult(resp: any): any {
    if ( resp.code === API_CODE.CODE_00 ) {
      return resp.result;
    }
    return resp;
  }
}

export default MyTUsageTDataShare;

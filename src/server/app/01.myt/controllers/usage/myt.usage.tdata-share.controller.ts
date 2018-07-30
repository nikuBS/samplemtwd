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

  private getResult(resp: any): any {
    if ( resp.code === API_CODE.CODE_00 ) {
      return resp.result;
    }
    return resp;
  }
}

export default MyTUsageTDataShare;

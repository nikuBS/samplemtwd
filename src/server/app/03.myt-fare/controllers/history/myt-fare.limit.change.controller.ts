/**
 * FileName: myt-fare.limit.change.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {Observable} from 'rxjs/Rx';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

interface DataObj {
  current: string;
  limitMonth: string;
  limitDay: string;
  limitOneTime: string;
}

interface UselessRequestObject {
  gubun: string;
  requestCnt: number;
}

class MyTFareLimitChange extends TwViewController {

  requestObj: UselessRequestObject = {
    gubun: 'Request',
    requestCnt: 0
  };

  constructor() {
    super();
  }

  getCurrentLimit(API_NAME: any, callback: any, req: Request, res: Response, svcInfo: any) {
    return this.apiService.request(API_NAME, this.requestObj).subscribe((firstResponse) => {
      this.requestObj.gubun = 'Done';
      this.requestObj.requestCnt = this.requestObj.requestCnt++;

      this.apiService.request(API_NAME, this.requestObj).subscribe((lastResponse) => {
        if (lastResponse.code === API_CODE.CODE_00) {
          callback(lastResponse, req, res, svcInfo);
        } else {
          this.requestObj.gubun = 'Retry';
          this.requestObj.requestCnt = this.requestObj.requestCnt++;
          this.getCurrentLimit(API_NAME, callback, req, res, svcInfo);
        }
      });
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };

    if (query.current === 'micro-pay') {
      // this.getCurrentLimit(API_CMD.BFF_07_0073, this.renderView, req, res, svcInfo);
      this.apiService.request(API_CMD.BFF_05_0080, {}).subscribe((resData) => {
        if(resData.code === API_CODE.CODE_00) {
          this.renderView(resData, req, res, next, svcInfo);
        }
      });
    } else {
      // this.getCurrentLimit(API_CMD.BFF_07_0081, this.renderView, req, res, svcInfo);
      this.apiService.request(API_CMD.BFF_05_0066, {}).subscribe((resData) => {
        if(resData.code === API_CODE.CODE_00) {
          this.renderView(resData, req, res, next, svcInfo);
        }
      });
    }
  }

  renderView(data: any, req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('history/myt-fare.limit.change.html', {svcInfo: svcInfo, data: data});
  }

}

export default MyTFareLimitChange;

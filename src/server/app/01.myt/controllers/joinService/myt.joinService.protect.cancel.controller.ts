/**
 * FileName: myt.joinService.protect.cancel.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.25
 *
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';


class MytJSProtectCancelController extends TwViewController {
  private _svcInfo: object = {};
  set svcInfo(val) {
    this._svcInfo = val;
  }

  get svcInfo() {
    return this._svcInfo;
  }

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const self = this;
    this.svcInfo = svcInfo;
    this.logger.info(this, '사용자 정보 : ', svcInfo);

    // this.apiService.request('', {}).subscribe((responseData) => {
    // 화면 데이터 설정
    // const data = self.convertData(responseData);
    res.render('joinService/myt.joinService.protect.cancel.html', { });
    // });
  }

  private convertData(data: any) {
    const result = {
      svcInfo: this.svcInfo
    };
    if ( data.code === '00' && data.result ) {
      result['data'] = data.result;
    } else {
      // mook up data
      result['data'] = {};
    }
    return result;
  }
}

export default MytJSProtectCancelController;


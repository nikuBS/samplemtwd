/**
 * FileName: myt.joinService.protect.change.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.25
 *
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';


class MytJSProtectChangeController extends TwViewController {
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
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분하여
    // ** 고객보호 비밀번호 서비스 해지 버튼 노출여부 설정


    // this.apiService.request('', {}).subscribe((responseData) => {
    // 화면 데이터 설정
    // const data = self.convertData(responseData);
    res.render('joinService/myt.joinService.protect.change.html', { });
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

export default MytJSProtectChangeController;


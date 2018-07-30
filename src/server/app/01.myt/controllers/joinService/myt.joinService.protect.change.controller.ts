/**
 * FileName: myt.joinService.protect.change.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.25
 *
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff-common.type';


class MytJSProtectChangeController extends TwViewController {
  private _svcInfo: object = {};
  private _isNew: boolean = false;

  set svcInfo(val) {
    this._svcInfo = val;
  }

  get svcInfo() {
    return this._svcInfo;
  }

  set isNew(val) {
    this._isNew = val;
  }

  get isNew() {
    return this._isNew;
  }

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const self = this;
    this.svcInfo = svcInfo;
    this.logger.info(this, 'UserInfo ', svcInfo);
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분하여
    // ** 고객보호 비밀번호 서비스 해지 버튼 노출여부 설정
    if ( svcInfo.pwdStCd && (svcInfo.pwdStCd === 60) ) {
      // 60 -> 초기화 상태
      this.isNew = true;
    }
    const data = {
      title: svcInfo.svcAttrCd ? SVC_ATTR[svcInfo.svcAttrCd] : '',
      number: svcInfo.svcNum || '',
      svcInfo: svcInfo,
      isNew: this.isNew
    };


    // this.apiService.request('', {}).subscribe((responseData) => {
    // 화면 데이터 설정
    // const data = self.convertData(responseData);
    res.render('joinService/myt.joinService.protect.change.html', { data });
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


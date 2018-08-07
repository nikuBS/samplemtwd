/**
 * FileName: myt.joinService.protect.change.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.25
 *
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.type';


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
    this.svcInfo = svcInfo;
    this.logger.info(this, 'UserInfo ', svcInfo);
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분하여
    // ** 고객보호 비밀번호 서비스 해지 버튼 노출여부 설정
    if ( svcInfo.pwdStCd && (svcInfo.pwdStCd === '10' || svcInfo.pwdStCd === '60') ) {
      // 10 -> 신청, 60 -> 초기화 -- 설정가능한상태
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
    res.render('join/myt.join.protect.change.html', { data });
    // });
  }
}

export default MytJSProtectChangeController;


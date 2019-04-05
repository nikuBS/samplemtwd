/**
 * MenuName: 나의 가입정보 > 서브메인 > 고객보호 비밀번호 설정/변경(MS_01_01_01)
 * @file myt-join.custpassword.controller.ts
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.07.25
 * Summary: 고객 비밀번호 설정/변경
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR_NAME } from '../../../../types/bff.type';
import FormatHelper from '../../../../utils/format.helper';


class MyTJoinCustpassword extends TwViewController {
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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.svcInfo = svcInfo;
    this.logger.info(this, 'UserInfo ', svcInfo);
    // 비밀번호 조회 시 최초 설정이 안되어있는 경우와 등록이 된 경우로 구분하여
    // ** 고객보호 비밀번호 서비스 해지 버튼 노출여부 설정
    if ( svcInfo.pwdStCd && (svcInfo.pwdStCd === '10' || svcInfo.pwdStCd === '60') ) {
      // 10 -> 신청, 60 -> 초기화 -- 설정가능한상태
      this.isNew = true;
    }


    const data = {
      title: svcInfo.svcAttrCd ? SVC_ATTR_NAME[svcInfo.svcAttrCd] : '',
      number: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) || '',
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      isNew: this.isNew
    };


    // this.apiService.request('', {}).subscribe((responseData) => {
    // 화면 데이터 설정
    // const data = self.convertData(responseData);
    res.render('submain/myt-join.custpassword.html', { svcInfo: svcInfo, data: data, pageInfo: pageInfo });

    // });
  }
}

export default MyTJoinCustpassword;


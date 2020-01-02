/**
 * @file T알림 설정 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-06
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../../utils/format.helper';

export default class MainMenuSettingsNotifications extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(
      this.checkNotiAgreedInfo(res, svcInfo, pageInfo),
      this.checkTworldAgreedInfo(res, svcInfo, pageInfo)
    ).subscribe(
      ([respNoti, respTworld]) => {
        if (FormatHelper.isEmpty(respNoti) || FormatHelper.isEmpty(respTworld)) {
          return;
        }

        res.render('menu/settings/main.menu.settings.notifications.html', {
          svcInfo,
          pageInfo,
          isServiceOn: respNoti.tnotiInfoRcvAgreeYn === 'Y' ? true : false,
          isRecommendOn: respNoti.tnotiMrktRcvAgreeYn === 'Y' ? true : false,
          isTplaceOn: respNoti.tplaceUseAgreeYn && respNoti.tplaceUseAgreeYn === 'Y' ? true : false,
          isAdOn: respTworld.twdAdRcvAgreeYn === 'Y' ? true : false,
          isPrivateInfoOn: respTworld.twdInfoRcvAgreeYn === 'Y' ? true : false,
          isLocationOn: respTworld.twdLocUseAgreeYn === 'Y' ? true : false
        });
      },
      (err) => this.showError(res, svcInfo, pageInfo, err.code, err.msg)
    );
  }

  /**
   * @function
   * @desc T알림 관련 동의여부를 BFF로 부터 조회
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - page 정보
   * @returns Observable BFF로 조회된 결과를 Observable로 return
   */
  private checkNotiAgreedInfo(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0023, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      this.showError(res, svcInfo, pageInfo, resp.code, resp.msg);
      return null;
    });
  }

  /**
   * @function
   * @desc 약관들 동의 여부 BFF로 부터 조회
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @returns Observable - 약관 동의 여부 조회결과 Observable로 리턴
   */
  private checkTworldAgreedInfo(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0021, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }
      this.showError(res, svcInfo, pageInfo, resp.code, resp.msg);
      return null;
    });
  }

  private showError(res: Response, svcInfo: any, pageInfo: any, code: string, msg: string) {
    this.error.render(res, {
      code: code,
      msg: msg,
      pageInfo: pageInfo,
      svcInfo: svcInfo
    });
  }
}

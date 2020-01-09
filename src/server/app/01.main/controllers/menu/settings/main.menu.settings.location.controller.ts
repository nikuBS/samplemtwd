/**
 * @file 위치정보 이용동의 화면 처리
 * @author Hakjoon Sim
 * @since 2018-10-11
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../../utils/format.helper';
import { NODE_ERROR_MSG } from '../../../../../types/string.type'; 

export default class MainMenuSettingsLocation extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    this.checkIsOverFourteen(res, svcInfo, pageInfo).subscribe((isOverFourteen) => {
      if (isOverFourteen) {
        this.isLocationTermAgreed(res, svcInfo, pageInfo).subscribe(
          (isAgree) => {
            if (!FormatHelper.isEmpty(isAgree)) {
              res.render('menu/settings/main.menu.settings.location.html', {
                svcInfo, pageInfo, isAgree
              });
            }
          },
          (err) => this.showError(res, svcInfo, pageInfo, err.code, err.msg)
        );
      } else {
        this.showError(res, svcInfo, pageInfo, API_CODE.NODE_1006, NODE_ERROR_MSG[API_CODE.NODE_1008]);
      }
    });
  }

  /**
   * @function
   * @desc 현재 사용자의 위치정보 이용동의 여부를 BFF로 부터 조회해옴
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - page 정보
   * @returns Observable - BFF조회 결과를 Observable 로 return
   */
  private isLocationTermAgreed(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_03_0021, {}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        if (resp.result.twdLocUseAgreeYn === 'Y') {
          return true;
        } else {
          return false;
        }
      }
      this.showError(res, svcInfo, pageInfo, resp.code, resp.msg);
      return null;
    });
  }

    /**
   * @function
   * @desc 14세 이상 확인
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - page 정보
   * @returns Observable BFF로 조회된 결과를 Observable로 return
   */
  private checkIsOverFourteen(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0080, {/*mbrChlId : svcInfo.mbrChlId*/}).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result.age >= 14 ? true : false;
      }
      this.showError(res, svcInfo, pageInfo, resp.code, resp.msg);
      return false;
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

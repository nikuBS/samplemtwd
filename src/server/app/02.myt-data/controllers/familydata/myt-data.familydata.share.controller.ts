/**
 * @file myt-data.familydata.controller.ts
 * @author Jiyoung Jo
 * @since 2018.10.01
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';

export default class MyTDataFamilyShare extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @description 화면 랜더링
   */
  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    // Observable.combineLatest(this.getShareData(), this.getMonthlyInfo()).subscribe(([immediately, monthly]) => {
    this.getMonthlyInfo().subscribe((monthly) => {
      if (monthly.code) {
        return this.error.render(res, {
          ...monthly,
          svcInfo: svcInfo,
          pageInfo
        });
      }

      res.render('familydata/myt-data.familydata.share.html', {
        svcInfo,
        pageInfo,
        monthly,
        isApp: BrowserHelper.isApp(req)
      });
    });
  }
  /**
   * @description 자동 공유 설정 내용 가져오기
   */
  private getMonthlyInfo() {
    return this.apiService.request(API_CMD.BFF_06_0047, {}).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }
      return resp.result;
    });
  }
}

/**
 * FileName: myt-data.prepaid.data-auto.controller.ts
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.29
 * Description: 선불폰 데이터 자동 충전
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_DATA_RECHARGE_MSG} from '../../../../types/string.type';
import {RECHARGE_DATA_CODE} from '../../../../types/bff.type';
import {Observable} from 'rxjs/Observable';

class MyTDataPrepaidDataAuto extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    if (BrowserHelper.isApp(req)) { // 앱일 경우에만 진입 가능
      this.getAutoInfo().subscribe((autoInfo) => {
        if (autoInfo.code === API_CODE.CODE_00) {
          const autoResult = autoInfo.result;

          res.render('prepaid/myt-data.prepaid.data-auto.html', {
            autoInfo: this.parseAuto(autoResult), // 자동 충전 정보
            svcInfo: svcInfo, // 회선 정보 (필수)
            pageInfo: pageInfo // 페이지 정보 (필수)
          });
        } else {
          this.error.render(res, {
            code: autoInfo.code,
            msg: autoInfo.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      });
    } else { // 모바일웹일 경우 앱 설치 유도 페이지로 이동
      res.render('share/common.share.app-install.info.html', {
        svcInfo: svcInfo, pageInfo: pageInfo, isAndroid: BrowserHelper.isAndroid(req)
      });
    }
  }

  /* 선불폰 데이터 자동 충전 내역 조회 */
  private getAutoInfo(): any {
    return this.apiService.request(API_CMD.BFF_06_0060, {});
  }

  private parseAuto(result: any): any {
    if (FormatHelper.isEmpty(result.amtCd)) { // 정보가 존재하지 않으면 default setting
      result.txt = MYT_DATA_RECHARGE_MSG.SELECT_DATA;
      result.id = undefined;
      result.isAuto = false;
      result.btnText = MYT_DATA_RECHARGE_MSG.REGISTER;
    } else { // 자동 충전 설정된 정보
      result.txt = RECHARGE_DATA_CODE[result.amtCd];
      result.id = result.amtCd;
      result.isAuto = true;
      result.btnText = MYT_DATA_RECHARGE_MSG.CHANGE;
    }
    return result;
  }
}

export default MyTDataPrepaidDataAuto;

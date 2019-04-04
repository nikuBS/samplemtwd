/**
 * 이용안내 > 이용자피해예방센터 > 메인
 * @file customer.damage-info.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import FormatHelper from '../../../../utils/format.helper';

class CustomerDamageInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo: any = {
      svcInfo: svcInfo, // 사용자 정보
      pageInfo: pageInfo  // 페이지 정보
    };

    // 이용자 피해예방센터 최신 정보 값을 API 을 통해 가져옴. (주요/일반 각각 노출해야됨)
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_08_0063, { repCtgCd: 'A00001' }), // 주요
      this.apiService.request(API_CMD.BFF_08_0063, { repCtgCd: 'A00002' })  // 일반
    ).subscribe(([warningTopInfo, warningNormalInfo]) => {
      // 오류가 있는지 확인
      const apiError = this.error.apiError([warningTopInfo, warningNormalInfo]);

      // 오류가 있으면 오류 페이지를 보여 준다.
      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      // 주요 및 일반 리스트가 응답 값에 있는지 확인
      const warningTopInfoList: any = FormatHelper.isEmpty(warningTopInfo.result.content) ? [] : warningTopInfo.result.content,
        warningNormalInfoList: any = FormatHelper.isEmpty(warningNormalInfo.result.content) ? [] : warningNormalInfo.result.content;

      res.render('damage-info/customer.damage-info.html', {
        warningList: [...warningTopInfoList, ...warningNormalInfoList],
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        isApp: BrowserHelper.isApp(req),
        isAndroid: BrowserHelper.isAndroid(req)
      });
    });
  }
}

export default CustomerDamageInfo;

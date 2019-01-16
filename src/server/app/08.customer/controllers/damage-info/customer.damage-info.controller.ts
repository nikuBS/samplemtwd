/**
 * FileName: customer.damage-info.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { API_CMD } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';

class CustomerDamageInfo extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_08_0063, { repCtgCd: 'A00001' }),
      this.apiService.request(API_CMD.BFF_08_0063, { repCtgCd: 'A00002' })
    ).subscribe(([warningTopInfo, warningNormalInfo]) => {
      const apiError = this.error.apiError([warningTopInfo, warningNormalInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      const warningTopInfoList: any = FormatHelper.isEmpty(warningTopInfo.result.content) ? [] : warningTopInfo.result.content,
        warningNormalInfoList: any = FormatHelper.isEmpty(warningNormalInfo.result.content) ? [] : warningNormalInfo.result.content;

      res.render('damage-info/customer.damage-info.html', {
        warningList: [...warningTopInfoList, ...warningNormalInfoList],
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        isApp: BrowserHelper.isApp(req)
      });
    });
  }
}

export default CustomerDamageInfo;

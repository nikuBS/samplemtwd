/**
 * @file customer.helpline.controller.ts
 * @author Jiyoung Jo
 * @since 2018.10.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import BrowserHelper from '../../../../utils/browser.helper';

interface ITimeInfo {
  curDate: string; // '상담날짜' - '20180725',
  availHours: string[]; // '상담가능시간' - ['1600', '1700']
}

export default class CustomerHelpline extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_08_0001, {}).subscribe((resp: { code: string; msg: string; result: ITimeInfo }) => {
      if (resp.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo
        });
      }

      const timeInfo = {
        curDate: DateHelper.getKoreanDate(resp.result.curDate),
        availHours: resp.result.availHours.map(time => time.slice(0, -2))
      };

      res.render('helpline/customer.helpline.html', { svcInfo, timeInfo, isApp: BrowserHelper.isApp(req), pageInfo });
    });
  }
}

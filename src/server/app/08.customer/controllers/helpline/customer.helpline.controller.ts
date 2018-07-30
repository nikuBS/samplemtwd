/*
 * FileName: customer.helpline.controller.ts
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';

interface ITimeInfo {
  curDate: string; // '상담날짜' - '20180725',
  availHours: string[]; // '상담가능시간' - ['1600', '1700']
}

export default class CustomerHelpline extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    this.apiService.request(API_CMD.BFF_08_0001).subscribe((resp: { code: string, result: ITimeInfo }) => {
      const timeInfo = {
        curDate: DateHelper.getShortDateNoDot(resp.result.curDate),
        availHours: resp.result.availHours.map((time) => { return time.slice(0, -2) })
      }
      res.render('helpline/customer.helpline.html', { svcInfo, timeInfo });
    })
  }
}

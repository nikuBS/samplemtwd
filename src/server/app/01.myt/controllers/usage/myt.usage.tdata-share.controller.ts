/**
 * FileName: myt.usage.tdata-share.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import MyTUsageTDataShareData from '../../../../mock/server/myt.usage.tdata-share';
import DateHelper from '../../../../utils/date.helper';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { UNIT } from '../../../../types/bff-common.type';

class MyTUsageTDataShare extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('usage/myt.usage.tdata-share.html', {
      svcInfo
    });
  }
}

export default MyTUsageTDataShare;

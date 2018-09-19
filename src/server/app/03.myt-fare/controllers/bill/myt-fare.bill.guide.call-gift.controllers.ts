/**
 * FileName: myt-fare.bill.guide.call-gift.controllers.ts
 * Author: Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * Date: 2018.09.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import StringHelper from '../../../../utils/string.helper';
import moment = require('moment');
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';


class MyTFareBillGuideCallGift extends TwViewController {
  constructor() {
    super();
  }
  public reqQuery: any;
  private _urlTplInfo: any = {
    default: 'bill/myt-fare.bill.guide.call-gift.html',
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    const thisMain = this;
    this.reqQuery = req.query;
    this.logger.info(this, '[ svcInfo ] : ', svcInfo);
    this.logger.info(this, '[ reqQuery ] : ', req.query);

    thisMain.renderView(res, thisMain._urlTplInfo.default, {
      reqQuery: thisMain.reqQuery,
      svcInfo: svcInfo,
    });

  }

  // -------------------------------------------------------------[클리이어튼로 전송]
  public renderView(res: Response, view: string, data: any): any {
    this.logger.info(this, '[ HTML ] : ', view);
    res.render(view, data);
  }

}

export default MyTFareBillGuideCallGift;

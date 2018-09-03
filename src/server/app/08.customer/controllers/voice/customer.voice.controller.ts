/**
 * FileName: customer.voice.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';

class CustomerVoice extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    svcInfo = this.convertData(svcInfo);

    if ( req.params.type === 'info' ) {
      res.render('voice/customer.voice.info.html', { svcInfo: svcInfo });
    }

    if ( req.params.type === 'sms' ) {
      res.render('voice/customer.voice.sms.html', { svcInfo: svcInfo });
    }
  }

  convertData(svcInfo) {
    return Object.assign(svcInfo, { svcNum: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) });
  }
}

export default CustomerVoice;

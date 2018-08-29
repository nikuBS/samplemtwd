/**
 * FileName: customer.voice.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class CustomerVoice extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    if ( req.params.type === 'info' ) {
      res.render('voice/customer.voice.info.html', { svcInfo: svcInfo });
    }

    if ( req.params.type === 'sms' ) {
      res.render('voice/customer.voice.sms.html', { svcInfo: svcInfo });
    }
  }
}

export default CustomerVoice;

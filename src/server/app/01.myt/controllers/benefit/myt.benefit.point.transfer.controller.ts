/**
 * FileName: myt.benefit.point.transfer.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

class MytBenefitPointTransferController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('usage/myt.benefit.point.transfer.html', {
      svcInfo
    });
  }

}

export default MytBenefitPointTransferController;

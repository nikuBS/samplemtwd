/**
 * FileName: benefit.submain.combination-preview.info.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.11.23
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class BenefitSubmainCombinationPreviewInfo extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    res.render('submain/benefit.submain.combination-preview.info.html', {
      svcInfo,
      pageInfo
    });
  }
}

export default BenefitSubmainCombinationPreviewInfo;

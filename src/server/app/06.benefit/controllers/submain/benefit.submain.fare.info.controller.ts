import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import FormatHelper from '../../../../utils/format.helper';

/**
 * @file benefit.submain.fare.info.controller.ts
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018.12.19
 */

export default class BenefitSubmainFareInfo extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const page = req.url.substring(req.url.lastIndexOf('/') + 1);

    res.render(`submain/benefit.submain.fare.info.${page}.html`, {
      svcInfo,
      pageInfo
    });
  }

}

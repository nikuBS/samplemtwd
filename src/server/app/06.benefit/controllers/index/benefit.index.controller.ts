import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

/**
 * @file benefit.index.controller.ts
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018.10.26
 */

class BenefitIndex extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const bpcpServiceId = req.query.bpcpServiceId || '', eParam = req.query.eParam || '';

    res.render('index/benefit.index.html', {
      svcInfo,
      pageInfo,
      bpcpServiceId,
      eParam
    });
  }
}

export default BenefitIndex;

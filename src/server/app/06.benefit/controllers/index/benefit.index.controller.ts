import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
import FormatHelper from '../../../../utils/format.helper';

/**
 * FileName: benefit.index.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.26
 */

class BenefitIndex extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    res.render('index/benefit.index.html', {
      svcInfo,
      pageInfo,
      isLogin : !FormatHelper.isEmpty(svcInfo)
    });
  }
}

export default BenefitIndex;

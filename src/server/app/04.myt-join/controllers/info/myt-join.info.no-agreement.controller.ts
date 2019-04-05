/**
 * FileName: myt-join.info.no-agreement.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

class MyTJoinInfoNoAgreement extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('info/myt-join.info.no-agreement.html', {svcInfo, pageInfo});
  }
}

export default MyTJoinInfoNoAgreement;

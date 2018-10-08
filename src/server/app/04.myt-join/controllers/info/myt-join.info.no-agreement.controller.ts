/**
 * FileName: myt-join.info.no-agreement.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

class MyTJoinJoinInfoNoAgreement extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('info/myt-join.info.no-agreement.html', this.getData(svcInfo, {}));
  }

  private getData(svcInfo: any, data: any): any {

    return {
      svcInfo,
      data : data
    };
  }
}

export default MyTJoinJoinInfoNoAgreement;

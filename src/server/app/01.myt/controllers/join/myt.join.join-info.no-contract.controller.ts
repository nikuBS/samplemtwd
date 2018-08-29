/**
 * FileName: myt.join.join-info.no-contract.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.08.02
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

class MyTJoinJoinInfoNoContract extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    res.render('join/myt.join.join-info.no-contract.html', this.getData(svcInfo, {}));
  }

  private getData(svcInfo: any, data: any): any {

    return {
      svcInfo,
      data : data
    };
  }
}

export default MyTJoinJoinInfoNoContract;

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';
/**
 * FileName: membership.info.grade.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.31
 */

class MembershipInfoGrade extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    res.render('info/membership.info.grade.html', {
      svcInfo,
      pageInfo
    });
  }
}

export default MembershipInfoGrade;

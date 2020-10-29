import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common_en/controllers/tw.view.controller';

class CustomerMain extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
      res.render('../../views/containers/main/en.customer.main.html', {svcInfo, pageInfo});
    }
}
export default CustomerMain;

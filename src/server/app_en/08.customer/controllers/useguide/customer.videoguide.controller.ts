import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';

class CustomerVideoGuide extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('../../views/containers/useguide/en.customer.useguide.videoguide.html', {svcInfo, pageInfo});
  }
}

export default CustomerVideoGuide;

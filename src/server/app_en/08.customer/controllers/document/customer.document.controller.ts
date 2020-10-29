import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';

/**
 * @class
 * @desc 필요서류 안내
 */
class CustomerDocument extends TwViewController {

    
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
        res.render('../../views/containers/document/en.customer.document.html', {svcInfo, pageInfo}); 
    }
}

export default CustomerDocument;

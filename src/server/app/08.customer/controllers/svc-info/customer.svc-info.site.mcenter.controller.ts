/**
 * FileName: customer.svc-info.site.mcenter.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.12.18
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import { URL_APP_STORE } from '../../../../types/outlink.type';


class CustomerSvcInfoMcenter extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any)  {

    res.render('svc-info/customer.svc-info.site.mcenter.html', {
      svcInfo: svcInfo, 
      pageInfo: pageInfo, 
      tWorldAppStoreURL: URL_APP_STORE['AOS'] // 임시로 AOS URL로 고정(현재 빈값)
    });

  }

}

export default CustomerSvcInfoMcenter;

/**
 * FileName: customer.svc-info.site.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.12.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { CUSTOMER_STIE_OPTION_TYPE } from '../../../../types/string.type';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

class CustomerSvcInfoSite extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any)  {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };
    
    res.render('svc-info/customer.svc-info.site.html', {
      svcInfo: svcInfo, 
      pageInfo: pageInfo, 
      data: this.setListUp(CUSTOMER_STIE_OPTION_TYPE)
    });
  }

  private setListUp = (list) => {
    return list.map((o, listIndex) => Object.assign(o, {listIndex}));
  }

}

export default CustomerSvcInfoSite;

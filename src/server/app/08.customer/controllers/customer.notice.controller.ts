/**
 * FileName: customer.notice.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../types/string.type';

const categoryLabel = {
  tworld: CUSTOMER_NOTICE_CATEGORY.TWORLD,
  directshop: CUSTOMER_NOTICE_CATEGORY.DIRECTSHOP,
  membership: CUSTOMER_NOTICE_CATEGORY.MEMBERSHIP,
  roaming: CUSTOMER_NOTICE_CATEGORY.ROAMING
};

class CustomerNoticeController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const category = req.query.category || 'tworld';

    // @todo category 값이 미리 정의된 것이 아닐경우 오류처리 필요.
    // if (['tworld', 'directshop', 'roaming', 'membership'].indexOf(category) === -1) {
    //   res.redirect();
    // }

    res.render('customer.notice.html', {
      category: category,
      categoryLabel: categoryLabel[category],
      svcInfo: svcInfo
    });
  }
}

export default CustomerNoticeController;

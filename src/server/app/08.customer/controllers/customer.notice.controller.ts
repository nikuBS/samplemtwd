/**
 * FileName: customer.notice.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../utils/format.helper';

class CustomerNoticeController extends TwViewController {
  constructor() {
    super();
  }

  private categoryLabel = {
    tworld: 'T world',
    directshop: '다이렉트샵',
    membership: '멤버십',
    roaming: '로밍'
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const category = req.query.category || 'tworld';

    // @todo category 값이 미리 정의된 것이 아닐경우 오류처리 필요.
    // if (['tworld', 'directshop', 'roaming', 'membership'].indexOf(category) === -1) {
    //   res.redirect();
    // }

    res.render('customer.notice.html', {
      category: category,
      categoryLabel: this.categoryLabel[category],
      svcInfo: svcInfo
    });
  }
}

export default CustomerNoticeController;

/**
 * FileName: customer.notice.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../types/string.type';

const categorySwitchingData = {
  tworld: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.TWORLD,
    API: API_CMD.BFF_08_0029
  },
  directshop: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.DIRECTSHOP,
    API: API_CMD.BFF_08_0030
  },
  membership: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.MEMBERSHIP,
    API: API_CMD.BFF_08_0031
  },
  roaming: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.ROAMING,
    API: API_CMD.BFF_08_0032
  }
};

class CustomerNoticeController extends TwViewController {
  constructor() {
    super();
  }

  private convertData(data): any {
    if (data.code !== API_CODE.CODE_00) {
      return {
        total: 0,
        remain: 0,
        list: [],
        last: true
      };
    }

    return {
      total: data.result.total,
      remain: data.result.remainCounts,
      list: data.result.content,
      last: data.result.last
    };
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const category = req.query.category || 'tworld';

    if (['tworld', 'directshop', 'roaming', 'membership'].indexOf(category) === -1) {
      res.redirect('/customer/notice');
    }

    this.apiService.request(categorySwitchingData[category].API, {page: 1, size: 20})
      .subscribe((data) => {
        res.render('customer.notice.html', {
          category: category,
          categoryLabel: categorySwitchingData[category].LABEL,
          svcInfo: svcInfo,
          data: this.convertData(data)
        });
      });
  }
}

export default CustomerNoticeController;

/**
 * FileName: customer.notice.controller.ts
 * Author: 양지훈 (jihun202@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../types/string.type';
import _ from 'lodash';

const categorySwitchingData = {
  tworld: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.TWORLD,
    API: API_CMD.BFF_08_0029
  },
  directshop: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.DIRECTSHOP,
    API: API_CMD.BFF_08_0039
  },
  membership: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.MEMBERSHIP,
    API: API_CMD.BFF_08_0031
  },
  roaming: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.ROAMING,
    API: API_CMD.BFF_08_0040
  }
};

class CustomerNoticeController extends TwViewController {
  constructor() {
    super();
  }

  private _convertData(data): any {
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
      remain: this._getRemainCount(data.result.totalElements, data.result.pageable.pageNumber, data.result.pageable.pageSize),
      list: _.map(data.result.content, (item) => {
        return _.merge(item, {
          date: item.rgstDt.substr(0, 4) + '.' + item.rgstDt.substr(4, 2) + '.' + item.rgstDt.substr(6, 2),
          type: _.isEmpty(item.ctgNm) ? '' : item.ctgNm,
          itemClass: (item.isTop ? 'impo ' : '') + (item.isNew ? 'new' : '')
        });
      }),
      last: data.result.last
    };
  }

  private _getRemainCount(total, page, pageSize): any {
    const count = total - ((++page) * pageSize);
    return count < 0 ? 0 : count;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const category = req.query.category || 'tworld';

    if (['tworld', 'directshop', 'roaming', 'membership'].indexOf(category) === -1) {
      res.redirect('/customer/notice');
    }

    this.apiService.request(categorySwitchingData[category].API, {page: 0, size: 20})
      .subscribe((data) => {
        res.render('customer.notice.html', {
          category: category,
          categoryLabel: categorySwitchingData[category].LABEL,
          svcInfo: svcInfo,
          data: this._convertData(data)
        });
      });
  }
}

export default CustomerNoticeController;

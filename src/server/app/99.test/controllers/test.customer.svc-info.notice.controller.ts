/**
 * FileName: test.customer.svc-info.notice.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.19
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../types/string.type';
import {API_CMD, API_CODE} from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';
import sanitizeHtml from 'sanitize-html';

const categorySwitchingData = {
  tworld: {
    LABEL: CUSTOMER_NOTICE_CATEGORY.TWORLD,
    API: API_CMD.BFF_08_0029_TEST
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

class TestCustomerSvcInfoNotice extends TwViewController {
  constructor() {
    super();
  }

  private _fixHtml(content): any {
    return sanitizeHtml(content);
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
      list: data.result.content.map(item => {
        return Object.assign(item, {
          date: DateHelper.getShortDateWithFormat(item.rgstDt, 'YY.M.DD'),
          type: FormatHelper.isEmpty(item.ctgNm) ? '' : item.ctgNm,
          itemClass: (item.isTop ? 'impo ' : '') + (item.isNew ? 'new' : ''),
          content: this._fixHtml(item.content)
        });
      }),
      last: data.result.last
    };
  }

  private _getRemainCount(total, page, pageSize): any {
    const count = total - ((++page) * pageSize);
    return count < 0 ? 0 : count;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const category = req.params.category || 'tworld';

    if (['tworld', 'directshop', 'roaming', 'membership'].indexOf(category) === -1) {
      return res.redirect('/customer/svc-info/notice');
    }

    this.apiService.request(categorySwitchingData[category].API, {page: 0, size: 20})
      .subscribe((data) => {
        if (FormatHelper.isEmpty(data)) {
          return res.redirect('/customer');
        }

        res.render('test.customer.svc-info.notice.html', {
          category: category,
          categoryLabel: categorySwitchingData[category].LABEL,
          data: this._convertData(data),
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      });
  }
}

export default TestCustomerSvcInfoNotice;

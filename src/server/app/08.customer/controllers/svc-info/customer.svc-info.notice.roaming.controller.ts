/**
 * FileName: customer.svc-info.notice.roaming.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../../types/string.type';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import sanitizeHtml from 'sanitize-html';

class CustomerSvcInfoNoticeRoaming extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param resultData
   * @private
   */
  private _convertData(resultData): any {
    return {
      total: resultData.total,
      remain: this._getRemainCount(resultData.totalElements, resultData.pageable.pageNumber, resultData.pageable.pageSize),
      list: resultData.content.map(item => {
        return Object.assign(item, {
          date: DateHelper.getShortDateWithFormat(item.rgstDt, 'YYYY.M.DD.'),
          type: FormatHelper.isEmpty(item.ctgNm) ? '' : item.ctgNm,
          itemClass: (item.isTop ? 'impo ' : '') + (item.isNew ? 'new' : ''),
          content: sanitizeHtml(item.content)
        });
      }),
      last: resultData.last
    };
  }

  private _getRemainCount(total, page, pageSize): any {
    const count = total - ((++page) * pageSize);
    return count < 0 ? 0 : count;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      title: CUSTOMER_NOTICE_CATEGORY.ROAMING
    };

    this.apiService.request(API_CMD.BFF_08_0040, { page: 0, size: 20 })
      .subscribe((data) => {
        if (data.code !== API_CODE.CODE_00) {
          return this.error.render(res, renderCommonInfo);
        }

        res.render('svc-info/customer.svc-info.notice.html', Object.assign(renderCommonInfo, {
          category: 'roaming',
          categoryLabel: CUSTOMER_NOTICE_CATEGORY.ROAMING,
          data: this._convertData(data.result)
        }));
      });
  }
}

export default CustomerSvcInfoNoticeRoaming;

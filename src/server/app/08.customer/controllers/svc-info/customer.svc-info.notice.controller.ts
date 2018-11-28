/**
 * FileName: customer.svc-info.notice.tworld.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.19
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../../types/string.type';
import { CUSTOMER_NOTICE_CTG_CD } from '../../../../types/bff.type';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import sanitizeHtml from 'sanitize-html';

class CustomerSvcInfoNoticeTworld extends TwViewController {
  constructor() {
    super();
  }

  private _category;
  private _allowedCategoryList = ['tworld', 'directshop', 'membership', 'roaming'];
  private _categoryApis = {
    tworld: API_CMD.BFF_08_0029,
    directshop: API_CMD.BFF_08_0039,
    membership: API_CMD.BFF_08_0031,
    roaming: API_CMD.BFF_08_0040
  };

  /**
   * @param resultData
   * @private
   */
  private _convertData(resultData): any {
    return {
      remain: this._getRemainCount(resultData.totalElements, resultData.pageable.pageNumber, resultData.pageable.pageSize),
      list: this._convertListItem(resultData.content)
    };
  }

  /**
   * @param content
   * @private
   */
  private _convertListItem(content) {
    return content.map(item => {
      if (this._category === 'tworld') {
        return Object.assign(item, {
          title: item.ntcTitNm,
          date: DateHelper.getShortDateWithFormat(item.auditDtm, 'YYYY.M.DD'),
          type: FormatHelper.isEmpty(CUSTOMER_NOTICE_CTG_CD[item.ntcCtgCd]) ? '' : CUSTOMER_NOTICE_CTG_CD[item.ntcCtgCd],
          itemClass: (item.ntcTypCd === 'Y' ? 'impo ' : '') + (item.new ? 'new' : '')
        });
      }

      return Object.assign(item, {
        date: DateHelper.getShortDateWithFormat(item.rgstDt, 'YYYY.M.DD.'),
        type: FormatHelper.isEmpty(item.ctgNm) ? '' : item.ctgNm,
        itemClass: (item.isTop ? 'impo ' : '') + (item.isNew ? 'new' : ''),
        content: sanitizeHtml(item.content)
      });
    });
  }

  /**
   * @private
   */
  private _getReqParams(): any {
    let params = { page: 0, size: 20 };

    if (this._category === 'tworld') {
      params = Object.assign({ expsChnlCd: 'M' }, params);
    }

    return params;
  }

  /**
   * @param total
   * @param page
   * @param pageSize
   * @private
   */
  private _getRemainCount(total, page, pageSize): any {
    const count = total - ((++page) * pageSize);
    return count < 0 ? 0 : count;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const renderCommonInfo = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      title: CUSTOMER_NOTICE_CATEGORY.TWORLD
    };

    this._category = req.query.category || 'tworld';
    if (FormatHelper.isEmpty(this._category) || this._allowedCategoryList.indexOf(this._category) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(this._categoryApis[this._category], this._getReqParams())
      .subscribe((data) => {
        if (data.code !== API_CODE.CODE_00) {
          return this.error.render(res, renderCommonInfo);
        }

        res.render('svc-info/customer.svc-info.notice.html', Object.assign(renderCommonInfo, {
          category: this._category,
          categoryLabel: CUSTOMER_NOTICE_CATEGORY[this._category.toUpperCase()],
          data: this._convertData(data.result)
        }));
      });
  }
}

export default CustomerSvcInfoNoticeTworld;

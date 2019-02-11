/**
 * FileName: customer.svc-info.notice.controller.ts
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
import BrowserHelper from '../../../../utils/browser.helper';

class CustomerSvcInfoNotice extends TwViewController {
  constructor() {
    super();
  }

  private _category;
  private _allowedCategoryList = ['tworld', 'directshop', 'membership', 'roaming'];
  private _baseUrl = '/customer/svc-info/notice';
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
          date: DateHelper.getShortDateWithFormat(item.fstRgstDtm, 'YYYY.M.DD.'),
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
  private _getReqParams(page: any, tworldChannel: any): any {
    let params = {
      page: (page - 1) < 0 ? 0 : page - 1,
      size: 20
    };

    if (this._category === 'tworld') {
      params = Object.assign({
        expsChnlCd: tworldChannel
      }, params);
    }

    return params;
  }

  /**
   * @param isAndroid
   * @param isIos
   * @private
   */
  private _getTworldChannel(isAndroid, isIos): any {
    if (isAndroid) {
      return 'A';
    }

    if (isIos) {
      return 'I';
    }

    return 'M';
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

  /**
   * @param uri
   * @param itemLengthPerPage
   * @param pagesetLength
   * @param curPage
   * @param total
   * @private
   */
  private _getPaging(uri: string, itemLengthPerPage: number, pagesetLength: number, curPage: number, total: number): any {
    const startNum = (Math.floor((curPage - 1) / pagesetLength) * pagesetLength) + 1;
    const totalPage = Math.ceil((total / itemLengthPerPage));
    const totalPageset = Math.ceil(totalPage / pagesetLength);
    const currentPageset = Math.floor((curPage - 1) / pagesetLength) + 1;
    const endNum = currentPageset < totalPageset ? startNum + pagesetLength - 1 : totalPage;
    const prevPageIdx = currentPageset > 0 ? ((currentPageset - 1) * pagesetLength) : null;
    const nextPageIdx = totalPageset > currentPageset ? (currentPageset * pagesetLength) + 1 : null;
    const needPaging = total > itemLengthPerPage;
    return {
      needPaging,
      uri,
      startNum,
      endNum,
      curPage,
      total,
      prevPageIdx,
      nextPageIdx
    };
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const page = req.query.page || 1,
      ntcId = req.query.ntcId || null,
      renderCommonInfo = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      title: CUSTOMER_NOTICE_CATEGORY.TWORLD
    };

    this._category = req.query.category || 'tworld';

    if (FormatHelper.isEmpty(this._category) || this._allowedCategoryList.indexOf(this._category) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    const tworldChannel: any = this._category === 'tworld' ? this._getTworldChannel(BrowserHelper.isAndroid(req), BrowserHelper.isIos(req)) : null;

    this.apiService.request(this._categoryApis[this._category], this._getReqParams(page, tworldChannel))
      .subscribe((data) => {
        if (data.code !== API_CODE.CODE_00) {
          return this.error.render(res, renderCommonInfo);
        }

        res.render('svc-info/customer.svc-info.notice.html', Object.assign(renderCommonInfo, {
          ntcId: ntcId,
          category: this._category,
          categoryLabel: CUSTOMER_NOTICE_CATEGORY[this._category.toUpperCase()],
          data: this._convertData(data.result),
          paging: this._getPaging(this._baseUrl, 20, 5, page, data.result.totalElements),
          tworldChannel: tworldChannel
        }));
      });
  }
}

export default CustomerSvcInfoNotice;

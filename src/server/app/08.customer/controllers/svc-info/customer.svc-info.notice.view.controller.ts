/**
 * FileName: customer.svc-info.notice.view.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.01.17
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

class CustomerSvcInfoNoticeView extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param resultData
   * @private
   */
  private _convertData(resultData): any {
    return Object.assign(resultData, {
      date: DateHelper.getShortDateWithFormat(resultData.fstRgstDtm, 'YYYY.M.DD'),
      type: FormatHelper.isEmpty(CUSTOMER_NOTICE_CTG_CD[resultData.ntcCtgCd]) ? '' : CUSTOMER_NOTICE_CTG_CD[resultData.ntcCtgCd],
      content: sanitizeHtml(resultData.ntcCtt)
    });
  }

  /**
   * @param isAndroid
   * @param isIos
   * @private
   */
  private _getChannel(isAndroid, isIos): any {
    if (isAndroid) {
      return 'A';
    }

    if (isIos) {
      return 'I';
    }

    return 'M';
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const ntcId = req.query.ntcId || null,
      renderCommonInfo = {
        svcInfo: svcInfo,
        pageInfo: pageInfo,
        title: CUSTOMER_NOTICE_CATEGORY.VIEW
      };

    if (FormatHelper.isEmpty(ntcId)) {
      return this.error.render(res, renderCommonInfo);
    }

    this.apiService.request(API_CMD.BFF_08_0029, {
      expsChnlCd: this._getChannel(BrowserHelper.isAndroid(req), BrowserHelper.isIos(req)),
      ntcId: ntcId
    }).subscribe((data) => {
      if (data.code !== API_CODE.CODE_00) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: data.code,
          msg: data.msg
        }));
      }

      res.render('svc-info/customer.svc-info.notice.view.html', Object.assign(renderCommonInfo, {
        ntcId: ntcId,
        data: this._convertData(data.result)
      }));
    });
  }
}

export default CustomerSvcInfoNoticeView;

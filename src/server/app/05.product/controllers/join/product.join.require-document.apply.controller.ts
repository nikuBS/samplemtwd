/**
 * FileName: product.join.require-document.apply.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.08
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

class ProductJoinRequireDocumentApply extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @param requireDocumentInfo
   * @private
   */
  private _converRequireDocumentInfo(requireDocumentInfo: any): any {
    return Object.assign(requireDocumentInfo, {
      opDtm: FormatHelper.isEmpty(requireDocumentInfo.opDtm) ? null :
        DateHelper.getShortDateWithFormat(requireDocumentInfo.opDtm, 'YYYY.MM.DD'),
      nextDistbDt: FormatHelper.isEmpty(requireDocumentInfo.nextDistbDt) ? null :
        DateHelper.getShortDateWithFormat(requireDocumentInfo.nextDistbDt, 'YYYY.MM.DD')
    });
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    this.apiService.request(API_CMD.BFF_10_0078, {})
      .subscribe((requireDocumentInfo) => {
        if (requireDocumentInfo.code !== API_CODE.CODE_00) {
          return this.error.render(res, {
            svcInfo: svcInfo,
            code: requireDocumentInfo.code,
            msg: requireDocumentInfo.msg,
            title: '구비서류 제출'
          });
        }

        res.render('join/product.join.require-document.apply.html', {
          requireDocumentInfo: this._converRequireDocumentInfo(requireDocumentInfo.result),
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      });
  }
}

export default ProductJoinRequireDocumentApply;

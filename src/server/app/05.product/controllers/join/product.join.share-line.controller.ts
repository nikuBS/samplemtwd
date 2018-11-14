/**
 * 모바일 요금제 > Ttab 공유회선
 * FileName: product.join.share-line.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import BrowserHelper from '../../../../utils/browser.helper';
import ProductHelper from '../../helper/product.helper';

class ProductJoinShareLine extends TwViewController {
  constructor() {
    super();
  }

  private readonly _allowedProdIdList = ['NA00005057', 'NA00005058', 'NA00005059', 'NA00005060',
    'NA00003958', 'NA00003557', 'NA00003558', 'NA00003556', 'NA00005057'];

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const prodId = req.params.prodId || null,
      renderCommonInfo = {
        pageInfo: pageInfo,
        svcInfo: svcInfo,
        title: '가입'
      };

    if (FormatHelper.isEmpty(prodId) || this._allowedProdIdList.indexOf(prodId) === -1) {
      return this.error.render(res, renderCommonInfo);
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, { prodExpsTypCd: 'P' }, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0008, {}, {}, prodId),
      this.apiService.request(API_CMD.BFF_10_0009, {})
    ).subscribe(([ basicInfo, joinTermInfo, overPayReqInfo ]) => {
      const apiError = this.error.apiError([basicInfo, joinTermInfo]);

      if (!FormatHelper.isEmpty(apiError)) {
        return this.error.render(res, Object.assign(renderCommonInfo, {
          code: apiError.code,
          msg: apiError.msg
        }));
      }

      res.render('join/product.join.share-line.html', Object.assign(renderCommonInfo, {
        prodId: prodId,
        basicInfo: basicInfo.result,
        joinTermInfo: ProductHelper.convPlansJoinTermInfo(joinTermInfo.result),
        isOverPayReqYn: overPayReqInfo.code === API_CODE.CODE_00 ? 'Y' : 'N',
        isApp: BrowserHelper.isApp(req)
      }));
    });
  }
}

export default ProductJoinShareLine;

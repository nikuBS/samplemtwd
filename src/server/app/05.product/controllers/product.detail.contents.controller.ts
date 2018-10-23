/**
 * FileName: product.detail.contents.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class ProductDetailContents extends TwViewController {
  constructor() {
    super();
  }

  private _convertContentInfo(contentsInfo): any {
    const contentsResultList: any = [];

    contentsInfo.forEach((item) => {
      if (item.ledStylCd !== 'LE') {
        return true;
      }

      contentsResultList.push({
        briefTitNm: item.briefTitNm,
        ledDtlHtmlCtt: item.ledDtlHtmlCtt,
        vslClass: FormatHelper.isEmpty(item.vslYn) ? null : (item.vslYn === 'Y' ? 'prCont' : 'plm')
      });
    });

    return contentsResultList;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    const prodId = req.params.prodId;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        title: '상품 상세보기',
        svcInfo: svcInfo
      });
    }

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0001, {}, {}, prodId),
      this.redisService.getData('ProductLedger:' + prodId)
    ).subscribe(([ basicInfo, prodRedisInfo ]) => {
      if (basicInfo.code !== API_CODE.CODE_00) {
        return this.error.render(res, {
          code: basicInfo.code,
          msg: basicInfo.msg,
          svcInfo: svcInfo,
          title: '상품 상세보기'
        });
      }

      if (['F1000', 'E1000'].indexOf(basicInfo.result.prodStCd) === -1) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          title: '상품 전체보기'
        });
      }

      if (FormatHelper.isEmpty(prodRedisInfo)) {
        return this.error.render(res, { svcInfo: svcInfo });
      }

      res.render('product.detail.contents.html', {
        svcInfo: svcInfo,
        contentsInfo: this._convertContentInfo(prodRedisInfo.contents)
      });
    });
  }
}

export default ProductDetailContents;

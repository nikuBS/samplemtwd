/**
 * FileName: product.detail.contents.controller.ts
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import FormatHelper from '../../../utils/format.helper';
import { API_CMD } from '../../../types/api-command.type';

interface IContents {
  svcBriefHtmlCtt?: string; // 서비스 개요
  useFeeBenfHtmlDesc?: string;  // 이용 요금 혜택
  chnlScrbTermDesc?: string;  // 채널별 가입해지
  scrbTermAttdmHtmlDesc?: string; // 가입해지유의사항
  faqCtt?: string;  // FAQ
  prodUseMthdHtmlDesc?: string;  // 상품 이용방법
}

class ProductDetailContents extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    const prodId = req.params.prodId;

    if (FormatHelper.isEmpty(prodId)) {
      return this.error.render(res, {
        title: '상품 상세보기',
        svcInfo: svcInfo
      });
    }

    this.apiService.request(API_CMD.BFF_10_0004, {}, {}, prodId)
      .subscribe((resp) => {
        const apiError = this.error.apiError([resp]);

        if (!FormatHelper.isEmpty(apiError)) {
          return this.error.render(res, {
            svcInfo: svcInfo,
            title: '상품 상세보기',
            code: apiError.code,
            msg: apiError.msg
          });
        }

        const contents: IContents = {
          svcBriefHtmlCtt: resp.result.svcBriefHtmlCtt,
          useFeeBenfHtmlDesc: resp.result.useFeeBenfHtmlDesc,
          chnlScrbTermDesc: resp.result.chnlScrbTermDesc,
          scrbTermAttdmHtmlDesc: resp.result.scrbTermAttdmHtmlDesc,
          faqCtt: resp.result.faqCtt,
          prodUseMthdHtmlDesc: resp.result.prodUseMthdHtmlDesc
        };

        res.render('product.detail.contents.html', {
          svcInfo: svcInfo,
          contents: contents
        });
      });
  }
}

export default ProductDetailContents;

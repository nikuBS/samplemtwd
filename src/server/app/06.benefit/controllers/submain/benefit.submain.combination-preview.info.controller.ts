/**
 * MenuName: 상품 > 결합상품 개별페이지 > 요금절약 예시보기
 * FileName: benefit.submain.combination-preview.info.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.11.23
 * Summary: 요금절약 예시보기
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {NextFunction, Request, Response} from 'express';

class BenefitSubmainCombinationPreviewInfo extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    res.render('submain/benefit.submain.combination-preview.info.html', {
      svcInfo,
      pageInfo
    });
  }
}

export default BenefitSubmainCombinationPreviewInfo;

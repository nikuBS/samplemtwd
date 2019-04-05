/**
 * 이용안내 > 이용자피해예방센터 > 이용자 피해예방 가이드 > 웹툰 (상세)
 * @file customer.damage-info.guide.webtoon.view.controller.ts
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.10.24
 */

import { NextFunction, Request, Response } from 'express';
import { CUSTOMER_PROTECT_GUIDE_WEBTOON } from '../../../../types/static.type';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import FormatHelper from '../../../../utils/format.helper';

class CustomerDamageInfoGuideWebtoonView extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const idx = req.query.idx || '';  // 웹툰 인덱스 키 받아옴

    // 키값이 없거나, 키값은 왔는데 그 키에 해당하는 게시물이 없을 경우 목록으로 연결
    if (FormatHelper.isEmpty(idx) || FormatHelper.isEmpty(CUSTOMER_PROTECT_GUIDE_WEBTOON[idx])) {
      return res.redirect('/customer/damage-info/guide?category=webtoon');
    }

    res.render('damage-info/customer.damage-info.guide.webtoon-view.html', {
      svcInfo: svcInfo, // 사용자 정보
      pageInfo: pageInfo, // 페이지 정보
      data: CUSTOMER_PROTECT_GUIDE_WEBTOON[idx] // 웹툰 게시물 정보
    });
  }
}

export default CustomerDamageInfoGuideWebtoonView;

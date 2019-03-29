/**
 * MenuName: T멤버십 > 제휴브랜드 > 전체보기
 * FileName: membership.benefit.brand.list.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
 * Summary: 가맹점 지역별 조회화면으로 이동
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class MembershipBenefitBrandList extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, child: any, pageInfo: any) {

    if ( !req.query.brandNm || !req.query.brandCd ) {

      this.error.render(res, {
        code: '',
        msg: 'not found brand name or brand code',
        pageInfo: pageInfo,
        svcInfo
      });
      return;
    }

    // Mocked resposne
    const data = {
      brandCd : req.query.brandCd ,   // 2012001524 파리바게트(임시)
      brandNm : req.query.brandNm,    // 파리바게트(임시)
      area: req.query.area || ''   // 지역이 있는 경우
    };

    res.render('benefit/membership.benefit.brand.list.html', {
      svcInfo,
      pageInfo,
      data
    });
  }

}

export default MembershipBenefitBrandList;

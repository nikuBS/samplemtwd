/**
 * MenuName: T멤버십 > 제휴브랜드 > 혜택보기
 * @file membership.benefit.brand-benefit.controller.ts
 * @author Hakjoon sim (hakjoon.sim@sk.com)
 * @since 2018.11.06
 * Summary: 제휴브랜드의 혜택 조회
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';

class MembershipBenefitBrandBenefit extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    if ( !req.query.brandCd ) {

      this.error.render(res, {
        code: '',
        msg: 'not found brand code',
        pageInfo: pageInfo,
        svcInfo
      });
      return;
    }

    const brandCd = req.query.brandCd;    // '2012001524' 파리바게트

    const param = {
      brandCd : brandCd
    };


    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_11_0018, param),      // 혜택조회
      this.apiService.request(API_CMD.BFF_03_0021, {})   // 위치동의여부 조회
    ).subscribe(([resp1, resp2]) => {

      if ( resp1.code === API_CODE.CODE_00 ) {

        const data = resp1.result;
        if ( data.totLikeCount ) {
          data['totLikeCount'] = FormatHelper.addComma(data.totLikeCount);
          data['myLike'] = (data.myLikeCount && data.myLikeCount !== '0');
        }

        data['loginYn'] = (svcInfo ? 'Y' : 'N');  // 로그인 여부
        data['locAgreeYn'] = 'N';   // 위치동의 여부

        // 위치동의 조회
        if ( resp2.code === API_CODE.CODE_00 ) {
          data['locAgreeYn'] = resp2.result.twdLocUseAgreeYn;
        }

        this.goView(res, svcInfo, pageInfo, data);
      }
    });

  }

  /**
   * 화면으로 이동
   * @param res
   * @param svcInfo
   * @param pageInfo
   * @param data
   */
  private goView(res: Response, svcInfo: any, pageInfo: any, data: any) {

    if(data.cateCd === '49' && data.brandCd === '2012003539' && data.loginYn === "N"){  // 제휴 브랜드 중 레저큐 이면서 미 로그인 일때 로그인 페이지로 리다이렉트
      res.redirect('/common/tid/login?target=/membership/benefit/brand-benefit?cateCd=49&brandCd=2012003539');
    }

    res.render('benefit/membership.benefit.brand-benefit.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      data: data
    });
  }
}

export default MembershipBenefitBrandBenefit;

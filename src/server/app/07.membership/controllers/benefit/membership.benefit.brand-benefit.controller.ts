/**
 * FileName: membership.benefit.brand-benefit.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
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
      this.apiService.request(API_CMD.BFF_11_0018, param),
      this.apiService.request(API_CMD.BFF_03_0021, {})
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

    res.render('benefit/membership.benefit.brand-benefit.html', {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      data: data
    });
  }
}

export default MembershipBenefitBrandBenefit;

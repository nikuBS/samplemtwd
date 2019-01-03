/**
 * FileName: membership.benefit.brand-benefit.controller.ts
 * Author: Hakjoon sim (hakjoon.sim@sk.com)
 * Date: 2018.11.06
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';

class MembershipBenefitBrandBenefit extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    if ( !req.query.cateCd || !req.query.brandCd ) {

      this.error.render(res, {
        code: '',
        msg: 'not found category or brand code',
        svcInfo
      });
      return;
    }

    const cateCd = req.query.cateCd;              // '3' 베이커리
    const brandCd = req.query.brandCd;    // '2012001524' 파리바게트

    const param = {
      brandCd : brandCd
    };

    this.apiService.request(API_CMD.BFF_11_0018, param).subscribe(
      (resp) => {


        if ( resp.code === API_CODE.CODE_00 ) {

          const data = resp.result;
          data.totLikeCount = FormatHelper.addComma(data.totLikeCount);
          data.myLike = ( data.myLikeCount !== '0' );
          // data.coBenefitDtl = unescape(data.coBenefitDtl);

          data.cateCd = cateCd;
          data.brandCd = brandCd;

          res.render('benefit/membership.benefit.brand-benefit.html', {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            data: data
          });

        } else {

          this.error.render(res, {
            code: resp.code,
            msg: resp.smg,
            svcInfo
          });
        }
      },
    (err) => {
      this.error.render(res, {
        code: err.code,
        msg: err.smg,
        svcInfo
      });
    });
  }
}

export default MembershipBenefitBrandBenefit;

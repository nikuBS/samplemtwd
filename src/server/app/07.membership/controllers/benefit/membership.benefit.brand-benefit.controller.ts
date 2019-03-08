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

    this.apiService.request(API_CMD.BFF_11_0018, param).subscribe(
      (resp) => {

        if ( resp.code === API_CODE.CODE_00 ) {

          const data = resp.result;
          if ( data.totLikeCount ) {
            data['totLikeCount'] = FormatHelper.addComma(data.totLikeCount);
            data['myLike'] = ( data.myLikeCount && data.myLikeCount !== '0' );
          }

          res.render('benefit/membership.benefit.brand-benefit.html', {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            data: data
          });

        } else {

          this.error.render(res, {
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo
          });
        }
      },
    (err) => {
      this.error.render(res, {
        code: err.code,
        msg: err.msg,
        pageInfo: pageInfo,
        svcInfo
      });
    });
  }
}

export default MembershipBenefitBrandBenefit;

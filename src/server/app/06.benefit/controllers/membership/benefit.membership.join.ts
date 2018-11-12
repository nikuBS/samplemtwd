/*
 * FileName: benefit.membership.join.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.25
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { CUSTOMER_NOTICE_CATEGORY } from '../../../../types/string.type';

class BenefitMembershipJoin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };
    const createInfo: any = this._getMembershipCreateCheck();
    if (createInfo) {
      // 스마트폰 구분 코드
      if ( true /*createInfo.result.mblCardPsblEqpYn && createnfo.result.mblCardPsblEqpYn === 'Y'*/) {
        // Corporate
        data.type = 'corporate';
      } else {
        // Feature phone
        data.type = 'feature';
        data.isFeature = true;
      }
      data.createInfo = createInfo;
      res.render('membership/benefit.membership.join.html', { data });
    } else {
      return this.error.render(res, {
        title: CUSTOMER_NOTICE_CATEGORY.MEMBERSHIP,
        code: createInfo.code,
        msg: createInfo.msg,
        svcInfo: svcInfo
      });
    }
  }

  _getMembershipCreateCheck() {
    return this.apiService.request(API_CMD.BFF_11_0015, {}).map((createInfo) => {
      if (createInfo.code === API_CODE.CODE_00) {
        return createInfo.result;
      } else {
        return null;
      }
    });
  }
}


export default BenefitMembershipJoin;

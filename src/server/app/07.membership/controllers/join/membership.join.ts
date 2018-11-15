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

class MembershipJoin extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo
    };
    this.apiService.request(API_CMD.BFF_11_0015, {}).subscribe((createInfo) => {
      if ( createInfo.code === API_CODE.CODE_00 ) {
        // 스마트폰 구분 코드
        if ( createInfo.result.mblCardPsblEqpYn && createInfo.result.mblCardPsblEqpYn === 'Y' ) {
          // Corporate
          data.type = 'corporate';
        } else {
          // Feature phone
          data.type = 'feature';
          data.isFeature = true;
        }
        data.createInfo = createInfo.result;
        // 법인 폰 여부
        if ( svcInfo.svcGr === 'R' || svcInfo.svcGr === 'D' || svcInfo.svcGr === 'E' ) {
          data.isCorporateBody = true;
        }
        // 본인 명의 폰 여부
        if (svcInfo.svcGr === 'A' || svcInfo.svcGr === 'Y') {
          data.isIndividual = true;
        }

        res.render('membership/benefit.membership.join.html', { data });
      } else {
        return this.error.render(res, {
          title: CUSTOMER_NOTICE_CATEGORY.MEMBERSHIP,
          code: createInfo.code,
          msg: createInfo.msg,
          svcInfo: svcInfo
        });
      }
    });
  }
}


export default MembershipJoin;

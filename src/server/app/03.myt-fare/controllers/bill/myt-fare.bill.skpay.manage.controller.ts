/**
 * @file myt-fare.bill.skpay.manage.controller.ts
 * @file [설정 - SK pay 관리]
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {MYT_PAYMENT_SKPAY_MANAGE} from '../../../../types/string.type';

/**
 * SK pay 관리
 */
class MyTFareBillSkpayManage extends TwViewController {
  constructor() {
    super();
  }

  renderURL: string = 'bill/myt-fare.bill.skpay.manage.html'; // 렌더링할 file 이름
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    res.render(this.renderURL, {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      data: {
        headerTitle: MYT_PAYMENT_SKPAY_MANAGE.DI
      }
    });
  }
}

export default MyTFareBillSkpayManage;

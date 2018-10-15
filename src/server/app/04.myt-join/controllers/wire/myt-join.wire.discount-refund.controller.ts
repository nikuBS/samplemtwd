/**
 * FileName: myt-join.wire.discount-refund.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';


class MyTJoinWireDiscountRefund extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    console.log('============ call BFF_05_0158 ==============');
    // svcMgmtNum
    this.apiService.request(API_CMD.BFF_05_0158, { requestPage: '1' })
      .subscribe((resp) => {
        const resp1 = {
          'code': '00',
          'msg': 'success',
          'result': {
            'reqDate': '20180927',
            'penaltyInfo': [
              { 'penStrdNm': '홈결합세트_인터넷 할인반환금',  // 할인반환금명
                'brchAmt': '406'                        // 할인반환 금액
              }
            ],
            'chargeInfo':
              { 'hbAmt': '35350',  // 당월 사용 요금(할인 반환금 포함)
                'colAmt': '0',     // 미납 요금
                'totAmt': '35350'  // 총 납부금액(당월사용요금+미납요금)
              }
          }
        };

        if ( resp1.code === API_CODE.CODE_00 ) {
          console.log('============ result ==============');
          const option = { svcInfo: svcInfo, data: resp1.result};

          res.render('wire/myt-join.wire.discount-refund.html', {});
        }
      });
  }
}

export default MyTJoinWireDiscountRefund;


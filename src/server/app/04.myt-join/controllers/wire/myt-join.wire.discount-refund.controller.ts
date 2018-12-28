/**
 * FileName: myt-join.wire.discount-refund.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { MYT_JOIN_WIRE } from '../../../../types/string.type';


class MyTJoinWireDiscountRefund extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.DISC_REFUND.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }

    this.apiService.request(API_CMD.BFF_05_0158, {})
      .subscribe((resp) => {

        /*const resp = {
          'code': '00',
          'msg': 'success',
          'result': {
            'reqDate': '20180927',
            'penaltyInfo': [
              { 'penStrdNm': '홈결합세트_인터넷 할인반환금',
                'brchAmt': '406'
              }
            ],
            'chargeInfo':
              { 'hbAmt': '35350',
                'colAmt': '0',
                'totAmt': '35350'
              }
          }
        };*/

        if ( resp.code === API_CODE.CODE_00 ) {

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, reqDate: DateHelper.getShortDateNoDot(resp.result.reqDate) };
          res.render('wire/myt-join.wire.discount-refund.html', option);

        } else if ( resp.code === 'ZINVE8888' ) {
          const option = { svcInfo: svcInfo, pageInfo: pageInfo, reqDate: DateHelper.getShortDateNoDot(new Date()) };
          res.render('wire/myt-join.wire.discount-refund.html', option);

        } else {
          return this.error.render(res, {
            title: MYT_JOIN_WIRE.DISC_REFUND.TITLE,
            code: resp.code,
            msg: resp.msg,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: MYT_JOIN_WIRE.DISC_REFUND.TITLE,
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
        });
      });

  }
}

export default MyTJoinWireDiscountRefund;


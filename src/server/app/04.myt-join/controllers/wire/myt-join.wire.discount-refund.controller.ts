/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 할인 반환금 조회(MS_04_01_05)
 * @file myt-join.wire.discount-refund.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 할인 반환금 화면 controller
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

    // 서버 api로 기준날짜를 받아오려고 했지만 서버 오류 등으로 기준날짜를 오늘 날짜로 고정해서 화면 출력
    const option = { svcInfo: svcInfo, pageInfo: pageInfo, reqDate: DateHelper.getShortDate(new Date()) };
    res.render('wire/myt-join.wire.discount-refund.html', option);

    // this.apiService.request(API_CMD.BFF_05_0158, {})
    //   .subscribe((resp) => {

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
      //
      //   if ( resp.code === API_CODE.CODE_00 ) {
      //
      //     const option = { svcInfo: svcInfo, pageInfo: pageInfo, reqDate: DateHelper.getShortDateNoDot(resp.result.reqDate) };
      //     res.render('wire/myt-join.wire.discount-refund.html', option);
      //
      //   } else if ( resp.code === 'ZINVE8888' ) {
      //     const option = { svcInfo: svcInfo, pageInfo: pageInfo, reqDate: DateHelper.getShortDateNoDot(new Date()) };
      //     res.render('wire/myt-join.wire.discount-refund.html', option);
      //
      //   } else {
      //     return this.error.render(res, {
      //       title: MYT_JOIN_WIRE.DISC_REFUND.TITLE,
      //       code: resp.code,
      //       msg: resp.msg,
      //       svcInfo: svcInfo
      //     });
      //   }
      // }, (resp) => {
      //   return this.error.render(res, {
      //     title: MYT_JOIN_WIRE.DISC_REFUND.TITLE,
      //     code: resp.code,
      //     msg: resp.msg,
      //     svcInfo: svcInfo
      //   });
      // });

  }
}

export default MyTJoinWireDiscountRefund;


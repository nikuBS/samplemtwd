/**
 * MenuName: 나의 가입정보 > 서브메인(인터넷/집전화/IPTV 회선) > 인터넷 전화 번호이동 신청 현황(MS_04_01_02)
 * @file myt-join.wire.netphone-num.change.controller.ts
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷 전화 번호이동 신청 현황 화면으로 이동
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_JOIN_WIRE } from '../../../../types/string.type';


class MyTJoinWireInetPhoneNumChange extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.NETPHONE_CHANGE.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }
    res.render('wire/myt-join.wire.inetphone-num.change.html', {svcInfo: svcInfo, pageInfo: pageInfo});
  }
}

export default MyTJoinWireInetPhoneNumChange;


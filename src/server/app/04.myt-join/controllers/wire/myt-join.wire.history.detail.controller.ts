/**
 * FileName: myt-join.wire.history.detail.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';


class MyTJoinWireHistoryDetail extends TwViewController {

  // titles
  private TITLE_MAP: Object = {
    '167' : '신규가입 상세 내역',
    '162' : '설치 장소 변경 상세 내역',
    '168' : '가입 상품 변경 상세 내역',
    '143' : '약정기간 변경 상세 내역',
    '153' : '요금 상품 변경 상세 내역'
  };

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data = JSON.parse(req.query.data);
    const title = this.TITLE_MAP[data.atype];
    const options = {title: title, svcInfo: svcInfo, data: data};
    console.log('options', options);
    res.render('wire/myt-join.wire.history.detail.html', options);
  }
}

export default MyTJoinWireHistoryDetail;


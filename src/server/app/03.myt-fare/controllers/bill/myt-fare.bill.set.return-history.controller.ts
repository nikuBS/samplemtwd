/**
 * @file myt-fare.bill.set.return-history.controller.ts
 * 화면 ID : MF_04_04
 * 설명 : 나의요금 > 요금안내서 설정 > 반송내역
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018.09.12
 */
import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';

class MyTFareBillSetReturnHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('bill/myt-fare.bill.set.return-history.html', {svcInfo, pageInfo});
  }
}

export default MyTFareBillSetReturnHistory;

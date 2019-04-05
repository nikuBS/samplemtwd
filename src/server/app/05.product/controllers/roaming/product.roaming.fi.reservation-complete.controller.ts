/**
 * FileName: product.roaming.fi.reservation.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.16
*/
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { ROAMING_RECEIVE_CENTER } from '../../../../types/string.type';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingFiReservationComplete extends TwViewController {

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const selectIdx = req.query.selectIdx;
    const centerName = ROAMING_RECEIVE_CENTER[selectIdx];

    let centerImg = '';

    switch (selectIdx) {
      case '0':
        // 인천공항 1터미널 3층 로밍센터(F 카운터)
        centerImg = 'place-img-01-f';
        break;
      case '1' :
        // 인천공항 1터미널 3층 로밍센터(H 카운터)
        centerImg = 'place-img-01-h';
        break;
      case '2' :
        // 인천공항 2터미널 3층 로밍센터(D-E 카운터)
        centerImg = 'place-img-02-de';
        break;
      case '3' :
        // 김포공항 1층 로밍센터
        centerImg = 'place-img-03';
        break;
      case '4' :
        // 제주공항 국제선 1층 로밍센터
        centerImg = 'place-img-04';
        break;
      case '5' :
        // 김해공항 3층 로밍센터
        centerImg = 'place-img-05';
        break;
      case '6' :
        // 대구공항 2층 로밍센터
        centerImg = 'place-img-06';
        break;
      case '7' :
        // 대구 SKT 황금점 매장
        centerImg = 'place-img-10';
        break;
      default : break;
    }

    const data = {
      centerName,
      centerImg
    };

    res.render('roaming/product.roaming.fi.reservation-complete.html',
      { svcInfo : svcInfo , pageInfo : pageInfo, data : data });
  }
}

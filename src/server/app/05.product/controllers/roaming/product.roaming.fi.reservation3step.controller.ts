/**
 * FileName: product.roaming.fi.reservation2step.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.16
*/
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { ROAMING_RECEIVE_CENTER } from '../../../../types/string.type';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingReservation3step extends TwViewController {

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    const selectIdx = req.query.selectIdx;
    const centerName = ROAMING_RECEIVE_CENTER[selectIdx];

    let centerImg = '';
    // 이미지 추후 적용
    /*
    switch (selectIdx) {
      case '0':
        centerImg = 'place-img-01-1.jpg';
        break;
      case '1' :
        centerImg = '';
        break;
      case '2' :
        centerImg = '';
        break;
      case '3' :
        centerImg = 'place-img-03.jpg';
        break;
      case '4' :
        centerImg = '';
        break;
      case '5' :
        centerImg = 'place-img-05.jpg';
        break;
      case '6' :
        centerImg = '';
        break;
      case '7' :
        centerImg = '';
        break;
      default : break;
    }
    */

    const data = {
      centerName,
      centerImg
    };

    res.render('roaming/product.roaming.fi.reservation3step.html', { svcInfo : svcInfo , data : data });
  }
}

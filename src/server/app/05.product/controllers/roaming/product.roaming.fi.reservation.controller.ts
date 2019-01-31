/**
 * FileName: product.roaming.fi.reservation.controller.ts
 * Author: Seungkyu Kim (ksk4788@pineone.com)
 * Date: 2018.11.13
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import DateHelper from '../../../../utils/date.helper';
import moment from 'moment';
import FormatHelper from '../../../../utils/format.helper';
// import { Observable } from 'rxjs/Observable';

export default class ProductRoamingFiReservation extends TwViewController {

  render(req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
     const minDate = moment().add(2, 'days').format('YYYY-MM-DD');
     const maxDate = DateHelper.getEndOfMonSubtractDate(undefined, '-6', 'YYYY-MM-DD');
     const formatDate = { minDate, maxDate };

     svcInfo.showSvcNum =  FormatHelper.conTelFormatWithDash(svcInfo.svcNum);

     res.render('roaming/product.roaming.fi.reservation.html', { svcInfo : svcInfo , pageInfo : pageInfo, formatDate : formatDate });
  }
}

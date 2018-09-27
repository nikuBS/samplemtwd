/*
 * FileName:
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.09.27
 *
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../types/api-command.type';

class MytFareSubmainController extends TwViewController {
  constructor() {
    super();
  }


  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any) {
    const data: any = {
      svcInfo: svcInfo,
      // 다른 회선 항목
      otherLines: this.convertOtherLines(svcInfo, allSvc)
    };
    Observable.combineLatest(
      this._getClaimPays(),
      this._getNonPayment(),
      this._getPaymentInfo()
    ).subscribe(([claim, nonpayment, paymentInfo]) => {

    });

    res.render('myt-fare.submain.html', { data });
  }

  convertOtherLines(target, items): any {
    const nOthers: any = Object.assign([], items['M'], items['O'], items['S']);
    const list: any = [];
    nOthers.filter((item) => {
      if ( target.svcMgmtNum !== item.svcMgmtNum ) {
        list.push(item);
      }
    });
    return list;
  }

  _getClaimPays() {
    return this.apiService.request(API_CMD.BFF_05_0036, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.invDt.length === 0 ) {
          // no data
          return null;
        }
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  _getNonPayment() {
    return this.apiService.request(API_CMD.BFF_05_0030, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        if ( resp.result.unPaidTotSum === '0' ) {
          // no data
          return null;
        }
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }

  _getPaymentInfo() {
    return this.apiService.request(API_CMD.BFF_05_0030, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        // error
        return null;
      }
    });
  }
}

export default MytFareSubmainController;

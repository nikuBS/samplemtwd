/**
 * FileName: myt.benefit.discount.main.controller.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.08.14
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';

class MytBenefitDisCntMainController extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const data: any = {
      svcInfo: svcInfo
    };
    Observable.combineLatest(
      this._getBundleProduct(),
      this._getFeeContract(),
      this._getSubFundContract(),
      this._getSelDiscount(),
      this._getLongTerm(),
      this._getWelfareCustomer()
    ).subscribe(([bundlePrdc, feeCotc, fundCotc, selDisCnt, longterm, welfareCutm]) => {
      data.bundlePrdc = bundlePrdc;
      data.feeCotc = feeCotc;
      data.fundCotc = fundCotc;
      data.selDisCnt = selDisCnt;
      data.longterm = longterm;
      data.welfareCutm = welfareCutm;

      // TODO: 마크업이 나오면 적용필요!
      // res.render('benefit/myt.benefit.discount.main', { data });
    });
  }

  _getBundleProduct(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0094, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getFeeContract(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0106, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getSubFundContract(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0107, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getSelDiscount(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0108, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getLongTerm(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0110, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

  _getWelfareCustomer(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0111, {}).map((resp) => {
      if ( resp.code === API_CODE.CODE_00 ) {
        return resp.result;
      } else {
        return null;
      }
    });
  }

}

export default MytBenefitDisCntMainController;

/*
 * FileName: product.dis-pgm.detail.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import FormatHelper from '../../../utils/format.helper';

class ProductDisPgmDetail extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.params && req.params.prodId || '';
    const monthCode = req.query && req.query.type || '';
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      prodId: prodId
    };
    if ( prodId === 'NA00004430' ) {
      if ( monthCode === 'M0012' ) {
        data.monthNm = '12';
      } else if ( monthCode === 'M0024' ) {
        data.monthNm = '24';
      }
      data.monthCode = monthCode;

      Observable.combineLatest(
        /*this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, prodId),*/
        this.apiService.request(API_CMD.BFF_10_0062, {}, {}, prodId)
      ).subscribe(([seldisSets /*,joinTermInfo*/]) => {
        if ( seldisSets.code === API_CODE.CODE_00 ) {
          data.isContractPlan = (seldisSets.result.isNoContractPlanYn === 'Y');
          data.contractPlanPoint = FormatHelper.addComma(seldisSets.result.noContractPlanPoint);
        } else {
          return this.error.render(res, {
            code: seldisSets.code,
            msg: seldisSets.msg,
            svcInfo: svcInfo,
            title: '가입'
          });
        }
       /* if ( joinTermInfo.code === API_CODE.CODE_00 ) {
          data.preinfo = this._convertAdditionsPreInfo(joinTermInfo.preinfo);
          data.stipulationInfo = this._convertStipulationInfo(joinTermInfo.stipulationInfo);
        } else {
          return this.error.render(res, {
            code: joinTermInfo.code,
            msg: joinTermInfo.msg,
            svcInfo: svcInfo,
            title: '가입'
          });
        }*/
        res.render('product.sel-contract.detail.html', { data });
      });
    }
  }
}

export default ProductDisPgmDetail;

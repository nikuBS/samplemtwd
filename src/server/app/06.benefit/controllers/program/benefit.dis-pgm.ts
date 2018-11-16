/*
 * FileName: product.dis-pgm.join.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import ProductHelper from '../../../05.product/helper/product.helper';
import DateHelper from '../../../../utils/date.helper';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';

class BenefitDisProgram extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.params.prodId || '';
    const data: any = {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      prodId: prodId
    };

    if ( prodId === 'NA00004430' ) {
      const curDate = new Date();
      const nextDate_1 = curDate.getFullYear() + 1;
      const nextDate_2 = curDate.getFullYear() + 2;
      data.monthDetail = {
        'M0012': DateHelper.getShortDateNoDot(curDate) + ' ~ ' + DateHelper.getShortDateNoDot(nextDate_1),
        'M0024': DateHelper.getShortDateNoDot(curDate) + ' ~ ' + DateHelper.getShortDateNoDot(nextDate_2)
      };
      data.monthCode = { 'M0012': '12', 'M0024': '24' };
      Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, prodId),
        this.apiService.request(API_CMD.BFF_10_0062, {}, {}, prodId)
      ).subscribe(([joinTermInfo, seldisSets]) => {
        // 무선 선택약정 할인제도 상품 설정 조회
        if ( seldisSets.code === API_CODE.CODE_00 ) {
          data.isContractPlan = (seldisSets.result.isNoContractPlanYn === 'Y');
          data.contractPlanPoint = FormatHelper.addComma(seldisSets.result.noContractPlanPoint);
        } else {
          return this.error.render(res, {
            code: seldisSets.code,
            msg: seldisSets.msg,
            svcInfo: svcInfo,
            title: PRODUCT_TYPE_NM.JOIN
          });
        }
        if ( joinTermInfo.code === API_CODE.CODE_00 ) {
          data.joinInfoTerm = this._convertJoinInfoTerm(joinTermInfo.result);
        } else {
          return this.error.render(res, {
            code: joinTermInfo.code,
            msg: joinTermInfo.msg,
            svcInfo: svcInfo,
            title: PRODUCT_TYPE_NM.JOIN
          });
        }
        res.render('program/benefit.dis-pgm.sel-contract.html', { data });
      });
    } else {
      // NA00002079 (2년이상), NA00002082(3년이상), NA00002080(5년이상), NA00002081(10년이상), NA00002246(2년미만)
      Observable.combineLatest(
        this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, prodId),
        this.apiService.request(API_CMD.BFF_10_0081, {}, {}, prodId),
      ).subscribe(([joinTermInfo, tplusInfo]) => {
        if ( tplusInfo.code === API_CODE.CODE_00 ) {
          data.percent = tplusInfo.result.discountRate;
          data.isJoin = (tplusInfo.result.subscriptionCode === 'Y');
        } else {
          return this.error.render(res, {
            code: tplusInfo.code,
            msg: tplusInfo.msg,
            svcInfo: svcInfo,
            title: PRODUCT_TYPE_NM.JOIN
          });
        }

        if ( joinTermInfo.code === API_CODE.CODE_00 ) {
          data.joinInfoTerm = this._convertJoinInfoTerm(joinTermInfo.result);
        } else {
          return this.error.render(res, {
            code: joinTermInfo.code,
            msg: joinTermInfo.msg,
            svcInfo: svcInfo,
            title: PRODUCT_TYPE_NM.JOIN
          });
        }
        res.render('program/benefit.dis-pgm.t-plus.html', { data });
      });
    }
  }

  _convertJoinInfoTerm(joinTermInfo) {
    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }
}

export default BenefitDisProgram;


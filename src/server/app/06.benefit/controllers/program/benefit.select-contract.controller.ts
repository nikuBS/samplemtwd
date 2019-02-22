/*
 * FileName: benefit.select-contract.ts
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.22
 *
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { Observable } from 'rxjs/Observable';
import ProductHelper from '../../../../utils/product.helper';
import DateHelper from '../../../../utils/date.helper';
import { PRODUCT_TYPE_NM } from '../../../../types/string.type';

class BenefitSelectContractController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    const prodId = req.query.prod_id || '', selType = req.query.type || null;
    const data: any = {
      svcInfo: Object.assign(svcInfo, { svcNumDash: FormatHelper.conTelFormatWithDash(svcInfo.svcNum) }),
      pageInfo: pageInfo,
      prodId: prodId,
      selType: selType
    };

    const curDate = new Date();
    const nextDate_1 = new Date(curDate.getFullYear() + 1, curDate.getMonth(), curDate.getDate() - 1);
    const nextDate_2 = new Date(curDate.getFullYear() + 2, curDate.getMonth(), curDate.getDate() - 1);
    data.monthDetail = {
      'M0012': DateHelper.getShortDateNoDot(curDate) + ' ~ ' + DateHelper.getShortDateNoDot(nextDate_1),
      'M0024': DateHelper.getShortDateNoDot(curDate) + ' ~ ' + DateHelper.getShortDateNoDot(nextDate_2)
    };
    data.monthCode = { 'M0012': '12', 'M0024': '24' };
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_10_0119, {}, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0017, { joinTermCd: '01' }, {}, [prodId]),
      this.apiService.request(API_CMD.BFF_10_0062, {}, {}, [prodId])
    ).subscribe(([scrbCheck, joinTermInfo, seldisSets]) => {
      // 상품이 현재 이용중인지 미가입중인지 체크
      if (scrbCheck.code === API_CODE.CODE_00) {
        if (scrbCheck.result.combiProdScrbYn === 'Y') {
          return this.error.render(res, {
            code: scrbCheck.code,
            msg: '',
            pageInfo: pageInfo,
            svcInfo: svcInfo,
            title: PRODUCT_TYPE_NM.JOIN,
            isBackCheck: true
          });
        }
      } else {
        return this.error.render(res, {
          code: scrbCheck.code,
          msg: scrbCheck.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN
        });
      }

      // 무선 선택약정 할인제도 상품 설정 조회
      if ( seldisSets.code === API_CODE.CODE_00 ) {
        data.isContractPlan = (seldisSets.result.isNoContractPlanYn === 'Y');
        data.contractPlanPoint = FormatHelper.addComma(seldisSets.result.noContractPlanPoint);
      } else {
        return this.error.render(res, {
          code: seldisSets.code,
          msg: seldisSets.msg,
          pageInfo: pageInfo,
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
          pageInfo: pageInfo,
          svcInfo: svcInfo,
          title: PRODUCT_TYPE_NM.JOIN
        });
      }
      res.render('program/benefit.select-contract.html', { data });
    });

  }

  _convertJoinInfoTerm(joinTermInfo) {
    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }
}

export default BenefitSelectContractController;


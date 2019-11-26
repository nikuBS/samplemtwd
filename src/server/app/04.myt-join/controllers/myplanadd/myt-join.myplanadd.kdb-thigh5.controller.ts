/**
 * @file myt-join.myplanadd.thigh5.controller.ts
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2019.05.31
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import { MYT_JOIN_THIGH5_PREFERENTIAL } from '../../../../types/string.type';
import { Observable } from 'rxjs/Observable';

const DGRADE_PROD_ID: any = [
  '02',   // 12개월 고금리
  '04',   // 24개월 고금리
];
const DGRADE_DAY_MAX = 44;
const AUTOPAY_12MONTH_MAX = 12;
const AUTOPAY_24MONTH_MAX = 24;

class MyTJoinMyPlanAddKdbTHigh5 extends TwViewController {
  constructor() {
    super();
  }

  render(_req: Request, res: Response, _next: NextFunction, svcInfo: any, _allSvc: any, _childInfo: any, pageInfo: any) {
    this._getAdditionKdbTHigh5().subscribe(result => {
      if (result.code || result.thigh5Yn === 'N') {
        return this.error.render(res, {
          ...result,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      }

      let dGradeDayPercent = parseInt(result.dGradeDay, 10) / DGRADE_DAY_MAX * 100;
      if (dGradeDayPercent < 0) {
        dGradeDayPercent = 0;
      }
      if (dGradeDayPercent > 100) {
        dGradeDayPercent = 100;
      }

      let autoPayDrwCntPercent = 0;
      if (result.joinTermCd === '01') {
        autoPayDrwCntPercent = parseInt(result.autoPayDrwCnt, 10) / AUTOPAY_12MONTH_MAX * 100;
      } else {
        autoPayDrwCntPercent = parseInt(result.autoPayDrwCnt, 10) / AUTOPAY_24MONTH_MAX * 100;
      }

      const data: any = { autoPayBillAdd: false };
      if (result.autoPayBill === 'Y' && 
      ((result.joinTermCd === '01' && result.autoPayDrwCnt >= 10) || (result.joinTermCd === '02' && result.autoPayDrwCnt >= 20))) {
        data.autoPayBillAdd = true;
      }

      res.render('myplanadd/myt-join.myplanadd.kdb-thigh5.html', {
        scrbDt: DateHelper.getShortDate(result.scrbDt),
        joinTermCd: result.joinTermCd === '01' ? 12 : 24,
        preferential: MYT_JOIN_THIGH5_PREFERENTIAL.KDB[result.thigh5ProdId] ? MYT_JOIN_THIGH5_PREFERENTIAL.KDB[result.thigh5ProdId] : '',
        dGradeYn: DGRADE_PROD_ID.indexOf(result.thigh5ProdId) !== -1 ? 'Y' : 'N',
        dGradeDay: parseInt(result.dGradeDay, 10),
        thigh5HeroYn: result.thigh5HeroYn,
        dGradeDayPercent,
        autoPayDrwCntPercent,
        autoPayDrwCnt: result.autoPayDrwCnt,
        autoPayBill: result.autoPayBill,
        autoPayBillAdd: data.autoPayBillAdd,
        svcInfo,
        pageInfo
      });
    });
  }

  private _getAdditionKdbTHigh5 = () => {
    return this.apiService.request(API_CMD.BFF_10_0179, {}, {}, ['NC00000081']).map(resp => {
      if (resp.code !== API_CODE.CODE_00) {
        return resp;
      }

      return resp.result;
    });

    // return Observable.create((observer) => {
    //   setTimeout(() => {
    //     const resp = {
    //       "code": "00",
    //       "msg": "success",
    //       "result": {        
    //         "thigh5Yn": "Y",          
    //         "scrbDt": "20190321",          
    //         "heroProdYn": "N",          
    //         "joinTermCd": "01",          
    //         "thigh5ProdId": "01",          
    //         "thigh5HeroYn": "N",          
    //         "dGradeYn": "N",          
    //         "dGradeDay": "0000"
    //       }
    //     };
    //     if (resp.code === API_CODE.CODE_00) {
    //       observer.next(resp.result);
    //       observer.complete();
    //     } else {
    //       observer.error(resp);
    //     }
    //   }, 500);
    // });
  }
}

export default MyTJoinMyPlanAddKdbTHigh5;

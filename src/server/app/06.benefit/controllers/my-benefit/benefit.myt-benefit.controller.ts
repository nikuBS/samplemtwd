/**
 * FileName: benefit.myt-benefit.controller.ts
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 30.
 */
import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import DateHelper from '../../../../utils/date.helper';
import { MY_BENEFIT } from '../../../../types/title.type';
import FormatHelper from '../../../../utils/format.helper';

class BenefitMyBenefit extends TwViewController {
  private _total: number = 0;

  constructor() {
    super();
  }

  _dataPreprocess(point: any): any {
    this._total += parseInt(point, 10);
    return FormatHelper.addComma(point);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_11_0001, {}),
      this.apiService.request(API_CMD.BFF_07_0041, {}),
      this.apiService.request(API_CMD.BFF_05_0132, {}),
      this.apiService.request(API_CMD.BFF_05_0175, {}),
      this.apiService.request(API_CMD.BFF_05_0115, {}),
      this.apiService.request(API_CMD.BFF_05_0120, {}),
      this.apiService.request(API_CMD.BFF_05_0106, {}),
      this.apiService.request(API_CMD.BFF_05_0094, {}),
      this.apiService.request(API_CMD.BFF_06_0001, {}),
    ).subscribe(([membership, ocb, rainbow, noContract, cookiz, military, bill, combination, long]) => {
        // TODO error check all
        if ( true ) {
          const options = { svcInfo, pageInfo };
          if ( ocb.result.svcYN === 'Y' ) {
            options['okCashback'] = this._dataPreprocess(ocb.result.availPt);
            options['t'] = this._dataPreprocess(ocb.result.availTPt);
          }
          options['rainbow'] = this._dataPreprocess(rainbow.result.usblPoint);
          options['noContract'] = this._dataPreprocess(noContract.result.muPoint);
          if ( cookiz.code === API_CODE.CODE_00 ) {
            options['cookiz'] = this._dataPreprocess(cookiz.result.usblPoint);
          }
          if ( military.code === API_CODE.CODE_00 ) {
            options['military'] = this._dataPreprocess(military.result.usblPoint);
          }
          options['total'] = FormatHelper.addComma(this._total + '');

          options['count'] = 0;
          options['benefit'] = [];
          if ( bill.code === API_CODE.CODE_00 ) {
            bill.result.priceAgrmt.forEach(prod => {
              options['benefit'].push({
                name: prod.prodNm,
                date: DateHelper.getShortDateNoDot(prod.agreeStartDate)
              });
              options['count']++;
            });
          }

          if ( combination.code === API_CODE.CODE_00 ) {
            options['bond'] = {
              name: combination.prodNm,
              total: parseInt(combination.etcCnt, 10)
            };
            options['count']++;
          }

          if ( long.code === API_CODE.CODE_00 ) {
            const coupons = long.result.filter(coupon => {
              return coupon.copnOperStCd === 'A10';
            });
            options['coupons'] = coupons.length;
          }
          res.render('my-benefit/benefit.my-benefit.html', options);
        } else {
          return this.error.render(res, {
            title: MY_BENEFIT.MAIN,
            svcInfo: svcInfo
          });
        }
      }
    );
  }

}

export default BenefitMyBenefit;

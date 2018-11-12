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
      this.apiService.request(API_CMD.BFF_11_0001, {}), // membership: MBR0001, MBR0002
      this.apiService.request(API_CMD.BFF_07_0041, {}),
      this.apiService.request(API_CMD.BFF_05_0132, {}),
      this.apiService.request(API_CMD.BFF_05_0175, {}),
      this.apiService.request(API_CMD.BFF_05_0115, {}), // cookiz: BIL0070
      this.apiService.request(API_CMD.BFF_05_0120, {}), // military: BIL0071
      this.apiService.request(API_CMD.BFF_05_0106, {}),
      this.apiService.request(API_CMD.BFF_05_0094, {}),
      this.apiService.request(API_CMD.BFF_06_0001, {}),
      this.apiService.request(API_CMD.BFF_03_0004, {}),
    ).subscribe(([membership, ocb, rainbow, noContract, cookiz, military, bill, combination, long, lines]) => {

        // checks all API errors except that the API has valid code not API_CODE.CODE_00
        const apiError = this.error.apiError([/*membership,*/ ocb, rainbow, noContract, /* cookiz, military,*/ bill, combination, long]);
        if ( !FormatHelper.isEmpty(apiError) ) {
          return this.error.render(res, {
            title: MY_BENEFIT.MAIN,
            svcInfo: svcInfo,
            msg: apiError.msg,
            code: apiError.code
          });
        }

        const options = { svcInfo, pageInfo };
        if ( ocb.result.svcYN === 'Y' ) {
          options['okCashback'] = this._dataPreprocess(ocb.result.availPt);
          options['t'] = this._dataPreprocess(ocb.result.availTPt);
        } else {
          options['okCashback'] = 0;
          options['t'] = 0;
        }
        options['rainbow'] = this._dataPreprocess(rainbow.result.usblPoint);

        if ( noContract.muPointYn === 'Y' ) {
          options['noContract'] = this._dataPreprocess(noContract.result.muPoint);
        }

        if ( cookiz.code === API_CODE.CODE_00 ) {
          options['cookiz'] = this._dataPreprocess(cookiz.result.usblPoint);
        }
        if ( military.code === API_CODE.CODE_00 ) {
          options['military'] = this._dataPreprocess(military.result.usblPoint);
        }
        options['total'] = FormatHelper.addComma(this._total + '');

        options['count'] = 0;
        options['benefits'] = [];
        bill.result.priceAgrmt.forEach(prod => {
          options['benefits'].push({
            name: prod.prodNm,
            date: DateHelper.getShortDateNoDot(prod.agreeStartDate)
          });
          options['count']++;
        });

        options['bond'] = {
          name: combination.prodNm,
          total: parseInt(combination.etcCnt, 10)
        };
        options['count'] += options['bond'].total;
        const coupons = long.result.filter(coupon => {
          return coupon.copnOperStCd === 'A10';
        });
        options['coupons'] = coupons.length;

        // gets the subscribe date
        let _lines = [];
        Object['values'](lines.result).forEach(type => _lines = _lines.concat(type));
        const line = _lines.find((item, idx) => {
          return item['svcMgmtNum'] === svcInfo.svcMgmtNum;
        });
        if ( line ) {
          options['days'] = DateHelper.getDiffByUnit(DateHelper.getCurrentDate(), line['svcScrbDt'], 'days');
        } else {
          this.error.render(res, {
            title: MY_BENEFIT.MAIN,
            svcInfo: svcInfo
          });
        }
        res.render('my-benefit/benefit.my-benefit.html', options);
      }
    );
  }

}

export default BenefitMyBenefit;

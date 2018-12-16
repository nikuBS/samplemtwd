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
      this.apiService.request(API_CMD.BFF_05_0106, {}), // 요금할인
      this.apiService.request(API_CMD.BFF_05_0094, {}), // 결합할인
      this.apiService.request(API_CMD.BFF_05_0196, {})
    ).subscribe(([membership, ocb, rainbow, noContract, cookiz, military, bill, combination, loyalty]) => {

        // checks all API errors except that the API has valid code not API_CODE.CODE_00
        const apiError = this.error.apiError([/*membership,*/ ocb, rainbow, noContract, /* cookiz, military,*/ bill, combination, loyalty]);
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

        // 요금할인
        if ( bill.result.priceAgrmtList.length > 0 ) {
          options['bill'] = {
            total: bill.result.priceAgrmtList.length,
            item: bill.result.priceAgrmtList[0].prodNm
          };
          options['count'] += bill.result.priceAgrmtList.length;
        }
        // 요금할인- 복지고객
        if ( bill.result.wlfCustDcList.length > 0 ) {
          options['welfare'] = {
            total: bill.result.wlfCustDcList.length
          };
          options['count'] += bill.result.wlfCustDcList.length;
        }

        // 결합할인
        if ( parseInt(combination.result.etcCnt, 10) > 0 ) {
          options['bond'] = {
            name: combination.result.prodNm,
            total: parseInt(combination.result.etcCnt, 10) + (combination.result.prodNm.trim() !== '' ? 1 : 0)
          };
          options['count'] += options['bond'].total;
        }

        // 장기가입 쿠폰
        if ( loyalty.result.benfList.length > 0 ) {
          options['coupons'] = loyalty.result.benfList.length;
          options['count'] += 1;
        }

        // 장기가입 요금
        if ( loyalty.result.dcList && loyalty.result.dcList.length > 0) {
          // 장기요금할인 복수개 가능여부 확인 필요
          const dc =  loyalty.result.dcList[0];
          options['loyalty'] = `${dc.dcItmTypNm} ${dc.dcAmt}${dc.dcUnit}`;
          options['count'] += 1;
        }
        options['days'] = DateHelper.getDiffByUnit(DateHelper.getCurrentDate(), svcInfo.svcScrbDt, 'days');
        options['days'] = FormatHelper.addComma(options['days'].toString());

        res.render('my-benefit/benefit.my-benefit.html', options);
      }
    );
  }

}

export default BenefitMyBenefit;

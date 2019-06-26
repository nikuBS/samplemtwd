/**
 *[혜택 > 나의 혜택/할인] 관련 처리
 * @author Hyeryoun Lee
 * @since 2018-10-30
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import { MY_BENEFIT } from '../../../../types/title.type';
import FormatHelper from '../../../../utils/format.helper';

/**
 * [혜택 > 나의 혜택/할인] API호출 및 렌더링
 * @author Hyeryoun Lee
 * @since 2018-10-30
 */
class BenefitMyBenefit extends TwViewController {
  private _total: number = 0;

  constructor() {
    super();
  }

  /**
   * 서버 데이터 처리.
   * 포인트를 합산하고 해당 포인트 comma 포맷 변경
   * @param point 문자열
   * @private
   */
  _dataPreprocess(point: any): any {
    this._total += parseInt(point, 10);
    return FormatHelper.addComma(point);
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, allSvc?: any, childInfo?: any, pageInfo?: any) {
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_11_0001, {}), // membership: MBR0001, MBR0002
      this.apiService.request(API_CMD.BFF_07_0041, {}),
      this.apiService.request(API_CMD.BFF_05_0132, {}), // /core-bill/:version/rainbow-points
      this.apiService.request(API_CMD.BFF_05_0175, {}), // /core-bill/:version/no-contract-plan-points
      this.apiService.request(API_CMD.BFF_05_0115, {}), // cookiz: BIL0070  (/core-bill/:version/cookiz-ting-points)
      this.apiService.request(API_CMD.BFF_05_0120, {}), // military: BIL0071
      this.apiService.request(API_CMD.BFF_05_0106, {}), // 요금할인 (/core-modification/:version/bill-discounts)
      this.apiService.request(API_CMD.BFF_05_0094, {}), // 결합할인 (/core-modification/:version/combination-discounts)
      this.apiService.request(API_CMD.BFF_05_0196, {}), // (/core-modification/:version/loyalty-benefits)
      this.apiService.request(API_CMD.BFF_06_0001, {}), // 리필쿠폰 내역 (/core-recharge/:version/refill-coupons)
      this.apiService.request(API_CMD.BFF_05_0068, {}) // 가입정보 조회 (/:version/my-t/my-info)
    ).subscribe(([membership, ocb, rainbow, noContract, cookiz, military, bill, combination, loyalty, refillCoupons, joininfo]) => {

        // checks all API errors except that the API has valid code not API_CODE.CODE_00
        const apiError = this.error.apiError(
          [/*membership,*/ ocb, rainbow, noContract, /* cookiz, military,*/ bill, combination, loyalty, refillCoupons, joininfo]);
        if ( !FormatHelper.isEmpty(apiError) ) {
          return this.error.render(res, {
            title: MY_BENEFIT.MAIN,
            pageInfo: pageInfo,
            svcInfo: svcInfo,
            msg: apiError.msg,
            code: apiError.code
          });
        }

        const options = { svcInfo, pageInfo };
        if ( membership.code === API_CODE.CODE_00 ) {
          options['membership'] = membership.result.mbrGrCd;
        } else {
          options['membership'] = null;
        }
        if ( ocb.result.svcYN === 'Y' ) {
          options['okCashback'] = this._dataPreprocess(ocb.result.availPt);
          options['t'] = this._dataPreprocess(ocb.result.availTPt);
        } else {
          options['okCashback'] = 0;
          options['t'] = 0;
        }
        options['rainbow'] = this._dataPreprocess(rainbow.result.usblPoint);

        if ( noContract.result.muPointYn === 'Y' ) {
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
        if ( combination.result.prodNm.trim() !== '' ) {
          options['bond'] = {
            name: combination.result.prodNm,
            total: parseInt(combination.result.etcCnt, 10) + 1
          };
          options['count'] += options['bond'].total;
        }

        // 장기가입 쿠폰
        if ( loyalty.result.benfList.length > 0 &&
          loyalty.result.benfList.findIndex((item) => {
            return item.benfCd === '1';
          }) > -1 ) {
          options['coupons'] = refillCoupons.result.length;
          options['count'] += 1;
        }

        // 장기가입 요금
        if ( loyalty.result.dcList && loyalty.result.dcList.length > 0 ) {
          // 장기요금할인 복수개 가능여부 확인 필요
          const dc = loyalty.result.dcList[0];
          options['loyalty'] = `${dc.dcItmTypNm} ${dc.dcAmt}${dc.dcUnit}`;
          options['count'] += 1;
        }

        let duration = joininfo.result.scrbYrMthCnt || '';
        // 마스킹 해제 시 앞에 0 제거
        if ( duration.indexOf('*') < 0 ) {
          duration = duration.replace(/(0)([1-9])/gi, '$2');
        }
        options['days'] = duration;

        if (duration !== null && !FormatHelper.isEmpty(duration)) {
          const durationArr = duration.split(' ');
          options['year'] = durationArr[0].replace('년', '');
          options['month'] = durationArr[1].replace('개월', '');
        }        

        res.render('my-benefit/benefit.my-benefit.html', options);
      }
    );
  }

}

export default BenefitMyBenefit;

/**
 * @file 쿠폰 리스트 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-09-17
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import FormatHelper from '../../../../utils/format.helper';
import { MYT_DATA_RECHARGE_COUPON } from '../../../../types/string.type';

interface Coupon {
  copnIsueNum: string;
  copnNm: string;
  usePsblStaDt: string;
  usePsblEndDt: string;
  copnOperStCd: string;
  copnIsueDt: string;
  isGift?: boolean;
}

export default class MyTDataRechargeCoupon extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {

    Observable.combineLatest(
      this.getUsableCouponList(res, svcInfo, pageInfo), this.getAvailability(res, svcInfo, pageInfo)).subscribe(
        ([coupons, available]) => {
          if (coupons !== null && !FormatHelper.isEmpty(available)) {
            res.render('recharge/myt-data.recharge.coupon.html', {
              svcInfo,
              pageInfo,
              list: coupons,
              name: svcInfo.mbrNm,
              product: svcInfo.prodNm,
              available
            });
          }
        },
        (err) => {
          this.error.render(res, { code: err.code, msg: err.msg, pageInfo, svcInfo });
        }
      );
  }

  private getUsableCouponList(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0001, {}).map(resp => {
      if (resp.code === API_CODE.CODE_00) {
        return this.purifyCouponData(resp.result);
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo: pageInfo,
        svcInfo
      });

      return null;
    });
  }

  /**
   * @function
   * @desc 현재 사용자가 쿠폰을 사용할 수 있는 옵션을 BFF로 부터 조회 (불가능, 음성만 가능, 데이터만 가능, 둘 다 가능)
   * @param  {Response} res - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @returns Observable
   */
  private getAvailability(res: Response, svcInfo: any, pageInfo: any): Observable<any> {
    return this.apiService.request(API_CMD.BFF_06_0009, {}).map(resp => {
      if (resp.code === API_CODE.CODE_00) {
        if (FormatHelper.isEmpty(resp.result.option)) { // 쿠폰 사용 불가능
          return 'NONE';
        }

        const available: string = resp.result.option.reduce((memo, item) => {
          return (memo + item.dataVoiceClCd);
        }, '');

        if (available.includes('D') && available.includes('V')) {
          return 'ALL';
        }
        if (available.includes('D')) {
          return 'DATA';
        }
        return 'VOICE';
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo: pageInfo,
        svcInfo
      });

      return null;
    });
  }

  /**
   * @function
   * @desc BFF로 조회된 쿠폰 리스트를 ejs 렌더링이 용이하도록 정제
   * @param  {Array<Coupon>} data - 쿠폰 리스트
   * @returns Array - 정제된 쿠폰 리스트
   */
  private purifyCouponData(data: Array<Coupon>): Array<Coupon> {
    return data.map((item) => {
      item.usePsblStaDt = DateHelper.getShortDate(item.usePsblStaDt);
      item.usePsblEndDt = DateHelper.getShortDate(item.usePsblEndDt);
      item.isGift = item.copnOperStCd === 'A20';  // A20: 선물, A10: 장기가입, A14: 10년주기
      item.copnNm = MYT_DATA_RECHARGE_COUPON[item.copnOperStCd];
      return item;
    });
  }

  // 쿠폰 완료 화면이 별도의 url로 따져 더이상 사용하지 않는 함수, 히스토리 관리를 위해 남겨 둠
  private renderCouponComplete(req: Request, res: Response, svcInfo: any, pageInfo: any, category: string): void {
    switch (category) {
      case 'data':
        res.render('recharge/myt-data.recharge.coupon-complete-data.html');
        break;
      case 'voice':
        res.render('recharge/myt-data.recharge.coupon-complete-voice.html');
        break;
      case 'gift':
        const number = req.query.number;
        this.getUsableCouponList(res, svcInfo, pageInfo).subscribe(
          (resp) => {
            if (resp.code === API_CODE.CODE_00) {
              res.render('recharge/myt-data.recharge.coupon-complete-gift.html', {
                coupons: resp.result.length,
                number: number
              });
            } else {
              this.showError(res, svcInfo, pageInfo, '리필 쿠폰 사용', resp.code, resp.msg);
            }
          },
          (err) => {
            this.showError(res, svcInfo, pageInfo, '리필 쿠폰 사용', err.code, err.msg);
          }
        );
        break;
      default:
        break;
    }
  }

  private showError(res: Response, svcInfo: any, pageInfo: any, title: string, code: string, msg: string): void {
    this.error.render(res, {
      svcInfo: svcInfo,
      pageInfo: pageInfo,
      title: title,
      code: code,
      msg: msg
    });
  }
}

/**
 * MenuName: 나의 데이터/통화 > 실시간 잔여량
 * @file myt-data.hotdata.controller.ts
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018.11.28
 * Summary: 실시간 잔여량 및 부가 서비스 노출 여부 조회
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE, SESSION_CMD } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import DateHelper from '../../../../utils/date.helper';
import MyTHelper from '../../../../utils/myt.helper';
import { MYT_DATA_USAGE } from '../../../../types/string.type';
import { S_FLAT_RATE_PROD_ID, SVC_ATTR_E, SVC_CDGROUP } from '../../../../types/bff.type';

const VIEW = {
  CIRCLE: 'usage/myt-data.hotdata.html',    // 휴대폰
  BAR: 'usage/myt-data.usage.html',         // PPS, T-Pocket fi, T-login
  ERROR: 'usage/myt-data.usage.error.html'
};

class MyTDataHotdata extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.reqBalances()).subscribe(([_usageDataResp]) => {
      const usageDataResp = JSON.parse(JSON.stringify(_usageDataResp));
      if ( usageDataResp.code === API_CODE.CODE_00 ) {
        if (SVC_CDGROUP.WIRELESS.indexOf(svcInfo.svcAttrCd) !== -1) {
          let extraDataReq;
          switch ( svcInfo.svcAttrCd ) {
            case SVC_ATTR_E.MOBILE_PHONE :
              extraDataReq = this.reqBalanceAddOns(); // 부가 서비스
              break;
            case SVC_ATTR_E.PPS :
              extraDataReq = this.reqPpsCard(); // PPS 정보
              break;
          }
          if ( extraDataReq ) {
            Observable.combineLatest(extraDataReq).subscribe(([extraDataResp]) => {
              this._render(res, svcInfo, pageInfo, usageDataResp, extraDataResp);
            }, (resp) => {
              this._render(res, svcInfo, pageInfo, usageDataResp);
            });
          } else {
            this._render(res, svcInfo, pageInfo, usageDataResp);
          }
        } else {
          // 집전화 정액제 상품을 제외하고 에러처리
          if (svcInfo.svcAttrCd === 'S3' && S_FLAT_RATE_PROD_ID.indexOf(svcInfo.prodId) !== -1) {
            this._render(res, svcInfo, pageInfo, usageDataResp);
          } else {
            this._renderError(res, svcInfo, pageInfo, {
              code: 'BLN0004'
            });
          }
        }
      } else {
        this._renderError(res, svcInfo, pageInfo, usageDataResp);
      }
    }, (resp) => {
      this._renderError(res, svcInfo, pageInfo, resp);
    });
  }





  /**
   * 회선 타입에 따른 화면 렌더링
   * @param res
   * @param svcInfo
   * @param pageInfo
   * @param usageDataResp
   * @param extraDataResp?
   * @private
   */
  private _render(res: any, svcInfo: any, pageInfo: any, usageDataResp: any, extraDataResp?: any) {
    let view = VIEW.BAR;
    const option = {
      svcInfo,
      pageInfo,
      usageData: {},
      balanceAddOns: {},
      ppsInfo: {},
      isWireLess: false
    };

    switch ( svcInfo.svcAttrCd ) {
      case SVC_ATTR_E.MOBILE_PHONE :
        option['usageData'] = MyTHelper.parseCellPhoneUsageData(usageDataResp.result, svcInfo);
        if ( extraDataResp && extraDataResp['code'] === API_CODE.CODE_00 ) {
          option['balanceAddOns'] = extraDataResp['result'];
        }
        view = VIEW.CIRCLE;
        break;
      case SVC_ATTR_E.PPS :
        option['usageData'] = MyTHelper.parseUsageData(usageDataResp.result);
        // PPS 정보
        if ( extraDataResp && extraDataResp['code'] === API_CODE.CODE_00 ) {
          const extraData = extraDataResp['result'];
          extraData.showObEndDt = DateHelper.getShortDate(extraData.obEndDt);
          extraData.showInbEndDt = DateHelper.getShortDate(extraData.inbEndDt);
          extraData.showNumEndDt = DateHelper.getShortDate(extraData.numEndDt);
          option['ppsInfo'] = extraData;
        }
        break;
      // 유선 집전화
      case SVC_ATTR_E.TELEPHONE :
        const result = usageDataResp.result;
        if (result.balance) {
          if (result.balance[0]) {
            result.voice = [];
            result.voice.push(result.balance[0]);
          }
          if (result.balance[1]) {
            result.sms = [];
            result.sms.push(result.balance[1]);
          }
        }
        option['usageData'] = MyTHelper.parseUsageData(result);
        view = VIEW.CIRCLE;
        break;
      default:
        option['usageData'] = MyTHelper.parseUsageData(usageDataResp.result);
        break;
    }

    if ( SVC_CDGROUP.WIRELESS.indexOf(svcInfo.svcAttrCd) !== -1 ) {
      option['isWireLess'] = true;
    }

    res.render(view, option);
  }

  /**
   * 에러 화면 렌더링
   * @param res
   * @param svcInfo
   * @param pageInfo
   * @param resp
   * @private
   */
  private _renderError(res: any, svcInfo: any, pageInfo: any, resp: any) {
    const error = MYT_DATA_USAGE.ERROR[resp.code] || {
      title: '',
      contents: ''
    };
    error.code = resp.code;
    if ( error.code !== 'BLN0001' ) {
      error.title = MYT_DATA_USAGE.ERROR.DEFAULT_TITLE;
    }
    // 유선인 경우
    if (SVC_CDGROUP.WIRE.indexOf(svcInfo.svcAttrCd) !== -1 && (error.code === 'BLN0004' || error.code === 'BLN0007')) {
      error.contents = MYT_DATA_USAGE.ERROR['BLN0004_S'].contents;
    }
    res.render(VIEW.ERROR, {
      svcInfo,
      pageInfo,
      error
    });
  }

  /**
   * 실시간 잔여량 요청
   * @private
   * return Observable
   */
  private reqBalances(): Observable<any> {
    return this.apiService.requestStore(SESSION_CMD.BFF_05_0001, {});
  }

  /**
   * 실시간 잔여량 - 상세 노출 대상 상품 가입여부 요청
   * @private
   * return Observable
   */
  private reqBalanceAddOns(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0002, {});
  }

  /**
   * PPS 정보조회
   * @private
   * return Observable
   */
  private reqPpsCard(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0013, {});
  }

}export default MyTDataHotdata;

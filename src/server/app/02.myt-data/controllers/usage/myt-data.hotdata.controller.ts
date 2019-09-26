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
import {
  S_FLAT_RATE_PROD_ID,
  SVC_ATTR_E,
  SVC_CDGROUP,
  PRODUCT_5GX_TICKET_TIME_SET_SKIP_ID,
  PRODUCT_5GX_TICKET_SKIP_ID
} from '../../../../types/bff.type';

const TEMPLATE = {
  CIRCLE: 'usage/myt-data.hotdata.html',    // 휴대폰
  BAR: 'usage/myt-data.usage.html',         // PPS, T-Pocket fi, T-login
  ERROR: 'usage/myt-data.usage.error.html'
};

/**
 * 회선 타입에 따른 화면 렌더링
 * @param res
 * @param svcInfo
 * @param pageInfo
 * @param usageDataResp
 * @param extraDataResp?
 * @private
 */
function _render(res: any, svcInfo: any, pageInfo: any, usageDataResp: any, extraDataResp?: any) {
  const result = usageDataResp.result;
  let template;
  const option = {
    svcInfo,
    pageInfo,
    usageData: {},
    balanceAddOns: {},
    ppsInfo: {},
    isWireLess: false
  };

  switch (svcInfo.svcAttrCd) {
      // 휴대폰
    case SVC_ATTR_E.MOBILE_PHONE:
      option['usageData'] = MyTHelper.parseCellPhoneUsageData(result, svcInfo);
      if (extraDataResp && extraDataResp['code'] === API_CODE.CODE_00) {
        option['balanceAddOns'] = extraDataResp['result'];
      }
      template = TEMPLATE.CIRCLE;
      break;
      // 선불카드(폰)
    case SVC_ATTR_E.PPS:
      option['usageData'] = MyTHelper.parseUsageData(result);
      // PPS 정보
      if (extraDataResp && extraDataResp['code'] === API_CODE.CODE_00) {
        const extraData = extraDataResp['result'];
        extraData.showObEndDt = DateHelper.getShortDate(extraData.obEndDt);
        extraData.showInbEndDt = DateHelper.getShortDate(extraData.inbEndDt);
        extraData.showNumEndDt = DateHelper.getShortDate(extraData.numEndDt);
        option['ppsInfo'] = extraData;
      }
      template = TEMPLATE.BAR;
      break;
      // 유선 집전화
    case SVC_ATTR_E.TELEPHONE: {
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
      template = TEMPLATE.CIRCLE;
      break;
    }
    default:
      option['usageData'] = MyTHelper.parseUsageData(result);
      template = TEMPLATE.BAR;
      break;
  }

  if (SVC_CDGROUP.WIRELESS.indexOf(svcInfo.svcAttrCd) !== -1) {
    option['isWireLess'] = true;
  }

  res.render(template, option);
}

/**
 * 에러 화면 렌더링
 * @param res
 * @param svcInfo
 * @param pageInfo
 * @param resp
 * @private
 */
function _renderError(res: any, svcInfo: any, pageInfo: any, resp: any) {
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
  res.render(TEMPLATE.ERROR, {
    svcInfo,
    pageInfo,
    error
  });
}

class MyTDataHotdata extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // TODO: request를 1번만 할 것이므로, "Observable.combineLatest"일 필요 없음
    Observable.combineLatest(this.reqBalances()).subscribe(([respBalances]) => {
      const respUsedData = JSON.parse(JSON.stringify(respBalances));
      if ( respUsedData.code === API_CODE.CODE_00 ) {
        // [OP002-3871] 5GX 항목은 범융 별도 항목으로 추출
        // 음성 통환.영상 통화로 수신됨
        const voice = respUsedData.result.voice;
        const data5gx = voice.reduce((acc, item, index) => {
          if (PRODUCT_5GX_TICKET_SKIP_ID.indexOf(item.skipId) > -1) {
            acc.push(item);
            voice.splice(index, 1);
          }
          return acc;
        }, []);
        if (data5gx.length > 0) {
          // 범용 데이터 공제항목에 "시간권 데이터" 사용 여부 수신됨
          const gnrlData = respUsedData.result.gnrlData;
          const _5gxTimeTicketData = gnrlData.reduce((acc, item, index) => {
            if (PRODUCT_5GX_TICKET_TIME_SET_SKIP_ID.indexOf(item.skipId) > -1) {
              acc.push(item);
              gnrlData.splice(index, 1);
            }
            return acc;
          }, []);
          // 자료 정리 순서: 0. "시간권 데이터(무제한)", 1. "Data 시간권..."
          respUsedData.result._5gxData = [..._5gxTimeTicketData, ...data5gx];
        }
        if (SVC_CDGROUP.WIRELESS.indexOf(svcInfo.svcAttrCd) > -1) {
          let reqExtraData;
          switch ( svcInfo.svcAttrCd ) {
            case SVC_ATTR_E.MOBILE_PHONE :
              reqExtraData = this.reqBalanceAddOns(); // 부가 서비스
              break;
            case SVC_ATTR_E.PPS :
              reqExtraData = this.reqPpsCard(); // PPS 정보
              break;
          }
          if ( reqExtraData ) {
            // TODO: request를 1번만 할 것이므로, "Observable.combineLatest"일 필요 없음
            Observable.combineLatest(reqExtraData).subscribe(([respExtraData]) => {
              _render(res, svcInfo, pageInfo, respUsedData, respExtraData);
            }, () => {
              _render(res, svcInfo, pageInfo, respUsedData);
            });
          } else {
            _render(res, svcInfo, pageInfo, respUsedData);
          }
        } else {
          // 집전화 정액제 상품을 제외하고 에러처리
          if (svcInfo.svcAttrCd === 'S3' && S_FLAT_RATE_PROD_ID.indexOf(svcInfo.prodId) > -1) {
            _render(res, svcInfo, pageInfo, respUsedData);
          } else {
            _renderError(res, svcInfo, pageInfo, {
              code: 'BLN0004'
            });
          }
        }
      } else {
        _renderError(res, svcInfo, pageInfo, respUsedData);
      }
    }, resp => {
      _renderError(res, svcInfo, pageInfo, resp);
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
}

export default MyTDataHotdata;

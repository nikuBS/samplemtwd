/**
 * FileName: myt-data.hotdata.controller.ts
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018.11.28
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import MyTUsageGraphbox from './myt-data.usage.graphbox.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MYT_DATA_USAGE, SKIP_NAME } from '../../../../types/string.type';
import {
  DAY_BTN_STANDARD_SKIP_ID,
  SVC_ATTR_E,
  T0_PLAN_SKIP_ID,
  UNIT,
  UNIT_E,
  UNLIMIT_CODE
} from '../../../../types/bff.type';

const VIEW = {
  CIRCLE: 'usage/myt-data.hotdata.html',
  BAR: 'usage/myt-data.usage.html',
  ERROR: 'usage/myt-data.usage.error.html'
};

class MyTDataHotdata extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.reqBalances()).subscribe(([usageDataResp]) => {
      if ( usageDataResp.code === API_CODE.CODE_00 ) {
        let extraDataReq;
        switch ( svcInfo.svcAttrCd ) {
          case SVC_ATTR_E.MOBILE_PHONE :
            extraDataReq = this.reqBalanceAddOns(); // 부가 서비스
            break;
          case SVC_ATTR_E.PPS :
            extraDataReq = this.reqPpsCard(); // PPS 정보
            break;
        }
        if (extraDataReq) {
          Observable.combineLatest(extraDataReq).subscribe(([extraDataResp]) => {
            this._render(res, svcInfo, pageInfo, usageDataResp, extraDataResp);
          }, (resp) => {
            this._render(res, svcInfo, pageInfo, usageDataResp);
          });
        } else {
          this._render(res, svcInfo, pageInfo, usageDataResp);
        }
      } else {
        this._renderError(res, svcInfo, pageInfo, usageDataResp);
      }
    }, (resp) => {
      this._renderError(res, svcInfo, pageInfo, resp);
    });
  }

  /**
   * 사용량 데이터 가공(휴대폰 제외)
   * @param usageData
   * @public
   */
  public parseUsageData(usageData: any): any {
    const kinds = [
      MYT_DATA_USAGE.DATA_TYPE.DATA,
      MYT_DATA_USAGE.DATA_TYPE.VOICE,
      MYT_DATA_USAGE.DATA_TYPE.SMS,
      MYT_DATA_USAGE.DATA_TYPE.ETC
    ];
    this.setTotalRemained(usageData);
    usageData.data = usageData.gnrlData || [];

    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].map((data) => {
          MyTUsageGraphbox.convShowData(data);
        });
      }
    });
    return usageData;
  }


  /**
   * 사용량 데이터 가공(휴대폰)
   * @param usageData
   * @param svcInfo
   * @public
   */
  public parseCellPhoneUsageData(usageData: any, svcInfo: any): any {
    const kinds = [
      MYT_DATA_USAGE.DATA_TYPE.DATA,
      MYT_DATA_USAGE.DATA_TYPE.VOICE,
      MYT_DATA_USAGE.DATA_TYPE.SMS,
      MYT_DATA_USAGE.DATA_TYPE.ETC
    ];
    const gnrlData = usageData.gnrlData || [];  // 범용 데이터 공제항목
    const spclData = usageData.spclData || [];  // 특수 데이터 공제항목
    let dataArr = new Array();
    let defaultData;                            // 기본제공데이터
    let tOPlanSharedData;                       // 통합공유데이터

    if (gnrlData) {
      // 총데이터 잔여량 표시
      this.setTotalRemained(usageData);

      // 기본제공데이터
      defaultData = gnrlData.find((_data) => {
        return _data.prodId === svcInfo.prodId && FormatHelper.isEmpty(_data.rgstDtm);
      }) || {};

      // 기본제공데이터를 제외한 데이터 배열 취합
      dataArr = dataArr.concat(gnrlData.filter((_data) => {
        return _data.skipId !== defaultData.skipId;
      }));

      // 기본제공데이터가 있는 경우 최상위 노출
      if (!FormatHelper.isEmpty(defaultData.skipId)) {
        dataArr.unshift(defaultData);
        usageData.hasDefaultData = true;
      } else {
        usageData.hasDefaultData = false;
      }
    }

    if (spclData) {
      // 통합공유데이터
      tOPlanSharedData = this.getDataInTarget(T0_PLAN_SKIP_ID, spclData) || {};

      // 통합공유데이터 제외한 데이터 배열 취합
      dataArr = dataArr.concat(spclData.filter((_data) => {
        return _data.skipId !== tOPlanSharedData.skipId;
      }));

      // 기본제공 데이터 존재
      if (usageData.hasDefaultData) {
        // T/O플랜인 경우 기본제공 데이터의 tOPlanSharedData에 할당
        if (!FormatHelper.isEmpty(tOPlanSharedData.skipId)) {
          defaultData.tOPlanSharedData = tOPlanSharedData;
        } else {
          defaultData.sharedData = true;
        }
      }
    }

    // 당일 사용량(PA) DDZ25, DDZ23, DD0PB 에 해당하는 공제항목이 있으면
    // 해당 항목의 prodId와 같고 && skipId가 'PA'인 항목은 노출 제외

    const pas = dataArr.filter((_data) => {
      return DAY_BTN_STANDARD_SKIP_ID.indexOf(_data.skipId) !== -1;
    });

    if (pas.length > 0) {
      pas.map((pa) => {
        dataArr = dataArr.filter((_data) => {
          return !(_data.skipId === SKIP_NAME.DAILY && _data.prodId === pa.prodId);
        });
      });
    }

    // skipId가 'PA' && 무제한이 아닌 경우 노출 제외
    dataArr = dataArr.filter((_data) => {
      return !(_data.skipId === SKIP_NAME.DAILY && (UNLIMIT_CODE.indexOf(_data.unlimit) === -1));
    });


    usageData.data = dataArr;

    kinds.map((kind) => {
      if ( !FormatHelper.isEmpty(usageData[kind]) ) {
        usageData[kind].map((data) => {
          MyTUsageGraphbox.convShowData(data);
        });
      }
    });
    return usageData;
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
      ppsInfo: {}
    };

    switch ( svcInfo.svcAttrCd ) {
      case SVC_ATTR_E.MOBILE_PHONE :
        option['usageData'] = this.parseCellPhoneUsageData(usageDataResp.result, svcInfo);
        if ( extraDataResp && extraDataResp['code'] === API_CODE.CODE_00 ) {
          option['balanceAddOns'] = extraDataResp['result'];
        }
        view = VIEW.CIRCLE;
        break;
      case SVC_ATTR_E.PPS :
        option['usageData'] = this.parseUsageData(usageDataResp.result);
        if ( extraDataResp && extraDataResp['code'] === API_CODE.CODE_00 ) {
          const extraData = extraDataResp['result'];
          extraData.showObEndDt = DateHelper.getShortDate(extraData.obEndDt);
          extraData.showInbEndDt = DateHelper.getShortDate(extraData.inbEndDt);
          extraData.showNumEndDt = DateHelper.getShortDate(extraData.numEndDt);
          option['ppsInfo'] = extraData;
        }
        break;
      default:
        option['usageData'] = this.parseUsageData(usageDataResp.result);
        break;
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
    const error = MYT_DATA_USAGE.ERROR[resp.code] || {};
    error.code = resp.code;
    if (error.code !== 'BLN0001') {
      error.title = MYT_DATA_USAGE.ERROR.DEFAULT_TITLE;
    }
    res.render(VIEW.ERROR, {
      svcInfo,
      pageInfo,
      error
    });
  }

  /**
   * 총데이터 잔여량 세팅
   * @param usageData
   * @private
   */
  private setTotalRemained(usageData: any) {
    const gnrlData = usageData.gnrlData || [];
    let totalRemainUnLimited = false;
    gnrlData.map((_data) => {
      if (UNLIMIT_CODE.indexOf(_data.unlimit) !== -1) {
        totalRemainUnLimited = true;
      }
    });
    if (totalRemainUnLimited) {
      usageData.totalRemainUnLimited = true;
      usageData.totalRemained = SKIP_NAME.UNLIMIT;
    } else {
      const totalRemained = gnrlData.reduce((_memo, _data) => {
        return _data.remained ? _memo + parseInt(_data.remained, 10) : _memo +  0;
      }, 0);
      usageData.totalRemained = FormatHelper.convDataFormat(totalRemained, UNIT[UNIT_E.DATA]);
    }
  }

  /**
   * 실시간 잔여량 요청
   * @private
   * return Observable
   */
  private reqBalances(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0001, {});
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

  /**
   * dataArray중 target의 공제ID에 해당하는 데이터 반환
   * @param target
   * @param dataArray
   * @private
   * return data
   */
  private getDataInTarget(target: any, dataArray: any): any {
    let data;
    dataArray.map((_data) => {
      if (target.indexOf(_data.skipId) !== -1) {
        data = _data;
      }
    });
    return data;
  }
}

export default MyTDataHotdata;

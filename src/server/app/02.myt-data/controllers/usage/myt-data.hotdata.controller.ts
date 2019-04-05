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
import MyTUsageGraphbox from './myt-data.usage.graphbox.controller';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import { MYT_DATA_USAGE, SKIP_NAME } from '../../../../types/string.type';
import {
  DAY_BTN_STANDARD_SKIP_ID,
  SVC_ATTR_E,
  UNIT,
  UNIT_E,
  UNLIMIT_CODE
} from '../../../../types/bff.type';

const VIEW = {
  CIRCLE: 'usage/myt-data.hotdata.html',    // 휴대폰
  BAR: 'usage/myt-data.usage.html',         // PPS, T-Pocket fi, T-login
  ERROR: 'usage/myt-data.usage.error.html'
};

// 통합공유 데이터 표시 상품 리스트
const TOTAL_SHARE_DATA_SKIP_ID = [
  'DD3CX',  // NA00005959	인피니티	통합공유 데이터 40GB
  'DD3CV',  // NA00005958	패밀리	통합공유 데이터 20GB
  'DD3CU',  // NA00005957	라지	통합공유 데이터 15GB
  'DD4D5',   // NA00006157	0플랜 라지	통합공유 데이터 20GB
  // 5G 대응
  'DD3H8',   // NA00006405	5G XL(미정) 통합공유 데이터 50GB
  'DD3GV',   // NA00006404	5G L(미정) 통합공유 데이터 30GB
  'DD3GC',   // NA00006403	5G M(미정) 통합공유 데이터 15GB
];

// 기본 데이터제공량이 무제한인 요금상품 리스트
const INFINITY_DATA_PROD_ID: any = [
  'NA00002500', 'NA00002501', 'NA00002502', 'NA00002708', 'NA00002997',
  'NA00002998', 'NA00003125', 'NA00003126', 'NA00003127', 'NA00003128'
];

class MyTDataHotdata extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    Observable.combineLatest(this.reqBalances()).subscribe(([_usageDataResp]) => {
      const usageDataResp = JSON.parse(JSON.stringify(_usageDataResp));
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

    // 기본제공 데이터: usageData.gnrlData[n] 중에 svcInfo.prodId와 같은 prodId를 가진 data 로 잔여량 최상단에 노출
    // 통합공유 데이터:
    //  - 기본제공데이터가 있는 경우 기본제공 데이터 하단에 노출
    //    - 기본제공 데이터가 있지만 기본제공 데이터량이 무제한인 경우(INFINITY_DATA_PROD_ID에 속하는 경우)엔 표시 안함[DV001-18235]
    //    - 데이터 표시 방법: (XX GB공유가능, XXGB 공유)
    //      - usageData.spclData[n]중 TOTAL_SHARE_DATA_SKIP_ID에 속하는 데이터가 있는경우
    //        - 가능량: usageData.spclData[n].showRemained
    //        - 사용량: usageData.spclData[n].showUsed
    //      - 아닌 경우
    //        - 가능량: 기본제공데이터.showRemaineds,
    //        - 사용량: T끼리 데이터 선물하기 + 데이터 함께쓰기 사용량
    //  - 기본제공데이터가 없는 경우 표시안함

    if ( gnrlData ) {
      // 총데이터 잔여량 표시 데이터 세팅
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
      if ( !FormatHelper.isEmpty(defaultData.skipId) ) {
        dataArr.unshift(defaultData);
        usageData.hasDefaultData = true;
      } else {
        usageData.hasDefaultData = false;
      }
    }

    if ( spclData ) {
      // 통합공유데이터
      tOPlanSharedData = this.getDataInTarget(TOTAL_SHARE_DATA_SKIP_ID, spclData) || {};

      // 통합공유데이터 제외한 데이터 배열 취합
      dataArr = dataArr.concat(spclData.filter((_data) => {
        return _data.skipId !== tOPlanSharedData.skipId;
      }));

      // 기본제공 데이터 존재
      if ( usageData.hasDefaultData ) {
        // T/O플랜인 경우 기본제공 데이터의 tOPlanSharedData에 할당
        if ( !FormatHelper.isEmpty(tOPlanSharedData.skipId) ) {
          defaultData.tOPlanSharedData = tOPlanSharedData;
        } else {
          // [DV001-18235] 기본데이터가 무제한으로 무제한 공유 가능으로 표기되면 안되는 항목들 통합공유데이터 표시안함
          if (INFINITY_DATA_PROD_ID.indexOf(defaultData.prodId) !== -1) {
            defaultData.sharedData = false;
          } else {
            defaultData.sharedData = true;
          }
        }
      }
    }

    // 당일 사용량(PA) DDZ25, DDZ23, DD0PB 에 해당하는 공제항목이 있으면
    // 해당 항목의 prodId와 같고 && skipId가 'PA'인 항목은 노출 제외

    const pas = dataArr.filter((_data) => {
      return DAY_BTN_STANDARD_SKIP_ID.indexOf(_data.skipId) !== -1;
    });

    if ( pas.length > 0 ) {
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
        // PPS 정보
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
    if ( error.code !== 'BLN0001' ) {
      error.title = MYT_DATA_USAGE.ERROR.DEFAULT_TITLE;
    }
    res.render(VIEW.ERROR, {
      svcInfo,
      pageInfo,
      error
    });
  }

  /**
   * 총데이터 잔여량 데이터 세팅
   * @param usageData
   * @private
   */
  private setTotalRemained(usageData: any) {
    const gnrlData = usageData.gnrlData || [];
    let totalRemainUnLimited = false;
    // 범용데이터 중 무제한 데이터가 있는지 확인
    gnrlData.map((_data) => {
      if ( UNLIMIT_CODE.indexOf(_data.unlimit) !== -1 ) {
        totalRemainUnLimited = true;
      }
    });
    // 무제한 데이터가 있으면 무제한 표시, 없으면 합산 잔여량 표시
    if ( totalRemainUnLimited ) {
      usageData.totalRemainUnLimited = true;
      usageData.totalRemained = SKIP_NAME.UNLIMIT;
    } else {
      const totalRemained = gnrlData.reduce((_memo, _data) => {
        return _data.remained ? _memo + parseInt(_data.remained, 10) : _memo + 0;
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
      if ( target.indexOf(_data.skipId) !== -1 ) {
        data = _data;
      }
    });
    return data;
  }
}

export default MyTDataHotdata;

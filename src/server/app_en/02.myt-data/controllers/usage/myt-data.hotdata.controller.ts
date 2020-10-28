/**
* MenuName: 나의 데이터/통화 > 실시간 잔여량 
* @file myt-data.hotdata.controller.ts
* @author 김기남 (skt.P161322@partner.sk.com)
* @since 2020.09.16
* Summary: 실시간 잔여량 및 부가 서비스 노출 여부 조회
*/

import TwViewController from '../../../../common_en/controllers/tw.view.controller';
import MyTHelper from '../../../../utils_en/myt.helper';
import CommonHelper from '../../../../utils_en/common.helper';
import { NextFunction, Request, Response } from 'express';
import { API_EN_CODE, API_CODE } from '../../../../types_en/api-command.type';
import { Observable } from 'rxjs/Observable';
import { SVC_ATTR_E, SVC_CDGROUP } from '../../../../types_en/bff.type';
import { MYT_DATA_USAGE } from '../../../../types_en/string.type';

const TEMPLATE = {
  PAGE: 'usage/en.myt-data.hotdata.html',
  ERROR: 'usage/en.myt-data.usage.error.html',
  UNAVAILABLE_ERROR: 'usage/en.myt-data.usage.error.unavailable.html',
};

class MyTDataHotdata extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    CommonHelper.addCurLineInfo(svcInfo);
    const lineType = CommonHelper.getLineType(svcInfo);

    // 유선 회선 및 무선 회선이 아닌 고객은 정보조회 불가 페이지로 이동
    if( lineType.isWireLine || lineType.isPPSLine ) {
      _renderError(res, svcInfo, pageInfo, {
        code: 'WIRE_OR_PPS'
      });
      return;
    }

    // 모바일 회선은 있지만 등록된 회선이 하나도 없다면 에러페이지로 이동
    if ( lineType.isLineCountIsZero || lineType.isLineNotExist ) { 
      _renderError(res, svcInfo, pageInfo, {
        code: 'LINE_NOT_EXIST'
      });
      return;
    }

    Observable.combineLatest(this.reqBalances()).subscribe(([respBalances]) => {
      const respUsedData = JSON.parse(JSON.stringify(respBalances));
      if ( respUsedData.code === API_CODE.CODE_00 ) {
        _render(res, svcInfo, pageInfo, respUsedData);
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
    return this.apiService.requestStore(API_EN_CODE.BFF_05_0225, {});
  }
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
function _render(res: any, svcInfo: any, pageInfo: any, usageDataResp: any, extraDataResp?: any) {
  const result = usageDataResp.result;
  let template;
  const option = {
    svcInfo,
    pageInfo,
    usageData: {},
    balanceAddOns: {},
    ppsInfo: {},
    isWireLess: false,
    error : {},
    errorCode : ''
  };

  switch ( svcInfo.svcAttrCd ) {
    // 휴대폰
    case SVC_ATTR_E.MOBILE_PHONE:
      option['usageData'] = MyTHelper.parseCellPhoneUsageData(result, svcInfo);
      if ( extraDataResp && extraDataResp['code'] === API_CODE.CODE_00 ) {
        option['balanceAddOns'] = extraDataResp['result'];
      }
      template = TEMPLATE.PAGE;
      break;
    default:
      option['usageData'] = MyTHelper.parseUsageData(result);
      template = TEMPLATE.PAGE;
      break;
  }

  if ( SVC_CDGROUP.WIRELESS.indexOf(svcInfo.svcAttrCd) !== -1 ) {
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
  const errorCode = resp.code;
  const errorTemplate = resp.code === 'WIRE_OR_PPS' ? TEMPLATE.UNAVAILABLE_ERROR : TEMPLATE.ERROR;
  const error = MYT_DATA_USAGE.ERROR[resp.code] || {
    title: MYT_DATA_USAGE.ERROR.DEFAULT_TITLE,
    contents: MYT_DATA_USAGE.ERROR.DEFAULT_CONTENT
  };

  res.render(errorTemplate, {
    svcInfo,
    pageInfo,
    error,
    errorCode
  });
}

export default MyTDataHotdata;

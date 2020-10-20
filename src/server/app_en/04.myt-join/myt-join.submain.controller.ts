/**
* @file myt-join.submain.controller.ts
* @author 김기남 (skt.P161322@partner.sk.com)
* @since 2020.09.18
*/

import TwViewController from '../../common_en/controllers/tw.view.controller';
import DateHelper from '../../utils_en/date.helper';
import FormatHelper from '../../utils_en/format.helper';
import ProductHelper from '../../utils_en/product.helper';
import CommonHelper from '../../utils_en/common.helper';
import { SVC_ATTR_E, SVC_CDGROUP } from '../../types_en/bff.type';
import { NextFunction, Request, Response } from 'express';
import { DATA_UNIT } from '../../types_en/string.type';
import { API_CMD, API_CODE } from '../../types_en/api-command.type';
import { MYT_JOIN_SUBMAIN } from '../../types_en/string.type';

const TEMPLATE = {
  PAGE: 'en.myt-join.submain.html',
  ERROR: 'en.myt-join.submain.error.html',
  UNAVAILABLE_ERROR: 'en.myt-join.submain.error.unavailable.html',
};

class MyTJoinSubmainController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, child: any, pageInfo: any) {
    CommonHelper.addCurLineInfo(svcInfo);
    const lineType = CommonHelper.getLineType(svcInfo);
    
    // 유선 회선 및 무선 회선이 아닌 고객은 정보조회 불가 페이지로 이동
    if( lineType.isWireLine || lineType.isPPSLine) {
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

    // 법인 회선 진입 시 에러 페이지로 이동
    if ( lineType.isCompanyLine ) {
      _renderError(res, svcInfo, pageInfo, {
        code: 'COMPANY_LINE'
      });
      return;
    }

    this.apiService.request(API_CMD.BFF_05_0224, {})
      .subscribe(( feePlanInfo ) => {
        if (feePlanInfo.code === API_CODE.CODE_00) { 
          const result = feePlanInfo.result;
          
          const basePriceObject = result.basPricList[0] || {}; // 가입한 요금제 정보
          const baseFreePriceList = result.freePricList || []; // 가입한 무료 요금제 정보
          const baseDataPriceList = result.dataPricList || []; // 가입한 데이터 요금제 정보

          const convertBasePriceObject = this._convertBasePrice(basePriceObject);
          const convertFreePriceList = this._convertBaseEtcPrice(baseFreePriceList);
          const convertDataPriceList = this._convertBaseEtcPrice(baseDataPriceList);

          res.render(TEMPLATE.PAGE, {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            basePriceObject : convertBasePriceObject,
            baseFreePriceList : convertFreePriceList,
            baseDataPriceList : convertDataPriceList
          });
        } 
    })
  }

  /**
   * 기본 요금제 정보 파싱
   * @param basePriceObject 
   */
  private _convertBasePrice(basePriceObject): any {
    if (FormatHelper.isEmpty(basePriceObject)) {
      return null;
    }

    // 금액, 음성, 문자, 할인상품 값 체크
    const basFeeTxt = FormatHelper.getValidVars(basePriceObject.basFeeTxt);
    const basOfrVcallTmsCtt = FormatHelper.getValidVars(basePriceObject.basOfrVcallTmsTxt);
    const basOfrCharCntCtt = FormatHelper.getValidVars(basePriceObject.basOfrLtrAmtTxt);

    // 데이터 값 변환
    const basDataGbTxt = FormatHelper.getValidVars(basePriceObject.basDataGbTxt);
    const basDataMbTxt = FormatHelper.getValidVars(basePriceObject.basDataMbTxt);
    const basDataTxt = this._getBasDataTxt(basDataGbTxt, basDataMbTxt);

    // 상품 스펙 공통 헬퍼 사용하여 컨버팅
    const spec = ProductHelper.convProductSpecifications(basFeeTxt, basDataTxt.txt, basOfrVcallTmsCtt, basOfrCharCntCtt, basDataTxt.unit);

    return Object.assign(basePriceObject, {
      feePlanProd: FormatHelper.isEmpty(basePriceObject) ? null : Object.assign(basePriceObject, {
        scrbDt: DateHelper.getShortDateWithFormat(basePriceObject.scrbDt, 'YYYY.M.D.'),  // 가입일
        basFeeInfo: spec.basFeeInfo,  // 금액
        basOfrDataQtyCtt: spec.basOfrDataQtyCtt,  // 데이터
        basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,  // 음성
        basOfrCharCntCtt: spec.basOfrCharCntCtt  // 문자
      })
    });
  }

  /**
   * 요금제 정보 데이터 파싱
   * @param baseFreePriceList 
   */
  private _convertBaseEtcPrice(priceList): any {
    return priceList.reduce((arr, item) => {
      const isValid = value => {
        return !(FormatHelper.isEmpty(value) || ['0', '-'].indexOf(value) !== -1);
      };
      Object.assign(item, {
        basFeeInfo: isValid(item.basFeeTxt) ? ProductHelper.convProductBasfeeInfo(item.basFeeTxt) : null,
        basDateInfo: DateHelper.getShortDateWithFormat(item.scrbDt, 'YYYY.M.D.')
      })

      arr.push(item);
      return arr;
    }, []);
  }
  
  /**
   * 데이터 값 분기 처리
   * @param basDataGbTxt - 기가 값
   * @param basDataMbTxt - 메가 값
   */
  private _getBasDataTxt(basDataGbTxt: any, basDataMbTxt: any): any {
    if (!FormatHelper.isEmpty(basDataGbTxt)) {  // Gb 값 우선 사용
      return {
        txt: basDataGbTxt,
        unit: DATA_UNIT.GB
      };
    }

    if (!FormatHelper.isEmpty(basDataMbTxt)) {  // Gb 없고 Mb 있으면 값 사용
      return {
        txt: basDataMbTxt,
        unit: DATA_UNIT.MB
      };
    }

    return {
      txt: null,
      unit: null
    };
  }
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
  const error = MYT_JOIN_SUBMAIN.ERROR[resp.code] || {
    title: MYT_JOIN_SUBMAIN.ERROR.DEFAULT_TITLE,
    contents: MYT_JOIN_SUBMAIN.ERROR.DEFAULT_CONTENT
  };

  console.log('==>> ' + errorCode, errorTemplate, error);

  res.render(errorTemplate, {
    svcInfo,
    pageInfo,
    error,
    errorCode
  });
}

export default MyTJoinSubmainController;

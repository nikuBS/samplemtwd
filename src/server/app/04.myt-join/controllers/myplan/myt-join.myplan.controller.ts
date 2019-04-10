/**
 * MyT > 나의 가입정보 > 나의 요금제
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-09-19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { SVC_CDNAME, SVC_CDGROUP } from '../../../../types/bff.type';
import { DATA_UNIT, MYT_FEEPLAN_BENEFIT, FEE_PLAN_TIP_TXT, CURRENCY_UNIT } from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';
import ProductHelper from '../../../../utils/product.helper';

/* 상품 카테고리 별 툴팁 코드 목록 */
const FEE_PLAN_TIP = {
  M1: ['MS_05_tip_01'], // 휴대폰
  M2: ['MS_05_tip_02'], // 선불폰(PPS)
  M3: ['MS_05_tip_04'], // T pocket Fi
  M4: ['MS_05_tip_04'], // T Login
  M5: [], // T Wibro
  S1: ['MS_05_tip_03'], // 인터넷
  S2: ['MS_05_tip_03'], // IPTV
  S3: ['MS_05_tip_03'] // 집전화
};

/**
 * @class
 */
class MyTJoinMyplan extends TwViewController {
  constructor() {
    super();
  }

  /**
   * 무선/유선 별 요청 API 분기처리
   * @param svcAttrCd - 회선 카테고리 값
   */
  private _getFeePlanApiInfo(svcAttrCd): any {
    if ( SVC_CDGROUP.WIRELESS.indexOf(svcAttrCd) !== -1 ) { // 무선
      return {
        isWire: false,
        apiCmd: API_CMD.BFF_05_0136
      };
    }

    if ( SVC_CDGROUP.WIRE.indexOf(svcAttrCd) !== -1 ) { // 유선
      return {
        isWire: true,
        apiCmd: API_CMD.BFF_05_0128
      };
    }

    return null;
  }

  /**
   * 옵션 및 할인프로그램, 혜택 목록 데이터 변환
   * @param optionAndDiscountProgramList - 옵션 및 할인프로그램 목록
   */
  private _convertOptionAndDiscountProgramList(optionAndDiscountProgramList): any {
    return optionAndDiscountProgramList.map((item) => {
      return Object.assign(item, {
        scrbDt: DateHelper.getShortDateWithFormat(item.scrbDt, 'YYYY.M.D.'),  // 가입일
        btnList: this._convertBtnList(item.btnList, item.prodSetYn),  // 버튼 목록 변환
        dcStaDt: FormatHelper.isEmpty(item.dcStaDt) ? null : DateHelper.getShortDateWithFormat(item.dcStaDt, 'YYYY.M.D.'),  // 시작일
        dcEndDt: FormatHelper.isEmpty(item.dcEndDt) ? null : this._getDcEndDt(item.dcEndDt) // 종료일
      });
    });
  }

  /**
   * 혜택 종료일 변환
   * @param dcEndDt - 혜택 종료일
   */
  private _getDcEndDt(dcEndDt: any): any {
    if (dcEndDt === '99991231') {
      return MYT_FEEPLAN_BENEFIT.ENDLESS;
    }

    return DateHelper.getShortDateWithFormat(dcEndDt, 'YYYY.M.D.');
  }

  /**
   * 목록의 각 항목 데이터 변환
   * @param data - 요금제 정보
   * @param isWire - 유선 요금제 여부
   */
  private _convertFeePlan(data, isWire): any {
    return isWire ? this._convertWirePlan(data.result) : this._convertWirelessPlan(data.result);
  }

  /**
   * 유선 값 변환
   * @param wirePlan - 유선 요금제 정보
   */
  private _convertWirePlan(wirePlan): any {
    const isNumberBasFeeAmt = !isNaN(Number(wirePlan.basFeeAmt)); // 금액 숫자 여부

    return Object.assign(wirePlan, {
      basFeeAmt: isNumberBasFeeAmt && parseInt(wirePlan.basFeeAmt, 10) > 0 ?
        FormatHelper.addComma(wirePlan.basFeeAmt.toString()) + CURRENCY_UNIT.WON : 0, // 금액 값 단위 붙여서 제공
      svcScrbDt: DateHelper.getShortDateWithFormat(wirePlan.svcScrbDt, 'YYYY.M.D.'),  // 가입일
      dcBenefits: this._convertWireDcBenefits(wirePlan.dcBenefits)  // 혜택 값 변환
    });
  }

  /**
   * 유선 혜택 데이터 변환
   * @param dcBenefits - 유선 혜택 데이터 값
   */
  private _convertWireDcBenefits(dcBenefits): any {
    const dcTypeMoneyList: any = [],
      dcTypePercentList: any = [];

    // 할인 값 단위 형태에 따라 목록 나눔 (원, %)
    dcBenefits.forEach((item) => {
      if (item.dcCttClCd === '01') {
        dcTypeMoneyList.push(item);
        return true;
      }

      dcTypePercentList.push(item);
    });

    // 원단위 높은값 목록 + 퍼센트 높은값 목록을 변환하여 반환
    return [...this._sortByHigher(dcTypeMoneyList), ...this._sortByHigher(dcTypePercentList)]
      .map((item) => {
        return this._convertWireDcBenefitItem(item);
      });
  }

  /**
   * 혜택 값이 높은 순으로 정렬
   * @param list - 옵션 및 할인 프로그램 목록
   */
  private _sortByHigher(list: any): any {
    return list.sort((itemA, itemB) => {
      if (itemA.dcVal > itemB.dcVal) {
        return -1;
      }

      if (itemA.dcVal < itemB.dcVal) {
        return 1;
      }

      return 0;
    });
  }

  /**
   * 유선 혜택 항목 데이터 변환
   * @param dcBenefitItem - 헤택 목록
   */
  private _convertWireDcBenefitItem(dcBenefitItem: any): any {
    return Object.assign(dcBenefitItem, {
      penText: (dcBenefitItem.penYn === 'Y') ? MYT_FEEPLAN_BENEFIT.PEN_Y : MYT_FEEPLAN_BENEFIT.PEN_N, // 위약금 여부
      dcStaDt: DateHelper.getShortDateWithFormat(dcBenefitItem.dcStaDt, 'YYYY.M.D.'), // 할인기간 (시작)
      dcEndDt: (dcBenefitItem.dcEndDt !== '99991231') ? DateHelper.getShortDateWithFormat(dcBenefitItem.dcEndDt, 'YYYY.M.D.')
        : MYT_FEEPLAN_BENEFIT.ENDLESS,  // 할인기간 (끝)
      dcVal: dcBenefitItem.dcCttClCd === '01' ? FormatHelper.addComma(dcBenefitItem.dcVal.toString()) : dcBenefitItem.dcVal // 할인 값
    });
  }

  /**
   * 무선 데이터 변환
   * @param wirelessPlan - 무선 요금제 데이터
   */
  private _convertWirelessPlan(wirelessPlan): any {
    if (FormatHelper.isEmpty(wirelessPlan.feePlanProd)) {
      return null;
    }

    // 금액, 음성, 문자, 할인상품 값 체크
    const basFeeTxt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basFeeTxt),
      basOfrVcallTmsCtt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basOfrVcallTmsTxt),
      basOfrCharCntCtt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basOfrLtrAmtTxt),
      disProdList = FormatHelper.getValidVars(wirelessPlan.disProdList, []);

    // 데이터 값 변환
    const basDataGbTxt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basDataGbTxt),
      basDataMbTxt = FormatHelper.getValidVars(wirelessPlan.feePlanProd.basDataMbTxt),
      basDataTxt = this._getBasDataTxt(basDataGbTxt, basDataMbTxt);

    // 상품 스펙 공통 헬퍼 사용하여 컨버팅
    const spec = ProductHelper.convProductSpecifications(basFeeTxt, basDataTxt.txt, basOfrVcallTmsCtt, basOfrCharCntCtt, basDataTxt.unit);

    return Object.assign(wirelessPlan, {
      feePlanProd: FormatHelper.isEmpty(wirelessPlan.feePlanProd) ? null : Object.assign(wirelessPlan.feePlanProd, {
        scrbDt: DateHelper.getShortDateWithFormat(wirelessPlan.feePlanProd.scrbDt, 'YYYY.M.D.'),  // 가입일
        basFeeInfo: spec.basFeeInfo,  // 금액
        basOfrDataQtyCtt: spec.basOfrDataQtyCtt,  // 데이터
        basOfrVcallTmsCtt: spec.basOfrVcallTmsCtt,  // 음성
        basOfrCharCntCtt: spec.basOfrCharCntCtt,  // 문자
        btnList: this._convertBtnList(wirelessPlan.feePlanProd.btnList, wirelessPlan.feePlanProd.prodSetYn) // 버튼 목록
      }),
      optionAndDiscountProgramList: this._convertOptionAndDiscountProgramList(disProdList)  // 옵션 및 할인 프로그램
    });
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

  /**
   * 툴팁 목록 가져오기
   * @param svcAttrCd - 회선 카테고리 값
   */
  private _getTipList(svcAttrCd: any): any {
    if (FormatHelper.isEmpty(svcAttrCd)) {
      return [];
    }

    return FEE_PLAN_TIP[svcAttrCd].map((item) => {
      return {
        code: item,
        title: FEE_PLAN_TIP_TXT[item]
      };
    });
  }

  /**
   * 버튼 목록 컨버팅
   * @param btnList - 버튼 목록
   * @param prodSetYn - 해당 상품의 설정 허용 여부
   */
  private _convertBtnList(btnList: any, prodSetYn: any): any {
    if (FormatHelper.isEmpty(btnList)) {
      return [];
    }

    const settingBtnList: any = [];

    btnList.forEach((item) => {
      if (item.btnTypCd !== 'SE') { // 설정 외 버튼은 노출되지 않도록 처리 (by 기획 요건)
        return true;
      }

      settingBtnList.push(item);
    });

    return settingBtnList;
  }

  /**
   * @desc 화면 렌더링
   * @param req
   * @param res
   * @param next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const defaultOptions = {
      title: '나의 요금제',
      pageInfo: pageInfo,
      svcInfo: svcInfo
    };

    // 사용자 회선 값 없을 경우 오류 처리
    if (FormatHelper.isEmpty(svcInfo.svcAttrCd)) {
      return this.error.render(res, defaultOptions);
    }

    // 사용자 회선 카테고리 값에 따라 요청할 API Bff No 분기 처리
    const apiInfo = this._getFeePlanApiInfo(svcInfo.svcAttrCd);
    if ( FormatHelper.isEmpty(apiInfo) ) {
      return this.error.render(res, defaultOptions);
    }

    this.apiService.request(apiInfo.apiCmd, {})
      .subscribe(( feePlanInfo ) => {
        // API 오류 처리
        if ( feePlanInfo.code !== API_CODE.CODE_00 ) {
          return this.error.render(res, Object.assign(defaultOptions, {
            code: feePlanInfo.code,
            msg: feePlanInfo.msg
          }));
        }

        const feePlan = this._convertFeePlan(feePlanInfo, apiInfo.isWire),  // API 응답 값 변환
          tipList = this._getTipList(svcInfo.svcAttrCd);  // 회선 카테고리 값을 기준으로 툴팁 목록 가져오기

        // 컨버팅 결과 값이 없을 시 오류 처리
        if (FormatHelper.isEmpty(feePlan)) {
          return this.error.render(res, defaultOptions);
        }

        res.render('myplan/myt-join.myplan.html', {
          pageInfo: pageInfo, // 페이지 정보
          svcInfo: svcInfo, // 사용자 정보
          svcCdName: SVC_CDNAME,  // 회선 카테고리 명
          feeMainTemplate: apiInfo.isWire ? 'wire' : 'wireless',  // 회선 별 렌더링 파일 명
          feePlan: feePlan, // 가입 정보
          tipList: tipList, // 화면 별 툴팁 목록
          isFeeAlarm: ['cellphone', 'pps'].indexOf(SVC_CDNAME[svcInfo.svcAttrCd]) !== -1  // 요금제 변경 알람 서비스 제공을 위한 boolean
        });
    });
  }
}

export default MyTJoinMyplan;

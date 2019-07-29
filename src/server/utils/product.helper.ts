/**
 * 상품 Helper
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-11-06
 */

import { DATA_UNIT, PREMTERM_MSG } from '../types/string.type';
import { PRODUCT_REPLACED_RULE, UNIT, VOICE_UNIT } from '../types/bff.type';
import FormatHelper from './format.helper';
import EnvHelper from './env.helper';

/**
 * @class
 */
class ProductHelper {
  /**
   * 약관 데이터 변환
   * @param stipulation - 약관 데이터
   * @param isInstallAgreement - 지원금 차액 정산금 동의
   */
  static convStipulation(stipulation: any, isInstallAgreement = false): any {
    if (FormatHelper.isEmpty(stipulation)) {
      return null;
    }

    /**
     * 약관 노출 가능 개수 산출
     * @param yNarray - 약관 동의 YN 배열
     */
    function _getStipulationCnt(yNarray) {
      let count = 0;

      yNarray.forEach(flag => {
        if (flag) {
          count++;
        }
      });

      return count;
    }

    /**
     * 약관 상세내용 HTML제거
     * @param isAgree - 사용여부
     * @param htmlContext - 약관 상세내용
     */
    function _getAgreementSummary(isAgree, htmlContext) {
      if (!isAgree) {
        return '';
      }

      return FormatHelper.stripTags(htmlContext);
    }

    /**
     * 약관 사용가능 여부
     * @param agreeYn - 약관 사용 여부
     * @param title - 제목
     * @param htmlCtt - 내용
     */
    function _isAgree(agreeYn: any, title: any, htmlCtt: any): boolean {
      return agreeYn === 'Y' && !FormatHelper.isEmpty(title) && !FormatHelper.isEmpty(htmlCtt);
    }

    const isScrbStplAgree = _isAgree(stipulation.scrbStplAgreeYn, stipulation.scrbStplAgreeTitNm, stipulation.scrbStplAgreeHtmlCtt),
      isPsnlInfoCnsgAgree = _isAgree(stipulation.psnlInfoCnsgAgreeYn, stipulation.psnlInfoCnsgAgreeTitNm, stipulation.psnlInfoCnsgHtmlCtt),
      isPsnlInfoOfrAgree = _isAgree(stipulation.psnlInfoOfrAgreeYn, stipulation.psnlInfoOfrAgreeTitNm, stipulation.psnlInfoOfrHtmlCtt),
      isAdInfoOfrAgree = _isAgree(stipulation.adInfoOfrAgreeYn, stipulation.adInfoOfrAgreeTitNm, stipulation.adInfoOfrHtmlCtt),
      isTermStplAgree = _isAgree(stipulation.termStplAgreeYn, stipulation.termStplAgreeTitNm, stipulation.termStplAgreeHtmlCtt);

    let existsCount = _getStipulationCnt([
      isScrbStplAgree,
      isPsnlInfoCnsgAgree,
      isPsnlInfoOfrAgree,
      isAdInfoOfrAgree,
      isTermStplAgree
      ]);

    if (isInstallAgreement) {
      existsCount++;
    }

    return Object.assign(stipulation, {
      isScrbStplAgree: isScrbStplAgree, // 가입약관동의
      isPsnlInfoCnsgAgree: isPsnlInfoCnsgAgree, // 개인정보위탁동의
      isPsnlInfoOfrAgree: isPsnlInfoOfrAgree, // 개인정보제공동의
      isAdInfoOfrAgree: isAdInfoOfrAgree, // 광고정보제공동의
      isTermStplAgree: isTermStplAgree, // 해지약관동의
      isAllAgree: existsCount > 1,  // 모두동의 노출 여부 (약관 2개이상)
      scrbStplAgreeCttSummary: _getAgreementSummary(isScrbStplAgree, stipulation.scrbStplAgreeHtmlCtt),
      psnlInfoCnsgCttSummary: _getAgreementSummary(isPsnlInfoCnsgAgree, stipulation.psnlInfoCnsgHtmlCtt),
      psnlInfoOfrCttSummary: _getAgreementSummary(isPsnlInfoOfrAgree, stipulation.psnlInfoOfrHtmlCtt),
      adInfoOfrCttSummary: _getAgreementSummary(isAdInfoOfrAgree, stipulation.adInfoOfrHtmlCtt),
      termStplAgreeCttSummary: _getAgreementSummary(isTermStplAgree, stipulation.termStplAgreeHtmlCtt),
      existsCount: existsCount  // 노출가능 약관 개수
    });
  }

  /**
   * 상품 명세 데이터 변환
   * @param basFeeInfo - 가격 (Optional)
   * @param basOfrDataQtyCtt - 데이터 (Optional)
   * @param basOfrVcallTmsCtt - 음성 (Optional)
   * @param basOfrCharCntCtt - 문자 (Optional)
   * @param basDataUnit - 데이터 단위
   * @param isVcallFormat - 음성 단위 사용여부
   */
  static convProductSpecifications(
    basFeeInfo?: any,
    basOfrDataQtyCtt?: any,
    basOfrVcallTmsCtt?: any,
    basOfrCharCntCtt?: any,
    basDataUnit = DATA_UNIT.MB,
    isVcallFormat = true
  ): any {
    /**
     * 데이터 검증
     * @param value - 인자 값
     */
    const isValid = value => {
      return !(FormatHelper.isEmpty(value) || ['0', '-'].indexOf(value) !== -1);
    };

    return {
      basFeeInfo: isValid(basFeeInfo) ? ProductHelper.convProductBasfeeInfo(basFeeInfo) : null,
      basOfrDataQtyCtt: isValid(basOfrDataQtyCtt) ? ProductHelper.convProductBasOfrDataQtyCtt(basOfrDataQtyCtt, basDataUnit) : null,
      basOfrVcallTmsCtt: isValid(basOfrVcallTmsCtt) ? ProductHelper.convProductBasOfrVcallTmsCtt(basOfrVcallTmsCtt, isVcallFormat) : null,
      basOfrCharCntCtt: isValid(basOfrCharCntCtt) ? ProductHelper.convProductBasOfrCharCntCtt(basOfrCharCntCtt) : null
    };
  }

  /**
   * 가격 변환
   * @param basFeeInfo - 가격 값
   */
  static convProductBasfeeInfo(basFeeInfo): any {
    const isNaNbasFeeInfo = isNaN(Number(basFeeInfo));

    return {
      isNaN: isNaNbasFeeInfo,
      value: isNaNbasFeeInfo ? basFeeInfo : FormatHelper.addComma(basFeeInfo)
    };
  }

  /**
   * 데이터 값 변환
   * @param basOfrDataQtyCtt - 데이터 값
   * @param dataUnit - 데이터 단위
   */
  static convProductBasOfrDataQtyCtt(basOfrDataQtyCtt, dataUnit = DATA_UNIT.MB): any {
    const isNaNbasOfrDataQtyCtt = isNaN(Number(basOfrDataQtyCtt));

    return {
      isNaN: isNaNbasOfrDataQtyCtt,
      value: isNaNbasOfrDataQtyCtt ? basOfrDataQtyCtt : FormatHelper.convDataFormat(basOfrDataQtyCtt, dataUnit)
    };
  }

  /**
   * 음성 값 변환
   * @param basOfrVcallTmsCtt - 음성 값
   * @param isVcallFormat - 음성 단위 사용 여부
   */
  static convProductBasOfrVcallTmsCtt(basOfrVcallTmsCtt, isVcallFormat = true): any {
    const isNaNbasOfrVcallTmsCtt = isNaN(Number(basOfrVcallTmsCtt));
    let replacedResult: any = null;

    PRODUCT_REPLACED_RULE.VCALL.forEach(ruleInfo => {
      if (ruleInfo.TARGET.indexOf(basOfrVcallTmsCtt) !== -1) {
        replacedResult = {
          isNaN: true,
          value: ruleInfo.RESULT
        };

        return false;
      }
    });

    if (!FormatHelper.isEmpty(replacedResult)) {
      return replacedResult;
    }

    return {
      isNaN: isNaNbasOfrVcallTmsCtt,
      value: isNaNbasOfrVcallTmsCtt ? basOfrVcallTmsCtt : (isVcallFormat ?
        FormatHelper.convVoiceMinFormatWithUnit(basOfrVcallTmsCtt) : FormatHelper.addComma(basOfrVcallTmsCtt) + VOICE_UNIT.MIN)
    };
  }

  /**
   * 문자 값 변환
   * @param basOfrCharCntCtt - 문자 값
   */
  static convProductBasOfrCharCntCtt(basOfrCharCntCtt): any {
    const isNaNbasOfrCharCntCtt = isNaN(Number(basOfrCharCntCtt));
    let replacedResult: any = null;

    PRODUCT_REPLACED_RULE.CHAR.forEach(ruleInfo => {
      if (ruleInfo.TARGET.indexOf(basOfrCharCntCtt) !== -1) {
        replacedResult = {
          isNaN: true,
          value: ruleInfo.RESULT,
          unit: null
        };

        return false;
      }
    });

    if (!FormatHelper.isEmpty(replacedResult)) {
      return replacedResult;
    }

    return {
      isNaN: isNaNbasOfrCharCntCtt,
      value: basOfrCharCntCtt,
      unit: UNIT['310']
    };
  }

  /**
   * 요금제 가입/해지 정보 변환
   * @param _joinTermInfo - 가입/해지 정보확인 API 응답 값
   */
  static convPlansJoinTermInfo(_joinTermInfo): any {
    const joinTermInfo = JSON.parse(JSON.stringify(_joinTermInfo)),
      convInstallAgreement = ProductHelper.convInstallmentAgreement(joinTermInfo.installmentAgreement);

    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convPlanPreInfo(joinTermInfo.preinfo),
      installmentAgreement: convInstallAgreement,
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo, convInstallAgreement.isInstallAgreement)
    });
  }

  /**
   * 요금제 가입/해지 기본정보 변환
   * @param preInfo - 가입/해지 기본정보
   */
  static convPlanPreInfo(preInfo): any {
    return Object.assign(preInfo, {
      frProdInfo: Object.assign(
        preInfo.frProdInfo,
        ProductHelper.convProductSpecifications(
          preInfo.frProdInfo.basFeeInfo,
          preInfo.frProdInfo.basOfrDataQtyCtt,
          preInfo.frProdInfo.basOfrVcallTmsCtt,
          preInfo.frProdInfo.basOfrCharCntCtt
        )
      ),
      toProdInfo: Object.assign(
        preInfo.toProdInfo,
        ProductHelper.convProductSpecifications(
          preInfo.toProdInfo.basFeeInfo,
          preInfo.toProdInfo.basOfrDataQtyCtt,
          preInfo.toProdInfo.basOfrVcallTmsCtt,
          preInfo.toProdInfo.basOfrCharCntCtt
        )
      ),
      autoJoinList: ProductHelper.convAutoJoinTermList(preInfo.autoJoinList),
      autoTermList: ProductHelper.convAutoJoinTermList(preInfo.autoTermList)
    });
  }

  /**
   * 지원금 차액 정산금 동의 변환
   * @param installmentAgreement - 지원금 차액 정산금 동의 데이터
   */
  static convInstallmentAgreement(installmentAgreement): any {
    const isNumberPenAmt = !isNaN(Number(installmentAgreement.penAmt)),
      isNumberFrDcAmt = !isNaN(Number(installmentAgreement.frDcAmt)),
      isNumberToDcAmt = !isNaN(Number(installmentAgreement.toDcAmt)),
      isNumberGapDcAmt = !isNaN(Number(installmentAgreement.gapDcAmt)),
      isPremTerm = installmentAgreement.premTermYn === 'Y',
      premTermYn = (installmentAgreement.agrmtUseCnt < 181 && isPremTerm);

    return Object.assign(installmentAgreement, {
      isInstallAgreement: installmentAgreement.gapDcAmt > 0,  // 지원금 차액 정산금 동의 노출 여부
      isNumberPenAmt: isNumberPenAmt,
      penAmt: isNumberPenAmt ? FormatHelper.addComma(installmentAgreement.penAmt) : installmentAgreement.penAmt,  // 위약금 (실지원금액)
      isNumberFrDcAmt: isNumberFrDcAmt,
      frDcAmt: isNumberFrDcAmt ? FormatHelper.addComma(installmentAgreement.frDcAmt) + UNIT['110'] : installmentAgreement.frDcAmt,  // 변경전 지원금액
      isNumberToDcAmt: isNumberToDcAmt,
      toDcAmt: isNumberToDcAmt ? FormatHelper.addComma(installmentAgreement.toDcAmt) + UNIT['110'] : installmentAgreement.toDcAmt,  // 변경후 지원금액
      isNumberGapDcAmt: isNumberGapDcAmt,
      gapDcAmt: isNumberGapDcAmt ? FormatHelper.addComma(installmentAgreement.gapDcAmt) + UNIT['110'] : installmentAgreement.gapDcAmt,  // 지원금 차액
      isPremTerm: isPremTerm, // 프리미엄패스 해지여부
      // premTermMsg: isPremTerm ? ProductHelper.getPremTermMsg(installmentAgreement.agrmtUseCnt) : null, // 프리미엄패스 해지시 안내문구
      premTermMsg: ProductHelper.getPremTermMsg(isPremTerm, installmentAgreement.agrmtUseCnt), // 프리미엄패스 가입고객 요금제 하향시 안내문구
      premTermYn: premTermYn // 프리미엄패스 안내문구 노출여부
    });
  }

  /**
   * 프리미엄패스 가입고객 요금제 하향시 안내문구 산출 (약정사용일수에 따라 다름)
   * @param agrmtUseCnt - 약정사용일수
   */
  static getPremTermMsg(isPremTerm, agrmtUseCnt): any {
    if (isPremTerm &&  agrmtUseCnt < 181) {// 180일 이하일때만 프리미엄패스1 해지여부 체크
      return PREMTERM_MSG.LESS_180;
    } else if (agrmtUseCnt > 180 && agrmtUseCnt < 366) {
      return PREMTERM_MSG.LESS_365;
    }
  }

  /**
   * 부가서비스 가입/해지 정보확인 변환
   * @param _joinTermInfo - 가입/해지 정보확인 값
   */
  static convAdditionsJoinTermInfo(_joinTermInfo): any {
    const joinTermInfo = JSON.parse(JSON.stringify(_joinTermInfo));

    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }

  /**
   * 부가서비스 가입/해지 기본 정보 변환
   * @param preInfo - 기본 정보
   */
  static convAdditionsPreInfo(preInfo): any {
    const isNumberBasFeeInfo = !isNaN(Number(preInfo.reqProdInfo.basFeeInfo));

    return Object.assign(preInfo, {
      reqProdInfo: Object.assign(preInfo.reqProdInfo, {
        isNumberBasFeeInfo: isNumberBasFeeInfo,
        basFeeInfo: isNumberBasFeeInfo ? FormatHelper.addComma(preInfo.reqProdInfo.basFeeInfo) : preInfo.reqProdInfo.basFeeInfo
      }),
      autoJoinList: ProductHelper.convAutoJoinTermList(preInfo.autoJoinList),
      autoTermList: ProductHelper.convAutoJoinTermList(preInfo.autoTermList)
    });
  }

  /**
   * 자동 가입/해지 목록 그룹화
   * @param autoList - 자동 가입/해지 목록
   */
  static convAutoJoinTermList(autoList): any {
    const autoListConvertResult: any = {};
    if (FormatHelper.isEmpty(autoList)) {
      return [];
    }

    autoList.forEach(item => {
      if (FormatHelper.isEmpty(autoListConvertResult[item.svcProdCd])) {
        autoListConvertResult[item.svcProdCd] = {
          svcProdNm: item.svcProdNm,
          svcProdList: []
        };
      }

      autoListConvertResult[item.svcProdCd].svcProdList.push(item.prodNm);
    });

    return Object.keys(autoListConvertResult).map(key => autoListConvertResult[key]);
  }

  /**
   * 유선 부가서비스 가입/해지 정보 변환
   * @param _joinTermInfo - 가입해지 정보
   * @param isJoin - 가입 여부
   */
  static convWireplanJoinTermInfo(_joinTermInfo, isJoin): any {
    const joinTermInfo = JSON.parse(JSON.stringify(_joinTermInfo));

    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convWireplanPreInfo(joinTermInfo.preinfo, isJoin),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }

  /**
   * 유선 부가서비스 가입/해지 기본 정보 변환
   * @param preInfo - 기본 정보
   * @param isJoin - 가입 여부
   */
  static convWireplanPreInfo(preInfo, isJoin): any {
    const isNumberBasFeeInfo = !isNaN(Number(preInfo.reqProdInfo.basFeeInfo));

    return Object.assign(preInfo, {
      reqProdInfo: Object.assign(preInfo.reqProdInfo, {
        isNumberBasFeeInfo: isNumberBasFeeInfo,
        basFeeInfo: isNumberBasFeeInfo ? FormatHelper.addComma(preInfo.reqProdInfo.basFeeInfo) : preInfo.reqProdInfo.basFeeInfo
      })
    });
  }

  /**
   * 리소스 앞 CDN url 추가
   * @param url - 주소 값
   */
  static getImageUrlWithCdn(url: string): string {
    const CDN = EnvHelper.getEnvironment('CDN');
    if (url.includes('http')) {
      return url;
    } else {
      return CDN + url;
    }
  }
}

export default ProductHelper;

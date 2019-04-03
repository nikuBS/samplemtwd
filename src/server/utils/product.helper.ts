import {DATA_UNIT, PREMTERM_MSG} from '../types/string.type';
import {PRODUCT_REPLACED_RULE, UNIT, VOICE_UNIT} from '../types/bff.type';
import FormatHelper from './format.helper';
import EnvHelper from './env.helper';

class ProductHelper {
  static convStipulation(stipulation: any, isInstallAgreement = false): any {
    if (FormatHelper.isEmpty(stipulation)) {
      return null;
    }

    function _getStipulationCnt(yNarray) {
      let count = 0;

      yNarray.forEach(flag => {
        if (flag) {
          count++;
        }
      });

      return count;
    }

    function _getAgreementSummary(isAgree, htmlContext) {
      if (!isAgree) {
        return '';
      }

      return FormatHelper.stripTags(htmlContext);
    }

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
      isScrbStplAgree: isScrbStplAgree,
      isPsnlInfoCnsgAgree: isPsnlInfoCnsgAgree,
      isPsnlInfoOfrAgree: isPsnlInfoOfrAgree,
      isAdInfoOfrAgree: isAdInfoOfrAgree,
      isTermStplAgree: isTermStplAgree,
      isAllAgree: existsCount > 1,
      scrbStplAgreeCttSummary: _getAgreementSummary(isScrbStplAgree, stipulation.scrbStplAgreeHtmlCtt),
      psnlInfoCnsgCttSummary: _getAgreementSummary(isPsnlInfoCnsgAgree, stipulation.psnlInfoCnsgHtmlCtt),
      psnlInfoOfrCttSummary: _getAgreementSummary(isPsnlInfoOfrAgree, stipulation.psnlInfoOfrHtmlCtt),
      adInfoOfrCttSummary: _getAgreementSummary(isAdInfoOfrAgree, stipulation.adInfoOfrHtmlCtt),
      termStplAgreeCttSummary: _getAgreementSummary(isTermStplAgree, stipulation.termStplAgreeHtmlCtt),
      existsCount: existsCount
    });
  }

  static convProductSpecifications(
    basFeeInfo?: any,
    basOfrDataQtyCtt?: any,
    basOfrVcallTmsCtt?: any,
    basOfrCharCntCtt?: any,
    basDataUnit = DATA_UNIT.MB,
    isVcallFormat = true
  ): any {
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

  static convProductBasfeeInfo(basFeeInfo): any {
    const isNaNbasFeeInfo = isNaN(Number(basFeeInfo));

    return {
      isNaN: isNaNbasFeeInfo,
      value: isNaNbasFeeInfo ? basFeeInfo : FormatHelper.addComma(basFeeInfo)
    };
  }

  static convProductBasOfrDataQtyCtt(basOfrDataQtyCtt, dataUnit = DATA_UNIT.MB): any {
    const isNaNbasOfrDataQtyCtt = isNaN(Number(basOfrDataQtyCtt));

    return {
      isNaN: isNaNbasOfrDataQtyCtt,
      value: isNaNbasOfrDataQtyCtt ? basOfrDataQtyCtt : FormatHelper.convDataFormat(basOfrDataQtyCtt, dataUnit)
    };
  }

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

  static convPlansJoinTermInfo(_joinTermInfo): any {
    const joinTermInfo = JSON.parse(JSON.stringify(_joinTermInfo)),
      convInstallAgreement = ProductHelper.convInstallmentAgreement(joinTermInfo.installmentAgreement);

    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convPlanPreInfo(joinTermInfo.preinfo),
      installmentAgreement: convInstallAgreement,
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo, convInstallAgreement.isInstallAgreement)
    });
  }

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

  static convInstallmentAgreement(installmentAgreement): any {
    const isNumberPenAmt = !isNaN(Number(installmentAgreement.penAmt)),
      isNumberFrDcAmt = !isNaN(Number(installmentAgreement.frDcAmt)),
      isNumberToDcAmt = !isNaN(Number(installmentAgreement.toDcAmt)),
      isNumberGapDcAmt = !isNaN(Number(installmentAgreement.gapDcAmt)),
      isPremTerm = installmentAgreement.premTermYn === 'Y';

    return Object.assign(installmentAgreement, {
      isInstallAgreement: installmentAgreement.gapDcAmt > 0,
      isNumberPenAmt: isNumberPenAmt,
      penAmt: isNumberPenAmt ? FormatHelper.addComma(installmentAgreement.penAmt) : installmentAgreement.penAmt,
      isNumberFrDcAmt: isNumberFrDcAmt,
      frDcAmt: isNumberFrDcAmt ? FormatHelper.addComma(installmentAgreement.frDcAmt) + UNIT['110'] : installmentAgreement.frDcAmt,
      isNumberToDcAmt: isNumberToDcAmt,
      toDcAmt: isNumberToDcAmt ? FormatHelper.addComma(installmentAgreement.toDcAmt) + UNIT['110'] : installmentAgreement.toDcAmt,
      isNumberGapDcAmt: isNumberGapDcAmt,
      gapDcAmt: isNumberGapDcAmt ? FormatHelper.addComma(installmentAgreement.gapDcAmt) + UNIT['110'] : installmentAgreement.gapDcAmt,
      isPremTerm: isPremTerm,
      premTermMsg: isPremTerm ? ProductHelper.getPremTermMsg(installmentAgreement.agrmtUseCnt) : null
    });
  }

  static getPremTermMsg(agrmtUseCnt: any): any {
    if (agrmtUseCnt < 181) {
      return PREMTERM_MSG.LESS_180;
    } else if (agrmtUseCnt > 180 && agrmtUseCnt < 366) {
      return PREMTERM_MSG.LESS_365;
    }
  }

  static convAdditionsJoinTermInfo(_joinTermInfo): any {
    const joinTermInfo = JSON.parse(JSON.stringify(_joinTermInfo));

    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }

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

  static convWireplanJoinTermInfo(_joinTermInfo, isJoin): any {
    const joinTermInfo = JSON.parse(JSON.stringify(_joinTermInfo));

    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convWireplanPreInfo(joinTermInfo.preinfo, isJoin),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }

  static convWireplanPreInfo(preInfo, isJoin): any {
    const isNumberBasFeeInfo = !isNaN(Number(preInfo.reqProdInfo.basFeeInfo));

    return Object.assign(preInfo, {
      reqProdInfo: Object.assign(preInfo.reqProdInfo, {
        isNumberBasFeeInfo: isNumberBasFeeInfo,
        basFeeInfo: isNumberBasFeeInfo ? FormatHelper.addComma(preInfo.reqProdInfo.basFeeInfo) : preInfo.reqProdInfo.basFeeInfo
      })
    });
  }

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

import { DATA_UNIT } from '../../../types/string.type';
import { UNIT } from '../../../types/bff.type';
import FormatHelper from '../../../utils/format.helper';

class ProductHelper {
  static convStipulation(stipulation: any): any {
    if (FormatHelper.isEmpty(stipulation) || FormatHelper.isEmpty(stipulation.stipulation)) {
      return null;
    }

    function _getStipulationYnCnt(yNarray) {
      let count = 0;

      yNarray.forEach(flag => {
        if (flag === 'Y') {
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

    const isScrbStplAgree = stipulation.stipulation.scrbStplAgreeYn === 'Y',
      isPsnlInfoCnsgAgree = stipulation.stipulation.termStplAgreeYn === 'Y',
      isPsnlInfoOfrAgree = stipulation.stipulation.psnlInfoCnsgAgreeYn === 'Y',
      isAdInfoOfrAgree = stipulation.stipulation.adInfoOfrAgreeYn === 'Y',
      isTermStplAgree = stipulation.stipulation.termStplAgreeYn === 'Y',
      existsCount = _getStipulationYnCnt([
        stipulation.stipulation.scrbStplAgreeYn,
        stipulation.stipulation.termStplAgreeYn,
        stipulation.stipulation.psnlInfoCnsgAgreeYn,
        stipulation.stipulation.psnlInfoOfrAgreeYn,
        stipulation.stipulation.adInfoOfrAgreeYn
      ]);

    return Object.assign(stipulation, {
      stipulation: Object.assign(stipulation.stipulation, {
        isScrbStplAgree: isScrbStplAgree,
        isPsnlInfoCnsgAgree: isPsnlInfoCnsgAgree,
        isPsnlInfoOfrAgree: isPsnlInfoOfrAgree,
        isAdInfoOfrAgree: isAdInfoOfrAgree,
        isTermStplAgree: isTermStplAgree,
        isAllAgree: existsCount > 1,
        scrbStplAgreeCttSummary: _getAgreementSummary(isScrbStplAgree, stipulation.stipulation.scrbStplAgreeHtmlCtt),
        termStplAgreeCttSummary: _getAgreementSummary(isPsnlInfoCnsgAgree, stipulation.stipulation.termStplAgreeHtmlCtt),
        psnlInfoCnsgCttSummary: _getAgreementSummary(isPsnlInfoOfrAgree, stipulation.stipulation.psnlInfoCnsgHtmlCtt),
        psnlInfoOfrCttSummary: _getAgreementSummary(isAdInfoOfrAgree, stipulation.stipulation.psnlInfoOfrHtmlCtt),
        adInfoOfrCttSummary: _getAgreementSummary(isTermStplAgree, stipulation.stipulation.psnlInfoCnsgHtmlCtt),
        existsCount: existsCount
      })
    });
  }

  static convProductSpecifications(
    basFeeInfo?: any,
    basOfrDataQtyCtt?: any,
    basOfrVcallTmsCtt?: any,
    basOfrCharCntCtt?: any,
    basDataUnit = DATA_UNIT.MB
  ): any {
    const isValid = value => {
      return !(FormatHelper.isEmpty(value) || ['0', '-'].indexOf(value) !== -1);
    };

    return {
      basFeeInfo: isValid(basFeeInfo) ? ProductHelper.convProductBasfeeInfo(basFeeInfo) : null,
      basOfrDataQtyCtt: isValid(basOfrDataQtyCtt) ? ProductHelper.convProductBasOfrDataQtyCtt(basOfrDataQtyCtt, basDataUnit) : null,
      basOfrVcallTmsCtt: isValid(basOfrVcallTmsCtt) ? ProductHelper.convProductBasOfrVcallTmsCtt(basOfrVcallTmsCtt) : null,
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

  static convProductBasOfrVcallTmsCtt(basOfrVcallTmsCtt): any {
    const isNaNbasOfrVcallTmsCtt = isNaN(Number(basOfrVcallTmsCtt));

    return {
      isNaN: isNaNbasOfrVcallTmsCtt,
      value: isNaNbasOfrVcallTmsCtt ? basOfrVcallTmsCtt : FormatHelper.convVoiceMinFormatWithUnit(isNaNbasOfrVcallTmsCtt)
    };
  }

  static convProductBasOfrCharCntCtt(basOfrCharCntCtt): any {
    const isNaNbasOfrCharCntCtt = isNaN(Number(basOfrCharCntCtt));

    return {
      isNaN: isNaNbasOfrCharCntCtt,
      value: basOfrCharCntCtt,
      unit: UNIT['310']
    };
  }

  static convPlansJoinTermInfo(joinTermInfo): any {
    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convPlanPreInfo(joinTermInfo.preinfo),
      installmentAgreement: ProductHelper.convInstallmentAgreement(joinTermInfo.installmentAgreement),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
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
      isNumberGapDcAmt = !isNaN(Number(installmentAgreement.gapDcAmt));

    return Object.assign(installmentAgreement, {
      isNumberPenAmt: isNumberPenAmt,
      penAmt: isNumberPenAmt ? FormatHelper.addComma(installmentAgreement.penAmt) : installmentAgreement.penAmt,
      isNumberFrDcAmt: isNumberFrDcAmt,
      frDcAmt: isNumberFrDcAmt ? FormatHelper.addComma(installmentAgreement.frDcAmt) + UNIT['110'] : installmentAgreement.frDcAmt,
      isNumberToDcAmt: isNumberToDcAmt,
      toDcAmt: isNumberToDcAmt ? FormatHelper.addComma(installmentAgreement.toDcAmt) + UNIT['110'] : installmentAgreement.toDcAmt,
      isNumberGapDcAmt: isNumberGapDcAmt,
      gapDcAmt: isNumberGapDcAmt ? FormatHelper.addComma(installmentAgreement.gapDcAmt) + UNIT['110'] : installmentAgreement.gapDcAmt,
      agrmtDayCnt: ProductHelper.calcAgrmtMonth(installmentAgreement.agrmtDayCnt),
      agrmtUseCnt: ProductHelper.calcAgrmtMonth(installmentAgreement.agrmtUseCnt)
    });
  }

  static calcAgrmtMonth(days): any {
    return days / 30.4;
  }

  static convAdditionsJoinTermInfo(joinTermInfo): any {
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

  static convWireplanJoinTermInfo(joinTermInfo): any {
    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convWireplanPreInfo(joinTermInfo.preinfo),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }

  static convWireplanPreInfo(preInfo): any {
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
}

export default ProductHelper;

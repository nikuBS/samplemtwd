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

      yNarray.forEach((flag) => {
        if (flag === 'Y') {
          count++;
        }
      });

      return count;
    }

    return Object.assign(stipulation, {
      stipulation: Object.assign(stipulation.stipulation, {
        scrbStplAgreeCttSummary: stipulation.stipulation.scrbStplAgreeYn === 'Y' ?
            FormatHelper.stripTags(stipulation.stipulation.scrbStplAgreeHtmlCtt) : '',
        termStplAgreeCttSummary: stipulation.stipulation.termStplAgreeYn === 'Y' ?
            FormatHelper.stripTags(stipulation.stipulation.termStplAgreeHtmlCtt) : '',
        psnlInfoCnsgCttSummary: stipulation.stipulation.psnlInfoCnsgAgreeYn === 'Y' ?
            FormatHelper.stripTags(stipulation.stipulation.psnlInfoCnsgHtmlCtt) : '',
        psnlInfoOfrCttSummary: stipulation.stipulation.psnlInfoOfrAgreeYn === 'Y' ?
            FormatHelper.stripTags(stipulation.stipulation.psnlInfoOfrHtmlCtt) : '',
        adInfoOfrCttSummary: stipulation.stipulation.adInfoOfrAgreeYn === 'Y' ?
            FormatHelper.stripTags(stipulation.stipulation.psnlInfoCnsgHtmlCtt) : '',
        existsCount: _getStipulationYnCnt([stipulation.stipulation.scrbStplAgreeYn, stipulation.stipulation.psnlInfoCnsgAgreeYn,
          stipulation.stipulation.psnlInfoOfrAgreeYn, stipulation.stipulation.adInfoOfrAgreeYn])
      })
    });
  }

  static convProductSpecifications(basFeeInfo?: any, basOfrDataQtyCtt?: any, basOfrVcallTmsCtt?: any,
    basOfrCharCntCtt?: any, basDataUnit = DATA_UNIT.MB): any {
    const isValid = (value) => {
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
    const isNaNbasFeeInfo = isNaN(parseInt(basFeeInfo, 10));

    return {
      isNaN: isNaNbasFeeInfo,
      value: isNaNbasFeeInfo ? basFeeInfo : FormatHelper.addComma(basFeeInfo)
    };
  }

  static convProductBasOfrDataQtyCtt(basOfrDataQtyCtt, dataUnit = DATA_UNIT.MB): any {
    const isNaNbasOfrDataQtyCtt = isNaN(parseInt(basOfrDataQtyCtt, 10));

    return {
      isNaN: isNaNbasOfrDataQtyCtt,
      value: isNaNbasOfrDataQtyCtt ? basOfrDataQtyCtt : FormatHelper.convDataFormat(basOfrDataQtyCtt, dataUnit)
    };
  }

  static convProductBasOfrVcallTmsCtt(basOfrVcallTmsCtt): any {
    const isNaNbasOfrVcallTmsCtt = isNaN(parseInt(basOfrVcallTmsCtt, 10));

    return {
      isNaN: isNaNbasOfrVcallTmsCtt,
      value: isNaNbasOfrVcallTmsCtt ? basOfrVcallTmsCtt : FormatHelper.convVoiceMinFormatWithUnit(isNaNbasOfrVcallTmsCtt)
    };
  }

  static convProductBasOfrCharCntCtt(basOfrCharCntCtt): any {
    const isNaNbasOfrCharCntCtt = isNaN(parseInt(basOfrCharCntCtt, 10));

    return {
      isNaN: isNaNbasOfrCharCntCtt,
      value: basOfrCharCntCtt,
      unit: UNIT['310']
    };
  }

  static convAdditionsJoinTermInfo(joinTermInfo): any {
    return Object.assign(joinTermInfo, {
      preinfo: ProductHelper.convAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  }

  static convAdditionsPreInfo(preInfo): any {
    const isNumberBasFeeInfo = !isNaN(parseInt(preInfo.reqProdInfo.basFeeInfo, 10));

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
    const autoListConvertResult: any = [];

    autoList.forEach((item) => {
      if (FormatHelper.isEmpty(autoListConvertResult[item.svcProdCd])) {
        autoListConvertResult[item.svcProdCd] = {
          svcProdNm: item.svcProdNm,
          svcProdList: []
        };
      }

      autoListConvertResult[item.svcProdCd].svcProdList.push(item.prodNm);
    });

    return autoListConvertResult;
  }
}

export default ProductHelper;

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

  static convProductSpecifications(basFeeInfo?: any, basOfrDataQtyCtt?: any, basOfrVcallTmsCtt?: any, basOfrCharCntCtt?: any): any {
    const isValid = (value) => {
      return !(FormatHelper.isEmpty(value) || ['0', '-'].indexOf(value) !== -1);
    };

    return {
      basFeeInfo: isValid(basFeeInfo) ? ProductHelper.convProductBasfeeInfo(basFeeInfo) : null,
      basOfrDataQtyCtt: isValid(basOfrDataQtyCtt) ? ProductHelper.convProductBasOfrDataQtyCtt(basOfrDataQtyCtt) : null,
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

  static convProductBasOfrDataQtyCtt(basOfrDataQtyCtt): any {
    const isNaNbasOfrDataQtyCtt = isNaN(parseInt(basOfrDataQtyCtt, 10));

    return {
      isNaN: isNaNbasOfrDataQtyCtt,
      value: isNaNbasOfrDataQtyCtt ? basOfrDataQtyCtt : FormatHelper.convDataFormat(basOfrDataQtyCtt, DATA_UNIT.MB)
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
}

export default ProductHelper;

Tw.ProductHelper = (function () {

  var convProductSpecifications = function (basFeeInfo, basOfrDataQtyCtt, basOfrVcallTmsCtt, basOfrCharCntCtt, _basDataUnit, _isVcallFormat) {
    var basDataUnit = _basDataUnit || Tw.DATA_UNIT.MD,
      isVcallFormat = _isVcallFormat || true,
      isValid = function (value) {
      return !(Tw.FormatHelper.isEmpty(value) || ['0', '-'].indexOf(value) !== -1);
    };

    return {
      basFeeInfo: isValid(basFeeInfo) ? Tw.ProductHelper.convProductBasfeeInfo(basFeeInfo) : null,
      basOfrDataQtyCtt: isValid(basOfrDataQtyCtt) ? Tw.ProductHelper.convProductBasOfrDataQtyCtt(basOfrDataQtyCtt, basDataUnit) : null,
      basOfrVcallTmsCtt: isValid(basOfrVcallTmsCtt) ? Tw.ProductHelper.convProductBasOfrVcallTmsCtt(basOfrVcallTmsCtt, isVcallFormat) : null,
      basOfrCharCntCtt: isValid(basOfrCharCntCtt) ? Tw.ProductHelper.convProductBasOfrCharCntCtt(basOfrCharCntCtt) : null
    };
  };

  var convProductBasfeeInfo = function (basFeeInfo) {
    var isNaNbasFeeInfo = isNaN(Number(basFeeInfo));

    return {
      isNaN: isNaNbasFeeInfo,
      value: isNaNbasFeeInfo ? basFeeInfo : Tw.FormatHelper.addComma(basFeeInfo)
    };
  };

  var convProductBasOfrDataQtyCtt = function (basOfrDataQtyCtt, _dataUnit) {
    var isNaNbasOfrDataQtyCtt = isNaN(Number(basOfrDataQtyCtt)),
      dataUnit = _dataUnit || Tw.DATA_UNIT.MB;

    return {
      isNaN: isNaNbasOfrDataQtyCtt,
      value: isNaNbasOfrDataQtyCtt ? basOfrDataQtyCtt : Tw.FormatHelper.convDataFormat(basOfrDataQtyCtt, dataUnit)
    };
  };

  var convProductBasOfrVcallTmsCtt = function (basOfrVcallTmsCtt, _isVcallFormat) {
    var isNaNbasOfrVcallTmsCtt = isNaN(Number(basOfrVcallTmsCtt)),
      isVcallFormat = _isVcallFormat || true,
      replacedResult = null;

    $.each(Tw.PRODUCT_REPLACED_RULE.VCALL, function(idx, ruleInfo) {
      if (ruleInfo.TARGET.indexOf(basOfrVcallTmsCtt) !== -1) {
        replacedResult = {
          isNaN: true,
          value: ruleInfo.RESULT
        };

        return false;
      }
    });

    if (!Tw.FormatHelper.isEmpty(replacedResult)) {
      return replacedResult;
    }

    return {
      isNaN: isNaNbasOfrVcallTmsCtt,
      value: isNaNbasOfrVcallTmsCtt ? basOfrVcallTmsCtt : (isVcallFormat ?
        Tw.FormatHelper.convVoiceMinFormatWithUnit(basOfrVcallTmsCtt) : Tw.FormatHelper.addComma(basOfrVcallTmsCtt) + Tw.VOICE_UNIT.MIN)
    };
  };

  var convProductBasOfrCharCntCtt = function (basOfrCharCntCtt) {
    var isNaNbasOfrCharCntCtt = isNaN(Number(basOfrCharCntCtt)),
      replacedResult = null;

    $.each(Tw.PRODUCT_REPLACED_RULE.CHAR, function(idx, ruleInfo) {
      if (ruleInfo.TARGET.indexOf(basOfrCharCntCtt) !== -1) {
        replacedResult = {
          isNaN: true,
          value: ruleInfo.RESULT,
          unit: null
        };

        return false;
      }
    });

    if (!Tw.FormatHelper.isEmpty(replacedResult)) {
      return replacedResult;
    }

    return {
      isNaN: isNaNbasOfrCharCntCtt,
      value: basOfrCharCntCtt,
      unit: Tw.UNIT['310']
    };
  };

  var convPlansJoinTermInfo = function(joinTermInfo) {
    var convInstallmentAgreement = Tw.ProductHelper.convInstallmentAgreement(joinTermInfo.installmentAgreement);
    return $.extend(joinTermInfo, {
      preinfo: Tw.ProductHelper.convPlanPreInfo(joinTermInfo.preinfo),
      installmentAgreement: convInstallmentAgreement,
      stipulationInfo: Tw.ProductHelper.convStipulation(joinTermInfo.stipulationInfo, convInstallmentAgreement.isInstallAgreement)
    });
  };

  var convPlanPreInfo = function(preInfo) {
    return $.extend(preInfo, {
      frProdInfo: $.extend(
        preInfo.frProdInfo,
        Tw.ProductHelper.convProductSpecifications(
          preInfo.frProdInfo.basFeeInfo,
          preInfo.frProdInfo.basOfrDataQtyCtt,
          preInfo.frProdInfo.basOfrVcallTmsCtt,
          preInfo.frProdInfo.basOfrCharCntCtt
        )
      ),
      toProdInfo: $.extend(
        preInfo.toProdInfo,
        Tw.ProductHelper.convProductSpecifications(
          preInfo.toProdInfo.basFeeInfo,
          preInfo.toProdInfo.basOfrDataQtyCtt,
          preInfo.toProdInfo.basOfrVcallTmsCtt,
          preInfo.toProdInfo.basOfrCharCntCtt
        )
      ),
      autoJoinList: Tw.ProductHelper.convAutoJoinTermList(preInfo.autoJoinList),
      autoTermList: Tw.ProductHelper.convAutoJoinTermList(preInfo.autoTermList)
    });
  };

  var convInstallmentAgreement = function(installmentAgreement) {
    var isNumberPenAmt = !isNaN(Number(installmentAgreement.penAmt)),
      isNumberFrDcAmt = !isNaN(Number(installmentAgreement.frDcAmt)),
      isNumberToDcAmt = !isNaN(Number(installmentAgreement.toDcAmt)),
      isNumberGapDcAmt = !isNaN(Number(installmentAgreement.gapDcAmt)),
      isPremTerm = installmentAgreement.premTermYn === 'Y';

    return $.extend(installmentAgreement, {
      isInstallAgreement: installmentAgreement.gapDcAmt > 0,
      isNumberPenAmt: isNumberPenAmt,
      penAmt: isNumberPenAmt ? Tw.FormatHelper.addComma(installmentAgreement.penAmt) : installmentAgreement.penAmt,
      isNumberFrDcAmt: isNumberFrDcAmt,
      frDcAmt: isNumberFrDcAmt ? Tw.FormatHelper.addComma(installmentAgreement.frDcAmt) + Tw.UNIT['110'] : installmentAgreement.frDcAmt,
      isNumberToDcAmt: isNumberToDcAmt,
      toDcAmt: isNumberToDcAmt ? Tw.FormatHelper.addComma(installmentAgreement.toDcAmt) + Tw.UNIT['110'] : installmentAgreement.toDcAmt,
      isNumberGapDcAmt: isNumberGapDcAmt,
      gapDcAmt: isNumberGapDcAmt ? Tw.FormatHelper.addComma(installmentAgreement.gapDcAmt) + Tw.UNIT['110'] : installmentAgreement.gapDcAmt,
      isPremTerm: isPremTerm,
      premTermMsg: isPremTerm ? Tw.ProductHelper.getPremTermMsg(installmentAgreement.agrmtUseCnt) : null
    });
  };

  var getPremTermMsg = function(agrmtUseCnt) {
    if (agrmtUseCnt < 181) {
      return Tw.PREMTERM_MSG.LESS_180;
    } else if (agrmtUseCnt > 180 && agrmtUseCnt < 366) {
      return Tw.PREMTERM_MSG.LESS_365;
    }
  };

  var convStipulation = function(stipulation, isInstallAgreement) {
    if (Tw.FormatHelper.isEmpty(stipulation)) {
      return null;
    }

    function _getStipulationYnCnt(yNarray) {
      var count = 0;

      $.each(yNarray, function(idx, flag) {
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

      return Tw.FormatHelper.stripTags(htmlContext);
    }

    var isScrbStplAgree = stipulation.scrbStplAgreeYn === 'Y',
      isPsnlInfoCnsgAgree = stipulation.psnlInfoCnsgAgreeYn === 'Y',
      isPsnlInfoOfrAgree = stipulation.psnlInfoOfrAgreeYn === 'Y',
      isAdInfoOfrAgree = stipulation.adInfoOfrAgreeYn === 'Y',
      isTermStplAgree = stipulation.termStplAgreeYn === 'Y',
      existsCount = _getStipulationYnCnt([
        stipulation.scrbStplAgreeYn,
        stipulation.psnlInfoCnsgAgreeYn,
        stipulation.psnlInfoOfrAgreeYn,
        stipulation.adInfoOfrAgreeYn,
        stipulation.termStplAgreeYn
      ]);

    if (isInstallAgreement) {
      existsCount++;
    }

    return $.extend(stipulation, {
      isScrbStplAgree: isScrbStplAgree,
      isPsnlInfoCnsgAgree: isPsnlInfoCnsgAgree,
      isPsnlInfoOfrAgree: isPsnlInfoOfrAgree,
      isAdInfoOfrAgree: isAdInfoOfrAgree,
      isTermStplAgree: isTermStplAgree,
      isAllAgree: existsCount > 1,
      scrbStplAgreeCttSummary: _getAgreementSummary(isScrbStplAgree, stipulation.scrbStplAgreeHtmlCtt),
      psnlInfoCnsgCttSummary: _getAgreementSummary(isPsnlInfoCnsgAgree, stipulation.psnlInfoCnsgHtmlCtt),
      psnlInfoOfrCttSummary: _getAgreementSummary(isPsnlInfoOfrAgree, stipulation.psnlInfoOfrHtmlCtt),
      adInfoOfrCttSummary: _getAgreementSummary(isAdInfoOfrAgree, stipulation.psnlInfoCnsgHtmlCtt),
      termStplAgreeCttSummary: _getAgreementSummary(isTermStplAgree, stipulation.termStplAgreeHtmlCtt),
      existsCount: existsCount
    });
  };

  var convAutoJoinTermList = function(autoList) {
    var autoListConvertResult = {};
    if (Tw.FormatHelper.isEmpty(autoList)) {
      return [];
    }

    $.each(autoList, function(idx, item) {
      if (Tw.FormatHelper.isEmpty(autoListConvertResult[item.svcProdCd])) {
        autoListConvertResult[item.svcProdCd] = {
          svcProdNm: item.svcProdNm,
          svcProdList: []
        };
      }

      autoListConvertResult[item.svcProdCd].svcProdList.push(item.prodNm);
    });

    return _.values(autoListConvertResult);
  };

  /**
   * MB/MB to GB/GB or MB/MB
   * @param _dataIfAmt
   * @param _dataBasAmt
   */
  var convDataAmtIfAndBas = function(_dataIfAmt, _dataBasAmt) {
    var dataIfAmt = parseFloat(_dataIfAmt),
      dataBasAmt = parseFloat(_dataBasAmt);

    if (dataIfAmt >= 1024 && dataBasAmt >= 1024) {
      var ifAmt = Tw.FormatHelper.convDataFormat(dataIfAmt, 'MB'),
        basAmt = Tw.FormatHelper.convDataFormat(dataBasAmt, 'MB');

      return {
        dataIfAmt: ifAmt.data,
        dataBasAmt: basAmt.data,
        unit: ifAmt.unit
      };
    }

    return {
      dataIfAmt: Math.floor(dataIfAmt),
      dataBasAmt: Math.floor(dataBasAmt),
      unit: Tw.DATA_UNIT.MB
    };
  };

  return {
    convProductSpecifications: convProductSpecifications,
    convProductBasfeeInfo: convProductBasfeeInfo,
    convProductBasOfrDataQtyCtt: convProductBasOfrDataQtyCtt,
    convProductBasOfrVcallTmsCtt: convProductBasOfrVcallTmsCtt,
    convProductBasOfrCharCntCtt: convProductBasOfrCharCntCtt,
    convPlansJoinTermInfo: convPlansJoinTermInfo,
    convPlanPreInfo: convPlanPreInfo,
    convInstallmentAgreement: convInstallmentAgreement,
    convStipulation: convStipulation,
    convAutoJoinTermList: convAutoJoinTermList,
    convDataAmtIfAndBas: convDataAmtIfAndBas,
    getPremTermMsg: getPremTermMsg
  };
})();
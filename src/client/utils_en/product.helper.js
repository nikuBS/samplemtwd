Tw.ProductHelper = (function () {

  /**
   * @function
   * @desc 상품 명세 데이터 변환
   * @param basFeeInfo - 가격
   * @param basOfrDataQtyCtt - 데이터
   * @param basOfrVcallTmsCtt - 음성
   * @param basOfrCharCntCtt - 문자
   * @param _basDataUnit - 데이터 단위
   * @param _isVcallFormat - 음성 단위 사용 여부
   * @returns {{basFeeInfo: *, basOfrVcallTmsCtt: *, basOfrCharCntCtt: *, basOfrDataQtyCtt: *}}
   */
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

  /**
   * @function
   * @desc 가격 변환
   * @param basFeeInfo - 가격 값
   * @returns {{isNaN: boolean, value: *}}
   */
  var convProductBasfeeInfo = function (basFeeInfo) {
    var isNaNbasFeeInfo = isNaN(Number(basFeeInfo));

    return {
      isNaN: isNaNbasFeeInfo,
      value: isNaNbasFeeInfo ? basFeeInfo : Tw.FormatHelper.addComma(basFeeInfo)
    };
  };

  /**
   * @function
   * @desc 데이터 값 변환
   * @param basOfrDataQtyCtt - 데이터 값
   * @param _dataUnit - 데이터 단위
   * @returns {{isNaN: boolean, value: {unit, data}}}
   */
  var convProductBasOfrDataQtyCtt = function (basOfrDataQtyCtt, _dataUnit) {
    var isNaNbasOfrDataQtyCtt = isNaN(Number(basOfrDataQtyCtt)),
      dataUnit = _dataUnit || Tw.DATA_UNIT.MB;

    return {
      isNaN: isNaNbasOfrDataQtyCtt,
      value: isNaNbasOfrDataQtyCtt ? basOfrDataQtyCtt : Tw.FormatHelper.convDataFormat(basOfrDataQtyCtt, dataUnit)
    };
  };

  /**
   * @function
   * @desc 음성 값 변환
   * @param basOfrVcallTmsCtt - 음성 값
   * @param _isVcallFormat - 음성 단위 사용 여부
   * @returns {{isNaN: boolean, value: string}|*}
   */
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

  /**
   * @function
   * @desc 문자 값 변환
   * @param basOfrCharCntCtt - 문자 값
   * @returns {{unit: *, isNaN: boolean, value: *}|*}
   */
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

  /**
   * @function
   * @desc 요금제 가입/해지 정보 변환
   * @param joinTermInfo - 가입/해지 정보확인 API 응답 값
   * @returns {this & {preinfo: any, stipulationInfo: any, installmentAgreement: any}}
   */
  var convPlansJoinTermInfo = function(joinTermInfo) {
    var convInstallmentAgreement = Tw.ProductHelper.convInstallmentAgreement(joinTermInfo.installmentAgreement);
    return $.extend(joinTermInfo, {
      preinfo: Tw.ProductHelper.convPlanPreInfo(joinTermInfo.preinfo),
      installmentAgreement: convInstallmentAgreement,
      stipulationInfo: Tw.ProductHelper.convStipulation(joinTermInfo.stipulationInfo, convInstallmentAgreement.isInstallAgreement)
    });
  };

  /**
   * @function
   * @desc 요금제 가입/해지 기본정보 변환
   * @param preInfo - 가입/해지 기본정보
   * @returns {this & {autoTermList: Array, toProdInfo: (this & {basFeeInfo: *, basOfrVcallTmsCtt: *,
   * basOfrCharCntCtt: *, basOfrDataQtyCtt: *}) | (this & {basFeeInfo, basOfrVcallTmsCtt, basOfrCharCntCtt,
   * basOfrDataQtyCtt}), autoJoinList: Array, frProdInfo: (this & {basFeeInfo: *, basOfrVcallTmsCtt: *,
   * basOfrCharCntCtt: *, basOfrDataQtyCtt: *}) | (this & {basFeeInfo, basOfrVcallTmsCtt, basOfrCharCntCtt,
   * basOfrDataQtyCtt})}}
   */
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

  /**
   * @function
   * @desc 부가서비스 가입/해지 정보확인 변환
   * @param _joinTermInfo - 가입/해지 정보확인 값
   * @returns {this & {preinfo: any, stipulationInfo: any}}
   */
  var convAdditionsJoinTermInfo = function(_joinTermInfo) {
    var joinTermInfo = JSON.parse(JSON.stringify(_joinTermInfo));

    return $.extend(joinTermInfo, {
      preinfo: Tw.ProductHelper.convAdditionsPreInfo(joinTermInfo.preinfo),
      stipulationInfo: Tw.ProductHelper.convStipulation(joinTermInfo.stipulationInfo)
    });
  };

  /**
   * @function
   * @desc 부가서비스 가입/해지 기본 정보 변환
   * @param preInfo - 기본 정보
   * @returns {this & {autoTermList: Array, autoJoinList: Array, reqProdInfo: this & {basFeeInfo: *, isNumberBasFeeInfo: boolean}}}
   */
  var convAdditionsPreInfo = function(preInfo) {
    var isNumberBasFeeInfo = !isNaN(Number(preInfo.reqProdInfo.basFeeInfo));

    return $.extend(preInfo, {
      reqProdInfo: $.extend(preInfo.reqProdInfo, {
        isNumberBasFeeInfo: isNumberBasFeeInfo,
        basFeeInfo: isNumberBasFeeInfo ? Tw.FormatHelper.addComma(preInfo.reqProdInfo.basFeeInfo) : preInfo.reqProdInfo.basFeeInfo
      }),
      autoJoinList: Tw.ProductHelper.convAutoJoinTermList(preInfo.autoJoinList),
      autoTermList: Tw.ProductHelper.convAutoJoinTermList(preInfo.autoTermList)
    });
  };

  /**
   * @function
   * @desc 지원금 차액 정산금 동의 변환
   * @param installmentAgreement - 지원금 차액 정산금 동의 데이터
   * @returns {this & {isNumberGapDcAmt: boolean, isNumberFrDcAmt: boolean, isPremTerm: boolean, gapDcAmt: *,
   * isNumberPenAmt: boolean, toDcAmt: *, isNumberToDcAmt: boolean, premTermMsg: *,
   * frDcAmt: *, isInstallAgreement: boolean, penAmt: *}}
   */
  var convInstallmentAgreement = function(installmentAgreement) {
    var isNumberPenAmt = !isNaN(Number(installmentAgreement.penAmt)),
      isNumberFrDcAmt = !isNaN(Number(installmentAgreement.frDcAmt)),
      isNumberToDcAmt = !isNaN(Number(installmentAgreement.toDcAmt)),
      isNumberGapDcAmt = !isNaN(Number(installmentAgreement.gapDcAmt)),
      isPremTerm = installmentAgreement.premTermYn === 'Y';

    return $.extend(installmentAgreement, {
      isInstallAgreement: installmentAgreement.penAmt > 0,
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

  /**
   * @function
   * @desc 프리미엄패스 해지시 안내문구 산출 (약정사용일수에 따라 다름)
   * @param agrmtUseCnt - 약정사용일수
   * @returns {string|*}
   */
  var getPremTermMsg = function(agrmtUseCnt) {
    if (agrmtUseCnt < 181) {
      return Tw.PREMTERM_MSG.LESS_180;
    } else if (agrmtUseCnt > 180 && agrmtUseCnt < 366) {
      return Tw.PREMTERM_MSG.LESS_365;
    }
  };

  /**
   * @function
   * @desc 약관 데이터 변환
   * @param stipulation - 약관 데이터
   * @param isInstallAgreement - 지원금 차액 정산금 동의
   * @returns {null|(this & {isScrbStplAgree: *, isPsnlInfoCnsgAgree: *, scrbStplAgreeCttSummary: string,
   * termStplAgreeCttSummary: string, isPsnlInfoOfrAgree: *, psnlInfoCnsgCttSummary: string, existsCount: number,
   * isAdInfoOfrAgree: *, isTermStplAgree: *, psnlInfoOfrCttSummary: string, adInfoOfrCttSummary: string, isAllAgree: boolean})}
   */
  var convStipulation = function(stipulation, isInstallAgreement) {
    if (Tw.FormatHelper.isEmpty(stipulation)) {
      return null;
    }

    /**
     * @function
     * @desc 약관 노출 가능 개수 산출
     * @param yNarray - 약관 동의 YN 배열
     * @returns {number}
     */
    function _getStipulationCnt(yNarray) {
      var count = 0;

      $.each(yNarray, function(idx, flag) {
        if (flag) {
          count++;
        }
      });

      return count;
    }

    /**
     * @function
     * @desc 약관 상세내용 HTML제거
     * @param isAgree - 사용여부
     * @param htmlContext - 약관 상세내용
     * @returns {string}
     */
    function _getAgreementSummary(isAgree, htmlContext) {
      if (!isAgree) {
        return '';
      }

      return Tw.FormatHelper.stripTags(htmlContext);
    }

    /**
     * @function
     * @desc 약관 사용가능 여부
     * @param agreeYn - 약관 사용 여부
     * @param title - 제목
     * @param htmlCtt - 내용
     * @returns {boolean}
     */
    function _isAgree(agreeYn, title, htmlCtt) {
      return agreeYn === 'Y' && !Tw.FormatHelper.isEmpty(title) && !Tw.FormatHelper.isEmpty(htmlCtt);
    }

    var isScrbStplAgree = _isAgree(stipulation.scrbStplAgreeYn, stipulation.scrbStplAgreeTitNm, stipulation.scrbStplAgreeHtmlCtt),
      isPsnlInfoCnsgAgree = _isAgree(stipulation.psnlInfoCnsgAgreeYn, stipulation.psnlInfoCnsgAgreeTitNm, stipulation.psnlInfoCnsgHtmlCtt),
      isPsnlInfoOfrAgree = _isAgree(stipulation.psnlInfoOfrAgreeYn, stipulation.psnlInfoOfrAgreeTitNm, stipulation.psnlInfoOfrHtmlCtt),
      isAdInfoOfrAgree = _isAgree(stipulation.adInfoOfrAgreeYn, stipulation.adInfoOfrAgreeTitNm, stipulation.adInfoOfrHtmlCtt),
      isTermStplAgree = _isAgree(stipulation.termStplAgreeYn, stipulation.termStplAgreeTitNm, stipulation.termStplAgreeHtmlCtt),
      existsCount = _getStipulationCnt([
        isScrbStplAgree,
        isPsnlInfoCnsgAgree,
        isPsnlInfoOfrAgree,
        isAdInfoOfrAgree,
        isTermStplAgree
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
      adInfoOfrCttSummary: _getAgreementSummary(isAdInfoOfrAgree, stipulation.adInfoOfrHtmlCtt),
      termStplAgreeCttSummary: _getAgreementSummary(isTermStplAgree, stipulation.termStplAgreeHtmlCtt),
      existsCount: existsCount
    });
  };

  /**
   * @function
   * @desc 자동 가입/해지 목록 그룹화
   * @param autoList - 자동 가입/해지 목록
   * @returns {Array|*}
   */
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
    getPremTermMsg: getPremTermMsg,
    convAdditionsJoinTermInfo: convAdditionsJoinTermInfo,
    convAdditionsPreInfo: convAdditionsPreInfo
  };
})();
/**
 * @file 혜택/할인 > 가입 / TB 결합상품
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-02-11
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param prodNm - 상품명
 */
Tw.BenefitJoinTbCombination = function(rootEl, prodId, prodNm) {
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$container = rootEl;
  this._prodId = prodId;
  this._prodNm = prodNm;
  this._svcMgmtNum = null;
  this._wireSvcMgmtNum = null;
  this._template = Handlebars.compile($('#tpl_line_list').html());
  this._isNotRegisterLine = false;

  this._cachedElement();
  this._bindEvent();
};

Tw.BenefitJoinTbCombination.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$btnSelectCombineLine = this.$container.find('.fe-btn_select_combine_line');
    this.$msg = this.$container.find('.fe-msg_valid,.fe-msg_unvalid');
    this.$msgValid = this.$container.find('.fe-msg_valid');
    this.$msgUnValid = this.$container.find('.fe-msg_unvalid');
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineListHtml = this.$container.find('.fe-line_list_html');

    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$btnSelectCombineLine.on('click', $.proxy(this._getMobileSvcInfo, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procConfirmReq, this), 500));

    this.$lineList.on('change', 'input[type=radio]:not(:disabled)', $.proxy(this._setWireSvcMgmtNum, this));
  },

  /**
   * @function
   * @desc 전체 회선 조회
   */
  _getMobileSvcInfo: function() {
    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done($.proxy(this._openSelectLine, this));
  },

  /**
   * @function
   * @desc 회선 선택 팝업 실행
   * @param resp - 전체 회선 목록
   * @returns {*}
   */
  _openSelectLine: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list': _.map(resp.result.m, $.proxy(this._getConvertListItem, this))
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSelectLinePop, this), $.proxy(this._onSelectLine, this), 'select_line');
  },

  /**
   * @function
   * @desc 회선 목록 변환하여 산출
   * @param lineInfo - 회선 정보
   * @param idx - 인덱스 키
   * @returns {{txt: string | *, "radio-attr": string, "label-attr": string}}
   */
  _getConvertListItem: function(lineInfo, idx) {
    return {
      'label-attr': 'id="ra' + idx + '"',
      'txt': Tw.FormatHelper.conTelFormatWithDash(lineInfo.svcNum),
      'radio-attr':'id="ra' + idx + '" data-svc_mgmt_num="' + lineInfo.svcMgmtNum + '" data-num="' +
        Tw.FormatHelper.conTelFormatWithDash(lineInfo.svcNum) + '" ' + (this._svcMgmtNum === lineInfo.svcMgmtNum ? 'checked' : '')
    };
  },

  /**
   * @function
   * @desc 회선 선택 팝업 이벤트 바인딩
   * @param $popupContainer - 회선 선택 팝업 컨테이너 레이어
   */
  _bindSelectLinePop: function($popupContainer) {
    $popupContainer.on('click', '[data-svc_mgmt_num]', $.proxy(this._setSvcMgmtNum, this));
  },

  /**
   * @function
   * @desc 회선 선택 정보 설정
   * @param e - 회선 선택 이벤트
   */
  _setSvcMgmtNum: function(e) {
    this.$btnSelectCombineLine.html($(e.currentTarget).data('num') +
      $('<div\>').append(this.$btnSelectCombineLine.find('.ico')).html());
    this._svcMgmtNum = $(e.currentTarget).data('svc_mgmt_num').toString();
    this._popupService.close();
  },

  /**
   * @function
   * @desc 회선 선택 시 & 결합상품 목록 조회
   */
  _onSelectLine: function() {
    if (Tw.FormatHelper.isEmpty(this._svcMgmtNum)) {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0142, { choiceSvcMgmtNum: this._svcMgmtNum }, {}, [this._prodId])
      .done($.proxy(this._setUseList, this));
  },

  /**
   * @function
   * @desc 결합상품 목록 조회 API 응답 처리
   * @param resp - 결합상품 목록 조회 API 응답 값
   */
  _setUseList: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this.$lineList.hide().attr('aria-hidden', 'true');
    this.$lineListHtml.empty();

    var useLineInfo = this._getCurrentUseLineInfo(resp.result),
      convertCombiWireProductList = this._getConvertCombiWireProductList(useLineInfo);

    if (convertCombiWireProductList.list.length > 0) {
      this.$lineListHtml.html(this._template(convertCombiWireProductList));
      this.$lineList.show().attr('aria-hidden', 'false');
    }

    skt_landing.widgets.widget_init('.fe-line_list');

    this._isNotRegisterLine = useLineInfo.needCertifyYn === 'Y';
    this._setDisabledUseList();
    this._setResultText(useLineInfo);
    this._toggleSetupButton(false);
  },

  /**
   * @function
   * @desc 결합 회선 목록 disabled 처리
   */
  _setDisabledUseList: function() {
    _.each(this.$lineList.find('li'), function(item) {
      var $item = $(item);
      if ($item.attr('aria-disabled') !== 'true') {
        return true;
      }

      $item.addClass('disabled');
      $item.find('input[type=radio]').attr('disabled', 'disabled')
        .prop('disabled', true);
    });
  },

  /**
   * @function
   * @desc 검증 처리
   * @param isError - 오류 여부
   * @param statusText - 결과 메세지
   */
  _setValidation: function(isError, statusText) {
    this.$msg.hide().attr('aria-hidden', 'true');

    var $msgElem = isError ? this.$msgUnValid : this.$msgValid;
    $msgElem.text(statusText).show().attr('aria-hidden', 'false');
  },

  /**
   * @function
   * @desc 현재 사용중인 회선 정보 산출
   * @param joinInfo - 가입 정보
   * @returns {Array}
   */
  _getCurrentUseLineInfo: function(joinInfo) {
    if (Tw.FormatHelper.isEmpty(joinInfo.useLineList)) {
      return [];
    }

    var useLineInfo = [];

    _.each(joinInfo.useLineList, function(line) {
      if (line.svcMgmtNum === this._svcMgmtNum) {
        useLineInfo = line;
        return false;
      }
    }.bind(this));

    return useLineInfo;
  },

  /**
   * @function
   * @desc 결합 회선 가족 목록 변환
   * @param useLineInfo - 결합가족 목록
   * @returns {{list: Array}|{list: *}}
   */
  _getConvertCombiWireProductList: function(useLineInfo) {
    if (Tw.FormatHelper.isEmpty(useLineInfo.combiWireProductList)) {
      return {
        list: []
      };
    }

    return {
      list: _.map(useLineInfo.combiWireProductList, function (item) {
        return $.extend(item, {
          combStatusText: Tw.FormatHelper.isEmpty(item.combYn) ? Tw.BENEFIT_TBCOMBINATION_JOIN_STATUS.IS_COMBINED :
            Tw.BENEFIT_TBCOMBINATION_JOIN_STATUS.DIS_COMBINED,
          svcMgmtNum: item.svcMgmtNum,
          isDisabled: !Tw.FormatHelper.isEmpty(item.combYn)
        });
      })
    };
  },

  /**
   * @function
   * @desc 결합 처리 결과 메세지 변환
   * @param useLineInfo - 회선 정보
   * @returns {*|void}
   */
  _setResultText: function(useLineInfo) {
    var isAllowedCombineLength = this.$lineList.find('li input[type=radio]:not(:disabled)').length;

    if (useLineInfo.combiLineYn === 'N' && isAllowedCombineLength.length > 0) {
      return this._setValidation(false, Tw.BENEFIT_TBCOMBINATION_JOIN_VALIDATION.IS_VALID);
    }

    if (useLineInfo.combiLineYn === 'Y') {
      return this._setValidation(true, Tw.BENEFIT_TBCOMBINATION_JOIN_VALIDATION.ALERADY_COMBINED);
    }

    if (isAllowedCombineLength < 1) {
      return this._setValidation(true, Tw.BENEFIT_TBCOMBINATION_JOIN_VALIDATION.UN_VALID_LINE);
    }
  },

  /**
   * @function
   * @desc 설정 버튼 토글
   * @param isEnable - 활성화 여부
   */
  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 유선 서비스관리번호 설정
   * @param e - change Event
   */
  _setWireSvcMgmtNum: function(e) {
    this._wireSvcMgmtNum = $(e.currentTarget).data('svc_mgmt_num');
    this._toggleSetupButton(true);
  },

  /**
   * @function
   * @desc 가입 처리 API 요청
   */
  _procConfirmReq: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0143, {
      choiceSvcMgmtNum: this._svcMgmtNum,
      wireSvcMgmtNum: this._wireSvcMgmtNum
    }, {}, [this._prodId]).done($.proxy(this._openConfirm, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 정보확인 데이터 변환
   * @param confirmInfo - 정보확인 데이터
   * @returns {this & {isAgreement: *, wireMember: *, prodStpl: ((this&{isScrbStplAgree: *, isPsnlInfoCnsgAgree: *, scrbStplAgreeCttSummary: string, termStplAgreeCttSummary: string, isPsnlInfoOfrAgree: *, psnlInfoCnsgCttSummary: string, existsCount: number, isAdInfoOfrAgree: *, isTermStplAgree: *, psnlInfoOfrCttSummary: string, adInfoOfrCttSummary: string, isAllAgree: boolean})|(this&{isScrbStplAgree: *, isPsnlInfoCnsgAgree: *, scrbStplAgreeCttSummary: string, termStplAgreeCttSummary: string, isPsnlInfoOfrAgree: *, psnlInfoCnsgCttSummary: string, existsCount: number, isAdInfoOfrAgree: *, isTermStplAgree: *, psnlInfoOfrCttSummary: string, adInfoOfrCttSummary: string, isAllAgree: boolean})), wirelessMember: *}}
   */
  _convertData: function(confirmInfo) {
    this._isAgreement = confirmInfo.agreeOpNeedYn === 'Y';
    return $.extend(confirmInfo, {
      wirelessMember: this._convertWirelessMember(confirmInfo.wirelessMember),
      wireMember: this._convertWireMember(confirmInfo.wireMember),
      isAgreement: this._isAgreement,
      prodStpl: Tw.ProductHelper.convStipulation(confirmInfo.prodStpl, false)
    });
  },

  /**
   * @function
   * @desc 무선 회선 정보 변환
   * @param wireless - 무선 회선 정보
   * @returns {this & {isFamlUse: boolean, svcNum: (string|*)}}
   */
  _convertWirelessMember: function(wireless) {
    return $.extend(wireless, {
      svcNum: Tw.FormatHelper.conTelFormatWithDash(wireless.svcNum),
      isFamlUse: wireless.famlUseYn === 'Y'
    });
  },

  /**
   * @function
   * @desc 유선 회선 정보 변환
   * @param wire - 유선 회선 정보
   * @returns {this & {svcNm: *, svcNum: (string|*)}}
   */
  _convertWireMember: function(wire) {
    return $.extend(wire, {
      svcNum: wire.svcCd === 'P' ? Tw.FormatHelper.conTelFormatWithDash(wire.svcNum) : wire.svcNum,
      svcNm: Tw.SVC_CD[wire.svcCd]
    });
  },

  /**
   * @function
   * @desc TB상품 정보확인 팝업 실행
   * @param resp - 정보확인 API 응답 값
   * @returns {*}
   */
  _openConfirm: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open($.extend({
      hbs: 'BS_07_01_01_02',
      layer: true
    }, this._convertData(resp.result)), $.proxy(this._openBindConfirmPop, this));
  },

  /**
   * @function
   * @desc 정보확인 팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 컨테이너
   */
  _openBindConfirmPop: function($popupContainer) {
    new Tw.ProductCommonConfirm(false, $popupContainer, {
      isWidgetInit: true
    }, $.proxy(this._procApply, this));
  },

  /**
   * @function
   * @desc 가입 처리 API 요청
   */
  _procApply: function() {
    var reqData = {
      choiceSvcMgmtNum: this._svcMgmtNum,
      wireSvcMgmtNum: this._wireSvcMgmtNum
    };

    if (this._isAgreement) {
      reqData.agreeOpNeedYn = 'Y';
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0144, reqData,
      {}, [this._prodId]).done($.proxy(this._procApplyRes, this));
  },

  /**
   * @function
   * @desc 가입 처리 API 응답 처리
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procApplyRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   */
  _openSuccessPop: function() {
    var successData = {
      prodNm: this._prodNm,
      prodCtgNm: Tw.PRODUCT_CTG_NM.COMBINATIONS,
      typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
      btList: [{ link: '/myt-join/combinations', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.COMBINE }]
    };

    if (this._isNotRegisterLine) {
      successData.basicTxt = Tw.BENEFIT_TBCOMBINE_NEED_REGISTER;
      successData.btList.push({ link: '/common/member/line/register', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.LINE_REGISTER });
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: successData
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');
  },

  /**
   * @function
   * @desc 완료 팝업 이벤트 바인딩
   * @param $popupContainer - 팝업 레이어
   */
  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 핸들링
   * @param e - 완료 팝업 내 A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 완료 팝업 종료 시
   */
  _onClosePop: function() {
    this._historyService.goBack();
  }

};
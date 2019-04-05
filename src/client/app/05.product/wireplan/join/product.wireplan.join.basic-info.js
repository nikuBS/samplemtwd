/**
 * FileName: product.wireplan.join.basic-info.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.14
 */

Tw.ProductWireplanJoinBasicInfo = function(rootEl, prodId, displayId, confirmOptions, btnData) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(window.unescape(confirmOptions));
  this._btnData = JSON.parse(window.unescape(btnData));

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductWireplanJoinBasicInfo.prototype = {

  _cachedElement: function() {
    this.$inputPhone = this.$container.find('.fe-num_phone');
    this.$inputCellPhone = this.$container.find('.fe-num_cellphone');
    this.$inputEmail = this.$container.find('.fe-email');

    this.$btnClear = this.$container.find('.fe-btn_clear');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$inputPhone.on('keyup input', $.proxy(this._detectInputNumber, this, 10));
    this.$inputCellPhone.on('keyup input', $.proxy(this._detectInputNumber, this, 11));
    this.$inputEmail.on('keyup input', $.proxy(this._detectInputEmail, this));

    this.$container.on('blur', 'input[type=tel]', $.proxy(this._blurInputNumber, this));
    this.$container.on('focus', 'input[type=tel]', $.proxy(this._focusInputNumber, this));

    this.$btnClear.on('click', $.proxy(this._clear, this));
    this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));
  },

  _detectInputNumber: function(maxLength, e) {
    var $elem = $(e.currentTarget);
    $elem.val($elem.val().replace(/[^0-9]/g, ''));

    if ($elem.val().length > maxLength) {
      $elem.val($elem.val().substr(0, maxLength));
    }

    this._toggleClearBtn($elem);
    this._checkSetupButton();
  },

  _detectInputEmail: function() {
    this._toggleClearBtn(this.$inputEmail);
    this._checkSetupButton();
  },

  _checkSetupButton: function() {
    var isEnableSetupButton = true;

    if (this.$inputPhone.val().length < 9 && !Tw.ValidationHelper.isTelephone(this.$inputPhone.val())) {
      isEnableSetupButton = false;
    }

    if (this.$inputCellPhone.val().length < 10 && !Tw.ValidationHelper.isCellPhone(this.$inputCellPhone.val())) {
      isEnableSetupButton = false;
    }

    if (!Tw.ValidationHelper.isEmail(this.$inputEmail.val())) {
      isEnableSetupButton = false;
    }

    this._toggleSetupButton(isEnableSetupButton);
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function(e) {
    var $elem = $(e.currentTarget);
    $elem.val(Tw.FormatHelper.conTelFormatWithDash($elem.val()));
  },

  _focusInputNumber: function(e) {
    var $elem = $(e.currentTarget);
    $elem.val($elem.val().replace(/-/gi, ''));
  },

  _clear: function(e) {
    var $elem = $(e.currentTarget);

    $elem.parent().find('input').val('');
    $elem.hide().attr('aria-hidden', 'true');

    this._checkSetupButton();
  },

  _toggleClearBtn: function($elem) {
    if ($elem.val().length > 0) {
      $elem.parent().find('.fe-btn_clear').show().attr('aria-hidden', 'false');
    } else {
      $elem.parent().find('.fe-btn_clear').hide().attr('aria-hidden', 'true');
    }
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      pageId: 'M000433',
      isTerm: false,
      isNoticeList: true,
      isWireplan: true,
      isWidgetInit: true,
      isPcJoin: true,
      title: Tw.PRODUCT_TYPE_NM.JOIN,
      applyBtnText: Tw.BUTTON_LABEL.JOIN,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.ADDITIONS,
      toProdName: this._confirmOptions.preinfo.reqProdInfo.prodNm,
      toProdDesc: this._confirmOptions.preinfo.reqProdInfo.prodSmryDesc,
      toProdBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.basFeeInfo,
      isNumberBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
      svcNumMask: this._confirmOptions.preinfo.reqProdInfo.svcCd === 'P' ?
        Tw.FormatHelper.conTelFormatWithDash(this._confirmOptions.preinfo.svcNumMask) : this._confirmOptions.preinfo.svcNumMask,
      svcNickname: Tw.SVC_CD[this._confirmOptions.preinfo.reqProdInfo.svcCd],
      noticeList: this._confirmOptions.noticeList,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.existsCount > 0),
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE.INFO_SETTING_SUCCESS
      }],
      iconClass: this._getIcon()
    });
  },

  _getIcon: function() {
    if (this._confirmOptions.preinfo.reqProdInfo.svcCd === 'P') {
      return 'ico-type2';
    }

    return 'ico-type1';
  },

  _procConfirm: function() {
    this._popupService.open($.extend(this._confirmOptions, {
      hbs: 'product_wireplan_confirm',
      layer: true
    }), $.proxy(this._bindConfirm, this));
  },

  _bindConfirm: function($popupContainer) {
    new Tw.ProductCommonConfirm(false, $popupContainer, this._confirmOptions, $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0099, {
      addInfoExistYn: this._btnData.addInfoExistYn,
      addInfoRelScrnId: this._btnData.addInfoRelScrnId,
      addSvcAddYn: this._btnData.addSvcAddYn,
      cntcPlcInfoRgstYn: this._btnData.cntcPlcInfoRgstYn,
      svcProdGrpCd: this._btnData.svcProdGrpCd,
      email: this.$inputEmail.val(),
      mobileNum: this.$inputCellPhone.val(),
      phoneNum: this.$inputPhone.val()
    }, {}, [this._prodId]).done($.proxy(this._procJoinRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procJoinRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.ADDITIONS,
        btList: [{ link: '/myt-join/submain', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.MYTJOIN }],
        btClass: 'item-one',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.reqProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.preinfo.reqProdInfo.isNumberBasFeeInfo ?
          this._confirmOptions.preinfo.reqProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};

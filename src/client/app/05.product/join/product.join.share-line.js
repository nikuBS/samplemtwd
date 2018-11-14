/**
 * FileName: product.join.share-line.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

Tw.ProductJoinShareLine = function(rootEl, prodId, displayId, confirmOptions) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._confirmOptions = JSON.parse(confirmOptions);

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._convConfirmOptions();
};

Tw.ProductJoinShareLine.prototype = {

  _data: {
    addList: []
  },

  _cachedElement: function() {
    this.$inputNumber = this.$container.find('.fe-num_input');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnAddressBook = this.$container.find('.fe-btn_address_book');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnAddressBook.on('click', $.proxy(this._openAppAddressBook, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));

    this.$btnSetupOk.on('click', $.proxy(this._procConfirm, this));
  },

  _openAppAddressBook: function() {
    this._nativeService.send('getContact', {}, $.proxy(this._setAppAddressBook, this));
  },

  _setAppAddressBook: function(res) {
    if (Tw.FormatHelper.isEmpty(res.params.phoneNumber)) {
      return;
    }

    this.$inputNumber.val(res.params.phoneNumber);
  },

  _detectInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9.]/g, ''));
    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    this._toggleSetupButton(this.$inputNumber.val().length > 0);
    this._toggleClearBtn();
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.getDashedCellPhoneNumber(this.$inputNumber.val()));
  },

  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  _clearNum: function() {
    this.$inputNumber.val('');
    this.$btnClearNum.hide();
  },

  _toggleClearBtn: function() {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show();
    } else {
      this.$btnClearNum.hide();
    }
  },

  _convConfirmOptions: function() {
    this._confirmOptions = $.extend(this._confirmOptions, {
      svcNumMask: this._confirmOptions.preinfo.svcNumMask,
      svcProdNm: this._confirmOptions.preinfo.frProdInfo.prodNm,
      svcProdBasFeeInfo: this._confirmOptions.preinfo.frProdInfo.basFeeInfo,
      toProdName: this._confirmOptions.preinfo.toProdInfo.prodNm,
      isNumberBasFeeInfo: !this._confirmOptions.preinfo.toProdInfo.basFeeInfo.isNaN,
      toProdBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.basFeeInfo.value,
      toProdDesc: this._confirmOptions.sktProdBenfCtt,
      isAutoJoinTermList: (this._confirmOptions.preinfo.autoJoinList.length > 0 || this._confirmOptions.preinfo.autoTermList.length > 0),
      autoJoinList: this._confirmOptions.preinfo.autoJoinList,
      autoTermList: this._confirmOptions.preinfo.autoTermList,
      autoJoinBenefitList: this._confirmOptions.preinfo.frProdInfo.chgSktProdBenfCtt,
      autoTermBenefitList: this._confirmOptions.preinfo.toProdInfo.chgSktProdBenfCtt,
      isAgreement: (this._confirmOptions.stipulationInfo && this._confirmOptions.stipulationInfo.stipulation.existsCount > 1)
    });
  },

  _procConfirm: function() {
    if (!Tw.ValidationHelper.isCellPhone(this.$inputNumber.val())) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    new Tw.ProductJoinCommonConfirm(true, null, $.extend(this._confirmOptions, {
      isMobilePlan: true,
      joinTypeText: Tw.PRODUCT_TYPE_NM.JOIN,
      typeText: Tw.PRODUCT_CTG_NM.PLANS,
      joinConfirmAlert: Tw.ALERT_MSG_PRODUCT.ALERT_3_A2,
      settingSummaryTexts: [{
        spanClass: 'val',
        text: Tw.PRODUCT_JOIN_SETTING_AREA_CASE[this._displayId] + ' 1' + Tw.PRODUCT_JOIN_SETTING_AREA_CASE.LINE
      }]
    }), $.proxy(this._prodConfirmOk, this));
  },

  _prodConfirmOk: function() {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_10_0012, {
      prodId: this._prodId,
      prodProcTypeCd: 'JN',
      asgnNumList: this.$inputNumber.val().replace(/[^0-9.]/g, '')
    }, {}, this._prodId).done($.proxy(this._procJoinRes, this));
  },

  _procJoinRes: function(resp) {
    skt_landing.action.loading.off({ ta: '.container' });

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    $.when(this._popupService.close())
      .then($.proxy(this._openSuccessPop, this));
  },

  _openSuccessPop: function() {
    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_CTG_NM.PLANS,
        mytPage: 'fee-plan',
        prodId: this._prodId,
        prodNm: this._confirmOptions.preinfo.toProdInfo.prodNm,
        typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
        isBasFeeInfo: this._confirmOptions.preinfo.toProdInfo.isNumberBasFeeInfo,
        basFeeInfo: this._confirmOptions.preinfo.toProdInfo.isNumberBasFeeInfo ?
          this._confirmOptions.preinfo.toProdInfo.basFeeInfo + Tw.CURRENCY_UNIT.WON : ''
      }
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');

    this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {});
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};

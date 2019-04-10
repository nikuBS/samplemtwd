/**
 * @file product.mobileplan.setting.tplan.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.11.14
 */

Tw.ProductMobileplanSettingTplan = function(rootEl, prodId, displayId, currentBenefitProdId, watchInfo) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._currentBenefitProdId = currentBenefitProdId;
  this._watchInfo = JSON.parse(watchInfo);
  this._smartWatchLine = null;
  this._smartWatchLineNumber = null;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductMobileplanSettingTplan.prototype = {

  _init: function() {
    if (Tw.FormatHelper.isEmpty(this._currentBenefitProdId)) {
      return;
    }

    this.$container.find('input[value="' + this._currentBenefitProdId + '"]').trigger('click');
  },

  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procSetupOk, this), 500));

    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._init, this));
  },

  _enableSetupButton: function(e) {
    if ($(e.currentTarget).val() === 'NA00006116' && this._currentBenefitProdId !== 'NA00006116') {
      return this._selectSmartWatchItem();
    } else {
      this._smartWatchLine = null;
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  _selectSmartWatchItem: function() {
    this._isDisableSmartWatchLineInfo = false;
    this._smartWatchLine = null;
    this._smartWatchLineNumber = null;

    if (this._watchInfo.watchCase === 'C' || this._watchInfo.watchSvcList.length < 1) {
      return this._popupService.openConfirmButton(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A73.TITLE,
        $.proxy(this._enableSmartWatchLineInfo, this), $.proxy(this._procClearSmartWatchLineInfo, this), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    }

    if (this._watchInfo.watchCase === 'B' && this._watchInfo.watchSvcList.length > 1) {
      return this._openSmartWatchLineSelectPopup();
    }

    if (this._watchInfo.watchCase === 'A') {
      return true;
    }

    this._smartWatchLine = this._watchInfo.watchSvcList[0].watchSvcMgmtNum;
    this._smartWatchLineNumber = Tw.FormatHelper.conTelFormatWithDash(this._watchInfo.watchSvcList[0].watchSvcNumMask);
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    return true;
  },

  _enableSmartWatchLineInfo: function() {
    this._isDisableSmartWatchLineInfo = true;
    this._popupService.close();
  },

  _procClearSmartWatchLineInfo: function() {
    if (this._isDisableSmartWatchLineInfo) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
      return;
    }

    this._clearSelectItem();
  },

  _openSmartWatchLineSelectPopup: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'title': Tw.POPUP_TITLE.TPLAN_SMARTWATCH,
          'list': this._watchInfo.watchSvcList.map($.proxy(this._getSmartWatchLineList, this))
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSmartWatchLineSelectPopup, this), null, 'select_smart_watch_line_pop');
  },

  _getSmartWatchLineList: function(item, idx) {
    return {
      'label-attr': 'id="ra' + idx + '"',
      'txt': Tw.FormatHelper.conTelFormatWithDash(item.watchSvcNumMask),
      'radio-attr': 'id="ra' + idx + '" data-num="' + item.watchSvcMgmtNum + '"' +
        ' data-svcnum="' + item.watchSvcNumMask + '" ' + (this._smartWatchLine === item.watchSvcMgmtNum ? 'checked' : '')
    };
  },

  _bindSmartWatchLineSelectPopup: function($popupContainer) {
    $popupContainer.on('click', '[data-num]', $.proxy(this._setSmartWatchLine, this));
  },

  _setSmartWatchLine: function(e) {
    this._smartWatchLine = $(e.currentTarget).data('num');
    this._smartWatchLineNumber = $(e.currentTarget).data('svcnum');
    this._popupService.close();
  },

  _clearSelectItem: function() {
    var $elem = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    $elem.prop('checked', false);
    $elem.parents('.radiobox').removeClass('checked').attr('aria-checked', 'false');

    this.$btnSetupOk.attr('disabled');
    this.$btnSetupOk.prop('disabled', true);
  },

  _procSetupOk: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if ($checked.val() === 'NA00006117') {  // 2019.1.18 클럽 옵션 가입 종료
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A82.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A82.TITLE);
    }

    if (this._currentBenefitProdId === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    var reqParams = {
      beforeTDiyGrCd: this._currentBenefitProdId,
      afterTDiyGrCd: $checked.val()
    };

    if (!Tw.FormatHelper.isEmpty(this._smartWatchLine) && $checked.val() === 'NA00006116') {
      reqParams = $.extend(reqParams, {
        watchSvcMgmtNum: this._smartWatchLine
      });
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0014, reqParams,
      {}, [$checked.val()]).done($.proxy(this._procSetupOkRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _procSetupOkRes: function(resp) {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var completeData = {
      prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
      typeNm: Tw.PRODUCT_TYPE_NM.CHANGE,
      btList: $checked.val() === 'NA00006116' ? [{ link: '/product/callplan?prod_id=NA00005381', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.SMARTWATCH }] : [],
      btClass: 'item-one'
    };

    if ($checked.val() === 'NA00006116') {
      completeData = $.extend(completeData, {
        basicTxt: Tw.FormatHelper.isEmpty(this._smartWatchLineNumber) ? Tw.POPUP_CONTENTS.TPLAN_WATCH_NON_LINE :
          Tw.POPUP_CONTENTS.TPLAN_WATCH + this._smartWatchLineNumber
      });
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: completeData
    }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._onClosePop, this), 'save_setting_success');
  },

  _bindSuccessPopup: function($popupContainer) {
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

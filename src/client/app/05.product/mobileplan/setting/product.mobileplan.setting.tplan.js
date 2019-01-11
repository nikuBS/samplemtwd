/**
 * FileName: product.mobileplan.setting.tplan.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.14
 */

Tw.ProductMobileplanSettingTplan = function(rootEl, prodId, displayId, currentBenefitProdId, watchInfo) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._currentBenefitProdId = currentBenefitProdId;
  this._watchInfo = JSON.parse(watchInfo);
  this._smartWatchLine = null;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._init();
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
    this.$btnSetupOk.on('click', $.proxy(this._procSetupOk, this));
  },

  _enableSetupButton: function(e) {
    if ($(e.currentTarget).val() === 'NA00006116') {
      return this._selectSmartWatchItem();
    } else {
      this._smartWatchLine = null;
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  _selectSmartWatchItem: function() {
    this._isDisableSmartWatchLineInfo = false;
    this._smartWatchLine = null;

    if (this._watchInfo.watchCase === 'C' || this._watchInfo.watchSvcList.length < 1 || true) {
      return this._popupService.openConfirmButton(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A73.TITLE,
        $.proxy(this._enableSmartWatchLineInfo, this), $.proxy(this._procClearSmartWatchLineInfo, this), Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
    }

    if (this._watchInfo.watchCase === 'B' && this._watchInfo.watchSvcList.length > 1) {
      return this._openSmartWatchLineSelectPopup();
    }

    if (this._watchInfo.watchCase === 'A') {
      return true;
    }

    this._smartWatchLine = this._watchInfo.watchSvcList[0].watchSvcNum;
    return true;
  },

  _enableSmartWatchLineInfo: function() {
    this._isDisableSmartWatchLineInfo = true;
    this._popupService.close();
  },

  _procClearSmartWatchLineInfo: function() {
    if (this._isDisableSmartWatchLineInfo) {
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
      'radio-attr': 'id="ra' + idx + '" data-num="' + item.watchSvcNum + '" ' + (this._smartWatchLine === item.watchSvcNum ? 'checked' : '')
    };
  },

  _bindSmartWatchLineSelectPopup: function($popupContainer) {
    $popupContainer.on('click', '[data-num]', $.proxy(this._setSmartWatchLine, this));
  },

  _setSmartWatchLine: function(e) {
    this._smartWatchLine = $(e.currentTarget).data('num');
    this._popupService.close();
  },

  _clearSelectItem: function() {
    var $elem = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    $elem.prop('checked', false);
    $elem.parents('.radiobox').removeClass('checked').attr('aria-checked', 'false');
  },

  _procSetupOk: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if (this._currentBenefitProdId === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    var reqParams = {
      beforeTDiyGrCd: this._currentBenefitProdId,
      afterTDiyGrCd: $checked.val()
    };

    if (!Tw.FormatHelper.isEmpty(this._smartWatchLine) && $checked.val() === 'NA00006116') {
      reqParams = $.extend(reqParams, {
        watchSvcNum: this._smartWatchLine
      });
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0014, reqParams,
      {}, [$checked.val()]).done($.proxy(this._procSetupOkRes, this));
  },

  _procSetupOkRes: function(resp) {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');
    Tw.CommonHelper.endLoading('.container');

    if (resp.code === 'ZCOLE0001') {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A46.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A46.TITLE);
    }

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var completeData = {
      prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
      typeNm: Tw.PRODUCT_TYPE_NM.CHANGE,
      isSmartWatch: $checked.val() === 'NA00006116',
      btClass: 'item-one'
    };

    if ($checked.val() === 'NA00006116') {
      completeData = $.extend(completeData, {
        basicTxt: Tw.FormatHelper.isEmpty(this._smartWatchLine) ? Tw.POPUP_CONTENTS.TPLAN_WATCH_NON_LINE :
          Tw.POPUP_CONTENTS.TPLAN_WATCH + Tw.FormatHelper.getFormattedPhoneNumber(this._smartWatchLine)
      });
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: completeData
    }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._onClosePop, this), 'save_setting_success');
  },

  _bindSuccessPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
  },

  _closePop: function() {
    this._popupService.close();
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }
  
};

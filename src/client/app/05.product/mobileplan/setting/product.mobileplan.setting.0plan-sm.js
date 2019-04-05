/**
 * FileName: product.mobileplan.setting.0plan-sm.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.01.10
 */

Tw.ProductMobileplanSetting0planSm = function(rootEl, prodId, displayId, zeroPlanInfo) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  this._prodId = prodId;
  this._displayId = displayId;
  this._zeroPlanInfo = JSON.parse(zeroPlanInfo);
  this._currentOptionProdId = this._zeroPlanInfo.useOptionProdId;
  this._startTime = Tw.FormatHelper.isEmpty(this._zeroPlanInfo.applyStaTm) ? null : this._zeroPlanInfo.applyStaTm.substr(0, 2);
  this._isChangeTime = true;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
  this._init();

  if (this._historyService.isBack()) {
    this._historyService.goBack();
  }
};

Tw.ProductMobileplanSetting0planSm.prototype = {

  _init: function() {
    if (Tw.FormatHelper.isEmpty(this._currentOptionProdId)) {
      return;
    }

    if (!Tw.FormatHelper.isEmpty(this._startTime)) {
      var currentHour = new Date().getHours();
      this._setTimeButton(this._startTime);
      this._setTimeMsg(this._startTime);
      this._isChangeTime = !(parseInt(this._startTime, 10) <= currentHour && currentHour < (parseInt(this._startTime, 10) + 3));
    }

    this.$container.find('input[value="' + this._currentOptionProdId + '"]').trigger('click');
  },

  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnTimeSelect = this.$container.find('.fe-btn_time_select');
    this.$msg = this.$container.find('.fe-msg');
    this.$hour = this.$container.find('.fe-hour');
  },

  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', $.proxy(this._procSetupOk, this));
    this.$btnTimeSelect.on('click', $.proxy(this._openTimeSelectPop, this));
  },

  _openTimeSelectPop: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data: [
        {
          'list': $.proxy(this._getTimeList, this)
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindTimePopup, this), null, 'select_time_select', this.$btnTimeSelect);
  },

  _getTimeList: function() {
    var resultList = [];

    for(var i = 5; i <= 21; i++) {
      var strHour = (i < 10 ? '0' + i : i).toString();
      resultList.push({
        'label-attr': 'id="ra' + i + '"',
        'txt': strHour,
        'radio-attr': 'id="ra' + i + '" data-time="' + strHour + '" ' + (this._startTime === strHour ? 'checked' : '')
      });
    }

    return resultList;
  },

  _bindTimePopup: function($popupContainer) {
    $popupContainer.on('click', '[data-time]', $.proxy(this._setTime, this));
  },

  _setTime: function(e) {
    var time = $(e.currentTarget).data('time').toString();

    this._setTimeButton(time);
    this._setTimeMsg(time);

    this._startTime = time;
    this._popupService.close();
  },

  _setTimeButton: function(timeStr) {
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    this.$btnTimeSelect.html(timeStr + ' ' + Tw.PERIOD_UNIT.HOUR + $('<div\>').append(this.$btnTimeSelect.find('.ico')).html());
  },

  _setTimeMsg: function(timeStr) {
    var endTime = parseInt(timeStr, 10) + 3;
    this.$hour.text(timeStr + Tw.PERIOD_UNIT.HOUR + '~' + (endTime < 10 ? '0' + endTime : endTime) + Tw.PERIOD_UNIT.HOUR);

    this.$msg.show().attr('aria-hidden', 'false');
    this.$msg.removeClass('disabled');
  },

  _enableSetupButton: function(e) {
    if ($(e.currentTarget).val() === 'NA00006163' && this._isChangeTime) {
      this.$btnTimeSelect.prop('disabled', false).removeAttr('disabled');
      this.$msg.removeClass('disabled');
    } else {
      this.$btnTimeSelect.prop('disabled', true).attr('disabled');
      this.$msg.addClass('disabled');
    }

    if ($(e.currentTarget).val() === 'NA00006163' && !this._isChangeTime) {
      return this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  _procSetupOk: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if (this._currentOptionProdId === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0170, {
      beforeTDiyGrCd: this._currentOptionProdId,
      afterTDiyGrCd: $checked.val(),
      applyStaTm: $checked.val() === 'NA00006163' ? this._startTime + '00' : ''
    }, {}, []).done($.proxy(this._procSetupOkRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _getBasicText: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked'),
      txt = $checked.parent().find('.mtext').text() + '<br>';

    if ($checked.val() === 'NA00006163') {
      txt += this.$msg.text();
    } else {
      txt += $checked.data('desc');
    }

    return txt;
  },

  _procSetupOkRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
        typeNm: Tw.PRODUCT_TYPE_NM.CHANGE,
        basicTxt: this._getBasicText()
      }
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

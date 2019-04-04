/**
 * @file product.mobileplan-add.setting.combine-line.js
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018.11.13
 */

Tw.ProductMobileplanAddSettingCombineLine = function(rootEl, prodId, displayId, svcProdGrpId) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._svcProdGrpId = svcProdGrpId;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductMobileplanAddSettingCombineLine.prototype = {

  _cachedElement: function() {
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineWrap = this.$container.find('.fe-line_wrap');
    this.$inputNumber = this.$container.find('.fe-num_input');

    this.$btnAddNum = this.$container.find('.fe-btn_add_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnAddressBook = this.$container.find('.fe-btn_address_book');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$btnAddNum.on('click', $.proxy(this._addNum, this));
    this.$lineList.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnAddressBook.on('click', $.proxy(this._openAppAddressBook, this));
    this.$inputNumber.on('keyup input', $.proxy(this._detectInputNumber, this));
    this.$inputNumber.on('blur', $.proxy(this._blurInputNumber, this));
    this.$inputNumber.on('focus', $.proxy(this._focusInputNumber, this));

    if (Tw.BrowserHelper.isIos()) {
      $(window).on('touchstart', Tw.InputHelper.iosBlurCheck);
    }
  },

  _openAppAddressBook: function() {
    this._nativeService.send('getContact', {}, $.proxy(this._setAppAddressBook, this));
  },

  _setAppAddressBook: function(res) {
    if (Tw.FormatHelper.isEmpty(res.params.phoneNumber)) {
      return;
    }

    this.$inputNumber.val(res.params.phoneNumber);
    this._toggleClearBtn();
    this._toggleNumAddBtn();
    this._blurInputNumber();
  },

  _addNum: function() {
    if (this.$inputNumber.val().length < 10) {
      return;
    }

    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0020, {
      svcProdGrpId: this._svcProdGrpId,
      svcNumList: [this._getServiceNumberFormat(number)]
    }, {}, [this._prodId])
      .done($.proxy(this._addDelNumRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _addDelNumRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.reload();
  },

  _delNum: function(e) {
    if (this.$lineList.find('li').length < 2) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A10.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A10.TITLE);
    }

    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON, Tw.BUTTON_LABEL.CLOSE, null,
      $.proxy(this._delNumReq, this, $(e.currentTarget).data('svc_mgmt_num')));
  },

  _delNumReq: function(svcMgmtNum) {
    this._popupService.close();

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0019, {
      chldSvcMgmtNum: svcMgmtNum
    }, {}, [this._prodId]).done($.proxy(this._addDelNumRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _detectInputNumber: function(e) {
    if (Tw.InputHelper.isEnter(e)) {
      this.$btnAddNum.trigger('click');
      return;
    }

    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9]/g, ''));

    if (this.$inputNumber.val().length > 11) {
      this.$inputNumber.val(this.$inputNumber.val().substr(0, 11));
    }

    if (this.$lineWrap.length < 1) {
      return this._toggleSetupButton(this.$inputNumber.val().length > 0);
    }

    this._toggleClearBtn();
    this._toggleNumAddBtn();
  },

  _toggleNumAddBtn: function() {
    if (this.$inputNumber.val().length > 9) {
      this.$btnAddNum.removeAttr('disabled').prop('disabled', false);
      this.$btnAddNum.parent().removeClass('bt-gray1').addClass('bt-blue1');
    } else {
      this.$btnAddNum.attr('disabled', 'disabled').prop('disabled', true);
      this.$btnAddNum.parent().removeClass('bt-blue1').addClass('bt-gray1');
    }
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _blurInputNumber: function() {
    this.$inputNumber.val(Tw.FormatHelper.conTelFormatWithDash(this.$inputNumber.val()));
  },

  _focusInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/-/gi, ''));
  },

  _clearNum: function() {
    this.$inputNumber.val('');
    this.$btnClearNum.hide().attr('aria-hidden', 'true');
    this._toggleNumAddBtn();
  },

  _toggleClearBtn: function() {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show().attr('aria-hidden', 'false');
    } else {
      this.$btnClearNum.hide().attr('aria-hidden', 'true');
    }
  },

  _getServiceNumberFormat: function(number) {
    if (number.length === 10) {
      return {
        serviceNumber1: number.substr(0, 3),
        serviceNumber2: number.substr(3, 3),
        serviceNumber3: number.substr(6, 4)
      };
    }

    return {
      serviceNumber1: number.substr(0, 3),
      serviceNumber2: number.substr(3, 4),
      serviceNumber3: number.substr(7, 4)
    };
  },

  _getSvcNumList: function() {
    var resultList = [];

    this.$lineList.find('li').each(function(index, item) {
      resultList.push(this._getServiceNumberFormat($(item).data('num')));
    }.bind(this));

    return resultList;
  }

};

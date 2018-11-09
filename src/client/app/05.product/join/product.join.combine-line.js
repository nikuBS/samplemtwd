/**
 * FileName: product.join.combine-line.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.09
 */

Tw.ProductJoinCombineLine = function(rootEl) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductJoinCombineLine.prototype = {

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

  _addNum: function() {
    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (this.$lineList.find('li').length > 3) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A9.TITLE);
    }

    if (!Tw.ValidationHelper.isCellPhone(number) || this._data.addList.indexOf(number) !== -1) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_FRONT_VALIDATE_NUM.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_FRONT_VALIDATE_NUM.TITLE);
    }

    this._data.addList.push(number);
    this.$lineList.append(this._combinationTemplate({
      number: number,
      numMask: Tw.FormatHelper.getFormattedPhoneNumber(number)
    }));

    this._clearNum();
    this._toggleSetupButton(true);
    this.$lineWrap.show();
  },

  _delNum: function(e) {
    var $item = $(e.currentTarget).parents('li');

    this._data.addList.splice(this._data.addList.indexOf($item.data('num')), 1);

    $item.remove();
    if (this.$lineList.find('li').length < 1) {
      this.$lineWrap.hide();
      this._toggleSetupButton(false);
    }
  },

  _detectInputNumber: function() {
    this.$inputNumber.val(this.$inputNumber.val().replace(/[^0-9.]/g, ''));
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
    if (this.$inputNumber.val().length > 0) {
      this.$btnAddNum.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnAddNum.attr('disabled', 'disabled').prop('disabled', true);
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
    this._toggleNumAddBtn();
  },

  _toggleClearBtn: function() {
    if (this.$inputNumber.val().length > 0) {
      this.$btnClearNum.show();
    } else {
      this.$btnClearNum.hide();
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
  }

};

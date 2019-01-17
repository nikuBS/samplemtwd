/**
 * FileName: product.mobileplan.setting.number-friend.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.11.15
 */

Tw.ProductMobileplanSettingNumberFriend = function(rootEl, prodId, displayId, frBestAsgnNum) {
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._prodId = prodId;
  this._displayId = displayId;
  this._frBestAsgnNum = frBestAsgnNum;

  this.$container = rootEl;
  this._cachedElement();
  this._bindEvent();
};

Tw.ProductMobileplanSettingNumberFriend.prototype = {

  _cachedElement: function() {
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineWrap = this.$container.find('.fe-line_wrap');
    this.$inputNumber = this.$container.find('.fe-num_input');

    this.$btnAddNum = this.$container.find('.fe-btn_add_num');
    this.$btnClearNum = this.$container.find('.fe-btn_clear_num');
    this.$btnAddressBook = this.$container.find('.fe-btn_address_book');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnToggleFriend = this.$container.find('.fe-btn_toggle_friend');
  },

  _bindEvent: function() {
    this.$btnAddNum.on('click', $.proxy(this._addNum, this));
    this.$btnClearNum.on('click', $.proxy(this._clearNum, this));
    this.$btnAddressBook.on('click', $.proxy(this._openAppAddressBook, this));
    this.$btnToggleFriend.on('click', $.proxy(this._toggleFriend, this));
    this.$lineList.on('click', '.fe-btn_del_num', $.proxy(this._delNum, this));

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
    this._toggleClearBtn();
    this._toggleNumAddBtn();
  },

  _addNum: function() {
    var number = this.$inputNumber.val().replace(/-/gi, '');

    if (!Tw.ValidationHelper.isCellPhone(number)) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
    }

    if (this.$lineList.find('li').length > 3) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A38.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A38.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0071, {
      opClCd: '1',
      asgnNum: number
    }, {}).done($.proxy(this._addDelNumRes, this));
  },

  _addDelNumRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._historyService.reload();
  },

  _delNum: function(e) {
    var $elem = $(e.currentTarget).parents('li');

    if ($elem.data('number') === this._frBestAsgnNum) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A45.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A45.TITLE);
    }

    if ($elem.parent().find('li').length < 2) {
      return this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_NUMBER_MIN);
    }

    this._popupService.openModalTypeATwoButton(Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE, Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON, Tw.BUTTON_LABEL.CLOSE, null,
      $.proxy(this._delNumReq, this, $elem.data('number'), $elem.data('audit_dtm')));
  },

  _delNumReq: function(number, auditDtm) {
    this._popupService.close();

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0071, {
      opClCd: '2',
      asgnNum: number,
      auditDtm: auditDtm
    }, {}, this._prodId).done($.proxy(this._addDelNumRes, this));
  },

  _detectInputNumber: function() {
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

  _toggleFriend: function(e) {
    if ($(e.currentTarget).hasClass('on')) {
      return this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_3_A44.TITLE);
    }

    var $elem = $(e.currentTarget).parents('li'),
      number = $elem.data('number');

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0071, {
      opClCd: '7',
      asgnNum: number,
      frBestAsgnNum: this._frBestAsgnNum
    }).done($.proxy(this._toggleFriendRes, this, number));
  },

  _toggleFriendRes: function(number, resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._frBestAsgnNum = number;
    this.$lineList.find('.fe-btn_toggle_friend.on').removeClass('on');
    this.$lineList.find('li[data-number="' + number + '"] .fe-btn_toggle_friend').addClass('on');
  },

  _toggleNumAddBtn: function() {
    if (this.$inputNumber.val().length > 9) {
      this.$btnAddNum.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnAddNum.attr('disabled', 'disabled').prop('disabled', true);
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
  },

  _getSvcNumList: function() {
    var resultList = [];

    this.$lineList.find('li').each(function(index, item) {
      resultList.push(this._getServiceNumberFormat($(item).data('num')));
    }.bind(this));

    return resultList;
  }

};

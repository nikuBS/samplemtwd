/**
 * FileName: recharge.limit.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeLimit = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};


Tw.RechargeLimit.prototype = {
  _init: function () {
    this.rechargeAmount = "5000";
  },

  _cachedElement: function () {
    this.$stepAmount = this.$container.find('#step-amount');
    this.$stepType = this.$container.find('#step-type');
    this.$typeText = this.$container.find('.rechargeType');
    this.$amountText = this.$container.find('.rechargeAmount');
  },

  _bindEvent: function () {
    this.$container.on('click', '#btn-go-amount', $.proxy(this._goToAmount, this));
    this.$container.on('click', '#btn-go-back', $.proxy(this._goToType, this));
    this.$container.on('click', '#btn-submit', $.proxy(this._submit, this));
    this.$container.on('click', '.btn-switch', $.proxy(this._changeLimit, this));
    this.$container.on('click', '.close-step', $.proxy(this._openClosePopup, this));
    this.$stepAmount.on('click', '.tube-list', $.proxy(this._setAmount, this));
  },

  _goToAmount: function () {
    this._setAvailableData();
    this._go('#step-amount');
  },

  _goToType: function () {
    this._go('#step-type')
  },

  _setAvailableData: function () {
    var $typeInput = this.$stepType.find('.checked > input');
    this.rechargeType = $typeInput.data('type');

    var typeText = $typeInput.attr('title');
    this.$typeText.text(typeText);

    var upToAmount = Number(this.$stepAmount.find('.money-select-comment em').text().replace(',', ''));
    this.$stepAmount.find('li').each(function (idx, item) {
      var $item = $(item);
      var $input = $item.find('input');
      var itemValue = Number($item.data('value'));

      if (upToAmount < itemValue) {
        $item.addClass('disabled');
        $input.prop('disabled', true);
      }
    });
  },

  _submit: function (e) {
    var reqData = {
      amt: this.rechargeAmount,
    }

    if (this.rechargeType) {
      this._apiService.request(Tw.API_CMD.BFF_06_0037, reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0036, reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
    this._go('step-complete');
  },

  _success: function (res) {
    if (res.code === '00') {
      this._go('step-complete');
    }
  },

  _fail: function (err) {
    Tw.Logger.log('limit fail', err);
  },

  _setAmount: function (e) {
    this.rechargeAmount = e.target.title;
    var current = Tw.FormatHelper.addComma(e.target.title);
    this.$amountText.text(current);
  },

  _openClosePopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_RECHARGE.LIMIT_A07, undefined, undefined, $.proxy(this._handleClose, this));
  },

  _handleClose: function () {
    this._go('main');
  },

  _changeLimit: function (e) {
    e.preventDefault();

    if (e.currentTarget.id === 'limit-tmth') {
      this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_RECHARGE.LIMIT_A01, undefined, undefined, $.proxy(this._handleConfirmTmth, this, $(e.currentTarget)));
    } else {
      this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_RECHARGE.LIMIT_A02, undefined, undefined, $.proxy(this._handleConfirmRegular, this, $(e.currentTarget)));
    }
  },

  _handleConfirmTmth: function ($switch) {
    // call api
    var state = $switch.hasClass('on');
    if (state) {
      this._apiService.request(Tw.API_CMD.BFF_06_0038);
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0039);
    }

    this._toggleSwitch($switch, state);
  },

  _handleConfirmRegular: function ($switch) {
    var state = $switch.hasClass('on');
    // if (state) {
    //   this._apiService.request(Tw.API_CMD.BFF_06_0040);
    // } else {
    //   this._apiService.request(Tw.API_CMD.BFF_06_0041);
    // }

    this._toggleSwitch($switch, state);
  },

  _toggleSwitch: function ($switch, state) {
    $switch.toggleClass('on');
    $switch.find('input').attr('checked', !state);
    this._popupService.close();
  },

  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  },
};


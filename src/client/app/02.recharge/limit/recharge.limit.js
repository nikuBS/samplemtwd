/**
 * FileName: recharge.ting.js
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.02
 */

Tw.RechargeLimit = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._cachedElement();
  this._bindEvent();
  this._init();
};


Tw.RechargeLimit.prototype = {
  _init: function () {
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
    var chargeClCd = $(e.currentTarget).attr('data-chargeClCd');
    var reqData = {
      amt: this.rechargeAmount,
      chargeClCd: chargeClCd
    }

    // if (this.rechargeType) {
    //   this._apiService.request(Tw.API_CMD.BFF_06_0037, reqData)
    //     .done($.proxy(this._success, this))
    //     .fail($.proxy(this._fail, this));
    // } else {
    //   this._apiService.request(Tw.API_CMD.BFF_06_0036, reqData)
    //     .done($.proxy(this._success, this))
    //     .fail($.proxy(this._fail, this));
    // }
    this._go('#step-complete');
  },

  _success: function (res) {
    if (res.code === '00') {
      this._go('#step-complete');
    }
  },

  _fail: function (err) {
    Tw.Logger.log('limit fail', err);
  },

  _setAmount: function (e) {
    this.rechargeAmount = Number(e.target.title);
    var current = this._getCurrent(e.target.title);
    this.$amountText.text(current);
  },

  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  },

  _getCurrent: function (current) {
    return current.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};


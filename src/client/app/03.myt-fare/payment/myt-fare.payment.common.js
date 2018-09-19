/**
 * FileName: myt-fare.payment.common.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

Tw.MyTFarePaymentCommon = function (rootEl) {
  this.$container = rootEl;
  this.$layer = this.$container.find('#select-line');
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentCommon.prototype = {
  _init: function () {
    this._historyService.init('hash');
    this._initAmount();
    this._initNode();
    this._bindEvent();
  },
  _initAmount: function () {
    this._amount = this.$container.find('.fe-amount').data('value');
  },
  _initNode: function () {
    var $target = this.$layer.find('.checked').parents('li');
    var $cloneTarget = this.$container.find('.fe-selected-line');
    this._cloneNode($target, $cloneTarget);
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-select-line', $.proxy(this._openSelectLine, this));
    this.$layer.on('click', '.fe-layer-select', $.proxy(this._onCheck, this));
    this.$layer.on('click', '.fe-layer-done', $.proxy(this._onClickDoneBtn, this));
  },
  _openSelectLine: function () {
    this._historyService.goHash('#select-line');
  },
  _onCheck: function (event) {
    var $target = $(event.currentTarget);
    var $parentTarget = $target.parents('li');
    var $cloneTarget = this.$container.find('.fe-selected-line');

    if ($target.hasClass('checked')) {
      $target.removeClass('checked');
      $target.css('color', 'black');

      $cloneTarget.find('#' + $parentTarget.attr('id')).remove();
      this._amount -= $parentTarget.find('.fe-layer-amount').data('value');

    } else {
      $target.addClass('checked');
      $target.css('color', 'red');

      this._cloneNode($parentTarget, $cloneTarget);
      this._amount += $parentTarget.find('.fe-layer-amount').data('value');
    }
  },
  _cloneNode: function ($target, $cloneTarget) {
    var $clone = $target.clone();
    $clone.find('.fe-layer-select').remove();
    $clone.appendTo($cloneTarget);
  },
  _onClickDoneBtn: function () {
    if (this._amount === 0) {
      this._popupService.openAlert('select line');
    } else {
      this._setAmount();
      this._historyService.goBack();
    }
  },
  _setAmount: function () {
    this.$container.find('.fe-amount').text(Tw.FormatHelper.addComma(this._amount.toString()));
  },
  getAmount: function () {
    return this._amount;
  }
};
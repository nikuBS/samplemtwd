/**
 * FileName: myt-fare.payment.common.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

Tw.MyTFarePaymentCommon = function (rootEl) {
  this.$container = rootEl;
  this.$originNode = this.$container.find('.fe-origin');
  this.$appendTarget = this.$container.find('.fe-selected-line');
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
    var $target = this.$layer.find('.checked');
    this._cloneNode($target);
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-select-line', $.proxy(this._openSelectLine, this));
    this.$layer.on('change', '.fe-layer-select', $.proxy(this._onCheck, this));
    this.$layer.on('click', '.fe-layer-done', $.proxy(this._onClickDoneBtn, this));
  },
  _openSelectLine: function () {
    this._historyService.goHash('#select-line');
  },
  _onCheck: function (event) {
    var $target = $(event.currentTarget);

    if ($target.hasClass('checked')) {
      this._cloneNode($target);
      this._amount += $target.find('.fe-layer-amount').data('value');

    } else {
      this.$appendTarget.find('#clone' + $target.attr('id')).remove();
      this._amount -= $target.find('.fe-layer-amount').data('value');
    }
  },
  _cloneNode: function ($target) {
    var $clone = this.$originNode.clone();
    $clone.removeClass('fe-origin none');
    $clone.attr({
      'id': 'clone' + $target.attr('id'),
      'data-bill-acnt-num': $target.attr('data-bill-acnt-num'),
      'data-svc-mgmt-num': $target.attr('data-svc-mgmt-num')
    });

    $clone.find('.fe-svc-info').text($target.find('.fe-layer-svc-info').text());
    $clone.find('.fe-date').attr('data-value', $target.find('.fe-layer-inv-dt').data('value'))
      .text($target.find('.fe-layer-inv-dt').text());
    $clone.find('.fe-fee').text($target.find('.fe-layer-amount span').text());
    $clone.appendTo(this.$appendTarget);
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
  },
  getBillList: function () {
    var billList = [];
    this.$appendTarget.find('li').not('.fe-origin').each(function () {
      var $this = $(this);
      var obj = {
        invDt: $this.find('.fe-date').data('value').toString(),
        billSvcMgmtNum: $this.attr('data-svc-mgmt-num'),
        billAcntNum: $this.attr('data-bill-acnt-num'),
        payAmt: $this.find('.fe-fee').text().replace(',', '')
      };
      billList.push(obj);
    });
    return billList;
  }
};
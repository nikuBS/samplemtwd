/**
 * FileName: myt-fare.payment.common.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.09.18
 */

Tw.MyTFarePaymentCommon = function (rootEl) {
  this.$container = rootEl;
  this.$unpaidList = this.$container.find('.fe-unpaid-list');
  this.$appendTarget = this.$container.find('.fe-selected-line');

  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFarePaymentCommon.prototype = {
  _init: function () {
    this._initVariables();
    this._setInitArray();
    this._bindEvent();
  },
  _initVariables: function () {
    this._selectedLine = [];
    this._amount = this.$container.find('.fe-amount').data('value');
    this._isClicked = false;
  },
  _setInitArray: function () {
    var $targetId = this.$unpaidList.find('.fe-line.checked').attr('id');
    this._selectedLine.push($targetId);
  },
  _bindEvent: function () {
    this.$container.on('click', '.fe-select-line', $.proxy(this._selectLine, this));
  },
  _selectLine: function () {
    this._popupService.open({
        'hbs': 'MF_01_01_02'
      },
      $.proxy(this._openSelectLine, this),
      $.proxy(this._afterClose, this),
      'select-line'
    );
  },
  _openSelectLine: function ($layer) {
    this.$layer = $layer;
    this._bindLayerEvent();
  },
  _bindLayerEvent: function () {
    this.$unpaidList.find('.fe-line').each($.proxy(this._setEachData, this));
    this.$layer.on('click', '.fe-select', $.proxy(this._onClickDoneBtn, this));
  },
  _setEachData: function (idx, target) {
    var $target = $(target).clone();
    $target.removeClass('none');

    var $id = $target.attr('id');
    var isChecked = false;

    for (var i in this._selectedLine) {
      if (this._selectedLine[i] === $id) {
        isChecked = true;
      }
    }

    if (isChecked) {
      $target.addClass('checked');
      $target.attr('aria-checked', 'true');
      $target.find('input').attr('checked', 'checked');
    } else {
      $target.removeClass('checked');
      $target.attr('aria-checked', 'false');
      $target.find('input').removeAttr('checked');
    }
    $target.on('change', $.proxy(this._onCheck, this));
    $target.appendTo(this.$layer.find('.fe-line-list'));
  },
  _onClickDoneBtn: function () {
    if (this._amount === 0) {
      this._popupService.openAlert('select line');
    } else {
      this._isClicked = true;
      this._popupService.close();
    }
  },
  _afterClose: function () {
    if (this._isClicked) {
      this._setAmount();
    }
  },
  _setAmount: function () {
    this.$container.find('.fe-amount').text(Tw.FormatHelper.addComma(this._amount.toString()));
  },
  _onCheck: function (event) {
    var $target = $(event.currentTarget);
    var $id = $target.attr('id');

    if ($target.hasClass('checked')) {
      this._selectedLine.push($id);
      this._amount += $target.find('.fe-money').data('value');

    } else {
      for (var i in this._selectedLine) {
        if (this._selectedLine[i] === $id) {
          this._selectedLine.splice(i, 1);
        }
      }
      this._amount -= $target.find('.fe-money').data('value');
    }
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
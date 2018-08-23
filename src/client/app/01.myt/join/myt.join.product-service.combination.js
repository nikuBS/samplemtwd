/*
 * FileName: myt.product-service.combination.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.08.20
 */


Tw.MyTJoinProductServiceCombination = function (rootEl) {
  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTJoinProductServiceCombination.prototype = {
  DEFAULT_SHARE_AMOUNT: 100,
  _init: function () {
    var $shareContainer = this.$container.find('#fe-share-container');

    if ($shareContainer) {
      this._planId = $shareContainer.data('plan-id');
      this._planCode = $shareContainer.data('plan-code');
      this._representationId = $shareContainer.data('representation-id');
      this._lineCount = $shareContainer.data('line-count');
      this._remainAmount = Number($shareContainer.find('.fe-remain-data').text());
      this._shareAmount = this.DEFAULT_SHARE_AMOUNT;
    }
  },

  _bindEvent: function () {
    this.$container.on('click', '.bt-blue1', $.proxy(this._goMain, this));
    this.$container.on('click', '.bt-white1', $.proxy(this._goShareStep, this));
    this.$container.on('click', '.select-list > li', $.proxy(this._handleSelectMember, this));
    this.$container.on('click', '.bt-red1', $.proxy(this._submitShareData, this));
    this.$amountBtn.click($.proxy(this._openSelectAmountPopup, this));
  },

  _cachedElement: function () {
    this.$amountArea = this.$container.find('#fe-amount-area');
    this.$amountBtn = this.$container.find('.bt-dropdown');
  },

  _goShareStep: function () {
    this._history.goHash('share');
  },

  _goMain: function () {
    this._history.goHash('');
  },

  _handleSelectMember: function (e) {
    var $target = $(e.currentTarget);
    var $input = $target.find('input');
    this._beneficiary = {
      id: $input.data('management-id'),
      name: $input.data('member-name')
    }

    this.$amountArea.removeClass('none');
  },

  _submitShareData: function () {
    this._apiService.request(
      Tw.API_CMD.BFF_05_0138,
      this._getRequestData()).done($.proxy(this._successShareData, this)).fail($.proxy(this._fail, this));
  },

  _successShareData: function (resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._remainAmount = this._remainAmount - this._shareAmount;
      this.$container.find('.fe-remain-data').text(this._remainAmount);
      this.$container.find('.fe-beneficiary-name').text(this._beneficiary.name);
      this.$container.find('.fe-benefit-data').text(this._shareAmount);
      this._history.goHash('complete');
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _getRequestData: function () {
    return {
      ofrrSvcMgmtNum: this._representationId,
      ofrrSvcProdGrpCd: this._planCode,
      ofrrSvcProdGrpId: this._planId,
      befrSvcMgmtNum: this._beneficiary.id,
      reqQty: this._shareAmount,
      remainPt: (this._remainAmount - this._shareAmount)
    }
  },

  _fail: function () {
    Tw.Error(resp.code, resp.msg).pop();
  },

  _openSelectAmountPopup: function () {
    var maxLength = 5;
    var list = [];
    var amount = 0;
    var UNIT = 'MB';

    if (this._lineCount > 3) {
      maxLength = 10;
    }

    if (this._shareAmount > this._remainAmount) {
      this._shareAmount = this.DEFAULT_SHARE_AMOUNT;
    }

    for (var i = 0; i < maxLength; i++) {
      amount = (i + 1) * 100;
      if (amount > this._remainAmount) {
        list.push({ 'attr': 'disabled class="disabled"', text: amount + UNIT });
      } else if (amount === this._shareAmount) {
        list.push({ 'attr': 'class="current-choice"', text: amount + UNIT });
      } else {
        list.push({ text: amount + UNIT });
      }
    }

    this._popupService.open({
      'hbs': 'choice',
      'title': Tw.POPUP_TITLE.SHARE_DATA_AMOUNT,
      'close_bt': true,
      'list_tag': false, //a태그로 생성을 원할경우 true, button태그로 생성되는 경우 false
      'bt_num': 'two',
      'list_type': 'type2',
      'list': list
    }, $.proxy(this._bindSelectAmount, this));
  },

  _bindSelectAmount: function ($layer) {
    $layer.on('click', '.popup-choice-list > button', $.proxy(this._handleSelectAmount, this, $layer));
  },

  _handleSelectAmount: function ($layer, e) {
    var target = e.currentTarget;
    var value = target.textContent;
    $layer.find('.current-choice').removeClass('current-choice');
    target.className = 'current-choice';

    var UNIT = 'MB';
    this._shareAmount = Number(value.replace(UNIT, ''));
    this.$amountBtn.text(value);
    this._popupService.close();
  }
};
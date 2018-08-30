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
  BENEFIT_FIRST: {
    SAFE_LTE: '2053-LTESF',
    DATA_FREE: '2053-DAT1G'
  },
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
    this.$container.on('click', '.fe-go-main', $.proxy(this._goMain, this));
    this.$container.on('click', '.fe-go-share', $.proxy(this._goShareStep, this));
    this.$container.on('click', '.select-list > li', $.proxy(this._handleSelectMember, this));
    this.$container.on('click', '#share .bt-red1', $.proxy(this._submitShareData, this));
    this.$container.on('click', '#complete .bt-white1', $.proxy(this._goShareStep, this));
    this.$amountBtn.on('click', $.proxy(this._openSelectAmountPopup, this));
    this.$main.on('click', '.fe-benefit1', $.proxy(this._goFirstBenefit, this));
    this.$main.on('click', '.fe-benefit2', $.proxy(this._goSecondBenefit, this));
    this.$benefitFirst.on('click', '.bt-red1', $.proxy(this._handleChangeFirstBenefit, this));

    if (this.$benefitSecond) {
      this.$benefitSecond.on('click', '.bt-red1', $.proxy(this._handleChangeSecondBenefit, this));
      this.$phoneInput.on('click', $.proxy(this._removeDash, this));
      this.$phoneInput.on('focusout', $.proxy(this._setPhoneNumber, this));
      this.$phoneInput.on('keypress', $.proxy(this._typeOnlyNumber, this));
    }
  },

  _cachedElement: function () {
    this.$amountArea = this.$container.find('#fe-amount-area');
    this.$amountBtn = this.$container.find('.bt-dropdown');
    this.$main = this.$container.find('#main');
    this.$benefitFirst = this.$container.find('#benefit-1st');
    this.$benefitSecond = this.$container.find('#benefit-2nd');

    if (this.$benefitSecond) {
      this.$phoneInput = this.$benefitSecond.find('.inputbox input');
    }
  },

  _goShareStep: function () {
    if (!this.$amountArea.hasClass('none')) {
      this.$amountArea.addClass('none');
      this.$container.find('#share .select-list > li[aria-checked=true]').removeClass('checked');
    }
    this._history.replaceURL('#share');
  },

  _goMain: function () {
    this._history.goLoad('/myt/join/product-service/combination' + location.search);
  },

  _handleSelectMember: function (e) {
    var $target = $(e.currentTarget);
    var $input = $target.find('input');
    this._beneficiary = {
      id: $input.data('management-id'),
      name: $input.data('member-name')
    };

    this.$amountArea.removeClass('none');
  },

  _submitShareData: function () {
    this._apiService.request(
      Tw.API_CMD.BFF_05_0138,
      this._getRequestData()).done($.proxy(this._successShareData, this)).fail($.proxy(this._fail, this));
  },

  _successShareData: function (resp) {
    var $beneficiary = $(this.$container.find('#share .select-list > li[aria-checked=true] .data-line-info')[1]);
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._remainAmount = this._remainAmount - this._shareAmount;
      this.$container.find('.fe-remain-data').text(this._remainAmount);

      if (this._remainAmount < 100) {
        this.$container.find('#complete .bt-white1').addClass('none');
        this.$container.find('#complete .gift-data-info').remove();
      } else if ($beneficiary) {
        $beneficiary.children().removeClass('none');
        $beneficiary.find('.fe-no-data').addClass('none');
        $beneficiary.find('.tx-bold').text(Number($beneficiary.find('.tx-bold').text() || 0) + this._shareAmount);
      }

      this.$container.find('.fe-beneficiary-name').text(this._beneficiary.name);
      this.$container.find('.fe-benefit-data').text(this._shareAmount);
      this._history.replaceURL('#complete');
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
    };
  },

  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
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

  _goFirstBenefit: function (e) {
    var $target = $(e.target);
    var $infoArea = $target.parents('li.acco-list');

    this.$benefitFirst.find('span.fe-name').text($infoArea.find('.info-line .fe-name').text());
    this.$benefitFirst.find('span.data-number').text($infoArea.find('.info-line.ff-hn').text());

    this._selectedBenefit = $infoArea.find('.right-item').data('selected-benefit');
    var benefitLi = $(this.$benefitFirst.find('ul.tube-list > li')[this._selectedBenefit === this.BENEFIT_FIRST.DATA_FREE ? 1 : 0]);
    benefitLi.addClass('checked');
    benefitLi.attr('aria-checked', 'true');
    benefitLi.find('input').attr('checked', 'checked');

    this._history.replaceURL('#benefit-1st');
  },

  _handleChangeFirstBenefit: function () {
    var nSelectedBenefit = this.$benefitFirst.find('ul.tube-list li.checked').index() === 1 ?
      this.BENEFIT_FIRST.DATA_FREE : this.BENEFIT_FIRST.SAFE_LTE;

    if (this._selectedBenefit === nSelectedBenefit) {
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_COMBINATION_A09);
    } else {
      this._apiService.request(Tw.API_CMD.BFF_05_0135, {
        chgOpCd: 6,
        benefitVal: nSelectedBenefit
      }).done($.proxy(this._successChageBenefit, this)).fail($.proxy(this._fail, this));
    }
  },

  _goSecondBenefit: function (e) {
    var $target = $(e.target);
    var $infoArea = $target.parents('li.acco-list');

    this.$benefitSecond.find('span.fe-name').text($infoArea.find('.info-line .fe-name').text());
    this.$benefitSecond.find('span.data-number').text($infoArea.find('.info-line.ff-hn').text());

    this._freeLineNumber = $infoArea.find('.ff-hn.vbl').text();

    this._history.replaceURL('#benefit-2nd');
  },

  _handleChangeSecondBenefit: function () {
    var nFreeLineNumber = this.$phoneInput.val().replace(/-/g, '');

    if (this._freeLineNumber === nFreeLineNumber) {
      this._openNotifyAlert(Tw.MSG_MYT.JOIN_COMBINATION_A10, this.$phoneInput);
    } else if (nFreeLineNumber.length < 10 || nFreeLineNumber.length > 11) {
      this._openNotifyAlert(Tw.MSG_MYT.JOIN_COMBINATION_A07, this.$phoneInput);
    } else if (!Tw.ValidationHelper.isCellPhone(nFreeLineNumber)) {
      this._openNotifyAlert(Tw.MSG_MYT.JOIN_COMBINATION_A08, this.$phoneInput);
    } else {
      this._apiService.request(Tw.API_CMD.BFF_05_0135, {
        chgOpCd: 5,
        benefitVal: nFreeLineNumber
      }).done($.proxy(this._successChageBenefit, this)).fail($.proxy(this._fail, this));
    }
  },

  _openNotifyAlert: function (content, $input) {
    this._popupService.openAlert(content, Tw.POPUP_TITLE.NOTIFY, '', $.proxy(function () {
      $input.focus();
    }, this));
  },

  _successChageBenefit: function (resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(Tw.MSG_MYT.JOIN_COMBINATION_A06);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
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
  },

  _setPhoneNumber: function () {
    this.$phoneInput.attr('type', 'text');
    this.$phoneInput.val(Tw.FormatHelper.getDashedCellPhoneNumber(this.$phoneInput.val()));
  },

  _removeDash: function () {
    this.$phoneInput.val((this.$phoneInput.val() || '').replace(/-/g, ''));
    this.$phoneInput.attr('type', 'number');
  },

  _typeOnlyNumber: function (e) {
    var currentValue = e.target.value;

    if (currentValue.length > 10 || !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  }
};
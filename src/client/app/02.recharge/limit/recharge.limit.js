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
  REGULAR: 'regular',
  TMTH: 'tmth',

  _init: function () {
    this.rechargeAmount = '5000';
    this._limit = {};

    this.upToAmount = this.$container.find('.box-block-list1 .price').data('possible-amount') || '0';
    var $limitBlock = this.$container.find('.box-block-list1.btm-border ul');

    this._possibleRecharge = Number(this.upToAmount.replace(/,/g, '')) > 0;
    this._rechargeRegular = $limitBlock.data('recharge-regular');
    this._toggleSwitch(this.TMTH, $limitBlock.data('limit-tmth'));
    this._toggleSwitch(this.REGULAR, $limitBlock.data('limit-regular'));
    this._checkNextBtnDisabled();
  },

  _cachedElement: function () {
    this.$stepMain = this.$container.find('#main');
    this.$stepType = this.$container.find('#step-type');
    this.$stepAmount = this.$container.find('#step-amount');
    this.$typeAmount = this.$container.find('.rechargeAmount');
    this.$btnRecharge = this.$stepMain.find('.bt-blue1 button');
    this.$limit = {
      tmth: this.$container.find('#fe-limit-tmth'),
      regular: this.$container.find('#fe-limit-regular')
    };
    this.$select = {
      tmth: this.$stepType.find('#fe-select-type-tmth'),
      regular: this.$stepType.find('#fe-select-type-regular')
    };
  },

  _bindEvent: function () {
    this.$container.on('click', '.btn-switch', $.proxy(this._openChangeLimitPopup, this));
    this.$container.on('click', '.close-step', $.proxy(this._openClosePopup, this));
    this.$container.on('click', '.box-block-list1 button', $.proxy(this._openCancelRegularPopup, this));
    this.$stepMain.on('click', '.bt-blue1 button', $.proxy(this._setDataToTypeStep, this));
    this.$stepType.on('click', '.bt-blue1 button', $.proxy(this._goToAmount, this));
    this.$stepAmount.on('click', '#fe-btn-submit', $.proxy(this._handleRecharge, this));
    this.$stepAmount.on('click', '.tube-list.two', $.proxy(this._setSelectedAmount, this));
    this.$stepAmount.on('click', '.bt-white2', $.proxy(this._goHash, this, 'step-type'));
  },

  _goToAmount: function () {
    this._setDataToAmountStep();
    this._goHash('step-amount');
  },

  _setDataToTypeStep: function () {
    var $selectTmth = this.$select.tmth;
    var $selectRegular = this.$select.regular;

    if (this._limit.tmth) {
      this._setTypeRadioState($selectTmth, true);
      this._setTypeRadioState($selectRegular, false);
    } else {
      this._setTypeRadioState($selectTmth, false);
      this._setTypeRadioState($selectRegular, true);
    }

    if (!this._limit.regular || this._rechargeRegular) {
      $selectRegular.find('input').attr('disabled', true);
      $selectRegular.addClass('disabled');
    } else {
      $selectRegular.find('input').attr('disabled', false);
      $selectRegular.removeClass('disabled');
    }
  },

  _setTypeRadioState: function ($switch, state) {
    if (state) {
      $switch.addClass('checked');
      $switch.removeClass('disabled');
    } else {
      $switch.removeClass('checked');
      $switch.addClass('disabled');
    }

    $switch.find('input').attr({ 'checked': state, 'aria-checked': state, 'disabled': !state });
  },

  _setDataToAmountStep: function () {
    var $typeInput = this.$stepType.find('.checked > input');
    this.rechargeType = $typeInput.data('type');

    var typeText = $typeInput.attr('title');
    this.$container.find('.rechargeType').text(typeText);

    var upToAmount = Number(this.upToAmount.replace(/,/g, ''));
    this.$stepAmount.find('.tube-list.two li').each(function (idx, item) {
      var $item = $(item);
      var $input = $item.find('input');
      var itemValue = Number($item.data('value'));

      if (upToAmount < itemValue) {
        $item.addClass('disabled');
        $input.prop('disabled', true);
      }
    });
  },

  _handleRecharge: function () {
    var api = this.rechargeType ? Tw.API_CMD.BFF_06_0035 : Tw.API_CMD.BFF_06_0036;

    this._apiService.request(api, { amt: this.rechargeAmount })
      .done($.proxy(this._successRecharge, this))
      .fail($.proxy(this._fail, this));
  },

  _successRecharge: function (res) {
    this._history.setHistory();
    if (res.code === Tw.API_CODE.CODE_00) {
      this._goHash('step-complete');
    } else {
      this._popupService.openAlert(res.data && res.data.msg);
    }
  },

  _fail: function (err) {
    Tw.Logger.log('limit fail', err);
  },

  _setSelectedAmount: function (e) {
    this.rechargeAmount = e.target.title;
    this.$typeAmount.text(Tw.FormatHelper.addComma(this.rechargeAmount));
  },

  _openClosePopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_RECHARGE.LIMIT_A07, undefined, undefined, $.proxy(this._goHash, this, 'main'));
  },

  _openCancelRegularPopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_RECHARGE.LIMIT_A08, undefined, undefined, $.proxy(this._handleCancelRegular, this));
  },

  _handleCancelRegular: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0037).done($.proxy(this._handleSuccessCancelRegular, this));
  },

  _handleSuccessCancelRegular: function (resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      this.$container.find('#fe-recharge-regular').remove();
      this.$container.find('.box-block-list1 button').remove();
      delete this._rechargeRegular;
      this._checkNextBtnDisabled();
      this._popupService.close();
    } else {
      this._popupService.close();
      this._popupService.openAlert(resp.data && resp.data.msg);
    }
  },

  _openChangeLimitPopup: function (e) {
    e.preventDefault();

    var type = this.TMTH;
    var message = '';

    if (e.currentTarget.id === 'fe-limit-regular') {
      type = this.REGULAR;
      if (this._rechargeRegular) {
        this._popupService.openAlert(Tw.MSG_RECHARGE.LIMIT_A03);
        return;
      } else {
        message = this._limit.regular ? Tw.MSG_RECHARGE.LIMIT_A02 : Tw.MSG_RECHARGE.LIMIT_A04;
      }
    } else {
      message = this._limit.tmth ? Tw.MSG_RECHARGE.LIMIT_A01 : Tw.MSG_RECHARGE.LIMIT_A05;
    }

    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, message, undefined, undefined, $.proxy(this._handleChangeLimit, this, type));
  },

  _handleChangeLimit: function (type) {
    var state = this.$limit[type].hasClass('on');
    var api = null;
    if (type === this.TMTH) {
      api = state ? Tw.API_CMD.BFF_06_0038 : Tw.API_CMD.BFF_06_0039;
    } else {
      api = state ? Tw.API_CMD.BFF_06_0040 : Tw.API_CMD.BFF_06_0041;
    }

    this._apiService.request(api).done($.proxy(this._handleToggleLimit, this, type, !state));
    this._popupService.close();
  },

  _handleToggleLimit: function (type, state, resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._toggleSwitch(type, state);
      this._checkNextBtnDisabled();
    } else {
      this._popupService.openAlert(Tw.MSG_RECHARGE.LIMIT_A06);
      return;
    }
  },


  _toggleSwitch: function (type, state) {
    var $switch = this.$limit[type];
    this._limit[type] = state;

    if (state) {
      $switch.addClass('on');
    } else {
      $switch.removeClass('on');
    }

    $switch.find('input').attr('checked', state);
    $switch.find('.switch-style').attr('aria-checked', state);
  },

  _checkNextBtnDisabled: function () {
    var limitTmth = this._limit.tmth;
    var limitRegular = this._limit.regular;

    if (!this._possibleRecharge || !limitTmth && (this._rechargeRegular || !limitRegular)) {
      this.$btnRecharge.attr('disabled', true);
    } else {
      this.$btnRecharge.attr('disabled', false);
    }
  },

  _goHash: function (hash) {
    this._history.replaceURL('#' + hash);
  }
};


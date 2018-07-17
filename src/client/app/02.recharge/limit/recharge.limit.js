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
  TYPE: { REGULAR: 0, TMTH: 1 },

  _init: function () {
    this.rechargeAmount = "5000";

    var $limitBlock = this.$container.find('.box-block-list1.btm-border ul');
    this._toggleSwitch(this.TYPE.TMTH, $limitBlock.data('limit-tmth'));
    this._toggleSwitch(this.TYPE.REGULAR, $limitBlock.data('limit-regular'));
    this._rechargeRegular = $limitBlock.data('recharge-regular');
    this._possibleRecharge = Number(this.$container.find('span.price').data('possible-amount').replace(/,/g, '')) > 0;
  },

  _cachedElement: function () {
    this.$stepAmount = this.$container.find('#step-amount');
    this.$stepType = this.$container.find('#step-type');
    this.$limitTmth = this.$container.find('#limit-tmth');
    this.$limitRegular = this.$container.find('#limit-regular');
    this.$btnRecharge = this.$container.find('#btn-go-type');
    this.$selectTmth = this.$stepType.find('#select-type-tmth');
    this.$selectRegular = this.$stepType.find('#select-type-regular');
    this.$typeAmount = this.$container.find('.rechargeAmount');
  },

  _bindEvent: function () {
    this.$container.on('click', '#btn-go-amount', $.proxy(this._goToAmount, this));
    this.$container.on('click', '#btn-go-back', $.proxy(this._goToType, this));
    this.$container.on('click', '#btn-submit', $.proxy(this._submit, this));
    this.$container.on('click', '#btn-go-type', $.proxy(this._setDefaultType, this));
    this.$container.on('click', '.btn-switch', $.proxy(this._openChangeLimitPopup, this));
    this.$container.on('click', '.close-step', $.proxy(this._openClosePopup, this));
    this.$container.on('click', '#btn-cancel-regular', $.proxy(this._openCancelRegularPopup, this));
    this.$stepAmount.on('click', '.tube-list', $.proxy(this._setAmount, this));
  },

  _goToAmount: function () {
    this._setAvailableData();
    this._go('#step-amount');
  },

  _goToType: function () {
    this._go('#step-type');
  },

  _setDefaultType: function () {
    if (this._limitTmth) {
      this.$selectTmth.addClass('checked');
      this.$selectTmth.find('input').attr({ 'checked': true, 'aria-checked': true, 'disabled': false });
      this.$selectRegular.removeClass('checked');
      this.$selectRegular.find('input').attr({ 'checked': false, 'aria-checked': false });
    } else {
      this.$selectTmth.removeClass('checked');
      this.$selectTmth.find('input').attr({ 'checked': false, 'aria-checked': false, 'disabled': true });
      this.$selectRegular.addClass('checked');
      this.$selectRegular.find('input').attr({ 'checked': true, 'aria-checked': true, 'disabled': false });
    }

    if (!this._limitRegular) {
      this.$selectRegular.find('input').attr('disabled', true);
    }
  },

  _setAvailableData: function () {
    var $typeInput = this.$stepType.find('.checked > input');
    this.rechargeType = $typeInput.data('type');

    var typeText = $typeInput.attr('title');
    this.$container.find('.rechargeType').text(typeText);

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
      this._apiService.request(Tw.API_CMD.BFF_06_0035, reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    } else {
      this._apiService.request(Tw.API_CMD.BFF_06_0036, reqData)
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
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
    this.rechargeAmount = e.currentTarget.title;
    this.$typeAmount.text(Tw.FormatHelper.addComma(this.rechargeAmount));
  },

  _openClosePopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_RECHARGE.LIMIT_A07, undefined, undefined, $.proxy(this._go, this, 'main'));
  },

  _openCancelRegularPopup: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_RECHARGE.LIMIT_A08, undefined, undefined, $.proxy(this._handleCancelRegular, this));
  },

  _handleCancelRegular: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0037).done($.proxy(this._handleSuccessCancleRegular, this));
  },

  _handleSuccessCancleRegular: function (resp) {
    if (resp.code === API_CODE.CODE_00) {
      this.$container.find('#recharge-regular').remove();
      this.$container.find('#btn-cancel-regular').remove();
    }
    this._popupService.close();
  },

  _openChangeLimitPopup: function (e) {
    e.preventDefault();

    var type = e.currentTarget.id === 'limit-tmth' ? this.TYPE.TMTH : this.TYPE.REGULAR;
    var message = "";

    if (type === this.TYPE.REGULAR) {
      if (this._rechargeRegular) {
        this._popupService.openAlert(Tw.MSG_RECHARGE.LIMIT_A03);
        return;
      } else {
        if (this._limitRegular) {
          message = Tw.MSG_RECHARGE.LIMIT_A02;
        } else {
          message = Tw.MSG_RECHARGE.LIMIT_A04;
        }
      }
    } else {
      if (this._limitTmth) {
        message = Tw.MSG_RECHARGE.LIMIT_A01;
      } else {
        message = Tw.MSG_RECHARGE.LIMIT_A05;
      }
    }

    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, message, undefined, undefined, $.proxy(this._handleChangeLimit, this, type));
  },

  _handleToogleLimit: function (resp, type, state) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      this._toggleSwitch(type, state);
    } else {
      this._popupService.openAlert(Tw.MSG_RECHARGE.LIMIT_A06);
      return;
    }
  },

  _handleChangeLimit: function (type) {
    if (type === this.TYPE.TMTH) {
      state = this.$limitTmth.hasClass('on');

      if (state) {
        this._apiService.request(Tw.API_CMD.BFF_06_0038).done($.proxy(this._handleToogleLimit, this, this.TYPE.TMTH, state));
      } else {
        this._apiService.request(Tw.API_CMD.BFF_06_0039).done($.proxy(this._handleToogleLimit, this, this.TYPE.TMTH, state));
      }
    } else {
      state = this.$limitRegular.hasClass('on');
      if (state) {
        this._apiService.request(Tw.API_CMD.BFF_06_0040).done($.proxy(this._handleToogleLimit, this, this.TYPE.REGULAR, state));
      } else {
        this._apiService.request(Tw.API_CMD.BFF_06_0041).done($.proxy(this._handleToogleLimit, this, this.TYPE.REGULAR, state));
      }
    }

    this._popupService.close();
  },

  _toggleSwitch: function (type, state) {
    var $switch = null;

    switch (type) {
      case this.TYPE.REGULAR:
        $switch = this.$limitRegular;
        this._limitRegular = state;
        break;
      case this.TYPE.TMTH:
        $switch = this.$limitTmth;
        this._limitTmth = state;
        break;
      default:
        return;
    }

    if (state) {
      $switch.addClass('on');
    } else {
      $switch.removeClass('on');
    }

    $switch.find('input').attr('checked', state);
    $switch.find('.switch-style').attr('aria-checked', state);

    if (this._possibleRecharge && !this._limitTmth && !this._limitRegular) {
      this.$btnRecharge.attr('disabled', true);
    } else {
      this.$btnRecharge.attr('disabled', false);
    }
  },

  _go: function (hash) {
    this._history.setHistory();
    window.location.hash = hash;
  },
};


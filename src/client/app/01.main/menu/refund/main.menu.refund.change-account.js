/**
 * FileName: main.menu.refund.change-account.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.21
 */

Tw.MainMenuRefundChangeAccount = function (rootEl, bankList, target, callback) {
  this.$container = rootEl;
  this._bankList = bankList;
  this._target = target;
  this._callback = callback;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cacheElements();
  this._bindEvents();
};

Tw.MainMenuRefundChangeAccount.prototype = {
  _cacheElements: function () {
    this.$bankInput = this.$container.find('#formInput01');
    this.$accountInput = this.$container.find('#formInput02');
    this.$accountError = this.$container.find('.fe-account-error');
    this.$submitBtn = this.$container.find('#fe-submit');
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-bank-select', $.proxy(this._onBankSelect, this));
    this.$accountInput.on('keyup', $.proxy(this._toggleSubmit, this));
    this.$submitBtn.on('click', $.proxy(this._onSubmit, this));
  },
  _onBankSelect: function () {
    var selectedBankCode = this.$bankInput.attr('data-code');
    if (!Tw.FormatHelper.isEmpty(this._bankList)) {
      this._showBankList(selectedBankCode);
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0045, {})
      .then($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          this._bankList = _.map(res.result, function (bankInfo) {
            return {
              option: 'bank',
              attr: 'value="' + bankInfo.commCdVal + '"',
              value: bankInfo.commCdValNm
            };
          });
          this._showBankList(selectedBankCode);
        } else {
          Tw.Error(res.code, res.msg).pop();
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },
  _showBankList: function (selectedBankCode) {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TITLE.REFUND_BANK_SELECT,
      data: [{
        list: this._bankList
      }]
    }, $.proxy(function (root) {
      if (!Tw.FormatHelper.isEmpty(selectedBankCode)) {
        root.find('button[value="' + selectedBankCode + '"] input').prop('checked', true);
      }

      root.on('click', '.bank', $.proxy(function (e) {
        this.$bankInput.attr('data-code', e.currentTarget.value);
        this.$bankInput.attr('value', $(e.currentTarget).find('.info-value').text());
        this._popupService.close();
        this._toggleSubmit();
      }, this));
    }, this));
  },
  _toggleSubmit: function () {
    var account = this.$accountInput.val();
    var bank = this.$bankInput.val();

    if (!Tw.FormatHelper.isEmpty(account) && !Tw.FormatHelper.isEmpty(bank)) {
      this.$submitBtn.removeAttr('disabled');
    } else {
      this.$submitBtn.attr('disabled', 'disabled');
    }
  },
  _onSubmit: function () {
    var param = {
      opTyp: '1',
      rfndBankCd: this.$bankInput.data('code'),
      rfndBankNum: this.$accountInput.val(),
      recCnt: '1',
      refundAccount: [{
        svcMgmtNum: this._target.svcMgmtNum,
        acntNum: this._target.acntNum,
        custNum: this._target.custNum,
        bamtClCd: this._target.bamtClCd
      }]
    };

    this._apiService.request(Tw.API_CMD.BFF_01_0043, param)
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          if (res.result === '0') {
            this._popupService.close();
            this._callback();
          } else if (res.result.indexOf('ZNGME') !== -1) {
            this.$accountError.removeClass('none');
          }
          return;
        }

        Tw.Error(res.code, res.msg).pop();
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  }
};
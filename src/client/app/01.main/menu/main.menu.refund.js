/**
 * FileName: main.menu.refund.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.15
 */

Tw.MainMenuRefund = function (rootEl) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._bankList = undefined;

  this._cacheElements();
  this._bindEvents();
};

Tw.MainMenuRefund.prototype = {
  _cacheElements: function () {
    this.$bankInput = this.$container.find('.fe-bank-input');
    this.$accountInput = this.$container.find('.fe-account-input');
    this.$submitBtn = this.$container.find('#fe-submit');
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-btn-detail', $.proxy(this._onDetail, this));
    this.$container.on('click', '#fe-outlink-smartchoice', $.proxy(this._onOutToSmartChoice, this));
    this.$container.on('click', '#fe-select-bank', $.proxy(this._onBankNeeded, this));
    this.$accountInput.on('keyup', $.proxy(this._toggleSubmit, this));
  },
  _onDetail: function () {
    this._popupService.open({
      hbs: 'actionsheet_link_b_type',
      layer: true,
      title: '해지환급금액 상세보기',
      data: [{ list: [{value: '휴대폰', explain: '010-123-0231', text1: '25,000원'}, {value: '휴대폰', explain: '010-231-0231', text1: '5,000원'}]}]
    }, function (root) {
      root.find('.ico').hide();
    });
  },
  _onOutToSmartChoice: function () {
    var move = function () { Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.SMART_CHOICE); };

    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(function () {
        move();
      });
      return;
    }

    move();
  },
  _onBankNeeded: function () {
    var selectedBankCode = this.$bankInput.data('code');
    if (!Tw.FormatHelper.isEmpty(this._bankList)) {
      this._showBankList(selectedBankCode);
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0044, {})
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
      title: '환불신청계좌 은행 선택',
      data: [{
        list: this._bankList
      }]
    }, $.proxy(function (root) {
      if (!Tw.FormatHelper.isEmpty(selectedBankCode)) {
        root.find('button[value="' + selectedBankCode + '"]').addClass('checked');
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
  }

};

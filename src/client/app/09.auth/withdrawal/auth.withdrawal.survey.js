/**
 * FileName: auth.withdrawal.survey.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.03
 */

Tw.AuthWithdrawalSurvey = function (rootEl) {
  this.$container = rootEl;

  this.selected = '1';

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.AuthWithdrawalSurvey.prototype = {
  _cachedElement: function() {
    this.$textAreaBox = this.$container.find('.box-txarea');
    this.$textArea = this.$container.find('.txt-bg');
    this.$byteCurrent = this.$container.find('.byte-current');
  },
  _bindEvent: function () {
    this.$container.on('change', 'input[type="radio"]', $.proxy(this._toggleTextArea, this));
    this.$textArea.on('keyup', $.proxy(this._calCurrentByte, this));
    this.$container.on('click', '#withdraw', $.proxy(this._showWithdrawConfirm, this));
  },
  _init: function() {
    this.$textAreaBox.hide();
  },
  _toggleTextArea: function (evt) {
    this.selected = evt.target.id;
    if (this.selected === '6') {
      this.$textAreaBox.show();
    } else {
      this.$textAreaBox.hide();
    }
  },
  _calCurrentByte: function () {
    var current = this.$textArea.val();
    // limit to 20
    if (current.length > 20) {
      current = current.substring(0, 20);
      this.$textArea.val(current);
    }
    this.$byteCurrent.html(current.length);
  },
  _showWithdrawConfirm: function () {
    Tw.Popup.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_AUTH.WITHDRAW_A06, '',
      null, $.proxy(this._sendWithdrawRequest, this));
  },
  _sendWithdrawRequest: function () {
    var data = {
      qstnCd: this.selected
    };
    if (data.qstnCd === '6') {
      data.qstnCtt = this.$textArea.val();
    }

    Tw.Api.request(Tw.API_CMD.BFF_03_0003, data)
      .done($.proxy(this._onRequestDone, this))
      .fail($.proxy(this._onRequestFail, this));

    Tw.Popup.close();
  },
  _onRequestDone: function (res) {
    if (res.code === '00') {
      var href = '';
      if (res.result.tidYn === 'Y') {
        href = '/auth/withdrawal/complete?tid=Y'; // Still usable with TID
      } else {
        href = '/auth/withdrawal/complete'; // Need to sign-up with TID
      }
      window.location = href;
    } else {
      Tw.Popup.openAlert(res.msg);
    }
  },
  _onRequestFail: function (err) {
    Tw.Logger.error('BFF_03_0003 Fail', err);
  }
};

/**
 * FileName: auth.withdrawal.survey.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.03
 */

Tw.AuthWithdrawalSurvey = function (rootEl) {
  this.$container = rootEl;

  this._cachedElement();
  this._bindEvent();
};

Tw.AuthWithdrawalSurvey.prototype = {
  _cachedElement: function() {
    this.$textAreaBox = this.$container.find('.box-txarea');
    this.$textArea = this.$container.find('.txt-bg');
    this.$byteCurrent = this.$container.find('.byte-current');
  },
  _bindEvent: function () {
    this.$container.on('change', '#cb-6', $.proxy(this._toggleTextArea, this));
    this.$textArea.on('keyup', $.proxy(this._calCurrentByte, this));
    this.$container.on('click', '#withdraw', $.proxy(this._showWithdrawConfirm, this));
  },
  _toggleTextArea: function (evt) {
    if (evt.target.checked) {
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
    Tw.Popup.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_AUTH.WITHDRAW_A6, '',
      $.proxy(this._sendWithdrawRequest, this));
  },
  _sendWithdrawRequest: function () {
    // TODO: Temporal test code, TBD
    var data = {
      qstnCd: '6',
      qstnCtt: this.$textArea.val()
    };
  
    Tw.Api.request(Tw.API_CMD.BFF_03_0003, JSON.stringify(data))
      .done(function (res) {
        if (res.code === '00') {
          var href = '';
          if (res.result.tidYn === 'Y') {
            href = '/auth/withdrawal/complete?tid=Y'; // Still usable with TID
          } else {
            href = '/auth/withdrawal/complete'; // Need to sign-up with TID
          }
          window.location = href;
        } else {
          Tw.Popup.openAlert(Tw.POPUP_TITLE.NOTIFY, res.msg);
        }
      })
      .fail(function (err) {
        Tw.Logger.error('BFF_03_0003 Fail', err);
      });
  }
};

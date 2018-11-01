/**
 * FileName: common.withdrawal.survey.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.31
 */

Tw.CommonWithdrawalSurvey = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._open();
};

Tw.CommonWithdrawalSurvey.prototype = {
  _open: function () {
    this._popupService.open({
        hbs: 'CO_ME_01_05_01_03'
      },
      $.proxy(this._onSurveyEvent, this),
      $.proxy(this._onWithdrawal, this),
      'withdrawal');
  },
  _onSurveyEvent: function ($layer) {
    this._cachedElement($layer);
    this._init();
    this._bindEvent();
  },
  _cachedElement: function($layer) {
    this.$layer = $layer;
    this.$textAreaBox = $layer.find('.fe-text-area-box');
    this.$textArea = $layer.find('.fe-text-area');
    this.$byteCurrent = $layer.find('.byte-current');
  },
  _init: function() {
    this.$textAreaBox.hide();
  },
  _bindEvent: function () {
    this.$layer.on('change', 'input[type="radio"]', $.proxy(this._toggleTextArea, this));
    this.$textArea.on('keyup', $.proxy(this._calCurrentByte, this));
    this.$layer.on('click', '.fe-withdraw', $.proxy(this._showWithdrawConfirm, this));
  },
  _toggleTextArea: function (event) {
    this.selected = event.target.id;
    if (this.selected === '6') {
      this.$textAreaBox.show();
    } else {
      this.$textAreaBox.hide();
    }
    console.log(this.selected);
    this.$layer.find('.fe-withdraw').removeAttr('disabled');
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
  _isValid: function () {
    var $target = this.$textArea;
    if (this.selected === '6' && $.trim($target.val()) === '') {
      this._popupService.openAlert(Tw.ALERT_MSG_COMMON.ALERT_4_A4,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(this._focus, this, $target));
      return false;
    }
    return true;
  },
  _focus: function ($target) {
    $target.focus();
  },
  _showWithdrawConfirm: function () {
    if (this._isValid()) {
      this._popupService.openConfirm(Tw.ALERT_MSG_COMMON.ALERT_4_A3, Tw.POPUP_TITLE.NOTIFY,
        null, $.proxy(this._sendWithdrawRequest, this));
    }
  },
  _sendWithdrawRequest: function () {
    var data = {
      qstnCd: this.selected
    };
    if (data.qstnCd === '6') {
      data.qstnCtt = this.$textArea.val();
    }

    this._apiService.request(Tw.API_CMD.BFF_03_0003, data)
      .done($.proxy(this._onRequestDone, this))
      .fail($.proxy(this._error, this));
  },
  _onRequestDone: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.tidYn === 'Y') {
        this._hbs = 'CO_ME_01_05_01_04_02';
      } else {
        this._hbs = 'CO_ME_01_05_01_04_01';
      }

      // Getting rid of session
      this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
        .done(function (resp) {
          if (resp.code === Tw.API_CODE.CODE_00) {
            this._isCompleteWithdraw = true;
            this._popupService.close();
          } else {
            this._error(resp);
          }
        })
        .fail($.proxy(this._error, this));
    } else {
      this._error(res);
    }
  },
  _onWithdrawal: function () {
    if (this._isCompleteWithdraw) {
      this._openCompletePop();
    }
  },
  _openCompletePop: function () {
    this._popupService.open({
      hbs: this._hbs
    },
      $.proxy(this._onOpenComplete, this),
      $.proxy(this._goLink, this),
      'complete'
    );
  },
  _onOpenComplete: function ($layer) {
    $layer.on('click', '.fe-id-withdrawal', $.proxy(this._setLink, this, 'tid'));
    $layer.on('click', '.fe-re-join', $.proxy(this._setLink, this, 'join'));
    $layer.on('click', '.fe-home', $.proxy(this._setLink, this, 'home'));
  },
  _setLink: function (type) {
    if (type === 'tid') {
      this.isTID = true;
    } else if (type === 'join') {
      this._link = '/common/tid/signup-local';
    } else {
      this._link = '/main/home';
    }
    this._popupService.close();
  },
  _goLink: function () {
    if (this.isTID) {
      Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.SKT_ID);
    } else {
      this._historyService.goLoad(this._link);
    }
  },
  _error: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};

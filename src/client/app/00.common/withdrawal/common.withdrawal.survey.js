/**
 * @file common.withdrawal.survey.js
 * @desc 회원탈퇴 완료 처리
 * @author Jayoon Kong
 * @since 2018.10.31
 */

/**
 * @namespace Tw
 * @desc 회원탈퇴 namespace
 */
Tw.CommonWithdrawalSurvey = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();

  this._isTid = false;

  this._open();
};

Tw.CommonWithdrawalSurvey.prototype = {
  /**
   * @function
   * @desc 설문조사 팝업 로드 (common.withdrawal.js 이후)
   */
  _open: function () {
    this._popupService.open({
        hbs: 'CO_ME_01_05_01_03'
      },
      $.proxy(this._onSurveyEvent, this),
      $.proxy(this._onWithdrawal, this),
      'withdrawal-survey');
  },
  /**
   * @function
   * @desc initialize
   * @param $layer - 객체 팝업
   */
  _onSurveyEvent: function ($layer) {
    this._cachedElement($layer);
    this._init();
    this._bindEvent();
  },
  /**
   * @function
   * @desc initialize variables
   * @param $layer - 객체 팝업
   */
  _cachedElement: function($layer) {
    this.$layer = $layer;
    this.$textAreaBox = $layer.find('.fe-text-area-box');
    this.$textArea = $layer.find('.fe-text-area');
    this.$byteCurrent = $layer.find('.byte-current');
  },
  /**
   * @function
   * @desc textarea 영역 초기화
   */
  _init: function() {
    this.$textAreaBox.hide();
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$layer.on('change', 'input[type="radio"]', $.proxy(this._toggleTextArea, this));
    this.$textArea.on('keyup', $.proxy(this._calCurrentByte, this));
    this.$layer.on('click', '.fe-withdraw', $.proxy(this._showWithdrawConfirm, this));
  },
  /**
   * @function
   * @desc 6번째 항목 선택 시 textarea 활성화
   * @param event
   */
  _toggleTextArea: function (event) {
    this.selected = event.target.id;
    if (this.selected === '6') {
      this.$textAreaBox.show();
    } else {
      this.$textAreaBox.hide();
    }
    this.$layer.find('.fe-withdraw').removeAttr('disabled');
  },
  /**
   * @function
   * @desc textarea 글자 수 체크
   */
  _calCurrentByte: function () {
    var current = this.$textArea.val();
    // limit to 20
    if (current.length > 20) {
      current = current.substring(0, 20);
      this.$textArea.val(current);
    }
    this.$byteCurrent.html(current.length);
  },
  /**
   * @function
   * @desc input validation check
   * @returns {boolean}
   */
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
  /**
   * @function
   * @desc target에 focus 지정
   * @param $target
   */
  _focus: function ($target) {
    $target.focus();
  },
  /**
   * @function
   * @desc show confirm alert
   */
  _showWithdrawConfirm: function () {
    if (this._isValid()) {
      this._popupService.openConfirm(Tw.ALERT_MSG_COMMON.ALERT_4_A3, Tw.POPUP_TITLE.NOTIFY,
        $.proxy(this._onConfirm, this), $.proxy(this._sendWithdrawRequest, this));
    }
  },
  /**
   * @function
   * @desc confirm창 확인 처리
   */
  _onConfirm: function () {
    this._confirm = true;
    this._popupService.close();
  },
  /**
   * @function
   * @desc popup close callback - 탈퇴 API 호출
   */
  _sendWithdrawRequest: function () {
    if (this._confirm) {
      var data = {
        qstnCd: this.selected
      };
      if (data.qstnCd === '6') {
        data.qstnCtt = this.$textArea.val();
      }

      this._apiService.request(Tw.API_CMD.BFF_03_0003, data)
        .done($.proxy(this._onRequestDone, this))
        .fail($.proxy(this._error, this));
    }
  },
  /**
   * @function
   * @desc 탈퇴 API 응답 처리
   * @param res
   */
  _onRequestDone: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.tidYn === 'Y') {
        this._isTid = true;
      }

      this._isCompleteWithdraw = true;
      this._popupService.close();

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
  /**
   * @function
   * @desc 탈퇴 완료 페이지로 이동
   */
  _onWithdrawal: function () {
    if (this._isCompleteWithdraw) {
      this._historyService.replaceURL('/common/member/withdrawal-complete?isTid=' + this._isTid);
    }
  },
  /**
   * @function
   * @desc API Error 공통 팝업 호출
   * @param err
   */
  _error: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};

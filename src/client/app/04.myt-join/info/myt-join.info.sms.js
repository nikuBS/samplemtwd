/**
 * FileName: myt-join.info.sms.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 10. 15
 */
Tw.MyTJoinInfoSms = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._init();
};

Tw.MyTJoinInfoSms.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$btnSubmit = this.$container.find('#fe-btn-submit');
    this.$tel = this.$container.find('#fe-hp-tel');
    this.$telErrorTxt = this.$container.find('#fe-tel-error-txt');
  },
  _bindEvent: function () {
    this.$container.on('keyup focus change', '[data-require]', $.proxy(this._onDisableStatus, this));
    this.$btnSubmit.on('click', $.proxy(this._reqSms, this));
    this.$container.on('click', '#fe-back', $.proxy(this._onCloseConfirm, this));
  },

  // 닫기 버튼 클릭 시 [확인]
  _onCloseConfirm: function() {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG, Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy($.proxy(function () {
        this._popupService.close();
        this._historyService.goBack();
      }, this), this), null, Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },

  _onDisableStatus: function (e) {
    var isOk = false;
    var $super = this;
    this.$container.find('[data-require]').each(function () {
      var $this = $(this);
      if ($this.attr('type') === 'tel') {
        var _tel = $this.val().replace(/[^0-9]/g, '');
        isOk = Tw.ValidationHelper.isCellPhone(_tel); // 핸드폰 번호 체크
        if (e.type === 'change') {
          if (!isOk) {
            $super.$telErrorTxt.removeClass('none');
          } else {
            $super.$telErrorTxt.addClass('none');
          }
        }
      }
      if (isOk && $this.attr('type') === 'checkbox') {
        isOk = $this.is(':checked'); // 개인정보 동의 여부
      }

      if (!isOk) return false;
    });

    // 이상없을 시 서브밋 버튼 활성화
    this.$btnSubmit.prop('disabled', !isOk);
  },

  // 무약정 플랜 포인트 내역 조회
  _reqSms: function () {
    var _tels = this.$tel.val().split('-');
    var param = {
      tel_num1: _tels[0],
      tel_num2: _tels[1],
      tel_num3: _tels[2]
    };
    this._apiService
      .request(Tw.API_CMD.BFF_05_0062, param)
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  // Mockup
  _mockReqSms: function () {
    $.ajax('/mock/myt.join.sms.json')
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  _onSuccess: function (resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      this._onFail(resp);
      return;
    }

    var $this = this;
    this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN[$this.$btnSubmit.data('alert')].MSG,
      null, null, $.proxy(this._onClose, this));
  },

  _onClose: function () {
    this._historyService.goBack();
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }

};

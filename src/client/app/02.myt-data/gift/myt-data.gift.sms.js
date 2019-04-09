/**
 * @file myt-data.gift.sms.js
 * @desc T끼리 데이터 선물 > 문자 보내기 기능 처리
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.17
 */

Tw.MyTDataGiftSms = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataGiftSms.prototype = {
  /**
   * @function
   * @desc query string 처리하기 위한 Init 함수
   * @private
   */
  _init: function () {
    this.paramData = Tw.UrlHelper.getQueryParams();
    this._setReceiverInfo();
  },

  _cachedElement: function () {
    this.$btn_send_sms = this.$container.find('#fe-send_gift_sms');
    this.$textarea_sms = this.$container.find('#fe-sms_textarea');
  },

  _bindEvent: function () {
    this.$textarea_sms.on('keyup', $.proxy(this._onChangeTextArea, this));
    this.$btn_send_sms.on('click', $.proxy(this._onClickSendSMS, this));
  },

  /**
   * @function
   * @desc 문자 보내기 수혜자 정보 세팅
   * @private
   */
  _setReceiverInfo: function () {
    if ( this.paramData.custNm ) {
      $('.add-name').text(this.paramData.custNm);
    }

    if ( this.paramData.befrSvcNum ) {
      this.paramData.befrSvcNum = this.paramData.befrSvcNum.replace(/-/g, '');
      $('.add-info').text(Tw.FormatHelper.getFormattedPhoneNumber(this.paramData.befrSvcNum));
    }
  },

  /**
   * @function
   * @desc 텍스트 입력에 따라 보내기 버튼 활성화/비활성화 처리
   * @param e
   * @private
   */
  _onChangeTextArea: function (e) {
    if ( $(e.currentTarget).val().length !== 0 ) {
      this.$btn_send_sms.prop('disabled', false);
    } else {
      this.$btn_send_sms.prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc BFF_06_0017 (new IA) T끼리 데이터 선물하기 SMS 전송 API Request
   * @private
   */
  _onClickSendSMS: function () {
    this._lockSms();

    this._apiService.request(
      Tw.API_CMD.BFF_06_0017,
      { befrSvcMgmtNum: this.paramData.befrSvcMgmtNum, msg: this.$textarea_sms.val() }, null, null, null,
      { jsonp : false }
    ).done($.proxy(this._onSuccessRequestSms, this));
  },

  /**
   * @function
   * @desc BFF_06_0017 (new IA) T끼리 데이터 선물하기 SMS 전송 API Response
   * @param res
   * @private
   */
  _onSuccessRequestSms: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/submain');
    } else {
      Tw.Error(res.code, res.msg).pop();
      this._unlockSms();
    }
  },

  /**
   * @function
   * @desc 보내기 버튼 비활성화 처리
   * @private
   */
  _lockSms: function () {
    this.$textarea_sms.prop('disabled', true);
    this.$btn_send_sms.prop('disabled', true);
  },

  /**
   * @function
   * @desc 보내기 버튼 활성화 처리
   * @private
   */
  _unlockSms: function () {
    this.$textarea_sms.prop('disabled', false);
    this.$btn_send_sms.prop('disabled', false);
  }
};
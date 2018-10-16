/**
 * FileName: myt-join.info.sms.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 10. 15
 */
Tw.MyTJoinInfoSms = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._init();
};

Tw.MyTJoinInfoSms.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();
  },
  _initVariables: function () {
    this.$btnSubmit = this.$container.find('#fe-btn-submit');
    this.$tel = this.$container.find('#fe-hp-tel');
    this.$agree = this.$container.find('#fe-info-agree');
  },
  _bindEvent: function () {
    this.$tel.on('keyup', $.proxy(this._onChangeTel, this));
    this.$agree.on('change', $.proxy(this._onChangeAgree, this));
    this.$btnSubmit.on('click', $.proxy(this._onSubmit, this));
  },

  // 휴대폰 번호 입력 시 자동 하이픈 넣기
  _onFormatHpNum : function (e) {
    var _$this = $(e.currentTarget);
    var data = _$this.val();
    data = data.replace(/[^0-9]/g,'');

    var tmp = '';

    if (data.length > 3 && data.length <= 6) {
      tmp += data.substr(0, 3);
      tmp += '-';
      tmp += data.substr(3);
      data = tmp;
    } else if (data.length > 6) {
      tmp += data.substr(0, 3);
      tmp += '-';
      var size = data.length < 11 ? 3 : 4;
      tmp += data.substr(3, size);
      tmp += '-';
      tmp += data.substr(3+size);
      data = tmp;
    }

    _$this.val(data);
  },

  _onChangeTel : function (e) {
    this._onFormatHpNum(e);
    this._validationCheck();
  },

  _onChangeAgree : function () {
    this._validationCheck();
  },

  _onSubmit : function () {

  },

  _validationCheck : function () {
    var isOk = false;

    var _tel = this.$tel.val().replace(/[^0-9]/g,'');
    isOk = Tw.ValidationHelper.isCellPhone(_tel); // 핸드폰 번호 체크
    isOk = isOk ? this.$agree.is(':checked') : isOk; // 개인정보 동의 여부

    // 이상없을 시 서브밋 버튼 활성화
    this.$btnSubmit.prop('disabled',!isOk);
  }

};

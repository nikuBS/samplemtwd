/**
 * FileName: myt.join.join-info
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.30
 */
Tw.MyTJoinJoinInfo = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._svcInfo = svcInfo;
  this._loginService = new Tw.MyTJoinProtectPwd();
  this._historyService = new Tw.HistoryService();
  this._passwordService = new Tw.MyTJSProtectPwd();
  this._init();
};

Tw.MyTJoinJoinInfo.prototype = {

  _init : function() {
    this._initVariables();
    this._bindEvent();
  },

  _initVariables: function () {
    this.$history = this.$container.find('#fe-open-history');
    this.$skbLink = this.$container.find('#fe-skb-link');
  },

  _bindEvent: function () {
    this._popupService._popupClose();
    this.$container.on('click', '#pwd-change', $.proxy(this._openPwdLayer, this));
    this.$history.click($.proxy(this._openHistoryPop, this));
    this.$skbLink.click($.proxy(this._openSKbrodbandLink, this));
  },

  // 개통/변경 이력조회 팝업
  _openHistoryPop : function (e) {
    var $_this = $(e.currentTarget);
    this._popupService.open({
      hbs: 'MY_01_02_L01',
      data: {
        list : $_this.data('history')
      }
    });
  },

  // SK브로드밴드 링크 클릭
  _openSKbrodbandLink : function (e) {
    var $_this = $(e.currentTarget);
    window.open($_this.data('url'),'_blank');
  },

  // 비밀번호변경 클릭
  _openPwdLayer: function() {
    var params = {
      mdn: this._svcInfo.svcNum,
      serviceNumber: this._svcInfo.svcMgmtNum,
      callback: $.proxy(this._onPwdChecked, this)
    };
    // 로그인 인증화면으로 이동
    this._loginService.openLayer(params);
  },

  _onPwdChecked: function() {
    // 로그인 인증 성공 후 화면 이동
    this._historyService.goLoad('/myt/join/protect/change');
  }

};
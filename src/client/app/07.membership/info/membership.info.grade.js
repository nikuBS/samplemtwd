/**
 * @file membership.info.grade.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018.10.31
 */
Tw.MembershipInfoGrade = function (svcInfo) {
  this.$container = $('.wrap');
  this._svcInfo = svcInfo;
  this._apiService = Tw.Api;
  this._membershipLayerPopup = new Tw.MembershipInfoLayerPopup(this.$container, this._svcInfo);
  this._init();
};

Tw.MembershipInfoGrade.prototype = {
  _init: function () {
    this._initVariables();
    this._bindEvent();
  },

  _initVariables: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '[data-popup-id]', $.proxy(this._openPopup,this));
    this.$container.on('click', '[data-external-url]', $.proxy(this._goExternalUrl,this));
    this.$container.on('click', '#fe-req-join', $.proxy( this._membershipLayerPopup.onClickJoinBtn, this._membershipLayerPopup));
    this.$container.on('click', '[data-url]', $.proxy(this._goUrl, this));
  },

  // 팝업 오픈
  _openPopup : function (e) {
    this._membershipLayerPopup.open($(e.currentTarget).data('popupId'), e);
  },

  // 외부 URL 이동
  _goExternalUrl : function (e) {
    var _url = Tw.URL_PATH[$(e.currentTarget).data('externalUrl')];
    Tw.CommonHelper.openUrlExternal(_url);
  },

  /**
   * data-url attribute 에 입력된 URL로 이동시켜준다.
   * @param e event
   * @private
   */
  _goUrl: function (e) {
    window.location.href = $(e.currentTarget).data('url');
  }


};

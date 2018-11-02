/**
 * FileName: membership.info.grade.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.10.31
 */
Tw.MembershipInfoGrade = function (rootEl) {
  this.$container = rootEl || $('.wrap');
  this._apiService = Tw.Api;
  this._membershipLayerPopup = new Tw.MembershipInfoLayerPopup(this.$container);
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
  },

  // 팝업 오픈
  _openPopup : function (e) {
    this._membershipLayerPopup.open($(e.currentTarget).data('popupId'));
  },

  // 외부 URL 이동
  _goExternalUrl : function (e) {
    var _url = Tw.URL_PATH[$(e.currentTarget).data('externalUrl')];
    Tw.CommonHelper.openUrlExternal(_url);
  }

};

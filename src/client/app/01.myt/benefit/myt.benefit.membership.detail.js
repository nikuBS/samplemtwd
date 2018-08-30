/**
 * FileName: myt.benefit.membership.detail.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 8. 22
 */
Tw.MyTBenefitMembershipDetail = function (rootEl) {
  this.$container = rootEl;
  this._init();
};

Tw.MyTBenefitMembershipDetail.prototype = {

  _init : function() {
    this._initVariables();
    this._bindEvent();
  },

  _initVariables: function () {

  },

  _bindEvent: function () {
    this.$container.on('click','.fe-go-url', $.proxy(this._goUrl, this));
  },

  // 초콜릿몰 / 11번가 / DATA FREE 링크
  _goUrl : function (e) {
    var $this = $(e.currentTarget);
    Tw.CommonHelper.openUrlExternal( Tw.URL_PATH[$this.data('urlName')] );
  }


};

/**
 * FileName: benefit.membership.join.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */

Tw.MyTBenefitMembershipJoin = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._tpayPopup = new Tw.TPayJoinLayerPopup(this.$container);
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
  this._data = params.data;
  this._render();
  this._bindEvent();
};

Tw.MyTBenefitMembershipJoin.prototype = {

  _render: function () {
    this.$joinBtn = this.$container.find('[data-id=join-btn]');
  },

  _bindEvent: function () {
    this.$joinBtn.on('click', $.proxy(this._onClickJoinBtn, this));
  },

  _onClickJoinBtn: function () {
    // TODO: 가입하기 완료 후 팝업 노출
    // this._apiService.request();
    //  this._tpayPopup.open();
  }
};
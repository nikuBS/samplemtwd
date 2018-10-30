/**
 * FileName: benefit.membership.partner.shoplist.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

Tw.BenefitMembershipPartnerShopList = function ($element, options) {
  console.log('BenefitMembershipPartner - Shop List created');
  this.$container = $element;
  this._options = options;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);

  this._bindEvent();
};

Tw.BenefitMembershipPartnerShopList.prototype = {
  /**
   * event 바인딩
   * @private
   */
  _bindEvent: function () {
  }


};
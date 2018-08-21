/*
 * FileName: myt.join.product-service.combinations.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.08.16
 */


Tw.MyTJoinProductServiceCombinations = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvents();
};

Tw.MyTJoinProductServiceCombinations.prototype = {
  _bindEvents: function () {
    this.$container.on('click', 'button.fe-comb-desc', $.proxy(this._openDescriptionPopup, this));
    this.$container.on('click', '.link-long.last > button', $.proxy(this._showFamily, this));
  },

  _openDescriptionPopup: function (e) {
    var description = e.target.getAttribute('data-description');
    var title = e.target.getAttribute('data-title');

    this._popupService.open({
      title: Tw.POPUP_TITLE.GUIDE,
      title2: title,
      close_bt: true,
      contents: description
    });
  },

  _showFamily: function (e) {
    var prodId = e.target.getAttribute('data-prod-id');
    if (prodId) {
      this._go('/myt/join/product-service/combination?prodId=' + prodId);
    }
  },

  _go: function (url) {
    this._historyService.goLoad(url);
  }
};
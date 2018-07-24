/**
 * FileName: customer.notice.js
 * Author: Jihun Yang (jihun202@sk.com)
 * Date: 2018.07.16
 */

Tw.CustomerNotice = function(rootEl) {
  this.$container = rootEl;
  this._apiSerivce = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement()
      ._bindEvent();
};

Tw.CustomerNotice.prototype = {

  _cachedElement: function() {
    this.$list = this.$container.find('.list');
    this.$btnCategory = this.$container.find('.category');
    return this;
  },

  _bindEvent: function() {
    this.$list.on('click', '.subject', $.proxy(this._toggleArticle, this));

    return this;
  },

  _toggleArticle: function() {
    //
  }

};
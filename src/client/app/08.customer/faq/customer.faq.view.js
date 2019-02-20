/**
 * FileName: customer.faq.view.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2019.02.15
 */

Tw.CustomerFaqView = function (rootEl) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._init();
};

Tw.CustomerFaqView.prototype = {
  _init : function () {
    this.$container.on('click','.prev-step',$.proxy(this._historyService.goBack,this._historyService));
  }
};

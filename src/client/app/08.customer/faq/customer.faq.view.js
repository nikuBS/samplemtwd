/**
 * @file customer.faq.view.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2019.02.15
 */

Tw.CustomerFaqView = function (rootEl, ifaqId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._ifaqId = ifaqId;
  this._historyService = new Tw.HistoryService();
  this._init();
};

Tw.CustomerFaqView.prototype = {
  _init : function () {
    this.$container.on('click','.prev-step',$.proxy(this._historyService.goBack,this._historyService));

    this._apiService.request(Tw.API_CMD.BFF_08_0086, { ifaqId: this._ifaqId }, {}, [])
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          // console.log('조회수 증가');
        } else {
          Tw.Error(res.code, res.msg).pop();
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  }
};

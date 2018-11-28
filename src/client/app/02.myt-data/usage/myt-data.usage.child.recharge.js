/**
 * FileName: myt-data.usage.child.recharge.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 11. 27.
 */
Tw.MyTDataUsageChildRecharge = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataUsageChildRecharge.prototype = {
  _URL: {
    MYT_DATA_SUBMAIN: '/myt-data/submain'
  },
  _AMT_MAXIMUM: 20000,
  _AMT_MINIMUM: 1000,
  _AMT_GAP: 1000,
  _AMT_BOTTOM_MARGIN: 12,

  _cachedElement: function () {
    this._$amtItemTmpl = this.$container.find('#fe-amt-item');
    this._$amtsContainer = this.$container.find('.fe-amts-container');
    this._$btnMore = this.$container.find('.fe-btn-more');
    this._$btnSubmit = this.$container.find('.fe-btn-submit');
  },
  _bindEvent: function () {
    this._$btnMore.on('click', $.proxy(this._onClickBtnMore, this));
    this._$btnSubmit.on('click', $.proxy(this._onClickBtnSubmit, this));
  },

  _init: function () {
    this._drawAmtSelectors();
    this._setAmtsContainer();
  },

  _setAmtsContainer: function () {
    var height = this._$amtsContainer.find('li:eq(0)').height();
    this._$amtsContainer.css({
      height: height + this._AMT_BOTTOM_MARGIN
    }).show();
  },

  _drawAmtSelectors: function () {
    var source = this._$amtItemTmpl.html();
    for ( var i = this._AMT_MAXIMUM; i >= this._AMT_MINIMUM; i -= this._AMT_GAP ) {
      var template = Handlebars.compile(source);
      var html = template({
        amt: i.toString(),
        amtWithComma: Tw.FormatHelper.addComma(i.toString())
      });
      this._$amtsContainer.find('ul').append(html);
    }
  },

  _onClickBtnMore: function () {
    this._$amtsContainer.css({
      height: 'auto'
    });
    this._$btnMore.hide();
  },

  _onClickBtnSubmit: function () {
    var amt = this._$amtsContainer.find('input:checked').val();
    if ( Tw.FormatHelper.isEmpty(amt) ) {
      this._popupService.openAlert(Tw.MYT_DATA_USAGE_CHILD_RECHARGE.ALERT['2_A5'].CONTENTS,
        Tw.MYT_DATA_USAGE_CHILD_RECHARGE.ALERT['2_A5'].TITLE);
      return;
    }
    this._apiService.request(Tw.API_CMD.BFF_06_0068, {
      'amt': amt,
      'childSvcMgmtNum': this._options.childSvcMgmtNum
    }).done($.proxy(this._reqSubmitDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  _reqSubmitDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._popupService.afterRequestSuccess(this._URL.MYT_DATA_SUBMAIN, this._URL.MYT_DATA_SUBMAIN, null, '변경');
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  _reqFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  }

};

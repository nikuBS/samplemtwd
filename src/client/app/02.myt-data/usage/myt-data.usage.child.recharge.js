/**
 * MenuName: 나의 데이터/통화 > 자녀 실시간 잔여량 > 충전 허용금액 변경
 * FileName: myt-data.usage.child.recharge.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 11. 27.
 * Summary: 충전 허용금액 변경
 */
Tw.MyTDataUsageChildRecharge = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;
  this._historyService = new Tw.HistoryService();

  this._topUpLimit = parseInt(this._options.topUpLimit, 10);
  if (this._topUpLimit <= 4000) {
    this._topUpLimit = 4000;
  }

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataUsageChildRecharge.prototype = {
  _URL: {
    COMPLETE: '/myt-data/submain/child-hotdata/recharge/complete'
  },
  _AMT_MAXIMUM: 20000,
  _AMT_MINIMUM: 1000,
  _AMT_GAP: 1000,
  _AMT_BOTTOM_MARGIN: 12,
  _AMT_CNT_EACH_LINE: 4,

  _cachedElement: function () {
    this._$amtItemTmpl = this.$container.find('#fe-amt-item');
    this._$amtsContainer = this.$container.find('.fe-amts-container');
    this._$summaryAmts = this.$container.find('.summary-amts');
    this._$allAmts = this.$container.find('.all-amts');
    this._$btnMore = this.$container.find('.fe-btn-more');
    this._$btnSubmit = this.$container.find('.fe-btn-submit');
  },
  _bindEvent: function () {
    this._$btnMore.on('click', $.proxy(this._onClickBtnMore, this));
    this._$btnSubmit.on('click', $.proxy(this._onClickBtnSubmit, this));
  },

  _init: function () {
    this._drawSummaryAmt();
    this._drawAllAmt();
  },

  /**
   * 변경할 충전허용금액 출력(설정된 충전 허용금액을 최대값으로 4개 표시)
   * @private
   */
  _drawSummaryAmt: function() {
    var $ul = $('<ul style="display: flex;margin-bottom: 0;" />');
    $ul.appendTo(this._$summaryAmts);
    this._drawEachLine(this._topUpLimit, $ul);
  },

  /**
   * 변경할 충전허용금액 출력(전체)
   * @private
   */
  _drawAllAmt: function () {
    for (var i = 5; i >= 1; i--) {
      var max = i * this._AMT_CNT_EACH_LINE * this._AMT_GAP;
      var $ul = $('<ul style="display: flex;margin-bottom: 0;" />');
      $ul.appendTo(this._$allAmts);
      this._drawEachLine(max, $ul);
    }
  },

  _drawEachLine: function(max, $elem) {
    var source = this._$amtItemTmpl.html();
    var min = max - (this._AMT_GAP * (this._AMT_CNT_EACH_LINE - 1));
    for ( var i = max; i >= min; i -= this._AMT_GAP ) {
      var template = Handlebars.compile(source);
      var html = template({
        amt: i.toString(),
        amtWithComma: Tw.FormatHelper.addComma(i.toString())
        // disabled: i > this._topUpLimit ? 'disabled' : ''
      });
      $elem.append(html);
    }
  },

  _onClickBtnMore: function () {
    this._$summaryAmts.hide();
    this._$summaryAmts.attr('aria-hidden', 'true');
    this._$btnMore.hide();
    this._$btnMore.attr('aria-hidden', 'true');
    this._$allAmts.show();
    this._$allAmts.attr('aria-hidden', 'false');
    this._$allAmts.find('li:eq(0)').attr('tabindex', -1).focus();
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
      this._historyService.replaceURL(this._URL.COMPLETE);
    } else {
      var msg = resp.msg;
      if (resp.code === 'RCG0061') {
          msg = Tw.MYT_DATA_USAGE_CHILD_RECHARGE.ALERT.RCG0061;
      }
      this._popupService.openAlert(msg, Tw.POPUP_TITLE.NOTIFY);
    }
  },

  _reqFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  }

};

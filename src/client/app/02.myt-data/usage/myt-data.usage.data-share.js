/**
 * @file myt-data.usage.data-share.js
 * @author 이정민 (skt.p130713@partner.sk.com)
 * @since 2018. 9. 18.
 */

Tw.MyTDataUsageDataShare = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._children = [];
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTDataUsageDataShare.prototype = {
  open: function () {
    this.$container.show();
    if ( this._children.length > 0 ) {
      return;
    }
    this._apiService.request(Tw.API_CMD.BFF_05_0004)
      .done($.proxy(this._reqChildrenDone, this))
      .fail($.proxy(this._reqChildrenFail, this));
  },
  close: function () {
    this.$container.hide();
  },
  _cachedElement: function () {
    this._$dataChildTmpl = this.$container.find('#fe-child-tmpl');
    this._$children = this.$container.find('.fe-children');
  },
  _bindEvent: function () {
    this.$container.on('click', '.popup-closeBtn', $.proxy(this._onClickBtnClose, this));
    this.$container.on('click', '.fe-btn-used-data', $.proxy(this._onClickBtnUsedData, this));
  },
  _reqChildrenDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._children = resp.result.childList;
      this._drawChildren();
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },
  _reqChildrenFail: function (resp) {
    this._popupService.openAlert(resp.msg, resp.code);
  },
  _reqChildDone: function (targetSelector, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._drawChild(targetSelector, resp);
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },
  _reqChildFail: function (resp) {
    this._popupService.openAlert(resp.msg, resp.code);
  },
  _drawChildren: function () {
    var source = this._$dataChildTmpl.html();
    var template = Handlebars.compile(source);
    this._$children.empty();
    _.each(this._children, $.proxy(function (child) {
      child.auditDtm = Tw.DateHelper.getShortDate(child.auditDtm);
      child.svcNum = Tw.FormatHelper.getDashedCellPhoneNumber(child.svcNum);
      var $child = template(child);
      this._$children.append($child);
    }, this));
  },
  _drawChild: function (targetSelector, resp) {
    var used = Tw.FormatHelper.convDataFormat(resp.result.used, Tw.DATA_UNIT.KB);
    var $feUsedDataResult = targetSelector.closest('.datatogether-li-state').find('.fe-used-data-result');
    $feUsedDataResult.find('.fe-data').text(used.data);
    $feUsedDataResult.find('.fe-unit').text(used.unit);
    $feUsedDataResult.show();
    targetSelector.parent().hide();
  },
  _onClickBtnUsedData: function (event) {
    event.preventDefault();
    var targetSelector = $(event.target);
    var svcMgmtNum = targetSelector.data('svcmgmtnum');
    this._apiService.request(Tw.API_CMD.BFF_05_0009, { cSvcMgmtNum: svcMgmtNum })
      .done($.proxy(this._reqChildDone, this, targetSelector))
      .fail($.proxy(this._reqChildFail, this));

  },
  _onClickBtnClose: function () {
    // this._historyService.goBack();
    this.close();
  }
};

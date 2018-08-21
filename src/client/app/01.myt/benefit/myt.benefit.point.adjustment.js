/**
 * FileName: myt.benefit.point.adjustment.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 8. 17.
 */
Tw.MytBenefitPointAdjustment = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._lineToGiveSvcMgmtNum = this.$container.data('line-to-give-svc-mgmt-num').toString();
  this._lines = this.$container.data('lines');
  this._attrToGiveSelectPopup = null;
  this._attrToReceiveSelectPopup = null;
  this._cachedElement();
  this._rendered();
  this._bindEvent();
};

Tw.MytBenefitPointAdjustment.prototype = {

  _cachedElement: function () {
    this._$previewContentTmpl = $('#fe-preview-content-tmpl');
    this._$completeContentTmpl = $('#fe-complete-content-tmpl');
    this._$sections = this.$container.find('.fe-section');
    this._$main = this.$container.find('#fe-main');
    this._$preview = this.$container.find('#fe-preview');
    this._$previewContent = this._$preview.find('.fe-content');
    this._$complete = this.$container.find('#fe-complete');
    this._$completeContent = this._$complete.find('.fe-content');
    this._$pointToGive = this.$container.find('.fe-point-to-give');
    this._$btnLineToGive = this.$container.find('.fe-btn-line-to-give');
    this._$btnLineToReceive = this.$container.find('.fe-btn-line-to-receive');
    this._$inputPoint = this.$container.find('.fe-input-point');
  },

  _rendered: function () {
    this._attrToGiveSelectPopup = this._getLinesAttrToSelect(this._lines);
    this._attrToReceiveSelectPopup = this._getLinesAttrToSelect(_.reject(this._lines, { svcMgmtNum: this._lineToGiveSvcMgmtNum }));
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-btn-line-to-give', $.proxy(this._onClickBtnLineToGive, this));
    this.$container.on('click', '.fe-btn-line-to-receive', $.proxy(this._onClickBtnLineToReceive, this));
    this.$container.on('click', '.fe-btn-preview', $.proxy(this._onClickBtnPreview, this));
    this._$preview.on('click', '.fe-close-preview', $.proxy(this._onClickBtnPreviewClose, this));
    this._$preview.on('click', '.fe-submit', $.proxy(this._onClickBtnSubmit, this));
    this._$complete.on('click', '.fe-close-complete', $.proxy(this._onClickBtnCompleteClose, this));
  },

  _getLinesAttrToSelect: function (lines) {
    return _.map(lines, function (line) {
      return {
        attr: 'id="' + line.svcMgmtNum + '"',
        text: '<span class="cell-box"><span class="cell">'+line.nickNm+'</span><span class="cell">'+line.svcNum+'</span></span>'
      };
    });
  },

  _onClickBtnLineToGive: function (event) {
    var $target = $(event.currentTarget);
    this._openLinePopup(this._attrToGiveSelectPopup, this._onOpenChoiceLineToGivePopup, $target);
  },

  _onClickBtnLineToReceive: function (event) {
    var $target = $(event.currentTarget);
    this._openLinePopup(this._attrToReceiveSelectPopup, this._onOpenChoiceLineToReceivePopup, $target);
  },

  _onClickBtnPreview: function () {
    var isValid = this._validate();
    if ( isValid ) {
      this._showPreview();
    }
  },

  _onClickBtnPreviewClose: function () {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_MYT.BENEFIT.A2, undefined, undefined, $.proxy(this._closePreview, this));
  },

  _onClickBtnCompleteClose: function() {
    this._historyService.reload();
  },

  _onClickBtnSubmit: function() {
    this._apiService.request(Tw.API_CMD.BFF_05_0102, {
      'sndrSvcMgmtNum': this._$btnLineToGive.data('svc-mgmt-num').toString(),
      'befrSvcMgmtNum': this._$btnLineToReceive.data('svc-mgmt-num').toString(),
      'point': this._$inputPoint.val()
    }).done($.proxy(function(resp){
        if ( resp.code === Tw.API_CODE.CODE_00 ) {
          this._showComplete();
        } else {
          this._popupService.openAlert(resp.msg, resp.code);
        }
      }, this))
      .fail(function(err){
        this._popupService.openAlert(err.msg, err.code);
      });
  },

  _closePreview: function () {
    this._popupService.close();
    this._show(this._$main);
  },

  _validate: function () {
    var inputPoint = parseInt(this._$inputPoint.val(), 10) || 0;
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var pointToGive = parseInt(this._$pointToGive.data('point'), 10);

    if ( Tw.FormatHelper.isEmpty(inputPoint) || inputPoint <= 0 ) {
      this._popupService.openAlert(Tw.MSG_MYT.BENEFIT.A1);
      return;
    }
    if ( inputPoint > pointToGive ) {
      this._popupService.openAlert(Tw.MSG_MYT.BENEFIT.A8);
      return;
    }
    if ( svcMgmtNumToGive === svcMgmtNumToReceive ) {
      this._popupService.openAlert(Tw.MSG_MYT.BENEFIT.A13);
      return;
    }
    return true;
  },

  _openLinePopup: function (attr, callback, $target) {
    this._popupService.openChoice(Tw.MSG_MYT.BENEFIT.SELECT_TITLE, attr,
      'type3', $.proxy(callback, this, $target));
  },

  _onOpenChoiceLine: function($target, $layer, callback) {
    $layer.on('click', '.popup-choice-list', $.proxy(callback, this, $target));
  },

  _onOpenChoiceLineToGivePopup: function ($target, $layer) {
    this._onOpenChoiceLine($target, $layer, this._onSelectLineToGive);
  },

  _onOpenChoiceLineToReceivePopup: function ($target, $layer) {
    this._onOpenChoiceLine($target, $layer, this._onSelectLineToReceive);
  },

  _onSelectLine: function(event, callback) {
    this._popupService.close();
    var svcMgmtNum = $(event.currentTarget).find('button').attr('id');
    callback(svcMgmtNum);
  },

  _onSelectLineToGive: function ($target, event) {
    this._onSelectLine(event, $.proxy(this._changeLineToGive, this));
  },

  _onSelectLineToReceive: function ($target, event) {
    this._onSelectLine(event, $.proxy(this._changeLineToReceive, this));
  },

  _changeLine: function (line, $target) {
    $target.text(line.svcNum);
    $target.data('svc-mgmt-num', line.svcMgmtNum);
  },

  _changeLineToGive: function (svcMgmtNum) {
    var selectedLine = _.find(this._lines, {
      svcMgmtNum: svcMgmtNum
    });
    this._$pointToGive.text(selectedLine.showPoint);
    this._$pointToGive.data('point', selectedLine.point);
    this._changeLine(selectedLine, this._$btnLineToGive);

    //합산 받는 회선은 합산 하는 회선 제외하고 보여짐.
    this._attrToReceiveSelectPopup = this._getLinesAttrToSelect(_.reject(this._lines, { svcMgmtNum: svcMgmtNum }));
  },

  _changeLineToReceive: function (svcMgmtNum) {
    var selectedLine = _.find(this._lines, {
      svcMgmtNum: svcMgmtNum
    });
    this._changeLine(selectedLine, this._$btnLineToReceive);
  },

  _showPreview: function () {
    var source = this._$previewContentTmpl.html();
    var template = Handlebars.compile(source);
    var inputPoint = parseInt(this._$inputPoint.val(), 10) || 0;
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var selectedLineToGive = _.find(this._lines, {
      svcMgmtNum: svcMgmtNumToGive
    });
    var selectedLineToReceive = _.find(this._lines, {
      svcMgmtNum: svcMgmtNumToReceive
    });
    var pointToGive = parseInt(selectedLineToGive.point, 10);
    var pointToReceive = parseInt(selectedLineToReceive.point, 10);

    var html = template({
      giver: {
        svcNum: selectedLineToGive.svcNum,
        point: Tw.FormatHelper.addComma(pointToGive.toString()),
        remain: Tw.FormatHelper.addComma((pointToGive - inputPoint).toString())
      },
      receiver: {
        svcNum: selectedLineToReceive.svcNum,
        point: Tw.FormatHelper.addComma(pointToReceive.toString()),
        remain: Tw.FormatHelper.addComma((pointToReceive + inputPoint).toString())
      }
    });
    this._$previewContent.html(html);
    this._show(this._$preview);
  },

  _showComplete: function() {
    var source = this._$completeContentTmpl.html();
    var template = Handlebars.compile(source);
    var inputPoint = this._$inputPoint.val();
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var selectedLineToGive = _.find(this._lines, {
      svcMgmtNum: svcMgmtNumToGive
    });
    var selectedLineToReceive = _.find(this._lines, {
      svcMgmtNum: svcMgmtNumToReceive
    });
    var html = template({
      point: Tw.FormatHelper.addComma(inputPoint),
      giverSvcNum: selectedLineToGive.svcNum,
      receiverSvcNum: selectedLineToReceive.svcNum,
      date: Tw.DateHelper.getShortDateNoDot(new Date())
    });
    this._$completeContent.html(html);
    this._show(this._$complete);
  },

  _show: function ($el) {
    this._$sections.hide();
    $el.show();
  }

};

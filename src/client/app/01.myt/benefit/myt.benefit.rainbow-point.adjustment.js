/**
 * FileName: myt.benefit.rainbow-point.adjustment.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 8. 17.
 */

Tw.MytBenefitRainbowPointCommon = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
};

Tw.MytBenefitRainbowPointCommon.prototype = {
  _changeLineToReceive: function () {
  },
  _getPreviewData: function () {
  },
  _getCompleteData: function () {
  },
  _submit: function () {
  },
  _confirmPreviewClose: function() {
  },

  _cachedElement: function () {
    this._$previewContentTmpl = $('#fe-preview-content-tmpl');
    this._$completeContentTmpl = $('#fe-complete-content-tmpl');
    this._$sections = this.$container.find('.fe-section');
    this._$main = this.$container.find('#fe-main');
    this._$preview = this.$container.find('#fe-preview');
    this._$previewContent = this._$preview.find('.fe-content');
    this._$complete = this.$container.find('#fe-complete');
    this._$completeContent = this._$complete.find('.fe-content');
    this._$btnLineToGive = this.$container.find('.fe-btn-line-to-give');
    this._$btnLineToReceive = this.$container.find('.fe-btn-line-to-receive');
    this._$inputPoint = this.$container.find('.fe-input-point');
  },

  _bindEvent: function () {
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
        text: '<span class="cell-box"><span class="cell">' + line.nickNm + '</span><span class="cell">' + line.svcNum + '</span></span>'
      };
    });
  },

  _onOpenChoiceLineToReceivePopup: function ($target, $layer) {
    this._onOpenChoiceLine($target, $layer, this._onSelectLineToReceive);
  },

  _onOpenChoiceLine: function ($target, $layer, callback) {
    $layer.on('click', '.popup-choice-list', $.proxy(callback, this, $target));
  },

  _onSelectLine: function (event, callback) {
    this._popupService.close();
    var svcMgmtNum = $(event.currentTarget).find('button').attr('id');
    callback(svcMgmtNum);
  },

  _onSelectLineToReceive: function ($target, event) {
    this._onSelectLine(event, $.proxy(this._changeLineToReceive, this));
  },

  _changeLine: function (line, $target) {
    $target.find('.fe-svc-num').text(line.svcNum);
    $target.data('svc-mgmt-num', line.svcMgmtNum);
  },

  _openLinePopup: function (attr, callback, $target) {
    this._popupService.openChoice(Tw.MSG_MYT.BENEFIT.SELECT_TITLE, attr,
      'type3', $.proxy(callback, this, $target));
  },

  _validate: function () {
    var inputPoint = parseInt(this._$inputPoint.val(), 10) || 0;
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var pointToGive = parseInt(this._lineToGive.point, 10);

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

  _show: function ($el) {
    this._$sections.hide();
    $el.show();
  },

  _submitDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._showComplete();
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  _reqFail: function (err) {
    this._popupService.openAlert(err.msg, err.code);
  },

  _showPreview: function () {
    var source = this._$previewContentTmpl.html();
    var template = Handlebars.compile(source);
    var previewData = this._getPreviewData();
    var html = template(previewData);
    this._$previewContent.html(html);
    this._show(this._$preview);
  },

  _closePreview: function () {
    this._popupService.close();
    this._show(this._$main);
  },

  _showComplete: function () {
    var source = this._$completeContentTmpl.html();
    var template = Handlebars.compile(source);
    var completeData = this._getCompleteData();
    var html = template(completeData);
    this._$completeContent.html(html);
    this._show(this._$complete);
  },

  _onClickBtnSubmit: function () {
    this._submit();
  },

  _onClickBtnCompleteClose: function () {
    this._historyService.reload();
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
    this._confirmPreviewClose();
  }
};

Tw.MytBenefitRainbowPointAdjustment = function () {
  Tw.MytBenefitRainbowPointCommon.apply(this, arguments);
  this._cachedElement();
  this._bindEvent();
  this._init();
  this._rendered();
};
Tw.MytBenefitRainbowPointAdjustment.prototype = $.extend({}, Tw.MytBenefitRainbowPointCommon.prototype, {
  _cachedElement: function () {
    Tw.MytBenefitRainbowPointCommon.prototype._cachedElement.apply(this, arguments);
    this._$pointToGive = this.$container.find('.fe-point-to-give');
  },

  _bindEvent: function () {
    Tw.MytBenefitRainbowPointCommon.prototype._bindEvent.apply(this, arguments);
    this.$container.on('click', '.fe-btn-line-to-give', $.proxy(this._onClickBtnLineToGive, this));
  },

  _init: function () {
    this._lineToGive = this.$container.data('line-to-give');
    this._lines = this.$container.data('lines');
    this._attrToGiveSelectPopup = null;
    this._attrToReceiveSelectPopup = null;
  },

  _rendered: function () {
    this._attrToGiveSelectPopup = this._getLinesAttrToSelect(this._lines);
    this._attrToReceiveSelectPopup = this._getLinesAttrToSelect(_.reject(this._lines, {
      svcMgmtNum: this._$btnLineToGive.data('svc-mgmt-num').toString()
    }));
  },

  _onClickBtnLineToGive: function (event) {
    var $target = $(event.currentTarget);
    this._openLinePopup(this._attrToGiveSelectPopup, this._onOpenChoiceLineToGivePopup, $target);
  },

  _onOpenChoiceLineToGivePopup: function ($target, $layer) {
    this._onOpenChoiceLine($target, $layer, this._onSelectLineToGive);
  },

  _onSelectLineToGive: function ($target, event) {
    this._onSelectLine(event, $.proxy(this._changeLineToGive, this));
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

  _submit: function() {
    this._apiService.request(Tw.API_CMD.BFF_05_0102, {
      'sndrSvcMgmtNum': this._$btnLineToGive.data('svc-mgmt-num').toString(),
      'befrSvcMgmtNum': this._$btnLineToReceive.data('svc-mgmt-num').toString(),
      'point': this._$inputPoint.val()
    }).done($.proxy(this._submitDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  _changeLineToReceive: function (svcMgmtNum) {
    var selectedLine = _.find(this._lines, {
      svcMgmtNum: svcMgmtNum
    });
    this._changeLine(selectedLine, this._$btnLineToReceive);
  },

  _getPreviewData: function () {
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
    return {
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
    };
  },

  _getCompleteData: function () {
    var inputPoint = this._$inputPoint.val();
    var svcMgmtNumToGive = this._$btnLineToGive.data('svc-mgmt-num').toString();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var selectedLineToGive = _.find(this._lines, {
      svcMgmtNum: svcMgmtNumToGive
    });
    var selectedLineToReceive = _.find(this._lines, {
      svcMgmtNum: svcMgmtNumToReceive
    });
    return {
      point: Tw.FormatHelper.addComma(inputPoint),
      giverSvcNum: selectedLineToGive.svcNum,
      receiverSvcNum: selectedLineToReceive.svcNum,
      date: Tw.DateHelper.getShortDateNoDot(new Date())
    };
  },

  _confirmPreviewClose: function() {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_MYT.BENEFIT.A2, undefined, undefined,
      $.proxy(this._closePreview, this));
  }

});
Tw.MytBenefitRainbowPointAdjustment.prototype.constructor = Tw.MytBenefitRainbowPointAdjustment;


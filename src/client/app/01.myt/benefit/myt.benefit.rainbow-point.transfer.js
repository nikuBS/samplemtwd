/**
 * FileName: myt.benefit.rainbow-point.transfer.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 8. 17.
 */

Tw.MytBenefitRainbowPointTransfer = function () {
  Tw.MytBenefitRainbowPointCommon.apply(this, arguments);
  this._cachedElement();
  this._bindEvent();
  this._init();
  this._rendered();
};
Tw.MytBenefitRainbowPointTransfer.prototype = $.extend({}, Tw.MytBenefitRainbowPointCommon.prototype, {
  _bindEvent: function () {
    Tw.MytBenefitRainbowPointCommon.prototype._bindEvent.apply(this, arguments);
    this.$container.on('click', '.bt-cancel', $.proxy(this._onClickBtnCancel, this));
  },

  _init: function() {
    this._lineToGive = this.$container.data('line-to-give');
    this._linesToReceive = this.$container.data('lines-to-receive');
    this._attrToReceiveSelectPopup = null;
  },

  _rendered: function () {
    this._attrToReceiveSelectPopup = this._getLinesAttrToSelect(this._linesToReceive);
  },

  _onClickBtnCancel: function (event) {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_MYT.BENEFIT.A4, undefined, undefined,
      $.proxy(this._cancelTransfer, this, $(event.currentTarget).data('ser-num')));
  },

  _cancelTransfer: function (serNum) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_05_0105, {}, {}, serNum)
      .done($.proxy(this._cancelTransferDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  _cancelTransferDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    } else {
      this._popupService.openAlert(resp.msg, resp.code);
    }
  },

  _changeLineToReceive: function (svcMgmtNum) {
    var selectedLine = _.find(this._linesToReceive, {
      svcMgmtNum: svcMgmtNum
    });
    this._changeLine(selectedLine, this._$btnLineToReceive);
  },

  _getPreviewData: function () {
    var inputPoint = parseInt(this._$inputPoint.val(), 10) || 0;
    var pointToGive = parseInt(this._lineToGive.point, 10);
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var selectedLineToReceive = _.find(this._linesToReceive, {
      svcMgmtNum: svcMgmtNumToReceive
    });
    var pointToReceive = parseInt(selectedLineToReceive.point, 10);
    return {
      giver: {
        relNm: this._lineToGive.showRelNm,
        custNm: this._lineToGive.custNm,
        svcNum: this._lineToGive.svcNum,
        point: Tw.FormatHelper.addComma(pointToGive.toString()),
        remain: Tw.FormatHelper.addComma((pointToGive - inputPoint).toString())
      },
      receiver: {
        relNm: selectedLineToReceive.showRelNm,
        custNm: selectedLineToReceive.custNm,
        svcNum: selectedLineToReceive.svcNum,
        point: Tw.FormatHelper.addComma(pointToReceive.toString()),
        remain: Tw.FormatHelper.addComma((pointToReceive + inputPoint).toString())
      }
    };
  },

  _getCompleteData: function () {
    var inputPoint = this._$inputPoint.val();
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    var selectedLineToReceive = _.find(this._linesToReceive, {
      svcMgmtNum: svcMgmtNumToReceive
    });
    return {
      point: Tw.FormatHelper.addComma(inputPoint),
      giverSvcNum: this._lineToGive.svcNum,
      receiverSvcNum: selectedLineToReceive.svcNum,
      date: Tw.DateHelper.getShortDateNoDot(new Date())
    };
  },

  _submit: function() {
    this._apiService.request(Tw.API_CMD.BFF_05_0104, {
      'befrSvcMgmtNum': this._$btnLineToReceive.data('svc-mgmt-num').toString(),
      'point': this._$inputPoint.val()
    }).done($.proxy(this._submitDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  _confirmPreviewClose: function() {
    this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.MSG_MYT.BENEFIT.A3, undefined, undefined,
      $.proxy(this._closePreview, this));
  }

});
Tw.MytBenefitRainbowPointTransfer.prototype.constructor = Tw.MytBenefitRainbowPointTransfer;

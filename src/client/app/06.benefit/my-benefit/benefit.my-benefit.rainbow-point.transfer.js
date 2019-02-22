/**
 * FileName: benefit.my-benefit.rainbow-point.transfer.js
 * Author: 이정민 (skt.p130713@partner.sk.com)
 * Date: 2018. 10. 30.
 */

Tw.BenefitMyBenefitRainbowPointTransfer = function () {
  Tw.BenefitMyBenefitRainbowPointCommon.apply(this, arguments);
  this._cachedElement();
  this._bindEvent();
  this._init();
};
Tw.BenefitMyBenefitRainbowPointTransfer.prototype = $.extend({}, Tw.BenefitMyBenefitRainbowPointCommon.prototype, {
  _URL: {
    ROOT: '/benefit/my',
    COMPLETE: '/benefit/my/rainbowpoint/transfer/complete'
  },
  _PREVIEW_POPUP_HBS: 'BS_01_01_04_01',
  _linesToReceiveActionsheet: null,

  _bindEvent: function () {
    Tw.BenefitMyBenefitRainbowPointCommon.prototype._bindEvent.apply(this, arguments);
    this.$container.on('click', '.bt-cancel', $.proxy(this._onClickBtnCancel, this));
  },

  _init: function () {
    this._lineToGive = this.$container.data('line-to-give');
    this._linesToReceive = this.$container.data('lines-to-receive');
  },

  _onClickBtnCancel: function (event) {
    var serNum = $(event.currentTarget).data('ser-num');
    // this._popupService.openConfirm(Tw.POPUP_TITLE.CONFIRM, Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT.A4, $.proxy(this._cancelTransfer, this, serNum));
    this._cancelTransfer(serNum);
  },

  _cancelTransfer: function (serNum) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_05_0105, {}, {}, [serNum])
      .done($.proxy(this._cancelTransferDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  _cancelTransferDone: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.CommonHelper.toast(Tw.BENEFIT_MY_BENEFIT_RAINBOW_POINT.TRANSFER_CANCELED);
      window.setTimeout($.proxy(function () {
        this._historyService.reload();
      }, this), 1000);
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
        svcNum: this._lineToGive.showSvcNum,
        point: Tw.FormatHelper.addComma(pointToGive.toString()),
        remain: Tw.FormatHelper.addComma((pointToGive - inputPoint).toString()),
        inputPoint: Tw.FormatHelper.addComma(inputPoint.toString())
      },
      receiver: {
        relNm: selectedLineToReceive.showRelNm,
        custNm: selectedLineToReceive.custNm,
        svcNum: selectedLineToReceive.showSvcNum,
        point: Tw.FormatHelper.addComma(pointToReceive.toString()),
        remain: Tw.FormatHelper.addComma((pointToReceive + inputPoint).toString()),
        relCd: selectedLineToReceive.relCd
      }
    };
  },

  _submit: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0104, {
      'befrSvcMgmtNum': this._$btnLineToReceive.data('svc-mgmt-num').toString(),
      'point': this._$inputPoint.val()
    }).done($.proxy(this._submitDone, this))
      .fail($.proxy(this._reqFail, this));
  },

  _getReceiveLine: function () {
    var svcMgmtNumToReceive = this._$btnLineToReceive.data('svc-mgmt-num').toString();
    return this._getLinesAttrToSelect(this._linesToReceive, svcMgmtNumToReceive);
  }

});
Tw.BenefitMyBenefitRainbowPointTransfer.prototype.constructor = Tw.BenefitMyBenefitRainbowPointTransfer;

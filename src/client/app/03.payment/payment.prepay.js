/**
 * FileName: payment.prepay.js
 * Author: 공자윤 (jayoon.kong@sk.com)
 * Date: 2018.07.25
 */

Tw.PaymentPrepay = function (rootEl) {
  this.$container = rootEl;
  this.$window = $(window);
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(this.$container);

  this._initVariables();
  this._bindEvent();
};

Tw.PaymentPrepay.prototype = {
  _initVariables: function () {
    this._mainTitle = this.$container.find('.fe-main-title').text();
    this._requestGubun = 'Request';
    this._requestCount = 0;
    this.$remainBtnWrap = this.$container.find('.fe-get-remain-btn-wrap');
    this.$remainInfo = this.$container.find('.fe-remain-info');
    this.$remainInfoWrap = this.$container.find('.fe-remain-info-wrap');
    this.$maxAmountWrap = this.$container.find('.fe-max-amount-wrap');
    this.$maxAmount = this.$container.find('.fe-max-amount');
    this.$getDetailBtn = this.$container.find('.fe-get-detail');
    this.$goPrepayBtn = this.$container.find('.fe-go-prepay');
  },
  _bindEvent: function () {
    this.$container.on('keyup', '.fe-only-number', $.proxy(this._onlyNumber, this));
    this.$container.on('click', '.fe-get-remain-btn', $.proxy(this._getRemainLimit, this));
    this.$container.on('click', '.fe-change-limit', $.proxy(this._openChangeLimit, this));
    this.$container.on('click', '.fe-standard-amount-info', $.proxy(this._openStandardAmountInfo, this));
    this.$container.on('click', '.fe-get-detail', $.proxy(this._openDetailPrepay, this));
    this.$container.on('click', '.fe-get-detail-auto-prepay', $.proxy(this._getDetailAutoPrepay, this));
    this.$container.on('click', '.fe-change-auto-prepay', $.proxy(this._changeAutoPrepay, this));
    this.$container.on('click', '.fe-go-prepay', $.proxy(this._goPrepay, this));
    this.$container.on('click', '.fe-auto-prepay', $.proxy(this._goAutoPrepay, this));
    this.$container.on('click', '.fe-cancel-auto-prepay', $.proxy(this._confirmCancel, this));
  },
  _onlyNumber: function (event) {
    Tw.InputHelper.inputNumberOnly(event.currentTarget);
  },
  _getRemainLimit: function () {
    this._getPreRemainLimit();
    /*
    $.ajax('/mock/payment.remain-limit.json')
      .done($.proxy(this._getRemainLimitSuccess, this))
      .fail($.proxy(this._getRemainLimitFail, this));
      */
  },
  _getPreRemainLimit: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0073, {
      gubun: this._requestGubun,
      requestCnt: this._requestCount
    }).done($.proxy(this._getPreRemainLimitSuccess, this))
      .fail($.proxy(this._getRemainLimitFail, this));
  },
  _getPreRemainLimitSuccess: function (res) {
    if (this._requestCount === 0) {
      this._requestGubun = 'Done';
      this._requestCount++;
      this._getPreRemainLimit();
    } else if (this._requestCount === 1) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._getRemainLimitSuccess(res);
      } else {
        this._requestGubun = 'Retry';
        this._requestCount++;
        this._getPreRemainLimit();
      }
    } else {
      this._getRemainLimitFail(res);
    }
  },
  _getRemainLimitSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$remainBtnWrap.hide();

      var $result = res.result;
      this._setRemainLimitInfo($result);

      if ($result.autoChrgStCd === Tw.AUTO_CHARGE_CODE.USE) {
        this.$container.find('.fe-auto-prepay-arrow').removeClass('none');
      }
      this.$getDetailBtn.removeAttr('disabled').addClass('on');
      this.$remainInfoWrap.removeClass('none');
      this.$maxAmountWrap.removeClass('none');
    } else {
      this._getRemainLimitFail(res);
    }
  },
  _getRemainLimitFail: function (err) {
    this._popupService.openAlert(err.code + ' ' + err.msg);
  },
  _setRemainLimitInfo: function ($result) {
    this.$limitAmount = $result.microPayLimitAmt;
    this.$useAmount = $result.tmthUseAmt;
    this.$prepayAmount = $result.tmthChrgAmt;
    this.$possibleAmount = $result.tmthChrgPsblAmt;
    this.$remainAmount = $result.remainUseLimit;

    this.$remainInfo.text(Tw.FormatHelper.addComma(this.$remainAmount));
    this.$maxAmount.text(Tw.FormatHelper.addComma(this.$possibleAmount));

    if (this.$possibleAmount > 0) {
      this.$goPrepayBtn.removeAttr('disabled').removeClass('bt-gray1').addClass('bt-blue1');
    }
  },
  _getRemainAmount: function () {
    var limitAmount = parseInt(this.$limitAmount, 10);
    var useAmount = parseInt(this.$useAmount, 10);
    var prepayAmount = parseInt(this.$prepayAmount, 10);

    return limitAmount - useAmount + prepayAmount;
  },
  _openChangeLimit: function () {
    this._history.goLoad('/myt/bill/history/contents/limit/change');
  },
  _openStandardAmountInfo: function () {
    this._popupService.open({
      'title': Tw.PAYMENT_STRD_MSG.TITLE_L02,
      'close_bt': true,
      'contents': Tw.PAYMENT_STRD_MSG.CONTENTS_L02
    });
  },
  _openDetailPrepay: function () {
    this._popupService.open({
      hbs: 'PA_08_L01'
    }, $.proxy(this._setDetailPrepay, this));
  },
  _setDetailPrepay: function ($layer) {
    $layer.find('.fe-detail-title').text(this._mainTitle);
    $layer.find('.fe-remain-amount').text(Tw.FormatHelper.addComma(this.$remainAmount));
    $layer.find('.fe-limit-amount').text(Tw.FormatHelper.addComma(this.$limitAmount));
    $layer.find('.fe-use-amount').text(Tw.FormatHelper.addComma(this.$useAmount));
    $layer.find('.fe-prepay-amount').text(Tw.FormatHelper.addComma(this.$prepayAmount));
    $layer.find('.fe-possible-amount').text(Tw.FormatHelper.addComma(this.$possibleAmount));

    $layer.on('click', '.footer-wrap button', $.proxy(this._closePopup, this));
  },
  _getDetailAutoPrepay: function () {
    this._history.goLoad('/payment/prepay/micro/auto/history');
  },
  _goPrepay: function () {
    this._history.goLoad('/payment/prepay/micro/pay');
  },
  _goAutoPrepay: function () {
    this._history.goLoad('/payment/prepay/micro/auto');
  },
  _changeAutoPrepay: function () {
    this._history.goLoad('/payment/prepay/micro/auto/change');
  },
  _confirmCancel: function () {
    this._popupService.openAlert(Tw.MSG_PAYMENT.PRE_A07, null, $.proxy(this._cancelAutoPrepay, this));
  },
  _cancelAutoPrepay: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0077, {})
      .done($.proxy(this._cancelAutoPrepaySuccess, this))
      .fail($.proxy(this._cancelAutoPrepayFail, this));
  },
  _cancelAutoPrepaySuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._history.setHistory();
      this._history.goLoad('/payment/prepay/micro/auto/cancel');
    } else {
      this._cancelAutoPrepayFail();
    }
  },
  _cancelAutoPrepayFail: function (err) {
    this._popupService.openAlert(err.code + ' ' + err.msg);
  },
  _closePopup: function () {
    this._popupService.close();
  }
};
/**
 * FileName: myt-fare-submain.non-paymt.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.02
 *
 */

Tw.MyTFareSubMainNonPayment = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.data = params.data;
  this._rendered();
  this._bindEvent();
};

Tw.MyTFareSubMainNonPayment.prototype = {

  _rendered: function () {
    if ( this.data.possibleDay ) {
      // 납부가능일 선택
      this.$day = this.$container.find('[data-id=day]');
    }
    if ( this.data.suspension ) {
      // 이용정지 해제
      this.$susp = this.$container.find('[data-id=susp]');
    }
  },

  _bindEvent: function () {
    if ( this.data.possibleDay ) {
      this.$day.on('click', $.proxy(this._onClickedDay, this));
    }
    if ( this.data.suspension ) {
      this.$susp.on('click', $.proxy(this._onClickedSuspension, this));
    }
  },

  _setClaimList: function () {
    var list = [];
    if ( this.data.claimDate ) {
      var autoPayHistoryList = this.data.claimDate.autoPayHistoryList;
      // 납부방법이 은행이면서, 인출청구주기가 데일리 인출 은행인 경우만 주기 사용
      var isCycle = (this.data.claimDate.payMthdCd === '01' && this.data.claimDate.drwInvCyclCd === 'S1');
      for ( var idx = 0; idx < autoPayHistoryList.length; idx++ ) {
        var data = {
          index: autoPayHistoryList[idx].billNum,
          // 회차 항목
          list: []
        };
        // 1회차 청구에만 적용
        if ( data.index === '1' ) {
          data.isCycle = isCycle;
        }
        var detailList = autoPayHistoryList[idx].autoPayDrawList;
        for ( var jdx = 0; jdx < detailList.length; jdx++ ) {
          var item = detailList[jdx];
          if ( data.isCycle ) {
            if ( item.pStartDay && item.pEndDay ) {
              data.lastMt = true;
              data.pStartDay = Tw.DateHelper.getFullKoreanDate(item.pStartDay);
              data.pEndDay = Tw.DateHelper.getFullKoreanDate(item.pEndDay);
            }
            if ( item.tStartDay && item.tEndDay ) {
              data.thisMt = true;
              data.tStartDay = Tw.DateHelper.getFullKoreanDate(item.tStartDay);
              data.tEndDay = Tw.DateHelper.getFullKoreanDate(item.tEndDay);
            }
          }
          else {
            var value = Tw.DateHelper.getShortDateNoDot(item.drwDt) +
              '(' + Tw.DateHelper.getDayOfWeek(item.drwDt) + ')';
            data.list.push({
              index: item.seq,
              value: value
            });
          }
        }
        list.push(data);
      }
    }
    return list;
  },

  _setPaymentList: function () {
    var list = [];
    if ( this.data.possibleDay ) {
      var pDtList = this.data.possibleDay.maxPtpDtList;
      for ( var idx = 0; idx < pDtList.length; idx++ ) {
        var item = pDtList[idx];
        var value = Tw.DateHelper.getFullKoreanDate(item);
        list.push({
          title: item,
          value: value
        });
      }
    }
    return list;
  },

  _onClickedDay: function () {
    // TODO: 화면작업 후 처리
    var claimList = this._setClaimList();
    var paymentList = this._setPaymentList();
    this._popupService.open({
      hbs: 'MF_02_06',
      layer: true,
      claimList: claimList,
      paymentList: paymentList
    }, $.proxy(this._onOpendPossibleDayPopup, this),
      $.proxy(this._onClosedPossibleDayPopup, this), 'MF_02_06');
  },

  _onClickedSuspension: function () {
    this._popupService.openModalTypeA(Tw.NON_PAYMENT_SUSPENSION.TITLE,
      Tw.NON_PAYMENT_SUSPENSION.CONTENT_1 + (this.data.suspension.colAmt || '') + Tw.NON_PAYMENT_SUSPENSION.CONTENT_2,
      Tw.NON_PAYMENT_SUSPENSION.BTNAME, null, $.proxy(this._onSuspensionConfirmed, this), null);
  },

  // 납부가능일 팝업 열린 후 처리
  _onOpendPossibleDayPopup: function () {

  },

  // 납부가능일 팝업 닫힌 후 처리
  _onClosedPossibleDayPopup: function () {

  },

  // 이용정지해제 요청
  _onSuspensionConfirmed: function () {
    var params = {
      evtNum: this.data.suspension.evtNum,
      colAmt: this.data.suspension.colAmt
    };
    this._apiService.request(Tw.API_CMD.BFF_05_0034, params)
      .done($.proxy(this._onSuccessSuspesionCancel, this));
  },

  // 이용가능해제 완료 후 처리
  _onSuccessSuspesionCancel: function () {
    this._popupService.close();
    this._popupService.toast(Tw.NON_PAYMENT_SUSPENSION.TOAST);
    setTimeout($.proxy(function () {
      this._historyService.reload();
    }, this), 300);
  }
};

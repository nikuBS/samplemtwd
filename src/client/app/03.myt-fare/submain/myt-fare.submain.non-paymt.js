/**
 * MenuName: 나의 요금 > 서브메인 > 미납요금내역(MF_02)
 * FileName: myt-fare-submain.non-paymt.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.02
 * Summay: 미납내역 조회 후 처리
 * Description: 납부가능일 선택, 이용정제 해제
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
      this.$day = this.$container.find('button[data-id=day]');
    }
    if ( this.data.suspension ) {
      // 이용정지 해제
      this.$susp = this.$container.find('button[data-id=susp]');
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
            var value = Tw.DateHelper.getShortDate(item.drwDt) +
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

  // 납부가능일 이동
  _onClickedDay: function () {
    var claimList = this._setClaimList();
    var paymentList = this._setPaymentList();
    this._popupService.open({
      hbs: 'MF_02_06',
      layer: true,
      claimList: claimList,
      paymentList: paymentList,
      pageid: this.data.pageInfo.menuId
    }, $.proxy(this._onOpendPossibleDayPopup, this), null, 'MF_02_06');
  },

  // 납부가능일 팝업 열린 후 처리
  _onOpendPossibleDayPopup: function ($container) {
    this.$popupContainer = $container;
    var $selectList = $container.find('ul.select-list');
    var $selectedBtn = $container.find('li.bt-red1 button');
    $selectList.on('click', $.proxy(this._onClickedSelectedDate, this));
    $selectedBtn.on('click', $.proxy(this._onClickedSelectedBtn, this));
    Tw.Tooltip.popInit(this.$popupContainer.find('#MF_02_06_tip_01'));
  },

  // 납부가능일 팝업에서 아이템 선택
  _onClickedSelectedDate: function (event) {
    var $target = $(event.target).parents('ul').find('li.checked');
    var $btn = this.$popupContainer.find('li.bt-red1 button');
    var value = $target.find('input').attr('title');
    if ( $target.length > 0 ) {
      $btn.attr('value', value).removeAttr('disabled');
    }
  },

  // 납부가능일 팝업에서 선택완료버튼 클릭
  _onClickedSelectedBtn: function (event) {
    var $target = $(event.target);
    var value = $target.attr('value');
    var amt = parseInt(this.data.possibleDay.colAmt, 10);
    var params = {
      evtNum: this.data.possibleDay.evtNum,
      sColAmt: amt,
      sPayApntAmt: amt,
      sPayApntDt: value
    };
    // 납부가능일 입력 API 호출
    this._apiService.request(Tw.API_CMD.BFF_05_0032, params)
      .done($.proxy(this._onSuccessPdayInput, this))
      .fail($.proxy(this._onErrorPdayInput, this));
  },

  _onSuccessPdayInput: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      if ( result.success === Tw.NON_PAYMENT.SUCCESS.Y ) {
        this._popupService.close();
        this._popupService.toast(Tw.NON_PAYMENT.TOAST.P);
        // 납부가능일이 선택되어 선택버튼이 서버데이터도 변경되어 노출이 되면 안된다.
        setTimeout($.proxy(function () {
          this._historyService.reload();
        }, this), 300);
      }
      else if ( result.success === Tw.NON_PAYMENT.SUCCESS.R ) {
        this._popupService.openAlert(Tw.NON_PAYMENT.ERROR.P_R);
      }
      else {
        Tw.Error(resp.code, resp.msg).pop();
      }
    }
    else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  _onErrorPdayInput: function (resp) {
    Tw.Error(resp.code, resp.msg).pop();
  },

  // 이용정지해제 팝업 호출
  _onClickedSuspension: function () {
    // openModalTypeA hash 값 추가 되면 suspend 값 추가
    var colAmt = parseInt(this.data.suspension.colAmt, 10);
    this._popupService.openModalTypeA(Tw.NON_PAYMENT.SUSPENSION.TITLE,
      Tw.NON_PAYMENT.SUSPENSION.CONTENT_1 + colAmt + Tw.NON_PAYMENT.SUSPENSION.CONTENT_2,
      Tw.NON_PAYMENT.SUSPENSION.BTNAME, null, $.proxy(this._onSuspensionConfirmed, this), null);
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

  // 이용정지해제 완료 후 처리
  _onSuccessSuspesionCancel: function (resp) {
    // close를 먼저 호출하여 처리
    this._popupService.close();
    if ( resp.result === Tw.API_CODE.CODE_00 ) {
      var result = resp.result;
      if ( result.success === Tw.NON_PAYMENT.SUCCESS.Y ) {
        this._popupService.toast(Tw.NON_PAYMENT.TOAST.S);
        // 이용정지해제가 완료되어 이용정지해제버튼이 서버데이터도 변경되어 노출이 되면 안된다.
        setTimeout($.proxy(function () {
          this._historyService.reload();
        }, this), 300);
      }
      else if ( result.success === Tw.NON_PAYMENT.SUCCESS.R ) {
        this._popupService.openAlert(Tw.NON_PAYMENT.ERROR.S_R);
      }
      else {
        Tw.Error(resp.code, resp.msg).pop();
      }
    }
    else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  }
};

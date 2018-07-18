/**
 * FileName: myt.bill.billguide.subSelPayment.js
 * Author: 김명환 (skt.P130714@partner.sk.com)
 * Date: 2018.07.16
 * Info: 납부가능일 선택
 */

Tw.mytBillBillguideSubSelPayment = function (rootEl, resData) {

  this.resData = resData;
  this.init = this._init;
  Tw.Logger.info('[서버에서 데이터 받음]', resData);

  this.$container = rootEl;
  this.$window = window;
  this.$document = $(document);
  this.$btnTarget = null;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._history = new Tw.HistoryService(this.$container);
  this._history.init('hash');

  this.autopaySchedule = null; //BFF_05_0033 미납요금 납부가능일 청구일정 조회
  this.PaymentPossibleDay = null; //BFF_05_0031 미납요금 납부가능일 조회

  //요일 셋팅
  moment.lang('ko', {
    weekdays: ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
    weekdaysShort: ["일","월","화","수","목","금","토"],
  });

  this._init();
};

Tw.mytBillBillguideSubSelPayment.prototype = {
  _init: function () {
    Tw.Logger.info('[Tw.mytBillBillguideSubSelPayment 초기화]');
    this._bindEvent();
    this._getAutopaySchedule();
    this._getPaymentPossibleDay();
  },
  _cachedElement: function () {
    this.$paymentSummaryArea = $('[data-target="paymentSummaryArea"]');
    this.$selPaymentSelArea = $('[data-target="selPaymentSelArea"]');
    this.$selPaymentSelBtn = $('[data-target="selPaymentSelBtn"]');
    this.$cancelBtn = $('[data-target="cancelBtn"]');
    this.$submitBtn = $('[data-target="submitBtn"]');

  },
  _bindEvent: function () {
    this.$container.on('click', '[data-target="selPaymentSelBtn"]', $.proxy(this._selPopOpen, this));
    this.$container.on('click', '[data-target="cancelBtn"]', $.proxy(this._cancelExe, this));
    this.$container.on('click', '[data-target="submitBtn"]', $.proxy(this._submitExe, this));
  },
  _cancelExe: function() {
    this._goBack();
  },
  _submitExe: function() {
    var tg = this.$container.find('[data-target="selPaymentSelBtn"]');
    Tw.Logger.info('[데이터 정송 _submitExe ] ', tg.attr('data-info'));
  },
  _dataInit: function() {
    if ( this.autopaySchedule.payMthdCd === '02') {
      Tw.Logger.info('[카드]', this.$paymentSummaryArea);
      this._cachedElement();
      this._stateTypeA();
    } else {
      if ( this.autopaySchedule.payMthdCd === '01' && this.autopaySchedule.drwInvCyclCd === 'S1' ) {
        Tw.Logger.info('[은행 + 데일리]');
        this._cachedElement();
        this._stateTypeB();
      }
      else if ( this.autopaySchedule.payMthdCd === '01' && this.autopaySchedule.drwInvCyclCd === '01' ) {
        Tw.Logger.info('[은행 + 금결원]');
        this._cachedElement();
        this._stateTypeC();
      }
    }
  },
  _selectBtnInit: function() {
    this._cachedElement();
    //납부가능일 버튼 활성화
    var useObjYn = this.PaymentPossibleDay.useObjYn;
    (useObjYn === 'Y') ? this.$selPaymentSelArea.show() : this.$selPaymentSelArea.hide();
  },
  //--------------------------------------------------------------------------[셀릭트 팝업]
  _selPopOpen: function() {
    var $target = $(event.currentTarget);
    var arrOption = [];
    for ( var i=0, len=this.PaymentPossibleDay.maxPtpDtList.length; i<len; i++ ) {
      arrOption.push({
        'attr' : 'data-info="' + this.PaymentPossibleDay.maxPtpDtList[i] + '"',
        text : Tw.DateHelper.getShortDateWithFormat( this.PaymentPossibleDay.maxPtpDtList[i], 'YYYY년 MM월 DD일' )
      });
    }
    console.info('arrOption : ', arrOption);
    this._popupService.openChoice('납부가능일 선택', arrOption, 'type1', $.proxy(this._selPopOpenEvt, this, $target));
  },
  _selPopOpenEvt: function($target, $layer) {
    $layer.on('click', '.popup-choice-list', $.proxy(this._selPopOpenEvtExe, this, $target, $layer));
  },
  _selPopOpenEvtExe: function($target, $layer, event) {
    var $selectedValue = $(event.currentTarget);
    var tg = $target.find('[data-target="selPaymentSelBtn"]');
    tg.text($selectedValue.text());
    tg.attr( 'data-info', $selectedValue.find('button').attr('data-info') );
    this._popupService.close();
  },
  //--------------------------------------------------------------------------[카드]
  _stateTypeA: function() {
    var dataArr = this.autopaySchedule.autoPayHistoryList;
    var html = '';

    for (var i=0, len=dataArr.length; i < len; i++) {
      html += '<li><strong>' + dataArr[i].billNum + '차 청구</strong>';
      html += '<p>' + dataArr[i].autoPayDrawList[0].seq + '회차 ' + this._getDateTypeA(dataArr[i].autoPayDrawList[0].drwDt) + '</p>';
      html += '</li>';
    }

    this.$paymentSummaryArea.html($.proxy(function() {
      return html;
    }, this));
  },
  //--------------------------------------------------------------------------[[은행 + 데일리]]
  _stateTypeB: function() {
    var dataArr = this.autopaySchedule.autoPayHistoryList;
    var pStartDay = dataArr[0].autoPayDrawList[0].pStartDay;
    var pEndDay = dataArr[0].autoPayDrawList[0].pEndDay;
    var tStartDay = dataArr[0].autoPayDrawList[0].tStartDay;
    var tEndDay = dataArr[0].autoPayDrawList[0].tEndDay;

    var html = '';
    html += '<li><strong>1차 청구</strong>';
    html += '<p>' + Tw.DateHelper.getShortDateNoDot( pStartDay ) + '일~' + Tw.DateHelper.getShortDateNoDot( pEndDay ) + '일까지 매일<br /><span>(인출일이 휴일인 경우 다음날 인출) </span></p>';
    html += '<p>' + Tw.DateHelper.getShortDateNoDot( tStartDay ) + '일~' + Tw.DateHelper.getShortDateNoDot( tEndDay ) + '일까지 매일<br /><span>(인출일이 휴일인 경우 다음날 인출) </span></p>';
    html += '</li>';

    html += '<li><strong>2차 청구</strong>';
    html += '<div class="list-dot-wrap">';
    html += '<ul class="list-dot">';
    html += '<li class="list">' + dataArr[1].autoPayDrawList[0].seq + '회차 ' + this._getDateTypeA(dataArr[1].autoPayDrawList[0].drwDt) + '</li>';
    html += '<li class="list">' + dataArr[1].autoPayDrawList[1].seq + '회차 ' + this._getDateTypeA(dataArr[1].autoPayDrawList[1].drwDt) + '</li>';
    html += '</ul>';
    html += '</div>';
    html += '</li>';

    this.$paymentSummaryArea.html($.proxy(function() {
      return html;
    }, this));
  },
  //--------------------------------------------------------------------------[은행 + 금결원]
  _stateTypeC: function() {
    var dataArr = this.autopaySchedule.autoPayHistoryList;
    var html = '';

    for (var i=0, len=dataArr.length; i < len; i++) {
      html += '<li><strong>' + dataArr[i].billNum + '차 청구</strong>';

      var drawListLen = dataArr[i].autoPayDrawList.length;

      for (var a=0; a < drawListLen; a++ ) {
        html += '<p>' + dataArr[i].autoPayDrawList[a].seq + '회차 ' + this._getDateTypeA(dataArr[i].autoPayDrawList[a].drwDt) + '</p>';
      }

      html += '</li>';
    }

    this.$paymentSummaryArea.html($.proxy(function() {
      return html;
    }, this));
  },
  //--------------------------------------------------------------------------[api]
  _getAutopaySchedule: function() {//BFF_05_0033
    this._apiService.request(Tw.API_CMD.BFF_05_0033, {})
      .done($.proxy(function(resp){
        Tw.Logger.info('[BFF_05_0033]', resp);
        this.autopaySchedule = resp.result;
        this._dataInit();
      }, this))
      .fail(function(err){})
  },
  _getPaymentPossibleDay: function() {//BFF_05_0031
    this._apiService.request(Tw.API_CMD.BFF_05_0031, {})
      .done($.proxy(function(resp){
        Tw.Logger.info('[BFF_05_0031]', resp);
        this.PaymentPossibleDay = resp.result;
        this._selectBtnInit();
      }, this))
      .fail(function(err){})
  },
  //--------------------------------------------------------------------------[공통]
  _onOpenSelectPopup: function () {
    //$('.popup-info').addClass('scrolling');
  },
  _goHistory: function () {
    this._goLoad('/recharge/cookiz/history');
  },
  _goBack: function () {
    this._history.go(-1);
  },
  _goLoad: function (url) {
    location.href = url;
  },
  _go: function (hash) {
    window.location.hash = hash;
  },
  _getSelClaimDtBtn: function (str) {
    return moment(str).add(1, 'days').format('YYYY년 MM월');
  },
  _getDateTypeA: function (str) {
    return moment(str).format('YYYY.MM.DD (ddd)');
  }
};

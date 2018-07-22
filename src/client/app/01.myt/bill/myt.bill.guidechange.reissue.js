/**
 * FileName: myt.bill.reissue.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
Tw.MyTBillReissue = function ($element) {
  var self = this;
  this.$container = $element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._rendered();
  this._bindEvent();

  setTimeout(function () {
    self._init();
  }, 0);
};

Tw.MyTBillReissue.prototype = {
  //element event bind
  _bindEvent: function () {
    // 재발행 요청
    this.$okButton.on('click', $.proxy(this._onOkClicked, this));
    // 닫기 버튼
    this.$closeButton.on('click', $.proxy(this._onCloseClicked, this));
  },

  //set selector
  _rendered: function () {
    //대표안내서
    this.$guide = this.$container.find('.txt-type');
    //시점
    this.$time = this.$container.find('[data-id=time]');
    //월
    this.$month = this.$container.find('[data-id=month]');
    //사유
    this.$reason = this.$container.find('[data-id=reason]');
    //유형
    this.$type = this.$container.find('[data-id=type]');
    //신청버튼
    this.$okButton = this.$container.find('.bt-red1');
    //닫기버튼
    this.$closeButton = this.$container.parent().siblings('#header').find('.close-step');
  },

  _init: function () {
    //최초 진입시 설정 - 첫번째 아이템 선택
    this.$time.find(':radio').eq(0).trigger('click');
    this.$month.find(':radio').eq(0).trigger('click');
    //선택적으로 노출되는 아이템
    if ( this.$reason.length > 0 ) {
      // 반송처리 선택
      this.$reason.find(':radio').eq(1).trigger('click');
    }
    if ( this.$type.length > 0 ) {
      this.$type.find(':radio').eq(0).trigger('click');
    }
  },

  _onOkClicked: function (/*event*/) {
    // 재발행 신청
    // API 호출 후 결과 값에 기 발행인 경우와 아닌 경우에 대한 처리
    // 기본적으로 설정된 값으로 표시
    var selectedItem = this.$guide.text();
    var type = this.$guide.attr('data-type');
    if ( this.$type.length > 0 ) {
      //유형이 설정이 된다면 선택된 아이템에서 가져와 표시
      selectedItem = this.$type.find('[aria-checked=true]').text();
      type = this.$type.find(':checked').attr('name');
    }
    //  재발행 이후 처리로 인하여 추가
    this.type = type;
    var contents = selectedItem + Tw.MSG_MYT.BILL_GUIDE_REISSUE_01;
    if ( type && (type === '2' || type === '02') ) {
      // 이메일인 경우 문구 다름
      contents = Tw.MSG_MYT.BILL_GUIDE_REISSUE_02;
    }
    else if ( type && (type === '1' || type === '01') ) {
      // 기타(우편)인 경우
      contents = Tw.MSG_MYT.BILL_GUIDE_REISSUE_04;
    }
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, contents, null, null, $.proxy(this._onOkPopupClicked, this));
  },

  _onCloseClicked: function (/*event*/) {
    // 취소 방지 Alert
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_MYT.BILL_GUIDE_REISSUE_EXIT, null, null, $.proxy(this._handleClose, this));
  },

  _handleClose: function () {
    window.location.replace('/myt/bill/guidechange');
  },

  _onOkPopupClicked: function () {
    this._requestReissue();
  },

  _goToComplete: function () {
    var type = this.$guide.attr('data-type');
    var month = this.$month.find(':checked').attr('name') || '';
    if ( this.$type.length > 0 ) {
      type = this.$type.find(':checked').attr('name');
    }
    // 재발행 요청 완료 화면으로 이동
    window.location.href = 'reissue/complete?typeCd=' + type + '&month=' + month;
  },

  _requestReissue: function (/*event*/) {
    var api = Tw.API_CMD.BFF_05_0048;
    var data;
    // 유선인 경우 재발행 사유 추가
    if ( this.$reason.length > 0 ) {
      api = Tw.API_CMD.BFF_05_0052;
      data = {
        reisuType: this.$guide.attr('data-type') || '', // 재발행코드종류
        invYm: this.$month.find(':checked').attr('name') || '', // 재발행청구일자
        reisuRsnCd: this.$reason.find(':checked').attr('name')
      };
      // 청구서타입 유형이 2개인 경우
      if ( this.$type.length > 0 ) {
        data.reisuType = this.$type.find(':checked').attr('name');
      }
    }
    else {
      data = {
        sReisueTypCd: this.$guide.attr('data-type') || '', // 재발행코드종류
        sInvDt: this.$month.find(':checked').attr('name') || '', // 재발행청구일자
        sReisueRsnCd: '01' //기본은 무선
      };
      // 청구서타입 유형이 2개인 경우
      if ( this.$type.length > 0 ) {
        data.sReisueTypCd = this.$type.find(':checked').attr('name');
      }
    }
    //재발행신청 API 호출
    this._apiService
      .request(api, data)
      .done($.proxy(this._onApiSuccess, this))
      .fail($.proxy(this._onApiError, this));
  },

  _onApiSuccess: function (params) {
    var self = this;
    Tw.Logger.info(params);
    // 팝업닫고 처리
    this._popupService.close();
    if ( params.code && params.code === 'ZORDE1206' ) {
      // 기 발행 건인 경우에 대한 처리
      setTimeout(function () {
        self._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDE_REISSUE_03, Tw.POPUP_TITLE.NOTIFY);
      }, 100);
    }
    else if ( params.code && params.code === '00' ) {
      //성공 - 발행 된 건이 없는 경우
      if ( (this.type === '2' || this.type === '02') || (this.type === '1' || this.type === '01') ) {
        this._goToComplete();
      }
      else {
        setTimeout(function () {
          self._popupService.openAlert(Tw.MSG_MYT.BILL_GUIDECHANGE_A14, Tw.POPUP_TITLE.NOTIFY, $.proxy(self._goToComplete, self));
        }, 100);
      }
    }
    else {
      var errorMsg = Tw.MSG_MYT.BILL_GUIDE_REISSUE_FAIL + '<br/>' + (params.msg || (params.error && params.error.msg));
      Tw.Logger.error(errorMsg);
      // 에러를 가시적으로 볼수 있도록 alert에 추가 표시
      setTimeout(function () {
        self._popupService.openAlert(errorMsg, Tw.POPUP_TITLE.NOTIFY);
      }, 100);
    }
  },

  _onApiError: function (params) {
    // API 호출 오류
    Tw.Logger.warn(params);
  }
};
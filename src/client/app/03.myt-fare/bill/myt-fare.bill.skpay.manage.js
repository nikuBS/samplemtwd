/**
 * @file myt-fare.bill.skpay.manage.js
 * @file [SK pay 관리]
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.06.25
 */

/**
 * @class 
 * @desc SK pay 관리 위한 class
 * 
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.info.history.controlloer.ts 로 부터 전달되어 온 납부내역 정보
 */
Tw.MyTFareBillSkpayManage = function (rootEl, data) {
  this._popupService = Tw.Popup;
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
  this._rendered();
  this._bindEvent();
};

Tw.MyTFareBillSkpayManage.prototype = {

  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * - rootPathName 현재 주소
   * - detailData 자료 데이터
   * - queryParams 쿼리로 받아온 객체
   * - query type 에 따라 표기될 렌더링될 템플릿 설정
   * @return {void}
   */
  _init: function () {
    this.rootPathName = this._historyService.pathname;
    this.detailData = this.data.content ? this.data.content : {};
    this.queryParams = Tw.UrlHelper.getQueryParams();
    this.$templateWrapper = this.$container.find('#fe-detail-wrapper');
    this.$template = {
      $microContents: Handlebars.compile($('#fe-skpay-manage-contents').html())
    };
    this.$templateWrapper.append(this.$template.$microContents(this.detailData));
  },
  _rendered: function () {
    // SK pay 연결 끊기
    this.$skpayDisconnect = this.$container.find('button[data-id=skpay-disconnect]');
  },
  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    this.$skpayDisconnect.on('click', $.proxy(this._onClickedskpayDisconnect, this));
  },
  /**
   * @function
   * @member
   * @desc SK pay 연결 끊기
   */
  _onClickedskpayDisconnect: function (/*event*/) {
    var date = {
      skpayMndtAgree: '',
      skpaySelAgree: '',
      gbn: 'R'
    };
    this._apiService.request(Tw.API_CMD.BFF_07_0096, date)
      .done($.proxy(this._skpayAgreeSuccess, this))
      .fail($.proxy(this._skpayAgreeFail, this));
  },
  /**
   * @function
   * @desc 제3장 동의 여부 조회 API 응답 처리 (성공)
   * @param res
   */
  _skpayAgreeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if(res.result.skpayMndtAgree === 'Y') {
        this._popupService.openModalTypeA(Tw.ALERT_MSG_SKPAY.DEL_JOIN.TITLE, Tw.ALERT_MSG_SKPAY.DEL_JOIN.CONTENTS,
          Tw.ALERT_MSG_SKPAY.DEL_JOIN.TITLE.OK_BTN, null, $.proxy(this._skpayDisconnectYes, this), null);
      } else {
        this._popupService.openAlert(Tw.ALERT_MSG_SKPAY.NO_JOIN.CONTENTS, Tw.ALERT_MSG_SKPAY.NO_JOIN.TITLE, 
          Tw.ALERT_MSG_SKPAY.NO_JOIN.TITLE.OK_BTN, null, this);
      }
    } else {
      this._skpayAgreeFail(res);
    }
  },
     /**
   * @function
   * @member
   * @desc SK pay 연결 끊기 확인
   */
  _skpayDisconnectYes: function () {
    this._popupService.close();
    var date = {
      skpayMndtAgree: '',
      skpaySelAgree: '',
      gbn: 'D'
    };
    this._apiService.request(Tw.API_CMD.BFF_07_0096, date)
      .done($.proxy(this._skpayAgreeSuccessDelete, this))
      .fail($.proxy(this._skpayAgreeFail, this));
  },
     /**
   * @function
   * @desc 제3장 동의 여부 조회 API 응답 처리 (성공)
   * @param res
   */
  _skpayAgreeSuccessDelete: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.openAlert(Tw.ALERT_MSG_SKPAY.DEL_OK.CONTENTS, Tw.ALERT_MSG_SKPAY.DEL_OK.TITLE, 
        Tw.ALERT_MSG_SKPAY.DEL_OK.TITLE.OK_BTN, null, this);
    } else {
      this._skpayAgreeFail(res);
    }
  },
  /**
   * @function
   * @desc 제3장 동의 여부 조회 API 응답 처리 (실패)
   */
  _skpayAgreeFail: function (res) {
    this._err = {
      code: res.code,
      msg: res.msg
    };
    Tw.Error(this._err.code, this._err.msg).pop(); // 에러 시 공통팝업 호출
  }
};

/**
 * FileName: myt-fare.bill.prepay.main.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.10.04
 * Annotation: 소액결제/콘텐츠이용료 메인화면
 */

Tw.MyTFareBillPrepayMain = function (rootEl, title) {
  this.$container = rootEl;
  this.$title = title;
  this._apiName = title === 'small' ? Tw.API_CMD.BFF_07_0073 : Tw.API_CMD.BFF_07_0081;
  this._gubun = 'Request';
  this._requestCnt = 0;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillPrepayMain.prototype = {
  _init: function () {
    Tw.CommonHelper.startLoading('.container', 'grey');

    // CDN 읽어온 이후 여부 체크
    if( !Tw.Environment.init ) {
      $(window).on(Tw.INIT_COMPLETE, $.proxy(this._checkIsAfterChange, this));
    } else {
      this._checkIsAfterChange(); // 자동선결제 해지 후 다시 메인으로 왔을 경우 처리
    }

    this._initVariables();
    this._getRemainLimit();
    this._setButtonVisibility();
    this._bindEvent();
  },
  _checkIsAfterChange: function () {
    var type = Tw.UrlHelper.getQueryParams().type; // 쿼리스트링에 type이 있을 경우 toast 출력 (자동선결제 해지 후 돌아왔을 때)
    if (type) {
      var message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_CANCEL_AUTO_PREPAY; // 자동선결제 해지가 완료되었습니다.

      if (!this._isBackOrReload() && message !== '') {
        this._commonHelper.toast(message); // 뒤로가기나 새로고침이 아닐 경우, 메시지가 누락되지 않았을 경우 토스트 출력
      }
    }
  },
  _getRemainLimit: function () {
    this._apiService.request(this._apiName, { gubun: this._gubun, requestCnt: this._requestCnt })
      .done($.proxy(this._remainSuccess, this))
      .fail($.proxy(this._remainFail, this));
  },
  _remainSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (this._gubun === 'Request') {
        this._gubun = 'Done';
        this._requestCnt++;

        this._getRemainLimit();
      } else {
        if (res.result.gubun === 'Done') {
          Tw.CommonHelper.endLoading('.container');
          this._setData(res);
        } else {
          if (this._requestCnt < 3) {
            this._requestCnt++;
            setTimeout($.proxy(this._getRemainLimit, this), 3000);
          } else {
            this._remainFail({ code: 'ERROR', msg: Tw.ALERT_MSG_MYT_FARE.PREPAY_REMAIN_ERROR });
          }
        }
      }
    } else {
      this._remainFail(res);
    }
  },
  _remainFail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code, err.msg).replacePage();
  },
  _setData: function (res) {
    var result = res.result;
    if (!Tw.FormatHelper.isEmpty(result)) {
      if (result.autoChrgStCd === 'U') {
        this.$container.find('.fe-auto-wrap').removeClass('none');
      } else {
        this.$container.find('.fe-non-auto-wrap').removeClass('none');
      }
      this._prepayAmount = result.tmthChrgPsblAmt;

      this.$useAmount.attr('id', result.tmthUseAmt).text(Tw.FormatHelper.addComma(result.tmthUseAmt)); // 당월 사용금액에 콤마(,) 추가
      this.$remainAmount.attr('id', result.remainUseLimit).text(Tw.FormatHelper.addComma(result.remainUseLimit)); // 잔여한도에 콤마(,) 추가
      this.$prepayAmount.attr('id', result.tmthChrgPsblAmt).text(Tw.FormatHelper.addComma(result.tmthChrgPsblAmt)); // 선결제 가능금액에 콤마(,) 추가

      this._bindEventAfterData();
    }
  },
  _initVariables: function () {
    this._isAndroid = Tw.BrowserHelper.isAndroid();

    this._monthAmountList = [];
    this._dayAmountList = [];
    this._onceAmountList = [];

    this.$useAmount = this.$container.find('.fe-use-amount');
    this.$remainAmount = this.$container.find('.fe-remain-amount');
    this.$prepayAmount = this.$container.find('.fe-prepay-amount');
    this.$setPasswordBtn = this.$container.find('.fe-set-password');

    this._name = this.$container.find('.fe-name').text();
  },
  _setButtonVisibility: function () {
    // 소액결제일 경우 비밀번호 상태값에 따라 '비밀번호 설정' 버튼 보여주기 결정
    if (this.$title === 'small') {
      if (this.$setPasswordBtn.attr('data-cpin') === undefined || this.$setPasswordBtn.attr('data-cpin') === null ||
        this.$setPasswordBtn.attr('data-cpin') === '' || this.$setPasswordBtn.attr('data-cpin') === 'IC') {
        this.$setPasswordBtn.after().hide();
      }
    }
  },
  _bindEvent: function () {
    this.$container.on('change', '.fe-set-use', $.proxy(this._changeUseStatus, this));
    this.$container.on('click', '.fe-set-password', $.proxy(this._setPassword, this));
  },
  _bindEventAfterData: function () {
    this.$container.on('click', '.fe-max-amount', $.proxy(this._prepayHistoryMonth, this));
    this.$container.on('click', '.fe-micro-history', $.proxy(this._microHistory, this));
    this.$container.on('click', '.fe-contents-history', $.proxy(this._contentsHistory, this));
    this.$container.on('click', '.fe-change-limit', $.proxy(this._changeLimit, this));
    this.$container.on('click', '.fe-prepay', $.proxy(this._prepay, this));
    this.$container.on('click', '.fe-auto-prepay', $.proxy(this._autoPrepay, this));
    this.$container.on('click', '.fe-auto-prepay-change', $.proxy(this._autoPrepayInfo, this));
  },
  _prepayHistoryMonth: function () {
    this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/monthly'); // 월별 이용내역 조회 페이지로 이동
  },
  _microHistory: function (e) {
    // 이용내역 조회 - 소액결제일 경우 actionsheet로 이용내역/차단내역 선택
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.FARE_PAYMENT_MICRO_HISTORY_LIST,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    },
      $.proxy(this._selectPopupCallback, this),
      null, null, $(e.currentTarget)
    );
  },
  _selectPopupCallback: function ($layer) {
    $layer.on('click', '.ac-list', $.proxy(this._goMicroHistory, this));
  },
  _goMicroHistory: function (event) {
    // actionsheet에서 선택한 내역으로 이동
    var microHistoryUri = $(event.target).attr('data-link');
    if (!Tw.FormatHelper.isEmpty(microHistoryUri)) {
      this._historyService.replaceURL(microHistoryUri);
    }
  },
  _contentsHistory: function () {
    this._historyService.goLoad('/myt-fare/bill/contents/history'); // 콘텐츠이용료 내역조회 페이지로 이동
  },
  _changeLimit: function () {
    new Tw.MyTFareBillPrepayChangeLimit(this.$container, this.$title); // 이용한도 변경
  },
  _isPrepayAble: function () {
    // 선결제 금액이 0원일 경우 return false
    if (this.$prepayAmount.text() === '0') {
      return false;
    }
    return true;
  },
  _prepay: function (e) {
    // 선결제
    var hbsName = 'MF_06_03';
    if (this.$title === 'contents') {
      hbsName = 'MF_07_03';
    }

    if (this._isPrepayAble()) {
      if (Tw.BrowserHelper.isApp()) { // 앱일 경우에만 이동
        this._popupService.open({
          'hbs': hbsName
        }, $.proxy(this._goPrepay, this), null, 'pay', $(e.currentTarget));
      } else {
        this._goAppInfo(e); // 웹일 경우 앱 설치 유도 페이지로 이동
      }
    } else {
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A89.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A89.TITLE,
        null, null, null, $(e.currentTarget)); // 0원이면 안내 alert 노출
    }
  },
  _goPrepay: function ($layer) {
    new Tw.MyTFareBillPrepayPay($layer, this.$title, this._prepayAmount, this._name); // 선결제
  },
  _autoPrepay: function (e) {
    if (Tw.BrowserHelper.isApp()) {
      this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/auto'); // 자동선결제 페이지로 이동
    } else {
      this._goAppInfo(e);
    }
  },
  _autoPrepayInfo: function () {
    this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/auto/info'); // 자동선결제 신청자일 경우 변경 및 해지 페이지로 이동
  },
  _changeUseStatus: function (event) {
    new Tw.MyTFareBillSmallSetUse(this.$container, $(event.target)); // 소액결제 사용/차단 설정
  },
  _setPassword: function () {
    new Tw.MyTFareBillSmallSetPassword(this.$container, this.$setPasswordBtn); // 소액결제 비밀번호 신청 및 변경
  },
  _goAppInfo: function (e) {
    // 앱 설치 유도 페이지로 이동
    var isAndroid = Tw.BrowserHelper.isAndroid();
    this._popupService.open({
      'hbs': 'open_app_info',
      'isAndroid': isAndroid,
      'cdn': Tw.Environment.cdn
    }, $.proxy(this._onOpenTworld, this), null, null, $(e.currentTarget));
  },
  _onOpenTworld: function ($layer) {
    new Tw.CommonShareAppInstallInfo($layer);
  },
  _isBackOrReload: function () {
    // 뒤로가기 및 새로고침 체크
    if (window.performance) {
      if (performance.navigation.type === 1 || performance.navigation.type === 2) {
        return true;
      }
    }
  }
};
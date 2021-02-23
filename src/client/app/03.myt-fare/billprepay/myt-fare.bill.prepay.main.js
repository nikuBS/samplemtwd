/**
 * @file myt-fare.bill.prepay.main.js
 * @author Jayoon Kong
 * @since 2018.10.04
 * @desc 소액결제/콘텐츠이용료 메인화면
 */

/**
 * @namespace
 * @desc 소액결제/콘텐츠이용료 메인화면 namespace
 * @param rootEl - dom 객체
 * @param title - 소액결제/콘텐츠이용료
 * @param className - 다른 객채에서 생성시 전달할 클래스명
 * @param callback - 다른 객체에서 생성시 초기화 후 호출 할 콜백 함수
 */
Tw.MyTFareBillPrepayMain = function (rootEl, title, className, callback) {
  this.$container = rootEl;
  this.$title = title;
  this.$isPrepay = className === '.popup-page';
  this.$className = className || '.container';
  this.$callback = callback;
  this._apiName = title === 'small' ? Tw.API_CMD.BFF_07_0073 : Tw.API_CMD.BFF_07_0081;
  this._prepayAmount = 0;
  this._isAdult = 'Y';  // OP002-7282. 미성년자 여부 추가

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);

  if (!this.$isPrepay) {
    this._init();
  }
};

Tw.MyTFareBillPrepayMain.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    Tw.CommonHelper.startLoading('.container', 'grey');

    // CDN 읽어온 이후 여부 체크
    if( !Tw.Environment.init ) {
      $(window).on(Tw.INIT_COMPLETE, $.proxy(this._checkIsAfterChange, this));
    } else {
      this._checkIsAfterChange(); // 자동선결제 해지 후 다시 메인으로 왔을 경우 처리
    }

    this._initVariables();
    this.getRemainLimit();
    this._setButtonVisibility();
    this._bindEvent();
  },
  /**
   * @function
   * @desc 쿼리스트링에 type이 있을 경우 toast 출력 (자동선결제 해지 후 돌아왔을 때)
   */
  _checkIsAfterChange: function () {
    var type = Tw.UrlHelper.getQueryParams().type;
    if (type) {
      var message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_CANCEL_AUTO_PREPAY; // 자동선결제 해지가 완료되었습니다.

      if (!this._isBackOrReload() && message !== '') {
        this._commonHelper.toast(message); // 뒤로가기나 새로고침이 아닐 경우, 메시지가 누락되지 않았을 경우 토스트 출력
      }
    }
  },
  /**
   * @function
   * @desc 잔여한도 조회 API 호출
   */
  getRemainLimit: function () {
    /*
    오래걸리는 API라 JS에서 호출 - 최초 1회 시 gubun: Request, requestCnt: 0으로 호출
    그 이후 즉시 gubun: Done, request: 1로 호출
    성공하면 return, 실패 시 (실패여부는 응답값의 gubun이 Retry로 내려옴) gubun은 그대로 두고 request는 1씩 증가
    위 작업을 3초 term을 두고 실행, requestCnt가 3이 될 때까지 실행 후 그래도 실패하면 에러페이지 렌더링
    */
    this._apiService.request(this._apiName, { gubun: this._gubun, requestCnt: this._requestCnt })
      .done($.proxy(this._remainSuccess, this))
      .fail($.proxy(this._remainFail, this));
  },
  /**
   * @function
   * @desc 잔여한도 조회 API 응답 처리
   * @param res
   */
  _remainSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (this._gubun === 'Request') {
        this._gubun = 'Done';
        this._requestCnt++; // 최초 호출 이후 gubun과 requestCnt 변경

        setTimeout($.proxy(this.getRemainLimit, this), 1000); // 1초 후 재호출
      } else {
        if (res.result.gubun === 'Done') {
          Tw.CommonHelper.endLoading(this.$className);
          if (this.$isPrepay) {
            this.$callback(res); // 선결제 팝업에서 호출 시
          } else {
            this._setData(res); // 성공하면 데이터 셋팅 (잔여한도 등)
          }
        } else { // 실패하면 다시 호출
          if (this._requestCnt < 3) {
            this._requestCnt++; // requestCnt 증가 (+1)
            setTimeout($.proxy(this.getRemainLimit, this), 3000); // 3초 delay 후 재호출
          } else {
            this._remainFail({ code: 'ERROR', msg: Tw.ALERT_MSG_MYT_FARE.PREPAY_REMAIN_ERROR }); // 3번째 시도에도 실패 시 에러 처리
          }
        }
      }
    } else {
      this._remainFail(res);
    }
  },
  /**
   * @function
   * @desc 잔여한도 조회 API Error 처리
   * @param err
   */
  _remainFail: function (err) {
    this.initRequestParam();
    Tw.CommonHelper.endLoading(this.$className);
    Tw.Error(err.code, err.msg).replacePage();
  },
  /**
   * @function
   * @desc set data
   * @param res
   */
  _setData: function (res) {
    var result = res.result;
    if (!Tw.FormatHelper.isEmpty(result)) {
      // 콘텐츠 이용요금 페이지에서만 사용
      this._isAdult = this.$title === 'contents' && (result.isAdult || 'Y');
      if (result.autoChrgStCd === 'U') { // 자동선결제 신청 상태일 경우
        this.$container.find('.fe-auto-wrap').removeClass('none'); // 변경 필드 노출
      } else {
        this.$container.find('.fe-non-auto-wrap').removeClass('none'); // 신청 필드 노출
      }
      this._prepayAmount = result.tmthChrgPsblAmt; // 선결제 가능금액 (선결제 팝업으로 보내야 하는 값)

      this.$useAmount.attr('id', result.tmthUseAmt).text(Tw.FormatHelper.addComma(result.tmthUseAmt)); // 당월 사용금액에 콤마(,) 추가
      this.$remainAmount.attr('id', result.remainUseLimit).text(Tw.FormatHelper.addComma(result.remainUseLimit)); // 잔여한도에 콤마(,) 추가
      this.$prepayAmount.attr('id', result.tmthChrgPsblAmt).text(Tw.FormatHelper.addComma(result.tmthChrgPsblAmt)); // 선결제 가능금액에 콤마(,) 추가

      this.initRequestParam();
      this._bindEventAfterData();
    }
  },
  /**
   * @function
   * @desc initialize variables
   */
  _initVariables: function () {
    this.initRequestParam();
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
  /**
   * @function
   * @desc 요청 파라미터 초기화
   */
  initRequestParam: function () {
    this._gubun = 'Request';
    this._requestCnt = 0;
  },
  /**
   * @function
   * @desc 소액결제일 경우 비밀번호 상태값에 따라 '비밀번호 설정' 버튼 보여주기 결정
   */
  _setButtonVisibility: function () {
    if (this.$title === 'small') {
      if (this.$setPasswordBtn.attr('data-cpin') === undefined || this.$setPasswordBtn.attr('data-cpin') === null ||
        this.$setPasswordBtn.attr('data-cpin') === '' || this.$setPasswordBtn.attr('data-cpin') === 'IC') {
        this.$setPasswordBtn.after().hide();
      }
    }
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('change', '.fe-set-use', $.proxy(this._changeUseStatus, this));
    this.$container.on('click', '.fe-set-password', $.proxy(this._setPassword, this));
    this.$container.on('click', '[data-unusual-state]', $.proxy(this._unusualBlock, this));
  },

  /**
   * @function
   * @param e
   * @desc 특이고객 차단
   */
  _unusualBlock: function (e) {
    if ($(e.currentTarget).data('unusualState') === 'Y') {
      e.stopImmediatePropagation(); // 다른 이벤트 중지
      Tw.Error('', Tw.MYT_FARE_BILL.ERROR.UNUSUAL_CUSTOMER_MSG, Tw.MYT_FARE_BILL.ERROR.UNUSUAL_CUSTOMER_SUB_MSG).page();
    }
  },

  /**
   * @function
   * @desc API 응답 이후 event binding
   */
  _bindEventAfterData: function () {
    // this.$container.on('click', '.fe-max-amount', $.proxy(this._prepayHistoryMonth, this));
    this.$container.on('click', '.fe-micro-history', $.proxy(this._microHistory, this));
    this.$container.on('click', '.fe-contents-history', $.proxy(this._contentsHistory, this));
    this.$container.on('click', '.fe-change-limit', $.proxy(this._changeLimit, this));
    this.$container.on('click', '.fe-prepay', $.proxy(this._prepay, this));
    this.$container.on('click', '.fe-auto-prepay', $.proxy(this._autoPrepay, this));
    this.$container.on('click', '.fe-auto-prepay-change', $.proxy(this._autoPrepayInfo, this));
  },
  /**
   * @function
   * @desc 월별 이용내역 조회 페이지로 이동
   */
  /*_prepayHistoryMonth: function () {
    this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/monthly');
  },*/
  /**
   * @function
   * @desc 이용내역 조회 - 소액결제일 경우 actionsheet로 이용내역/차단내역 선택
   * @param e
   */
  _microHistory: function (e) {
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
  /**
   * @function
   * @desc actionsheet event binding
   * @param $layer
   */
  _selectPopupCallback: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    $layer.on('click', '.ac-list', $.proxy(this._goMicroHistory, this)); // 소액결제 내역조회
  },
  /**
   * @function
   * @desc actionsheet에서 선택한 내역으로 이동
   * @param event
   */
  _goMicroHistory: function (event) {
    var microHistoryUri = $(event.target).attr('data-link');
    if (!Tw.FormatHelper.isEmpty(microHistoryUri)) {
      this._historyService.replaceURL(microHistoryUri);
    }
  },
  /**
   * @function
   * @desc 콘텐츠이용료 내역조회 페이지로 이동
   */
  _contentsHistory: function () {
    this._historyService.goLoad('/myt-fare/bill/contents/history');
  },
  /**
   * @function
   * @desc 이용한도 변경
   */
  _changeLimit: function (e) {
    // 21/2/23 OP002-12587 법인회선(C,D) 는 한도변경 접근불가.(회선등급 C의 경우 정책서 상에는 svcGr 값이 C이고 시스템 상에는 svcGr 값이 R)
    if (['R', 'D'].indexOf(this.$container.data('svc-gr')) > -1) {
      var templ = Tw.MYT_FARE_BILL.ERROR.NO_AUTH_COMPANY;
      Tw.Error('', templ.MSG, templ.SUB_MSG).page();
      return;
    }
    new Tw.MyTFareBillPrepayChangeLimit(this.$container, this.$title, $(e.currentTarget));
  },
  /**
   * @function
   * @desc 선결제 금액이 0원일 경우 return false
   * @returns {boolean}
   */
  _isPrepayAble: function () {
    return this._prepayAmount > 0;
  },
  /**
   * @function
   * @desc 선결제 팝업 로드
   * @param e
   */
  _prepay: function (e) {
    // 20.04.06 OP002-7282 : 미성년자인 경우 에러페이지로 이동
    if(this.$title === 'contents' && this._isAdult !== 'Y') {
      return this._goErrorMinor();
    }

    if (this._isPrepayAble()) {
      if (Tw.BrowserHelper.isApp()) { // 앱일 경우에만 이동
        // [OP002-9462] 선결제 기능 조건부
        this._apiService.request(Tw.API_CMD.BFF_07_0104, {})
          .done($.proxy(this._checkTimeSuccess, this, e))
          .fail($.proxy(function (err) {
            this._showErrorPopup(Tw.POPUP_TITLE.NOTIFY, err.msg, e.currentTarget);
          }, this));
      } else {
        this._goAppInfo(e); // 웹일 경우 앱 설치 유도 페이지로 이동
      }
    } else {
      // 0원이면 안내 alert 노출
      this._showErrorPopup(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A89.TITLE, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A89.MSG, e.currentTarget);
      /*
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_FARE.ALERT_2_A89.MSG, Tw.ALERT_MSG_MYT_FARE.ALERT_2_A89.TITLE,
        null, null, null, $(e.currentTarget)); // 0원이면 안내 alert 노출
      */
    }
  },
  /**
   * 선결제 가능 시간 확인 후 처리
   * @param e
   * @param res
   * @private
   */
  _checkTimeSuccess: function (e, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      /*
      const res = {
        result: {
          "msg": "Swing 에러메시지",
          "msg_disp_yn": "메시지노출여부(매월말 23시 50분~00분인 경우 Y, 그외에는 N)"
        }
      };
      */
      if (res.result.msg_disp_yn === 'N') {
        new Tw.MyTFareBillPrepayMainSKpay({
          $element: this.$container,
          callbackSKpay: $.proxy(this._goSKpay, this),
          callbackPrepay: $.proxy(this._goPrepayCallback, this)
        }).openPaymentOption(e);
      } else {
        this._showErrorPopup(Tw.POPUP_TITLE.NOTIFY, res.result.msg, e.currentTarget);
      }
    } else {
      Tw.Error(res.code, res.msg).pop(); // 에러 시 공통팝업 호출
    }
  },
  /**
   * 에러표시창
   * @param {String|null} [title]
   * @param {String} contents
   * @param {HTMLElement} target
   * @private
   */
  _showErrorPopup: function (title, contents, target) {
    this._popupService.openAlert(contents, title,'',null, '', $(target));
  },
    /**
   * @function
   * @desc 실시간 계좌이체, 체크/신용카드 결제
   * @param prepayType
   */
  _goPrepayCallback: function (prepayType) {
    var url = '/myt-fare/bill/'+ this.$title;
    // prepayType=account (실시간 계좌이체), 그외 : 체크/신용카드 결제
    url += prepayType === 'account' ? '/prepay-account' : '/prepay';
    this._historyService.goLoad(url);
  },
/**
   * @function
   * @desc SK Pay 결제
   */
  _goSKpay: function () {
    this._historyService.goLoad('/myt-fare/bill/'+ this.$title +'/skpay');
  },
  /**
   * @function
   * @desc 선결제
   * @param $layer
   */
  _goPrepay: function ($layer) {
    new Tw.MyTFareBillPrepayPay($layer, this.$title, this._name);
  },
  /**
   * @function
   * @desc 자동선결제 페이지로 이동
   * @param e
   */
  _autoPrepay: function (e) {
    // 20.04.06 OP002-7282 : 미성년자인 경우 에러페이지로 이동
    if(this.$title === 'contents' && this._isAdult !== 'Y') {
      return this._goErrorMinor();
    }

    if (Tw.BrowserHelper.isApp()) {
      this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/auto');
    } else {
      this._goAppInfo(e);
    }
  },
  /**
   * @function
   * @desc 자동선결제 신청자일 경우 변경 및 해지 페이지로 이동
   */
  _autoPrepayInfo: function () {
    this._historyService.goLoad('/myt-fare/bill/' + this.$title + '/auto/info');
  },
  /**
   * @function
   * @desc 소액결제 사용/차단 설정
   * @param event
   */
  _changeUseStatus: function (event) {
    new Tw.MyTFareBillSmallSetUse(this.$container, $(event.target));
  },
  /**
   * @function
   * @desc 소액결제 비밀번호 신청 및 변경
   */
  _setPassword: function () {
    new Tw.MyTFareBillSmallSetPassword(this.$container, this.$setPasswordBtn);
  },
  /**
   * @function
   * @desc 앱 설치 유도 페이지로 이동
   * @param e
   */
  _goAppInfo: function (e) {
    var isAndroid = Tw.BrowserHelper.isAndroid();
    this._popupService.open({
      'hbs': 'open_app_info',
      'isAndroid': isAndroid,
      'cdn': Tw.Environment.cdn
    }, $.proxy(this._onOpenTworld, this), null, null, $(e.currentTarget));
  },
  /**
   * @function
   * @desc 앱 설치 유도 페이지
   * @param $layer
   */
  _onOpenTworld: function ($layer) {
    new Tw.CommonShareAppInstallInfo($layer);
  },
  /**
   * @function
   * @desc 뒤로가기 및 새로고침 체크
   * @returns {boolean}
   */
  _isBackOrReload: function () {
    if (window.performance) {
      if (performance.navigation.type === 1 || performance.navigation.type === 2) {
        return true;
      }
    }
  },
  /**
   * @function
   * @desc 미성년자인경우 사용제한 페이지로 이동
   */
  _goErrorMinor: function() {
    var _error = Tw.MYT_FARE_BILL.ERROR.MINORS_RESTRICTIONS;
    Tw.Error(_error.CODE, _error.MSG).page();
  }
};

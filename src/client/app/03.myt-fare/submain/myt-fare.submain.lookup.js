/**
 * MenuName: 나의 요금 서브메인(조회/신청 서비스 영역)
 * @file myt-fare.submain.lookup.js
 * @author 양정규
 * @since 2020.12.30
 */
Tw.MyTFareSubMainLookup = function (params) {
  this.$container = params.$element;
  this.data = params.data;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this.common = new Tw.MyTFareSubMainCommon(params);
  this._init();
};

Tw.MyTFareSubMainLookup.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._initScroll();
  },

  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    this._contents = this.$container.find('.fe-lookup'); // 컨텐츠 영역
    this._taxTempl = Handlebars.compile( $('#fe-tax-templ').html()); // 세금계산서, 기부금 템플릿
  },

  /**
   * even bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-pause', $.proxy(this._onMovedMobilePause, this));
  },

  /**
   * @function
   * @desc 모바일 일시정지/해제
   */
  _onMovedMobilePause: function (e) {
    e.preventDefault();
    // 유선인 경우, 유선 일지정지 페이지로 이동한다.
    if (this.data.svcInfo.svcAttrCd.indexOf('S') > -1) {
      this._historyService.goLoad('/myt-join/submain/wire/wirestopgo');
      return;
    }

    var pause = this.data.pause;
    var stateMyPaused = pause.myPausedState,
      stateMyLongPaused = pause.myLongPausedState,
      statusUrl = '/myt-join/submain/suspend/status';
    /*
    if ( stateMyPaused && (stateMyPaused.svcStCd === 'AC') && (stateMyPaused.armyDt || stateMyPaused.armyExtDt) ) {
      // [OP002-4773] 장기일시정지 재신청 과정 간소화
      // 장기일시정지 재신청: 군 장기일시정지 중 임시 해제 상태인 경우, 바로 재신청 가능하도록
      this._openResumeSuspendPopup(this.$pauseC);
    }
    else
    */
    if ( stateMyPaused ) {
      if ( stateMyPaused.reservedYn === 'Y' ) {
        // [OP002-1526]
        if ( stateMyPaused.fromDt === '99991231' ) {
          // 2G 장기 미사용 이용정지 화면 진입 불가
          this._popupService.openAlert(Tw.MYT_JOIN_SUSPEND.ERROR.UNUSED_2G_USER);
        } else {
          // 신청현황: 일시정지 예약중
          this._historyService.goLoad(statusUrl);
        }
        return;
      }
      if ( stateMyPaused.state ) {
        // 신청현황: 일시정지 중, 장기일시 중
        this._historyService.goLoad(statusUrl);
        return;
      }
    }
    if ( stateMyLongPaused && stateMyLongPaused.state ) {
      // 장기일시정지 처리완료 상태에서 멈추는 문제 해결 (장기일시정지, 처리완료, 신청일이 오늘 포함 이전이면, 새로 신청가능한 것으로
      if ( stateMyLongPaused.opStateCd !== 'C' || !stateMyLongPaused.stateReleased ) {
        // 신청현황: 일시정지 중, 장기일시 중
        this._historyService.goLoad(statusUrl);
        return;
      }
    }
    // 신청하기: "일시정지/해제"로 이동
    this._historyService.goLoad('/myt-join/submain/suspend#temporary');
    return false;
  },

  // lazyloading 처리
  _initScroll: function () {
    $(window).on('scroll', $.proxy(function () {
      this._checkScroll();
    }, this));
  },

  _checkScroll: function () {
    if ( !this._contents.data('status') && this._elementScrolled(this._contents) ) {
      this._requestTaxContribute();
    }
  },

  _elementScrolled: function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = element.offset().top;
    var isOk = ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
    if (isOk) {
      this._contents.data('status', true);
    }
    return isOk;
  },

  _requestTaxContribute: function () {
    this._apiService.requestArray([
      { command: Tw.SESSION_CMD.BFF_07_0017 },  // 세금계산서 재발행 조회
      { command: Tw.API_CMD.BFF_05_0038 }   // 기부금 내역 조회
    ]).done($.proxy(this._callbackTaxContribute, this))
      .fail($.proxy(this._error, this));
  },

  _callbackTaxContribute: function (tax, contribute) {
    var isTax = tax.result , isContribute = (contribute.result || {}).donationList.length;
    this._contents.append(this._taxTempl({
      isShowData: isTax || isContribute,
      isTax: isTax,
      isContribute: isContribute
    }));
    this._makeEid();
    // new Tw.XtractorService(this.$container);
  },

  /**
   * @function
   * @desc 통계코드 data attr 생성
   * @private
   */
  _makeEid: function () {
    this.common.makeEid()
      .setEid('tax', '56', '77')  // 세금 계산서
      .setEid('donation', '57', '78').build(); // 기부금
  },

  _error: function (res) {
    Tw.Error(res.code, res.msg).pop();
  }

};

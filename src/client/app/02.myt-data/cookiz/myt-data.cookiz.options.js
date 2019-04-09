/**
 * @file myt-data.cookiz.Options.js
 * @desc 충전 권한 변경 내역
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.10
 */

Tw.MyTDataCookizOptions = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this.svcInfo = svcInfo;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataCookizOptions.prototype = {
  _init: function () {
    // this._apiService.request(Tw.API_CMD.BFF_06_0028, { childSvcMgmtNum: '' }).done($.proxy(this._onSuccessReceiveUserInfo, this));
    this._initialAuthList();
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-request-gift', $.proxy(this._getRequestGift, this));
    this.$container.on('click', '.fe-auth-history', $.proxy(this._goToAuthHistory, this));
    this.$container.on('click', '.fe-history-more', $.proxy(this._onShowMoreList, this));
  },

  /**
   * @function
   * @desc 충전 권한 변경 내역 Init
   * @private
   */
  _initialAuthList: function () {
    if ( $('.fe-wrap-history-list li').size() > 20 ) {
      $('.fe-history-more').show();
      this._hideListItem();
    }
  },

  /**
   * @function
   * @desc 충전 권한 변경 내역 더보기 버튼 선택
   * @param e - 이벤트 객체
   * @private
   */
  _onShowMoreList: function (e) {
    var elTarget = $(e.currentTarget);
    var elList = $('.fe-wrap-history-list li');

    if ( elList.not(':visible').size() !== 0 ) {
      elList.not(':visible').slice(0, 20).show();
    }

    if ( elList.not(':visible').size() === 0 ) {
      elTarget.remove();
    }
  },

  /**
   * @function
   * @desc 충전 변경 내역 데이터가 21개 이상인 경우 Hide
   * @private
   */
  _hideListItem: function () {
    $('.fe-wrap-history-list li').slice(20).hide(); //21번째 요소부터 Hide
  },

  /**
   * @function
   * @desc 팅 선물 조르기 버튼 선택
   * @param e - 이벤트 객체
   * @private
   */
  _getRequestGift: function (e) {
    // request Gift by SMS
    var $target = $(e.currentTarget);
    if ( Tw.BrowserHelper.isApp() ) {
      this._popupService.openModalTypeA(
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A18.TITLE,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A18.MSG,
        Tw.ALERT_MSG_MYT_DATA.ALERT_2_A18.BUTTON,
        null,
        $.proxy(this._pesterDetailConfirm, this),
        null,
        null,
        null,
        $target);
    } else {
      this._goAppInfo($target);
    }
  },

  _goAppInfo: function ($target) {
    var isAndroid = Tw.BrowserHelper.isAndroid();
    this._popupService.open({
      'hbs': 'open_app_info',
      'isAndroid': isAndroid,
      'cdn': Tw.Environment.cdn
    }, $.proxy(this._onOpenTworld, this), null, null, $target);
  },

  _onOpenTworld: function ($layer) {
    new Tw.CommonShareAppInstallInfo($layer);
  },

  /**
   * @function
   * @desc 팅 선물 조르기 2_A18 Alert 조르기 선택
   * @private
   */
  _pesterDetailConfirm: function () {
    this._popupService.close();

    var content = Tw.ALERT_MSG_MYT_DATA.TING_PESTER.TITLE +
      Tw.FormatHelper.conTelFormatWithDash(this.svcInfo.svcNum) +
      Tw.ALERT_MSG_MYT_DATA.TING_PESTER.CONTENT +
      Tw.OUTLINK.TWORLD_TING;

    Tw.CommonHelper.share(content); // native에 공유하기 요청
  },

  _goToAuthHistory: function () {
    this._historyService.goLoad('/myt-data/recharge/cookiz/auth');
  },

  /**
   * 쓰이지 않는 코드로 보임 => 당월 충전, 매월 자동 충전 파일에 별도 선언
   */
  _onSuccessRequestGift: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/cookiz/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  }
};
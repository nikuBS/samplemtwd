/**
 * @file t-notify.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.13
 */

/**
 * @class
 * @desc 메뉴 > T알림
 * @constructor
 */
Tw.TNotifyComponent = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._goSetting = false;

  this._evt = undefined;
};

Tw.TNotifyComponent.prototype = {
  /**
   * @member {object}
   * @desc 랜딩타입
   * @readonly
   * @prop {string} INTERNAL 내부 랜딩
   * @prop {string} EXTERNAL 외부 랜딩
   * @prop {string} CHARGE 과금 팝업 외부 랜딩
   */
  LANDING_TYPE: {
    INTERNAL: '01',
    EXTERNAL: '02',
    CHARGE: '04'
  },

  /**
   * @function
   * @desc T알림 레이어 요청
   * @param userId
   * @param evt
   */
  open: function (userId, evt) {
    this._evt = evt;
    this._getPushDate(userId);
  },

  /**
   * @function
   * @desc T알림 레이어 요청
   * @param userId
   * @param evt
   * @param hash
   */
  openWithHash: function (userId, evt, hash) {
    this._evt = evt;
    this._extraHash = hash;
    this._getPushData(userId);
  },

  /**
   * @function
   * @desc T알림 팝업 오픈
   * @param list
   * @private
   */
  _openTNotify: function (list) {
    if ( list.length > 0 ) {
      this._nativeService.send(Tw.NTV_CMD.SAVE, { key: Tw.NTV_STORAGE.LAST_READ_PUSH_SEQ, value: list[0].seq });
    }
    this._popupService.open({
        hbs: 'HO_04_06_01',
        layer: true,
        data: {
          list: list,
          showMore: list.length > Tw.DEFAULT_LIST_COUNT
        }
      },
      $.proxy(this._onOpenTNotify, this),
      $.proxy(this._onCloseTNotify, this),
      this._extraHash ? this._extraHash + '-t-notify' : 't-notify',
      this._evt);
  },

  /**
   * @function
   * @desc T알림 팝업 오픈 콜백
   * @param $popupContainer
   * @private
   */
  _onOpenTNotify: function ($popupContainer) {
    this.$list = $popupContainer.find('.fe-list-item');
    this.$btMore = $popupContainer.find('#fe-bt-more');

    this.$btMore.on('click', $.proxy(this._onClickBtMore, this));
    $popupContainer.on('click', '#fe-bt-go-setting', $.proxy(this._onClickGoSetting, this));
    $popupContainer.on('click', '.fe-bt-link', $.proxy(this._onClickLink, this));
  },

  /**
   * @function
   * @desc T알림 팝업 클로즈 콜백
   * @private
   */
  _onCloseTNotify: function () {
    $('#common-menu').attr('aria-hidden', 'false'); // 웹접근성, menu 부분 aria-hidden을 false로 변경해 줌
    if ( this._goSetting ) {
      this._historyService.goLoad('/main/menu/settings/notification');
    }
  },

  /**
   * @function
   * @desc T알림 리스트 요청
   * @param userId
   * @private
   */
  _getPushData: function (userId) {
    this._apiService.request(Tw.API_CMD.BFF_04_0004, {
      tid: userId
    }).done($.proxy(this._successPushData, this))
      .fail($.proxy(this._failPushData, this));
  },

  /**
   * @function
   * @desc T알림 리스트 응답 처리
   * @param resp
   * @private
   */
  _successPushData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openTNotify(this._parseList(resp.result));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc T알림 리스트 요청 실패 처리
   * @param error
   * @private
   */
  _failPushData: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @fucntion
   * @desc T알림 리스트 파싱
   * @param list
   * @returns {*}
   * @private
   */
  _parseList: function (list) {
    return _.map(list, $.proxy(function (target, index) {
      target.showImage = target.pushType === 'M';
      target.showDate = Tw.DateHelper.getKoreanDateWithDay(target.regDate);
      target.showTime = Tw.DateHelper.getKoreanTime(target.regDate);
      target.isShow = index < Tw.DEFAULT_LIST_COUNT;
      target.hasUrl = !Tw.FormatHelper.isEmpty(target.imgLinkUrl);
      target.isExternal = target.imgLinkUseCl === this.LANDING_TYPE.EXTERNAL || target.imgLinkUseCl === this.LANDING_TYPE.CHARGE;
      return target;
    }, this));
  },

  /**
   * @function
   * @desc 더보기 버튼 click event 처리
   * @private
   */
  _onClickBtMore: function () {
    var $hideList = this.$list.filter('.none');
    var $showList = $hideList.filter(function (index) {
      return index < Tw.DEFAULT_LIST_COUNT;
    });

    $showList.removeClass('none');
    if ( $hideList.length - $showList.length === 0 ) {
      this.$btMore.hide();
    }

  },

  /**
   * @function
   * @desc T알림 랜딩 click event 처리
   * @param $event
   * @private
   */
  _onClickLink: function ($event) {
    var currentTarget = $($event.currentTarget);
    var url = currentTarget.data('link');
    var type = currentTarget.data('link-type');
    if ( !Tw.FormatHelper.isEmpty(url) ) {
      if ( Tw.FormatHelper.isEmpty(type) ) {
        if ( url.indexOf('app.tworld.co.kr') !== -1 ) {
          this._historyService.goLoad(url);
        } else {
          Tw.CommonHelper.openUrlExternal(url);
        }
      } else {
        this._landing(url, type);
      }
    }
  },

  /**
   * @function
   * @desc 랜딩 타입 확인 및 이동
   * @param url
   * @param type
   * @private
   */
  _landing: function (url, type) {
    switch ( type ) {
      case this.LANDING_TYPE.INTERNAL:
        this._historyService.goLoad(url);
        break;
      case this.LANDING_TYPE.EXTERNAL:
        this._goExternalUrl(url);
        break;
      case this.LANDING_TYPE.CHARGE:
        Tw.CommonHelper.showDataCharge($.proxy(this._goExternalUrl, this, url));
        break;
      default:
    }
  },

  /**
   * @function
   * @desc 외부 랜딩
   * @param url
   * @private
   */
  _goExternalUrl: function (url) {
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 설정 페이지 이동 버튼 click event 처리
   * @private
   */
  _onClickGoSetting: function () {
    this._goSetting = true;
    this._popupService.close();
  }
};

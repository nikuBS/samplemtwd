/**
 * @file t-notify.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.12.13
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
  LANDING_TYPE: {
    INTERNAL: '01',
    EXTERNAL: '02',
    CHARGE: '04'
  },
  open: function (userId, evt) {
    this._evt = evt;
    this._getPushDate(userId);
  },
  openWithHash: function (userId, evt, hash) {
    this._evt = evt;
    this._extraHash = hash;
    this._getPushDate(userId);
  },
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
  _onOpenTNotify: function ($popupContainer) {
    this.$list = $popupContainer.find('.fe-list-item');
    this.$btMore = $popupContainer.find('#fe-bt-more');

    this.$btMore.on('click', $.proxy(this._onClickBtMore, this));
    $popupContainer.on('click', '#fe-bt-go-setting', $.proxy(this._onClickGoSetting, this));
    $popupContainer.on('click', '.fe-bt-link', $.proxy(this._onClickLink, this));
  },
  _onCloseTNotify: function () {
    if ( this._goSetting ) {
      this._historyService.goLoad('/main/menu/settings/notification');
    }
  },
  _getPushDate: function (userId) {
    this._apiService.request(Tw.API_CMD.BFF_04_0004, {
      tid: userId
    }).done($.proxy(this._successPushData, this))
      .fail($.proxy(this._failPushData, this));
  },
  _successPushData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openTNotify(this._parseList(resp.result));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failPushData: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },
  _parseList: function (list) {
    return _.map(list, $.proxy(function (target, index) {
      target.showImage = target.pushType === 'M';
      target.showDate = Tw.DateHelper.getKoreanDateWithDay(target.regDate);
      target.showTime = Tw.DateHelper.getKoreanTime(target.regDate);
      target.isShow = index < Tw.DEFAULT_LIST_COUNT;
      target.hasUrl = !Tw.FormatHelper.isEmpty(target.imgLinkUrl);
      return target;
    }, this));
  },
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
  _goExternalUrl: function (url) {
    Tw.CommonHelper.openUrlExternal(url);
  },
  _onClickGoSetting: function () {
    this._goSetting = true;
    this._popupService.close();
  }
};

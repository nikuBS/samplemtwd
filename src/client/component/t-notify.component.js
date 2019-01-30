/**
 * FileName: t-notify.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.12.13
 */
Tw.TNotifyComponent = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

};

Tw.TNotifyComponent.prototype = {
  open: function (userId) {
    this._getPushDate(userId);

  },
  _openTNotify: function (list) {
    this._nativeService.send(Tw.NTV_CMD.SAVE, { key: Tw.NTV_STORAGE.LAST_READ_PUSH_SEQ, value: list[0].seq });
    this._popupService.open({
      hbs: 'HO_04_06_01',
      layer: true,
      data: {
        list: list,
        showMore: list.length > Tw.DEFAULT_LIST_COUNT
      }
    }, $.proxy(this._onOpenTNotify, this), $.proxy(this._onCloseTNotify, this), 't-notify');
  },
  _onOpenTNotify: function ($popupContainer) {
    this.$list = $popupContainer.find('.fe-list-item');
    this.$btMore = $popupContainer.find('#fe-bt-more');

    this.$btMore.on('click', $.proxy(this._onClickBtMore, this));
    $popupContainer.on('click', '.fe-bt-link', $.proxy(this._onClickLink, this));
  },
  _onCloseTNotify: function () {

  },
  _getPushDate: function (userId) {
    this._apiService.request(Tw.API_CMD.BFF_04_0004, {
      tid: userId
    }).done($.proxy(this._successPushData, this));
  },
  _successPushData: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openTNotify(this._parseList(resp.result));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _parseList: function (list) {
    return _.map(list, $.proxy(function (target, index) {
      target.showImage = target.pushType === 'M';
      target.showDate = Tw.DateHelper.getKoreanDateWithDay(target.regDate);
      target.showTime = Tw.DateHelper.getKoreanTime(target.regDate);
      target.isShow = index < Tw.DEFAULT_LIST_COUNT;
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
    var url = $($event.currentTarget).data('link');
    if ( !Tw.FormatHelper.isEmpty(url) ) {
      Tw.CommonHelper.openUrlExternal(url);
    }
  }
};

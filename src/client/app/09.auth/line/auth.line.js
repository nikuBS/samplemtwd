/**
 * FileName: auth.line.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.05
 */

Tw.AuthLine = function (rootEl, nicknamePopup) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nicknamePopup = nicknamePopup;
  this._historyService = new Tw.HistoryService();

  this._changeList = false;

  this.$inputNickname = null;
  this.$showNickname = null;

  this._bindEvent();
};

Tw.AuthLine.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.bt-nickname', $.proxy(this._openNickname, this));
    this.$container.on('click', '#cop-password', $.proxy(this._openCopPassword, this));
    this.$container.on('click', '.bt-more', $.proxy(this._onClickMore, this));
    this.$container.on('change', '.cb-change-first', $.proxy(this._onChangeFirst, this));
  },

  _openNickname: function ($event) {
    var $btNickname = $($event.currentTarget);
    var svcMgntNum = $btNickname.data('svcmgmtnum');
    var $currentLine = $btNickname.parents('.js-show-line');

    this.$inputNickname = $currentLine.find('.input-nickname');
    this.$showNickname = $currentLine.find('.show-nickname');
    this._nicknamePopup.openNickname(svcMgntNum, $.proxy(this._onCloseNickname, this));
  },
  _onCloseNickname: function (nickname) {
    this.$inputNickname.val(nickname);
    this.$showNickname.html(nickname);
  },

  _openCopPassword: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_P01'
    }, $.proxy(this._onOpenCopPassword, this));
  },
  _onOpenCopPassword: function ($layer) {
    $layer.on('click', '.authority-bt', $.proxy(this._confirmCopPassword, this));
  },
  _confirmCopPassword: function () {
    this._popupService.close();
  },
  _onClickMore: function ($event) {
    var $btMore = $($event.currentTarget);
    $btMore.siblings('.widget').removeClass('none');
    $btMore.hide();
  },

  _onChangeFirst: function ($event) {
    var $currentTarget = $($event.currentTarget);
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_AUTH.LINE_A01, null, null,
      $.proxy(this._confirmNotifyPopup, this), $.proxy(this._closeNotifyPopup, this, $currentTarget));
  },
  _confirmNotifyPopup: function () {
    this._popupService.close();
    this._changeList = true;
  },
  _closeNotifyPopup: function ($currentTarget) {
    if ( this._changeList ) {
      var currentSvcMgmtNum = $currentTarget.parents('.js-show-line').data('svcmgmtnum');
      var $remainList = $currentTarget.parents('.js-line-list').find('.js-show-line').filter('[data-svcmgmtnum!=' + currentSvcMgmtNum + ']');
      var changeList = [currentSvcMgmtNum];
      _.map($remainList, $.proxy(function (remainLine) {
        changeList.push($(remainLine).data('svcmgmtnum'));
      }, this));
      this._requestChangeList(changeList);
    }
  },
  _requestChangeList: function (svcNumList) {
    var lineList = svcNumList.join('~');
    this._apiService.request(Tw.API_CMD.BFF_03_0005, { svcCtg: Tw.LINE_NAME.MOBILE, svcMgmtNumArr: lineList })
      .done($.proxy(this._successRegisterLineList, this))
      .fail($.proxy(this._failRegisterLineList, this));
  },
  _successRegisterLineList: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.reload();
    }
  },
  _failRegisterLineList: function (error) {
    Tw.Logger.error(error);
  }

};

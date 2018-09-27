/**
 * FileName: auth.line.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.09.27
 */

Tw.AuthLine = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nicknamePopup = new Tw.NicknameComponent();
  this._historyService = new Tw.HistoryService();

  this._changeList = false;

  this.$inputNickname = null;
  this.$showNickname = null;

  this._bindEvent();
};

Tw.AuthLine.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.fe-bt-nickname', $.proxy(this._openNickname, this));
    // this.$container.on('click', '#cop-password', $.proxy(this._openCopPassword, this));
    this.$container.on('click', '.fe-bt-more', $.proxy(this._onClickMore, this));
    this.$container.on('click', '.fe-change-first', $.proxy(this._onChangeFirst, this));
  },

  _openNickname: function ($event) {
    var $btNickname = $($event.currentTarget);
    var $currentLine = $btNickname.parents('.fe-line');
    var svcMgntNum = $currentLine.data('svcmgmtnum');

    this.$inputNickname = $currentLine.find('.fe-input-nickname');
    this.$showNickname = $currentLine.find('.fe-show-name');
    this._nicknamePopup.openNickname(this.$inputNickname.val(), svcMgntNum, $.proxy(this._onCloseNickname, this));
  },
  _onCloseNickname: function (nickname) {
    this.$inputNickname.val(nickname);
    this.$showNickname.html(nickname);
  },
  _onClickMore: function ($event) {
    var $btMore = $($event.currentTarget);
    $btMore.siblings('.widget').removeClass('none');
    $btMore.hide();
  },

  _onChangeFirst: function ($event) {
    var $currentTarget = $($event.currentTarget);
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.POPUP_CONTENTS.AUTH_L01, null, null,
      $.proxy(this._confirmNotifyPopup, this), $.proxy(this._closeNotifyPopup, this, $currentTarget));
  },
  _confirmNotifyPopup: function () {
    this._popupService.close();
    this._changeList = true;
  },
  _closeNotifyPopup: function ($currentTarget) {
    if ( this._changeList ) {
      var currentSvcMgmtNum = $currentTarget.parents('.fe-line').data('svcmgmtnum');
      var $remainList = $currentTarget.parents('.fe-line-list').find('.fe-line')
        .filter('.none-event').filter('[data-svcmgmtnum!=' + currentSvcMgmtNum + ']');
      var changeList = [currentSvcMgmtNum];
      _.map($remainList, $.proxy(function (remainLine) {
        changeList.push($(remainLine).data('svcmgmtnum'));
      }, this));
      this._requestChangeList(changeList);
    }
  },
  _requestChangeList: function (svcNumList) {
    var lineList = svcNumList.join('~');
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, { svcCtg: Tw.LINE_NAME.MOBILE, svcMgmtNumArr: lineList })
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
  },
  _openCopPassword: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_02'
    }, null, null, 'cop-password');
  }
};

/**
 * FileName: auth.line.edit.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.06
 */

Tw.AuthLineEdit = function (rootEl, category) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._category = category

  this._repSvc = '';

  this._init();
  this._bindEvent();
  this._cachedElement();
};

Tw.AuthLineEdit.prototype = {
  _init: function () {
    skt_landing.dev.sortableInit({
      axis: 'y'
      // change: $.proxy(this._changeSort, this)
    });
  },
  _bindEvent: function () {
    this.$container.on('click', '#bt-guide', $.proxy(this._openGuidePopup, this));
    this.$container.on('click', '#bt-complete', $.proxy(this._completeEdit, this));
  },
  _cachedElement: function () {
    this._repSvc = $(this.$container.find('#sortable-enabled').children()[0]).data('svcmgmtnum');
  },
  _openGuidePopup: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_01_L01'
    });
  },
  _completeEdit: function () {
    var list = this.$container.find('#sortable-enabled').children();
    var svcNumList = [];
    _.map(list, $.proxy(function (line) {
      svcNumList.push($(line).data('svcmgmtnum'));
    }, this));
    this._openRegisterPopup(svcNumList);
  },
  // _changeSort: function ($event, ui) {
  //
  // },
  _openRegisterPopup: function (svcNumList) {
    this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_AUTH.LINE_A22, null, null, $.proxy(this._confirmRegisterPopup, this, svcNumList));
  },
  _confirmRegisterPopup: function (svcNumList) {
    this._popupService.close();
    var lineList = svcNumList.join('~');
    this._apiService.request(Tw.API_CMD.BFF_03_0005, { svcCtg: this._category.toUpperCase(), svcMgmtNumArr: lineList })
      .done($.proxy(this._successRegisterLineList, this))
      .fail($.proxy(this._failRegisterLineList, this));
  },
  _successRegisterLineList: function (resp) {
    if(resp.code === Tw.API_CODE.CODE_00) {
      this._checkRepSvc(resp.result);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _failRegisterLineList: function () {

  },
  _checkRepSvc: function (result) {
    // TODO: 첫번째 회선 변경 오류 체크
    if(result) {
      this._popupService.openAlert(Tw.MSG_AUTH.LINE_A11, null, $.proxy(this._confirmChangeRepSvc, this), $.proxy(this._confirmChangeRepSvc, this));
    } else {
      history.back();
    }
  },
  _confirmChangeRepSvc: function() {
    history.back();
  }
};

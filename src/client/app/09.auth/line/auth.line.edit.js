/**
 * FileName: auth.line.edit.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.06
 */

Tw.AuthLineEdit = function (rootEl, category, lineMarketingLayer) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._category = category;
  this.lineMarketingLayer = lineMarketingLayer;

  this._marketingSvc = '';

  this._init();
  this._bindEvent();
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
    this.$container.on('click', '.bt-remove', $.proxy(this._onClickRemove, this));
    this.$container.on('click', '.bt-add', $.proxy(this._onClickAdd, this));
    this.$list = this.$container.find('.ui-state-default');
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
  _onClickAdd: function ($event) {
    var $target = $($event.currentTarget);
    $target.addClass('bt-remove');
    $target.removeClass('bt-add');

  },
  _onClickRemove: function ($event) {
    var $target = $($event.currentTarget);
    $target.addClass('bt-add');
    $target.removeClass('bt-remove');
    this._popupService.openAlert(Tw.MSG_AUTH.LINE_A21);
  },
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
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      this._checkRepSvc(resp.result);
    } else {
      this._popupService.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _failRegisterLineList: function () {

  },
  _checkRepSvc: function (result) {
    if ( result.repSvcChgYn === 'Y' ) {
      this._popupService.openAlert(Tw.MSG_AUTH.LINE_A11, null, $.proxy(this._confirmChangeRepSvc, this), $.proxy(this._closeChangeRepSvc, this));
    } else {
      this._checkMarketingOffer();
    }
  },
  _confirmChangeRepSvc: function () {
    this._popupService.close();
  },
  _closeChangeRepSvc: function () {
    this._checkMarketingOffer();
  },
  _checkMarketingOffer: function () {
    if ( !Tw.FormatHelper.isEmpty(this._marketingSvc) && this._marketingSvc !== '0' ) {
      var $target = this.$list.filter('[data-svcmgmtnum=' + this._marketingSvc + ']');

      this._apiService.request(Tw.API_CMD.BFF_03_0014, {}, {}, this._marketingSvc)
        .done($.proxy(this._successGetMarketingOffer, this, $target.data('showname'), $target.data('svcnum')))
        .fail($.proxy(this._failGetMargetingOffer, this));

    } else {
      history.back();
    }
  },
  _successGetMarketingOffer: function (showName, svcNum, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.agr201Yn = resp.result.agr201Yn;
      this.agr203Yn = resp.result.agr203Yn;

      if ( resp.result.agr201Yn !== 'Y' && resp.result.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, resp.result.agr201Yn, resp.result.agr203Yn, $.proxy(this._closeMarketingOfferPopup, this));
        }, this), 0);
      } else {
        history.back();
      }
    } else {
      this.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _failGetMargetingOffer: function () {

  },
  _closeMarketingOfferPopup: function () {
    history.back();
  }

};

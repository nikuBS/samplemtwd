/**
 * FileName: common.line.edit.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.01
 */

Tw.CommonLineEdit = function (rootEl, category) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._category = category;
  this.lineMarketingLayer = new Tw.LineMarketingComponent();
  this._historyService = new Tw.HistoryService();

  this._marketingSvc = '';

  this._init();
  this._bindEvent();
};

Tw.CommonLineEdit.prototype = {
  _init: function () {
    skt_landing.dev.sortableInit({
      axis: 'y'
    });
  },
  _bindEvent: function () {
    this.$container.on('click', '#fe-bt-guide', $.proxy(this._openGuidePopup, this));
    this.$container.on('click', '#fe-bt-complete', $.proxy(this._completeEdit, this));
    this.$container.on('click', '.fe-bt-remove', $.proxy(this._onClickRemove, this));
    this.$container.on('click', '.fe-bt-add', $.proxy(this._onClickAdd, this));
  },
  _openGuidePopup: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_04_01',
      layer: true
    }, null, null, 'guide');
  },
  _completeEdit: function () {
    var list = this.$container.find('.fe-item-active');
    var svcNumList = [];
    _.map(list, $.proxy(function (line) {
      svcNumList.push($(line).data('svcmgmtnum'));
    }, this));
    this._openRegisterPopup(svcNumList);
  },
  _onClickAdd: function ($event) {
    var $target = $($event.currentTarget);
    $target.addClass('fe-bt-remove');
    $target.removeClass('fe-bt-add');
    $target.parents('.fe-item').addClass('fe-item-active');

  },
  _onClickRemove: function ($event) {
    var $target = $($event.currentTarget);
    $target.addClass('fe-bt-add');
    $target.removeClass('fe-bt-remove');
    $target.parents('.fe-item').removeClass('fe-item-active');
    this._popupService.openAlert(Tw.ALERT_MSG_AUTH.L03);
  },
  _openRegisterPopup: function (svcNumList) {
    this._popupService.openConfirm(Tw.ALERT_MSG_AUTH.L04, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._onConfirmRegisterPopup, this, svcNumList));
  },
  _onConfirmRegisterPopup: function (svcNumList) {
    this._popupService.close();
    var lineList = svcNumList.join('~');
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, { svcCtg: this._category, svcMgmtNumArr: lineList })
      .done($.proxy(this._successRegisterLineList, this));
  },
  _successRegisterLineList: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');
      this._checkRepSvc(resp.result);
    } else {
      Tw.Error(resp.code, resp.msg).page();
    }
  },
  _checkRepSvc: function (result) {
    if ( result.repSvcChgYn === 'Y' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.L02, null, null, $.proxy(this._onCloseChangeRepSvc, this));
    } else {
      this._checkMarketingOffer();
    }
  },
  _onCloseChangeRepSvc: function () {
    this._checkMarketingOffer();
  },
  _checkMarketingOffer: function () {
    if ( !Tw.FormatHelper.isEmpty(this._marketingSvc) && this._marketingSvc !== '0' ) {
      var list = this.$container.find('.fe-item-active');
      var $target = list.filter('[data-svcmgmtnum=' + this._marketingSvc + ']');

      this._apiService.request(Tw.API_CMD.BFF_03_0014, {}, {}, this._marketingSvc)
        .done($.proxy(this._successGetMarketingOffer, this, $target.data('showname'), $target.data('svcnum')));

    } else {
      this._closeMarketingOfferPopup();
    }
  },
  _successGetMarketingOffer: function (showName, svcNum, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.agr201Yn = resp.result.agr201Yn;
      this.agr203Yn = resp.result.agr203Yn;

      if ( resp.result.agr201Yn !== 'Y' && resp.result.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, resp.result.agr201Yn, resp.result.agr203Yn, $.proxy(this._onCloseMarketingOfferPopup, this));
        }, this), 0);
      } else {
        this._closeMarketingOfferPopup();
      }
    } else {
      Tw.Error(resp.code, resp.msg).page();
    }
  },
  _closeMarketingOfferPopup: function () {
    this._historyService.goBack();
  },
  _onCloseMarketingOfferPopup: function () {
    this._closeMarketingOfferPopup();
  }

};

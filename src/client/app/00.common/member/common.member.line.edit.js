/**
 * FileName: common.member.line.edit.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.01
 */

Tw.CommonMemberLineEdit = function (rootEl, category, otherCnt) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._category = category;
  this.lineMarketingLayer = new Tw.LineMarketingComponent();
  this._historyService = new Tw.HistoryService();

  this._marketingSvc = '';
  this._goBizRegister = false;
  this._pageNoExposable = 2;
  this._pageNoExposed = 2;
  this._otherCnt = +otherCnt;

  this._init();
  this._bindEvent();
};

Tw.CommonMemberLineEdit.prototype = {
  _init: function () {
    skt_landing.dev.sortableInit({
      axis: 'y',
      update: $.proxy(this._onUpdateDnd, this)
    });
  },
  _bindEvent: function () {
    this.$usedTxt = this.$container.find('#fe-txt-used');
    this.$unusedTxt = this.$container.find('#fe-txt-unused');
    this.$btMoreExposable = this.$container.find('#fe-bt-more-exposable');
    this.$btMoreExposed = this.$container.find('#fe-bt-more-exposed');
    this.$exposedList = this.$container.find('.fe-item-active');

    this.$container.on('click', '#fe-bt-guide', $.proxy(this._openGuidePopup, this));
    this.$container.find('#fe-bt-complete').click(_.debounce($.proxy(this._completeEdit, this), 500));
    this.$container.on('click', '.fe-bt-remove', $.proxy(this._onClickRemove, this));
    this.$container.on('click', '.fe-bt-add', $.proxy(this._onClickAdd, this));

    this.$btMoreExposable.on('click', $.proxy(this._onClickMoreExposable, this));
    this.$btMoreExposed.on('click', $.proxy(this._onClickMoreExposed, this));
  },
  _openGuidePopup: function ($event) {
    var $target = $($event.currentTarget);
    this._popupService.open({
      hbs: 'CO_01_05_02_04_01',
      layer: true
    }, $.proxy(this._onOpenEditGuide, this), null, 'guide', $target);
  },
  _onOpenEditGuide: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-biz-register', $.proxy(this._onClickBizRegister, this));
    $popupContainer.on('click', '#fe-bt-biz-signup', $.proxy(this._onClickBizSignup, this));
  },
  _onUpdateDnd: function () {

  },
  _onClickBizRegister: function () {
    this._historyService.replaceURL('/common/member/line/biz-register');
  },
  _onClickBizSignup: function ($event) {
    var $target = $($event.currentTarget);
    this._popupService.open({
      hbs: 'CO_01_05_02_02',
      layer: true
    }, $.proxy(this._onOpenBizSignup, this), null, 'biz-password', $target);
  },
  _onOpenBizSignup: function ($popupContainer) {
    $popupContainer.on('click', '#fe-bt-go-url', $.proxy(this._goUrl, this));
  },
  _goUrl: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  },
  _completeEdit: function ($event) {
    var $target = $($event.currentTarget);
    var list = this.$container.find('.fe-item-active');
    var svcNumList = [];
    _.map(list, $.proxy(function (line) {
      svcNumList.push($(line).data('svcmgmtnum'));
    }, this));
    this._openRegisterPopup(svcNumList, $event);
  },
  _onClickAdd: function ($event) {
    var $target = $($event.currentTarget);
    $target.addClass('fe-bt-remove');
    $target.removeClass('fe-bt-add');
    $target.parents('.fe-item').addClass('fe-item-active');
    $target.parents('.fe-item').removeClass('fe-item-inactive');
    this._resetCount();

  },
  _onClickRemove: function ($event) {
    var $target = $($event.currentTarget);
    $target.addClass('fe-bt-add');
    $target.removeClass('fe-bt-remove');
    $target.parents('.fe-item').removeClass('fe-item-active');
    $target.parents('.fe-item').addClass('fe-item-inactive');
    this._resetCount();

    var svcGr = $target.parents('.fe-item').data('svcgr');
    if ( svcGr === 'R' || svcGr === 'D' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.L03, null, null, null, null, $target);
    }
  },
  _resetCount: function () {
    this.$usedTxt.text(this.$container.find('.fe-item-active').length);
    this.$unusedTxt.text(this.$container.find('.fe-item-inactive').length);
  },
  _openRegisterPopup: function (svcNumList, $target) {
    this._popupService.openConfirm(Tw.ALERT_MSG_AUTH.L04, Tw.POPUP_TITLE.NOTIFY,
      $.proxy(this._onConfirmRegisterPopup, this, svcNumList, $target), null, $target);
  },
  _onConfirmRegisterPopup: function (svcNumList, $target) {
    this._popupService.close();
    var lineList = svcNumList.join('~');
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, {
      params: { svcCtg: this._category, svcMgmtNumArr: lineList }
    }).done($.proxy(this._successRegisterLineList, this, svcNumList, $target));
  },
  _successRegisterLineList: function (svcNumList, $target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      // Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');
      this._checkRepSvc(resp.result, svcNumList, $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _checkRepSvc: function (result, svcNumList, $target) {
    if ( svcNumList.length === 0 && this._otherCnt === 0 ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.L02_1, null, null, $.proxy(this._onCloseChangeRepSvc, this), null, $target);
    } else if ( result.repSvcChgYn === 'Y' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.L02, null, null, $.proxy(this._onCloseChangeRepSvc, this), null, $target);
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
      if ( $target.length > 0 ) {
        this._apiService.request(Tw.API_CMD.BFF_03_0014, {}, {}, [this._marketingSvc])
          .done($.proxy(this._successGetMarketingOffer, this, $target.data('showname'), $target.data('svcnum')));
      } else {
        this._closeMarketingOfferPopup();
      }
    } else {
      this._closeMarketingOfferPopup();
    }
  },
  _successGetMarketingOffer: function (showName, svcNum, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.agr201Yn = resp.result.agr201Yn;
      this.agr203Yn = resp.result.agr203Yn;

      if ( this.agr201Yn !== 'Y' || this.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, this.agr201Yn, this.agr203Yn, $.proxy(this._onCloseMarketingOfferPopup, this));
        }, this), 0);
      } else {
        this._closeMarketingOfferPopup();
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _closeMarketingOfferPopup: function () {
    this._historyService.goBack();
  },
  _onCloseMarketingOfferPopup: function () {
    this._closeMarketingOfferPopup();
  },
  _onClickMoreExposable: function ($event) {
    var $target = $($event.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_03_0029, {
      pageNo: this._pageNoExposable,
      pageSize: Tw.DEFAULT_LIST_COUNT,
      svcCtg: this._category
    }).done($.proxy(this._successMoreExposable, this, $target));
  },
  _onClickMoreExposed: function () {
    var $hideList = this.$exposedList.filter('.none');
    var $showList = $hideList.filter(function (index) {
      return index < Tw.DEFAULT_LIST_COUNT;
    });
    var remainCnt = $hideList.length - $showList.length;
    $showList.removeClass('none');
    if ( remainCnt === 0 ) {
      this.$btMoreExposed.hide();
    }
  },
  _successMoreExposable: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._pageNoExposed * Tw.DEFAULT_LIST_COUNT >= resp.result[this._category + 'Cnt'] ) {
        this.$btMoreExposable.hide();
      }
      this._pageNoExposable = this._pageNoExposable + 1;
      this._addExposableList(resp.result[this._category]);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _addExposableList: function (list) {
    var $list = this.$container.find('.fe-list-exposable');
    var $lineTemp = $('#fe-line-exposable-tmpl');
    var tplLine = Handlebars.compile($lineTemp.html());
    $list.append(tplLine({ list: this._parseLineData(list) }));
  },
  _parseLineData: function (list) {
    _.map(list, $.proxy(function (line) {
      line.showName = Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm;
      line.showDetail = this._category === Tw.LINE_NAME.MOBILE ? Tw.FormatHelper.conTelFormatWithDash(line.svcNum) :
        line.svcAttrCd === Tw.SVC_ATTR_E.TELEPHONE ? Tw.FormatHelper.conTelFormatWithDash(line.svcNum) : line.addr;
    }, this));

    return list;
  }
};
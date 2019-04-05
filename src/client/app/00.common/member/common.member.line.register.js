/**
 * @file line-register.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.01
 */

Tw.CommonMemberLineRegister = function ($container, landing) {
  this.$container = $container;
  this._landing = landing;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.lineMarketingLayer = new Tw.LineMarketingComponent();
  this._historyService = new Tw.HistoryService();

  this._registerLength = 0;
  this._pageNo = 1;
  this._marketingSvc = '';
  this._goAuth = false;

  this.$btnRegister = null;
  this.$childChecks = null;
  this.$allCheck = null;
  this.$list = null;
  this.$btMore = null;

  this._bindEvent();
};

Tw.CommonMemberLineRegister.prototype = {
  _bindEvent: function () {
    this.$btnRegister = this.$container.find('#fe-bt-complete');
    this.$childChecks = this.$container.find('.fe-check-child');
    this.$allCheck = this.$container.find('#fe-check-all');
    this.$list = this.$container.find('.fe-item');
    this.$btMore = this.$container.find('#fe-bt-more');
    this.$lineList = this.$container.find('#fe-list-line');

    this.$btnRegister.on('click', $.proxy(this._onClickRegister, this));
    this.$childChecks.on('change', $.proxy(this._onClickChildCheck, this));
    this.$allCheck.on('change', $.proxy(this._onClickAllCheck, this));
    this.$btMore.on('click', $.proxy(this._onClickMore, this));

    this.$container.on('click', '#fe-bt-close', $.proxy(this._onClosePage, this));
  },
  _parseLineInfo: function (lineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    var list = [];
    _.map(category, $.proxy(function (line) {
      if ( !Tw.FormatHelper.isEmpty(lineList[Tw.LINE_NAME[line]]) ) {
        list = list.concat(this._convLineData(lineList[Tw.LINE_NAME[line]], Tw.LINE_NAME[line]));
      }
    }, this));
    return list;
  },

  _convLineData: function (lineData, type) {
    Tw.FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    var result = [];
    _.map(lineData, $.proxy(function (line) {
      line.showSvcAttrCd = Tw.SVC_ATTR[line.svcAttrCd];
      line.showSvcScrbDtm = Tw.DateHelper.getShortDateNoDot(line.svcScrbDt);
      line.showName = Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm;
      line.showPet = type === Tw.LINE_NAME.MOBILE;
      line.showDetail = type === Tw.LINE_NAME.MOBILE ? Tw.FormatHelper.conTelFormatWithDash(line.svcNum) :
        line.svcAttrCd === Tw.SVC_ATTR_E.TELEPHONE ? Tw.FormatHelper.conTelFormatWithDash(line.svcNum) : line.addr;
      result.push(line);
    }, this));

    return result;
  },
  _onClickAllCheck: function ($event) {
    var $currentTarget = $($event.currentTarget);
    if ( $currentTarget.is(':checked') ) {
      this._checkElement(this.$childChecks);
    } else {
      this._uncheckElement(this.$childChecks.not('.none'));
    }
    this._enableBtns();

  },
  _onClickChildCheck: function () {
    this._checkAll();
    this._enableBtns();
  },
  _onClickRegister: function ($event) {
    var $target = $($event.currentTarget);
    $event.preventDefault();
    $event.stopPropagation();

    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done($.proxy(this._successAllSvc, this, $target));
  },
  _successAllSvc: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var $selected = this.$childChecks.filter(':checked').parent();
      var svcNumList = this._getExposedSvcNumList(resp.result);
      _.map($selected, $.proxy(function (checkbox) {
        svcNumList.push($(checkbox).data('svcmgmtnum'));
      }, this));
      this._registerLineList(svcNumList.join('~'), svcNumList.length, $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _getExposedSvcNumList: function (lineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    var list = [];
    _.map(category, $.proxy(function (line) {
      var curLine = lineList[Tw.LINE_NAME[line]];
      if ( !Tw.FormatHelper.isEmpty(curLine) ) {
        _.map(curLine, $.proxy(function (target) {
          list.push(target.svcMgmtNum);
        }, this));
      }
    }, this));
    return list;
  },
  _onClickMore: function ($event) {
    var $target = $($event.currentTarget);
    this._apiService.request(Tw.API_CMD.BFF_03_0029, {
      svcCtg: Tw.LINE_NAME.All,
      pageSize: Tw.DEFAULT_LIST_COUNT,
      pageNo: this._pageNo
    }).done($.proxy(this._successMoreExposable, this, $target));
  },
  _successMoreExposable: function ($target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._pageNo * Tw.DEFAULT_LIST_COUNT >= resp.result.totalCnt ) {
        this.$btMore.hide();
      }
      this._pageNo = this._pageNo + 1;
      this._addList(resp.result);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _addList: function (list) {
    var tplLine = Handlebars.compile(Tw.LINE_RESITTER_TMPL);
    this.$lineList.append(tplLine({ list: this._parseLineInfo(list) }));
  },
  _checkElement: function ($element) {
    $element.prop('checked', true);
    $element.parent().addClass('checked');
    $element.parent().attr('aria-checked', true);
  },
  _uncheckElement: function ($element) {
    $element.prop('checked', false);
    $element.parent().removeClass('checked');
    $element.parent().attr('aria-checked', false);
  },
  _checkAll: function () {
    var allLength = this.$childChecks.length;
    var selectedLength = this.$childChecks.filter(':checked').length;
    if ( allLength === selectedLength ) {
      this._checkElement(this.$allCheck);
    } else {
      this._uncheckElement(this.$allCheck);
    }
  },
  _enableBtns: function () {
    var selectedLength = this.$childChecks.filter(':checked').length;
    if ( selectedLength === 0 ) {
      this.$btnRegister.attr('disabled', true);
    } else {
      this.$btnRegister.attr('disabled', false);
    }
  },
  _registerLineList: function (lineList, length, $target) {
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, {
      params: { svcCtg: Tw.LINE_NAME.ALL, svcMgmtNumArr: lineList }
    }).done($.proxy(this._successRegisterLineList, this, length, $target))
      .fail($.proxy(this._failRegisterLineList, this, $target));
  },
  _successRegisterLineList: function (registerLength, $target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._registerLength = registerLength;
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      if ( this._registerLength > 0 ) {
        this._openCompletePopup($target);
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _failRegisterLineList: function ($target, error) {
    Tw.Error(error.code, error.msg).pop(null, $target);
  },
  _openCompletePopup: function ($target) {
    this._popupService.open({
      hbs: 'CO_01_02_04_03',
      layer: true,
      data: {
        registerLength: this._registerLength
      }
    }, $.proxy(this._onOpenCompletePopup, this, $target), $.proxy(this._onCloseCompletePopup, this), 'line-complete', $target);
  },
  _onOpenCompletePopup: function ($target, $layer) {
    $layer.on('click', '#fe-bt-home', $.proxy(this._goHome, this));
    $layer.on('click', '#fe-bt-line', $.proxy(this._goAuthLine, this));

    this._openMarketingOfferPopup($target);
  },
  _openMarketingOfferPopup: function () {
    if ( !Tw.FormatHelper.isEmpty(this._marketingSvc) && this._marketingSvc !== '0' ) {
      var $target = this.$list.filter('[data-svcmgmtnum=' + this._marketingSvc + ']');

      this._apiService.request(Tw.API_CMD.BFF_03_0014, {}, {}, [this._marketingSvc])
        .done($.proxy(this._successGetMarketingOffer, this, $target.data('showname'), $target.data('svcnum'), $target))
        .fail($.proxy(this._failGetMarketingOffer, this));
    }
  },
  _successGetMarketingOffer: function (showName, svcNum, $target, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.agr201Yn !== 'Y' && resp.result.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, resp.result.agr201Yn, resp.result.agr203Yn, $.proxy(this._onCloseMarketingOfferPopup, this));
        }, this), 0);
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },
  _failGetMarketingOffer: function () {

  },
  _closeCompletePopup: function () {
    this._popupService.close();
  },
  _goHome: function () {
    this._goHomeFlag = true;
    this._popupService.close();
  },
  _goAuthLine: function () {
    this._goAuthFlag = true;
    this._popupService.close();
  },
  _onCloseMarketingOfferPopup: function () {
    this._closeCompletePopup();
  },
  _onCloseCompletePopup: function () {
    if ( this._goHomeFlag ) {
      this._historyService.replaceURL('/main/home');
    } else if ( this._goAuthFlag ) {
      this._historyService.replaceURL('/common/member/line');
    } else if ( this._registerLength > 0 ) {
      this._historyService.goBack();
    }
  },
  _onClosePage: function () {
    if ( Tw.BrowserHelper.isIosChrome() && this._landing !== 'none' ) {
      this._historyService.replaceURL(this._landing);
    } else {
      this._historyService.goBack();
    }
  }
};

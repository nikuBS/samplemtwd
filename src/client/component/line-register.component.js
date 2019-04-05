/**
 * @file line-register.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.01
 */

Tw.LineRegisterComponent = function () {
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
};

Tw.LineRegisterComponent.prototype = {
  openRegisterLinePopup: function (type) {
    this._getLineInfo(type);
  },
  _getLineInfo: function (type) {
    this._apiService.request(Tw.API_CMD.BFF_03_0029, {
      svcCtg: Tw.LINE_NAME.All,
      pageSize: Tw.DEFAULT_LIST_COUNT,
      pageNo: this._pageNo
    }).done($.proxy(this._successGetLineInfo, this, type));
  },
  _successGetLineInfo: function (type, exposable) {
    if ( exposable.code === Tw.API_CODE.CODE_00 ) {
      this._pageNo = this._pageNo + 1;
      this._openRegisterLine(this._parseLineInfo(exposable.result), type, exposable.result.totalCnt);
    } else {
      Tw.Error(exposable.code, exposable.msg).pop();
    }
  },
  _failGetLineInfo: function (error) {
    Tw.Error(error.code, error.msg).pop();
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
  _openRegisterLine: function (data, type, totalCnt) {
    if ( totalCnt > 0 ) {
      this._popupService.open({
        hbs: 'CO_01_02_04_01',
        layer: true,
        new_customer: type === Tw.LOGIN_NOTICE_TYPE.NEW_CUSTOMER,
        list_length: totalCnt,
        bt_more: totalCnt > Tw.DEFAULT_LIST_COUNT,
        data: data
      }, $.proxy(this._onOpenRegisterLine, this), $.proxy(this._onCloseRegisterLine, this), 'line-register');
    } else {
      Tw.Logger.info('[LineRegister] Empty');
    }
  },
  _onOpenRegisterLine: function ($layer) {
    this._bindEvent($layer);
  },
  _bindEvent: function ($layer) {
    this.$btnRegister = $layer.find('#fe-bt-complete');
    this.$childChecks = $layer.find('.fe-check-child');
    this.$allCheck = $layer.find('#fe-check-all');
    this.$list = $layer.find('.fe-item');
    this.$btMore = $layer.find('#fe-bt-more');
    this.$lineList = $layer.find('#fe-list-line');

    this.$btnRegister.on('click', $.proxy(this._onClickRegister, this));
    this.$childChecks.on('change', $.proxy(this._onClickChildCheck, this));
    this.$allCheck.on('change', $.proxy(this._onClickAllCheck, this));
    this.$btMore.on('click', $.proxy(this._onClickMore, this));
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
    $event.stopPropagation();

    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done($.proxy(this._successAllSvc, this));
  },
  _successAllSvc: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      var $selected = this.$childChecks.filter(':checked').parent();
      var svcNumList = this._getExposedSvcNumList(resp.result);
      _.map($selected, $.proxy(function (checkbox) {
        svcNumList.push($(checkbox).data('svcmgmtnum'));
      }, this));
      this._registerLineList(svcNumList.join('~'), svcNumList.length);
    } else {
      Tw.Error(resp.code, resp.msg);
    }
  },
  _getExposedSvcNumList: function(lineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    var list = [];
    _.map(category, $.proxy(function (line) {
      var curLine = lineList[Tw.LINE_NAME[line]];
      if ( !Tw.FormatHelper.isEmpty(curLine) ) {
        _.map(curLine, $.proxy(function(target) {
          list.push(target.svcMgmtNum);
        }, this));
      }
    }, this));
    return list;
  },
  _onClickMore: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0029, {
      svcCtg: Tw.LINE_NAME.All,
      pageSize: Tw.DEFAULT_LIST_COUNT,
      pageNo: this._pageNo
    }).done($.proxy(this._successMoreExposable, this));
  },
  _successMoreExposable: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( this._pageNo * Tw.DEFAULT_LIST_COUNT >= resp.result.totalCnt ) {
        this.$btMore.hide();
      }
      this._pageNo = this._pageNo + 1;
      this._addList(resp.result);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
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
  _registerLineList: function (lineList, length) {
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, {
      params: { svcCtg: Tw.LINE_NAME.ALL, svcMgmtNumArr: lineList }
    }).done($.proxy(this._successRegisterLineList, this, length))
      .fail($.proxy(this._failRegisterLineList, this));
  },
  _successRegisterLineList: function (registerLength, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._registerLength = registerLength;
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      this._popupService.close();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failRegisterLineList: function (error) {
    Tw.Error(error.code, error.msg).pop();
  },
  _onCloseRegisterLine: function () {
    if ( this._registerLength > 0 ) {
      this._openCompletePopup();
    }
  },
  _openCompletePopup: function () {
    this._popupService.open({
      hbs: 'CO_01_02_04_03',
      layer: true,
      data: {
        registerLength: this._registerLength
      }
    }, $.proxy(this._onOpenCompletePopup, this), $.proxy(this._onCloseCompletePopup, this), 'line-complete');
  },
  _onOpenCompletePopup: function ($layer) {
    $layer.on('click', '#fe-bt-home', $.proxy(this._closeCompletePopup, this));
    $layer.on('click', '#fe-bt-line', $.proxy(this._goAuthLine, this));

    this._openMarketingOfferPopup();
  },
  _openMarketingOfferPopup: function () {
    if ( !Tw.FormatHelper.isEmpty(this._marketingSvc) && this._marketingSvc !== '0' ) {
      var $target = this.$list.filter('[data-svcmgmtnum=' + this._marketingSvc + ']');

      this._apiService.request(Tw.API_CMD.BFF_03_0014, {}, {}, [this._marketingSvc])
        .done($.proxy(this._successGetMarketingOffer, this, $target.data('showname'), $target.data('svcnum')))
        .fail($.proxy(this._failGetMarketingOffer, this));
    }
  },
  _successGetMarketingOffer: function (showName, svcNum, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.agr201Yn !== 'Y' && resp.result.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, resp.result.agr201Yn, resp.result.agr203Yn, $.proxy(this._onCloseMarketingOfferPopup, this));
        }, this), 0);
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failGetMarketingOffer: function () {

  },
  _closeCompletePopup: function () {
    this._popupService.close();
  },
  _goAuthLine: function () {
    this._goAuth = true;
    this._popupService.close();
  },
  _onCloseMarketingOfferPopup: function () {
    this._closeCompletePopup();
  },
  _onCloseCompletePopup: function () {
    if ( this._goAuth ) {
      // Tw.CommonHelper.setLocalStorage(Tw.LSTORE_KEY.LINE_REFRESH, 'Y');
      this._historyService.goLoad('/common/member/line');
    } else if ( this._registerLength > 0 ) {
      this._historyService.reload();
    }
  }
};

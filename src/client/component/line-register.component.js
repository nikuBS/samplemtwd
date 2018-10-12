/**
 * FileName: line-register.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.10.01
 */

Tw.LineRegisterComponent = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.lineMarketingLayer = new Tw.LineMarketingComponent();
  this._historyService = new Tw.HistoryService();

  this._registerLength = 0;
  this._listLength = 0;
  this._marketingSvc = '';
  this._goAuth = false;

  this.$btnRegister = null;
  this.$childChecks = null;
  this.$allCheck = null;
  this.$list = null;
};

Tw.LineRegisterComponent.prototype = {
  openRegisterLinePopup: function (type) {
    this._getLineInfo(type);
  },
  _getLineInfo: function (type) {
    this._apiService.request(Tw.API_CMD.BFF_03_0004, {})
      .done($.proxy(this._successGetLineInfo, this, type))
      .fail($.proxy(this._failGetLineInfo, this));
  },
  _successGetLineInfo: function (type, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._openRegisterLine(this._parseLineInfo(resp.result), type);
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failGetLineInfo: function (error) {
    console.log(error);
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
      line.showAddr = type === Tw.LINE_NAME.INTERNET_PHONE_IPTV;
      line.showPet = type === Tw.LINE_NAME.MOBILE;
      line.isRegister = line.expsYn === 'Y';
      result.push(line);
      if ( line.expsYn === 'N' ) {
        this._listLength++;
      }
    }, this));
    return result;
  },
  _openRegisterLine: function (data, type) {
    if ( this._listLength > 0 ) {
      this._popupService.open({
        hbs: 'CO_01_02_04_01',
        layer: true,
        new_customer: type === Tw.LOGIN_NOTICE_TYPE.NEW_CUSTOMER,
        list_length: this._listLength,
        data: data
      }, $.proxy(this._onOpenRegisterLine, this), $.proxy(this._onCloseRegisterLine, this), 'line-register');
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

    this.$btnRegister.on('click', $.proxy(this._onClickRegister, this));
    this.$childChecks.on('change', $.proxy(this._onClickChildCheck, this));
    this.$allCheck.on('change', $.proxy(this._onClickAllCheck, this));
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

    var $selected = this.$childChecks.filter(':checked').parent();
    var svcNumList = [];
    _.map($selected, $.proxy(function (checkbox) {
      svcNumList.push($(checkbox).data('svcmgmtnum'));
    }, this));
    this._registerLineList(svcNumList.join('~'), svcNumList.length);
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
    console.log('selected', selectedLength);
    if ( selectedLength === 0 ) {
      this.$btnRegister.attr('disabled', true);
    } else {
      this.$btnRegister.attr('disabled', false);
    }
  },
  _registerLineList: function (lineList, length) {
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, { svcCtg: Tw.LINE_NAME.ALL, svcMgmtNumArr: lineList })
      .done($.proxy(this._successRegisterLineList, this, length))
      .fail($.proxy(this._failRegisterLineList, this));
  },
  _successRegisterLineList: function (registerLength, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._registerLength = registerLength;
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      this._popupService.close();
    } else {
      // this._popupService.close();
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failRegisterLineList: function (error) {
    console.log(error);
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

      this._apiService.request(Tw.API_CMD.BFF_03_0014, {}, {}, this._marketingSvc)
        .done($.proxy(this._successGetMarketingOffer, this, $target.data('showname'), $target.data('svcnum')))
        .fail($.proxy(this._failGetMargetingOffer, this));
    }
  },
  _successGetMarketingOffer: function (showName, svcNum, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( resp.result.agr201Yn !== 'Y' && resp.result.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, resp.result.agr201Yn, resp.result.agr203Yn);
        }, this), 0);
      } else {
        this._historyService.goBack();
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failGetMargetingOffer: function () {

  },
  _closeCompletePopup: function () {
    this._popupService.close();

  },
  _goAuthLine: function () {
    this._goAuth = true;
    this._popupService.close();
  },
  _onCloseCompletePopup: function () {
    console.log('close');
    if ( this._goAuth ) {
      this._historyService.goLoad('/auth/line');
    }
  }
};

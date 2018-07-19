/**
 * FileName: auth.line.register.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.11
 */

Tw.AuthLineRegister = function (lineMarketingLayer) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.lineMarketingLayer = lineMarketingLayer;

  this._registerLength = 0;
  this._marketingSvc = '';

  this.$btnCancel = null;
  this.$btnRegister = null;
  this.$childChecks = null;
  this.$allCheck = null;
  this.$list = null;
};

Tw.AuthLineRegister.prototype = {
  openRegisterLinePopup: function (type) {
    this._getLineInfo(type);
  },
  _getLineInfo: function (type) {
    // $.ajax('mock/auth.line.json')
    //   .done($.proxy(this._successGetLineInfo, this, type))
    //   .fail($.proxy(this._failGetLineInfo, this));
    this._apiService.request(Tw.API_CMD.BFF_03_0004, {})
      .done($.proxy(this._successGetLineInfo, this, type))
      .fail($.proxy(this._failGetLineInfo, this));
  },
  _successGetLineInfo: function (type, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if ( type === Tw.LOGIN_NOTICE_TYPE.NEW_CUSTOMER ) {
        this._openNewRegisterLine(this._parseLineInfo(resp.result));
      } else if ( type === Tw.LOGIN_NOTICE_TYPE.EXIST_CUSTOMER || type === Tw.LOGIN_NOTICE_TYPE.NEW_LINE ) {
        this._openExistRegisterLine(this._parseLineInfo(resp.result));
      }
    }
  },
  _failGetLineInfo: function (error) {
    console.log(error);
  },
  _parseLineInfo: function (lineList) {
    var category = ['MOBILE', 'INTERNET_PHONE_IPTV', 'SECURITY'];
    _.map(category, $.proxy(function (line) {
      if ( !Tw.FormatHelper.isEmpty(lineList[Tw.LINE_NAME[line].toLowerCase()]) ) {
        this._convLineData(lineList[Tw.LINE_NAME[line].toLowerCase()]);
      }
    }, this));
    return lineList;
  },

  _convLineData: function (lineData) {
    Tw.FormatHelper.sortObjArrAsc(lineData, 'expsSeq');
    _.map(lineData, $.proxy(function (line) {
      line.showSvcAttrCd = Tw.SVC_ATTR[line.svcAttrCd];
      line.showSvcScrbDtm = Tw.DateHelper.getShortDateNoDot(line.svcScrbDt);
      line.showName = Tw.FormatHelper.isEmpty(line.nickNm) ? Tw.SVC_ATTR[line.svcAttrCd] : line.nickNm;
      line.isShow = line.expsYn === 'N';
    }, this));
  },
  // 회선등록 신규회원
  _openNewRegisterLine: function (data) {
    this._popupService.open({
      hbs: 'CO_01_02_04_P01',
      data: data
    }, $.proxy(this._onOpenNewRegisterLine, this), $.proxy(this._onCloseNewRegisterLine, this));
  },

  // 회선등록 기존회원
  _openExistRegisterLine: function (data) {
    this._popupService.open({
      hbs: 'CO_01_02_04_P02',
      data: data
    }, $.proxy(this._onOpenExistRegisterLine, this), $.proxy(this._onCloseExistRegisterLine, this));
  },
  _onOpenNewRegisterLine: function ($layer) {
    this._bindEvent($layer);
  },
  _onOpenExistRegisterLine: function ($layer) {
    this._bindEvent($layer);
  },
  _bindEvent: function ($layer) {
    $layer.on('change', '#all-check', $.proxy(this._onClickAllCheck, this));
    $layer.on('change', '.child-check', $.proxy(this._onClickChildCheck, this));
    $layer.on('click', '.indiv-small', $.proxy(this._onClickCancel, this));
    $layer.on('click', '.indiv-big', $.proxy(this._onClickRegister, this));

    this.$btnCancel = $layer.find('.indiv-small');
    this.$btnRegister = $layer.find('.indiv-big');
    this.$childChecks = $layer.find('.child-check');
    this.$allCheck = $layer.find('#all-check');
    this.$list = $layer.find('.checkbox', '.type01');
  },
  _onClickAllCheck: function ($event) {
    var $currentTarget = $($event.currentTarget);
    if ( $currentTarget.is(':checked') ) {
      this._checkElement(this.$childChecks);
    } else {
      this._uncheckElement(this.$childChecks);
    }
    this._enableBtns();

  },
  _onClickChildCheck: function () {
    this._checkAll();
    this._enableBtns();
  },
  _onClickCancel: function () {
    this._uncheckElement(this.$childChecks);
    this._uncheckElement(this.$allCheck);
    this._enableBtns();
  },
  _onClickRegister: function () {
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
    if ( selectedLength === 0 ) {
      this.$btnCancel.attr('disabled', true);
      this.$btnRegister.attr('disabled', true);
    } else {
      this.$btnCancel.attr('disabled', false);
      this.$btnRegister.attr('disabled', false);
    }
  },
  _registerLineList: function (lineList, length) {
    this._apiService.request(Tw.API_CMD.BFF_03_0005, { svcCtg: Tw.LINE_NAME.ALL, svcMgmtNumArr: lineList })
      .done($.proxy(this._successRegisterLineList, this, length))
      .fail($.proxy(this._failRegisterLineList, this));
  },
  _successRegisterLineList: function (registerLength, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._registerLength = registerLength;
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      this._popupService.close();
    } else {
      this._popupService.close();
    }
  },
  _failRegisterLineList: function (error) {
    console.log(error);
  },
  _onCloseNewRegisterLine: function () {
    if ( this._registerLength > 0 ) {
      this._openCompletePopup();
    }
  },
  _onCloseExistRegisterLine: function () {
    if ( this._registerLength > 0 ) {
      this._openCompletePopup();
    }
  },
  _openCompletePopup: function () {
    this._popupService.open({
      hbs: 'CO_01_02_04_P03',
      data: {
        registerLength: this._registerLength
      }
    }, $.proxy(this._onOpenCompletePopup, this));
  },
  _onOpenCompletePopup: function ($layer) {
    $layer.on('click', '.bt-link-tx', $.proxy(this._closeCompletePopup, this));
    $layer.on('click', '#bt-line-edit', $.proxy(this._goAuthLine, this));

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
      this.agr201Yn = resp.result.agr201Yn;
      this.agr203Yn = resp.result.agr203Yn;

      // if ( resp.result.agr201Yn !== 'Y' && resp.result.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, resp.result.agr201Yn, resp.result.agr203Yn);
        }, this), 0);
      // } else {
      //   history.back();
      // }
    } else {
      this.openAlert(resp.code + ' ' + resp.msg);
    }
  },
  _failGetMargetingOffer: function () {

  },
  _closeCompletePopup: function () {
    this._popupService.close();

  },
  _goAuthLine: function () {
    this._popupService.close();
    location.href = '/auth/line';
  }

};

/**
 * FileName: auth.line.marketing.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.07.16
 */

Tw.AuthLineMarketing = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.svcMgmtNum = '';
  this.agr201Yn = '';
  this.agr203Yn = '';
  this.callback = null;

  this.$btnDisagree = null;
  this.$btnAgree = null;
  this.$childChecks = null;
  this.$allCheck = null;
};

Tw.AuthLineMarketing.prototype = {
  openMarketingOffer: function (svcMgmtNum, showName, svcNum, agr201Yn, agr203Yn, callback) {
    this.svcMgmtNum = svcMgmtNum;
    this.agr201Yn = agr201Yn;
    this.agr203Yn = agr203Yn;
    this.callback = callback;
    this._openMarketingOfferPopup(showName, svcNum, agr201Yn, agr203Yn);
  },

  _openMarketingOfferPopup: function (showName, svcNum, agr201Yn, agr203Yn) {
    this._popupService.open({
      hbs: 'CO_01_05_02_P02',
      data: {
        showName: showName,
        svcNum: svcNum,
        agr201Yn: agr201Yn === 'Y',
        agr203Yn: agr203Yn === 'Y',
        allCheck: agr201Yn === 'Y' && agr203Yn === 'Y',
        orCheck: agr201Yn === 'Y' || agr203Yn === 'Y'
      }
    }, $.proxy(this._onOpenMarketingOfferPopup, this), $.proxy(this._closeOpenMarketingOfferPopup, this));
  },
  _onOpenMarketingOfferPopup: function ($layer) {
    $layer.on('change', '#all-check', $.proxy(this._onClickAllCheck, this));
    $layer.on('change', '.child-check', $.proxy(this._onClickChildCheck, this));
    $layer.on('click', '#bt-agree', $.proxy(this._onClickAgree, this));
    $layer.on('click', '#bt-disagree', $.proxy(this._onClickDisagree, this));

    this.$allCheck = $layer.find('#all-check');
    this.$childChecks = $layer.find('.child-check');
    this.$btnAgree = $layer.find('#bt-agree');
    this.$btnDisagree = $layer.find('#bt-disagree');
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
  _onClickAgree: function () {
    var params = {
      agr201Yn: this.agr201Yn,
      agr203Yn: this.agr203Yn
    };
    this._apiService.request(Tw.API_CMD.BFF_03_0015, params, {}, this.svcMgmtNum)
      .done($.proxy(this._successAgreeMarketing, this))
      .fail($.proxy(this._failAgreeMarketing, this));
  },
  _onClickDisagree: function () {
    this._popupService.close();
  },
  _closeOpenMarketingOfferPopup: function () {
    this._openCompleteMarketingPopup();
  },
  _successAgreeMarketing: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.agr201Yn = $(this.$childChecks[0]).is(':checked') ? 'Y' : 'N';
      this.agr203Yn = $(this.$childChecks[1]).is(':checked') ? 'Y' : 'N';
      this._popupService.close();
    }
  },
  _failAgreeMarketing: function () {

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
      this.$btnAgree.attr('disabled', true);
    } else {
      this.$btnAgree.attr('disabled', false);
    }
  },
  _openCompleteMarketingPopup: function () {
    this._popupService.open({
      hbs: 'CO_01_05_02_P03',
      data: {
        agr201Yn: this.agr201Yn === 'Y',
        agr203Yn: this.agr203Yn === 'Y'
      }
    }, $.proxy(this._onOpenCompleteMarketingPopup, this));
  },
  _onOpenCompleteMarketingPopup: function ($layer) {
    $layer.on('click', '.bt-red1', $.proxy(this._confirmCompleteMarketingPopup, this));

  },
  _confirmCompleteMarketingPopup: function () {
    this._popupService.close();
    if ( !Tw.FormatHelper.isEmpty(this.callback) ) {
      this.callback();
    }
  }
};


/**
 * @file line-marketing.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.16
 */

Tw.LineMarketingComponent = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._svcMgmtNum = '';
  this._agr201Yn = '';
  this._agr203Yn = '';
  this._callback = null;

  this._complete = false;
  this.$btnDisagree = null;
  this.$btnAgree = null;
  this.$childChecks = null;
  this.$allCheck = null;
};

Tw.LineMarketingComponent.prototype = {
  openMarketingOffer: function (svcMgmtNum, showName, svcNum, agr201Yn, agr203Yn, callback) {
    this._svcMgmtNum = svcMgmtNum;
    this._agr201Yn = agr201Yn;
    this._agr203Yn = agr203Yn;
    this._callback = callback;
    this._openMarketingOfferPopup(showName, svcNum, agr201Yn, agr203Yn);
  },

  _openMarketingOfferPopup: function (showName, svcNum, agr201Yn, agr203Yn) {
    this._popupService.open({
      hbs: 'CO_01_05_02_06',
      layer: true,
      data: {
        showName: showName,
        svcNum: svcNum,
        showSvcNum: Tw.FormatHelper.conTelFormatWithDash(svcNum),
        agr201Yn: agr201Yn === 'Y',
        agr203Yn: agr203Yn === 'Y'
      }
    }, $.proxy(this._onOpenMarketingOfferPopup, this), $.proxy(this._closeOpenMarketingOfferPopup, this), 'marketing');
  },
  _onOpenMarketingOfferPopup: function ($layer) {
    this.$childChecks = $layer.find('.fe-check-child');
    this.$btnAgree = $layer.find('#fe-bt-complete');

    this.$childChecks.on('change', $.proxy(this._onClickChildCheck, this));
    this.$btnAgree.on('click', $.proxy(this._onClickAgree, this));

    $layer.on('click', '#fe-term-personal', $.proxy(this._onClickTerms, this, '55'));
    $layer.on('click', '#fe-term-marketing', $.proxy(this._onClickTerms, this, '67'));

    this._enableBtns();
  },
  _onClickChildCheck: function () {
    this._enableBtns();
  },
  _onClickAgree: function ($event) {
    $event.stopPropagation();
    this._agr201Yn = $(this.$childChecks[0]).is(':checked') ? 'Y' : 'N';
    this._agr203Yn = $(this.$childChecks[1]).is(':checked') ? 'Y' : 'N';
    var params = {
      agr201Yn: this._agr201Yn,
      agr203Yn: this._agr203Yn
    };
    this._apiService.request(Tw.API_CMD.BFF_03_0015, params, {}, [this._svcMgmtNum])
      .done($.proxy(this._successAgreeMarketing, this))
      .fail($.proxy(this._failAgreeMarketing, this));
  },
  _onClickDisagree: function () {
    this._popupService.close();
  },
  _onClickTerms: function (serNum) {
    Tw.CommonHelper.openTermLayer(serNum);
  },
  _closeOpenMarketingOfferPopup: function () {
    if ( this._complete ) {
      this._openCompleteMarketingPopup();
    } else {
      if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
        this._callback();
      }
    }
  },
  _successAgreeMarketing: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._complete = true;
      this._popupService.close();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _failAgreeMarketing: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
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
      hbs: 'CO_01_05_02_07',
      layer: true,
      data: {
        agr201Yn: this._agr201Yn === 'Y',
        agr203Yn: this._agr203Yn === 'Y'
      }
    }, null, $.proxy(this._onCloseCompleteMarketingPopup, this), 'marketing-complete');
  },
  _onCloseCompleteMarketingPopup: function () {
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback();
    }
  }
};


/**
 * @file line-marketing.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.07.16
 */

/**
 * @class
 * @desc 공통 > 회선 > 마케팅 동의
 * @constructor
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
  /**
   * @function
   * @desc 마케팅 동의 팝업 요청
   * @param svcMgmtNum
   * @param showName
   * @param svcNum
   * @param agr201Yn
   * @param agr203Yn
   * @param callback
   */
  openMarketingOffer: function (svcMgmtNum, showName, svcNum, agr201Yn, agr203Yn, callback) {
    this._svcMgmtNum = svcMgmtNum;
    this._agr201Yn = agr201Yn;
    this._agr203Yn = agr203Yn;
    this._callback = callback;
    this._openMarketingOfferPopup(showName, svcNum, agr201Yn, agr203Yn);
  },

  /**
   * @function
   * @desc 마케팅 동의 팝업 오픈
   * @param showName
   * @param svcNum
   * @param agr201Yn
   * @param agr203Yn
   * @private
   */
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

  /**
   * @function
   * @desc 마케팅 동의 팝업 오픈 콜백 (이벤트 바인딩)
   * @param $layer
   * @private
   */
  _onOpenMarketingOfferPopup: function ($layer) {
    this.$childChecks = $layer.find('.fe-check-child');
    this.$btnAgree = $layer.find('#fe-bt-complete');

    this.$childChecks.on('change', $.proxy(this._onClickChildCheck, this));
    this.$btnAgree.on('click', $.proxy(this._onClickAgree, this));

    $layer.on('click', '#fe-term-personal', $.proxy(this._onClickTerms, this, '55'));
    $layer.on('click', '#fe-term-marketing', $.proxy(this._onClickTerms, this, '67'));

    this._enableBtns();
  },

  /**
   * @function
   * @desc 마케팅 동의 체크박스 click event 처리
   * @private
   */
  _onClickChildCheck: function () {
    this._enableBtns();
  },

  /**
   * @function
   * @desc 다음 버튼 click event 처리
   * @param $event
   * @private
   */
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

  /**
   * @function
   * @desc 닫기 버튼 click event 처리
   * @private
   */
  _onClickDisagree: function () {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 약관 click event 처리
   * @param serNum
   * @private
   */
  _onClickTerms: function (serNum) {
    Tw.CommonHelper.openTermLayer(serNum);
  },

  /**
   * @function
   * @desc 마케팅 팝업 클로즈 콜백
   * @private
   */
  _closeOpenMarketingOfferPopup: function () {
    if ( this._complete ) {
      this._openCompleteMarketingPopup();
    } else {
      if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
        this._callback();
      }
    }
  },

  /**
   * @function
   * @desc 마케팅 동의 요청 응답 처리
   * @param resp
   * @private
   */
  _successAgreeMarketing: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._complete = true;
      this._popupService.close();
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 마케팅 동의 요청 실패 처리
   * @param error
   * @private
   */
  _failAgreeMarketing: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 다음 버튼 enable/disable 처리
   * @private
   */
  _enableBtns: function () {
    var selectedLength = this.$childChecks.filter(':checked').length;
    if ( selectedLength === 0 ) {
      this.$btnAgree.attr('disabled', true);
    } else {
      this.$btnAgree.attr('disabled', false);
    }
  },

  /**
   * @function
   * @desc 마케팅 동의 완료 팝업 오픈
   * @private
   */
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

  /**
   * @function
   * @desc 마케팅 동의 완료 팝업 클로즈 콜백
   * @private
   */
  _onCloseCompleteMarketingPopup: function () {
    if ( !Tw.FormatHelper.isEmpty(this._callback) ) {
      this._callback();
    }
  }
};


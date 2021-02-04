/**
 * MenuName: 나의 요금 서브메인(조회/신청 서비스 영역)
 * @file myt-fare.submain.lookup.js
 * @author 양정규
 * @since 2020.12.30
 */
Tw.MyTFareSubMainLookup = function (params) {
  this.$container = params.$element;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._init();
};

Tw.MyTFareSubMainLookup.prototype = {
  _init: function () {
    this._cachedElement();
    this._bindEvent();
    this._initScroll();
  },

  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    this._contents = this.$container.find('.fe-contents'); // 컨텐츠 영역
    this._taxTempl = Handlebars.compile( $('#fe-tax-templ').html()); // 세금계산서, 기부금 템플릿

  },

  /**
   * even bind
   * @private
   */
  _bindEvent: function () {
  },

  // lazyloading 처리
  _initScroll: function () {
    this._checkScroll();
    $(window).on('scroll', $.proxy(function () {
      this._checkScroll();
    }, this));
  },

  _checkScroll: function () {
    if ( !this._contents.data('finish') && this._elementScrolled(this._contents) ) {
      this._requestTaxContribute();
    }
  },

  _elementScrolled: function (element) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = element.offset().top;
    return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
  },

  _requestTaxContribute: function () {
    this._apiService.requestArray([
      { command: Tw.SESSION_CMD.BFF_07_0017 },  // 세금계산서 재발행 조회
      { command: Tw.API_CMD.BFF_05_0038 }   // 기부금 내역 조회
    ]).done($.proxy(this._callbackTaxContribute, this))
      .fail($.proxy(this._error, this));
  },

  _callbackTaxContribute: function (tax, contribute) {
    var isTax = tax.result , isContribute = (contribute.result || {}).donationList.length;
    this._contents.append(this._taxTempl({
      isShowData: isTax || isContribute,
      isTax: isTax,
      isContribute: isContribute
    })).data('finish','finish');
    new Tw.XtractorService(this.$container);
  },

  _error: function (res) {
    Tw.Error(res.code, res.msg).pop();
  }

};

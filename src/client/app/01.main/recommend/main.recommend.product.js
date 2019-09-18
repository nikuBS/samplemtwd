/**
 * @file main.home.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.06
 */

/**
 * @class
 * @desc 메인 > 홈(my)
 * @param rootEl - dom 객체
 * @param smartCard
 * @param emrNotice
 * @param menuId
 * @param isLogin
 * @param actRepYn
 * @constructor
 */
Tw.MainRecommendProduct = function (rootEl, resp) {
  // String -> JSON Parse
  this._resp = JSON.parse(resp);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._now = 0;
  this._timer = null;

  this._cachedElement();
  this._bindEvent();
  this._initScroll();
};

Tw.MainRecommendProduct.prototype = {
  _cachedElement: function() {
    this.$box = $('.di-box');
    this.$pbox = $('.cont-box').not('.nogaps-hoz');
    this.$list = $('.txt-list > li');
    // this._boxTop = this.$box.offset().top - $('#header').height() - 10;
  },

  _bindEvent: function() {
    this.$container.on('click', '#fe-btn-details', $.proxy(this._onClickDetailsBtn, this));
    this.$container.on('click', '#fe-btn-join', $.proxy(this._onClickJoinBtn, this, this._resp.prodId));
  },

  _initScroll: function () {

    $(window).scroll($.proxy(function () {
      this._checkScroll();
    }, this));
  },

  /**
   * @function
   * @desc 스크롤 이동 체크
   * @private
   */
  _checkScroll: function () {
    // this.$box.toggleClass('fixed', this._boxTop <= $(window).scrollTop());

    if ( $(window).scrollTop() >= $('.tod-myplan-visual').height() - 10 ) {
      this.$box.addClass('fixed');
    } else {
      this.$box.removeClass('fixed');
    }

    if ( !Tw.FormatHelper.isEmpty(this._timer) ) {
      clearTimeout(this._timer);
    }

    this._timer = setTimeout(this._toolTipAnimate, 200, this);
  },

  /**
   * @function
   * @desc ToolTip 변경
   * @private
   */
  _toolTipAnimate: function(_$context) {

    var index = 0;
    $.each(_$context.$pbox, function (idx, element) {
      index = ($(element).offset().top < ($(window).scrollTop() + 140)) ? idx + 1 : index;
    });

    if (index !== _$context._now) {
      color = _$context.$list.eq(index).data('bgColor');
      $('.di-box-container').css('background', color);
      $('.tail').css('border-top-color', color);
      _$context.$list.eq(_$context._now).fadeOut(300).end().eq(index).fadeIn(300);
      _$context._now = index;
    }
  },

  _onClickDetailsBtn: function() {
    this._popupService.open({
      hbs:'HO_01_03',
      data: this._resp.benefit
    }, $.proxy(this._onOpenDetailsPopup, this));
  },

  _onOpenDetailsPopup: function($popupLayer) {
    $popupLayer.on('click', '#fe-btn-close', $.proxy(this._popupService.close, this));
  },

  _onClickJoinBtn: function(prodId) {
   this._historyService.goLoad('/product/callplan?prod_id=' + prodId);
 }
}
  
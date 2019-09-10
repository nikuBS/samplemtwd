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

  this._cachedElement();
  this._bindEvent();
  // this._initScroll();

  var $box = $('.di-box'),
      $pbox = $('.cont-box').not('.nogaps-hoz'),
      $list = $('.txt-list > li'),
      index = 0,
      now = 0,
      timer = null,
      color = '',
      boxTop = $box.offset().top - $('#header').height() - 10;

  function toolTipAnimate(idx) {
    if (idx !== now) {
        color = $list.eq(idx).data('bgColor');
        $('.di-box-container').css('background', color);
        $('.tail').css('border-top-color', color);
        $list.eq(now).fadeOut(300).end().eq(idx).fadeIn(300);
        now = idx;
    }
  }

  $(window).on('scroll', function () {
    $box.toggleClass('fixed', boxTop <= $(window).scrollTop());

    clearTimeout(timer);
    timer = null;
    timer = setTimeout(function () {
        index = 0;
        $.each($pbox, function (idx, element) {
            index = ($(element).offset().top < ($(window).scrollTop() + 140)) ? idx + 1 : index;
        });
        toolTipAnimate(index);
    }, 200);
  });

};

Tw.MainRecommendProduct.prototype = {
  _cachedElement: function() {
    // this.$detailsBtn = this.$container.find('#fe-btn-details');
    // this.$joinBtn = this.$container.find('#fe-btn-join');
  },

  _bindEvent: function() {
    this.$container.on('click', '#fe-btn-details', $.proxy(this._onClickDetailsBtn, this));
    this.$container.on('click', '#fe-btn-join', $.proxy(this._onClickJoinBtn, this, this._resp.prodId));
  },

  _initScroll: function () {

    this.$box = $('.di-box'),
    this.$pbox = $('.cont-box').not('.nogaps-hoz'),
    this.$list = $('.txt-list > li'),
    this._index = 0,
    this._now = 0,
    this._timer = null,
    this._color = '',
    this._boxTop = this.$box.offset().top - $('#header').height() - 10;

    $(window).scroll($.proxy(function () {
      this.$box.toggleClass('fixed', this._boxTop <= $(window).scrollTop());

      if ( !Tw.FormatHelper.isEmpty(this._timer) ) {
        clearTimeout(this._timer);
      }

      // console.log('##### scroll #####');

      this._timer = setTimeout(function () {
        this._index = 0;
          $.each(this.$pbox, function (idx, element) {
            console.log(element);
            this._index = ($(element).offset().top < ($(window).scrollTop() + 140)) ? idx + 1 : this._index;
          });
          this._toolTipAnimate(this._index);
      }, 200);
    }, this));
  },

  _toolTipAnimate: function(idx) {
    console.log('idx===>', idx);
    if (idx !== this._now) {
      this._color = this.$list.eq(idx).data('bgColor');
      $('.di-box-container').css('background', this._color);
      $('.tail').css('border-top-color', this._color);
      this.$list.eq(this._now).fadeOut(300).end().eq(idx).fadeIn(300);
      this._now = idx;
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
  
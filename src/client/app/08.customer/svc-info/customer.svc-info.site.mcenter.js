/**
 * FileName: customer.svc-info.site.mcenter.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 12. 18
 */
Tw.CustomerSvcInfoMcenter = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerSvcInfoMcenter.prototype = {
  _init : function() {
    
  },
  _cachedElement: function () {

  },
  _bindEvent: function () {
    // from idpt
    this._bindUIEvent();
  },

  _bindUIEvent: function () {
    $('.idpt-tab', this.$container).each(function(){
      var tabBtn = $(this).find('li');
      $(tabBtn).click(function(){
        var i = $(this).index();
        $('.idpt-tab > li', this.$container).removeClass('on').eq(i).addClass('on');
        $('.idpt-tab-content', this.$container).removeClass('show').eq(i).addClass('show');
      });
    });
  
    // popup
    $('.idpt-popup-open', this.$container).click(function(){
      var popId = $(this).attr('href');
      $('.idpt-popup-wrap', this.$container).removeClass('show');
      $(popId).addClass('show');
      $('.idpt-popup', this.$container).show();
    });
    $('.idpt-popup-close', this.$container).click(function(){
      $('.idpt-popup', this.$container).hide();
    });
  
    // tooltip
    $('.info-tooltip', this.$container).each(function(){
      $('.btn-tooltip-open', this.$container).on('click', function(){
        var remStandard = $('body').css('font-size').replace('px','');
        var btnLeft = $(this).offset().left - 28;
        var btnRem = btnLeft/remStandard
        $('.idpt-tooltip-layer', this.$container).css('left', btnRem + 'rem');
        $(this).next('div').show();
      });
    });
    $('.btn-tooltip-close', this.$container).on('click', function(){
      $('.idpt-tooltip-layer', this.$container).hide();
    });
  
    //accordian
    $('.idpt-accordian > li > a', this.$container).on('click', function(){
      $('.idpt-accordian > li > a', this.$container).removeClass('open');
      $('.idpt-accordian-cont', this.$container).slideUp();
      if ($(this).parent().find('.idpt-accordian-cont').is(':hidden')){
        $(this).addClass('open');
        $(this).parent().find('.idpt-accordian-cont').slideDown();
      }
    });
  
    //toggle (FAQ)
    $('.idpt-toggle-btn', this.$container).each(function(){
      $(this).click(function(){
        $(this).toggleClass('open').next('.idpt-toggle-cont').slideToggle();
      })
    });
  },
};
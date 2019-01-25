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
    this._bindUIEvent(this.$container);
  },

  _bindUIEvent: function ($container) {
    $('.idpt-tab', $container).each(function(){
      var tabBtn = $(this).find('li');
      $(tabBtn).click(function(){
        var i = $(this).index();
        $('.idpt-tab > li').removeClass('on').eq(i).addClass('on');
        $('.idpt-tab-content').removeClass('show').eq(i).addClass('show');
      });
    });
  
    // popup
    $('.idpt-popup-open', $container).click(function(){
      var popId = $(this).attr('href');
      $('.idpt-popup-wrap').removeClass('show');
      $(popId).addClass('show');
      $('.idpt-popup', $container).show();
    });
    $('.idpt-popup-close', $container).click(function(){
      $('.idpt-popup', $container).hide();
    });
  
    $('input[type=radio][name=call]', $container).on('click', function() {
      var chkValue = $('input[type=radio][name=call]:checked', $container).val();
      if (chkValue == '1') {
        $('.call-cont01').css('display', 'block');
        $('.call-cont02').css('display', 'none');
      } else if (chkValue  == '2') {
        $('.call-cont01').css('display', 'none');
        $('.call-cont02').css('display', 'block');
      }
    });
  
    $('input[type=radio][name=center]', $container).on('click', function() {
      var chkValue = $('input[type=radio][name=center]:checked', $container).val();
      if (chkValue == '1') {
        $('.center-cont01', $container).css('display', 'block');
        $('.center-cont02', $container).css('display', 'none');
      } else if (chkValue  == '2') {
        $('.center-cont01', $container).css('display', 'none');
        $('.center-cont02', $container).css('display', 'block');
      }
    });

    //tooltip
    $('.btn-tooltip-open', $container).click(function(){
      var toolpopId = $(this).attr('href');
      $('.popup-info', $container).removeClass('show');
      $(toolpopId).addClass('show');
      $('.tooltip-popup', $container).show();
    });
    $('.btn_confirm', $container).click(function(){
      $('.tooltip-popup', $container).hide();
    });
  
    //accordian
    $('.idpt-accordian > li > a', $container).on('click', function(e){
      e.preventDefault();
      $('.idpt-accordian > li > a', $container).removeClass('open');
      $('.idpt-accordian-cont', $container).slideUp();
      if ($(this).parent().find('.idpt-accordian-cont').is(':hidden')){
        $(this).addClass('open');
        $(this).parent().find('.idpt-accordian-cont').slideDown();
      }
    });
  
    //toggle (FAQ)
    $('.idpt-toggle-btn', $container).each(function(){
      $(this).click(function(){
        $(this).toggleClass('open').next('.idpt-toggle-cont').slideToggle();
      })
    });
  },
};
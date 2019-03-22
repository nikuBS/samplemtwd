/**
 * FileName: customer.useguide.common.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 10. 18
 */
Tw.CustomerSvcInfoSite = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;
  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerSvcInfoSite.prototype = {
  _init : function() {
    this._hasTab();
    this._activeCurrentHashTab();
    this._addExternalTitle(); // 새창열림 타이틀 넣기

   
  },
  _cachedElement: function () {

  },
  _bindEvent: function () {
    // 링크이동
    this.$container.on('click', '.fe-link-external:not([href^="#"])', $.proxy(this._openExternalUrl, this));
    this.$container.on('click', '.fe-link-internal:not([href^="#"])', $.proxy(this._openInternalUrl, this));
    this.$container.on('click', '.fe-link-inapp:not([href^="#"])', $.proxy(this._openInApp, this));

    // from idpt
    this._bindUIEvent(this.$container);
  },

  _addExternalTitle: function () {
    this.$container.find('.fe-link-external:not([href^="#"])').each(function(_ind, target){
      if(!$(target).attr('title')) {
        $(target).attr('title', Tw.COMMON_STRING.OPEN_NEW_TAB);
      }
    });
  },

  _openExternalUrl: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.close();
    Tw.CommonHelper.openUrlExternal($(e.currentTarget).attr('href'));
  },

  _openInternalUrl: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._historyService.goLoad(location.origin + $(e.currentTarget).attr('href'));
  },

  _openInApp: function (e) {
    e.preventDefault();
    e.stopPropagation();

    Tw.CommonHelper.openUrlInApp(location.origin + $(e.currentTarget).attr('href'));
  },

  _hasTab: function() {
    this.$tabWrapper = this.$container.find('.tab-linker');
    this._hasTab = this.$tabWrapper.length > 0;
    this._initTab();
  },
  _initTab: function() {
    if(!this._hasTab) return false;
    $(window).on('hashchange', $.proxy(this._activeCurrentHashTab, this));
    this.$tabLinker = this.$tabWrapper.find('a');
    this.$tabContentsWrapper = this.$container.find('.tab-contents div[role="tabpanel"]');
    this._ownHash = _.reduce(this.$tabLinker, function(prev, next) {
      prev.push(next.hash.replace(/#/, ''));
      return prev;
    }, []);
    this.$tabWrapper.on('click', 'li', $.proxy(this._tabClickLi, this));
    this.$tabLinker.on('click', $.proxy(this._tabClickHandler, this));
  },
  _activeCurrentHashTab: function() {
    if(!this._hasTab) return false;
    this._currentHashIndex = _.indexOf(this._ownHash, this._hash._currentHashNav);
    if(this._currentHashIndex < 0) return false; // 메뉴 클릭시 해당이벤트 간섭하는 것 수정
    this._currentHashIndex = this._currentHashIndex > 0 ? this._currentHashIndex : 0;
    this.$tabLinker.eq(this._currentHashIndex).click();
    _.map(this.$tabLinker.parent('li'), function(o, i) {
      $(o).attr('aria-selected', this._currentHashIndex === i);
    }, this);
  },
  // 웹 접근성 li 클릭시 a 클릭되도록
  _tabClickLi: function (e) {
    $(e.currentTarget).find('a').click();
  },
  _tabClickHandler: function(e) {
    
    this.$tabContentsWrapper.hide().addClass('blind none').attr('aria-hidden', true);
    this.$tabContentsWrapper.eq(this.$tabLinker.index(e.target)).show().removeClass('blind none').attr('aria-hidden', false);
  },

  _parse_query_string: function () {
    return Tw.UrlHelper.getQueryParams();
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
      if (chkValue === '1') {
        $('.call-cont01').css('display', 'block');
        $('.call-cont02').css('display', 'none');
      } else if (chkValue  === '2') {
        $('.call-cont01').css('display', 'none');
        $('.call-cont02').css('display', 'block');
      }
    });
  
    $('input[type=radio][name=center]', $container).on('click', function() {
      var chkValue = $('input[type=radio][name=center]:checked', $container).val();
      if (chkValue === '1') {
        $('.center-cont01', $container).css('display', 'block');
        $('.center-cont02', $container).css('display', 'none');
      } else if (chkValue  === '2') {
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
      });
    });
  }
};

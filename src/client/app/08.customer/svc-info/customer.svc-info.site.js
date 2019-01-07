/**
 * FileName: customer.useguide.common.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 10. 18
 */
Tw.CustomerSvcInfoSite = function (rootEl, data) {
  this.$container = rootEl;
  //this.data = data? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;
  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerSvcInfoSite.prototype = {
  _init : function() {
    this._hasTab();
    this._activeCurrentHashTab();
  },
  _cachedElement: function () {

  },
  _bindEvent: function () {
    // from idpt
    this._bindUIEvent();
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
    this.$tabLinker.on('click', $.proxy(this._tabClickHandler, this));
  },
  _activeCurrentHashTab: function() {
    if(!this._hasTab) return false;
    this._currentHashIndex = _.indexOf(this._ownHash, this._hash._currentHashNav);
    this._currentHashIndex = this._currentHashIndex > 0 ? this._currentHashIndex : 0;
    this.$tabLinker.eq(this._currentHashIndex).click();
    _.map(this.$tabLinker.parent('li'), function(o, i) {
      $(o).attr('aria-selected', this._currentHashIndex === i);
    }, this);
  },
  _tabClickHandler: function(e) {
    this.$tabContentsWrapper.addClass('blind');
    this.$tabContentsWrapper.eq(this.$tabLinker.index(e.target)).removeClass('blind');
  },

  _parse_query_string: function () {
    return Tw.UrlHelper.getQueryParams();
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
    $('.idpt-accordian > li > a', this.$container).on('click', function(e){
      e.preventDefault();
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
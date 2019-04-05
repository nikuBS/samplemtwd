/**
 * FileName: customer.useguide.common.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 10. 18
 */
Tw.CustomerSvcInfoSiteDetail = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._init();

  this._cachedElement();
  this._bindEvent();

};

Tw.CustomerSvcInfoSiteDetail.prototype = {
  _init : function() {
    this._addExternalTitle(); // 새창열림 타이틀 넣기
  },
  _cachedElement: function () {
    this.$InfoBtn = this.$container.find('#ti-select-btn');

  },
  _bindEvent: function () {
    this.$InfoBtn.on('click', $.proxy(this._typeActionSheetOpen, this));
    this.$InfoBtn.text(Tw.CUSTOMER_SITE_INFO_TYPEA_CHOICE.options[0].list[0].value).attr('value', 'A'); 

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

  // 타입 A 일 경우에만 실행되게 됨 : 셀렉트박스 실행 start
  _typeActionSheetOpen: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type', // hbs의 파일명
      layer: true,
      title: Tw.CUSTOMER_SITE_INFO_TYPEA_CHOICE.title,
      data: Tw.CUSTOMER_SITE_INFO_TYPEA_CHOICE.options
    }, $.proxy(this._callBackAction, this), $.proxy(function(){
      this._popupService.close();
    }, this));
  },

  _callBackAction: function (root) {
    this.$selectList = root.find('.chk-link-list');
    this.$selectList.on('click', 'button', $.proxy(this._moveToTab, this));
    // 선택
    this._checkValue(this.$InfoBtn.attr('value'));
  },
  
  _moveToTab: function (e) {
    var selectedValue = $(e.currentTarget).val();

    this._checkValue(selectedValue, $(e.currentTarget).find('.info-value').text());
    this._popupService.close();

    this.$container.find('#siteFaqCont' + (selectedValue === 'A' ? '1' : '2')).show();
    this.$container.find('#siteFaqCont' + (selectedValue === 'A' ? '2' : '1')).hide();
  },

  _checkValue: function (value, text) {
    this.$selectList.find('button').removeClass('checked');
    this.$selectList.find('button').filter(function(){
      return $(this).val() === value;
    }).addClass('checked');

    // 선택된 텍스트
    this.$InfoBtn.attr('value', value);
    if(text) this.$InfoBtn.text(text); 
  },
  // 타입 A 일 경우에만 실행되게 됨 : 셀렉트박스 실행 end

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
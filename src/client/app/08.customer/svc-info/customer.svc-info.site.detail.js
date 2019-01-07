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

  },
  _cachedElement: function () {
    this.$InfoBtn = this.$container.find('#ti-select-btn');

  },
  _bindEvent: function () {
    this.$InfoBtn.on('click', $.proxy(this._typeActionSheetOpen, this));
    this.$InfoBtn.text(Tw.CUSTOMER_SITE_INFO_TYPEA_CHOICE.options[0].list[0].value).attr('value', 'A'); 

    this._bindUIEvent();
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
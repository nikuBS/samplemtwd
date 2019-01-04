/**
 * FileName: customer.svc-info.service.detail.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 12. 20
 */
Tw.CustomerSvcinfoServiceDetail = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._init();
  this._cachedElement();
  this._bindEvent();

};

Tw.CustomerSvcinfoServiceDetail.prototype = {
  _cachedElement: function () {
    this.$selectBtn = this.$container.find('.btn-dropdown'); // type A
  },
  _init: function () {
    this.rootPathName = this._historyService.pathname;
    this.queryParams = Tw.UrlHelper.getQueryParams();
  },
  _bindEvent: function () {
    this.$selectBtn.on('click', $.proxy(this._typeActionSheetOpen, this));

    // from idpt
    this._bindUIEvent();
  },

  _typeActionSheetOpen: function (e) {
    this._popupService.open({
      hbs: 'actionsheet01',// hbs의 파일명
      layer: true,
      title: null,
      data: this._getOptions(this.data.list),
      btnfloating: {
        txt: Tw.BUTTON_LABEL.CLOSE,
        class: 'tw-popup-closeBtn'
      }
    }, $.proxy(this._ActionSheetBindEvent, this), $.proxy(this._closeSelect, this));
  },

  _getOptions: function (obj) {
    return {
      data: {
        list: obj.map(function(el){
          return {
            txt: el.dep_title,
            // option: 'checked', 
            'radio-attr': 'name="selectType" value="'+ el.code +'"'
          }
        })
      }
    }
  },

  _ActionSheetBindEvent: function ($container) {
    this.$selectButtons = $container.find('.ac-list>li');
    
    // 현재 값 선택
    var code = this.queryParams.code;
    this.$selectButtons.find('input').filter(function(){
      return $(this).val() === code;
    }).prop('checked', true);
    
    // 이벤트 바인드
    this.$selectButtons.on('click', $.proxy(this._setActionSheetValue, this));
  },

  _closeSelect: function () {
    this._popupService.close();
  },

  _setActionSheetValue: function (e) {
    // check
    this.$selectButtons.find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true);

    // popup close
    this._popupService.close();

    // move 
    this._moveDetailPage( $(e.currentTarget).find('input').val() );
  },

  _moveDetailPage: function (code) {
    // TODO code 값이 url 일때를 고려
    var targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    this._historyService.goLoad(targetURL + '?code=' + code);
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
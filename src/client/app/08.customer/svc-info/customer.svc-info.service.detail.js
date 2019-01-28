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
    this.$defineUSIMBtn = this.$container.find('#fe-btn-define-usim'); //용어정리 버튼(유심)
  },
  _init: function () {
    this.rootPathName = this._historyService.pathname;
    this.queryParams = Tw.UrlHelper.getQueryParams();
  },
  _bindEvent: function () {
    this.$selectBtn.on('click', $.proxy(this._typeActionSheetOpen, this));
    // from html DOM 주요용어 바로가기
    this.$defineUSIMBtn.on('click', $.proxy(this._USIMInfoCall, this));

    // 링크이동
    this.$container.on('click', '.fe-link-external:not([href^="#"])', $.proxy(this._openExternalUrl, this));
    this.$container.on('click', '.fe-link-internal:not([href^="#"])', $.proxy(this._openInternalUrl, this));
    this.$container.on('click', '.fe-link-inapp:not([href^="#"])', $.proxy(this._openInApp, this));

    // admin 제공된 tooltip 정보
    this.$container.on('click', '.btn-tooltip-open', $.proxy(this._openTooltipPop, this));

    // admin 제공 팝업
    this.$container.on('click', '.idpt-popup-open', $.proxy(this._openPagePop, this));
    
    // from idpt
    this._bindUIEvent(this.$container);
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
            'radio-attr': 'name="selectType" value="'+ el.code +'" id="radio'+el.code+'"',
            'label-attr': 'for="radio'+el.code+'"'
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

    $container.find('.ac-list>li label').on('click', $.proxy(this._noDefaultEvent, this));
  },

  _noDefaultEvent: function(e) {
    e.preventDefault();
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
    var targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    this._historyService.goLoad(targetURL + '?code=' + code);
  },

  // 유심용어 정리 바로가기 액션시트 start
  _USIMInfoCall: function (e) {
    e.preventDefault();
    this._apiService.request(Tw.API_CMD.BFF_08_0064, {}, {}, ['C00046'])
    .done($.proxy(this._USIMActionSheetOpen, this)).fail($.proxy(this._apiError, this));
  },

  _USIMActionSheetOpen: function (data) {
    this._popupService.open({
      hbs: 'CS_07_02',
      contentHTML: data.result.icntsCtt
    },
    $.proxy(this._USIMActionSheetEvent, this), null, 'usimDefine');
  },

  _USIMActionSheetEvent: function ($container) {
    this.usimContentIndex = 0; // 초기화 
    this.$USIMContentsContainer = $container;
    this.$USIMSelectBtn = $container.find('.btn-dropdown'); // 유심정리 탭 선택
    this.$USIMSelectBtn.text(Tw.CUSTOMER_SERVICE_INFO_USIM_DEFINE.data.list[0].txt);
    this.$USIMSelectBtn.on('click', $.proxy(this._USIMSelect, this));
  },

  // 용어정리 탭 내 셀렉트 박스 클릭 이벤트
  _USIMSelect: function () {
    this._popupService.open({
      hbs: 'actionsheet01',// hbs의 파일명
      layer: true,
      title: null,
      data: Tw.CUSTOMER_SERVICE_INFO_USIM_DEFINE,
      btnfloating: {
        txt: Tw.BUTTON_LABEL.CLOSE,
        class: 'tw-popup-closeBtn'
      }
    }, $.proxy(this._USIMSelectBindEvent, this), null);
  },

  _USIMSelectBindEvent: function ($selectContainer) {
    this.$USIMSelectLists = $selectContainer.find('.ac-list>li');
    this.$USIMSelectClostBtn = $selectContainer.find('.tw-popup-closeBtn');
    this.$USIMSelectLists.on('click', $.proxy(this._selectUSIMmenu, this));

    this.$USIMSelectLists.eq(this.usimContentIndex || 0).find('input').prop('checked', true);
  },

  _selectUSIMmenu: function (e) {
    this.usimContentIndex = parseFloat($(e.currentTarget).find('input').val()) -1;
    this.$USIMSelectLists.find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true);
    this.$USIMSelectBtn.text($(e.currentTarget).find('.txt').text());
    // 해당 컨텐츠 내용을 가리고 보이기 처리
    this.$USIMContentsContainer.find('.fe-usim-info').eq(this.usimContentIndex).show().siblings('.fe-usim-info').hide();
    // 팝업닫기
    this.$USIMSelectClostBtn.click();
  },
  // 유심용어 정리 바로가기 액션시트 end

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
    /*$('.idpt-popup-open', $container).click(function(){
      var popId = $(this).attr('href');
      $('.idpt-popup-wrap').removeClass('show');
      $(popId).addClass('show');
      $('.idpt-popup', $container).show();
    });
    $('.idpt-popup-close', $container).click(function(){
      $('.idpt-popup', $container).hide();
    });*/
  
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
    /*$('.btn-tooltip-open', $container).click(function(){
      var toolpopId = $(this).attr('href');
      $('.popup-info', $container).removeClass('show');
      $(toolpopId).addClass('show');
      $('.tooltip-popup', $container).show();
    });
    $('.btn_confirm', $container).click(function(){
      $('.tooltip-popup', $container).hide();
    });*/
  
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

  _apiError: function (err) {
    Tw.Logger.error(err.code, err.msg);
    this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg);
    return false;
  },

  _openTooltipPop: function (e) {
    var popId = $(e.currentTarget).attr('href');
    e.preventDefault();

    this._popupService.open({
      url: Tw.Environment.cdn + '/hbs/',
      'pop_name': 'type_tx_scroll',
      'title': null,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': $(popId).find('.popup-title').html().replace(/<br ?\/?>/gi, '\n'),
      'bt_b': [{
        style_class: 'tw-popup-closeBtn bt-red1 pos-right',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, null, null);
  },

  _openPagePop: function (e) {
    var popId = $(e.currentTarget).attr('href');
    e.preventDefault();
    this._popupService.open({
        hbs: 'svc-info.service.popup',
        'title': $(popId).find('.popup-title').text(),
        'contents': $(popId).find('.idpt-popup-cont').html()
      },
      $.proxy(function($container) {
        this._bindUIEvent($container);
      },this)
    );
  }
};
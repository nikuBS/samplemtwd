/**
 * @file [이용안내-사이트이용방법-m고객센터]
 * @author Lee Kirim
 * @since 2018-12-18
 */
Tw.CustomerSvcInfoMcenter = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerSvcInfoMcenter.prototype = {
  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 처음 처리
   * @return {void}
   */
  _init : function() {
    this._addExternalTitle(); // 새창열림 타이틀 넣기
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - customer.svc-info.site.html 참고
   */
  _cachedElement: function () {

  },
  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    // 링크이동
    this.$container.on('click', '.fe-link-external:not([href^="#"])', $.proxy(this._openExternalUrl, this));
    this.$container.on('click', '.fe-link-internal:not([href^="#"])', $.proxy(this._openInternalUrl, this));
    this.$container.on('click', '.fe-link-inapp:not([href^="#"])', $.proxy(this._openInApp, this));

    // admin 제공된 tooltip 정보
    this.$container.on('click', '.btn-tooltip-open', $.proxy(this._openTooltipPop, this));
    this.$container.on('click', '.info-tooltip>p', $.proxy(this._openTooltipPop, this));

    // from idpt
    this._bindUIEvent(this.$container);
  },

  /**
   * @method
   * @return {void}
   * @desc [웹접근성] 관련
   * 어드민에서 받아온 html 콘텐츠에서 외부링크 존재 시 title 속성이 없으면 "새창열림" title 삽입
   */
  _addExternalTitle: function () {
    this.$container.find('.fe-link-external:not([href^="#"])').each(function(_ind, target){
      if(!$(target).attr('title')) {
        $(target).attr('title', Tw.COMMON_STRING.OPEN_NEW_TAB);
      }
    });
  },

  /**
   * @desc 외부이동링크 
   * @param {event} e 
   */
  _openExternalUrl: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.close();
    Tw.CommonHelper.openUrlExternal($(e.currentTarget).attr('href'));
  },

  /**
   * @desc 내부이동링크
   * @param {event} e 
   */
  _openInternalUrl: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._historyService.goLoad(location.origin + $(e.currentTarget).attr('href'));
  },

  /**
   * @desc 인앱이동 링크
   * @param {event} e 
   */
  _openInApp: function (e) {
    e.preventDefault();
    e.stopPropagation();

    Tw.CommonHelper.openUrlInApp(location.origin + $(e.currentTarget).attr('href'));
  },

  /**
   * @function 
   * @desc 어드민 등록 콘텐츠에서 필요한 액션 정의 from idpt
   * @param {element} $container 최상위 객체
   */
  _bindUIEvent: function ($container) {
    /**
     * @desc 탭버튼 클릭시 활성화 클래스
     */
    $('.idpt-tab', $container).each(function(){
      var tabBtn = $(this).find('li');
      $(tabBtn).click(function(){
        var i = $(this).index();
        $('.idpt-tab > li').removeClass('on').eq(i).addClass('on');
        $('.idpt-tab-content').removeClass('show').eq(i).addClass('show');
      });
    });
  
    /**
     * @desc 팝업 동작 해당 액션 사용하지 않음 (혹시 필요할 수 있어 남겨 둠)
     * 팝업은 히스토리 관리가 필요해 공통팝업으로 교체하도록 처리함
     */
    $('.idpt-popup-open', $container).click(function(){
      var popId = $(this).attr('href');
      $('.idpt-popup-wrap').removeClass('show');
      $(popId).addClass('show');
      $('.idpt-popup', $container).show();
    });
    $('.idpt-popup-close', $container).click(function(){
      $('.idpt-popup', $container).hide();
    });
  
    /**
     * 라디오 버튼 클릭이벤트 사용하지 않음 (혹시 필요할 수 있어 남겨 둠)
     */
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
  
    /**
     * 라디오 버튼 클릭이벤트 사용하지 않음 (혹시 필요할 수 있어 남겨 둠)
     */
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
  
    /**
     * 아코디언 형식 리스트 사용
     */
    $('.idpt-accordian > li > a', $container).on('click', function(e){
      e.preventDefault();
      $('.idpt-accordian > li > a', $container).removeClass('open');
      $('.idpt-accordian-cont', $container).slideUp();
      if ($(this).parent().find('.idpt-accordian-cont').is(':hidden')){
        $(this).addClass('open');
        $(this).parent().find('.idpt-accordian-cont').slideDown();
      }
    });
  
    /**
     * FAQ 콘텐츠에서 사용되는 메서드
     */
    $('.idpt-toggle-btn', $container).each(function(){
      $(this).click(function(){
        $(this).toggleClass('open').next('.idpt-toggle-cont').slideToggle();
      });
    });
  },

  /**
   * @function
   * @desc 어드민에서 등록된 툴팁 콘텐츠를 공통 모듈에서 사용하는 툴팁과 공통으로 사용되도록 함
   * @param {event} e 
   */
  _openTooltipPop: function (e) {
    var isTargetTitle = !!($(e.currentTarget).siblings('.btn-tooltip-open').length); // boolean 
    var popId = isTargetTitle ? $(e.currentTarget).siblings('.btn-tooltip-open').attr('href'): $(e.currentTarget).attr('href');
    var titleText = isTargetTitle ? $(e.currentTarget).text() : $(e.currentTarget).prev('p').text();
    // 앞 숫자 변경 (등록 콘텐츠에 숫자가 붙어 들어오는 케이스가 있어 삭제함)
    titleText = titleText.replace(/^\d\d?\./gi,'');
    e.preventDefault();

    /**
     * @function 
     * @param {Object} {hbs: hbs 의 파일명, layer: 레이어 여부, title: 액션시트 제목, data: 데이터 리스트, btnfloating: {txt: 닫기버튼 문구, attr: 닫기버튼 attribute, class: 닫기버튼 클래스}}
     * @param {function} function_open_call_back 액션시트 연 후 호출 할 function
     * @param {function} function_close_call_back 액션시트 닫힌 후 호출할 function
     * @param {string} 액션시트 열 때 지정할 해쉬값, 기본값 popup{n}
     * @param {Object} $target 액션시트 닫힐 때 포커스 될 엘리먼트 여기에서는 카테고리 선택 버튼
     * @desc 라디오 선택 콤보박스 형태
     */
    this._popupService.open({
      url: Tw.Environment.cdn + '/hbs/',
      'pop_name': 'type_tx_scroll',
      'title': titleText || '',
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': $(popId).find('.popup-title').html().replace(/<br ?\/?>/gi, '\n'),
      'tagStyle-div': 'div',
      'btn-close':'btn-tooltip-close tw-popup-closeBtn'
    }, $.proxy(function($container){
      $container.find('.popup-info').show();
    }, this), null);
  }
};

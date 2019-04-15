/**
 * @file [이용안내-사이트_이용방법]
 * @author Lee Kirim
 * @since 2018-12-20
 */

 /**
 * @class 
 * @desc 이용안내 사이트 이용방법 class
 * @param {Object} rootEl - 최상위 element Object
 */
Tw.CustomerSvcInfoSite = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerSvcInfoSite.prototype = {

  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 처음 처리
   * @return {void}
   */
  _init : function() {
    this._hasTab(); // 상단 탭 처리
    this._activeCurrentHashTab();
    this._addExternalTitle(); // 새창열림 타이틀 넣기
  },
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
   * @method
   * @desc 
   * $tabWrapper 상단 탭 엘리먼트
   * _hasTab $tabWrapper 존재여부
   * _initTab 실행
   */
  _hasTab: function() {
    this.$tabWrapper = this.$container.find('.tab-linker');
    this._hasTab = this.$tabWrapper.length > 0;
    this._initTab();
  },

  /**
   * @method
   * @desc _hasTab 이 true 일 때만 실행
   * $tabLinker 탭래퍼의 a 엘리먼트
   * $tabContentsWrapper 탭 연동 콘텐츠 엘리먼트
   * _ownHash 탭 이동시 사용하는 해쉬리스트
   * hashchange 이벤트 바인트
   * 탭 클릭 이벤트 바인드
   */
  _initTab: function() {
    if(!this._hasTab) return false;
    // 엘리먼트 설정
    this.$tabLinker = this.$tabWrapper.find('a');
    this.$tabContentsWrapper = this.$container.find('.tab-contents div[role="tabpanel"]');
    this._ownHash = _.reduce(this.$tabLinker, function(prev, next) {
      prev.push(next.hash.replace(/#/, ''));
      return prev;
    }, []);
    // 이벤트 바인드
    $(window).on('hashchange', $.proxy(this._activeCurrentHashTab, this)); // 해쉬 체인지 이벤트 
    this.$tabWrapper.on('click', 'li', $.proxy(this._tabClickLi, this));
    this.$tabLinker.on('click', $.proxy(this._tabClickHandler, this));
  },
  
  /**
   * @method
   * @desc _hasTab 이 true 일 때만 실행
   * _currentHashIndex 를 구해서 해당 탭 메뉴를 클릭 trigger 
   * 탭 메뉴선택시 기본 스크립트 동작으로 aria-selected 를 주는데 해시체인지로 이벤트 호출시에는 해당 동작을 하지 않으므로 추가적으로 설정해줌
   */
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

  /**
   * @desc [웹접근성] 접근성으로 접근시 링크에 직접 적용되지 않는 현상있어 a 링크 클릭효과
   * @param {event} e 
   */
  _tabClickLi: function (e) {
    $(e.currentTarget).find('a').click();
  },

  /**
   * @desc 탭 엘리먼트 클릭시 해당 콘텐츠 보이기 / 비해당 콘텐츠 가리기
   * @param {event} e 
   */
  _tabClickHandler: function(e) {
    this.$tabContentsWrapper.hide().addClass('blind none').attr('aria-hidden', true);
    this.$tabContentsWrapper.eq(this.$tabLinker.index(e.target)).show().removeClass('blind none').attr('aria-hidden', false);
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

    //tooltip 사용하지 않음 (혹시 필요할 수 있어 남겨 둠)
    $('.btn-tooltip-open', $container).click(function(){
      var toolpopId = $(this).attr('href');
      $('.popup-info', $container).removeClass('show');
      $(toolpopId).addClass('show');
      $('.tooltip-popup', $container).show();
    });
    $('.btn_confirm', $container).click(function(){
      $('.tooltip-popup', $container).hide();
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
  }
};

/**
 * @file [고객센터-메인]
 * @author Lee Kirim
 * @since 2018-12-27
 */

 /**
 * @class 
 * @desc 고객센터 class
 * @param {Object} rootEl - 최상위 element Object
 */
Tw.CustomerMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService();
  
  this._cachedElement();
  this._bindEvent();
  this._init();

  new Tw.XtractorService(this.$container);
};

Tw.CustomerMain.prototype = {
  _init: function () {
    if(!Tw.BrowserHelper.isApp()){
      $('#fe-post-bnnr').show();
    }
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - customer.main.html 참고
   */
  _cachedElement: function () {
    this.$fe_faq_search = this.$container.find('.fe-faq-search'); // 검색버튼
    this.$fe_faq_search_text = this.$container.find('.fe-faq-search-text'); // 검색 text input
    this.$surveyBtn = this.$container.find('.fe-survey-btn '); // 설문참여하기 버튼
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {
    this.$fe_faq_search.on('click', $.proxy(this._goToFaq, this)); // 검색하기 클릭
    this.$fe_faq_search_text.on('keyup', $.proxy(this._activateFaqSearch, this)); // 검색 text input 이벤트
    this.$fe_faq_search_text.siblings('.cancel').on('click', $.proxy(this._faqDelete, this)); // 검색 text 삭제 클릭
    this.$surveyBtn.on('click', $.proxy(this._goSurvey, this)); // 설문조사 이동 
  },

  /**
   * @function
   * @desc 검색입력 삭제 
   * @param {event} e 
   */
  _faqDelete: function (e) {
    this.$fe_faq_search_text.val('').trigger('keyup'); // 텍스트 삭제 및 밸리데이션 체크 trigger
    this.$fe_faq_search.prop('disabled', true); // 검색하기 버튼 비활성화
  },

  /**
   * @function
   * @desc 검색 input 입력 시
   * @param {event} e 
   */
  _activateFaqSearch: function (e) {
    // 이벤트 발생 키가 엔터인지 여부 boolean
    var isEnter = Tw.InputHelper.isEnter(e); 

    // 텍스트 입력이 공백이 아닐경우
    if ( !!this.$fe_faq_search_text.val().trim() ) {
       // 검색버튼 활성화
      this.$fe_faq_search.prop('disabled', false);

      if (isEnter) {
        // 엔터키 입력시 검색으로 이동
        this._goToFaq();
      }
    } else {
      // 검색버튼 비활성화
      this.$fe_faq_search.prop('disabled', true);
    }
  },

  /**
   * @function
   * @desc 검색으로 이동
   */
  _goToFaq: function () {
    if ( this.$fe_faq_search_text.val() !== '' ) {
      this._history.goLoad('/customer/faq/search?' + $.param({ keyword: this.$fe_faq_search_text.val() }));
    }
  },

  /**
   * @funcgion
   * @desc 설문조사로 이동
   * @param {event} e 
   */
  _goSurvey: function (e) {
    var link = $(e.currentTarget).data('link');
    if (!Tw.FormatHelper.isEmpty(link)) {
      this._history.goLoad(link);
    }
  }
};
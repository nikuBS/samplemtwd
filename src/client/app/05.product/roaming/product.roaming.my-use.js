/**
 * @file 나의 T로밍 이용현황 화면 처리
 * @author Juho Kim
 * @since 2018-11-20
 */

/**
 * @class
 * @param {Object} rootEl - 최상위 element
 * @param {Object} options - 설정 옵션
 */
Tw.ProductRoamingMyUse = function(rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._options = options;

  this._cachedElement();
  this._bindEvent();
  this._init();
};


Tw.ProductRoamingMyUse.prototype = {
  FE: {
    TAB: '.fe-myuse-tab',
    TABLIST: '.fe-myuse-tablist',
    LINK_BTN: '.fe-myuse-link-btn'
  },
  /**
   * @function
   * @desc jQuery 객체 캐싱
   */
  _cachedElement: function () {
    this.$tabLinker = this.$container.find(this.FE.TABLIST);
  },
  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function () {
    this.$tabLinker.on('click', this.FE.TAB, $.proxy(this._onTabChanged, this));
    this.$container.on('click', this.FE.LINK_BTN, $.proxy(this._onLinkBtn, this));
    this.$container.on('click', '.use-info-rm-more-btn button', $.proxy(this._onClickMoreToggleBtn, this));
  },
  /**
   * @function
   * @desc 최초 실행
   */
  _init : function() {
    this._initTab();
  },
  /**
   * @function
   * @desc 탭 선택 최초 실행
   */
  _initTab: function() {
    var hash = window.location.hash;
    if (Tw.FormatHelper.isEmpty(hash)) {
      hash = this.$tabLinker.find(this.FE.TAB).eq(0).attr('href');
    }

    setTimeout($.proxy(function () {
      this.$tabLinker.find('a[href="' + hash + '"]').trigger('click');
    }, this), 0);
  },
  /**
   * @function
   * @desc 탭 클릭 핸들러
   * @param {Object} e - 이벤트 객체
   */
  _onTabChanged: function (e) {
    // li 태그에 aria-selected 설정 (pub js 에서 제어)
    location.replace(e.currentTarget.href);

    // a 태그에 aria-selected 설정 (FE 에서 제어)
    this.$tabLinker.find(this.FE.TAB).attr('aria-selected', false);
    $(e.currentTarget).attr('aria-selected', true);
  },
  /**
   * @function
   * @desc 상품 클릭 핸들러
   * @param {Object} e - 이벤트 객체
   */
  _onLinkBtn: function (e) {
    var $target = $(e.currentTarget),
      url = $target.data('url'),
      prodId = $target.data('prod_id');

    if (url.indexOf('BEU:') !== -1) {
      return Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, url.replace('BEU:', '')));
    } else if (url.indexOf('NEU:') !== -1) {
      return this._openExternalUrl(url.replace('NEU:', ''));
    }

    this._historyService.goLoad(url + '?prod_id=' + prodId);
  },
  /**
   * @function
   * @desc 외부 페이지 오픈
   * @param {String} url - 페이지 url
   */
  _openExternalUrl: function(url) {
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 더보기 숨기기 버튼 클릭 핸들러
   */
  _onClickMoreToggleBtn: function(e) {
    var $target = $(e.currentTarget);

    if( $target.hasClass('active') ){
      $target.removeClass('active');
      // $('.rm-main-recomm>li:nth-child(n+4)').hide();
      // $('.rm-main-recomm>li').hide(); /* 191227 수정 [OP002-6034] */
      $('.list-comp-lineinfo li .use-info-box ul:nth-child(n+7)').hide();
      // $('.use-info-box .info-list:nth-child(n+7)').hide();
      $target.text('더 보기');
    } else {
      $target.addClass('active');
      // $('.rm-main-recomm>li').show();
      $('.list-comp-lineinfo li .use-info-box ul').show();
      // $('.use-info-box .info-list').show();
      $target.text('숨기기');
    }
  }

};

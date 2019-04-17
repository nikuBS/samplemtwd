/**
 * @file 상품 > 모바일요금제 > 조회 > Data 인피니티 혜택 조회
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-10-01
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 */
Tw.ProductMobileplanLookupTplan = function(rootEl, prodId) {
  // 컨테이너 레이어 선언
  this.$container = rootEl;

  // 공통 모듈 선언
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  // 공통 변수 선언
  this._prodId = prodId;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();
};

Tw.ProductMobileplanLookupTplan.prototype = {

  /* 상품코드 */
  _prodId: 'NA00006114',

  /* 혜택 상품코드 별 목록 필드명 */
  _prodIdList: {
    NA00006114: 'infiTravelList',
    NA00006115: 'infiMovieList',
    NA00006116: 'infiWatchList',
    NA00006117: 'infiClubList'
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnGoTop = this.$container.find('.fe-btn_go_top');
    this.$tab = this.$container.find('.fe-tab');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$btnCategory.on('click', $.proxy(this._openCategoryPopup, this));
    this.$btnGoTop.on('click', $.proxy(this._goTop, this));
    this.$tab.on('click', $.proxy(this._goTab, this));
  },

  /**
   * @function
   * @desc 탭 이동 이벤트 처리
   * @param e - 탭 클릭 이벤트
   */
  _goTab: function(e) {
    this._historyService.replaceURL('/product/mobileplan/lookup/tplan?s_prod_id=' + this._prodId + '&tab_id=' + $(e.currentTarget).data('key'));
  },

  /**
   * @function
   * @desc 혜택 카테고리 목록 산출
   * @returns {*}
   */
  _getBenefitCategory: function() {
    var currentProdId = this._prodId;

    return _.map(_.keys(this._prodIdList), function(prodId, index) {
      return {
        'label-attr': 'id="ra' + index + '"',
        'txt': Tw.PRODUCT_INFINITY_CATEGORY[prodId],
        'radio-attr':'id="ra' + index + '" data-prod_id="' + prodId + '" ' + (currentProdId === prodId ? 'checked' : '')
      };
    });
  },

  /**
   * @function
   * @desc 혜택 카테고리 선택 팝업 실행
   */
  _openCategoryPopup: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list': this._getBenefitCategory()
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindPopupEvent, this), $.proxy(this._onClosePopup, this), 'inifinity_category_popup', this.$btnCategory);
  },

  /**
   * @function
   * @desc 혜택 카테고리 선택 팝업 이벤트 바인딩
   * @param $popupContainer - 혜택 카테고리 선택 팝업
   */
  _bindPopupEvent: function($popupContainer) {
    $popupContainer.on('click', '[data-prod_id]', $.proxy(this._setGoCategory, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($popupContainer);
  },

  /**
   * @function
   * @desc 혜택 카테고리 선택 시
   * @param e - 선택 클릭 이벤트
   */
  _setGoCategory: function(e) {
    this._isGoCategory = true;
    this._goCategoryProdId = $(e.currentTarget).data('prod_id');
    this._popupService.close();
  },

  /**
   * @function
   * @desc 혜택 카테고리 선택 팝업 종료 시
   */
  _onClosePopup: function() {
    if (!this._isGoCategory) {
      return;
    }

    this._historyService.replaceURL('/product/mobileplan/lookup/tplan?s_prod_id=' + this._goCategoryProdId);
  },

  /**
   * @function
   * @desc TOP 으로 가기 이벤트 처리
   */
  _goTop: function() {
    $(window).scrollTop(0);
  }

};

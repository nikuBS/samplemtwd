/**
 * @file 이용안내 > 이용자피해예방센터 > 이용자 피해예방 가이드
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2018-10-24
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 */
Tw.CustomerDamageInfoGuide = function(rootEl) {
  // 컨테이너 레이어 설정
  this.$container = rootEl;

  // 공통 모듈 설정
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();
  this._category = this.$container.data('category');

  // Element 캐싱 및 이벤트 바인딩
  this._cachedElement();
  this._bindEvent();
};

Tw.CustomerDamageInfoGuide.prototype = {

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$btnCategory = this.$container.find('.fe-btn_category'); // 카테고리 설정 버튼
    this.$btnListMore = this.$container.find('.fe-btn_list_more');  // 목록 더보기 버튼
    this.$list = this.$container.find('.fe-list');  // 목록
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));  // 카테고리 설정 버튼 클릭시
    this.$btnListMore.on('click', $.proxy(this._showListMore, this)); // 더보기 버튼 클릭시
    this.$container.on('click', '.fe-link-external', $.proxy(this._confirmExternalUrl, this));  // 외부 링크 클릭 시
  },

  /**
   * @function
   * @desc 카테고리 설정 팝업
   * @param e - 카테고리 선택 버튼 클릭 이벤트
   */
  _openCategorySelectPopup: function(e) {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list':[
            { 'label-attr': 'id="ra1"', 'txt': Tw.PROTECT_GUIDE.VIDEO,
              'radio-attr':'id="ra1" data-category="video" ' + (this._category === 'video' ? 'checked' : '') },
            { 'label-attr': 'id="ra2"', 'txt': Tw.PROTECT_GUIDE.WEBTOON,
              'radio-attr':'id="ra2" data-category="webtoon" ' + (this._category === 'webtoon' ? 'checked' : '') },
            { 'label-attr': 'id="ra3"', 'txt': Tw.PROTECT_GUIDE.LATEST,
              'radio-attr':'id="ra3" data-category="latest" ' + (this._category === 'latest' ? 'checked' : '') }
          ]
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._categoryPopupBindEvent, this), $.proxy(this._goCategory, this), 'guide_category', $(e.currentTarget));
  },

  /**
   * @function
   * @desc 카테고리 설정 팝업 닫을 때
   */
  _goCategory: function() {
    if (this.$container.data('category') === this._category) {  // 선택된 값이 현재 카테고리와 같을때 추가 동작 하지 않음
      return;
    }

    this._history.goLoad('/customer/damage-info/guide?category=' + this._category);
  },

  /**
   * @function
   * @desc 카테고리 설정 팝업 이벤트 바인딩
   * @param $layer - 팝업 컨테이너 레이어
   */
  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '[data-category]', $.proxy(this._applyCategory, this));

    // 웹접근성 대응
    Tw.CommonHelper.focusOnActionSheet($layer);
  },

  /**
   * @function
   * @desc 카테고리 설정 팝업에서 카테고리 선택 시
   * @param e - 팝업에서 항목 클릭시 클릭 이벤트
   */
  _applyCategory: function(e) {
    this._category = $(e.currentTarget).data('category');
    this._popupService.close();
  },

  /**
   * @function
   * @desc 더보기 버튼 클릭시
   * @param e - 더보기 버튼 클릭 이벤트
   */
  _showListMore: function(e) {
    var hiddenLength = this.$list.find('li:hidden').length,
      listSize = this.$list.data('size');

    // 숨겨져 있는 개수가 더이상 없을때, 더보기 버튼 제거 등
    if (hiddenLength <= listSize) {
      this.$list.find('li:hidden').removeClass('none');
      $(e.currentTarget).parent().remove();
    }

    // 숨겨져 있는 개수가 리스트 페이지 개수 보다 적게 있을때, 일부만 노출
    if (hiddenLength > listSize) {
      this.$list.find('li:hidden:lt(' + listSize + ')').removeClass('none');
      $(e.currentTarget).find('span').text('(' + (hiddenLength - listSize) + ')');
    }
  },

  /**
   * @function
   * @desc 외부 링크 연결
   * @param e - 외부 링크 클릭 이벤트
   * @returns {*|void}
   */
  _confirmExternalUrl: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // 앱이 아닐땐 바로 연결
    if (!Tw.BrowserHelper.isApp()) {
      return this._openExternalUrl($(e.currentTarget).attr('href'));
    }

    Tw.CommonHelper.showDataCharge($.proxy(this._openExternalUrl, this, $(e.currentTarget).attr('href')));
  },

  /**
   * @function
   * @desc 외부 링크 연결
   * @param href - 링크 값
   */
  _openExternalUrl: function(href) {
    Tw.CommonHelper.openUrlExternal(href);
  }

};

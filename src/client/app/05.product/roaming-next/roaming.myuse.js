/**
 * @file roaming.myuse.js
 * @desc T로밍 > 나의 T로밍 이용현황
 * @author 황장호
 * @since 2020-09-30
 */

Tw.RoamingMyuse = function (rootEl, historyList, categoryNumber) {
// Tw.RoamingMyuse = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();


  new Tw.RoamingMenu(rootEl).install();

  if (historyList) { // 히스토리 내역이 있는 경우에만 실행
    this._cacheElements();
    this._bindEvents();
    this._init();  // 리스트 아이템 숨기기 - 좀더 위쪽에 배치할지 고민 - 오병소
  }


  // this.selectedCategory = (params && params.selectedCategory) || '2';
  this.selectedCategory = categoryNumber;
  // this.selectedCategory = '2';

  // 만약 히스토리가 있다면 그 부분부터 보여주기 (다른 페이지에서 히스토리 부터 보기 위해 들어온 경우)
  if (categoryNumber === '1') {
    $('#my-use-area').show()
  } else {
    $('#fe-history-area').show()
  }

};

Tw.RoamingMyuse.prototype = {

  _cacheElements: function () {
    this.$btnCategory = this.$container.find('#fe-category'); // 지난 여행 이력 보기 드랍다운 버튼
    this.$btnCategoryName = this.$container.find('#fe-category-name'); // 지난 여행 이력보기 드랍다운 버튼 이름
  },

  _bindEvents: function () {
    this.$btnCategory.on('click', $.proxy(this._onCategoryClicked, this));
    this.$container.on('click', '.fe-more', $.proxy(this._onShowMoreList, this)); // 더보기 버튼 구현
  },

  /**
   * @function
   * @desc 로밍 히스토리 맥스값 셋팅 및 리스트 중에서 3개 이상은 숨김 처리
   */
  _init: function () {
    this.nMaxListSize = 3;  // 로밍 히스토리 리스트 노출하는 최대 값
    this._hideListItem();
  },

    /**
   * @function
   * @desc 로밍 히스토리 리스트 중에서 3개 이상은 숨김 처리
   */
  _hideListItem: function () {
    $('.rm-myuse-history li').slice(this.nMaxListSize).hide();
  },

   /**
   * @function
   * @desc 더보기 버튼 처리
   */
  _onShowMoreList: function (e) {
    var elTarget = $(e.currentTarget);
    var $hideListItem = $('.rm-myuse-history li').not(':visible');

    if ( $hideListItem.size() !== 0 ) {
      // $hideListItem.slice(0, this.nMaxListSize).show();
      $hideListItem.show();
      elTarget.remove();  // 더보기 버튼 삭제
    }

    // if ( $hideListItem.size() <= this.nMaxListSize ) {
    //   elTarget.remove();
    // }
  },

  /**
   * @function
   * @desc 이용중인 요금제 및 로밍 이력정보 선택 시 actionsheet 실행
   */
  _onCategoryClicked: function (e) {
    var list = Tw.POPUP_TPL.ROAMING_MY_USE;


    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: list,
        btnfloating: {
          attr: 'type="button"',
          txt: Tw.BUTTON_LABEL.CLOSE
        }
      }, $.proxy(function ($root) {
        Tw.CommonHelper.focusOnActionSheet($root);
        /* 팝업 오픈 시 이전에 선택된 지역 체크 */
        $root.find('input#' + this.selectedCategory).attr('checked', true);

        $root.on('click', '.btn-floating', $.proxy(function () {
          this._popupService.close();
        }, this));
        $root.on('click', 'input[type=radio]', $.proxy(function (e) {
          // var selectedLocationName = $(e.currentTarget).data('location'); /* templete.type.js에서 사용자 정의 속성,  필요 없을듯*/
          // 동일한것 선택하면 서버 태우지 않고 바로 팝업 종료
          // if (this.selectedCategory === $(e.currentTarget).attr('id') ) {
          //   this._popupService.close();
          // }

          var newCategory = $(e.currentTarget).attr('id');
          if(this.selectedCategory === newCategory) { // 액션시트에서 현재 선택된 카테고리가 기존과 같은지 여부
            this._popupService.close();
            return;
          } else {
            this.selectedCategory = newCategory;  // 선택된 카테고리 id를 반영
            this.$btnCategoryName.text($(e.currentTarget).data('location'));  // 선택한 카테고리 이름을 반영
            this._popupService.close();
            $.proxy(this._renderSelectedArea(), this);  // 선택된 영역 보여주기(히스토리 또는 이용 중인 요금제)
          }
          
          // this.selectedCategory = $(e.currentTarget).attr('id') ;

          // if (this.selectedCategory === '1')

          // var url = '/product/roaming/my-use?useInfo=' + this.selectedCategory;
          // url += '&locationOrder=' + (this.selectedCategory ? this.selectedCategory : '1') + '&locationOrderName=' + selectedLocationName;
          // this._historyService.goLoad(url);
        }, this));
      }, this),
      null,
      null,
      $(e.currentTarget));
  },


  /**
   * @function
   * @desc 선택된 액션시트 번호에 맞는 영역 노출
   * @private
   */
  _renderSelectedArea: function () {

    if (this.selectedCategory === '1') {
      this.$container.find('#my-use-area').show();
      this.$container.find('#fe-history-area').hide();
    } else {
      this.$container.find('#fe-history-area').show();
      this.$container.find('#my-use-area').hide();
    }
  }

};
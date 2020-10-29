/**
 * @file 미리납부하신 금액(MIRI)
 * @author 양정규
 * @since 2020-10-19
 */

/**
 * @param {Object} rootEl - 최상위 element Object
 */
Tw.MyTFareInfoMiri = function (rootEl) {
    this.$container = rootEl;
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._historyService = new Tw.HistoryService(rootEl);
  
  
    this._init();
  };
  
  Tw.MyTFareInfoMiri.prototype = {
  
    /**
     * @desc 초기설정
     * @private
     */
    _init: function () {
      this._cachedElement();
      this._bindEvent();
    },
  
    /**
     * @desc element 변수 초기화
     * @private
     */
    _cachedElement: function () {
      this._count = this.$container.find('.fe-count'); // 총 건수
      this._emptyData = this.$container.find('.fe-empty-data'); // 내용 없음 영역
      this._miriList = this.$container.find('.fe-miri-list'); // MIRI 리스트 영역
      this._filter = this.$container.find('.fe-filter'); // 필터 조건
      this._btnMore = this.$container.find('.fe-more');  // 더보기 버튼
    },
  
    /**
     * @desc 이벤트 바인딩
     * @private
     */
    _bindEvent: function () {
      this._filter.on('click', $.proxy(this._onChangeFilter, this));
      this._btnMore.on('click', $.proxy(this._moreView, this));
    },
  
    /**
     * @function
     * @desc 유형선택 액션시트
     * @param event
     */
    _onChangeFilter: function (event) {
      var $target = $(event.currentTarget);
  
      this._popupService.open({
        url: '/hbs/',
        hbs: 'actionsheet01_en',
        layer: true,
        data: [
            {
              'list': [
                { 'label-attr': 'id="0"', 'radio-attr': 'id="0" name="r2"', txt: 'ALL' },
                { 'label-attr': 'id="4"', 'radio-attr': 'id="4" name="r2"', txt: 'Paid from MIRI History' },
                { 'label-attr': 'id="1"', 'radio-attr': 'id="1" name="r2"', txt: 'MIRI Top-up History' }
              ]
            }
          ],
        btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
      }, $.proxy(this._selectPopupCallback, this, $target), null, null ,$target);
    },
  
    /**
     * @function
     * @desc actionsheet event binding
     * @param $target
     * @param $layer
     */
    _selectPopupCallback: function ($target, $layer) {
      Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
  
      var $id = $target.attr('id');
      if (!Tw.FormatHelper.isEmpty($id)) {
        $layer.find('input#' + $id).attr('checked', 'checked');
      }
      $layer.on('change', '.ac-list', $.proxy(this._onChangeSelect, this, $target));
    },
  
    /**
     * @function
     * @desc 액션시트 선택 완료 이벤트
     * @param $target
     * @param event
     * @private
     */
    _onChangeSelect: function ($target, event) {
      this._setSelectedValue($target, event);
      this._reLoadFilter(event);
    },
  
    /**
     * @function
     * @desc 선택된 값 셋팅
     * @param $target
     * @param event
     */
    _setSelectedValue: function ($target, event) {
      var $selectedValue = $(event.target);
      $target.attr('id', $selectedValue.attr('id'));
      $target.text($selectedValue.parents('label').text());
  
      this._popupService.close();
    },
  
    /**
     * @desc 변경된 필터조건으로 리스트 생성
     * @param event
     * @private
     */
    _reLoadFilter: function (event) {
      var $selectedValue = $(event.target);
      this.$container.find('.fe-miri-item').addClass('none');
      this.$container.find('.fe-miri-info').addClass('none');
      this._reRender($selectedValue.attr('id'));
    },
  
    /**
     * @function
     * @desc 더보기
     * @private
     */
    _moreView: function () {
      this._reRender(this._filter.attr('id'), true);
    },
  
    /**
     * @function
     * @desc 상단 필터선택, 하단 더보기에서 사용하는 공통 리스트 렌더
     * @param type 4:선납차감, 1: MIRI 충전
     * @param isMoreView 더보기에서 사용할지 유무
     * @private
     */
    _reRender: function (type, isMoreView) {
      var selectItems = type === '0' ?  this.$container.find('[data-pay-cl-cd]') : this.$container.find('[data-pay-cl-cd="'+ type +'"]');
      // 더보기 일때
      if (isMoreView){
        selectItems = selectItems.filter('.none');
      } else { // 상단 필터 검색일때
        var count = selectItems.length;
        var isHide = count < 1;
        this._emptyData.toggleClass('none', !isHide);
        this._miriList.toggleClass('none', isHide);
        this._btnMore.toggleClass('none', isHide);
        this._count.text(count);
      }
      $.each(selectItems.slice(0, 20), function (idx, item) {
        $(item).removeClass('none').closest('.fe-miri-item').removeClass('none');
      });
      this._btnMore.toggleClass('none', selectItems.length <= 20);
    },
  
 
  };
  
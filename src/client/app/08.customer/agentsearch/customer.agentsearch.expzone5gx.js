/**
 * @file 5gx 체험존 검색 화면 처리
 * @author ByungSo Oh
 * @since 2019-05-30
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 * @param  {String} params - query params
 */
Tw.CustomerAgentExpzone5gxSearch = function (rootEl, params) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this.fiveOptionNames = {"0": "전체", "1": "5GX 체험존", "2": "VR 체험존"};
  this.fiveOptionType = params.fiveOptionType;
  
  this.selectedLocationCode = params.locationOrder;
  this._searchedItemTemplate = Handlebars.compile($('#tpl_search_result_item').html());
  
  this._cacheElements();
  this._bindEvents();
  this.$inputSearch.trigger("keyup");
};

Tw.CustomerAgentExpzone5gxSearch.prototype = {

    /**
   * @desc jquery 객체 캐싱
   */
  _cacheElements: function () {
    this.$inputSearch = this.$container.find('#fe-input-search'); /* 검색 인풋 박스 */
    this.$btnSearch = this.$container.find('#fe-btn-search'); /* 검색 버튼 */
    this.$divNone = this.$container.find('.fe-none'); /* 검색 결과가 없을때 표시하는 부분 - 퍼블에 없었던 부분 */
    this.$ulResult = this.$container.find('#fe-result-list');
    this.$resultCount = this.$container.find('#fe-result-count');
    this.$filters = this.$container.find('.fe-select-filter');  /* 5gxZone and vrZone 필터링 부분 */
  },

    /**
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$container.on('keyup', 'input', $.proxy(this._onInput, this));
    this.$container.on('click', '.cancel', $.proxy(this._onInput, this)); /* 글자를 하나씩 지우는게 아니라 삭제버튼으로 지웠을때도 검색버튼 비활성화 처리 */
    this.$container.on('click', '#fe-btn-search', $.proxy(this._onSearchRequested, this));  /* 검색 버튼 눌렀을때의 처리 */
    this.$container.on('click', '.fe-branch-detail', $.proxy(this._onBranchDetail, this));  /* 체험존 매장 리스트 중 하나를 클릭 했을때의 처리 */
    this.$container.on('click', '#fe-cancel-search', $.proxy(this._onCancelInput, this)); // 검색 아래의 삭제 버튼 클릭 처리
    this.$container.on('click', '.fe-go-page,#fe-go-first,#fe-go-prev,#fe-go-next,#fe-go-last',
      $.proxy(this._onPaging, this)); // 체험존 리스트의 페이징 처리
    this.$container.on('click', '.fe-location-category', $.proxy(this._onLocationCategory, this));  /* 지역 선택 액션시트 팝업 */
    this.$container.find('.fe-select-filter').click(_.debounce($.proxy(this._openZoneFilterPopup, this), 300));  /* 5gxZone and vrZone 필터링 부분 이벤트 바인딩 */
  },


    /**
   * @desc 사용자가 필터 클릭 시
   * @param {Event} e 클릭 이벤트 객체
   * @private
   */
  _openZoneFilterPopup: function(e) {
    var $target = $(e.currentTarget);
   
    this._popupService.open(
      {
        hbs: 'CS_16_01_L01',
        filters: this.fiveOptionType,
        layer: true
      },
      $.proxy(this._handleOpenSelectFilterPopup, this)
    );

  },  // end of _openZoneFilterPopup


   /**
   * @desc 필터 변경 팝업 오픈 시 팝업에 이벤트 바인딩
   * @param {$object} $layer 팝업 레이어 jquery 객체
   * @private
   */
  _handleOpenSelectFilterPopup: function($layer) {

    /* fiveOptionType가 0이라면 전체를 선택, 그외는 fiveOptionType-1 번째를 선택-eq(0) 부터 시작 */
    var $checkbox = this.fiveOptionType == 0 ? this.$container.find('.select-list li input') : this.$container.find('.select-list li:eq(' + (parseInt(this.fiveOptionType) - 1) + ') input');
    $checkbox.attr('checked', true).closest('.checkbox').addClass('checked').attr('aria-checked',true); 
   
    $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
    $layer.on('click', '.resetbtn', $.proxy(this._handleResetFilters, this, $layer));
  },


  /**
   * @desc 필터 팝업에서 적용하기 버튼 클릭 시 필터 적용
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   * @private
   */
  _handleSelectFilters: function($layer) {

    var zoneValue = "0";
    if($('.select-list li input:checked').size()  == 1){
      zoneValue = $('.select-list li input:checked').val()
    }

    if ( zoneValue == this.fiveOptionType){
      this._popupService.close();
      return;
    }

    this.fiveOptionName = this.fiveOptionNames[zoneValue];
    this.fiveOptionType = zoneValue;

    this._historyService.goLoad(this._getSearchUrl(null, false));
  },


  /**
   * @desc 필터 선택 초기화 버튼 클릭 시 선택된 필터 지움
   * @param {$object} $layer 필터 변경 팝업 레이어 jquery 객체
   * @private
   */
  _handleResetFilters: function($layer) {
    var selectedFilters = $layer.find('li[aria-checked="true"]');
    selectedFilters.attr('aria-checked', false).removeClass('checked');
    selectedFilters.find('input').removeAttr('checked');
  },


  /**
   * @function
   * @desc 검색어 입력에 따른 이벤트 처리(검색 버튼 활성/비활성 처리)
   * @param  {Object} e - keyup event
   */
  _onInput: function (e) {
    var text = e.currentTarget.value.trim();
    var enable = Tw.FormatHelper.isEmpty(text) ? false : true;

    if (enable) {
      this.$btnSearch.removeAttr('disabled');
    } else {
      this.$btnSearch.attr('disabled', 'disabled');
    }   
  },


  /**
   * @function
   * @desc 지역선택 시 actionsheet로 옵션 표기해줌
   */
  _onLocationCategory: function () {
    var list = Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_LOCATION;


    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      data: list,
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function ($root) {
      $root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      $root.on('click', 'input[type=radio]', $.proxy(function (e) {
        var selectedLocationName = $(e.currentTarget).data('location'); /* templete.type.js에서 사용자 정의 속성 */
        this.selectedLocationCode = $(e.currentTarget).attr('id');
        this.$container.find('#fe-select-location').text(selectedLocationName);
        this._popupService.close();
        this._historyService.goLoad(this._getSearchUrl(null, true));
      }, this));
    }, this));
  },


  /**
   * @function
   * @desc 검색 버튼 클릭 시 검색결과 요청
   * @param  {Object} e - click event
   */
  _onSearchRequested: function (e) {
    /* url 조합해서 조회 - 페이지 리로딩 */
    this._historyService.replaceURL(this._getSearchUrl(e, true));
  },

  /**
   * @function
   * @desc 하단 page navigation 선택에 따른 처리
   * @param  {Object} e - click event
   */
  _onPaging: function (e) {
    var $target = $(e.currentTarget);
    if ($target.hasClass('active') || $target.hasClass('disabled')) {
      return;
    }

    var page = $target.data('page');
    if ($target.hasClass('fe-go-page')) {
      page = $target.text();
    }

    this._historyService.goLoad(this._getSearchUrl(null, false, page));
  },

  /**
   * @function
   * @desc 검색결과 server rendering 을 위한 query param 생성
   * @param  {Object} e - click event
   * @param  {Boolean} bySearchBtn - 검색 버튼을 통한 검색인지, pagination을 통한 검색인지
   * @param  {Number} page - bySearchBtn true 인 경우 targeting 할 page 번호
   */
  _getSearchUrl: function (e, bySearchBtn, page) {
    var url = '/customer/agentsearch/expzone5gx?keyword=';

    if (bySearchBtn) {
      url += this.$inputSearch.val();
      var locationOrderName = this.$container.find('#fe-select-location').text().trim();
      url += '&locationOrder=' + (this.selectedLocationCode ? this.selectedLocationCode : '1') + '&locationOrderName=' + locationOrderName;
    } else {
        url += this.$inputSearch.val();
        var locationOrderName = this.$container.find('#fe-select-location').text().trim();
        
        url += '&locationOrder=' + (this.selectedLocationCode ? this.selectedLocationCode : '1') + '&locationOrderName=' + locationOrderName;
        url += '&fiveOptionType=' + (this.fiveOptionType ? this.fiveOptionType : '1') + '&fiveOptionName=' + this.fiveOptionName;  
        url += '&page=' + (Tw.FormatHelper.isEmpty(page) ? 1 : page);
    } 
    return url;
  },

  /*  // page navigation으로 변경 - 기존 더보기 관련 주석 처리 되어 있었음
  _onMoreRequested: function () {
    this._lastQueryParams.currentPage = this._page;
    this._apiService.request(this._lastCmd, this._lastQueryParams)
      .done($.proxy(this._onMoreResult, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },
  _onMoreResult: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$ulResult.append(this._searchedItemTemplate({
        list: res.result.regionInfoList
      }));

      if (res.result.lastPageType === 'Y') {
        this.$divMore.addClass('none');
      } else {
        this.$divMore.removeClass('none');
      }

      this._page++;
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },
  */

  /**
   * @function
   * @desc 지점 선택시 해당 지점 상세화면으로 이동
   * @param  {Object} e - click event
   */
  _onBranchDetail: function (e) {
    if (e.target.nodeName.toLowerCase() === 'button') { /* 지점 선택이지만 전화 걸기 부분이라서 아무런 동작 하지 않음 */
      return;
    }

    var code = $(e.currentTarget).attr('value');
    /* expzone 요청 플래그 */
    var isExpZone = true; 
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code + '&isExpZone=' + isExpZone);  /* expzone에서 요청 플래그 */
  },

  /**
   * @function
   * @desc 필요한 경우 호출하여 과금 팝업 발생, 동의 시 콜백 실행 - 이 소스에서는 현재 사용하지 않음
   * @param  {Function} onConfirm - 동의 시 실행할 callback
   */
  _showDataChargePopup: function (onConfirm) {
    this._popupService.openConfirm(
      Tw.POPUP_CONTENTS.NO_WIFI,
      null,
      $.proxy(function () {
        this._popupService.close();
        onConfirm();
      }, this)
    );
  },

  /**
   * @function
   * @desc 검색필드에 x버튼으로 입력 내용 삭제 시 필요한 처리
   * @param  {Object} e - click event
   */
  _onCancelInput: function (e) {
    var $target = $(e.currentTarget);
    if ($target.attr('id').indexOf('search') !== -1) {
      this.$btnSearch.attr('disabled', 'disabled');
    } 
  }
};
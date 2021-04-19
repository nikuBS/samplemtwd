Tw.ProductRenewalList = function(rootEl, params, svcInfo, series, hasNext, networkInfo, cdn, isCompare) {
    this.$container = rootEl;
    this._params = params; //  검색 필터용 params
    this._params.searchLastProdId = ''; // 탭 없는 랜딩페이지 시 추가된 searchLastProdId 초기화
    this._svcInfo = svcInfo;
    this._series = series;
    this._hasNext = hasNext; // 스크립트에서 추가 리스트 로딩이 있는지
    this._networkInfo = networkInfo; //사용자의 통신망 정보
    this._isCompare = isCompare; // 비교하기 노출 플래그
    this._checkDefault = 'N'; //전체리스트 Default 페이지 랜딩 인지 확인
    this._curNetworkCount = 1; // 전체리스트 Default 페이지 추가 호출 횟수 count
    this._cdn = cdn; 
    this._remainGroupData = 0; //요금제 시리즈 API에서 호출 후 시리즈가 5개 이상인지 체크
    this._curRemainGroupData = 0; //요금제 시리즈 API에서 호출 후 화면에 표시 하지 않은 시리즈가 있는지 (그룹은 5개씩 노출)
  
    this.CODE_PRODUCT = 'F01100';
    this.CODE_PLAN = 'F01120';
    this.CODE_5G = 'F01713';
    this.CODE_LTE = 'F01121';
    this.CODE_3G = 'F01122';
    this.CODE_2nd = 'F01124';
    this.CODE_PPS = 'F01125';
    this.CODE_THEME = 'F01180';

    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._historyService = new Tw.HistoryService();
  
    this._bindEvent();
    this._init();

  };

Tw.ProductRenewalList.prototype = {
    _init: function() {
      this.themeParam = this._getParameter('theme');//테마 코드 얻어옴
      this._listTmpl = Handlebars.compile(Tw.RENEWAL_PRODUCT_LIST_VIEW_MORE_MODULE); // 시리즈 별 요금제 핸들바
      this._listDefaultTmpl = Handlebars.compile(Tw.RENEWAL_PRODUCT_LIST_VIEW_MORE_MODULE_DEFAULT); // 단일 상품 요금제 핸들바
      this.curFilter = this._checkFilter(); // 현재 필터 정보 가져옴
      this.curMobileFilter = this._checkMobilefilter(); // 현재 탭 정보 가져옴
      this._loadNotice(); // 툴팁 노출 여부
      this._scrollFocus(); //탭 제목이 보이도록 포커스 이동
      this._setInfinityScroll(); // 스크롤 하단으로 이동 시 요금제 리스트(시리즈 자동 로딩)
      this._checkTheme();// 테마 탭인지 확인 후 해당 테마 위치로 스크롤
    },

    _bindEvent: function() {
      $('.filterBtn').click(_.debounce($.proxy(this._handleClickChangeFilters, this), 30)); //필터 버튼 클릭 시
      $('.resetBtn').click(_.debounce($.proxy(this._initialFilter, this), 30)); // 초기화 버튼 클릭 시
      $('#themeSelectBtn').click($.proxy(this._goToTheme, this)); // 테마 텝 선택 시
      $('.f-del-list').click($.proxy(this._goDeleteFilter, this));//필터 란에서 필터 X 버튼
      $('.filterInitialization').click(_.debounce($.proxy(this._initFilterPopup, this), 30)); //필터 버튼 클릭 시
    },

    _initFilterPopup: function(e){
      this.curFilter = [];
      var $target = $(e.currentTarget);
      this._handleClickChangeFilters($target);
    },

    _scrollFocus: function() { // 탭 제목 보이도록 상단 스크롤 이동 (퍼블리셔님이 준 스크립트)
      if(this.curMobileFilter[0] !== undefined || this.themeParam !== '') { 
        var $tabWrap = $('.tod-nmp-tab').find('ul');
        var tabWidth = $tabWrap.width();
        var onWidth = $tabWrap.find('.on').width();
        var onPosi = $tabWrap.find('.on').position();
        var onTotalPosi = onPosi.left + onWidth;
        if(onTotalPosi > tabWidth) {
          $tabWrap.scrollLeft(onPosi.left - 20);
        }
      }
  
      //스크롤시 헤더 숨김 및 tab 고정
      $(document).scroll(function() {
        if($(this).scrollTop() > 51 ) {
          $('.tod-nmp-top-wrap').addClass('tod-nmp-scroll-fixed');
        } else {
          $('.tod-nmp-top-wrap').removeClass('tod-nmp-scroll-fixed');
        }
      });
    },

    _loadNotice: function() { // Notice 최초 전체 진입 화면에서만 출력
      if((this.curFilter == [] || this.curFilter[0] == undefined) && (this.curMobileFilter[0] == undefined || this.curMobileFilter == [])) {
        if(this.themeParam !== '') {
        } else {
          $('.rn-notice').css('display','block');
          $('.btn-nb-close').click(function(){$('.rn-notice').css('display','none');});
          this._checkDefault = 'Y';
        }
      }
    },

    _checkTheme: function() { // 테마요금제 진입 시 선택한 테마로 이동
      if(this.themeParam !== '' && this.themeParam !== 'all') { 
        $(window).scrollTop($('[data-theme="' + this.themeParam + '"]').offset().top - $('.rn-prod-inner').height());
      }
    },

    _goToTheme: function(e) { // 테마요금제 진입 시 필터가 있으면 컨펌 창 띄움
      this.destinationUrl = '/product/renewal/mobileplan/list?theme=all';
      if((this.curFilter[0] !== undefined && this.curFilter[0] !== '' && this.curFilter[0] !== null)) {
        this._loadFilterConfirmPopup(e);
      } else {
        this._historyService.replaceURL(this.destinationUrl);
      }
    },

    _goDeleteFilter: function(e) { // 필터 항목 제거
      var deletedFilter = e.currentTarget.dataset.filterid;
      if(deletedFilter == '') {
        this._historyService.replaceURL('/product/renewal/mobileplan/list?filters='+this.curMobileFilter[0]);
      } else {
        var nextFilter = this.curFilter.filter(
          function(fil){
            return fil !== deletedFilter;
          });
        var nexturl = '';
        for(var i = 0; i < nextFilter.length; i++){
          if(nextFilter[i] !== '' && nextFilter[i] !== undefined) {
            nexturl += nextFilter[i];
            nexturl += ',';
          }
        }
        nexturl = nexturl.slice(0,-1);

        if(this.curMobileFilter.length !== 0) {
          if(nexturl !== ''){
            nexturl += ',';
          }
          nexturl += this.curMobileFilter[0];
        }
        if(nexturl == '' || nexturl.length == 0){
          this._historyService.replaceURL('/product/renewal/mobileplan/list');
        } else {
          nexturl = '/product/renewal/mobileplan/list?filters=' + nexturl;
          this._historyService.replaceURL(nexturl);
        }
      }
    },

    _popupQuickFilter: function() { // 퀵필터 항목 초기화 시
      this._popupService.open({
          url: '/hbs/',
          hbs: 'renewal.product.initial.confirm',
          data: '확인을 누르시면 <br> 선택하신 퀵필터 항목이 초기화 됩니다.',
          layer: true
        },
        $.proxy(this._onOpenquickinitialPopup, this),
        $.proxy(this._onClosequickinitailPopup, this),
        'initialQuickFilter',
        null);
    },

    _onOpenquickinitialPopup: function() { 
      $('#initialCancel').click(_.debounce($.proxy(this._popupService.close, this), 30));
      $('#initialConfirm').click($.proxy(this._handleResetQuickFilters, this));
    },

    _onClosequickinitailPopup: function() {

    },

      
    _checkFilter: function() { //url상의 필터 중에 기기 관련 필터 제거
      var urlFilterArr = this._getParameter('filters').split(',');
      var curfilterArr = urlFilterArr.filter($.proxy(this._getfilter,this));
      if(curfilterArr[0] !== '' && curfilterArr !== []) {
        return curfilterArr;
      } else {
        return [];
      }
    },

    _checkMobilefilter: function() { //url상의 필터 중 기기 관련 필터만 얻어옴
      var urlFilterArr = this._getParameter('filters').split(',');
      var curMobilefilterArr = urlFilterArr.filter($.proxy(this._getMobilefilter,this));
      if(curMobilefilterArr[0] !== '' && curMobilefilterArr !== []) {
        return curMobilefilterArr;
      } else {
        return [];
      }
      
    },

    _getfilter: function(split) {
      return !(split == this.CODE_5G || split == this.CODE_LTE || split == this.CODE_3G || split == this.CODE_2nd || split == this.CODE_PPS);
    },

    _getMobilefilter: function(split) {
      return (split === this.CODE_5G || split === this.CODE_LTE || split === this.CODE_3G || split === this.CODE_2nd || split === this.CODE_PPS);
    },

    _getParameter: function(name) { // name의 get 파라미터를 가져옴
      var params = location.search.substr(location.search.indexOf('?') + 1);
      var value = '';
      var temp;
      params = params.split('&');
      for (var i=0; i < params.length; i++) {
          temp = params[i].split('=');
          if ( [temp[0]] == name ) { 
            value = temp[1];
          }
      }
      return value;
    },

    

    _initialFilter: function(e) { // 초기화 버튼 클릭시
        if(this.curMobileFilter[0] !== undefined && this.curMobileFilter[0] !== '') {
          this.destinationUrl = '/product/renewal/mobileplan/list?filters=' + this.curMobileFilter[0];
        } else {
          this.destinationUrl = '/product/renewal/mobileplan/list';
        }
        this._loadFilterConfirmPopup(e);
    },

    _loadFilterConfirmPopup: function(e) { // 필터 초기화 시 알럿 노출
      this._popupService.open({
        url: '/hbs/',
        hbs: 'renewal.product.initial.confirm',
        data: '확인을 누르시면 선택하신<br>필터 항목이 초기화 됩니다.',
        layer: true
        },
        $.proxy(this._onOpeninitialPopup, this, $(e.currentTarget)),
        $.proxy(this._onCloseinitailPopup, this, $(e.currentTarget)),
        'initialFilter',
        $(e.currentTarget));
    },

    _onOpeninitialPopup: function($target) {
      var _this = this;
      $('#initialCancel').click(_.debounce($.proxy(this._popupService.close, this), 500));
      if($target.data('code')) { // 퀵필터 버튼 일 경우
        $('#initialConfirm').click($.proxy(function() {
          var MobileFilterForQuick = (_this.curMobileFilter[0] == '') || (_this.curMobileFilter[0] == undefined) ? _this._networkInfo[0] : _this.curMobileFilter[0]; 
          _this._historyService.replaceURL('/product/renewal/mobileplan/list?filters=' + MobileFilterForQuick + ',' + $target.data('code'));
        }));
      } else { // 초기화 버튼일 경우
        $('#initialConfirm').click($.proxy(_this._initFilter, this));
      }
    },

    _onCloseinitailPopup: function() {

    },

    _initFilter: function() {
        this._historyService.replaceURL(this.destinationUrl);
    },

    _handleClickChangeFilters: function(e) {
      var $target = $(e.currentTarget);
      if (!this._filters) { // 필터 리스트가 없을 경우 BFF에 요청
        this._apiService.requestArray([
          { command: Tw.API_CMD.BFF_10_0032, params: { idxCtgCd: this.CODE_PRODUCT }},
          { command: Tw.API_CMD.BFF_10_0033, pathParams: ['F01170']}
        ]).done($.proxy(this._handleLoadFilters, this, $target));
        
      } else {
        this._openSelectFiltersPopup($target);
      }
      
    },

    _handleLoadFilters: function($target, filterResp, quickFilterResp) { // API로 받아온 데이터로 필터 열음 ( 현재 안씀 )
      if (filterResp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(filterResp.code, filterResp.msg).pop();
        return;
      }
      if (quickFilterResp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(quickFilterResp.code, quickFilterResp.msg).pop();
        return;
      }
  
      this._filters = filterResp.result;
      this._filters.quickFilters = quickFilterResp.result.filters;
      this._filters.filters = _.map(this._filters.filters, $.proxy(this._escapeHtmlEntities, this));
      this._openSelectFiltersPopup($target);
    },

    _openSelectFiltersPopup: function($target) { // 필터 팝업 띄움
      this._popupService.open({
          hbs: 'renewal.mobileplan.list.filter',
          layer: true,
          data: this._filters
        },
        $.proxy(this._handleOpenSelectFilterPopup, this),
        $.proxy(this._handleCloseSelectFilterPopup, this),
        'search',
        $target
      );
    },

    _handleOpenSelectFilterPopup: function() { //필터 팝업 열릴 시 콜백 함수

      var _this = this;
      var MobileFilterForQuick = (this.curMobileFilter[0] == '') || (this.curMobileFilter[0] == undefined) ? this._networkInfo[0] : this.curMobileFilter[0];
      
      $('.prev-step').click(_.debounce($.proxy(_this._popupService.close, this), 500));
      
      var checkFilter = '';
      $('body').on('click','.quickFilterBtn',$.proxy(function(e) { // 현재 골라진 필터가 있는지 확인
        if($('.curFilter').length > 0) {
          for(var i = 0; (i < $('.curFilter').length) && (checkFilter == ''); i++) {
            if($('.curFilter').eq(i).css('display') != 'none') {
              checkFilter = 'Y';
            }
          }
          if(checkFilter == 'Y') {
            _this._loadFilterConfirmPopup(e);
          } else {
            _this._historyService.replaceURL('/product/renewal/mobileplan/list?filters=' + MobileFilterForQuick + ',' + e.currentTarget.dataset.code);
          }
          
        } else {
          _this._historyService.replaceURL('/product/renewal/mobileplan/list?filters=' + MobileFilterForQuick + ',' + e.currentTarget.dataset.code);
        }
        }, this));
        
      $('.reset').click($.proxy(this._handleResetFilters, this));
      $('.confrim').click($.proxy(this._confirmFilter, this));

      var $headerH = $('.page-header').height();
      var $checked = $('.check-box > ul > li > a');
      $(".filter-wrap").scroll(function() {    
          var scroll = $(".filter-wrap").scrollTop();
          if (scroll > $headerH - 66) {//66 active된 상태에서의 header
            $('.container-wrap').addClass('active');
          } else {
            $('.container-wrap').removeClass('active');
          }
      });

      if(this.curFilter) { // 현재 적용된 필터 항목 하단에 표시
        for(var a=0 ; a < this.curFilter.length ; a++) {
          
            $('[data-filter="' + this.curFilter[a] + '"]').parent("li").addClass('on');
            $('#selectFilter').append('<li class="curFilter" data-filtersummary="' + this.curFilter[a] +
                '"><span class="f-keyword">'+ $('[data-filter="' + this.curFilter[a] + '"]').data('filtername') +
                '<button type="button" class="f-del f-del-filter"><span class="blind">삭제</span></button></span></li>');
            if($('[data-filter="' + this.curFilter[a] + '"]').data('filtername') == undefined) {
              $('[data-filtersummary="' + this.curFilter[a] + '"]').css('display','none');
            }
          if($('[data-code="' + this.curFilter[a] + '"]')){
            $('[data-code="' + this.curFilter[a] + '"]').parent('li').addClass('on');
          }
        }
        
      }

      $checked.on('click', function() { // 항목 선택 시 하단에 선택한 필터 항목 표시
        var $quickFilterBtn = $('.popup-page > div > .tod-renewal-product-tab > .rn-prod-inner > ul > li');
        var quickFilterCheck = false;
        for(var i = 0; (i < $quickFilterBtn.length) && !quickFilterCheck; i++) { // 퀵필터가 선택되어 있는지 확인
          quickFilterCheck = $quickFilterBtn.eq(i).hasClass('on');
        }
        if(quickFilterCheck) { // 퀵 필터가 선택되어 있을 때
          _this._popupQuickFilter();
        } else { // 하단 필터 리스트에 선택된 필터 추가
          if($(this).parent('li').hasClass('on')) {
            $(this).parent('li').removeClass('on');
            $('[data-filtersummary="' + $(this).data('filter') + '"]').remove();
          } else {
            $(this).parent('li').addClass('on');
            $('#selectFilter').append('<li class="curFilter" data-filtersummary="' + $(this).data('filter') +
              '"><span class="f-keyword">'+ $(this).data('filtername') +
              '<button type="button" class="f-del f-del-filter"><span class="blind">삭제</span></button></span></li>');
            setTimeout(function() {
              $('.f-del-filter').click($.proxy(_this._deleteSelectFilter, this));
            },500);
          }
        }
      });
      this._filterScript();
      this.$container.find('.f-del-filter').click($.proxy(this._deleteSelectFilter, this));
    },

    _filterScript: function() { // 버튼 클릭시 필터 헤더부분 숨김
      var $element = $('button.list-box').closest('li'),
          offsetTop = [],
          index = 0;
      // 엘리먼트 높이값 계산 - document가 스크롤되는 것이 아닌 filter-wrap이 스크롤(offset top이 유동적으로 변경됨)이 되어 높이값을 초기에 계산한다.
      setTimeout(function () {
          $element.each(function (index, element) {
              offsetTop[index] = $(element).offset().top - $('.tod-renewal-product-tab').outerHeight();
          });
      }, 200);
      // 버튼 클릭시 스크롤 이동
      $('button.list-box').on('click', function () {
          if ($(this).attr('aria-pressed') === 'false') {
              index = $element.index($(this).closest('li'));
              setTimeout(function () {
                  $(".filter-wrap").scrollTop(offsetTop[index]);
              }, 200);
          }
      });
    },

    _handleCloseSelectFilterPopup: function() {

    },

    _confirmFilter: function() { // 필터 선택 후 요금제 확인 버튼 선택 시
      var selectedFilter = $('#selectFilter').children("li");

      this._params.searchFltIds = '';
      this._params.idxCtgCd = this.CODE_PRODUCT;
      for( var a = 0 ; a < selectedFilter.length ; a++) {
        this._params.searchFltIds += $(selectedFilter[a]).data("filtersummary");
        if (a !== selectedFilter.length-1) {
          this._params.searchFltIds += ',';
        }
      }
      if(this.curMobileFilter[0] !== '' && this.curMobileFilter[0] !== undefined) {
        if(this._params.searchFltIds !== ''){
          this._params.searchFltIds += ',';
        }
        this._params.searchFltIds += this.curMobileFilter[0];
      }

      console.log('this._params.searchFltIds : ' + this._params.searchFltIds);
      this._historyService.goLoad('/product/renewal/mobileplan/list?filters=' + this._params.searchFltIds);

      //this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params)
      //  .done($.proxy(this._handleLoadDataWithNewFilters, this, $('.confrim'))); 
    },

    _handleLoadDataWithNewFilters: function($target,resp) { // 요금제 항목 없으면 없음 팝업 출력
      if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
      }

      if (resp.result.products.length === 0) {
        this._popupService.open({
            hbs: 'renewal.product.filter.noresult',
            layer: true
          },
          $.proxy(this._onOpeninitialPopup, this),
          $.proxy(this._onCloseinitailPopup, this),
          'search',
          $target);
      } else {
        this._historyService.replaceURL('/product/renewal/mobileplan/list?filters='+this._params.searchFltIds);
      }
    },

    _handleResetFilters: function() { //선택 초기화 버튼 선택 시
      var $quickFilterBtn = $('.popup-page > div > .tod-renewal-product-tab > .rn-prod-inner > ul > li');
      var quickFilterCheck = false;
      for(var i = 0; (i<$quickFilterBtn.length) && !quickFilterCheck; i++) { // 퀵필터가 있는지 확인
        quickFilterCheck = $quickFilterBtn.eq(i).hasClass('on');
      }
      if(quickFilterCheck) {
        this._popupQuickFilter();
      } else {
        $('#selectFilter').empty();
        $('.check-box > ul > li').removeClass('on');
      }
    },
    _handleResetQuickFilters: function() { // 퀵 필터 항목을 초기화하고 팝업 닫음
      $('.popup-page > div > .tod-renewal-product-tab > .rn-prod-inner > ul > li').removeClass('on');
      this._handleResetFilters();
      this._popupService.close();
    },

    _deleteSelectFilter: function(e) { // 필터 화면 하단 선택 항목 삭제 시
      var $filterli = $(e.currentTarget).parent("span").parent("li");
      var filterCode = $filterli.data("filtersummary");
      $filterli.remove();
      $('[data-filter="' + filterCode + '"]').parent("li").removeClass('on');
    },

    _handleLoadMore: function() { //단일 상품 추가 로딩
      var viewMoreParam = this._params;
      viewMoreParam.searchLastProdId = $('.tod-cont-section').data('lastproduct'); // 로딩된 마지막 prod-id를 섹션 data에 저장
      this._apiService.request(Tw.API_CMD.BFF_10_0031, viewMoreParam).done($.proxy(this._handleSuccessLoadingData, this));
    },

    _handleLoadMoreDefault: function() { // 시리즈 상품 추가 로딩
      var viewMoreParam = this._params;
      
      viewMoreParam.idxCtgCd = this._networkInfo[this._curNetworkCount];
      viewMoreParam.opClCd = '02';
      viewMoreParam.grpSearchProdCount = '20';// 그룹상품 조회 건수
      viewMoreParam.sepSearchProdCount = '20';// 개별상품 조회 건수
      
      if(this._remainGroupData != 0 && this._curRemainGroupData != 0) {
        this._drawRemainGroup();
      } else {
        this._apiService.request(Tw.API_CMD.BFF_10_0203, viewMoreParam).done($.proxy(this._handleSuccessLoadingDataDefault, this));
      }
    },

    _handleSuccessLoadingData: function(resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
      }
  
      var items = _.map(resp.result.products, $.proxy(this._mapProperData, this)); // 가져온 데이터 파싱
      $('.tod-cont-section').data('lastproduct',items[items.length - 1].prodId);
      if(this._series.seriesClass != 'prod-5g' && this._series.seriesClass != 'prod-lte') { // 5G, LTE탭에서만 비교하기 출력
        if(items.length > 0){
          for(var i in items) {
            items[i].compareBtn = false;
          }
        }
      }
      $('.' + this._series.seriesClass).eq(-1).after(this._listTmpl({ items: items, seriesClass : this._series.seriesClass, cdn : this._cdn })); // 핸들바로 html 만들어서 붙임
      if(!resp.result.hasNext) { // 추가 로딩할 부분이 있는지 확인
        this._hasNext = 'false';
        $('.tod-nmp-loading').css('display','none');
      }
      this.isScroll = true;
      
      // var hasNone = this.$moreBtn.hasClass('none');
      // if (this._leftCount > 0) {
      //   if (hasNone) {
      //     this.$moreBtn.removeClass('none').attr('aria-hidden', false);
      //   }
      // } else if (!hasNone) {
      //   this.$moreBtn.addClass('none').attr('aria-hidden', true);
      // }      
    },

    _handleSuccessLoadingDataDefault: function(resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
      }
      var groupItems = _.map(resp.result.groupProdList, $.proxy(this._mapProperDataGroup, this)); //가져온 데이터 파싱
      var separateItems = _.map(resp.result.separateProductList, $.proxy(this._mapProperData, this));//가져온 데이터 파싱
      switch(this._networkInfo[this._curNetworkCount]) { //통신망에 따른 css 클래스 설정
        case this.CODE_5G:
          this._seriesClass = '1';
          break;
        case this.CODE_LTE:
          this._seriesClass = '2';
          break;
        case this.CODE_3G:
          this._seriesClass = '4';
          break;
        case this.CODE_2nd:
          this._seriesClass = '3';
          break;
        case this.CODE_PPS:
          this._seriesClass = '3';
          break;
        default :
          this._seriesClass = '1';
      }
      
      if(groupItems.length>5) { // 추가 로딩된 데이터 중 시리즈가 5개 이상일 때 배열에 저장
        this._remainGroupData = parseInt(groupItems.length / 5);
        this._curRemainGroupData = 1 ;
        this._groupData = [];
        for(var i = 0; i < this._remainGroupData + 1 ; i++) {
          this._groupData[i] = [];
          if(groupItems[i*5]) {
            this._groupData[i].push(groupItems[i*5]);
          }
          if(groupItems[i*5+1]) {
            this._groupData[i].push(groupItems[i*5+1]);
          }
          if(groupItems[i*5+2]) {
            this._groupData[i].push(groupItems[i*5+2]);
          }
          if(groupItems[i*5+3]) {
            this._groupData[i].push(groupItems[i*5+3]);
          }
          if(groupItems[i*5+4]) {
            this._groupData[i].push(groupItems[i*5+4]);
          }
        }
        
        this._separateItems = separateItems;
        this._curNetworkCount++;
        $('.tod-cont-section').eq(-1).after(this._listDefaultTmpl({ groupItems: this._groupData[0], separateItems: null, seriesClass: this._seriesClass, cdn: this._cdn}));
      } else { // 5개 미만이면 한번에 출력
        this._curNetworkCount++; // 요금제 통신망 별 호출 시 현재 순번 (ex. 0: 5g / 1: lte / 2: 3g / 3: 2nd / 4 : pps)
        $('.tod-cont-section').eq(-1).after(this._listDefaultTmpl({ groupItems: groupItems, separateItems: separateItems, seriesClass: this._seriesClass, cdn: this._cdn }));
        if(this._curNetworkCount == 5) {
          this._hasNext = 'false';
          $('.tod-nmp-loading').css('display','none');
        }
      }
      this.isScroll = true; // 데이터 추가 호출 중 중복 호출 요청을 막기 위한 플래그
    },

    _drawRemainGroup: function() { // 시리즈 요금제를 화면에 그럼
      if(this._remainGroupData == this._curRemainGroupData) { // 더이상 남은 시리즈 없을 때
        $('.tod-cont-section').eq(-1).after(this._listDefaultTmpl({ groupItems: this._groupData[this._curRemainGroupData], separateItems: this._separateItems,  seriesClass: this._seriesClass, cdn: this._cdn }));
        this._remainGroupData = 0;
        this._curRemainGroupData = 0;
        if(this._curNetworkCount == 5) {
          this._hasNext = 'false';
          $('.tod-nmp-loading').css('display','none');
        }
      } else { // 받아온 데이터 중 아직 화면에 표시하지 않은 시리즈가 남아 있을 때
        $('.tod-cont-section').eq(-1).after(this._listDefaultTmpl({ groupItems: this._groupData[this._curRemainGroupData], separateItems: null,  seriesClass: this._seriesClass, cdn: this._cdn }));
        this._curRemainGroupData++;
      }
      this.isScroll = true;
    },

    _mapProperData: function(item) { // API로 받아온 요금제 데이터 파싱
      if (item.basFeeAmt){
        if (item.basFeeAmt && /^[0-9]+$/.test(item.basFeeAmt)) {
          item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt) + '원';
        }
      } else {
        if (item.basFeeInfo && /^[0-9]+$/.test(item.basFeeInfo)) {
          item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeInfo) + '원';
        } else {
          item.basFeeAmt = item.basFeeInfo;
        }
      }
      if (item.selAgrmtAplyMfixAmt) {
        item.selAgrmtAplyMfixAmt = Tw.FormatHelper.addComma(item.selAgrmtAplyMfixAmt) + '원';
      }
      var data = '';
      if (!this._isEmptyAmount(item.basOfrDataQtyCtt)) {
        data = Number(item.basOfrDataQtyCtt);
        if (isNaN(data)) {
          item.basOfrDataQtyCtt = item.basOfrDataQtyCtt;
        } else {
          item.basOfrDataQtyCtt = data + Tw.DATA_UNIT.GB;
        }
      } else if (!this._isEmptyAmount(item.basOfrGbDataQtyCtt)) {
        data = Number(item.basOfrGbDataQtyCtt);
        
        if (isNaN(data)) {
          item.basOfrDataQtyCtt = item.basOfrGbDataQtyCtt;
        } else {
          data = Tw.FormatHelper.convDataFormat(item.basOfrGbDataQtyCtt, Tw.DATA_UNIT.GB);
          item.basOfrDataQtyCtt = data.data + data.unit;
        }
      } else if (!this._isEmptyAmount(item.basOfrMbDataQtyCtt)) {
        data = Number(item.basOfrMbDataQtyCtt);
        
        if (isNaN(data)) {
          item.basOfrDataQtyCtt = item.basOfrMbDataQtyCtt;
        } else {
          data = Tw.FormatHelper.convDataFormat(item.basOfrMbDataQtyCtt, Tw.DATA_UNIT.MB);
          item.basOfrDataQtyCtt = data.data + data.unit;
        }
      }
      if(this._series.noSeries) {
        item.tabCode = this._getTabCodeSeries(item);
      } else {
        item.tabCode = this._series.seriesClass;
      }
      item.prodSmryExpsTypCd = this._getProdSmryExpsTypCd(item.prodSmryExpsTypCd);
      if(item.prodSmryExpsTypCd == '2' && item.benefitList) {
        item.showBenf = {chooseBenefitList :[{}],sepBenefitList:[{}]};
        for(var k in item.benefitList) {
          if(item.benefitList[k].useAmt) {
            item.benefitList[k].useAmt = Tw.FormatHelper.addComma(item.benefitList[k].useAmt)+'원';
            item.benefitList[k].benfAmt = Tw.FormatHelper.addComma(item.benefitList[k].benfAmt)+'원';
          }
          if(!item.benefitList[k].rgstImgAlt) {
            item.benefitList[k].rgstImgAlt = '';
          }
          if(item.benefitList[k].prodBenfTypCd == '02') {
            item.showBenf.chooseBenefitList.push(item.benefitList[k]);
          } else if(item.benefitList[k].prodBenfTypCd == '01') {
            item.showBenf.sepBenefitList.push(item.benefitList[k]);
          }
        }
        item.showBenf.chooseBenefitList.shift();
        item.showBenf.sepBenefitList.shift();
      }

      item.basOfrVcallTmsCtt = this._isEmptyAmount(item.basOfrVcallTmsCtt) ? null : Tw.FormatHelper.appendVoiceUnit(item.basOfrVcallTmsCtt);
      item.basOfrCharCntCtt = this._isEmptyAmount(item.basOfrCharCntCtt) ? null : Tw.FormatHelper.appendSMSUnit(item.basOfrCharCntCtt);
      if(this._svcInfo) {
        item.usingProduct = (item.prodId == this._svcInfo.prodId) ? 'Y' : null;
      }
      if(item.filters){
        for(var i = 0; i < item.filters.length; i++) {
          var prodFltId = item.filters[i].prodFltId;
          if(prodFltId == 'F01163') {
            item.filters[i].fltTagSenior = 'Y';
          } else if(prodFltId == 'F01164') {
            item.filters[i].fltTagWelfare = 'Y';
          } else if(prodFltId == 'F01162') {
            item.filters[i].fltTagKid = 'Y';
          } else if(prodFltId == 'F01165') {
            item.filters[i].fltTagCollege = 'Y';
          }
          if((this._networkInfo[0] == this.CODE_5G && prodFltId == this.CODE_5G) || (this._networkInfo[0] == this.CODE_LTE && prodFltId == this.CODE_LTE)) {
            if(this._svcInfo){
              if(this._svcInfo.prodId != item.prodId) {
                item.compareBtn = true;
              }
            }
          }
        }
        
      } else if(item.prodFltList) {
        for(var i in item.prodFltList) {
          var prodFltId = item.prodFltList[i].prodFltId;
          if(prodFltId == 'F01163') {
            item.prodFltList[i].fltTagSenior = 'Y';
          } else if(prodFltId == 'F01164') {
            item.prodFltList[i].fltTagWelfare = 'Y';
          } else if(prodFltId == 'F01162') {
            item.prodFltList[i].fltTagKid = 'Y';
          } else if(prodFltId == 'F01165') {
            item.prodFltList[i].fltTagCollege = 'Y';
          }
          if((this._networkInfo[0] == this.CODE_5G && prodFltId == this.CODE_5G) || (this._networkInfo[0] == this.CODE_LTE && prodFltId == this.CODE_LTE)) {
            if(this._svcInfo){
              if(this._svcInfo.prodId != item.prodId) {
                item.compareBtn = true;
              }
            }
            if(this._isCompare = 'N') {
              item.compareBtn = false;
            }
          }
        } 
      }
      return item;
    },

    _mapProperDataGroup: function(item) { //요금제 시리즈 별로 요금제 데이터 파싱
      if(item.prodList){
        item.prodList = _.map(item.prodList, $.proxy(this._mapProperData, this));
      }
      return item;
    },

    _getTabCodeSeries: function(item) { //요금제 tab별 클래스 할당
      if(item.prodFltId) {
        switch (item.prodFltId) {
          case this.CODE_5G:
            return 'prod-5g';
          case this.CODE_LTE:
            return 'prod-lte';
          case this.CODE_3G:
            return 'prod-band';
          case this.CODE_2nd:
            return 'prod-2nd';
          case this.CODE_PPS:
            return 'prod-2nd';
          default :
            return 'prod-5g';
        }
      }
      return '';
    },

    _getProdSmryExpsTypCd: function(value) { //요금제 모듈 형태 별 코드 치환 (1.기본형 2. 혜택강조형 3.데이터 강조형)
      switch (value) {
        case '1':
          return '1';
        case '2':
          return '3';
        case '3':
          return '2';
        case 'TAG0000212' :
          return '1';
        case 'TAG0000213' :
          return '3';
        case 'TAG0000214' :
          return '2';
      }
      return '';
    },

    _isEmptyAmount: function(value) {
      return !value || value === '' || value === '-';
    },

    _setInfinityScroll: function() { // 스크롤이 일정부분 내려갈 시 데이터 추가 로딩
      var _this = this;
      this.isScroll = true;
      $(document).scroll(function() {
        if(($(window).height() + $(document).scrollTop()) >= ($(document).height() - ($(window).height() * 2))) {
          if (_this.isScroll && _this._hasNext == 'true') {
            _this.isScroll = false;
            if(_this._checkDefault == 'N') { // 단일 상품 리스트 출력
              setTimeout($.proxy(_this._handleLoadMore, _this) ,300);
            } else { // 시리즈 상품 리스트 출력
              setTimeout($.proxy(_this._handleLoadMoreDefault, _this) ,300);
            }
          }
        }
      });
    },

    _escapeHtmlEntities : function(filter) { // 필터 desc 출력 시 받아온 데이터를 html로 출력할 수 있도록 치환 + 필터에서 데이터, 대상 오른쪽 작은 글씨 제거 (기획 요청 사항)
      var str = ''
      if(filter.prodFltDesc) { // 필터 desc 출력 시 받아온 데이터를 html로 출력할 수 있도록 치환
        filter.prodFltDesc = filter.prodFltDesc.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/\"/g,' ').replace(/&#034;/g,'\''); 
        for(var i = 0; i < filter.prodFltDesc.length ; i++){
          if(filter.prodFltDesc.charCodeAt(i) != 8220 && filter.prodFltDesc.charCodeAt(i) != 8221) {
            str += filter.prodFltDesc.charAt(i);
          }
        }
        filter.prodFltDesc = str;
      }
      if(filter.subFilters) {
        for(var i in filter.subFilters) {
          if(filter.prodFltId != 'F01140' && filter.prodFltId != 'F01150') {
            filter.subFilters[i].text = filter.subFilters[i].prodFltNm;
          }
        }
      }
      return filter;
    }
};

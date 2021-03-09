Tw.ProductRenewalList = function(rootEl, params, svcInfo, series, hasNext, networkInfo, cdn, isCompare) {
    this.$container = rootEl;
    this._params = params; //  검색 필터용 params
    this._params.searchLastProdId = ''; // 탭 없는 랜딩페이지 시 추가된 searchLastProdId 초기화
    this._svcInfo = svcInfo;
    this._series = series;
    this._hasNext = hasNext;
    this._networkInfo = networkInfo;
    this._isCompare = isCompare;
    this._checkDefault = 'N'; //전체리스트 Default 페이지 랜딩 인지 확인
    this._curNetworkCount = 1; // 전체리스트 Default 페이지 추가 호출 횟수 count
    this._cdn = cdn;
    this._remainGroupData = 0;
    this._curRemainGroupData = 0;
    this._deletedQuickFilter = '';
  
    this.CODE = 'F01100';
    this.TYPE = 'plans';
  
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._historyService = new Tw.HistoryService();
  
    this._bindEvent();
    this._init();

  };

Tw.ProductRenewalList.prototype = {
    _init: function() {
      this.themeParam = this._getParameter('theme');
      this._listTmpl = Handlebars.compile(Tw.RENEWAL_PRODUCT_LIST_VIEW_MORE_MODULE);
      this._listDefaultTmpl = Handlebars.compile(Tw.RENEWAL_PRODUCT_LIST_VIEW_MORE_MODULE_DEFAULT);
      this.curFilter = this._checkFilter();
      this.curMobileFilter = this._checkMobilefilter();
      this._loadNotice();
      this._scrollFocus();
      this._setInfinityScroll();
      this._checkTheme();
    },

    _bindEvent: function() {
      $('.filterBtn').click(_.debounce($.proxy(this._handleClickChangeFilters, this), 30));
      $('.resetBtn').click(_.debounce($.proxy(this._initialFilter, this), 30));
      $('#themeSelectBtn').click($.proxy(this._goToTheme, this));
      $('.f-del-list').click($.proxy(this._goDeleteFilter, this));
      //$('.more-link-area > button').click($.proxy(this._handleLoadMore, this));
    },

    _scrollFocus: function() {
      if(this.curMobileFilter[0] !== undefined || this.themeParam !== '') { // 탭 제목 보이도록 상단 스크롤 이동
        var $tabWrap = $('.tod-nmp-tab').find('ul');
        var tabWidth = $tabWrap.width();
        var onWidth = $tabWrap.find('.on').width();
        var onPosi = $tabWrap.find('.on').position();
        var onTotalPosi = onPosi.left + onWidth;
        if(onTotalPosi > tabWidth){
          $tabWrap.scrollLeft(onPosi.left - 20);
        }
      }
  
      //스크롤시 헤더 숨김 및 tab 고정
      $(document).scroll(function(){
        if($(this).scrollTop() > 51 ){
          $('.tod-nmp-top-wrap').addClass('tod-nmp-scroll-fixed');
        } else {
          $('.tod-nmp-top-wrap').removeClass('tod-nmp-scroll-fixed');
        }
      });
    },

    _loadNotice: function() { // Notice 최초 전체 진입 화면에서만 출력
      if((this.curFilter == [] || this.curFilter[0] == undefined) && (this.curMobileFilter[0] == undefined || this.curMobileFilter == [])){
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

    _goToTheme: function(e) { // 테마요금제 진입 시 컨펌 창 띄움
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

    _popupQuickFilter: function() {
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
      var curfilterArr = urlFilterArr.filter(this._getfilter);
      if(curfilterArr[0] !== '' && curfilterArr !== []) {
        return curfilterArr;
      } else {
        return [];
      }
    },

    _checkMobilefilter: function() { //url상의 필터 중 기기 관련 필터만 얻어옴
      var urlFilterArr = this._getParameter('filters').split(',');
      var curMobilefilterArr = urlFilterArr.filter(this._getMobilefilter);
      if(curMobilefilterArr[0] !== '' && curMobilefilterArr !== []) {
        return curMobilefilterArr;
      } else {
        return [];
      }
      
    },

    _getfilter: function(split) {
      return !(split === 'F01713' || split === 'F01121' || split === 'F01122' || split === 'F01124' || split === 'F01125');
    },

    _getMobilefilter: function(split) {
      return (split === 'F01713' || split === 'F01121' || split === 'F01122' || split === 'F01124' || split === 'F01125');
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

    _loadFilterConfirmPopup: function(e){ 
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
      if($target.data('code')) {
        $('#initialConfirm').click($.proxy(function() {
          var MobileFilterForQuick = (_this.curMobileFilter[0] == '') || (_this.curMobileFilter[0] == undefined) ? _this._networkInfo[0] : _this.curMobileFilter[0]; 
          _this._historyService.replaceURL('/product/renewal/mobileplan/list?filters=' + MobileFilterForQuick + ',' + $target.data('code'));
        }));
      } else {
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
          { command: Tw.API_CMD.BFF_10_0032, params: { idxCtgCd: this.CODE }},
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
      // $layer.find('.link').click(_.debounce($.proxy(this._openSelectTagPopup, this, $layer), 300));
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
        for(var i = 0; (i<$quickFilterBtn.length) && !quickFilterCheck; i++) {
          quickFilterCheck = $quickFilterBtn.eq(i).hasClass('on');
        }
        if(quickFilterCheck) {
          _this._popupQuickFilter();
        } else {
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
      this.$container.find('.f-del-filter').click($.proxy(this._deleteSelectFilter, this));
    },

    _handleCloseSelectFilterPopup: function() {
      
     
      // if (this._loadedNewSearch) {
      //   if (this._params.searchFltIds) {
      //     location.href = location.pathname + '?filters=' + this._params.searchFltIds;
      //   } else {
      //     location.href = location.pathname;
      //   }
      // }
    },

    _confirmFilter: function() { // 필터 선택 후 요금제 확인 버튼 선택 시
      var selectedFilter = $('#selectFilter').children("li");

      this._params.searchFltIds = '';
      this._params.idxCtgCd = 'F01100';
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

      this._apiService.request(Tw.API_CMD.BFF_10_0031, this._params)
        .done($.proxy(this._handleLoadDataWithNewFilters, this, $('.confrim'))); 
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
      $('#selectFilter').empty();
      $('.check-box > ul > li').removeClass('on');
    },
    _handleResetQuickFilters: function() {
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

    _handleLoadMore: function() {
      var viewMoreParam = this._params;
      viewMoreParam.searchLastProdId = $('.tod-cont-section').data('lastproduct');
      this._apiService.request(Tw.API_CMD.BFF_10_0031, viewMoreParam).done($.proxy(this._handleSuccessLoadingData, this));
    },

    _handleLoadMoreDefault: function() {
      var viewMoreParam = this._params;
      
      viewMoreParam.idxCtgCd = this._networkInfo[this._curNetworkCount];
      viewMoreParam.opClCd = '02';
      
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
  
      var items = _.map(resp.result.products, $.proxy(this._mapProperData, this));
      $('.tod-cont-section').data('lastproduct',items[items.length - 1].prodId);
      $('.' + this._series.seriesClass).eq(-1).after(this._listTmpl({ items: items, seriesClass : this._series.seriesClass, cdn : this._cdn }));
      if(!resp.result.hasNext) {
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
      var groupItems = _.map(resp.result.groupProdList, $.proxy(this._mapProperDataGroup, this));
      var separateItems = _.map(resp.result.separateProductList, $.proxy(this._mapProperData, this));
      switch(this._networkInfo[this._curNetworkCount]) {
        case 'F01713':
          this._seriesClass = '1';
          break;
        case 'F01121':
          this._seriesClass = '2';
          break;
        case 'F01122':
          this._seriesClass = '4';
          break;
        case 'F01124':
          this._seriesClass = '3';
          break;
        case 'F01125':
          this._seriesClass = '3';
          break;
        default :
          this._seriesClass = '1';
      }
      
      if(groupItems.length>5) {
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
      } else {
        this._curNetworkCount++;
        $('.tod-cont-section').eq(-1).after(this._listDefaultTmpl({ groupItems: groupItems, separateItems: separateItems, seriesClass: this._seriesClass, cdn: this._cdn }));
        if(this._curNetworkCount == 5) {
          this._hasNext = 'false';
          $('.tod-nmp-loading').css('display','none');
        }
      }
      this.isScroll = true;
    },

    _drawRemainGroup: function() {
      if(this._remainGroupData == this._curRemainGroupData) {
        $('.tod-cont-section').eq(-1).after(this._listDefaultTmpl({ groupItems: this._groupData[this._curRemainGroupData], separateItems: this._separateItems,  seriesClass: this._seriesClass, cdn: this._cdn }));
        this._remainGroupData = 0;
        this._curRemainGroupData = 0;
        if(this._curNetworkCount == 5) {
          this._hasNext = 'false';
          $('.tod-nmp-loading').css('display','none');
        }
      } else {
        $('.tod-cont-section').eq(-1).after(this._listDefaultTmpl({ groupItems: this._groupData[this._curRemainGroupData], separateItems: null,  seriesClass: this._seriesClass, cdn: this._cdn }));
        this._curRemainGroupData++;
      }
      this.isScroll = true;
    },

    _mapProperData: function(item) {
      if (item.basFeeAmt){
        if (item.basFeeAmt && /^[0-9]+$/.test(item.basFeeAmt)) {
          item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt)+'원';
        }
      } else {
        if (item.basFeeInfo && /^[0-9]+$/.test(item.basFeeInfo)) {
          item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeInfo)+'원';
        } else {
          item.basFeeAmt = item.basFeeInfo;
        }
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
          if((this._networkInfo[0] == 'F01713' && prodFltId == 'F01713') || (this._networkInfo[0] == 'F01121' && prodFltId == 'F01121')) {
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
          if((this._networkInfo[0] == 'F01713' && prodFltId == 'F01713') || (this._networkInfo[0] == 'F01121' && prodFltId == 'F01121')) {
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

    _mapProperDataGroup: function(item) {
      if(item.prodList){
        item.prodList = _.map(item.prodList, $.proxy(this._mapProperData, this));
      }
      return item;
    },

    _getTabCodeSeries: function(item) {
      if(item.prodFltId) {
        switch (item.prodFltId) {
          case 'F01713':
            return 'prod-5g';
          case 'F01121':
            return 'prod-lte';
          case 'F01122':
            return 'prod-band';
          case 'F01124':
            return 'prod-2nd';
          case 'F01125':
            return 'prod-2nd';
          default :
            return 'prod-5g';
        }
      }
      return '';
    },

    _getProdSmryExpsTypCd: function(value) {
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

    _setInfinityScroll: function() {
      var _this = this;
      this.isScroll = true;
      $(document).scroll(function() {
        if(($(window).height() + $(document).scrollTop()) >= ($(document).height() - ($(window).height() * 2))) {
          if (_this.isScroll && _this._hasNext == 'true') {
            _this.isScroll = false;
            if(_this._checkDefault == 'N') {
              setTimeout($.proxy(_this._handleLoadMore, _this) ,300);
            } else {
              setTimeout($.proxy(_this._handleLoadMoreDefault, _this) ,300);
            }
          }
        }
      });
    },

    _escapeHtmlEntities : function(filter) {
      var str = ''
      if(filter.prodFltDesc){
        filter.prodFltDesc = filter.prodFltDesc.replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/\"/g,' ').replace(/&#034;/g,'\''); 
        for(var i = 0; i < filter.prodFltDesc.length ; i++){
          if(filter.prodFltDesc.charCodeAt(i) != 8220 && filter.prodFltDesc.charCodeAt(i) != 8221) {
            str += filter.prodFltDesc.charAt(i);
          }
        }
        filter.prodFltDesc = str;
      }
      return filter;
    }
};



Tw.ProductRenewalList = function(rootEl, params, svcInfo, series, hasNext) {
    this.$container = rootEl;
    this._params = params; //  검색 필터용 params
    this._params.searchLastProdId = ''; // 탭 없는 랜딩페이지 시 추가된 searchLastProdId 초기화
    this._svcInfo = svcInfo;
    this._series = series;
    this._hasNext = hasNext;

  
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
      var _this = this;
      this.themeParam = this._getParameter('theme');
      this._checkTheme();
      this._listTmpl = Handlebars.compile(Tw.RENEWAL_PRODUCT_LIST_VIEW_MORE_MODULE);
      this.curFilter = this._checkFilter();
      this.curMobileFilter = this._checkMobilefilter();
      this._loadNotice();
      $(window).scroll(function() {
        if(_this._hasNext == 'true') {
          if (Math.round( $(window).scrollTop()) == $(document).height() - $(window).height()) {
            setTimeout($.proxy(_this._handleLoadMore, _this),500);
          }
        }
      });

    },

    _bindEvent: function() {
      $('.p-btn-filter').click(_.debounce($.proxy(this._handleClickChangeFilters, this), 30));
      $('.resetBtn').click(_.debounce($.proxy(this._initialFilter, this), 30));
      $('#themeSelectBtn').click($.proxy(this._goToTheme, this));
      $('.f-del-list').click($.proxy(this._goDeleteFilter, this));
      //$('.more-link-area > button').click($.proxy(this._handleLoadMore, this));
    },

    _loadNotice: function() { // Notice 최초 전체 진입 화면에서만 출력
      if((this.curFilter == [] || this.curFilter[0] == undefined) && (this.curMobileFilter[0] == undefined || this.curMobileFilter == [])){
        if(this.themeParam !== '') {
        } else {
          $('.rn-notice').css('display','block');
          $('.btn-nb-close').click(function(){$('.rn-notice').css('display','none');});
        }
      }
    },

    _checkTheme: function() { // 테마요금제 진입 시 선택한 테마로 이동
      if(this.themeParam !== '' && this.themeParam !== 'all') { 
        $(window).scrollTop($('[data-theme="' + this.themeParam + '"]').offset().top);
      }
    },

    _goToTheme: function(e) { // 테마요금제 진입 시 컨펌 창 띄움
      this.destinationUrl = '/product/renewal/mobileplan/list?theme=all';

      if((this.curFilter[0] !== undefined && this.curFilter[0] !== '' && this.curFilter[0] !== null) || this._getParameter('code')!=='') {
        this._loadFilterConfirmPopup(e);
      } else {
        this._historyService.replaceURL(this.destinationUrl);
      }
    },

    _goDeleteFilter: function(e) { // 필터 항목 제거
      var deletedFilter = e.currentTarget.dataset.filterid;
      if(deletedFilter == ''){
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

    _popupQuickFilter: function($target) {
      this._popupService.open({
          url: '/hbs/',
          hbs: 'renewal.product.initial.confirm',
          layer: true,
        },
        $.proxy(this._onOpenquickinitialPopup, this, $target),
        $.proxy(this._onClosequickinitailPopup, this, $target),
        'initialQuickFilter',
        $target);
    },

    _onOpenquickinitialPopup: function($target) { 
      $('#initialCancel').click(_.debounce($.proxy(this._popupService.close, this), 30));
      $('#initialConfirm').click($.proxy(this._initQuickFilter, this, $target));
    },

    _initQuickFilter: function($target) {
      if($target.hasClass('resetBtn')){
        this._historyService.replaceURL('/product/renewal/mobileplan/list?filters='+this.curMobileFilter[0]);
      } else {
        if (!this._filters) { // 필터 리스트가 없을 경우 BFF에 요청
          this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.CODE }).done($.proxy(this._handleLoadFilters, this, $target));
        } else {
          this._openSelectFiltersPopup($target);
        }
      }
    },

    _onClosequickinitailPopup: function($target) {

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
      if(this._getParameter('code') !== ''){
        this._popupQuickFilter($(e.currentTarget));
      } else { 
        if(this.curMobileFilter[0] !== undefined && this.curMobileFilter[0] !== '') {
          this.destinationUrl = '/product/renewal/mobileplan/list?filters=' + this.curMobileFilter[0];
        } else {
          this.destinationUrl = '/product/renewal/mobileplan/list';
        }
        this._loadFilterConfirmPopup(e);
      }
    },

    _loadFilterConfirmPopup: function(e){ 
      this._popupService.open({
        url: '/hbs/',
        hbs: 'renewal.product.initial.confirm',
        layer: true
        },
        $.proxy(this._onOpeninitialPopup, this, $(e.currentTarget)),
        $.proxy(this._onCloseinitailPopup, this, $(e.currentTarget)),
        'initialFilter',
        $(e.currentTarget));
    },

    _onOpeninitialPopup: function() {
      $('#initialCancel').click(_.debounce($.proxy(this._popupService.close, this), 500));
      $('#initialConfirm').click($.proxy(this._initFilter, this));
    },

    _onCloseinitailPopup: function() {

    },

    _initFilter: function() {
        this._historyService.replaceURL(this.destinationUrl);
    },

    _handleClickChangeFilters: function(e) {
      var $target = $(e.currentTarget);
      if(this._getParameter('code') !== '') {
        this._popupQuickFilter($target);
      } else {
        if (!this._filters) { // 필터 리스트가 없을 경우 BFF에 요청
          this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.CODE }).done($.proxy(this._handleLoadFilters, this, $target));
          
        } else {
          this._openSelectFiltersPopup($target);
        }
      }
    },

    _handleLoadFilters: function($target, resp) { // API로 받아온 데이터로 필터 열음 ( 현재 안씀 )
      if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
      }
  
      this._filters = resp.result;
      console.log(this._filters.filters[0]);
      this._openSelectFiltersPopup($target);
    },

    _openSelectFiltersPopup: function($target) { // 필터 팝업 띄움
      // var currentFilters = this._params.searchFltIds,
      //   currentTag = this._params.searchTagId;
      // this._hasSelectedTag = !!currentTag;
  
      // var filters = _.chain(this._filters.filters)
      //   .map(function(filter) {
      //     return {
      //       prodFltId: filter.prodFltId,
      //       prodFltNm: filter.prodFltNm,
      //       subFilters:
      //         currentFilters && currentFilters.length > 0 ? 
      //           _.map(filter.subFilters, function(subFilter) {
      //             if (currentFilters.indexOf(subFilter.prodFltId) >= 0) {
      //               return $.extend({ checked: true }, subFilter);
      //             }
      //             return subFilter;
      //           }) : 
      //           filter.subFilters
      //     };
      //   }).filter(function(filter){ //안되면 필터 제거하고 hbs에서 처리
      //     return filter.prodFltId !== 'F01120';
      //   }).value();
      var filtersData = { data : '',
        fee : '',
        call : '',
        target : ''};
      var _this = this;
      for(var i in _this._filters.filters) {
        switch (_this._filters.filters[i].prodFltId) {
          case 'F01130' :
            filtersData.data = _this._filters.filters[i].subFilters;
            break;
          case 'F01140' :
            filtersData.fee = _this._filters.filters[i].subFilters;
            break;
          case 'F01150' :
            filtersData.call = _this._filters.filters[i].subFilters;
            break;
          case 'F01160' :
            filtersData.target = _this._filters.filters[i].subFilters;
            break;
          default :
            break;
        }
      }
  
      this._popupService.open({
          hbs: 'renewal.mobileplan.list.filter.hardcording',
          layer: true,
          data: filtersData
        },
        $.proxy(this._handleOpenSelectFilterPopup, this),
        $.proxy(this._handleCloseSelectFilterPopup, this),
        'search',
        $target
      );
    },

    _handleOpenSelectFilterPopup: function($layer) { //필터 팝업 열릴 시 콜백 함수

      // console.log('1###')
      // console.log(location.hash);
      // console.log(this._popupService._prevHashList);
      // console.log('1###')

      var _this = this;
      var MobileFilterForQuick = (this.curMobileFilter[0] == '') || (this.curMobileFilter[0] == undefined) ? 'F01713' : this.curMobileFilter[0];
      if(this._popupService._prevHashList.length == 1){
        $('.prev-step').click(_.debounce($.proxy(_this._popupService.close, this), 500));
      } else {
        $('.prev-step').click(function(){
          _this._historyService.replaceURL('/product/renewal/mobileplan/list?filters='+_this.curMobileFilter[0]);
        });
      }
      // $layer.find('.select-list li.checkbox').click(_.debounce($.proxy(this._handleClickFilter, this, $layer), 300));
      // $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
      $('.quickFilterBtn').click(function(e){_this._historyService.replaceURL(
        '/product/renewal/mobileplan/list?filters=' + MobileFilterForQuick + '&code=' + e.currentTarget.dataset.code);});
      $('.reset').click($.proxy(this._handleResetFilters, this));
      $('.confrim').click($.proxy(this._confirmFilter, this));
      // $layer.find('.link').click(_.debounce($.proxy(this._openSelectTagPopup, this, $layer), 300));
      var $headerH = $(".page-header").height();
      var $checked = $(".check-box > ul > li > a");
      $(".filter-wrap").scroll(function() {    
          var scroll = $(".filter-wrap").scrollTop();
          if (scroll > $headerH - 66) {//66 active된 상태에서의 header
            $(".container-wrap").addClass("active");
          } else {
            $(".container-wrap").removeClass("active");
          }
      });
      if(this.curFilter) { // 현재 적용된 필터 항목 하단에 표시
        for(var a=0 ; a < this.curFilter.length ; a++){
          $('[data-filter="' + this.curFilter[a] + '"]').parent("li").addClass('on');
          $('#selectFilter').append('<li data-filtersummary="' + this.curFilter[a]
              + '"><span class="f-keyword">'+ $('[data-filter="' + this.curFilter[a] + '"]').data('filtername') 
              + '<button type="button" class="f-del f-del-filter"><span class="blind">삭제</span></button></span></li>');
        }
      }

      $checked.on("click", function() { // 항목 선택 시 하단에 선택한 필터 항목 표시
        if($(this).parent("li").hasClass("on")) {
          $(this).parent("li").removeClass("on");
          $('[data-filtersummary="' + $(this).data('filter') + '"]').remove();
        } else {
          $(this).parent("li").addClass("on");
          $('#selectFilter').append('<li data-filtersummary="' + $(this).data('filter') 
            + '"><span class="f-keyword">'+ $(this).data('filtername') 
            + '<button type="button" class="f-del f-del-filter"><span class="blind">삭제</span></button></span></li>');
          setTimeout(function() {
            $('.f-del-filter').click($.proxy(_this._deleteSelectFilter, this));
          },500);
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

    _handleResetFilters: function($layer) { //선택 초기화 버튼 선택 시
      $('#selectFilter').empty();
      $('.check-box > ul > li').removeClass('on');
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

    _handleSuccessLoadingData: function(resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
      }
  
      var items = _.map(resp.result.products, $.proxy(this._mapProperData, this));
      $('.tod-cont-section').data('lastproduct',items[items.length - 1].prodId);
      $('.' + this._series.class).eq(-1).after(this._listTmpl({ items: items, seriesClass : this._series.class }));
      if(!resp.result.hasNext) {
        this._hasNext = 'false';
      }
      
      // var hasNone = this.$moreBtn.hasClass('none');
      // if (this._leftCount > 0) {
      //   if (hasNone) {
      //     this.$moreBtn.removeClass('none').attr('aria-hidden', false);
      //   }
      // } else if (!hasNone) {
      //   this.$moreBtn.addClass('none').attr('aria-hidden', true);
      // }      
    },

    _mapProperData: function(item) {
      if (item.basFeeAmt && /^[0-9]+$/.test(item.basFeeAmt)) {
        item.basFeeAmt = Tw.FormatHelper.addComma(item.basFeeAmt)+'원';
      } 
  
      if (!this._isEmptyAmount(item.basOfrDataQtyCtt)) {
        var data = Number(item.basOfrDataQtyCtt);
        if (isNaN(data)) {
          item.basOfrDataQtyCtt = item.basOfrDataQtyCtt;
        } else {
          item.basOfrDataQtyCtt = data + Tw.DATA_UNIT.GB;
        }
      } else if (!this._isEmptyAmount(item.basOfrMbDataQtyCtt)) {
        var data = Number(item.basOfrMbDataQtyCtt);
        
        if (isNaN(data)) {
          item.basOfrDataQtyCtt = item.basOfrMbDataQtyCtt;
        } else {
          data = Tw.FormatHelper.convDataFormat(item.basOfrMbDataQtyCtt, Tw.DATA_UNIT.MB);
          item.basOfrDataQtyCtt = data.data + data.unit;
        }
      }
  
      item.basOfrVcallTmsCtt = this._isEmptyAmount(item.basOfrVcallTmsCtt) ? null : Tw.FormatHelper.appendVoiceUnit(item.basOfrVcallTmsCtt);
      item.basOfrCharCntCtt = this._isEmptyAmount(item.basOfrCharCntCtt) ? null : Tw.FormatHelper.appendSMSUnit(item.basOfrCharCntCtt);
      if(this._svcInfo) {
        item.usingProduct = (item.prodId == this._svcInfo.prodId) ? 'Y' : null;
      }
      
      for(var i = 0; i < item.filters.length; i++) {
        var prodFltId = item.filters[i].prodFltId;
        if(prodFltId == 'F01163') {
          item.filters[i].fltTagSenior = 'Y';
        } else if(prodFltId == 'F01164') {
          item.filters[i].fltTagWelfare = 'Y';
        } else if(prodFltId == 'F01162') {
          item.filters[i].fltTagKid = 'Y';
        } 
      }
      
      return item;
    },

    _isEmptyAmount: function(value) {
      return !value || value === '' || value === '-';
    }

};

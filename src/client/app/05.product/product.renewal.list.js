
Tw.ProductRenewalList = function(rootEl, params) {
    this.$container = rootEl;
    this._params = params;
  
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
      console.log(this._getParameter('theme') !== 'all');
      if(this._getParameter('theme')!=='' && this._getParameter('theme')!== 'all'){
        this._checkTheme();
      }
    },

    _bindEvent: function() {
      $('.p-btn-filter').click(_.debounce($.proxy(this._handleClickChangeFilters, this), 300));
      $('.p-btn-reset').click(_.debounce($.proxy(this._initialFilter, this), 300));
      $('#themeSelectBtn').click($.proxy(this._goToTheme, this));
    },

    _checkTheme: function() {
      var location = window.location.href.split('?')[1],
				sectionIndex;

			if (location.indexOf('theme=') >= 0) {
        sectionIndex = location.split('=')[1];

				$(window).scrollTop($('section.tod-cont-section').eq(sectionIndex).offset().top - $('.h-belt').height() - $('.rn-prod-inner').height());
			}
    },

    _goToTheme: function(e) {
      this.destinationUrl = '/product/renewal/mobileplan/list?theme=all';
      if(this._checkFilter()){
        this._loadFilterConfirmPopup(e);
      } else {
        this._historyService.replaceURL(this.destinationUrl);
      }
    },

    _checkFilter: function() { //url상의 필터 중에 기기 관련 필터 제거
      var urlFilterArr = this._getParameter('filters').split(',');
      var curfilterArr;
      curfilterArr = urlFilterArr.filter(this._getfilter);
      if(curfilterArr.length) {
        return curfilterArr;
      } else {
        return null;
      }
    },

    _checkMobilefilter: function() { //url상의 필터 중 기기 관련 필터만 얻어옴
      var urlFilterArr = this._getParameter('filters').split(',');
      var curMobilefilterArr;
      curMobilefilterArr = urlFilterArr.filter(this._getMobilefilter);
      if(curMobilefilterArr[0] !== undefined) {
        return curMobilefilterArr;
      } else {
        return null;
      }
      
    },

    _getfilter: function(split) {
      return !(split === 'F01713' || split === 'F01121' || split === 'F01122' || split === 'F01124' || split === 'F01125');
    },

    _getMobilefilter: function(split) {
      return (split === 'F01713' || split === 'F01121' || split === 'F01122' || split === 'F01124' || split === 'F01125');
    },

    _getParameter: function(name) {
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
      var mobileFilter = this._checkMobilefilter();
      if(mobileFilter){
        this.destinationUrl = '/product/renewal/mobileplan/list?filters=' + mobileFilter[0];
      } else {
        this.destinationUrl = '/product/renewal/mobileplan/list';
      }
      this._loadFilterConfirmPopup(e);
    },

    _loadFilterConfirmPopup: function(e){
      this._popupService.open({
        url: '/hbs/',
        hbs: 'renewal.product.initial.confirm',
        layer: true,
        },$.proxy(this._onOpeninitialPopup, this, $(e.currentTarget)),
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
      // if (!this._filters) { // 필터 리스트가 없을 경우 BFF에 요청
      //   this._apiService.request(Tw.API_CMD.BFF_10_0032, { idxCtgCd: this.CODE }).done($.proxy(this._handleLoadFilters, this, $target));
        
      // } else {
        this._openSelectFiltersPopup($target);
      // }
    },

    _handleLoadFilters: function($target, resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
      }
  
      this._filters = resp.result;
      this._openSelectFiltersPopup($target);
    },

    _openSelectFiltersPopup: function($target) {
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
  
      this._popupService.open(
        {
          hbs: 'renewal.mobileplan.list.filter',
          layer: true
        },
        $.proxy(this._handleOpenSelectFilterPopup, this),
        $.proxy(this._handleCloseSelectFilterPopup, this),
        'search',
        $target
      );
     
      
    },

    _handleOpenSelectFilterPopup: function($layer) {
      var _this = this;
      $('.prev-step').click(_.debounce($.proxy(this._popupService.close, this), 500));
      // $layer.find('.select-list li.checkbox').click(_.debounce($.proxy(this._handleClickFilter, this, $layer), 300));
      // $layer.on('click', '.bt-red1', $.proxy(this._handleSelectFilters, this, $layer));
      $('.reset').click($.proxy(this._handleResetFilters, this));
      $('.confrim').click($.proxy(this._confirmFilter, this));
      // $layer.find('.link').click(_.debounce($.proxy(this._openSelectTagPopup, this, $layer), 300));
      var $headerH = $(".page-header").height();
      var $checked = $(".check-box > ul > li > a");
      var $curFilterArr = this._checkFilter();
      console.log($curFilterArr);
      $(".filter-wrap").scroll(function() {    
          var scroll = $(".filter-wrap").scrollTop();
          if (scroll > $headerH - 66) {//66 active된 상태에서의 header
              $(".container-wrap").addClass("active");
              
          } else {
              $(".container-wrap").removeClass("active");
          }
      });
      console.log($curFilterArr);
      if($curFilterArr) {
        for(var a=0 ; a < $curFilterArr.length ; a++){
          $('[data-filter="' + $curFilterArr[a] + '"]').parent("li").addClass('on');
          $('#selectFilter').append('<li data-filtersummary="' + $curFilterArr[a]
              + '"><span class="f-keyword">'+ $('[data-filter="' + $curFilterArr[a] + '"]').data('filtername') 
              + '<button type="button" class="f-del f-del-filter"><span class="blind">삭제</span></button></span></li>');
        }
      }

      $checked.on("click",function(){
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

    _confirmFilter: function() {
      var selectedFilter = $('#selectFilter').children("li");
      var mobileFilter = this._checkMobilefilter();
      

      this._params.searchFltIds = "";
      for( var a = 0 ; a < selectedFilter.length ; a++) {
        this._params.searchFltIds += $(selectedFilter[a]).data("filtersummary");
        if (a!==selectedFilter.length-1) {
          this._params.searchFltIds += ',';
        }
      }
      console.log(this._params.searchFltIds);
      if(mobileFilter) {
        this._params.searchFltIds += ',';
        this._params.searchFltIds += mobileFilter[0];
      }

      this._apiService
      .request(Tw.API_CMD.BFF_10_0031, this._params)
      .done($.proxy(this._handleLoadDataWithNewFilters, this, $('.confrim'))); 
    },

    _handleLoadDataWithNewFilters: function($target,resp) {
      if (resp.code !== Tw.API_CODE.CODE_00) {
        Tw.Error(resp.code, resp.msg).pop();
        return;
      }

      if (resp.result.products.length === 0) {
        this._popupService.open(
          {
            hbs: 'renewal.product.filter.noresult',
            layer: true
          },
          $.proxy(this._onOpeninitialPopup, this),
          $.proxy(this._onCloseinitailPopup, this),
          'search',
          $target
        );
      } else {
        this._historyService.replaceURL('/product/renewal/mobileplan/list?filters='+this._params.searchFltIds);
      }
    },

    _handleResetFilters: function($layer) {
      $('#selectFilter').empty();
      console.log($('.checkbox > ul > li'));
      $('.check-box > ul > li').removeClass('on');
    },

    _deleteSelectFilter: function(e) {
      var $filterli = $(e.currentTarget).parent("span").parent("li");
      var filterCode = $filterli.data("filtersummary");
      $filterli.remove();
      $('[data-filter="' + filterCode + '"]').parent("li").removeClass('on');
    }


};

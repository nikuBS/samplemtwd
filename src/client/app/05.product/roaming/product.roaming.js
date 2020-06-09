/**
 * @file T로밍 서브메인 화면 처리
 * @author Juho Kim
 * @since 2018-12-06
 */

/**
 * @class
 * @param {Object} rootEl - 최상위 element
 * @param {Object} options - 설정 옵션
 */
Tw.ProductRoaming = function(rootEl, menuId) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._xTractorService = new Tw.XtractorService(this.$container);
  this._menuId = menuId;

  // 폼나는 정보 관련
  // this._options = options;

  // this._cachedElement();
  this._bindEvent();

  // this._getTosAdminRoamingBanner();

  if ( !Tw.Environment.init ) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._getTosAdminRoamingBanner, this));
  } else {
    this._getTosAdminRoamingBanner();
  }

  // 폼나는 정보 관련
  // this._init();
};

Tw.ProductRoaming.prototype = {
  /**
   * @function
   * @desc jQuery 객체 캐싱
   */
  _cachedElement: function () {
    this.$formInfoBtnList = this.$container.find('.info-link-inner'); // 폼나는 정보 관련
  },
  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-link-internal', $.proxy(this._onClickInternal, this));
    // this.$formInfoBtnList.on('click', $.proxy(this._onClickFormInfo, this));
    this.$container.on('click', '.rm-main-recomm-more-btn button', $.proxy(this._onClickMoreToggleBtn, this));
  },
  /**
   * @function
   * @desc 최초 실행
   */
  _init : function() {
    this._historyService.goHash('');
    // 폼나는 정보 관련
    // this.nMax = this._options.banners.centerBanners.length - 1;
    // this.$container.find('.fe-slide-banner').show();
    // Top배너
    // this._renderTopBanner();
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminRoamingBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: '0022' } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } }
    ]).done($.proxy(this._successTosAdminRoamingBanner, this))
        .fail($.proxy(this._errorRequest, this));
        // .fail($.proxy(this._failTosBanner, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminRoamingBanner: function (resp, admBanner) {
    // console.log('resp ===== ', resp);
    // console.log('admBanner ===== ', admBanner);

    var result = [{ target: 'T', banner: resp }, { target: 'C' }];

    result.forEach(function(row){
      if(row.banner && row.banner.code === Tw.API_CODE.CODE_00){
        if(!row.banner.result.summary){
          row.banner.result.summary = {target: row.target};
        }
        row.banner.result.summary.kind = Tw.REDIS_BANNER_TYPE.TOS;
        row.banner.result.imgList = Tw.CommonHelper.setBannerForStatistics(row.banner.result.imgList, row.banner.result.summary);
      }else{
        row.banner = { result: {summary : { target: row.target }, imgList : [] } };
      }

      if(admBanner.code === Tw.API_CODE.CODE_00){
        row.banner.result.imgList = row.banner.result.imgList.concat(
            admBanner.result.banners.filter(function(admbnr){
              return admbnr.bnnrLocCd === row.target;
            }).map(function(admbnr){
              admbnr.kind = Tw.REDIS_BANNER_TYPE.ADMIN;
              admbnr.bnnrImgAltCtt = admbnr.bnnrImgAltCtt.replace(/<br>/gi, ' ');
              return admbnr;
            })
        );
      }
    })
    this._drawTosAdminRoamingBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 응답 실패 처리
   * @param error
   * @private
   */
  // _failTosBanner: function (error) {
  //   Tw.Logger.error(error);
  //   // 홈화면에서 alert 제거
  //   // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  //   var adminList = [{ target: '4' }, { target: 'a' }, { target: 'b' }, { target: 'c' }, { target: 'd' }];
  //   this._getAdminBanner(adminList);
  // },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminRoamingBanner: function (banners) {
    _.map(banners, $.proxy(function (bnr) {
      // 배너구좌 한해서 bltnYn(게시여부)가 N인경우 영역을 없앰
      if ( bnr.banner.result.bltnYn === 'N') {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }

      // if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) ) {
      if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) && bnr.banner.result.imgList.length > 0 ) {
          new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, bnr.banner.result.prtyTp, $.proxy(this._successDrawBanner, this));
      }
    }, this));

    // var directBanner = banners.filter(function(e){
    //   return e.target == 'S'
    // }).map(function(e){
    //   return e.banner.result.imgList
    // })[0].map(function (target) {
    //   target.chargeOrExternal = target.billYn === 'Y' ? 'fe-home-charge' : 'fe-home-external';
    //   return target;
    // });

    // if(banner.bnnrLocCd === 'T'){
    //   this.$container.find('#fe-header-t').remove();
    //   this.$container.find('#fe-banner-t').remove();
    // }else if(banner.bnnrLocCd === 'C'){
    //   this.$container.find('#fe-header-c').remove();
    //   this.$container.find('#fe-banner-c').remove();
    // }


    // if ( directBanner.length > 0 ) {
    //   var tplLine = Handlebars.compile(Tw.HOME_DIRECT_BANNER);
    //   this.$container.find('#fe-direct-banner ul').append(tplLine({ list: directBanner, cdn: Tw.Environment.cdn }));
    // } else {
    //   this.$container.find('#fe-direct-banner').addClass('none');
    // }
    new Tw.XtractorService(this.$container);

  },




  /**
   * @function
   * @desc 어드민 배너 정보 요청
   * @param adminList
   * @private
   */
  _getAdminBanner: function (adminList) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: this._menuId })
        .done($.proxy(this._successBanner, this, adminList))
        .fail($.proxy(this._failBanner, this));
  },

  /**
   * @function
   * @desc 어드민 배너 처리
   * @param adminList
   * @param resp
   * @private
   */
  _successBanner: function (adminList, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      _.map(adminList, $.proxy(function (target) {
        var banner = _.filter(resp.result.banners, function (banner) {
          return banner.bnnrLocCd === target.target;
        });
        if ( banner.length > 0 ) {
          if ( target.target === '7' ) {
            this._membershipBanner = {
              kind: Tw.REDIS_BANNER_TYPE.ADMIN,
              list: banner
            };
          } else {
            new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, banner, target.target, $.proxy(this._successDrawBanner, this));
          }
        } else {
          this.$container.find('ul.slider[data-location=' + target.target + ']').parents('div.nogaps').addClass('none');
          // this._resetHeight();
        }
      }, this));

      var directBanner = _.filter(resp.result.banners, function (banner) {
        return banner.bnnrLocCd === 'S';
      }).map(function (target) {
        target.bnnrImgAltCtt = target.bnnrImgAltCtt.replace(/<br>/gi, ' ');
        target.chargeOrExternal = target.billYn === 'Y' ? 'fe-home-charge' : 'fe-home-external';
        return target;
      });

      if ( directBanner.length > 0 ) {
        var tplLine = Handlebars.compile(Tw.HOME_DIRECT_BANNER);
        this.$container.find('#fe-direct-banner ul').append(tplLine({ list: directBanner, cdn: Tw.Environment.cdn }));
      } else {
        this.$container.find('#fe-direct-banner').addClass('none');
      }
    }
    new Tw.XtractorService(this.$container);
  },

  /**
   * @function
   * @desc 어드민 배너 요청 실패 처리
   * @param error
   * @private
   */
  _failBanner: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
    new Tw.XtractorService(this.$container);
  },

  /**
   * @function
   * @desc 배너 렌더링 성공 callback
   * @private
   */
  _successDrawBanner: function () {
    // this._resetHeight();
  },

  // ====================================

  /**
   * @function
   * @desc 상단 배너 그리기
   */
  _renderTopBanner: function() {
    setTimeout($.proxy(function () {
      new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, this._options.banners.topBanners, 'T');
    }, this), 0);
  },
  /**
   * @function
   * @desc 폼나는정보 팝업 오픈 핸들러
   * @param {Object} $layer - 팝업 엘리먼트의 jQuery 객체
   */
  _onOpenFormInfo: function ($layer) {
    this.$prevBtn = $layer.find('#_dev_prev');
    this.$nextBtn = $layer.find('#_dev_next');
    this.$headerContainers = $layer.find('._dev_header');
    this.$contentContainers = $layer.find('._dev_html');

    this.$prevBtn.on('click', $.proxy(this._onClickPrevBtn, this));
    this.$nextBtn.on('click', $.proxy(this._onClickNextBtn, this));

    this._updateFormInfo();
  },
  /**
   * @function
   * @desc 링크 버튼 클릭 핸들러
   * @param {Object} event - 이벤트 객체
   */
  _onClickInternal: function (event) {
    var url = $(event.currentTarget).data('url');
    this._historyService.goLoad(url);

    event.preventDefault();
    event.stopPropagation();
  },
  /**
   * @function
   * @desc 폼나는정보 클릭 핸들러
   * @param {Object} e - 이벤트 객체
   */
  _onClickFormInfo: function(e) {
    var $target = $(e.currentTarget);
    this.idxSelect = $target.data('index');
    if (this.idxSelect < 0 || this.idxSelect > this.nMax) {
      return;
    }

    this._popupService.open({
        hbs: 'RM_01_XX',
        data: {
          banners: this._options.banners
        }
      },
      $.proxy(this._onOpenFormInfo, this), null, 'info', $target);
  },

  /**
   * @function
   * @desc 폼나는정보 팝업 이전 버튼 클릭 핸들러
   */
  _onClickPrevBtn: function() {
    if (this.idxSelect > 0) {
      this.idxSelect--;
      this._updateFormInfo();
    }
  },
  /**
   * @function
   * @desc 폼나는정보 팝업 다음 버튼 클릭 핸들러
   */
  _onClickNextBtn: function() {
    if (this.idxSelect < this.nMax) {
      this.idxSelect++;
      this._updateFormInfo();
    }
  },
  /**
   * @function
   * @desc 폼나는정보 팝업 화면 업데이트
   */
  _updateFormInfo: function() {
    if ( this.idxSelect === this.nMax ) {
      this.$nextBtn.hide();
    } else {
      this.$nextBtn.show();
    }

    if ( this.idxSelect === 0 ) {
      this.$prevBtn.hide();
    } else {
      this.$prevBtn.show();
    }

    this.$headerContainers.hide().filter('[data-key="' + this.idxSelect + '"]').show();
    this.$contentContainers.hide().filter('[data-key="' + this.idxSelect + '"]').show();
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
      $('.rm-main-recomm>li').hide(); /* 191227 수정 [OP002-6034] */
      $target.text('더 보기');
    } else {
      $target.addClass('active');
      $('.rm-main-recomm>li').show();
      $target.text('숨기기');
    }
  }

};

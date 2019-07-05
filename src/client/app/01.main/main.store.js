/**
 * @file main.store.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.03.12
 */

/**
 * @class
 * @desc 메인 > 홈(store)
 * @param rootEl - dom 객체
 * @param menuId
 * @constructor
 */
Tw.MainStore = function (rootEl, menuId) {
  this.$container = rootEl;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this._menuId = menuId;

  this._bindEventLanding();

  if ( !Tw.Environment.init ) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._setBanner, this));
  } else {
    this._setBanner();
  }
};

Tw.MainStore.prototype = {
  /**
   * @function
   * @desc 랜딩 관련 이벤트 바인딩
   * @return {void}
   * @private
   */
  _bindEventLanding: function () {
    this.$container.on('click', '.fe-home-external', $.proxy(this._onClickExternal, this));
    this.$container.on('click', '.fe-home-internal', $.proxy(this._onClickInternal, this));
  },

  /**
   * @function
   * @desc 외부 브라우저 랜딩 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickExternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    Tw.CommonHelper.openUrlExternal(url);
  },

  /**
   * @function
   * @desc 내부 이동 처리
   * @param $event 이벤트 객체
   * @return {void}
   * @private
   */
  _onClickInternal: function ($event) {
    var url = $($event.currentTarget).data('url');
    this._historyService.goLoad(url);
    // Tw.CommonHelper.openUrlInApp(url);

    $event.preventDefault();
    $event.stopPropagation();
  },

  /**
   * @function
   * @desc 배너 initialize
   * @private
   */
  _setBanner: function () {
    this._getTosAdminStoreBanner();
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminStoreBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: '0004' } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } }
    ]).done($.proxy(this._successTosAdminStoreBanner, this))
      .fail($.proxy(this._failTosStoreBanner, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminStoreBanner: function (resp, admBanner) {
    var result = [{ target: '4', banner: resp },
    { target: 'a' }, { target: 'b' }, { target: 'c' }, { target: 'd' }, { target: 'S' }];

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
    this._drawTosAdminBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 응답 실패 처리
   * @param error
   * @private
   */
  _failTosStoreBanner: function (error) {
    Tw.Logger.error(error);
    // 홈화면에서 alert 제거
    // this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
    var adminList = [{ target: '4' }, { target: 'a' }, { target: 'b' }, { target: 'c' }, { target: 'd' }];
    this._getAdminBanner(adminList);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminBanner: function (banners) {
    _.map(banners, $.proxy(function (bnr) {
      if ( bnr.banner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }
      
      if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) ) {
        if ( bnr.target === '7' ) {
          this._membershipBanner = {
            kind: Tw.REDIS_BANNER_TYPE.TOS_ADMIN,
            list: bnr.banner.result.imgList
          };
        } else {
          new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, $.proxy(this._successDrawBanner, this));
        }
      }
    }, this));

    var directBanner = banners.filter(function(e){
      return e.target == 'S'
    }).map(function(e){
      return e.banner.result.imgList
    })[0];

    if ( directBanner.length > 0 ) {
      var tplLine = Handlebars.compile(Tw.HOME_DIRECT_BANNER);
      this.$container.find('#fe-direct-banner ul').append(tplLine({ list: directBanner, cdn: Tw.Environment.cdn }));
    } else {
      this.$container.find('#fe-direct-banner').addClass('none');
    }
    new Tw.XtractorService(this.$container);

  },

  /**
   * @function
   * @desc 토스 배너 게시 여부 결정
   * @param tosBanner
   * @param target
   * @returns {boolean}
   * @private
   */
  _checkTosBanner: function (tosBanner, target) {
    if ( tosBanner.code === Tw.API_CODE.CODE_00 ) {
      if ( tosBanner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + target + ']').parents('div.nogaps').addClass('none');
        return true;
      } else {
        if ( tosBanner.result.tosLnkgYn === 'Y' ) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
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
  }
};


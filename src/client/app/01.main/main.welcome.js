/**
 * @file main.welcome.js
 * @author Tonyspark (jobkim@gmail.com)
 * @since 2020.11.20
 */

/**
 * @class
 * @desc 메인 > Welcome
 * @param rootEl - dom 객체
 * @param menuId
 * @constructor
 */
Tw.MainWelcome = function (rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._xTractorService = new Tw.XtractorService(rootEl);

  this._menuId = menuId;

  this._getTosAdminProductBanner();
  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MainWelcome.prototype = {
  /**
   * @desc 초기화(핸들바 로딩, apps list 가져오기)
   * @private
   */
  _init: function() {
    this._today = new Date();
    this._appsTmpl = Handlebars.compile($('#fe-tmpl-apps').html());
    this._getApps();
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    this.$list = this.$container.find('.app-list-bottom');
  },

  _bindEvent: function() {
    this.$container.on('click', 'button', _.debounce($.proxy(function(event) {
      var $target = $(event.currentTarget);
      var url = $target.data('url');
      if (url) {
        this._historyService.goLoad(url);
      }
    }, this), 500));
  },

  /**
   * @desc 앱 리스트 요청
   */
  _getApps: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0093, {}).done($.proxy(this._handleLoadApps, this));
    // $.ajax('http://localhost:3000/mock/product.apps.json').done($.proxy(this._handleLoadApps, this));
  },

  /**
   * @desc 앱 리스트 요청에 대한 응답 시
   * @param {object} resp 앱 리스트 요청 응답 값
   * @private
   */
  _handleLoadApps: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var apps = resp.result.prodList || [];

    this._apps = _.map(apps, function(app) {
      app.isNew = Tw.DateHelper.getDiffByUnit(app.newIconExpsEndDtm.substring(0, 8), this._today, 'days') >= 0;
      app.idxExpsSeq = Number(app.idxExpsSeq);

      return app;
    });

    this._appendApps(); // 앱 리스트 랜더링
    this.$container
      .find('.etc-page-list')
      .removeClass('none')
      .attr('aria-hidden', false);

    // if (Tw.BrowserHelper.isApp()) { // 앱인 경우 설치된 앱리스트 확인(native 요청)
    //   this._nativeService.send(
    //     Tw.NTV_CMD.IS_INSTALLED,
    //     {
    //       list: _.map(apps, function(app) {
    //         return {
    //           appKey: app.prodNm,
    //           scheme: app.lnkgAppScmCtt,
    //           package: app.lnkgAppPkgNm
    //         };
    //       })
    //     },
    //     $.proxy(this._handleConfirmAppInstalled, this, apps)
    //   );
    // } else {  // 모바일 웹인 경우
    //   this._apps = _.map(apps, function(app) {
    //     app.isNew = Tw.DateHelper.getDiffByUnit(app.newIconExpsEndDtm.substring(0, 8), this._today, 'days') >= 0;
    //     app.idxExpsSeq = Number(app.idxExpsSeq);

    //     return app;
    //   });

    //   this._appendApps(); // 앱 리스트 랜더링
    //   this.$container
    //     .find('.etc-page-list')
    //     .removeClass('none')
    //     .attr('aria-hidden', false);
    // }
  },

  /**
   * @desc native에서 설치된 앱 응답 값이 돌아온 경우
   * @param {Array<object>} apps
   * @param {object} resp native 응답 값
   * @private
   */
  _handleConfirmAppInstalled: function(apps, resp) {
    var installedList = (resp.params && resp.params.list) || [];
    var list = _.reduce(
      installedList,  // [ { "appname": true | false } ] -> { "appname": boolean ... } 형태로 변경(Array 에서 spread 함)
      function(apps, app) {
        var key = Object.keys(app)[0];
        if (app[key]) {
          apps[key] = app[key];
        }

        return apps;
      },
      {}
    );

    this._apps = _.map(apps, function(app) {
      app.isNew = Tw.DateHelper.getDiffByUnit(app.newIconExpsEndDtm.substring(0, 8), this._today, 'days') >= 0;
      app.isInstalled = list[app.prodNm] || false;
      app.idxExpsSeq = Number(app.idxExpsSeq);

      return app;
    });

    if (!Tw.FormatHelper.isEmpty(list)) {
      this.$container.find('.app-list-top').removeClass('none').attr('aria-hidden', false);
    }

    this._appendApps();
    this.$container
      .find('.etc-page-list')
      .removeClass('none')
      .attr('aria-hidden', false);
  },

  /**
   * @desc 앱 리스트 랜더링
   * @private
   */
  _appendApps: function() {
    this._sortOrder('idxExpsSeq');
    var bestApps = this._apps.slice(0,4);
    this.$list.html(this._appsTmpl({ apps: bestApps }));
    this.$news = this.$list.find('.i-new.none');
  },

  /**
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminProductBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: this._getBannerCode(Tw.UrlHelper.getLastPath()) } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: 'M000422' /*this._menuId */} } // TODO: Welcome 페이지번호로 바꿔서 연동되는거 확인해야 함.
    ]).done($.proxy(this._successTosAdminProductBanner, this))
      .fail($.proxy(this._errorRequest, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminProductBanner: function (banner1, admBanner) {
    var result = [{ target: 'T', banner: banner1 },
      { target: 'C' }
    ];

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
    });
    this._drawTosAdminProductBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminProductBanner: function (banners) {
    banners.forEach($.proxy(function (bnr) {
      if (bnr.banner.result.bltnYn === 'N') {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }

      if (!Tw.FormatHelper.isEmpty(bnr.banner.result.summary)
        && bnr.banner.result.imgList.length > 0) {
        new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, bnr.banner.result.prtyTp, $.proxy(this._successDrawBanner, this));
      } else {
        if (bnr.banner.bnnrLocCd === 'T') {
          this.$container.find('#fe-header-t').remove();
          this.$container.find('#fe-banner-t').remove();
        } else if (bnr.banner.bnnrLocCd === 'C') {
          this.$container.find('#fe-header-c').remove();
          this.$container.find('#fe-banner-c').remove();
        }
      }
    }, this));

    new Tw.XtractorService(this.$container);

  },

  /**
   * @desc TOS 배너 코드 리턴
   * @returns {string} TOS 배너 코드
   * @private
   */
  TOS_BANNER_CODES: {
    'mobileplan': '0011',
    'mobileplan-add': '0012',
    'wireplan': '0013',
    'welcome': '0014'
  },

  _getBannerCode: function(uri) {
    return this.TOS_BANNER_CODES[uri];
  },

    /**
   * @desc 앱 리스트 정렬
   * @param {string} order 정렬할 property key
   * @private
   */
  _sortOrder: function(order) {
    if (this._order === order) {
      return;
    }

    this._order = order;

    if (order === 'prodNm') {
      this._apps.sort($.proxy(this._sort, this));
    } else {
      this._apps.sort($.proxy(this._sortDescending, this));
    }
  },
  /**
   * @desc 오름차순 소팅
   * @param {object} a 소팅할 앱 a
   * @param {object} b 소팅할 앱 b
   * @private
   */
  _sort: function(a, b) {
    if (a[this._order] < b[this._order]) return -1;
    if (a[this._order] > b[this._order]) return 1;
    return 0;
  },

  /**
   * @desc 내림차순 소팅
   * @param {object} a 소팅할 앱 a
   * @param {object} b 소팅할 앱 b
   * @private
   */
  _sortDescending: function(a, b) {
    if (a[this._order] > b[this._order]) return -1;
    if (a[this._order] < b[this._order]) return 1;
    return 0;
  },
};

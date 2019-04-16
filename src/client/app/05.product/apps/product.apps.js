/**
 * @file T앱
 * @author Jiyoung Jo
 * @since 2018.11.14
 */

Tw.ProductApps = function(rootEl, menuId) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._xTractorService = new Tw.XtractorService(rootEl);

  this._getBanners(menuId);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.ProductApps.prototype = {
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
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function() {
    this.$orderBtn.on('click', $.proxy(this._openOrderPopup, this));
    this.$container.on('change', '.btn-switch input', $.proxy(this._handleToggleShowInstalled, this));
  },

  /**
   * @desc jquery 객체 캐싱
   * @private
   */
  _cachedElement: function() {
    this.$list = this.$container.find('.app-list-bottom');
    this.$orderBtn = this.$container.find('.text-type01');
    this.$switchBtn = this.$container.find('.btn-switch input');
  },

  /**
   * @desc admin 배너 요청
   * @param {string} menuId 페이지 메뉴 id
   * @private
   */
  _getBanners: function(menuId) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: menuId }).done($.proxy(this._handleLoadBanners, this));
  },

  /**
   * @desc 배너 요청 응답 시(상단 배너 필터링 및 banner service 호출)
   * @param {object} resp 배너 요청 응답 값
   * @private
   */
  _handleLoadBanners: function(resp) {
    new Tw.BannerService(
      this.$container,
      Tw.REDIS_BANNER_TYPE.ADMIN,
      _.filter(resp.result.banners, function(banner) {
        return banner.bnnrLocCd === 'T';
      }),
      'T'
    );
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

    if (Tw.BrowserHelper.isApp()) { // 앱인 경우 설치된 앱리스트 확인(native 요청)
      this._nativeService.send(
        Tw.NTV_CMD.IS_INSTALLED,
        {
          list: _.map(apps, function(app) {
            return {
              appKey: app.prodNm,
              scheme: app.lnkgAppScmCtt,
              package: app.lnkgAppPkgNm
            };
          })
        },
        $.proxy(this._handleConfirmAppInstalled, this, apps)
      );
    } else {  // 모바일 웹인 경우
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
    }
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
    this._sortOrder('storRgstDtm');
    this.$list.html(this._appsTmpl({ apps: this._apps }));
    this.$news = this.$list.find('.i-new.none');
  },

  /**
   * @desc 앱 리스트 정렬 순서 변경 클릭 시 
   * @private
   */
  _openOrderPopup: function() {
    var _order = this._order,
      list = _.map(Tw.PRODUCT_APPS_ORDER, function(order) {
        if (order['radio-attr'].indexOf(_order) > 0) {
          return $.extend({}, order, { 'radio-attr': order['radio-attr'] + ' checked' });
        }
        return order;
      });

    this._popupService.open(
      {
        hbs: 'actionsheet01', // hbs의 파일명
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: list }],
        layer: true
      },
      $.proxy(this._handleOpenOrderPopup, this),
      undefined,
      undefined,
      this.$orderBtn
    );
  },

  /**
   * @desc 순서 팝업 이벤트 바인딩
   * @param {$object} $layer 순서 팝업 레이어 jquery 객체
   * @private
   */
  _handleOpenOrderPopup: function($layer) {
    $layer.on('click', 'li.type1', $.proxy(this._handleSelectOrder, this));
  },

  /**
   * @desc 순서 선택 시 
   * @param {Event} e 클릭 이벤트 객체
   */
  _handleSelectOrder: function(e) {
    var nOrder = $(e.currentTarget)
      .find('input')
      .data('prop');

    if (this._order === nOrder) { // 순서가 동일 할 경우 return
      this._popupService.close();
      return;
    }

    this.$orderBtn.text(
      $(e.currentTarget)
        .find('.txt')
        .text()
    );

    this._sortOrder(nOrder);
    this.$list.empty();
    this.$list.html(this._appsTmpl({ apps: this._apps }));
    this.$news = this.$list.find('.i-new.none');
    if (!this.$switchBtn.attr('checked')) {
      this._toggleShowInstalled(false);
    }
    this._popupService.close();
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

  /**
   * @desc 설치된 앱 보기 버튼 클릭 시
   * @param {Event} e 클릭 이벤트 객체
   * @private
   */
  _handleToggleShowInstalled: function(e) {
    this._toggleShowInstalled(e.currentTarget.getAttribute('checked'));
  },

  /**
   * @desc 설치된 앱 보기 toggle
   * @param {boolean} isOn 현재 설치된 앱 보기 on 상태인 지
   * @private
   */
  _toggleShowInstalled: function(isOn) {
    if (isOn) {
      this.$list
        .find('.i-atv')
        .removeClass('none')
        .attr('aria-hidden', false);
      this.$news.addClass('none').attr('aria-hidden', true);
    } else {
      this.$list
        .find('.i-atv')
        .addClass('none')
        .attr('aria-hidden', true);
      this.$news.removeClass('none').attr('aria-hidden', false);
    }
  }
};

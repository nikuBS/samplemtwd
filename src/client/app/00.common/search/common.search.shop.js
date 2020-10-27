/**
 * @file 검색 키워드(지점, 대리점, 영업점, 매장) 일때 지도 및 매장 정보 노출.
 * @author 양정규
 * @since 2020-07-24
 */

/**
 * @constructor
 * @param  {Object} commonSearch - CommonSearch
 */
Tw.CommonSearchShop = function (commonSearch) {
  this._searchInfo = commonSearch._searchInfo;
  this.$container = commonSearch.$container;
  this._historyService = commonSearch._historyService;
  this._svcInfo = commonSearch._svcInfo || {};
  this._needLogin = Tw.FormatHelper.isEmpty(this._svcInfo) || this._svcInfo.loginType === Tw.AUTH_LOGIN_TYPE.EASY;

  this._locationInfoComponent = new Tw.LocationInfoComponent();
  this._tmapMakerComponent = new Tw.TmapMakerComponent();
  this._tidLanding = new Tw.TidLandingComponent();
  this.customerAgentsearchComponent = new Tw.CustomerAgentsearchComponent(this.$container, this._svcInfo);
  this._apiService = Tw.Api;

  this._location = null;
  this._nearShops = [];
  this._tShops = [];
  this._respTshop = null;
  this._totalPage = 1;
  this._reqPageNo = 1;
  this._locInfo = {}; // 위치 권한 정보
  this._zoom = 15;  // 지도 zoom size

  this._init();
};

Tw.CommonSearchShop.prototype = {

  /**
   * @function
   * @desc app인 경우 현재 위치 조회하고, mweb인 경우 약관 먼저 조회
   */
  _init: function () {
    this._nextStep();
  },

  _nextStep: function () {
    /*
      1. 입력 키워드가 (지점, 대리점, 영업점, 매장) 인지 확인
      2. 만 14세 이상확인
      3. 위치정보 이용동의 확인

      IF 만 14세 미만은 위치정보 동의 하지 못함. 다음스텝 무시.
      ELSE THEN 만 14세 이상인 경우 위치정보 동의 확인 하여 미동의인 경우 "위치정보 이용동의" 배너 노출.
      ELSE 지도 및 매장정보 노출.
     */
    var regExp = /지점|대리점|영업점|매장/;
    if (!regExp.test(this._searchInfo.query)) {
      return;
    }
    this._cacheElements();
    this.customerAgentsearchComponent.registerHelper();
    // OP002-10922 비로그인/간편 로그인 유저도 지점/대리점 검색 가능
    if (this._needLogin){
      this._locInfo = {
        over14: true,
        locAgree: false
      };
      return this._notAgreeLocation();
    }
    var self = this;
    this._locationInfoComponent.checkLocationAgreementWithAge(function (res) {
      self._locInfo = res;
      if (self._notAgreeLocation.call(self)) {
        return;
      }
      self.customerAgentsearchComponent.showDataCharge(self._requestCurrentPosition.bind(self));
    });
  },

  _cacheElements: function () {
    this.shopInfoArea = this.$container.find('#fe-shop-info-area');
    this._loading = this.$container.find('.fe-loading');
    this.$shopAreaTempl = Handlebars.compile($('#shop_area_templ').html());
    this.$shopListTempl = Handlebars.compile($('#shop_list_templ').html());
    Handlebars.registerPartial('shopList', $('#shop_list_templ').html());
  },

  // 로딩 후
  _afterCacheElements: function () {
    this.$slider = this.$container.find('.fe-slider');  // 매장 슬라이더
  },

  // handlebars 완료 후 이벤트 바인딩 하기
  _bindEvents: function () {
    this.$container.on('click', '.fe-location-alert', $.proxy(this._onLocationAlert, this)); // 위치정보 이용동의 배너
    this.$container.on('click', '#fe-myLocation', $.proxy(this._requestCurrentPosition, this)); // 내 위치 버튼 클릭 이벤트
    this.$container.on('click', '#fe-myLocation', $.proxy(this._requestCurrentPosition, this)); // 내 위치 버튼 클릭 이벤트
  },

  /**
   * @function
   * @desc 미로그인/간편로그인 로그인 페이지로 이동
   * @private
   */
  _onLocationAlert: function () {
    // 미 로그인/간편 로그인은 로그인 페이지로
    if (this._needLogin) {
      var path = location.pathname,
        search = location.search,
        hash = location.hash;
      search += !search ? '?' : '&';
      search += 'date=' + new Date().getTime();
      this._tidLanding.goLogin(path+search+hash);
      return;
    }
    this._historyService.goLoad('/main/menu/settings/location');
  },

  /**
   * @function
   * @desc 현재위치 조회(app/web)
   */
  _requestCurrentPosition: function () {
    this._locationInfoComponent.getCurrentLocation($.proxy(function (res) {
      this._location = res; // 현재 좌표 저장
      /*this._location = {  // 3Km 에 매장 있는거
        longitude: 127.3015055,
        latitude: 37.4038252
      };*/
      /*this._location = {  // 3Km 안에 매장 없는거
        longitude: 126.3015055,
        latitude: 37.4038252
      };*/
      this._loading.removeClass('none');
      this._findNearShop();
    }, this), $.proxy(function () { // 위치정보 실패시
      if (Tw.BrowserHelper.isApp()) {
        this._notAgreeLocation();
        return;
      }
      // (web인 경우만! app은 네이티브에서 알럿 메시지 띄어줌.) 위치확인 실패 시 알럿. IOS, Android 메시지 분리
      var msg = Tw.BrowserHelper.isIos() ? Tw.CUSTOMER_MOBILEWEB_GPSOFF.IOS_MSG : Tw.CUSTOMER_MOBILEWEB_GPSOFF.AOS_MSG;
      this._popupService.openAlert(msg, Tw.CUSTOMER_MOBILEWEB_GPSOFF.TITLE, null,
        $.proxy(this._notAgreeLocation, this)); // '확인' 버튼 콜백
    }, this));
  },

  _notAgreeLocation: function () {
    // 만 14세 미만일 때 진행 안함.
    if (!this._locInfo.over14) {
      return true;
    }
    // 위치 권한 미동의. 위치정보 이용동의 배너 알럿 띄움.
    if (!this._locInfo.locAgree) {
      this._resultRender({
        locAgree: false,
        showBanner: !this.customerAgentsearchComponent.hasStorage() // 위치정보 동의 배너 노출 유무
      });
      return true;
    }
    return false;
  },

  /**
   * @function
   * @desc 최초 진입시 주변 매장 검색 요청(최초 500m 내의 검색반경 내의 지점/대리점이 없을 경우 1km/3km의 검색 진행)
   * @param location
   */
  _findNearShop: function () {
    // OP002-8862 최초 500m 내의 검색반경 내의 지점/대리점이 없을 경우 1km/3km의 검색 진행
    var options = this.customerAgentsearchComponent.getRadiusList();

    var i = 0;
    var funcRequest = function (option) {
      var param = {
        storeType: 0, // 전체
        currLocX: this._location.longitude,
        currLocY: this._location.latitude,
        distance: option.distance
      };
      this._request(Tw.API_CMD.BFF_08_0008, param).done(function (res) {
        // 주변 매장 리스트가 없을 때, 최대 3km 까지 재검색 한다.
        if (Tw.FormatHelper.isEmpty(res.result.regionInfoList)) {
          var next = options[i++];
          if (next) {
            funcRequest(next);
            return;
          }
        }
        this._nearShopCallback({
          shopList: res.result.regionInfoList,
          zoom: option.zoom
        });
      }.bind(this));
    }.bind(this);

    funcRequest(options[i++]);
  },

  /**
   * @function
   * @param{Object} options
   * @desc 주변 매장 검색 요청 콜백
   */
  _nearShopCallback: function (options) {
    this._zoom = options.zoom;
    if(!Tw.FormatHelper.isEmpty(options.shopList)){
      this._nearShops = options.shopList.slice(0, 5); // 5개만 가져온다.
      return this._resultRender();
    }
    //  3km 안에 매장 없을때 예약가능한 티샵을 조회한다.
    this._requestTshop(this._resultRenderNoShop);
  },

  _requestTshop: function (callback) {
    // 매장 결과가 없을 경우, 예약가능한 티샵 리스트를 재조회 한다.
    var param = {
      storeType: '0',
      tSharpYn: 'Y', // 원래는 이걸로 해야하나, 현재 데이터가 없어서 임시 주석처리.
      // searchText : encodeURIComponent('강남'), // 티샵 예약가능 매장이 없어서. 임시로 을지로 조회로 대체
      currentPage: this._reqPageNo++
    };
    this._request(Tw.API_CMD.BFF_08_0004, param).done($.proxy(callback, this));
  },

  _resultRender: function (options) {
    this._loading.addClass('none');
    var param = $.extend({
      locAgree: true, // 위치 접근권한 동의 여부
      isTShopList: false, // 근처 매장 없을 때, 티샵 예약가능한 매장인지 여부
      shopList: this._nearShops
    }, options);
    this.customerAgentsearchComponent.ableTasks(param.shopList);  // 업무영역
    this.shopInfoArea.html(this.$shopAreaTempl(param));

    this._afterInit();
    // 위치접근권한 미동의, isTShopList 이면 지도 미노출.
    if (param.locAgree && !param.isTShopList) {
      this._initMap();
    }
  },

  /**
   * @function
   * @param res
   * @desc 티샵매장일때 렌더링
   */
  _resultRenderNoShop: function (res) {
    this._loading.addClass('none');
    this._respTshop = res.result;
    var param = {
      locAgree: true, // 위치 접근권한 동의 여부
      isTShopList: true, // 근처 매장 없을 때, 티샵 예약가능한 매장인지 여부
      shopList: this._getTshopSplice()
    };
    this._tShops.push(param.shopList);  // 3개씩 보여주는 티샵 리스트에 저장.
    this.customerAgentsearchComponent.ableTasks(param.shopList);  // 업무영역

    // totalCount 전체 페이지
    var totalPage = parseInt(this._respTshop.totalCount || 0, 10);
    param.totalPage = this._totalPage = Math.ceil(totalPage / 3);
    this.shopInfoArea.html(this.$shopAreaTempl(param));


    this.pageNo = this.$container.find('.fe-page-no'); // paging 현재 번호
    this.btnPrev = this.$container.find('.fe-prev'); // 이전 버튼
    this.btnNext = this.$container.find('.fe-next'); // 다음 버튼
    var _bindEvents = function () {
      this._bindEvents();
      this.btnPrev.on('click', $.proxy(this._prev, this)); // 이전
      this.btnNext.on('click', $.proxy(this._next, this)); // 다음
    }.bind(this);
    _bindEvents();
    this._onBtnActive();
  },

  /**
   * @function
   * @return {T[]}
   * @desc 최근 수신 리스트에서 티샵 리스트 3개 가져오기
   */
  _getTshopSplice: function () {
    return this._respTshop.regionInfoList.splice(0, 3);
  },

  /**
   * @function
   * @param idx
   * @return {*}
   * @desc 저장된 티샵 매장 리스트 가져오기
   */
  _getTshopList: function (idx) {
    return this._tShops[idx];
  },

  /**
   * @function
   * @param shopList
   * @desc 티샵 매장 리스트 렌더링
   */
  _renderPaging: function (shopList) {
    var data = {
      shopList: shopList
    };
    this.$container.find('.fe-result-list').html(this.$shopListTempl(data));
  },

  /**
   * @function
   * @return {number}
   * @desc 현재 페이지 번호
   */
  _getCurrentPageNo: function () {
    return parseInt(this.pageNo.text(), 10) || 1;
  },

  _onBtnActive: function () {
    var pageNo = this._getCurrentPageNo();
    var disabled = 'disabled';
    var prevState = pageNo <= 1;
    var nextState = pageNo >= this._totalPage;
    this.btnPrev.toggleClass(disabled, prevState).prop(disabled, prevState);
    this.btnNext.toggleClass(disabled, nextState).prop(disabled, nextState);
  },

  /**
   * @function
   * @이전 페이지
   */
  _prev: function () {
    var pageNo = this._getCurrentPageNo();
    if ((pageNo - 1) < 1) {
      return;
    }
    var shopList = this._getTshopList(pageNo-2);
    this.pageNo.text(pageNo - 1);
    this._onBtnActive();
    this._renderPaging(shopList);
  },

  /**
   * @function
   * @desc 다음 페이지
   */
  _next: function () {
    var pageNo = this._getCurrentPageNo();
    if (pageNo + 1 > this._totalPage) {
      return;
    }

    var process = function (shopList) {
      this.pageNo.text(pageNo + 1);
      this._onBtnActive();
      this._renderPaging(shopList);
    }.bind(this);

    var shopList = this._getTshopList(pageNo);
    if (!shopList){
      shopList = this._getTshopSplice();
      if (shopList.length < 3 && this._respTshop.lastPageType === 'N') {
        this._requestTshop(function (res){
          this._respTshop.regionInfoList = shopList.concat(res.result.regionInfoList);
          this._respTshop.lastPageType = res.result.lastPageType;
          shopList = this._getTshopSplice();
          this._tShops.push(shopList);
          process(shopList);
        }.bind(this));
        return;
      }
      this._tShops.push(shopList);
      process(shopList);
      return;
    }
    process(shopList);
  },

  _afterInit: function () {
    this._afterCacheElements();
    this._bindEvents();
    this._slick();
  },

  /**
   * @function
   * @desc 지도영역 초기화, 주변 매장 검색이 완료되면 이를 tmap 상의 layer에 marker로 표시
   */
  _initMap: function () {
    var map = this._tmapMakerComponent;
    // Tmap 생성
    map.makeTmap($.extend({
      id: 'fe-tmap-box',
      width: '100%',
      height: this.$container.find('#fe-map-area').height() + 'px',
      zoom: this._zoom
    }, this._location))
      .makeMarker($.extend({ // 마커 생성
        icon: Tw.TMAP.COMPASS, //Marker의 아이콘.
        width: 38
      }, this._location));

    // 마커 선택 표시 및 선택된 마커의 매장 정보 조회
    var funcCheckMarker = function (index) {
      // 현재 선택한 마커는 선택표시, 제외한 나머지 마커를 기본 마커로 변경
      var currentMarker = map.getSelectedMarker();
      if (currentMarker.options.locCode === index) {
        return;
      }
      map.markerSelect(index);
      this.$slider.slick('slickGoTo',index);
    };

    // 지점 대리점 리스트 전체 마커 생성
    this._nearShops.forEach(function (shop, idx) {
      // 마커 파라미터
      var markerParam = {
        latitude: shop.geoY,
        longitude: shop.geoX,
        event: [
          {name: 'click', func: funcCheckMarker.bind(this, idx)}
        ],
        options: {
          locCode : idx
          // locCode : shop.locCode
        }
      };
      // 첫번째 마커를 제외한, 나머지 마커는 비선택 아이콘으로 설정한다.
      if (idx > 0) {
        $.extend(markerParam, {
          iconType: Tw.TmapMakerComponent.ICON_TYPE.UN_CHECK
        });
      }
      this._tmapMakerComponent.makeMarker(markerParam);
    }.bind(this));

    // slick event
    this.$slider.on('afterChange', function (slick, currentSlide) {
      map.markerSelect(currentSlide.currentSlide);
    });
  },

  _slick: function () {
    //슬릭이 진행중인지 css로 체크
    if( this.$slider.hasClass('slick-initialized') ){
      this.$slider.slick('unslick');
    }
    this.$slider.slick({
      autoplay: false,
      autoplaySpeed: 4000,
      dots: true,
      arrows: true,
      infinite: true,
      speed : 300,
      lazyLoad: 'progressive',
      centerMode: false,
      focusOnSelect: false,
      touchMove : true
    });
  },

  /**
   * @function
   * @param bff
   * @param param
   * @return {{done: (function(*): *)}}
   * @desc BFF 리퀘스트. 결과가 실패이면 로딩중 화면 비노출 및 다음스텝 진행안함.
   */
  _request: function (bff, param) {
    var self = this;
    var fail = function (res) {
      Tw.Error(res.code, res.msg).pop();
      self._loading.addClass('none');
    };
    return {
      done: function (func) {
        return self._apiService.request(bff, param).done(function (res){
          if (res.code !== Tw.API_CODE.CODE_00) {
            fail(res);
            return;
          }
          func(res);
        }).fail(fail);
      }
    };
  }
};

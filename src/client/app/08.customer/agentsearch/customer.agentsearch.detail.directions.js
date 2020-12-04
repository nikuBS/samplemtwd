/**
 * @file 지점 상세화면 > 길찾기
 * @author 양정규
 * @since 2020-11-25
 */

Tw.Directions = {
  ACTION_SHEET_NAME: 'maps',
  INSTALLED_APPS: {
    tmap: {
      nativeParam: {
        appKey: 'tmap',
        scheme: 'tmap',
        'package': 'com.skt.tmap.ku'
      },
      bundleId: 'id431589174',
      isInstall: false
    },
    naver: {
      nativeParam: {
        appKey: 'naver',
        scheme: 'nmap',
        'package': 'com.nhn.android.nmap'
      },
      bundleId: 'id311867728',
      isInstall: false
    },
    kakao: {
      nativeParam: {
        appKey: 'kakao',
        scheme: 'daummaps',
        'package': 'net.daum.android.map'
      },
      bundleId: 'id304608425',
      isInstall: false
    },
    google: {
      nativeParam: {
        appKey: 'google',
        scheme: 'comgooglemaps',
        'package': 'com.google.android.apps.maps'
      },
      isInstall: false
    },
    apple: {
      nativeParam: {
        appKey: 'apple',
        scheme: 'maps'
      },
      bundleId: 'id915056765',
      isInstall: false
    }
  }
};

/**
 * @constructor
 * @param  {Object} rootEl - root Element
 * * @param  {Object} options - 옵션 파라미터
 */
Tw.CustomerAgentsearchDetailDirections = function (rootEl, options) {
  this.$container = rootEl;
  var coord = options.coord;
  // 목적지 좌표
  this._targetPosition = {
    latitude: coord.lat,
    longitude: coord.lon
  };
  this._storeName = options.detail.storeName; // 매장명
  this._myPosition = {}; // 내 위치정보
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._locationInfoComponent = new Tw.LocationInfoComponent();

  this._init();
};

Tw.CustomerAgentsearchDetailDirections.prototype = {

  /**
   * @function
   * @desc 초기 설정
   * @private
   */
  _init: function () {
    this._cacheElements();
    this._bindEvents();
    this._isAppInstalled();
  },

  /**
   * @function
   * @desc DOM caching
   */
  _cacheElements: function () {
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$container.on('click', '.fe-directions', $.proxy(this._onOpenMapsActionSheet, this)); // "길찾기"
  },

  /**
   * @function
   * @desc 앱 설치유무. 네이티브 콜 하여 판단한다.
   * @private
   */
  _isAppInstalled: function () {
    if (!Tw.BrowserHelper.isApp()) {
      return;
    }

    // 앱설치 확인할 리스트
    var mapsList = _.map(Tw.Directions.INSTALLED_APPS, function (item){
      var cloneItem = $.extend(true, {}, item.nativeParam);
      cloneItem.scheme += '://';
      return cloneItem;
    });

    this._nativeService.send(
      Tw.NTV_CMD.IS_INSTALLED,
      {
        list: _.clone(mapsList)
      },
      function (res) { // 네이티브 응답
        var list = res.params.list;
        if (list.length === 0) {
          return;
        }
        _.map(list, function (item){
          var obj = Object.getOwnPropertyNames(item)[0];
          Tw.Directions.INSTALLED_APPS[obj].isInstall = item[obj];
        });
      }
    );
  },

  /**
   * @function
   * @desc 현재위치 조회(app/web)
   */
  _getMyPosition: function (callBack) {
    var self = this;
    // 이미 위치조회를 했다면 바로 리턴한다.
    if (!Tw.FormatHelper.isEmpty(self._myPosition)) {
      callBack(self._myPosition);
      return;
    }
    this._locationInfoComponent.getCurrentLocation( function (res) { // 위치정보 조회 성공
      self._myPosition = res; // ex. latitude: 37.4038252, longitude: 127.3015055
      callBack(res);
    }, function () { // 위치정보 조회 실패
      /*self._myPosition = {
        latitude: 37.4038252,
        longitude: 127.3015055
      };
      callBack(self._myPosition);*/
      // [E]

      callBack(null);
      self._popupService.openAlert(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A69.MSG);
    });
  },

  /**
   * @function
   * @desc 지도목록 액션시트(Tmap, 네이버지도, 카카오맵, 구글지도(안드로이드 일때만), 애플지도(IOS일때만))
   * @param event
   */
  _onOpenMapsActionSheet: function (event) {
    var $target = $(event.currentTarget);
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_MAPS,
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._openMapsCallback, this), null, Tw.Directions.ACTION_SHEET_NAME ,$target);
  },

  /**
   * @function
   * @desc _onOpenMapsActionSheet 콜백함수
   * @param $target
   * @param $layer
   */
  _openMapsCallback: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    // 단말기 OS에 따라 보여줄 지도 노출
    var hideMap = Tw.BrowserHelper.isIos() ? 'google' : 'apple';
    $layer.find('[data-open-app="' +hideMap+ '"]').parent().hide();
    $layer.on('click', '[data-open-app]', $.proxy(this._onClickMap, this, $layer));
  },

  /**
   * @function
   * @desc 액션시트 목록에서 특정 지도앱 선택
   * @private
   */
  _onClickMap: function ($layer, e) {
    var $target = $(e.currentTarget);
    var mapName = $target.data('open-app');
    this._popupService.close();

    var self = this;
    // 액션시트가 완전히 종료 된 후 실행되도록 인터벌을 준다. 액션시트가 close 중일 때 하위 로직에서 팝업 떴을때 팝업 close 안되는 현상 있음.
    var closePopInterval = window.setInterval(function (){
      if (self._historyService.getHash() !== '#'+Tw.Directions.ACTION_SHEET_NAME+'_P') { // 위에 액션시트 띄울때 해쉬명 'maps' + '_P'
        window.clearInterval(closePopInterval);
        // 함수 동적 호출. 첫 글자만 대문자로 변경
        // 샘플. self['_openNaver']();
        self['_open' + mapName.charAt(0).toUpperCase() + mapName.substring(1)](mapName);
      }
    }, 500);
  },

  /**
   * @function
   * @desc 지도앱 실행(앱/웹)
   * @param options
   * @private
   */
  _executeApp: function (options) {
    var isIos = Tw.BrowserHelper.isIos(),
      isAndroid = Tw.BrowserHelper.isAndroid(),
      mapInfo = Tw.Directions.INSTALLED_APPS[options.mapName],
      _package = !isIos ? mapInfo.nativeParam['package'] : '',
      appleStoreUrl = 'https://apps.apple.com/kr/app/' + mapInfo.bundleId,
      self = this;

    options = $.extend({
      isOpenScheme: true,
      isOpenIntent: true
    }, options);

    var urlInfo = function () {
      var appUrl = options.appUrl,
        appParam = options.appParam,
        webUrl = options.webUrl || appUrl,
        webParam = options.webParam || appParam,
        appUrlFull = appParam ? appUrl + '?' + $.param(appParam) : appUrl,
        webUrlFull = !options.webUrl ? appUrlFull : webParam ? webUrl + '?' + $.param(webParam) : webUrl;

      return {
        appUrl: appUrlFull,
        webUrl: webUrlFull,
        schemeUrl: mapInfo.nativeParam.scheme + '://' + appUrlFull
      };
    };

    if (Tw.BrowserHelper.isApp()) { // 앱 일때
      // app 미설치. 각 스토어로 이동.
      if (!mapInfo.isInstall) {
        if (isIos) {
          // IOS의 경우는 '외부새창'으로 해야 스토어 앱 실행됨.
          Tw.CommonHelper.openUrlExternal(appleStoreUrl);
          return;
        }
        location.href = 'market://details?id=' + _package;
        return;
      }

      var appUrl = urlInfo().appUrl;
      // Tmap 만 iframe으로 한다. 그냥 호출하면 tmap 사이트로 이동 후 앱이 떠서.
      if (options.mapName === 'tmap') {
        this.$container.append('<iframe id="fe-tmap-iframe" src="'+appUrl+'"></iframe>');
        window.setTimeout(function (){
          self.$container.find('#fe-tmap-iframe').remove();
        }, 1000);
        return;
      }

      // scheme 으로 실행시
      appUrl = options.isOpenScheme ? urlInfo().schemeUrl : appUrl;
      this._historyService.goLoad(appUrl);
      return;
    } //-> [E] 앱 일때

    // web 인 경우
    var webUrl = urlInfo().webUrl;
    if (options.mapName === 'tmap') {
      Tw.CommonHelper.openUrlExternal(webUrl);
      return;
    }
    // IOS 일때
    if (isIos){
      this._historyService.goLoad( urlInfo().schemeUrl );

      // 앱설치가 안되어 실행 안될경우, 잠시 뒤 애플 스토어로 이동함.
      var clickedAt = +new Date();
      window.setTimeout(function () {
        if (+new Date() - clickedAt < 2000) {
          self._historyService.goLoad(appleStoreUrl);
        }
      }, 1500);

      return;
    }

    // intent 로 실행일때 (안드로이드 일때만)
    if (isAndroid && options.isOpenIntent) {
      var intentUrl = 'intent://{0}#Intent;scheme={1};package={2};end',
        scheme = options.scheme || mapInfo.nativeParam.scheme;

      webUrl = Tw.StringHelper.stringf(intentUrl, webUrl, scheme, _package);
    }
    this._historyService.goLoad(webUrl);
  },

  /**
   * @function
   * @desc Tmap 앱 실행
   * @private
   */
  _openTmap: function (mapName) {
    this._executeApp({
      mapName: mapName,
      appUrl: 'https://apis.openapi.sk.com/tmap/app/routes',
      appParam: {
        appKey: Tw.TMAP.APP_KEY,
        name: this._storeName,
        lat: this._targetPosition.latitude,
        lon: this._targetPosition.longitude
      }
    });
  },

  /**
   * @function
   * @desc 네이버 지도 앱 실행
   * @private
   */
  _openNaver: function (mapName) {
    // 현재위치 조회
    this._getMyPosition(function (position) {
      if (!position) {
        return;
      }

      var url = 'route/public',
        appName = {
          ios: 'id428872117',
          android: 'Com.sktelecom.minit',
          web: location.hostname
        },
        appParam = {
          slat: position.latitude,  // 출발지 위도
          slng: position.longitude, // 출발지 경도
          sname: '출발지', // 출발지 명
          dlat: this._targetPosition.latitude, // 목적지 위도
          dlng: this._targetPosition.longitude, // 목적지 경도
          dname: this._storeName, // 목적지 명
          appname: 'Com.sktelecom.minit'  // 네이버 지도을 호출하는 앱이름(android: applicationId, ios:번들ID, web: 웹페이지 url)
        },
        param = {
          mapName: mapName,
          appUrl: url,
          appParam: appParam
        };

      if (Tw.BrowserHelper.isApp()) {
        appParam.appname = Tw.BrowserHelper.isIos() ? appName.ios : appName.android;
      } else {
        appParam.appname = appName.web;
      }

      this._executeApp(param);
    }.bind(this));
  },

  /**
   * @function
   * @desc 다음 지도 앱 실행
   * @private
   */
  _openKakao: function (mapName) {
    // 현재위치 조회
    this._getMyPosition(function (position){
      if (!position) {
        return;
      }

      this._executeApp({
        mapName: mapName,
        appUrl: 'route',
        appParam: {
          sp: position.latitude + ',' + position.longitude, // 출발지 위,경도
          ep: this._targetPosition.latitude + ',' + this._targetPosition.longitude, // 목적지 위,경도
          by: 'PUBLICTRANSIT' // 대중교통 길찾기
        }
      });
    }.bind(this));
  },

  /**
   * @function
   * @desc 구글 지도 앱 실행
   * @private
   */
  _openGoogle: function (mapName) {
    // android 만 실행
    if (!Tw.BrowserHelper.isAndroid()) {
      throw new Error('only android!');
    }

    var tLat = this._targetPosition.latitude,
      tLng = this._targetPosition.longitude;

    if (Tw.BrowserHelper.isApp()) { // app 인 경우
      var param = {
        q: tLat + ',' + tLng,
        mode: 'l'
      };
      this._executeApp({
        mapName: mapName,
        appUrl: 'google.navigation:' + $.param(param),
        isOpenScheme: false
      });
      return;
    } // app 끝

    // web 인 경우
    // 현재위치 조회
    this._getMyPosition(function (position){
      if (!position) {
        return;
      }

      var url = 'www.google.com/maps/dir/{0},{1}/{2},{3}';
      url = Tw.StringHelper.stringf(url, position.latitude, position.longitude, tLat, tLng);
      this._executeApp({
        mapName: mapName,
        scheme: 'https',
        webUrl: url
      });
    }.bind(this));
  },

  /**
   * @function
   * @desc 애플지도 앱 실행
   * @param mapName
   * @private
   */
  _openApple: function (mapName) {
    // 현재위치 조회
    this._getMyPosition(function (position) {
      if (!position) {
        return;
      }

      this._executeApp({
        mapName: mapName,
        appUrl: 'http://maps.apple.com/',
        appParam: {
          saddr: position.latitude + ',' + position.longitude,
          daddr: this._targetPosition.latitude + ',' + this._targetPosition.longitude,
          dirflg: 'd' // 길찾기 타입. d:car, w: foot, r: public transit
        }
      });
    }.bind(this));
  }

};

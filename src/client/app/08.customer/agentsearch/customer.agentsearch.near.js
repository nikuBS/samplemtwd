/**
 * @file 나와 가까운 지점 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-29
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상단 elem
 */
Tw.CustomerAgentsearchNear = function (rootEl, isLogin, isAcceptAge) {
  this.$container = rootEl;
  this.isLogin = (isLogin === 'true');
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  // 매장 결과 없을 때 hash change로 인하여 팝업이 여러번 뜨는 현상 중지 플래그
  this.isPopupNoResult = false;
  // 위치 변경 관련 두개 파일 git에서 삭제 해야 함, CS_02_03_L01.hbs , customer.agentsearch.region.js

  // 처음에 표시할 위치가 있을 경우 query param을 이용
  // this.paramData = Tw.UrlHelper.getQueryParams();
  // this._hasDest = this.paramData.long && this.paramData.lat ? true : false;

  // 디폴트 중구좌표 더이상 사용하지 않음 (OP002-5191)
  // this.locationCoorinates = {
  //   latitudeDefaultX: Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.MAP_X,
  //   longitudeDefaultY: Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.MAP_Y,
  //   latitudeCurrentX: null,
  //   longitudeCurrentY: null
  // }

  this._listItemTemplate = Handlebars.compile($('#tpl_list_item').html());

  this._map = undefined;
  // 지점 대리점 마커 레이어
  this._markerLayer = undefined;
  // 아래 마커는 더이상 사용하지 않음 (OP002-5191)
  // this._markerLayer1 = undefined;
  // this._markerLayer2 = undefined;

  this._currentMarker = undefined;  // 현재 위치 마커
  this._nearShops = undefined;  // 지점 대리점 리스트

  // 전국 위치 변경시 해당 지역의 위치 데이터, 더이상 사용하지 않음 (OP002-5191)
  // this._currentDo = undefined;
  // this._currentGu = undefined;
  // this.isMyLocationCliked = false;

  // shortcut url 생성을 위한 주소, 검색 반경은 디폴트로 적용
  // 내위치 지도 전체 : http://localhost:3000/customer/agentsearch/near#map
  // 내위치 지도 지점 : http://localhost:3000/customer/agentsearch/near#mapBranch
  // 내위치 지도 대리점 : http://localhost:3000/customer/agentsearch/near#mapAgent
  // 내위치 리스트 전체 : http://localhost:3000/customer/agentsearch/near#list
  // 내위치 리스트 지점 : http://localhost:3000/customer/agentsearch/near#listBranch
  // 내위치 리스트 대리점 : http://localhost:3000/customer/agentsearch/near#listAgent

  // hash 값 받아오기 #map에서 #빼고 map만 넣음, 그리고 현재 hash값에서 지점,대리점 여부 판단
  var currentHash = this._historyService.getHash().substring(1);
  this._currentBranchType = currentHash.indexOf('Branch') !== -1 ? 1 : currentHash.indexOf('Agent') !== -1 ? 2 : 0; //  지점.대리점 코드
  this._currentRadiusType = 3; // 검색반경 코드 id(기본은 3) - 타입으로 정의해서 넣을것
  this._currentBranchName = Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentBranchType].name; // 매장형태 이름 (기본은 전체)
  this._currentRadiusName = Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].name; // 검색반경 이름 (기본은 500m)

  // 14세 미만일때 팝업 보여주고 지점 대리점 찾기 화면으로 이동
  this.isAcceptAge = (isAcceptAge === 'true');  // 문자 true를 boolean으로 변경
  if(!this.isAcceptAge){
    this._popupService.openAlert(Tw.CUSTOMER_NEAR_POPUP.AGE_CONTENT, Tw.CUSTOMER_NEAR_POPUP.AGE_TITLE, '확인', $.proxy(function(){this._historyService.replaceURL('/customer/agentsearch');}, this));
  }else{
    if( !Tw.Environment.init ) {
      $(window).on(Tw.INIT_COMPLETE, $.proxy(function () { // INIT_COMPLETE 이벤트 발생후 나머지 처리
        this._showDataChargeIfNeeded($.proxy(function () {
          this._init();
          // this._cacheElements();
          this._bindEvents();
        }, this));
      }, this));
    }else{
        this._showDataChargeIfNeeded($.proxy(function () {
          this._init();
          // this._cacheElements();
          this._bindEvents();
        }, this));
    }
  }
};

Tw.CustomerAgentsearchNear.prototype = {
  _cacheElements: function () {
    this.$divMap = this.$container.find('#fe-div-map');
    this.$divList = this.$container.find('#fe-div-list');
    this.$divListBtns = this.$container.find('#fe-div-list-btns');
    this.$region1 = this.$container.find('#fe-region1');
    this.$region2 = this.$container.find('#fe-region2');
    this.$typeOption = this.$container.find('.bt-dropdown');
    this.$resultCount = this.$container.find('#fe-result-count');
    this.$resultList = this.$container.find('#fe-list');
    this.$btnMore = this.$container.find('#fe-btn-more');
    // this.$pshop = this.$container.find('#fe-p-shop');  // 더이상 사용하지 않음
    this.$showList = this.$container.find('#fe-btn-view-list');
    this.$showMap = this.$container.find('#fe-btn-view-map');

  },

  /**
   * @function
   * @desc app인 경우 현재 위치 조회하고, mweb인 경우 약관 먼저 조회
   */
  _init: function () {
    this._cacheElements();
    // 전국 위치 변경시 url의 위 경도 받아서 바로 이동, 더이상 사용하지 않음 (OP002-5191)
    // url에 좌표가 있거나 내위치 클릭이 아닌경우
    // if (this._hasDest && !this.isMyLocationCliked) { // NOTE 위치를 지정해서 들어오는 경우는 권한 체크 필요 없다고 간주.
    //   this._onCurrentLocation({
    //     longitude: this.paramData.long,
    //     latitude: this.paramData.lat
    //   });
    this._requestCurrentPosition();
  },

  _requestCurrentPosition: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._askCurrentLocationApp();
    } else {
      this._checkLocationMobileWeb();
    }
  },

  _bindEvents: function () {
    this.$container.on('click', '#fe-myLocation', $.proxy(this._onMyLocationClicked, this)); // 내 위치 버튼 클릭 이벤트
    // this.$container.on('click', '#fe-change-region', $.proxy(this._onRegionChangeClicked, this)); // 위치 변경 버튼 클릭 이벤트, 더이상 사용하지 않음 (OP002-5191)
    this.$typeOption.on('click', $.proxy(this._onTypeOption, this));  // 매장형태 및 검색반경 액션시트
    this.$container.on('click', '#fe-btn-view-list', _.debounce($.proxy(this._onShowListMap, this), 300));
    this.$container.on('click', '#fe-btn-view-map', _.debounce($.proxy(this._onShowListMap, this), 300));
    this.$btnMore.on('click', $.proxy(this._onMore, this));
    this.$resultList.on('click', '.fe-list', $.proxy(this._onListItemClicked, this));
  },


  /**
   * @function
   * @desc 모웹인 경우 위치 조회하여 조회 불가시 GPS 켜 달라는 메세지 출력
   */
  _checkLocationMobileWeb: function () {
    // Only works in secure mode(Https) - for test, use localhost for url
    // (컴퓨터의 브라우저는 현재 위치 받아 오지만 핸드폰으로 직접 로컬 붙을때는 거부 상태로 됨, https로 스테이징 이상에서만 테스트 가능)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition($.proxy(function (location) { // 위치 정보 확인 가능한 경우에 실행
        // 현재 위치 좌표값 설정 , 더이상 사용하지 않음 (OP002-5191)
        // this.locationCoorinates.latitudeCurrentX = location.coords.latitude;
        // this.locationCoorinates.longitudeCurrentY = location.coords.longitude;

        // this._location = { longitude: location.coords.longitude, latitude: location.coords.latitude }, this._location만 던질까
        if (this.isLogin) { // 로그인 이면서 GPS가 켜져 있는 경우 위치정보 동의 부터 확인
          this._checkTermAgreement({
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
          });
        } else { // 비로그인 이지만 GPS가 켜져 있는 경우 현재 위치 노출
          this._onCurrentLocation({
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
          });
        }
      }, this), $.proxy(function () { // 위치 정보 확인 불가능한 경우
      // }, this), $.proxy(function (error) { // 위치 정보 확인 불가능한 경우
        // switch (error.code) {
          // case error.PERMISSION_DENIED: // 케이스 구분 없이 에러일때로 처리?
            // alert("User denied the request for Geolocation.");
            // if (!this.isLogin && this.isMyLocationCliked) { // 비로그인 이면서 GPS 차단 및 내위치 버튼 눌렀을때 현재 페이지 유지

             // 모웹 + 위치 정보 확인 불가능한 경우 메시지 출력 후 지점.대리점 찾기로 이동
             // this._popupService.openAlert(Tw.CUSTOMER_MOBILEWEB_GPSOFF.MSG, null, '확인',
        // $.proxy(this._historyService.replaceURL('/customer/agentsearch'), this));
             this._popupService.openAlert(Tw.CUSTOMER_MOBILEWEB_GPSOFF.MSG, null, '확인', $.proxy(function(){this._historyService.replaceURL('/customer/agentsearch');}, this));


            // break;
        //   case error.POSITION_UNAVAILABLE:
        //   case error.TIMEOUT:
        //   case error.UNKNOWN_ERROR:
        //     // alert("Location information is unavailable. 또는 The request to get user location timed out 또는 An unknown error occurred.");
        //     if (this.isLogin) { // 로그인이면 약관이 아니라 중구위치로
        //       this._popupService.openAlert(Tw.CUSTOMER_MOBILEWEB_GPSOFF.MSG, null, '확인', $.proxy(this._checkTermAgreement({
        //         longitude: this.locationCoorinates.longitudeDefaultY,
        //         latitude: this.locationCoorinates.latitudeDefaultX
        //       }), this));
        //     } else { // 비로그인 이면서 위치사용불가, 타임아웃, 모르는에러일때는  히스토리백?
        //       this._popupService.openAlert(Tw.CUSTOMER_MOBILEWEB_GPSOFF.MSG, null, '확인', $.proxy(this._onCurrentLocation({
        //         longitude: this.locationCoorinates.longitudeDefaultY,
        //         latitude: this.locationCoorinates.latitudeDefaultX
        //       }), this));
        //     }
        //     break;
        // } // end of switch
      }, this)); // end of error
    } // end of if 'geolocation' in navigator
  },



  /**
   * @function
   * @desc app인 경우 과금팝업 노출하고, 동의 시 callback 호출
   * @param  {Function} callback - 동의 시 실행할 callback
   */
  _showDataChargeIfNeeded: function (callback) {
    // Tw.Logger.info('thomas_check get cookie 정보는? : ',
    // Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y')); 위치 정보 응답코드 확인
    if (Tw.BrowserHelper.isApp()) {
      var confirmed = false;
      // if(this.isLogin) { // 비로그인 케이스 없음
         if(!Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y')) {  // 과금팝업 동의 쿠키 값 받아올수 없을때
          Tw.CommonHelper.showDataCharge(
            $.proxy(function () {
              confirmed = true;
              Tw.CommonHelper.setCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y');
              // Tw.Logger.info('thomas_check set이후 get cookie 정보는? : ',
              // Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y')); // 위치 정보 응답코드 확인
              // 과금팝업 동의 시 콜백 실행, this._init(); 부터 실행
              callback();
            }, this),
            $.proxy(function () {
              if (confirmed) {
                return;
              }
              // 과금팝업 미 동의 시 이전 또는 지점 대리점 찾기로 이동 함
              this._historyService.replaceURL('/customer/agentsearch');
            }, this)
          );
        } else {  // 로그인 이면서 과금 팝업 쿠키값 받아 올수 있을때
          callback();
        }
    } else {  // 앱이 아닐때는 바로 콜백 함수 실행 (모웹)
      callback();
    }
  },

  /**
   * @function
   * @desc 위치권한 동의 여부 BFF로 부터 조회 후 미동의시 동의 받기 위한 팝업 발생
   * @param  {Object} location - 현재 위치 좌표
   */
  _checkTermAgreement: function (location) { // 위치권한 설정여부 확인 후 미동의 시 동의받기 위한 팝업 발생
    this.isAgreed = false;

    if (this.isLogin) { // 로그인 시 동의여부 체크
      this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
        .done($.proxy(function (res) {
          // Tw.Logger.info('위치권한 사전 동의 여부 res BFF_03_0021 ===== ', res);
          if (res.code === Tw.API_CODE.CODE_00) {
            // Tw.Logger.info('thomas_check loc agreement - 위치정보동의등 : ', res); // 위치 정보 응답코드 확인
            this.isAgreed = res.result.twdLocUseAgreeYn === 'Y';
            if (this.isAgreed) { // 사전 동의 시 앱 웹 구분없이 현재 지역 받아오기
                this._onCurrentLocation(location);
            } else { // 서버의 위치 정보 동의 설정값이 미동의 일때
              this._showPermission(location); // it is not app, location will be undeinfed
            }
          } else {
            Tw.Error(res.code, res.msg).pop();
          }
        }, this))
        .fail(function (err) {
          Tw.Error(err.code, err.msg).pop();
        });
    } // end of isLogin
  },

  /**
   * @function
   * @desc app인 경우 native로 현재 위치 조회
   */
  _askCurrentLocationApp: function () { // app인 경우에 대한 현재위치 조회
    if (Tw.BrowserHelper.isApp()) { // 앱인 경우 현재위치 네이티브에 조회
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(function (res) {
        // Tw.Logger.info('_askCurrentLocationApp res ===', res);
        if (res.resultCode === 401 || res.resultCode === 400 || res.resultCode === -1) { // 네이티브에서 현재위치 조회 불가인 경우
          this._historyService.replaceURL('/customer/agentsearch');
          // this._onCurrentLocation({ // 현재 위치 확인 불가 시 중구 위치로 설정
          //   longitude: this.locationCoorinates.longitudeDefaultY,
          //   latitude: this.locationCoorinates.latitudeDefaultX
          // });
        } else { // 네이티브에서 현재 위치 조회 가능한 경우 위치권한 동의로 이동
          this._checkTermAgreement(res.params);
        }
      }, this));
    } // end of if Tw.BrowserHelper.isApp
  },


  /**
   * @function
   * @desc 위치정보 이용동의 받기 위한 팝업 노출
   * @param  {Object} location - 좌표값
   */
  _showPermission: function (location) { // 위치정보 이용동의를 위한 팝업 보여줌
    // if (this._permissionShowed) {
    //   return;
    // }
    // 위치 정보 이용동의 팝업을 한번 보여주면 그 다음부터는 안보이도록 플래그 등록
    // 하지만 위치 정보 이용동의 하지 않으면 이용할수 없기 대문에 더이상 필요 없
    // this._permissionShowed = true;음

    this.locationDisagree = true; // 위치정보 이용동의 미동의 플래그
    this._popupService.open({
        title: Tw.BRANCH.PERMISSION_TITLE,
        title_type: 'sub',
        cont_align: 'tl',
        contents: Tw.BRANCH.PERMISSION_DETAIL,
        infocopy: [{
          info_contents: Tw.BRANCH.DO_YOU_AGREE,
          bt_class: 'fe-view-term bt-blue1'
        }],
        bt_b: [{
          style_class: 'pos-left fe-close', // fe-close를 fe-disAgree로 변경해야 될듯
          txt: Tw.BRANCH.DISAGREE
        }, {
          style_class: 'bt-red1 pos-right fe-agree',
          txt: Tw.BRANCH.AGREE
        }]
      }, $.proxy(function (root) {
        root.find('.fe-view-term').find('button').text(Tw.BRANCH.VIEW_LOCATION_TERM);
        root.on('click', '.fe-view-term', $.proxy(function () {
          Tw.CommonHelper.openTermLayer2(15);
        }, this));

        root.on('click', '.fe-close', $.proxy(function () { // fe-close를 fe-disAgree로 변경해야 될듯
          this._popupService.close();
          this.locationDisagree = true;
        }, this));

        // Request location agreement
        root.on('click', '.fe-agree', $.proxy(function () {
          this._popupService.close();
          this.locationDisagree = false;
        }, this));
      }, this),
      $.proxy(function () {
        if (this.locationDisagree) { // 위치정보 팝업 미동의 시 앱웹 구분없이 로그인 했을때는 지점 대리점 찾기 화면으로 이동
          // 지점 대리점 찾기 화면으로 이동
          this._historyService.replaceURL('/customer/agentsearch');
          //   this._onCurrentLocation({
          //     longitude: this.locationCoorinates.longitudeDefaultY,
          //     latitude: this.locationCoorinates.latitudeDefaultX
          //   }); // 동의 정보 저장하지 않고 현재 위치를 보여줌 (중구)
        } else { // 위치정보 팝업 동의 시
          var data = {
            twdLocUseAgreeYn: 'Y'
          };
          // 위치정보 이용 동의 내용 등록
          this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
            .done($.proxy(function (res) {
              if (res.code === Tw.API_CODE.CODE_00) {
                // 앱,모웹 구분없이 현재 지역 받아오기
                  this._onCurrentLocation(location);
                //   this._onCurrentLocation({
                //     longitude: this.locationCoorinates.longitudeCurrentY,
                //     latitude: this.locationCoorinates.latitudeCurrentX
                //   }); // 동의 정보 저장하지 않고 현재 위치를 보여줌 (중구)
              } else {
                Tw.Error(res.code, res.msg).pop();
              }
            }, this))
            .fail(function (err) {
              Tw.Error(err.code, err.msg).pop();
            });
        }
      }, this), 'mainAuto');
  },

  /**
   * @function
   * @desc 현재 위치가 확보되었을 경우 tmap api를 통해 지도를 그려줌
   * @param  {Object} location - 좌표값
   // * @param  {Boolean} isManuallyChanged - 위치변경을 통해 임의로 위치를 변경한 경우
   */
  // _onCurrentLocation: function (location, isManuallyChanged) { // isManuallyChanged: true - 임의로 현재 위치를 변경한 경우
  _onCurrentLocation: function (location) {
    // 매장 형태 및 검색반경 선택한 경우가 아닐때
    // if(!this._isBranchClicked){
      this._location = location;
    // }

    // Retrieve current region, 예> 현재위치: 서울특별시 > 중구
    // http://tmapapi.sktelecom.com/main.html#webservice/docs/tmapGeofencingRegionsDoc
    // input parameter format은?
    this._apiService.requestAjax(Tw.AJAX_CMD.GET_TMAP_REGION, {
      version: '1',
      format: 'json',
      count: '20',
      categories: 'gu_gun',
      searchType: 'COORDINATES',
      reqCoordType: 'WGS84GEO',
      reqLon: location.longitude,
      reqLat: location.latitude,
      appKey: Tw.TMAP.APP_KEY
    }).done($.proxy(function (res) {
      // Tw.Logger.info('_onCurrentLocation의 GET_TMAP_REGION', res);

      // 위치변경 기능을 사용하지 않기 때문에 this._currentDo 와 this._currentGu는 이제 사용 안함
      // this._currentDo = res.searchRegionsInfo[0].regionInfo.properties.doName.split(' ')[0].trim();
      // this._currentGu = res.searchRegionsInfo[0].regionInfo.properties.guName.split(' ')[0].trim();

      // res 값의 res.searchRegionsInfo[0].regionInfo.description.split(' '); 만 짤라서 현재위치 표시해 줌
      var regions = res.searchRegionsInfo[0].regionInfo.description.split(' ');
      if (regions.length === 2) {
        this.$region1.text(regions[0]);
        this.$region2.text(regions[1]);
      } else if (regions.length === 3) {
        this.$region1.text(regions[0] + ' ' + regions[1]);
        this.$region2.text(regions[2]);
      }

      // 주변 매장 찾기( Tw.AJAX_CMD.GET_TMAP_REGION 요청 성공 시 호출로 변경)
      $.proxy(this._requestNearShop(location), this);
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.status + ' ' + err.statusText);
    }, this));
  },

  /**
   * @function
   * @desc 주변 매장 검색 요청
   * @param location
   */
  _requestNearShop: function (location) {
    // Retrieve near shops
    // storeType은 Tw.BRANCH.SELECT_BRANCH_RADIUS의 0,1,2중 하나의 숫자, distance는 Tw.BRANCH.SELECT_BRANCH_RADIUS의 500, 1000, 3000중 하나의 숫자
    // Tw.Logger.info('지점타입, Object.keys(Tw.BRANCH.SELECT_BRANCH_RADIUS)[this._currentBranchType] ==== ',
    //     Object.keys(Tw.BRANCH.SELECT_BRANCH_RADIUS)[this._currentBranchType]);
    // Tw.Logger.info('거리타입, Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].distance ==== ',
    //     Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].distance);

    this._apiService.request(Tw.API_CMD.BFF_08_0008, {
        storeType: Object.keys(Tw.BRANCH.SELECT_BRANCH_RADIUS)[this._currentBranchType],
        currLocX: location.longitude,
        currLocY: location.latitude,
        distance: Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].distance
      }).done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          this._nearShops = res.result.regionInfoList;
          // Tw.Logger.info('res.result.regionInfoList 원본 =======', res.result.regionInfoList);

          // 거리에 대해서 m 또는 km를 넣음, 리스트 만들때로 적용해서 주석처리
          // for (var i = 0; i < this._nearShops.length; i++) {
          //   var distance = parseInt(this._nearShops[i].distance, 10);
          //   if (distance >= 1000) {
          //     this._nearShops[i].distance = (distance / 1000).toFixed(1) + 'km';
          //   } else {
          //     this._nearShops[i].distance = distance + 'm';
          //   }
          // }

          // this._nearShops = res.result.regionInfoList;
          // Tw.Logger.info('location.longitude, ===== ', location.longitude);
          // Tw.Logger.info('location.latitude ======', location.latitude);

          // 위치와 주변 매장 정보를 가져 온 뒤 화면 초기화
          this._onHashChange();
          // 리스트보기, 지도보기 클릭 시, 확인 필요
          // if (this._historyService.getHash().indexOf('#popup1') === -1) {
            $(window).on('hashchange', $.proxy(this._onHashChange, this));
          // }
        } else {
          Tw.Error(res.code, res.msg).pop();
        }
      }, this))
      .fail($.proxy(function (err) {
        Tw.Error(err.code, err.msg).pop();
      }, this));
  },

  /**
   * @function
   * @desc 지도영역 초기화, 주변 매장 검색이 완료되면 이를 tmap 상의 layer에 marker로 표시
   * @param
   */
  _initMap: function () {
    var location = this._location;
    // this._mapInitilized = true;
    // $.proxy(this._onHashChange(), this);
    var $tmapBox = this.$container.find('#fe-tmap-box');
    // init Tmap and show
    if (Tw.FormatHelper.isEmpty(this._map)) {
      this._map = new Tmap.Map({
        div: $tmapBox.attr('id'),
        width: '100%',
        height: $tmapBox.width() + 'px',
        httpsMode: true
      });
    }
    // Tmap 에 중심좌표 설정 (위.경도 및 zoom 설정), zoom은 Tw.BRANCH.SELECT_BRANCH_RADIUS의 13,14,15중 하나
    this._map.setCenter(
      new Tmap.LonLat(location.longitude, location.latitude).transform('EPSG:4326', 'EPSG:3857'),
        Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].zoom
    );

    // Add marker for current location
    if (Tw.FormatHelper.isEmpty(this._currentMarker)) {
      // 현재 위치 마커 레이어 생성
      this._currentMarker = new Tmap.Layer.Markers();
      // 맵에 현재 위치 마커 레이어 추가
      this._map.addLayer(this._currentMarker);
    } else {  // else 필요 없으려나???
      this._currentMarker.clearMarkers();
    }

    // 현재위치 마커 아이콘 크기 / tmap v2에서는 iconSize : new Tmapv2.Size(38, 38) 이렇게 사용? -(size등은 안됨
    var size = new Tmap.Size(38, 38);
    // 현재위치 마커 아이콘 중심점, tmap v2에서는 좀 더 찾아봐야 함, var pixelPoint = new Tmapv2.Point(-19,-38); // 기존대로 라면 특정 마커 위치변경???
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var lonlat = new Tmap.LonLat(location.longitude, location.latitude)
      .transform('EPSG:4326', 'EPSG:3857');
    // 현재위치 마커 아이콘 설정, tmap v2에서는 URL 넣어야 함?
    var icon = new Tmap.Icon(Tw.Environment.cdn + Tw.TMAP.COMPASS, size, offset);
    // 현재위치 마커 생성
    var marker = new Tmap.Marker(lonlat, icon);


    // 임의로 위치 변경한 경우 현재 위치 마커 변경안함, 파리미터 위치 액세스가 가능하며, 설정 미동의가 아니며 내위치 클릭 이거나 위도 경도가 url에 없는경우 마커 그려줌
    // if (this.isLocationAccess && !this.locationDisagree && (!this._hasDest || this.isMyLocationCliked)) {
    // 현재 위치 마커 레이어에 마커 추가
      this._currentMarker.addMarker(marker);
    // }

    // 지점,대리점 marker 표시 ,지점 대리점 마커 아이콘 사이즈
    size = new Tmap.Size(24, 38);
    // 지점 대리점 마커 아이콘 중심점
    offset = new Tmap.Pixel(-(size.w / 2), -(size.h));

    if (Tw.FormatHelper.isEmpty(this._markerLayer)) {
      this._markerLayer = new Tmap.Layer.Markers();
      this._map.addLayer(this._markerLayer);
    } else {
      this._markerLayer.clearMarkers();
    }

    // 지점 따로, 대리점 따로 만들던 마커 삭제
    // if (Tw.FormatHelper.isEmpty(this._markerLayer1)) {
    //   this._markerLayer1 = new Tmap.Layer.Markers();
    //   this._markerLayer2 = new Tmap.Layer.Markers();
    //   this._map.addLayer(this._markerLayer1);
    //   this._map.addLayer(this._markerLayer2);
    // } else {
    //   this._markerLayer1.clearMarkers();
    //   this._markerLayer2.clearMarkers();
    // }

    // 지점 대리점 리스트 전체 마커 생성
    var shops = this._nearShops;
    for (var i = 0; i < shops.length; i++) {
      lonlat = new Tmap.LonLat(shops[i].geoX, shops[i].geoY)
          .transform('EPSG:4326', 'EPSG:3857');
      icon = new Tmap.Icon(Tw.Environment.cdn + Tw.TMAP.PIN, size, offset);
      // 지점 대리점 각각에 대한 라벨 생성(왜 storeName이 아니라 매장코드?), http://tmapapi.sktelecom.com/main.html#web/sample/webSample57
      // Tmap v2 - http://tmapapi.sktelecom.com/main.html#webv2/sample/webSample78
      var label = new Tmap.Label(shops[i].locCode);
      marker = new Tmap.Markers(lonlat, icon, label);
      // if (shops[i].storeType === '1') {
      // 지점,대리점 마커 레이어에 마커 추가
        this._markerLayer.addMarker(marker);
      // } else {
      //   this._markerLayer2.addMarker(marker);
      // }
      marker.events.register('touchstart', marker, this._onMarkerClicked);
    }

    // 지점 대리점 각각 따로 마커 생성 하던것 삭제
    // var shops = this._nearShops;
    // for (var i = 0; i < shops.length; i++) {
    //   var lonlat = new Tmap.LonLat(shops[i].geoX, shops[i].geoY)
    //     .transform('EPSG:4326', 'EPSG:3857');
    //   var icon = new Tmap.Icon(Tw.Environment.cdn + Tw.TMAP.PIN, size, offset);
    //   var label = new Tmap.Label(shops[i].locCode);
    //   var marker = new Tmap.Markers(lonlat, icon, label);
    //   if (shops[i].storeType === '1') {
    //     this._markerLayer1.addMarker(marker);
    //   } else {
    //     this._markerLayer2.addMarker(marker);
    //   }
    //   marker.events.register('touchstart', marker, this._onMarkerClicked);
    // }

    // 매장형태, 검색반경 html에 텍스트
    this.$typeOption.text(Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentBranchType].name + ' / ' + Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].name);
    // if (this._currentBranchType === 0) {  // OP002-5499 삭제
    // 화면에 매장 총 개수 노출
      this.$resultCount.text(shops.length);
      // Tw.Logger.info('thomas_check shops.length 는? : ', shops.length);
      // Tw.Logger.info('thomas_check shops.length 는? : ', this._regionChanged);
      // if (shops.length == 0 /*  && this._regionChanged */ ) {
      // if (shops.length == 0 && this._regionChanged) {
      // this.isPopupNoResult = false;
      // if (shops.length == 0 && !this.isPopupNoResult) {
      if (shops.length === 0 && !this.isPopupNoResult) {
        this.isPopupNoResult = true;
        this._popupService.openAlert('검색 결과가 없습니다.<br>검색 반경을 변경하거나<br>지점/대리점 찾기를 이용해주시기 바랍니다.');
        // this._regionChanged = false;
      }
    // } // OP002-5499 삭제
    /*else  {
         var branchType = this._currentBranchType;
         this.$resultCount.text(_.filter(this._nearShops, function (item) {
           return item.storeType === (branchType + '');
         }).length);
       } */

    // this.$resultList.empty();
    // this._onMore();

  },
  /**
   * @function
   * @desc 리스트 초기화
   * @param
   */
  _initList: function () {
    // this._listInitilized = true;

    // 리스트 뿌려줄때 거리 넣기 - 처음 한번만 매장 데이터에 미터정보 입력
    // if (!this._listInitilized) {
      for (var i = 0; i < this._nearShops.length; i++) {
        // break 대신 차라리 플래그
        // if (this._nearShops[i].distance.indexOf('m') !== -1){
        //   break;
        // }
        var distance = parseInt(this._nearShops[i].distance, 10);
        if (distance >= 1000) {
          this._nearShops[i].distance = (distance / 1000).toFixed(1) + 'km';
        } else {
          this._nearShops[i].distance = distance + 'm';
        }
      }
    // } // end of if

    // 매장트 리스트에 미터정보 한번만 입력을 위한 플래그
    // this._listInitilized = true;

    // if (this._currentBranchType === 0) {
      this.$resultCount.text(this._nearShops.length);
      // this.$typeOption.text(Tw.BRANCH.SELECT_BRANCH_TYPE[this._currentBranchType]);
      this.$typeOption.text(Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentBranchType].name + ' / ' + Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].name);
    // } else {
    //   var branchType = this._currentBranchType;
    //   this.$typeOption.text(Tw.BRANCH.SELECT_BRANCH_TYPE[branchType]);
    //   // 지점 또는 대리점만 구분해서 개수 파악
    //   this.$resultCount.text(_.filter(this._nearShops, function (item) {
    //     return item.storeType === (branchType + '');
    //   }).length);
    // }

    // 리스트 영역 삭제 및 리스트 생성 및 더보기 처리
    this.$resultList.empty();
    this._onMore();
  },

   /**
   * @function
   * @desc list 출력 및 화면에서 더보기 버튼 클릭에 대한 처리
   */
  _onMore: function () {
    // 현재 리스트에 뿌려진 개수 (더보기 처리를 위한)
    var currentCount = this.$resultList.children().length;

    // var shops;
    // if (this._currentBranchType === 0) {
    //   shops = this._nearShops;
    // } else {
    //   var currentType = this._currentBranchType;
    //   // 현재 매장형태만 리스트 뽑아옴
    //   shops = _.filter(this._nearShops, function (item) {
    //     return parseInt(item.storeType, 10) === currentType;
    //   });
    // }

    // Tw.Logger.info('currentCount =====', currentCount);
    var listToShow = this._nearShops.length - currentCount;
    if (listToShow > 20) {
      listToShow = 20;
    }

    // Tw.Logger.info('currentCount =====', currentCount);
    // Tw.Logger.info('this._nearShops.length =====', this._nearShops.length);
    // Tw.Logger.info('listToShow =====', listToShow);

    this.$resultList.append(this._listItemTemplate({
      list: this._nearShops.slice(currentCount, currentCount + listToShow)
    }));

    // Tw.Logger.info('currentCount + listToShow >= this._nearShops.length =====', currentCount + listToShow >= this._nearShops.length);

    if (currentCount + listToShow >= this._nearShops.length) {
      // this.$btnMore.addClass('none');
      this.$container.find('#fe-more-div').addClass('none');
    // }
    } else {
      // Tw.Logger.info('더보기 보여주기');
      this.$container.find('#fe-more-div').removeClass('none');
    }

    if (this._nearShops.length === 0) {
      // this.$container.find('.bt-top').addClass('none');
      this.$container.find('#fe-empty-result').removeClass('none');
      if (!this.$divMap.hasClass('none')) {
        this._popupService.openAlert('검색 결과가 없습니다.<br>검색 반경을 변경하거나<br>지점/대리점 찾기를 이용해주시기 바랍니다.');
      }
    } else {
      // this.$container.find('.bt-top').removeClass('none');
      this.$container.find('#fe-empty-result').addClass('none');
    }

  },

  /**
   * @function
   * @desc marker 클릭 시 해당 지점의 상세화면으로 이동
   */
  _onMarkerClicked: function () {
    window.location.href = '/customer/agentsearch/detail?code=' + this.popup.contentHTML;
  },

  /**
   * @function
   * @desc 리스트 화면에서 지점 선택시 해당 지점의 셍세화면으로 이동
   * @param  {Object} e - click event
   */
  _onListItemClicked: function (e) {
    if (e.target.nodeName.toLowerCase() === 'a') {
      return;
    }
    var code = $(e.currentTarget).attr('value');
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code);
  },

  /**
   * @function
   * @desc 내위치 버튼 클릭 시
   */
  _onMyLocationClicked: function () {
    this.isMyLocationCliked = true;
    // this.$showList.hasClass('none') ? this.isShowListNone = true : this.isShowListNone = false;
    $.proxy(this._init(), this);
  },

  /**
   * @function
   * @desc 매장형태(전체/지점/대리점), 검색반경(500m/1km/3km) option 선택을 위한 actionsheet 발생
   */
  _onTypeOption: function (e) {
    var list = Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_NEAR_LOCATION;

    this._popupService.open({
          hbs: 'actionsheet01',
          layer: true,
          data: list,
          btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
        }, $.proxy(function ($root) {
          Tw.CommonHelper.focusOnActionSheet($root);
          /* 팝업 오픈 시 이전에 선택된 지역 체크 */

          // $root.find('input#' + this.selectedLocationCode).attr('checked', true);
          // 매장형태 체크
         // Tw.Logger.info('Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentBranchType].id === ',
          // Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentBranchType].id)
          $root.find('input#' + Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentBranchType].id).attr('checked', true);
          // 검색반경 체크
         // Tw.Logger.info('Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].id',
          // Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].id)
          $root.find('input#' + Tw.BRANCH.SELECT_BRANCH_RADIUS[this._currentRadiusType].id).attr('checked', true);

          $root.on('click', '.btn-floating', $.proxy(function () {
            this._popupService.close();
          }, this));
          $root.on('click', 'input[type=radio]', $.proxy(function (e) {
            var selectedId = parseInt($(e.currentTarget).attr('id'), 10) -1; // id 값에 -1을 넣어서 index와 맞춤
            // 3이내는 매장형태, 3이상은 검색반경
            if(selectedId < 3) {
              // this._currentBranchName = $(e.currentTarget).data('location'); /* templete.type.js에서 사용자 정의 속성 */
              this._currentBranchName = Tw.BRANCH.SELECT_BRANCH_RADIUS[selectedId].name;
              this._currentBranchType = selectedId;
              // Tw.Logger.info('this._currentBranchType === ', this._currentBranchType);
            } else {
              // this._currentRadiusName = $(e.currentTarget).data('radius'); /* templete.type.js에서 사용자 정의 속성 */
              this._currentRadiusName = Tw.BRANCH.SELECT_BRANCH_RADIUS[selectedId].name;
              this._currentRadiusType = selectedId;
              // Tw.Logger.info('this._currentRadiusType === ', this._currentRadiusType);
            }
            // 브랜치 선택 했는지 여부
            // this._isBranchClicked = true;
            this._popupService.close();
            setTimeout($.proxy(function () {
              this.isPopupNoResult = false;
              $.proxy(this._init(), this);
              // $.proxy(this._requestCurrentPosition();, this);
              // $.proxy(this._onCurrentLocation(this._location), this);
              // this._requestNearShop(this._location); // location 및 동의여부, 시,구 표시 부분을 수정할 필요 없다고 가정
              // this._onBranchTypeChanged(e);
            }, this), 300);

          }, this));
        }, this),
        null,
        null,
        $(e.currentTarget));
  },

  /**
   * @function
   * @desc 지도 화면 숨기고 list 화면 노출
   */
  _switchToList: function () {
    // if(this.$showMap.hasClass('none')){
    this.$showMap.removeClass('none');
    // }
    this.$showList.addClass('none');
    this.$divMap.addClass('none');
    // if(this.$divList.hasClass('none')){
    this.$divList.removeClass('none');
    // }
    this.$divListBtns.removeClass('none');
    // if(this.$pshop.hasClass('p-shop')){
    // this.$pshop.removeClass('p-shop');
    // }
      this._initList();
    if (this.isShowListMap === true) {
      this.$showMap.focus();
    }
    this.isShowListMap = false;
  },

  /**
   * @function
   * @desc 리스트 화면 숨기고 지도화면 노출
   */
  _switchToMap: function () {
    // if(this.$showList.hasClass('none')){
    this.$showList.removeClass('none');
    // }
    this.$showMap.addClass('none');
    this.$divList.addClass('none');
    // if(this.$divMap.hasClass('none')){
    this.$divMap.removeClass('none');
    // }
    this.$divListBtns.addClass('none');
    // this.$divMap.removeClass('none');
    // this.$pshop.addClass('p-shop');
      this._initMap();
    if (this.isShowListMap === true) {
      this.$showList.focus();
    }
    this.isShowListMap = false;
  },

  /**
   * @function
   * @desc hash change handler
   */
  _onHashChange: function () {
    // Tw.Logger.info('thomas_check _onHashChange 내부');
    // if (!this._historyService.getHash() || this._historyService.getHash() === '#map') {
    if (!this._historyService.getHash() || this._historyService.getHash().indexOf('#map') !== -1) {
      // Tw.Logger.info('thomas_check _onHashChange Map 내부');
      this._switchToMap();
    // } else if (this._historyService.getHash() === '#list') {
    } else if (this._historyService.getHash().indexOf('#list') !== -1) {
      // Tw.Logger.info('thomas_check _onHashChange List 내부');
      this._switchToList();
    }
  },

  /**
   * @function
   * @desc 리스트 및 맵 보기 버튼 클릭
   */
  _onShowListMap: function (e) {
    // window.location.href = '#' + $(e.currentTarget).data('url');
    var url = $(e.currentTarget).data('url');
    this.isShowListMap = true; // 웹 접근성을 위한 플래그
    this._historyService.goLoad(url);
  }

};

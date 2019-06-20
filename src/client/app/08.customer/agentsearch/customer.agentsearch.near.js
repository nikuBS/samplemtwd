/**
 * @file 나와 가까운 지점 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-29
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상단 elem
 */
Tw.CustomerAgentsearchNear = function (rootEl, isLogin) {
  this.$container = rootEl;
  this.isLogin = (isLogin === 'true');

  // 디폴트는 중구의 좌표
  this.locationCoorinates = {
    latitudeDefaultX : Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.MAP_X,
    longitudeDefaultY : Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.MAP_Y,
    latitudeCurrentX : null,
    longitudeCurrentY : null
  }
  
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;

  this._listItemTemplate = Handlebars.compile($('#tpl_list_item').html());

  this._map = undefined;
  this._markerLayer1 = undefined;
  this._markerLayer2 = undefined;
  this._currentMarker = undefined;
  this._nearShops = undefined;

  this._currentBranchType = 0;
  this._currentDo = undefined;
  this._currentGu = undefined;

  $(window).on(Tw.INIT_COMPLETE, $.proxy(function () { // INIT_COMPLETE 이벤트 발생후 나머지 처리
    this._showDataChargeIfNeeded($.proxy(function () {
      this._init();
      this._cacheElements();
      this._bindEvents();
      // this._switchToList();
    }, this));
  }, this));
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
    this.$pshop = this.$container.find('#fe-p-shop');
  },

  /**
   * @function
   * @desc app인 경우 현재 위치 조회하고, mweb인 경우 약관 먼저 조회
   */
  _init: function () {
    this.$container.find('.btn-switch').css('z-index', 1000);

    if (Tw.BrowserHelper.isApp()) {
      this._askCurrentLocationApp();
    } else {
      this._checkLocationMobileWeb();
    }
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-change-region', $.proxy(this._onRegionChangeClicked, this));
    this.$typeOption.on('click', $.proxy(this._onTypeOption, this));
    this.$container.on('click', '#fe-btn-view-list', $.proxy(this._switchToList, this));
    this.$container.on('click', '#fe-btn-view-map', $.proxy(this._switchToMap, this));
    this.$btnMore.on('click', $.proxy(this._onMore, this));
    this.$resultList.on('click', '.fe-list', $.proxy(this._onListItemClicked, this));
  },


  /**
   * @function
   * @desc 모웹인 경우 위치 조회하여 조회 불가시 GPS 켜 달라는 메세지 출력
   */
  _checkLocationMobileWeb: function () {

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition($.proxy(function (location) {  // 위치 정보 확인 가능한 경우
        /* 현재 위치 좌표값 설정 */
        this.locationCoorinates.latitudeCurrentX = location.coords.latitude;
        this.locationCoorinates.longitudeCurrentY = location.coords.longitude;
        
        if(this.isLogin){ // 로그인 이면서 GPS가 켜져 있는 경우 위치정보 동의 부터 확인
          $.proxy(this._checkTermAgreement({
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
          }), this);
        }else{  // 비로그인 이지만 GPS가 켜져 있는 경우 현재 위치 노출
          $.proxy(this._onCurrentLocation({
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
          }), this)
        }
      }, this), $.proxy(function (error) {  // 위치 정보 확인 불가능한 경우
        switch (error.code) {
          case error.PERMISSION_DENIED:
            // alert("User denied the request for Geolocation.");
            if (!this.isLogin) {
              this._historyService.goBack();
            } else {
              this._popupService.openAlert(Tw.CUSTOMER_MOBILEWEB_GPSOFF.MSG, null, '확인', $.proxy(this._onCurrentLocation({
                longitude: this.locationCoorinates.longitudeDefaultY,
                latitude: this.locationCoorinates.latitudeDefaultX
              }), this));
            }
            break;
          case error.POSITION_UNAVAILABLE:
          case error.TIMEOUT:
          case error.UNKNOWN_ERROR:
            // alert("Location information is unavailable. 또는 The request to get user location timed out 또는 An unknown error occurred.");
            if (this.isLogin) {
              this._popupService.openAlert(Tw.CUSTOMER_MOBILEWEB_GPSOFF.MSG, null, '확인', $.proxy(this._checkTermAgreement({
                longitude: this.locationCoorinates.longitudeDefaultY,
                latitude: this.locationCoorinates.latitudeDefaultX
              }), this));
            } else {
              this._popupService.openAlert(Tw.CUSTOMER_MOBILEWEB_GPSOFF.MSG, null, '확인', $.proxy(this._onCurrentLocation({
                longitude: this.locationCoorinates.longitudeDefaultY,
                latitude: this.locationCoorinates.latitudeDefaultX
              }), this));
            }
            break;
        } // end of switch
      }, this)); // end of error
    } // end of if 'geolocation' in navigator
  },


  /**
   * @function
   * @desc app인 경우 과금팝업 노출하고, 동의 시 callback 호출
   * @param  {Function} callback - 동의 시 실행할 callback
   */
  _showDataChargeIfNeeded: function (callback) {
    if (Tw.BrowserHelper.isApp()) {
      var confirmed = false;
      Tw.CommonHelper.showDataCharge(
        $.proxy(function () {
          confirmed = true;
          callback();
        }, this),
        $.proxy(function () {
          if (confirmed) {
            return;
          }
          this._historyService.goBack();
        }, this)
      );
    } else {
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
          if (res.code === Tw.API_CODE.CODE_00) {
            // Tw.Logger.info('thomas_check loc agreement - 위치정보동의등 : ', res); // 위치 정보 응답코드 확인
            this.isAgreed = res.result.twdLocUseAgreeYn === 'Y';
            if (this.isAgreed) { // 동의 시
              if (Tw.BrowserHelper.isApp()) {
                this._onCurrentLocation(location);
              } else {
                this._onCurrentLocation(location);
              }
            } else { // 서버의 위치 정보 동의 설정값이 미동의 일때
              this._showPermission(location); // is it is not app, location will be undeinfed
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
  _askCurrentLocationApp: function () { // app인 경우, mweb인 경우에 대한 각각의 현재위치 조회
    if (Tw.BrowserHelper.isApp()) { // 앱인 경우 현재위치 네이티브에 조회
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(function (res) {
        if (res.resultCode === 401 || res.resultCode === 400 || res.resultCode === -1 || this.locationDisagree) { // 네이티브에서 현재위치 조회 불가인 경우
          this._onCurrentLocation({ // 현재 위치 확인 불가 시 중구 위치로 설정
            longitude: this.locationCoorinates.longitudeDefaultY,
            latitude: this.locationCoorinates.latitudeDefaultX
          });
          // Tw.Logger.info('thomas_check joongGu Y location Test - 중구위치표시 : ', this.locationCoorinates.longitudeDefaultY); // 중구 위치 Y 좌표 확인
          // Tw.Logger.info('thomas_check joongGu X location Test - 중구위치표시 : ', this.locationCoorinates.latitudeDefaultX); // 중구 위치 X 좌표 확인
        } else { // 네이티브에서 현재 위치 조회 가능한 경우
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
    if (this._permissionShowed) {
      return;
    }

    this.locationDisagree = true;
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
        if (this.locationDisagree) { // 위치정보 팝업 미동의 시
          // Tw.Logger.info('thomas_check 위치 정보 팝업 미동의 버튼 선택 시 중구 보여줌 '); // 중구 위치 X 좌표 확인
          this._onCurrentLocation({
            longitude: this.locationCoorinates.longitudeDefaultY,
            latitude: this.locationCoorinates.latitudeDefaultX
          }); // 동의 정보 저장하지 않고 현재 위치를 보여줌 (중구)
        } else { // 위치정보 팝업 동의 시
          var data = {
            twdLocUseAgreeYn: 'Y'
          };

          this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
            .done($.proxy(function (res) {
              if (res.code === Tw.API_CODE.CODE_00) {
                if (Tw.BrowserHelper.isApp()) {
                  this._onCurrentLocation(location);
                } else {  // 모웹의 로그인 이면서 동의버튼 선택 시 현재 위치 노출
                  this._onCurrentLocation({
                    longitude: this.locationCoorinates.longitudeCurrentY,
                    latitude: this.locationCoorinates.latitudeCurrentX
                  }); // 동의 정보 저장하지 않고 현재 위치를 보여줌 (중구)
                }
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
   * @param  {Boolean} isManuallyChanged - 위치변경을 통해 임의로 위치를 변경한 경우
   */
  _onCurrentLocation: function (location, isManuallyChanged) { // isManuallyChanged: true - 임의로 현재 위치를 변경한 경우
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

    // Tmap 에 중심좌표 설정
    this._map.setCenter(
      new Tmap.LonLat(location.longitude, location.latitude).transform('EPSG:4326', 'EPSG:3857'),
      15
    );

    // Add marker for current location
    if (Tw.FormatHelper.isEmpty(this._currentMarker)) {
      this._currentMarker = new Tmap.Layer.Markers();
      this._map.addLayer(this._currentMarker);
    } else {
      // this._currentMarker.clearMarkers();
    }
    var size = new Tmap.Size(38, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var lonlat = new Tmap.LonLat(location.longitude, location.latitude)
      .transform('EPSG:4326', 'EPSG:3857');
    var icon = new Tmap.Icon(Tw.Environment.cdn + Tw.TMAP.COMPASS, size, offset);
    var marker = new Tmap.Marker(lonlat, icon);
    if (!isManuallyChanged) { // 임의로 위치 변경한 경우 현재 위치 마커 변경안함
      this._currentMarker.addMarker(marker);
    }

    // Retrieve current region
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
      this._currentDo = res.searchRegionsInfo[0].regionInfo.properties.doName.split(' ')[0].trim();
      this._currentGu = res.searchRegionsInfo[0].regionInfo.properties.guName.split(' ')[0].trim();

      var regions = res.searchRegionsInfo[0].regionInfo.description.split(' ');
      if (regions.length === 2) {
        this.$region1.text(regions[0]);
        this.$region2.text(regions[1]);
      } else if (regions.length === 3) {
        this.$region1.text(regions[0] + ' ' + regions[1]);
        this.$region2.text(regions[2]);
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.status + ' ' + err.statusText);
    }, this));

    // Retrieve near shops
    this._apiService.request(Tw.API_CMD.BFF_08_0008, {
        currLocX: location.longitude,
        currLocY: location.latitude
      }).done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          this._nearShops = res.result.regionInfoList;
          this._onNearShops();
        } else {
          Tw.Error(res.coee, res.msg).pop();
        }
      }, this))
      .fail($.proxy(function (err) {
        Tw.Error(err.code, err.msg).pop();
      }, this));
  },

  /**
   * @function
   * @desc 주변 매장 검색이 완료되면 이를 tmap 상의 layer에 marker로 표시
   */
  _onNearShops: function () { // Add near shops' markers
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));

    if (Tw.FormatHelper.isEmpty(this._markerLayer1)) {
      this._markerLayer1 = new Tmap.Layer.Markers();
      this._markerLayer2 = new Tmap.Layer.Markers();
      this._map.addLayer(this._markerLayer1);
      this._map.addLayer(this._markerLayer2);
    } else {
      this._markerLayer1.clearMarkers();
      this._markerLayer2.clearMarkers();
    }

    var shops = this._nearShops;
    for (var i = 0; i < shops.length; i++) {
      var lonlat = new Tmap.LonLat(shops[i].geoX, shops[i].geoY)
        .transform('EPSG:4326', 'EPSG:3857');
      var icon = new Tmap.Icon(Tw.Environment.cdn + Tw.TMAP.PIN, size, offset);
      var label = new Tmap.Label(shops[i].locCode);
      var marker = new Tmap.Markers(lonlat, icon, label);
      if (shops[i].storeType === '1') {
        this._markerLayer1.addMarker(marker);
      } else {
        this._markerLayer2.addMarker(marker);
      }
      marker.events.register('touchstart', marker, this._onMarkerClicked);
    }

    if (this._currentBranchType === 0) {
      this.$resultCount.text(shops.length);
    } else {
      var branchType = this._currentBranchType;
      this.$resultCount.text(_.filter(this._nearShops, function (item) {
        return item.storeType === (branchType + '');
      }).length);
    }
    this.$resultList.empty();
    this._onMore();
  },

  /**
   * @function
   * @desc list 화면에서 더보기 버튼 클릭에 대한 처리
   */
  _onMore: function () {
    var currentCount = this.$resultList.children().length;

    var shops;
    if (this._currentBranchType === 0) {
      shops = this._nearShops;
    } else {
      var currentType = this._currentBranchType;
      shops = _.filter(this._nearShops, function (item) {
        return parseInt(item.storeType, 10) === currentType;
      });
    }

    var listToShow = shops.length - currentCount;
    if (listToShow > 20) {
      listToShow = 20;
    }
    this.$resultList.append(this._listItemTemplate({
      list: shops.slice(currentCount, currentCount + listToShow)
    }));

    if (currentCount + listToShow >= shops.length) {
      // this.$btnMore.addClass('none');
      this.$container.find('#fe-more-div').addClass('none');
    }

    if (shops.length === 0) {
      this.$container.find('.bt-top').addClass('none');
      this.$container.find('#fe-empty-result').removeClass('none');
      if (!this.$divMap.hasClass('none') && this._regionChanged) {
        this._popupService.openAlert('검색 결과가 없습니다.<br>다른 지역을 선택해 주세요.');
        this._regionChanged = false;
      }
    } else {
      this.$container.find('.bt-top').removeClass('none');
      this.$container.find('#fe-empty-result').addClass('none');
    }

    this._regionChanged = false; // 검색 결과 없음 popup 은 지점/대리점/전체 옵견 변경과 상관없이 최초 한번만 보여줌
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
   * @desc 위치변경 클릭 시 layer popup 발생시킴
   */
  _onRegionChangeClicked: function () {
    this._popupService.open({
      hbs: 'CS_02_03_L01'
    }, $.proxy(function (container) {
      new Tw.CustomerAgentsearchRegion(container, this._currentDo, this._currentGu, this._regions,
        $.proxy(this._onRegionChanged, this));
    }, this));
  },

  /**
   * @function
   * @desc 위치변경 레이어팝업에서 다른 위치가 선택되었을 경우 middle name + 청(..시청, ..군청, ..구청) 통해 해당 행정
   *       구역의 중심점을 검색하여 지도 중심을 변경
   * @param  {String} largeCd - tmap 상의 지역코드(서울시, 경상남도, 강원도 등 최상위 지역의 코드)
   * @param  {String} middleName - 시청, 군청, 구청 등을 조회하기 위한 지역명(강동구, 창원시 등)
   * @param  {Array} regions - tmap에 조회한 지역코드 리스트를 caching하기 위함
   */
  _onRegionChanged: function (largeCd, middleName, regions) {
    this._popupService.close();

    this._regions = regions;
    this._regionChanged = true;

    this._apiService.requestAjax(Tw.AJAX_CMD.GET_TMAP_POI, {
      version: 1,
      searchKeyword: middleName + Tw.TMAP_STRING.POI_SEARCH_POSTFIX,
      areaLLCode: largeCd,
      appKey: Tw.TMAP.APP_KEY
    }).done($.proxy(function (res) {
      this._onCurrentLocation({
        longitude: res.searchPoiInfo.pois.poi[0].frontLon,
        latitude: res.searchPoiInfo.pois.poi[0].frontLat
      }, true);
    }, this)).fail(function (err) {
      Tw.Error(err.status, err.statusText).pop();
    });
  },

  /**
   * @function
   * @desc 전체/지점/대리점 option 선택을 위한 actionsheet 발생
   */
  _onTypeOption: function () {
    var list = [{
        value: Tw.BRANCH.SELECT_BRANCH_TYPE[0],
        option: 'fe-type',
        attr: 'value="0"'
      },
      {
        value: Tw.BRANCH.SELECT_BRANCH_TYPE[1],
        option: 'fe-type',
        attr: 'value="1"'
      },
      {
        value: Tw.BRANCH.SELECT_BRANCH_TYPE[2],
        option: 'fe-type',
        attr: 'value="2"'
      }
    ];
    list[this._currentBranchType].option = 'checked';

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: '옵션 선택',
      data: [{
        list: list
      }]
    }, $.proxy(function (root) {
      root.on('click', 'li button', $.proxy(function (e) {
        this._popupService.close();
        setTimeout($.proxy(function () {
          this._onBranchTypeChanged(e);
        }, this), 300);
      }, this));
    }, this));
  },

  /**
   * @function
   * @desc 전체/지점/대리점 option값이 변경될 경우 지도화면에서는 marker layer switch, 리스트 화면에서는 리스트 filtering
   * @param  {Object} e - click event
   */
  _onBranchTypeChanged: function (e) {
    this._currentBranchType = parseInt(e.currentTarget.value, 10);
    this.$typeOption.text(Tw.BRANCH.SELECT_BRANCH_TYPE[this._currentBranchType]);
    switch (this._currentBranchType) {
      case 0:
        this._markerLayer1.setVisibility(true);
        this._markerLayer2.setVisibility(true);

        this.$resultCount.text(this._nearShops.length);
        break;
      case 1:
        this._markerLayer1.setVisibility(true);
        this._markerLayer2.setVisibility(false);

        this.$resultCount.text(_.filter(this._nearShops, function (item) {
          return item.storeType === '1';
        }).length);
        break;
      case 2:
        this._markerLayer1.setVisibility(false);
        this._markerLayer2.setVisibility(true);

        this.$resultCount.text(_.filter(this._nearShops, function (item) {
          return item.storeType === '2';
        }).length);
        break;
      default:
        break;
    }
    this.$resultList.empty();
    this._onMore();
  },

  /**
   * @function
   * @desc 지도 화면 숨기고 list 화면 노출
   */
  _switchToList: function () {
    this.$divMap.addClass('none');
    this.$divList.removeClass('none');
    this.$divListBtns.removeClass('none');
    this.$pshop.removeClass('p-shop');
  },

  /**
   * @function
   * @desc 리스트 화면 숨기고 지도화면 노출
   */
  _switchToMap: function () {
    this.$divList.addClass('none');
    this.$divListBtns.addClass('none');
    this.$divMap.removeClass('none');
    this.$pshop.addClass('p-shop');
  }
};
/**
 * @file customer.agentsearch.near.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.10.29
 */

Tw.CustomerAgentsearchNear = function (rootEl) {
  this.$container = rootEl;

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

  $(window).on(Tw.INIT_COMPLETE, $.proxy(function () {
      this._showDataChargeIfNeeded($.proxy(function () {
      this._init();
      this._cacheElements();
      this._bindEvents();
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
  _init: function () {
    this.$container.find('.btn-switch').css('z-index', 1000);

    if (Tw.BrowserHelper.isApp()) {
      this._askCurrentLocation();
    } else {
      this._checkTermAgreement();
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
  _checkTermAgreement: function (location) {  // 위치권한 설정여부 확인 후 미동의 시 동의받기 위한 팝업 발생
    var isAgreed = false;
    this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          isAgreed = res.result.twdLocUseAgreeYn === 'Y';
          if (isAgreed) {
            if (Tw.BrowserHelper.isApp()) {
              this._onCurrentLocation(location);
            } else {
              this._askCurrentLocation();
            }
          } else {
            this._showPermission(location); // is it is not app, location will be undeinfed
          }
        } else {
          Tw.Error(res.code, res.msg).pop();
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },
  _askCurrentLocation: function () {  // app인 경우, mweb인 경우에 대한 각각의 현재위치 조회
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(function (res) {
        if (res.resultCode === 401 || res.resultCode === 400 || res.resultCode === -1) {
          this._historyService.goBack();
          return;
        } else {
          this._checkTermAgreement(res.params);
        }
      }, this));
    } else {
      if ('geolocation' in navigator) {
        // Only works in secure mode(Https) - for test, use localhost for url
        navigator.geolocation.getCurrentPosition($.proxy(function (location) {
          this._onCurrentLocation({
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
          });
        }, this));
      }
    }
  },
  _showPermission: function (location) {  // 위치정보 이용동의를 위한 팝업 보여줌
    if (this._permissionShowed) {
      return;
    }

    this._permissionShowed = true;
    var shouldGoBack = true;
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
          style_class: 'pos-left fe-close',
          txt: Tw.BRANCH.CLOSE
      }, {
          style_class: 'bt-red1 pos-right fe-agree',
          txt: Tw.BRANCH.AGREE
      }]
    }, $.proxy(function (root) {
      root.find('.fe-view-term').find('button').text(Tw.BRANCH.VIEW_LOCATION_TERM);
      root.on('click', '.fe-view-term', $.proxy(function () {
        Tw.CommonHelper.openTermLayer2(15);
      }, this));

      root.on('click', '.fe-close', $.proxy(function () {
        shouldGoBack = true;
        this._popupService.close();
      }, this));

      // Request location agreement
      root.on('click', '.fe-agree', $.proxy(function () {
        this._popupService.close();
        shouldGoBack = false;
      }, this));
    }, this),
    $.proxy(function () {
      if (shouldGoBack) {
        this._historyService.goBack();
      } else {
        var data = { twdLocUseAgreeYn: 'Y' };

        this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
          .done($.proxy(function (res) {
            if (res.code === Tw.API_CODE.CODE_00) {
              if (Tw.BrowserHelper.isApp()) {
                this._onCurrentLocation(location);
              } else {
                this._askCurrentLocation();
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
      count : '20',
      categories : 'gu_gun',
      searchType : 'COORDINATES',
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
      currLocX: location.longitude, currLocY: location.latitude
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
  _onNearShops: function () {  // Add near shops' markers
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
  _onMarkerClicked: function () {
    window.location.href = '/customer/agentsearch/detail?code=' + this.popup.contentHTML;
  },
  _onListItemClicked: function (e) {
    if (e.target.nodeName.toLowerCase() === 'a') {
      return;
    }
    var code = $(e.currentTarget).attr('value');
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + code);
  },
  _onRegionChangeClicked: function () {
    this._popupService.open({ hbs: 'CS_02_03_L01'}, $.proxy(function (container) {
      new Tw.CustomerAgentsearchRegion(container, this._currentDo, this._currentGu, this._regions,
        $.proxy(this._onRegionChanged, this));
    }, this));
  },
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
  _onTypeOption: function () {
    var list = [
          { value: Tw.BRANCH.SELECT_BRANCH_TYPE[0], option: 'fe-type', attr: 'value="0"' },
          { value: Tw.BRANCH.SELECT_BRANCH_TYPE[1], option: 'fe-type', attr: 'value="1"' },
          { value: Tw.BRANCH.SELECT_BRANCH_TYPE[2], option: 'fe-type', attr: 'value="2"' }
    ];
    list[this._currentBranchType].option = 'checked';

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer:true,
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
  _switchToList: function () {
    this.$divMap.addClass('none');
    this.$divList.removeClass('none');
    this.$divListBtns.removeClass('none');
    this.$pshop.removeClass('p-shop');
  },
  _switchToMap: function () {
    this.$divList.addClass('none');
    this.$divListBtns.addClass('none');
    this.$divMap.removeClass('none');
    this.$pshop.addClass('p-shop');
  }
};
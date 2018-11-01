/**
 * FileName: customer.branch.near.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerBranchNear = function (rootEl) {
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
  this._currentGu = undefined;

  this._init();
  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerBranchNear.prototype = {
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
  },
  _init: function () {
    this.$container.find('.btn-switch').css('z-index', 1000);
    var isAgreed = false;
    this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          isAgreed = res.result.twdLocUseAgreeYn === 'Y';
          if (isAgreed) {
            this._askCurrentLocation();
          } else {
            this._showPermission();
          }
        } else {
          Tw.Error(res.code, res.msg).pop();
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-change-region', $.proxy(this._onRegionChangeClicked, this));
    this.$typeOption.on('click', $.proxy(this._onTypeOption, this));
    this.$container.on('click', '#fe-btn-view-list', $.proxy(this._switchToList, this));
    this.$container.on('click', '#fe-btn-view-map', $.proxy(this._switchToMap, this));
    this.$btnMore.on('click', $.proxy(this._onMore, this));
    this.$resultList.on('click', '.fe-list', $.proxy(this._onListItemClicked, this));
  },
  _askCurrentLocation: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(function (res) {
        if (res.resultCode === 401) {
          this._historyService.goBack();
          return;
        } else {
          this._onCurrentLocation(res.params);
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
  _showPermission: function () {
    this._popupService.open({
      ico: 'type3',
      title: Tw.BRANCH.PERMISSION_TITLE,
      contents: Tw.BRANCH.PERMISSION_DETAIL,
      link_list: [{
        style_class: 'fe-link-term',
        txt: Tw.BRANCH.VIEW_LOCATION_TERM
      }],
      bt: [{
          style_class: 'bt-blue1',
          txt: Tw.BRANCH.AGREE
      }, {
          style_class: 'bt-white2',
          txt: Tw.BRANCH.CLOSE
      }]
    }, $.proxy(function (root) {
      root.on('click', '.fe-link-term', $.proxy(function () {
        this._popupService.close();
        // this._historyService.goLoad(약관 전문)
      }, this));

      root.on('click', '.bt-white2', $.proxy(function () {
        this._popupService.close();
      }, this));

      // Request location agreement
      root.on('click', '.bt-blue1', $.proxy(function () {
        this._popupService.close();
        var data = { twdLocUseAgreeYn: 'Y' };

        this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
          .done($.proxy(function (res) {
            if (res.code === Tw.API_CODE.CODE_00) {
              this._askCurrentLocation();
            } else {
              Tw.Error(res.code, res.msg).pop();
            }
          }, this))
          .fail(function (err) {
            Tw.Error(err.code, err.msg).pop();
          });
      }, this));
    }, this));
  },
  _onCurrentLocation: function (location) {
    var $tmapBox = this.$container.find('#fe-tmap-box');
    // init Tmap and show
    if (Tw.FormatHelper.isEmpty(this._map)) {
      this._map = new Tmap.Map({
        div: $tmapBox.attr('id'),
        width: '100%',
        height: $tmapBox.width() + 'px'
      });
    }
    this._map.setCenter(
      new Tmap.LonLat(location.longitude, location.latitude).transform('EPSG:4326', 'EPSG:3857'),
      15
    );

    // Add marker for current location
    if (Tw.FormatHelper.isEmpty(this._currentMarker)) {
      this._currentMarker = new Tmap.Layer.Markers();
      this._map.addLayer(this._currentMarker);
    } else {
      this._currentMarker.clearMarkers();
    }
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var lonlat = new Tmap.LonLat(location.longitude, location.latitude)
      .transform('EPSG:4326', 'EPSG:3857');
    var icon = new Tmap.Icon(Tw.TMAP.COMPASS, size, offset);
    var marker = new Tmap.Marker(lonlat, icon);
    this._currentMarker.addMarker(marker);

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
      this._nearShops = res.result.regionInfoList;
      this._onNearShops();
    }, this))
    .fail($.proxy(function (err) {
      this._popupService.openAlert(err.code + ' ' + err.msg);
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
      var icon = new Tmap.Icon(Tw.TMAP.PIN, size, offset);
      var label = new Tmap.Label(shops[i].locCode);
      var marker = new Tmap.Markers(lonlat, icon, label);
      if (shops[i].storeType === '1') {
        this._markerLayer1.addMarker(marker);
      } else {
        this._markerLayer2.addMarker(marker);
      }
      marker.events.register('touchstart', marker, this._onMarkerClicked);
    }

    this.$resultCount.text(shops.length);
    this.$resultList.empty();
    this._onMore();
  },
  _onMore: function () {
    var currentCount = this.$resultList.children().length;

    var shops = this._nearShops;
    var listToShow = shops.length - currentCount;
    if (listToShow > 20) {
      listToShow = 20;
    }
    this.$resultList.append(this._listItemTemplate({
      list: shops.slice(currentCount, currentCount + listToShow)
    }));

    if (currentCount + listToShow >= shops.length) {
      this.$btnMore.addClass('none');
    }

    if (this._currentBranchType === 1) {
      this.$resultList.find('.fe-type-1').removeClass('none');
      this.$resultList.find('.fe-type-2').addClass('none');
    } else if (this._currentBranchType === 2) {
      this.$resultList.find('.fe-type-2').removeClass('none');
      this.$resultList.find('.fe-type-1').addClass('none');
    }
  },
  _onMarkerClicked: function () {
    window.location.href = '/customer/branch/detail?code=' + this.popup.contentHTML;
  },
  _onListItemClicked: function (e) {
    if (e.target.nodeName.toLowerCase() === 'a') {
      return;
    }
    var code = $(e.currentTarget).attr('value');
    this._historyService.goLoad('/customer/branch/detail?code=' + code);
  },
  _onRegionChangeClicked: function () {
    this._popupService.open({ hbs: 'CS_02_03_L01'}, $.proxy(function (container) {
      new Tw.CustomerBranchRegion(container, this._currentGu, this._regions,
        $.proxy(this._onRegionChanged, this));
    }, this));
  },
  _onRegionChanged: function (largeCd, middleName, regions) {
    this._popupService.close();

    this._regions = regions;

    this._apiService.requestAjax(Tw.AJAX_CMD.GET_TMAP_POI, {
      version: 1,
      searchKeyword: middleName + Tw.TMAP_STRING.POI_SEARCH_POSTFIX,
      areaLLCode: largeCd,
      appKey: Tw.TMAP.APP_KEY
    }).done($.proxy(function (res) {
      this._onCurrentLocation({
        longitude: res.searchPoiInfo.pois.poi[0].frontLon,
        latitude: res.searchPoiInfo.pois.poi[0].frontLat
      });
    }, this)).fail(function (err) {
      Tw.Error(err.status, err.statusText).pop();
    });
  },
  _onTypeOption: function () {
    var list = [
          { value: Tw.BRANCH.SELECT_BRANCH_TYPE[0], attr: 'value="0"' },
          { value: Tw.BRANCH.SELECT_BRANCH_TYPE[1], attr: 'value="1"' },
          { value: Tw.BRANCH.SELECT_BRANCH_TYPE[2], attr: 'value="2"' }
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
      root.on('click', 'button', $.proxy(this._onBranchTypeChanged, this));
    }, this));
  },
  _onBranchTypeChanged: function (e) {
    this._currentBranchType = parseInt(e.currentTarget.value, 10);
    this.$typeOption.text(Tw.BRANCH.SELECT_BRANCH_TYPE[this._currentBranchType]);
    this._popupService.close();
    switch (this._currentBranchType) {
      case 0:
        this._markerLayer1.setVisibility(true);
        this._markerLayer2.setVisibility(true);

        this.$resultList.find('.fe-type-1').removeClass('none');
        this.$resultList.find('.fe-type-2').removeClass('none');
        break;
      case 1:
        this._markerLayer1.setVisibility(true);
        this._markerLayer2.setVisibility(false);

        this.$resultList.find('.fe-type-1').removeClass('none');
        this.$resultList.find('.fe-type-2').addClass('none');
        break;
      case 2:
        this._markerLayer1.setVisibility(false);
        this._markerLayer2.setVisibility(true);

        this.$resultList.find('.fe-type-2').removeClass('none');
        this.$resultList.find('.fe-type-1').addClass('none');
        break;
      default:
        break;
    }
  },
  _switchToList: function () {
    this.$divMap.addClass('none');
    this.$divList.removeClass('none');
    this.$divListBtns.removeClass('none');
  },
  _switchToMap: function () {
    this.$divList.addClass('none');
    this.$divListBtns.addClass('none');
    this.$divMap.removeClass('none');
  }
};
/**
 * FileName: customer.shop.near.js (CI_02_05)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerShopNear = function (rootEl) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._searchedItemTemplate = Handlebars.compile($('#tpl_search_result_item').html());
  this._areaItemTemplate = Handlebars.compile($('#tpl_area_item').html());

  this._storeType = '0';

  this._isMap = true;
  this._map = null;
  this._markerLayer1 = null;
  this._markerLayer2 = null;
  this._nearShops = null;

  this._areas = [];
  this._selectedLarea = '';
  this._selectedLareaName = '';
  this._selectedMarea = '';
  this._initialGu = '';

  this._listShownCount = 0;

  this._cacheElements();
  this._bindEvents();
  this._init();
};

Tw.CustomerShopNear.prototype = {
  _cacheElements: function () {
    this.$region1 = this.$container.find('#fe-region-1');
    this.$region2 = this.$container.find('#fe-region-2');
    this.$tmapBox = this.$container.find('#TmapBox');
    this.$resultList = this.$container.find('.store-result-list');
    this.$mapArea = this.$container.find('#fe-map-area');
    this.$listArea = this.$container.find('#fe-list-area');
    this.$resultCount = this.$container.find('.num');
    this.$btnMore = this.$container.find('.bt-more');
    this.$moreCount = this.$container.find('#fe-more-count');
  },
  _bindEvents: function () {
    this.$container.on('change', '.radio', $.proxy(this._onTypeChanged, this));
    this.$container.on('click', '.bt-view-list, .bt-view-map',
      $.proxy(this._onSwitchMapList, this));
    this.$container.on('click', '.bt-map', $.proxy(this._onLocationClicked, this));
    this.$btnMore.on('click', $.proxy(this._onMore, this));
    this.$container.on('click', '.fe-shop-detail', $.proxy(this._onListClicked, this));
  },
  _init: function () {
    this.$container.find('.bt-view-list').css('z-index', 1000);
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(this._onCurrentLocation, this));
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
  _onSwitchMapList: function () {
    if (this._isMap) {
      this.$mapArea.addClass('none');
      this.$listArea.removeClass('none');
      this._isMap = false;
    } else {
      this.$mapArea.removeClass('none');
      this.$listArea.addClass('none');
      this._isMap = true;
    }
  },
  _onTypeChanged: function (evt) {
    var type = evt.target.value;
    if (type === '0') {
      this._markerLayer1.setVisibility(true);
      this._markerLayer2.setVisibility(true);

      this.$container.find('.fe-1, .fe-2').show();

      this._storeType = '0';
    } else if (type === '1') {
      this._markerLayer1.setVisibility(true);
      this._markerLayer2.setVisibility(false);

      this.$container.find('.fe-1').show();
      this.$container.find('.fe-2').hide();

      this._storeType = '1';
    } else {
      this._markerLayer1.setVisibility(false);
      this._markerLayer2.setVisibility(true);

      this.$container.find('.fe-1').hide();
      this.$container.find('.fe-2').show();

      this._storeType = '2';
    }
  },
  _onCurrentLocation: function (res) {
    var location;
    if (!Tw.FormatHelper.isEmpty(res.resultCode) && res.resultCode === 401) {
      this._historyService.goBack();
      return;
    } else {
      location = Tw.FormatHelper.isEmpty(res.params) ? res : res.params;
    }
    // init Tmap and show
    if (Tw.FormatHelper.isEmpty(this._map)) {
      this._map = new Tmap.Map({
        div: this.$tmapBox.attr('id'),
        width: '100%',
        height: this.$tmapBox.width() + 'px'
      });
    }
    this._map.setCenter(
      new Tmap.LonLat(location.longitude, location.latitude).transform('EPSG:4326', 'EPSG:3857'),
      15
    );

    // Add marker for current location
    // var markerLayer = new Tmap.Layer.Markers();
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
      this._initialGu = res.searchRegionsInfo[0].regionInfo.properties.guName.split(' ')[0].trim();

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

    this.$resultCount.text(this.$resultCount.text().replace(/\d*/, shops.length));
    this._onMore();
  },
  _onMarkerClicked: function () {
    window.location.href = '/customer/shop/detail?code=' + this.popup.contentHTML;
  },
  _onListClicked: function (evt) {
    this._historyService.goLoad('/customer/shop/detail?code=' + evt.currentTarget.value);
  },
  _onMore: function () {
    var shops = this._nearShops;
    var listToShow = shops.length - this._listShownCount;
    if (listToShow > 20) {
      listToShow = 20;
    }
    this.$resultList.append(this._searchedItemTemplate({
      list: shops.slice(this._listShownCount, this._listShownCount + listToShow)
    }));
    this._listShownCount += listToShow;

    if (this._listShownCount >= shops.length) {
      this.$btnMore.hide();
    } else {
      this.$moreCount.text(
        shops.length - this._listShownCount > 20 ? '20' : shops.length - this._listShownCount);
    }

    if (this._storeType === '1') {
      this.$container.find('.fe-1').show();
      this.$container.find('.fe-2').hide();
    } else if (this._storeType === '2') {
      this.$container.find('.fe-1').hide();
      this.$container.find('.fe-2').show();
    }
  },
  _onLocationClicked: function () {
    this._popupService.open({ hbs: 'CI_02_05_L03' }, $.proxy(this._onLocationPopupOpened, this));
  },

  _onLocationPopupOpened: function (container) {
    var $areaList = container.find('.tube-list');
    var $btDropdown = container.find('.bt-dropdown');

    $areaList.empty();

    $btDropdown.on('click', $.proxy(function () {
      this._popupService.open({
        hbs: 'select',
        title: Tw.POPUP_TITLE.SELECT_AREA,
        bt_num: 'one',
        type: [{
          style_class: 'bt-red1',
          txt: Tw.BUTTON_LABEL.CONFIRM
        }],
        select: [{
          options: _.map(_.filter(this._areas, function (item) {
            return item.areaDepth === 'L';
          }), function (item, i) {
            var val = item.largeCd;
            var name = item.districtName;
            return { title: name, checked: i === 0 ? true : false, value: val, text: name };
          })
        }]
      }, $.proxy(function (root) {
        root.find('input[value="' + $btDropdown.val() + '"]').click();
        root.on('click', '.bt-red1', $.proxy(function () {
          this._popupService.close();
          var $selected = root.find('.checked input');
          $btDropdown.text($selected.attr('title'));
          $btDropdown.val($selected.val());
          this._selectedMarea = '';
          this._onLargeAreaChanged($selected.val(), $areaList);
        }, this));
      }, this));
    }, this));

    container.on('click', '.bt-white2', $.proxy(function () {
      this._popupService.close();
    }, this));

    container.on('click', '.bt-red1', $.proxy(function () {
      this._selectedLarea = $btDropdown.val();
      this._selectedLareaName = $btDropdown.text();
      this._selectedMarea = $areaList.find('input[checked="checked"]').val();

      this._popupService.close();

      this._apiService.requestAjax(Tw.AJAX_CMD.GET_TMAP_POI, {
        version: 1,
        searchKeyword: $areaList.find('.checked').text().trim() + Tw.TMAP_STRING.POI_SEARCH_POSTFIX,
        areaLLCode: this._selectedLarea,
        // areaLMCode: $areaList.find('input[checked="checked"]').val(),
        appKey: Tw.TMAP.APP_KEY
      }).done($.proxy(function (res) {
        this._onCurrentLocation({
          longitude: res.searchPoiInfo.pois.poi[0].frontLon,
          latitude: res.searchPoiInfo.pois.poi[0].frontLat
        });
      }, this)).fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
      });
    }, this));

    if (!Tw.FormatHelper.isEmpty(this._areas)) {
      if (!Tw.FormatHelper.isEmpty(this._selectedLarea)) {
        $btDropdown.text(this._selectedLareaName);
        $btDropdown.val(this._selectedLarea);
      } else {
        $btDropdown.text(this._areas[0].districtName);
        $btDropdown.val(this._areas[0].largeCd);
      }

      this._onLargeAreaChanged($btDropdown.val(), $areaList);
      return;
    }

    this._apiService.requestAjax(Tw.AJAX_CMD.GET_TMAP_AREASCODE, {
      version: 1,
      count: 8000,
      page: 1,
      areaTypCd: '01',
      largeCdFlag: 'Y',
      middleCdFlag: 'Y',
      appKey: Tw.TMAP.APP_KEY
    }).done($.proxy(function (res) {
      this._areas = res.areaCodeInfo.poiAreaCodes;
      var districtName = '';
      var largeCd = '';
      if (!Tw.FormatHelper.isEmpty(this._initialGu)) {
        var matchedMiddle = _.filter(this._areas, $.proxy(function (item) {
          return this._initialGu === item.districtName;
        }, this));
        var matched = _.filter(this._areas, function (item) {
          return item.areaDepth === 'L' && item.largeCd === matchedMiddle[0].largeCd;
        });

        if (!Tw.FormatHelper.isEmpty(matched)) {
          this._selectedLarea = matched[0].largeCd;
          this._selectedLareaName = matched[0].districtName;
          this._selectedMarea = matchedMiddle[0].middleCd;
        }

        if (!Tw.FormatHelper.isEmpty(matched)) {
          districtName = matched[0].districtName;
          largeCd = matched[0].largeCd;
        } else {
          districtName = this._areas[0].districtName;
          largeCd = this._areas[0].largeCd;
        }
      } else {
        districtName = this._areas[0].districtName;
        largeCd = this._areas[0].largeCd;
      }
      $btDropdown.text(districtName);
      $btDropdown.val(largeCd);
      this._onLargeAreaChanged(largeCd, $areaList);
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.code + ' ' + err.msg);
    }, this));
  },
  _onLargeAreaChanged: function (code, $areaList) {
    $areaList.empty();
    $areaList.append(this._areaItemTemplate({
      list: _.filter(this._areas, function (item) {
        return item.areaDepth === 'M' && item.largeCd === code && !item.districtName.includes(' ');
      }).sort(function (a, b) {
        if (a.districtName > b.districtName) return 1;
        if (a. districtName < b.districtName) return -1;
        return 0;
      })
    }));
    skt_landing.widgets.widget_init('.container-wrap');
    skt_landing.components.component_init('.container-wrap');
    if (Tw.FormatHelper.isEmpty(this._selectedMarea)) {
      $areaList.find('li:first').click();
    } else {
      $areaList.find('input[value="' + this._selectedMarea + '"]').click();
    }
  }
};

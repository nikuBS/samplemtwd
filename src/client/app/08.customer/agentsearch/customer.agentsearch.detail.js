/**
 * @file 지점 상세화면 처리
 * @author Hakjoon Sim
 * @since 2018-10-29
 */

/**
 * @constructor
 * @param  {Object} mapEl - map이 위치할 elem
 * @param  {Object} coord - 해당 지점의 좌표 값
 */
Tw.CustomerAgentsearchDetail = function (mapEl, coord, isLogin) {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._dataChargeConfirmed = false;
  this.isLogin = (isLogin === 'true');

  $(window).on(Tw.INIT_COMPLETE, $.proxy(function() {
    this._showDataChargePopupIfNeeded(mapEl, coord);
  }, this));
};

Tw.CustomerAgentsearchDetail.prototype = {

  /**
   * @function
   * @desc app인 경우 tmap으로 인해 과금 팝업 보여줘야 함
   * @param  {Object} mapEl - map이 위치할 elem
   * @param  {Object} coord - 해당 지점의 좌표 값
   */
  _showDataChargePopupIfNeeded: function (mapEl, coord) {
    // Tw.Logger.info('thomas_check get cookie 정보는? : ', Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y')); // 위치 정보 응답코드 확인
    if (Tw.BrowserHelper.isApp()) {
      if(this.isLogin) {
         if(!Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y')) {  // 과금팝업 동의 쿠키 값 받아올수 없을때
          var confirmed = false;
          Tw.CommonHelper.showDataCharge(
            $.proxy(function () {
              confirmed = true;
              Tw.CommonHelper.setCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y');
              // Tw.Logger.info('thomas_check set이후 get cookie 정보는? : ', Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH', 'Y')); // 위치 정보 응답코드 확인
            }, this),
            $.proxy(function () {
              if (!confirmed) {
                this._historyService.goBack();
                return;
              }

              this._initMap(mapEl, coord);
            }, this)
          );
        } else {  // 로그인 이면서 과금 팝업 쿠키값 받아 올수 있을때
          this._initMap(mapEl, coord);
        }
      } else {  // 비로그인
        var confirmed = false;
        Tw.CommonHelper.showDataCharge(
          $.proxy(function () {
            confirmed = true;
          }, this),
          $.proxy(function () {
            if (!confirmed) {
              this._historyService.goBack();
              return;
            }

            this._initMap(mapEl, coord);
          }, this)
        );
      }
    } else {  // 앱이 아닐때
      this._initMap(mapEl, coord);
    }
  },

  /**
   * @function
   * @desc tmap api 사용하여 지도 화면에 표시
   * @param  {Object} mapEl - map이 위치할 elem
   * @param  {Object} coord - 해당 지점의 좌표 값
   */
  _initMap: function (mapEl, coord) {
    var map = new Tmap.Map({
      div: mapEl[0].id,
      width: '100%',
      height: mapEl.width() + 'px',
      httpsMode: true
    });

    var shopLon = coord.lon + '';
    var shopLat = coord.lat + '';

    map.setCenter(new Tmap.LonLat(shopLon, shopLat).transform('EPSG:4326', 'EPSG:3857'), 15);

    var markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);

    var lonlat = new Tmap.LonLat(shopLon, shopLat).transform('EPSG:4326', 'EPSG:3857');
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var icon = new Tmap.Icon(Tw.Environment.cdn + '/img/ico/ico-tmap-pin.png',
      size, offset);

    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);
  }
};
/**
 * FileName: membership.benefit.franchisee.map.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.30
 */

Tw.MembershipBenefitFranchiseeMap = function ($element, $tmapEl, options) {
  console.log('MembershipBenefitFranchiseeMap created options ',  options);
  this.$container = $element;
  this._options = options;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);

  this.$tmap = this._initMap($tmapEl);
  this._bindEvent();

};

Tw.MembershipBenefitFranchiseeMap.prototype = {

  /**
   * 지도 init
   * @param mapEl
   * @param coord
   */
  _initMap: function (mapEl) {
    console.log('init map...');

    var map = new Tmap.Map({
      div: mapEl[0].id,
      width: '100%',
      height: mapEl.width() + 'px'
    });

    var shopLon = this._options.googleMapCoordX + '';
    var shopLat = this._options.googleMapCoordY + '';

    map.setCenter(new Tmap.LonLat(shopLon, shopLat).transform('EPSG:4326', 'EPSG:3857'), 15);

    var markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);

    var lonlat = new Tmap.LonLat(shopLon, shopLat).transform('EPSG:4326', 'EPSG:3857');
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var icon = new Tmap.Icon('/img/ico/ico-tmap-pin.png',
      size, offset);

    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);
    return map;
  },


  /**
   * event 바인딩
   * @private
   */
  _bindEvent: function () {
    $('.franchisee-tit').click($.proxy(this._resetMap, this));
    $('.t-map').click($.proxy(this._goTmapApp, this));
    $('#btnBenefit').click($.proxy(this._showBenefit, this));
    $('#btnFranchiseeList').click($.proxy(this._goFranchiseeList, this));
  },

  /**
   * 지도를 가맹점 중심으로 이동하고, 초기화
   * @private
   */
  _resetMap: function(){

    var shopLon = this._options.googleMapCoordX + '';
    var shopLat = this._options.googleMapCoordY + '';

    this.$tmap.setCenter(new Tmap.LonLat(shopLon, shopLat).transform('EPSG:4326', 'EPSG:3857'), 15);
  },

  /**
   * TMap
   * @private
   */
  _goTmapApp: function(){
    // TODO tmap 연동 혹은 TA_01화면으로 이동(안깔려있을 경우)
    location.url = 'TMap app.. scheme and params';
  },

  /**
   * 혜택보기(BE_03_01_01)로 이동
   * @private
   */
  _showBenefit: function(){
    console.log('_showBenefit  ', this._options);
    var mvUrl = '../membership_benefit/1111';
    mvUrl += 'coCd=' + this._options.coCd;
    mvUrl += '&joinCd=' + this._options.joinCd;
    mvUrl += '&brandCd=' + this._options.brandCd;
    this._historyService.goLoad(mvUrl);
  },

  /**
   * 내 위치정보, 가맹점 포함해서 가맹점 전체보기(BE_03_01_03)로 이동
   * @private
   */
  _goFranchiseeList: function(){
    console.log('_goFranchiseeList  ', this._options);
    var mvUrl = './mbrs_0001?';
    mvUrl += 'coCd=' + this._options.coCd;
    mvUrl += '&joinCd=' + this._options.joinCd;
    mvUrl += '&brandCd=' + this._options.brandCd;
    this._historyService.goLoad(mvUrl);
  }


};
/**
 * MenuName: T멤버십 > 제휴브랜드 > 지도보기
 * @file membership.benefit.brand.map.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * Editor: InHwan Kim (skt.P132150@partner.sk.com)
 * @since 2018.11.06
 * Summary: tmap이용 가맹점 지도보기
 */

Tw.MembershipBenefitBrandMap = function (container, location, data) {

  this.$container = container;
  this.location = location;
  this.data = data;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._dataChargeConfirmed = false;

  this._render();
  this._bindEvent();

  if( !Tw.Environment.init ) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(this._init, this));
  } else {
    this._init();
  }
};

Tw.MembershipBenefitBrandMap.prototype = {

  _render: function () {
    this.$map = this.$container.find('#fe-tmap-box');
    this.$btnTmap = this.$container.find('button.t-map');
    this.$btnBenefit = this.$container.find('#btnBenefit');
    this.$btnFranchiseeList = this.$container.find('#btnFranchiseeList');
  },

  _bindEvent: function () {
    this.$btnTmap.on('click', $.proxy(this._goTmap, this));
    this.$btnBenefit.on('click', $.proxy(this._onClickBenefit, this));
    this.$btnFranchiseeList.on('click', $.proxy(this._onClickFranchiseeList, this));

    $(window).on("orientationchange", $.proxy(function(){
      setTimeout($.proxy(function() {
        this.$map.empty();
        this._initMap(this.$map, this.location);
      }, this), 300);
    }, this));
  },

  _init: function () {
    this._showDataChargePopupIfNeeded(this.$map, this.location);
    $('.fe-franchisee-infor-telnum').text(Tw.FormatHelper.getDashedPhoneNumber($('.fe-franchisee-infor-telnum').text()));
  },

  /**
   * wifi가 아닌 경우 팝업 호출
   * @param mapEl
   * @param coord
   * @private
   */
  _showDataChargePopupIfNeeded: function (mapEl, coord) {
    if ( Tw.BrowserHelper.isApp() ) {
      setTimeout($.proxy(function() {
        this._popupService.openConfirm(Tw.POPUP_CONTENTS.NO_WIFI, null,
          $.proxy(function () {
            this._dataChargeConfirmed = true;
            this._popupService.close();
            this._initMap(mapEl, coord);
          }, this),
          $.proxy(function () {
            if ( !this._dataChargeConfirmed ) {
              this._historyService.goBack();
            }
          }, this)
        );
      }, this), 300);
    }
    else {
      this._initMap(mapEl, coord);
    }
  },

  /**
   * map 초기화
   * @param mapEl
   * @param coord
   * @private
   */
  _initMap: function (mapEl, coord) {
    var map = new Tmap.Map({
      div: mapEl[0].id,
      width: '100%',
      height: $(window).height() * 0.6 + 'px'
    });
    var shopLon = coord.lon + '';
    var shopLat = coord.lat + '';

    map.setCenter(new Tmap.LonLat(shopLat, shopLon).transform('EPSG:4326', 'EPSG:3857'), 15);

    var markerLayer = new Tmap.Layer.Markers();
    map.addLayer(markerLayer);

    var lonlat = new Tmap.LonLat(shopLat, shopLon).transform('EPSG:4326', 'EPSG:3857');
    var size = new Tmap.Size(24, 38);
    var offset = new Tmap.Pixel(-(size.w / 2), -(size.h));
    var icon = new Tmap.Icon(Tw.Environment.cdn + Tw.TMAP.PIN, size, offset);

    var marker = new Tmap.Marker(lonlat, icon);
    markerLayer.addMarker(marker);
  },

  // 혜택보기화면으로 이동 (주의 area에 한글이 들어가는데 encode하지 않을 경우 로그인화면에서 오류남)
  _onClickBenefit: function () {
    this.data.brandNm = encodeURI(this.data.brandNm);
    this.data.area = encodeURI(this.data.area);
    this._historyService.goLoad('/membership/benefit/brand-benefit?' + $.param(this.data));
  },

  // 가맹점 전체보기 화면으로 이동 (주의 area에 한글이 들어가는데 encode하지 않을 경우 로그인화면에서 오류남)
  _onClickFranchiseeList: function () {
    this.data.brandNm = encodeURI(this.data.brandNm);
    this.data.area = encodeURI(this.data.area);
    this._historyService.goLoad('/membership/benefit/brand/list?' + $.param(this.data));
  },

  // tmap app 으로 이동 -> 요건 미확정으로 기능 제외
  _goTmap: function () {
    if ( Tw.BrowserHelper.isApp() ) {
      Tw.CommonHelper.openUrlExternal('https://onesto.re/0000163382');
    }
    else {
      this._historyService.goLoad('/product/apps');
    }
  }
};

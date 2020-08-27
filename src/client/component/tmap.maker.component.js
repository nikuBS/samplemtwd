/**
 * @file tmap.maker.component
 * @author 양정규
 * @since 2020-06-23
 * @desc Tmap v2
 * @constructor
 */
Tw.TmapMakerComponent = function () {
  this.map = undefined;     // 지도 객체 변수
  this.marker = undefined;  // 마커 객체 변수
  this.selectedMarker = undefined;
  this.markers = [];        // 마커 객체들
};

Tw.TmapMakerComponent.ICON_TYPE = {
  CHECK: 'CHECK',
  UN_CHECK: 'UN_CHECK'
};

Tw.TmapMakerComponent.prototype = {

  /**
   * @function
   * @returns {Tmapv2.map}
   * @desc 현재 지도 객체 리턴
   */
  getMap: function () {
    return this.map;
  },

  /**
   * @function
   * @returns {Tmapv2.Marker}
   * @desc 현재 마커 객체 리턴
   */
  getMarker: function () {
    return this.marker;
  },

  /**
   * @function
   * @return {Tmapv2.Marker} 현재 선택된 마커 리턴
   */
  getSelectedMarker: function () {
    return this.selectedMarker;
  },

  /**
   * @function
   * @param{JSON} option 지도 생성에 필요한 파라미터
   * @returns {Tw.TmapMakerComponent}
   * @desc 지도 생성
   */
  makeTmap: function (option) {
    // 기본 옵션을 생성 후, 파라미터로 받은 변수들을 머지 해준다.
    var _option = $.extend({
      width: '100%',
      height: '400px',
      zoom: 15  // 기본 줌 레벨은 15로 설정
    }, option);

    var $map = $('#'+_option.id); // 지도가 그려질 엘리먼트의 ID
    $map.empty();
    $map.css({width: _option.width, height: _option.height});
    /*
       지도 재 생성할때도 처음 한번만 객체 생성하고 이후에 재사용으로 하려고 했으나,
       지도 resize() 할때 숫자값 외에 '%' 나 'px' 를 넣으면 지도 노출이 안되어 매번 객체 생성을 따로 해줘야 함.
    */
    this.map = new Tmapv2.Map(_option.id,{
      center: new Tmapv2.LatLng(_option.latitude, _option.longitude),
      width: _option.width,
      height: _option.height,
      // zoom: 14,
      zoom: _option.zoom,
      httpsMode: true
    });
    // 해당 엘리먼트에 지도 객체가 생성이 안되어 있다면 객체 생성해줌. 이후에는 생성된 지도 객체를 이용함.
    /*if (!$map.data('create')) {
      this.map = new Tmapv2.Map(_option.id,{
        // center: new Tmapv2.LatLng(_option.latitude, _option.longitude),
        width: _option.width,
        height: _option.height,
        // zoom: 14,
        // zoom: _option.zoom,
        httpsMode: true
      });
      $map.data('create',true);
    } else {
      this.map.resize('100%', '600px');
    }
    this.map.setCenter(new Tmapv2.LatLng(_option.latitude, _option.longitude)); // 지도 중심 설정. 지도 초기 좌표
    this.map.setZoom(_option.zoom);*/ // 줌 레벨 설정.
    this.removeMarkers(); // 모든 마커들 삭제함.
    return this;  // 메소드 체인 방식 이용하기 위해 현재 인스턴스를 리턴함.
  },

  /**
   * @function
   * @param{JSON} option 마커 생성에 필요한 파라미터
   * @returns {Tw.TmapMakerComponent}
   * @desc 마커 생성
   */
  makeMarker: function (option) {
    var iconType = option.iconType || Tw.TmapMakerComponent.ICON_TYPE.CHECK;
    var _option = $.extend({
      event: []
    }, this._getIconConf(iconType), option);

    var marker = new Tmapv2.Marker({
      position: new Tmapv2.LatLng(_option.latitude, _option.longitude), //Marker의 중심좌표 설정.
      icon: Tw.Environment.cdn + _option.icon, //Marker의 아이콘.
      iconSize: new Tmapv2.Size(_option.width, _option.height),
      map: this.map //Marker가 표시될 Map 설정.
    });

    // 이벤트가 있는 경우 리스너 등록함.
    if (!Tw.FormatHelper.isEmpty(option.event)) {
      option.event.forEach(function (event) {
        marker.addListener(event.name, event.func);
      });
    }
    this.marker = marker;
    this.marker.options = option.options;
    this.markers.push(this.marker);
    if (iconType === Tw.TmapMakerComponent.ICON_TYPE.CHECK){
      this.selectedMarker = this.marker; // '체크' 한 마커 저장
    }
    return this;
  },

  /**
   * @function
   * @param{string} type CHECK, UN CHECK
   * @returns {{icon: string, width: number, height: number}}
   * @desc 마커(아이콘) 설정값 리턴
   */
  _getIconConf: function (type) {
    var conf = {
      icon: Tw.TMAP.PIN_RED,
      width: 24,
      height: 38
    };
    if (type === Tw.TmapMakerComponent.ICON_TYPE.UN_CHECK) {
      $.extend(conf, {
        icon: Tw.TMAP.PIN_GRAY,
        width: 16,
        height: 25
      });
    }

    return conf;
  },

  /**
   * @function
   * @returns {Tw.TmapMakerComponent}
   * @desc 모든 마커 삭제
   */
  removeMarkers: function () {
    this.markers.forEach(function (marker) {
      marker.setMap(null);
    });
    this.markers = [];
    this.marker = undefined;
    return this;
  },

  markerSelect: function (locCode) {
    // 현재 선택한 마커는 선택표시, 제외한 나머지 마커를 기본 마커로 변경
    this.markers.forEach(function (marker) {
      if (!marker.options) {
        return;
      }
      var type = Tw.TmapMakerComponent.ICON_TYPE;
      var iconType = locCode !== marker.options.locCode ? type.UN_CHECK: type.CHECK;
      var iconConf = this._getIconConf(iconType);
      if (iconType === type.CHECK) {
        this.selectedMarker = marker;
      }

      marker.setIcon(Tw.Environment.cdn + iconConf.icon);
      $.extend(marker._marker_data.options.iconSize, {
        _width: iconConf.width,
        _height: iconConf.height
      });
    }.bind(this));

    return this;
  }
};

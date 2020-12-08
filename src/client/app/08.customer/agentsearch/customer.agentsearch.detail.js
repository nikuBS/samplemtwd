/**
 * @file 지점 상세화면 처리
 * @author Hakjoon Sim
 * @since 2018-10-29
 * @editor 양정규 2020-07-22
 */

/**
 * @constructor
 * @param  {Object} mapEl - map이 위치할 elem
 * @param  {Object} options - 옵션 파라미터
 */
Tw.CustomerAgentsearchDetail = function (rootEl, options) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  this.tmapComponent = new Tw.TmapMakerComponent();
  this._locationInfoComponent = new Tw.LocationInfoComponent();

  this._dataChargeConfirmed = false;
  this._svcInfo = options.svcInfo;
  this._locCode = options.locCode;
  this._coord = options.coord;
  this._detail = options.detail;
  this._directionsState = { // 길찾기 노출여부 체크 완료여부
    endOfLoc: false,  // 위치권한 완료여부
    endOfMap: false   // 지도 그리기 완료여부
  };
  this.customerAgentsearchComponent = new Tw.CustomerAgentsearchComponent(rootEl, options.svcInfo);

  $(window).on(Tw.INIT_COMPLETE, $.proxy(function () {
    this.customerAgentsearchComponent.showDataCharge(this._init.bind(this));
  }, this));
};

Tw.CustomerAgentsearchDetail.prototype = {

  /**
   * @function
   * @desc 초기 설정
   * @private
   */
  _init: function () {
    this._cacheElements();
    this._bindEvents();
    this._renderContact();
    this._getTshopImg();
    this._checkDirections();
    this._initMap();
  },

  /**
   * @function
   * @desc DOM caching
   */
  _cacheElements: function () {
    this._sliderArea = this.$container.find('.fe-slider-area');  // 매장 이미지 슬라이더 영역
    this._slider = this.$container.find('.fe-slider');  // 매장 이미지 영역
    this._imgTemplate = Handlebars.compile($('#tpl_img').html());
    this._contactTemplate = Handlebars.compile($('#tpl_contact_item').html());
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$container.on('click', '#fe-myLocation', $.proxy(this._initMap, this)); // 내 위치 버튼 클릭 이벤트
  },

  _renderContact: function () {
    this.customerAgentsearchComponent.reserveCounsel(this._detail);
    this.$container.find('.fe-shop-info').append(this._contactTemplate(this._detail));
  },

  /**
   * @function
   * @desc tmap api 사용하여 지도 화면에 표시
   */
  _initMap: function () {
    var position = {
      latitude: this._coord.lat,
      longitude: this._coord.lon
    };
    // Tmap 생성
    this.tmapComponent.makeTmap($.extend({
      id: 'fe-tmap-box',
      width: '100%',
      height: '280px'
    }, position)).makeMarker($.extend({
      width: 24
    }, position));

    // 길찾기 버튼 노출(case 에 따라 비노출)
    this._visibleDirections({
      endOfMap: true
    });
  },

  /**
   * @function
   * @desc "길찾기" 버튼 노출유무확인(모바일기기에서만 노출하며, 간편로그인, 비로그인, 14세미만, 로그인했지만 위치 미동의는 길찾기 버튼 비노출)
   * @private
   */
  _checkDirections: function () {
    var options = {
      endOfLoc: true,
      visible: false
    }, self = this;

    // 모바일인 경우만 체크, 로그인 여부. 간편로그인, 비로그인 case
    if (!Tw.BrowserHelper.isMobile() || Tw.FormatHelper.isEmpty(this._svcInfo)) {
      return self._visibleDirections(options);
    }

    // 나이 와 BFF 위치동의 여부 조회
    this._locationInfoComponent.checkLocationAgreementWithAge(function (resp) {
      options.visible = resp.over14 && resp.locAgree;
      // 14세 이상이면서, BFF의 위치접근권한 허용일때
      if (options.visible) {
        self._getCurrentLocation(function (loc){
          if (loc !== null) {
            options.currLoc = loc;
            self._visibleDirections(options);
          }
        });
      }
    });

  },

  /**
   * @function
   * @desc 현재위치 조회
   * @private
   */
  _getCurrentLocation: function (callBack) {
    this._locationInfoComponent.getCurrentLocation( function (res) { // 위치정보 조회 성공
      callBack(res); // ex. latitude: 37.4038252, longitude: 127.3015055
    }, function () { // 위치정보 조회 실패
      /*self._myPosition = {
        latitude: 37.4038252,
        longitude: 127.3015055
      };
      callBack(self._myPosition);*/
      // [E]

      callBack(null);
      // self._popupService.openAlert(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A69.MSG);
    });
  },

  /**
   * @function
   * @desc "길찾기" 버튼 노출여부
   * @param options
   * @private
   */
  _visibleDirections: function (options) {
    var state = $.extend(this._directionsState, options);
    // 위치권한, 지도그리기 완료, 노출여부가 모두 true 일때만 길찾기 버튼 노출함.
    if ( !(state.endOfLoc && state.endOfMap && options.visible) ) {
      return;
    }

    this.$container.find('.fe-directions').removeClass('none');
    new Tw.CustomerAgentsearchDetailDirections(this.$container, {
      currLoc: options.currLoc,
      coord: this._coord,
      detail: this._detail
    }); // 길 찾기 앱 실행 스크립트
  },

  /**
   * @function
   * @desc 매장 이미지 조회
   * @private
   */
  _getTshopImg: function () {
    // 매장 이미지 호출
    var url = Tw.Environment.environment === 'prd' ? Tw.OUTLINK.T_SHOP.PRD : Tw.OUTLINK.T_SHOP.DEV;
    Tw.AJAX_CMD.GET_TSHOP_IMG_LIST.url = url+':8080';
    // STORE_CODE
    this._apiService.requestAjax(Tw.AJAX_CMD.GET_TSHOP_IMG_LIST, {
      // 'STORE_CODE': 'D000000000' // 테스트용 매장코드
      'STORE_CODE': this._locCode
    }).done(function (res) {
      if (res.RET_CODE !== 0 || Tw.FormatHelper.isEmpty(res.IMAGES)) {
        Tw.Logger.error('[_getTshopImg] error or not found images..');
        return;
      }
      _.map(res.IMAGES, function (o, i) {
        res.IMAGES[i] = decodeURIComponent(o);
      });

      this.$container.find('#fe-gallery').removeClass('none');
      this._renderImg(res.IMAGES);
    }.bind(this)).fail(function (err) {
      console.info('[_getTshopImg] err:', err);
    });
  },

  /**
   * @function
   * @desc 이미지 처리
   * @param imgList
   * @private
   */
  _renderImg: function (imgList) {
    this._slider.append(this._imgTemplate({
      list: imgList
    }));
    this._sliderArea.addClass('slider1-auto').data('slider-auto', 'auto');
    this._slick();
  },

  /**
   * @function
   * @desc 슬라이드 처리
   * @private
   */
  _slick: function () {
    var _this = this._slider;
    _this.slick({
      autoplay: true,
      autoplaySpeed: 4000,
      dots: true,
      arrows: true,
      infinite: true,
      speed : 300,
      lazyLoad: 'progressive',
      centerMode: false,
      focusOnSelect: false,
      touchMove : true,
      customPaging: function(slider, i) {
        if (i === 0) {
          return $('<button />').attr(
            {
              text: Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1),
              'aria-label': Tw.BANNER_DOT_TMPL.replace('{{index}}', i + 1)
            }
          );
        } else {
          return $('<button />').attr({
            text: i + 1,
            'aria-label': i + 1
          });
        }
      }
    });

    // 190603 - 자동롤링 시 Play/Stop 버튼 기능 제공 START
    _this.after($('<button type="button" class="tod-bann-btn stop"><span class="blind">일시정지</span></button>')); // 190610_추가
    _this.next('button.tod-bann-btn').on('click', function () {
      _this.slick($(this).hasClass('stop') ? 'slickPause' : 'slickPlay');
      $(this).find('.blind').html($(this).hasClass('stop') ? '재생' : '일시정지');
      $(this).toggleClass('stop', !$(this).hasClass('stop'));
    });
    // 190603 - 자동롤링 시 Play/Stop 버튼 기능 제공 END
  }

};

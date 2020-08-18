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

  this._dataChargeConfirmed = false;
  this._svcInfo = options.svcInfo;
  this._locCode = options.locCode;
  this._coord = options.coord;
  this._detail = options.detail;
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
  },

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

  _renderImg: function (imgList) {
    this._slider.append(this._imgTemplate({
      list: imgList
    }));
    this._sliderArea.addClass('slider1-auto').data('slider-auto', 'auto');
    this._slick();
  },

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

/**
 * FileName: membership.benefit.brand-benefit.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.05
 */

Tw.MembershipBenefitBrandBenefit = function (rootEl, options) {

  this.$container = rootEl;
  this._options = options;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._registHbsHelper();
  this._cacheElements();
  this._bindEvnets();

  // default
  this._options.area1 = Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.AREA1;
  this._options.area2 = Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.AREA2;
  this._options.mapX = Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.MAP_X;
  this._options.mapY = Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.MAP_Y;
  this._setArea();

  if ( Tw.BrowserHelper.isApp() ) {
    this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(this._onCurrentLocation, this));
  }else {
    this._reqeustNearShopList();
  }
  this._reqeustPopBrandList();
};

Tw.MembershipBenefitBrandBenefit.prototype = {

  /**
   * app location 파악
   * @param result
   * @private
   */
  _onCurrentLocation: function(result){
    // console.log('location 파악  result');

    if(result && result.code === Tw.NTV_CODE.CODE_00){
      this._options.mapX = result.params.latitude;
      this._options.mapY = result.params.longitude;
    }

    // 위경도로 지역명 조회 api 호출??

    this._reqeustNearShopList();
  },

  _setArea: function(area1, area2, mapX, mapY){
    if(area1 && area2) {
      this._options.area1 = area1;
      this._options.area2 = area2;
    }
    if(mapX && mapY){
      this._options.mapX = mapX;
      this._options.mapY = mapY;
    }

    $('#fe-area-name').text(this._options.area1 + ' ' + this._options.area2);
  },


  _cacheElements: function () {
    this._feFrchListItem = Handlebars.compile($('#fe-franchisee-list-item').html());
    this._feBrandList = $('#fe-brand-list').html();
    this._feBrandListItem = Handlebars.compile($('#fe-brand-list-item').html());
  },

  _bindEvnets: function () {
    this.$container.on('click', '.franchisee-list .bt-map', $.proxy(this._goMap, this));
    this.$container.on('click', '.brand-logo-list .bt-logo', $.proxy(this._goBrandView, this));
    this.$container.on('click', '#frchs-bt-all', $.proxy(this._goFrchAllView, this));
  },

  _registHbsHelper: function(){
    Handlebars.registerHelper('tel', Tw.StringHelper.phoneStringToDash);
  },

  /**
   * 카테고리 내 인기 브랜드 조회
   */
  _reqeustPopBrandList: function(){
    var param = {
      ordCol: 'L',    // 'L' 고정값
      cateCd: this._options.cateCd
    };
    this._apiService.request(Tw.API_CMD.BFF_11_0017, param)
      .done($.proxy(function(resp){
        var list = resp.result.list;
        var $boxBrand = $('#fe-pop-brand-box', this.$container);
        var tmp = '';
        for(var i = 0; i < list.length; i++){
          if(i % 6 === 0){
            $boxBrand.append(this._feBrandList);
          }
          tmp = this._feBrandListItem(list[i]);
          $('.brand-logo-list').last().append(tmp);
        }
        // skt_landing.widgets.widget_slider1를 쓰려고 했지만 안먹혀서 그냥 slick함수를 사용
        $('.slider').slick('unslick');
        $('.slider').slick({
          dots: true,
          arrows: true,
          infinite: false,
          speed : 300,
          centerMode: false,
          focusOnSelect: false,
          touchMove : true,
          customPaging: function(slider, i) {
            return $('<span />').text(i + 1);
          }
        });

      }, this))
      .fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
      });
  },

  /**
   * 내 주변 가맹점 조회 - 3개만 조회
   * @private
   */
  _reqeustNearShopList: function(){
    var param = {
      ordCol: 'D',    // 'D' 고정값
      area1: encodeURI(this._options.area1),
      area2: encodeURI(this._options.area2),
      mapX: this._options.mapX,
      mapY: this._options.mapY,
      brandCd: this._options.brandCd,
      pageNo: '1',
      pageSize: '3'
    };

    this._apiService.request(Tw.API_CMD.BFF_11_0023, param)
      .done($.proxy(function(resp){
        var list = resp.result.list;
        var tmp = '';
        var $frchsBox = $('.franchisee-list');
        for(var i = 0; i < list.length; i++){
          tmp = this._feFrchListItem(list[i]);
          $frchsBox.append(tmp);
          // 3개반 노출
          if(i > 3) {
            break;
          }
        }

      }, this))
      .fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
      });

  },

  /**
   * 지도보기로 이동
   * @param event
   * @private
   */
  _goMap: function(event){
    var $bt = $(event.currentTarget);
    var param = {
      cdCd: $bt.data('cocd'),
      joinCd: $bt.data('joincd'),
      mapX: $bt.data('mapx'),
      mapY: $bt.data('mapy'),
      brandCd: this._options.brandCd,
      cateCd: this._options.cateCd
    };
    this._historyService.goLoad('/membership/benefit/map?' + $.param(param));
  },

  /**
   * 인기 브랜드 혜택보기로 이동
   * @param event
   * @private
   */
  _goBrandView: function(event){
    var $bt = $(event.currentTarget);

    var param = {
      brandCd: $bt.data('brandcd'),
      cateCd: $bt.data('catecd')
    };

    this._historyService.goLoad('/membership/benefit/brand-benefit?' + $.param(param));
  },

  /**
   * 가맹점 전체보기
   * @param event
   * @private
   */
  _goFrchAllView: function(){
    var param = {
      brandCd: this._options.brandCd,
      cateCd: this._options.cateCd
    };

    this._historyService.goLoad('/membership/benefit/brand/list?' + $.param(param));
  }

};

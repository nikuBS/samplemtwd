/**
 * FileName: membership.benefit.brand-benefit.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.11.05
 */

Tw.MembershipBenefitBrandBenefit = function (rootEl, options) {



  $('.benefit-list').eq(0).html(this._convToHtml(options.coBenefitDtl || options.appCoBenefitDtl )).show();

  /*
  // 데이터 내에 태그를 escape한 것이 있다면 컨텐츠를 다시 뿌림
  var tmp = options.coBenefitDtl.replace(/ /g, '').toLowerCase();
  if(tmp.indexOf('&lt;br/&gt;') !== -1 ||
    tmp.indexOf('&lt;b&gt;') !== -1 ||
    tmp.indexOf('&lt;strong&gt;') !== -1) {
    $('.benefit-list').eq(0).html($('.benefit-list').eq(0).text()).show();
  }else{
    $('.benefit-list').eq(0).show();
  }*/

  // DV001-14557 이슈로
  // 컨텐츠 내 url이 T맴버십의 url이라 T맴버십 앱(url)으로 이동 하도록 링크를 변경
  $('.benefit-list').eq(0).find('a').each(this._goTmbrshpApp);
  $('.benefit-list').eq(1).find('a').each(this._goTmbrshpApp);

  this.$container = rootEl;
  this._options = options;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._registHbsHelper();
  this._cacheElements();
  this._bindEvnets();

  // default
  this._options.area1 = Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.AREA1;
  this._options.area2 = Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.AREA2;
  this._options.mapX = Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.MAP_X;
  this._options.mapY = Tw.MEMBERSHIP.BENEFIT.DEFAULT_AREA.MAP_Y;

  if(this._options.loginYn === 'Y' && this._options.locAgreeYn === 'Y'){
    this._getCurrentLocation();
  }else {
    this._reqeustNearShopList();
  }

  this._reqeustPopBrandList();
};

Tw.MembershipBenefitBrandBenefit.prototype = {

  _cacheElements: function () {
    this._feFrchListItem = Handlebars.compile($('#fe-franchisee-list-item').html());
    this._feBrandList = $('#fe-brand-list').html();
    this._feBrandListItem = Handlebars.compile($('#fe-brand-list-item').html());
  },

  _bindEvnets: function () {
    this.$container.on('click', '.franchisee-list .bt-map', $.proxy(this._goMap, this));
    this.$container.on('click', '.brand-logo-list .bt-logo', $.proxy(this._goBrandView, this));
    this.$container.on('click', '#frchs-bt-all', $.proxy(this._goFrchAllView, this));
    this.$container.on('click', '.fe-btn-location', $.proxy(this._onclickGpsBtn, this));
  },

  _registHbsHelper: function(){
    Handlebars.registerHelper('tel', Tw.FormatHelper.getDashedPhoneNumber);
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
        // if(list.length > 6){
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
          // 슬릭 버그로 화면이 가로 스크롤 되는 현상이 있어서 강제로 조정
          $('.slick-dots').css('width', '90%');

          // 6개 이하는 슬릭 적용 안하니 양 옆 padding이 없는 현상이 있으므로 슬릭 지정하고 하단 slick-dots만 숨김
          if(list.length <= 6){
            $('.slick-dots').hide();
          }
        // }

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
        if(!resp.result.list || resp.result.list.length === 0){
          $('#fe-contents-empty').show().attr('aria-hidden', false);
          return;
        } else {
          $('#fe-contents-empty').hide().attr('aria-hidden', true);
        }

        var list = resp.result.list;
        var tmp = '';
        var $frchsBox = $('.franchisee-list');
        $frchsBox.find('li').remove();
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
      coCd: $bt.data('cocd'),
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
   * 가맹점 전체보기로 이동
   * @param event
   * @private
   */
  _goFrchAllView: function(){
    var param = {
      brandCd: this._options.brandCd,
      brandNm: encodeURI($('.brand-tit').text()),
      cateCd: this._options.cateCd,
      area : encodeURI(this._options.area1 + ' ' + this._options.area2)
    };

    this._historyService.goLoad('/membership/benefit/brand/list?' + $.param(param));
  },

  /**
   * T맴버십 앱(url)으로 이동 하도록 링크를 변경
   * @private
   */
  _goTmbrshpApp: function(){
    var url = $(this).attr('href');
    $(this).attr('target', '_blank');
    $(this).on('click', function(){

      Tw.Popup.openModalTypeATwoButton(
        Tw.MEMBERSHIP.BENEFIT.BRAND_BENEFIT.MOV_TMEM_CONF_TIT,
        Tw.MEMBERSHIP.BENEFIT.BRAND_BENEFIT.MOV_TMEM_CONF_MSG,
        Tw.BUTTON_LABEL.CONFIRM,
        Tw.BUTTON_LABEL.CANCEL,
        undefined,
        function(){
          Tw.Popup.close();
          Tw.CommonHelper.openUrlExternal(Tw.MEMBERSHIP.BENEFIT.BRAND_BENEFIT.MOV_TMEM_CONF_URL + url);
        }
      );

      return false;
    });
  },


  /**
   * 위치 버튼을 누른 경우
   * @private
   */
  _onclickGpsBtn: function(){
    if( this._options.loginYn === 'Y'){
      if(this._options.locAgreeYn === 'Y'){
        this._getCurrentLocation();
      } else {
        this._showAgreementPopup();
      }
    } else {
      // 로그인 안한 경우 로그인
      this._tidLanding = new Tw.TidLandingComponent();
      this._tidLanding.goLogin();
    }
  },


  /**
   * 현재 지역 파악하기
   * @private
   */
  _getCurrentLocation: function(){
    //app인 경우
    if ( Tw.BrowserHelper.isApp() ) {
      this._nativeService.send(
        Tw.NTV_CMD.GET_LOCATION, {},
        $.proxy(function(result){

          if(result && result.resultCode === Tw.NTV_CODE.CODE_00){
            this._getAreaByMapXY(result.params.latitude, result.params.longitude);
          } else {

            this._notAbleGps();
          }
        }, this));

      // browser인 경우
    } else {

      if ('geolocation' in navigator) {
        // Only works in secure mode(Https) - for test, use localhost for url
        navigator.geolocation.getCurrentPosition(
          $.proxy(function(location){
            this._getAreaByMapXY(location.coords.latitude, location.coords.longitude);
          }, this),
          $.proxy(this._notAbleGps, this),
          {timeout: 1000});
      } else {
        this._notAbleGps();

      }
    }

  },


  /**
   * 기기에서 위치정보 동의를 하지 않았거나 gps를 사용할 수 없는 경우
   * @private
   */
  _notAbleGps: function(){
    setTimeout(function(){
    this._popupService.openAlert(
      Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A69.MSG,
      Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A69.TITLE,
      Tw.BUTTON_LABEL.CONFIRM,
      $.proxy(this._reqeustNearShopList, this))}.bind(this)
    , 200);
  },

  /**
   * 위경도로 주소가져오기
   * @private
   */
  _getAreaByMapXY: function(x,y){

    this._options.mapX = x;
    this._options.mapY = y;

    this._apiService.request(Tw.API_CMD.BFF_11_0026, { mapX: x, mapY: y })
      .done($.proxy(function(resp){
        if(resp.result){
          this._setArea(resp.result.area1, resp.result.area2);
          this._reqeustNearShopList();
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.status, err.statusText).pop();
      });
  },

  /**
   * 지역1, 지역2 화면 및 변수 세팅
   * @param area1
   * @param area2
   * @private
   */
  _setArea: function(area1, area2){
    if(area1 && area2) {
      this._options.area1 = area1;
      this._options.area2 = area2;
      $('#fe-area-name').text(this._options.area1 + ' ' + this._options.area2);
    }
  },


  /**
   * 위치 이용동의 api 호출
   * @private
   */
  _showAgreementPopup: function () {
    this._popupService.open({
        ico: 'type3', title: Tw.BRANCH.PERMISSION_TITLE, contents: Tw.BRANCH.PERMISSION_DETAIL,
        link_list: [{style_class: 'fe-link-term', txt: Tw.BRANCH.VIEW_LOCATION_TERM}],
        bt: [{style_class: 'bt-blue1', txt: Tw.BRANCH.AGREE},
          {style_class: 'bt-white2', txt: Tw.BRANCH.CLOSE}]
      }, $.proxy(function (root) {
        root.on('click', '.fe-link-term', $.proxy(function () {
          this._historyService.goLoad('/main/menu/settings/terms?id=33&type=a');
        }, this));
        root.on('click', '.bt-white2', $.proxy(function () {
          this._popupService.close();
        }, this));
        root.on('click', '.bt-blue1', $.proxy(function () {
          this._popupService.close();
          var data = { twdLocUseAgreeYn: 'Y' };
          this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
            .done($.proxy(function (res) {
              if (res.code === Tw.API_CODE.CODE_00) {
                this._options.locAgreeYn = 'Y';
                this._getCurrentLocation();
              } else {
                Tw.Error(res.code, res.msg).pop();
              }
            }, this))
            .fail(function (err) {
              Tw.Error(err.code, err.msg).pop();
            });
        }, this));
      }, this),
      $.proxy(function () {
        this._popupService.close();
      }, this)
    );
  },


  /**
   * contents를 html로 변경
   * (as-is에 있는 로직을 javascript로 변경해서 그대로 사용함 DV001-17050)
   * @param contents
   * @returns {*}
   * @private
   */
  _convToHtml: function(contents){
    if(!contents) {
      return '';
    }

    contents = contents.replace('&amp;', '&');
    contents = contents.replace('&quot;', '\'');
    contents = contents.replace('&acute;', '"');
    contents = contents.replace('&#35;', '#');
    contents = contents.replace('&#39;', '\'');
    contents = contents.replace('&#40;', '(');
    contents = contents.replace('&#41;', ')');

    // 허용 가능 tag 목록
    var ableTagArr = [
      'table','caption','colgroup','col','thead','tbody','tfoot','th','tr','td',
      'div','span',
      'p','pre','br',
      'b','strong','u','font','center','sub','sup','em',
      'hr','blockquote','ul','ol','li',
      'h1','h2','h3','h4','h5','article',
      'a','img','dl','dt','dd'
    ];

    var reg = null;
    var repl = null;
    for( var i = 0; i < ableTagArr.length; i++ ){
      reg = new RegExp('&lt;(.?)' + ableTagArr[i] + '(.*?)&gt;', 'gi');
      repl = '<$1'+ableTagArr[i]+'$2>';
      contents = contents.replace(reg, repl);
    }
    return contents;
  }
};

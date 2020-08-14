/**
 * @file 나와 가까운 지점 화면 관련 처리
 * @author 양정규
 * @since 2020-06-10
 */

/**
 * @constructor
 * @param  {Object} options - 옵션
 */
Tw.CustomerAgentsearchMap = function (options) {
  this._customerAgentsearch = options.customerAgentsearch;
  this.$container = this._customerAgentsearch.$container;
  this._svcInfo = this._customerAgentsearch._svcInfo;
  // OP002-8862 만 14세 미만일 경우 해당 버튼 Tap 시 위치정보 이용안내 얼랏 대신 위치 미동의 상태일 경우 출력되는 리스트 화면 노출
  this._isAcceptAge = this._customerAgentsearch._isAcceptAge;
  this._historyService = new Tw.HistoryService();
  this._tmapMakerComponent = new Tw.TmapMakerComponent();
  this._locationInfoComponent = new Tw.LocationInfoComponent();
  this.customerAgentsearchComponent = new Tw.CustomerAgentsearchComponent(this._svcInfo);
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._location = undefined; // 현재위치 좌표정보

  // 위치 변경 관련 두개 파일 git에서 삭제 해야 함, CS_02_03_L01.hbs , customer.agentsearch.region.js
  this._nearShops = undefined;  // 지점 대리점 리스트
  this.$radiusList = undefined; // 검색 반경 리스트

  // todo 양정규 : shortcut url 지점/대리점 url로 작업하기
  // shortcut url 생성을 위한 주소, 검색 반경은 디폴트로 적용
  // 내위치 지도 전체 : http://localhost:3000/customer/agentsearch
  // 내위치 지도 지점 : http://localhost:3000/customer/agentsearch?storeType=branch
  // 내위치 지도 대리점 : http://localhost:3000/customer/agentsearch?storeType=agent
  // 내위치 리스트 전체 : http://localhost:3000/customer/agentsearch?showList=Y
  // 내위치 리스트 지점 : http://localhost:3000/customer/agentsearch?storeType=branch&showList=Y
  // 내위치 리스트 대리점 : http://localhost:3000/customer/agentsearch?storeType=agent&showList=Y

  this._query = Tw.UrlHelper.getQueryParams();
  this._isNotAgreeLocation = false; // 위치 미동의 여부. 디폴트는 동의
  this._lastParam = {};

  var customerComponent = this.customerAgentsearchComponent;
  var init = this._init.bind(this);
  if (!Tw.Environment.init) {
    $(window).on(Tw.INIT_COMPLETE, $.proxy(customerComponent.showDataCharge, customerComponent, init));
  } else {
    customerComponent.showDataCharge(init);
  }
};

Tw.CustomerAgentsearchMap.prototype = {

  /**
   * @function
   * @desc app인 경우 현재 위치 조회하고, mweb인 경우 약관 먼저 조회
   */
  _init: function () {
    this._cacheElements();
    this._bindEvents();
    this._setSize();
    this._checkLocationAgreement();
    this._initMapList();
  },

  _cacheElements: function () {
    this.$radiusOption = this.$container.find('.fe-radius');  // 반경 옵션
    this.$locationAlert = this.$container.find('.fe-location-alert');  // 위치정보 미동의 시 보이는 알럿 영역
    this.$filterArea = this.$container.find('.fe-filter-area');  // 필터 영역
    this.$loading = this.$container.find('.fe-loading');  // 로딩
    this.$mapListArea = this.$container.find('.fe-map-list-area');  // 지도+리스트
    this.$normalList = this.$container.find('.fe-normal-list-area');  // 리스트
    this.$toggleButton = this.$container.find('.fe-toggle-button');  // 리스트 보기/지도 보기 토글버튼
    this.$listArea = this.$container.find('.fe-list-area');  // 리스트 바인딩 될 영역
    this.$noShop = this.$container.find('.fe-no-shop');  // 반경 거리 이내에 매장 없을 때 보이는 영역
    this.$shopInfoArea = this.$container.find('.fe-shop-info-area');  // 매장정보 영역
  },

  _bindEvents: function () {
    this.$container.on('click', '#fe-myLocation', $.proxy(this._requestCurrentPosition, this)); // 내 위치 버튼 클릭 이벤트
    this.$container.on('click', '.fe-close-alert', $.proxy(this.customerAgentsearchComponent.hideAlertMsg, this)); // 위치 권한 미동의 '닫기' 버튼 클릭 이벤트
    this.$radiusOption.on('click', $.proxy(this._onRadiusOption, this));  // 검색반경 액션시트
    this.$toggleButton.on('click', $.proxy(this._toggleButtonListOrMap, this)); // 리스트/지도 보기 이벤트
  },

  /**
   * @function
   * @param e
   * @desc 리스트/지도 보기 버튼 토글
   */
  _toggleButtonListOrMap: function (e) {
    var $button = e ? $(e.currentTarget) : this.$toggleButton;
    $button = $button.find('button');
    var currentName = $button.text();
    var toggleName = $button.data('toggleName');

    if ($button.hasClass('btn-display-list')) {
      $button.removeClass('btn-display-list').addClass('btn-display-map');
      this._setListOpen();
    } else {
      $button.removeClass('btn-display-map').addClass('btn-display-list');
      this._setListClose();
    }
    $button.data('toggleName', currentName).text(toggleName);
  },

  _getContentH: function () {
    // var windowH = document.body.clientHeight ||  window.innerHeight;
    // var elLocation = document.querySelector('.tod-o2o-comp.map-type');
    // var reactTop = 	elLocation.getBoundingClientRect().top;
    var windowH = document.body.clientHeight ||  window.innerHeight;
    var headerH = document.querySelector('.header-wrap').clientHeight;
    var tabsH = document.querySelector('.tab-area').clientHeight;
    var filterH = document.querySelector('.tod-filter-option').clientHeight;
    var contentH =  windowH - ( headerH + tabsH + filterH );
    return contentH;
  },

  //open
  _setListOpen: function() {
    var contentH =  this._getContentH();
    var elDisplay = document.querySelector('.tod-o2o-display');

    //elDisplay.setAttribute('style', 'height:' + contentH  + 'px;' + 'transition: height .5s' );
    elDisplay.style.height =  contentH  + 'px';
    elDisplay.style.transition = 'height .5s';
    elDisplay.setAttribute('data-expanded', 'true');
  },

  _setListClose: function() {
    this.$shopInfoArea.scrollTop(0);
    var elDisplay = document.querySelector('.tod-o2o-display');
    elDisplay.style.height =  '0px';
    elDisplay.style.transition = 'height .5s';
    elDisplay.setAttribute('data-expanded', 'false');
  },

  _setSize: function() {
    var contentH =  this._getContentH();
    var elLocation = document.querySelector('.tod-o2o-comp.map-type');
    elLocation.setAttribute('style', 'height:' + contentH + 'px;');
  },
  
  _initMapList: function () {
    var elDisplay = document.querySelector('.tod-o2o-display');

    //touch event
    var isStartTop = 0, isClientY = 0, isLastY = 0;
    elDisplay.addEventListener('touchstart', function(event) {
      isStartTop = elDisplay.scrollTop;
      isClientY = event.touches[0].clientY;
    });

    elDisplay.addEventListener('touchmove', function(event) {
      isLastY = event.touches[0].clientY;
    });

    elDisplay.addEventListener('touchend', function() {
      if (isStartTop === 0 && isClientY < isLastY) {
        // this._setListClose();
        this._toggleButtonListOrMap();
      }

      if (elDisplay.getAttribute('data-expanded') === 'false' && isClientY > isLastY ) {
        // this._setListOpen();
        this._toggleButtonListOrMap();
      }
    }.bind(this));
  },

  /**
   * @function
   * @desc 현재위치 조회(app/web)
   */
  _requestCurrentPosition: function () {
    this._locationInfoComponent.getCurrentLocation($.proxy(function (res) {
      this._location = res; // 현재 좌표 저장
      /*this._location = {  // 3Km 에 매장 있는거
        longitude: 127.3015055,
        latitude: 37.4038252
      };*/
      /*this._location = {  // 3Km 안에 매장 없는거
        longitude: 126.3015055,
        latitude: 37.4038252
      };*/
      // TEST
      /*this._location = {
        longitude: 126.972909742675,
        latitude: 37.27518614951867
      };*/
      // App 인 경우 높이값 조정 필요.
      if (Tw.BrowserHelper.isApp()) {
        this.$shopInfoArea.css('min-height', '234px');
      }
      this._firstTimeFindNearShop();
    }, this), $.proxy(function () { // 위치정보 실패시
      if (Tw.BrowserHelper.isApp()) {
        this._notAgreeLocation();
        return;
      }
      // (web인 경우만! app은 네이티브에서 알럿 메시지 띄어줌.) 위치확인 실패 시 알럿. IOS, Android 메시지 분리
      var msg = Tw.BrowserHelper.isIos() ? Tw.CUSTOMER_MOBILEWEB_GPSOFF.IOS_MSG : Tw.CUSTOMER_MOBILEWEB_GPSOFF.AOS_MSG;
      this._popupService.openAlert(msg, Tw.CUSTOMER_MOBILEWEB_GPSOFF.TITLE, null,
        $.proxy(this._notAgreeLocation, this)); // '확인' 버튼 콜백
    }, this));
  },

  /**
   * @function
   * @desc 위치권한 동의 여부 BFF로 부터 조회 후 미동의시 동의 받기 위한 팝업 발생
   * @param  {Object} location - 현재 위치 좌표
   */
  _checkLocationAgreement: function () {
    // 만 14세 미만 일때
    if (!this._isAcceptAge) {
      return this._notAgreeLocation();
    }
    this._locationInfoComponent.checkLocationAgreement($.proxy(this._requestCurrentPosition, this), $.proxy(this._showPermission, this));
  },

  /**
   * @function
   * @desc 위치정보 이용동의 받기 위한 팝업 노출
   * @param  {Object} location - 좌표값
   */
  _showPermission: function () { // 위치정보 이용동의를 위한 팝업 보여줌
    // 이전에 미동의 클릭한 기록이 있으면 비노출.
    var key = 'hideLocationNot_' + this._svcInfo.userId;
    var value = Tw.BrowserHelper.isApp() ? Tw.CommonHelper.getLocalStorageExpire(key) : Tw.CommonHelper.getCookie(key);
    if (!!value) {
      this._notAgreeLocation();
      return;
    }

    this._popupService.open({
      title: Tw.BRANCH.PERMISSION_TITLE,
      title_type: 'sub',
      cont_align: 'tl',
      contents: Tw.BRANCH.PERMISSION_DETAIL,
      infocopy: [{
        info_contents: Tw.BRANCH.DO_YOU_AGREE,
        bt_class: 'fe-view-term bt-blue1'
      }],
      bt_b: [{
        style_class: 'pos-left fe-close', // fe-close를 fe-disAgree로 변경해야 될듯
        txt: Tw.BRANCH.DISAGREE
      }, {
        style_class: 'bt-red1 pos-right fe-agree',
        txt: Tw.BRANCH.AGREE
      }]
    }, $.proxy(function (root) {
      root.find('.fe-view-term').find('button').text(Tw.BRANCH.VIEW_LOCATION_TERM);
      root.on('click', '.fe-view-term', $.proxy(function () {
        Tw.CommonHelper.openTermLayer2(15);
      }, this));

      // 위치정보 미동의
      root.on('click', '.fe-close', $.proxy(function () { // fe-close를 fe-disAgree로 변경해야 될듯
        this._popupService.close();

        // 닫기 버튼 클릭 시 일주일(7일) 동안 비노출 함
        // var key = 'hideLocationNot_' + this._svcInfo.userId;
        var expireDay = 7;  // 만료 기간(일)
        // App 인 경우 cookie 에 저장하면 지워져서, app = localStorage, web = cookie에 저장한다.
        if (Tw.BrowserHelper.isApp()) {
          Tw.CommonHelper.setLocalStorageExpire(key, 'Y', expireDay);
        } else {
          Tw.CommonHelper.setCookie(key, 'Y', expireDay);
        }

        this._notAgreeLocation();
      }, this));

      // 위치정보 동의. 다음 스텝 진행한다.
      root.on('click', '.fe-agree', $.proxy(function () {
        this._popupService.close();
        this.customerAgentsearchComponent.request(Tw.API_CMD.BFF_03_0022, {twdLocUseAgreeYn: 'Y'})
          .done($.proxy(this._requestCurrentPosition, this));
      }, this));
    }, this), null , 'mainAuto');
  },

  /**
   * @function
   * @desc 만14세미만 or 위치확인 미동의 or 불가 시, 지도 비노출, Tshop 매장 리스트 노출
   */
  _notAgreeLocation: function () {
    this._isNotAgreeLocation = true;  // 위치 미동의 설정
    this._customerAgentsearch.searchTShop(function (res){
      this._customerAgentsearch.layout({
        type: 2,
        res: res.result,
        isDeleteAppend: res.isDeleteAppend
      });
    }.bind(this));
  },


  /**
   * @function
   * @desc 최초 진입시 주변 매장 검색 요청(최초 500m 내의 검색반경 내의 지점/대리점이 없을 경우 1km/3km의 검색 진행)
   * @param location
   */
  _firstTimeFindNearShop: function () {
    // OP002-8862 최초 500m 내의 검색반경 내의 지점/대리점이 없을 경우 1km/3km의 검색 진행
    var options = this._getOptions();
    var i = 0;
    var self = this;
    var funcRequest = function (option) {
      var param = $.extend(this._lastParam, {
        storeType: this.getStoreType(),
        currLocX: this._location.longitude,
        currLocY: this._location.latitude,
        distance: option.distance
      });
      this._requestNearShop(param).done(function (res) {
        // 주변 매장 리스트가 없을 때
        if (Tw.FormatHelper.isEmpty(res.result.regionInfoList)) {
          var next = options[i++];
          if (next) {
            funcRequest(next);
            return;
          }
        }
        this._nearShops = res.result.regionInfoList;
        this.$radiusOption.text(option.txt).data('option',option);
        // 매장 결과 없을 때
        if (Tw.FormatHelper.isEmpty(this._nearShops)) {
          // 반경 3km 이상에 매장 없을 때만 Tshop 매장 리스트 조회한다.
          if (option.distance >= 3000) {
            this._customerAgentsearch.$keyword[0].focus();
            this._customerAgentsearch.searchTShop(function (res){
              self._customerAgentsearch.layout({
                type: 8,
                error: 'error1',
                res: res.result,
                isDeleteAppend: res.isDeleteAppend
              });
            });
            return;
          }
          self._customerAgentsearch.layout({
            type: 6
          });
          // 반경 3km 이내일 때
          this._initMap();
          var $desc = this.$noShop.find('.desc');
          var desc = $desc.data('desc');
          var arrDistance = option.txt.split(' ');
          desc = desc.replace('{distance}', [arrDistance[1],arrDistance[0]].join(' '));
          $desc.html(desc);
          return;
        }
        // 매장 있을 때
        self._customerAgentsearch.layout({
          type: 1,
          res: res.result
        });

        // 단축 URL로 진입 시 "리스트" 보기 인 경우
        if (this._query.showList === 'Y' && !this.$toggleButton.data('shortcut')) {
          this.$toggleButton.trigger('click');
          this.$toggleButton.data('shortcut', 'Y');
        }

        this._initMap();
      }.bind(this));
    }.bind(this);

    funcRequest(options[i++]);
  },

  filterSearchRequest: function (params) {
    // todo JK : 바뀔 가능성 많음. 리셋 시 처음 데이터 보여주기.
    if (_.keys(params).length === 1 && params.storeType === this._customerAgentsearch.getStoreTypeByQuery()) {
      this._customerAgentsearch.layout({
        type: 1,
        res: {
          regionInfoList: this._nearShops,
          totalCount: this._nearShops.length
        }
      });
      this._initMap();
      return;
    }
    // 로딩 표시
    this._customerAgentsearch.layout({
      type: 3
    });

    var distance = this._getOptions()[0].distance;
    var i = 0;
    var options = _.filter(this.customerAgentsearchComponent.getRadiusList(), function (item) {
      return item.distance >= distance;
    });
    // 800Km 추가
    options.push({
      distance : 800 * 1000
    });

    var funcRequest = function (option) {
      this._lastParam = $.extend(params, {
        currLocX: this._location.longitude,
        currLocY: this._location.latitude,
        distance: option.distance
      });

      this._requestNearShop(this._lastParam).done(function (res) {
        // 주변 매장 리스트가 없을 때
        if (Tw.FormatHelper.isEmpty(res.result.regionInfoList)) {
          var next = options[i++];
          if (next) {
            funcRequest(next);
            return;
          }
        }

        var nearShops = res.result.regionInfoList;
        // 전체 반경 800km 안에 전체 매장 결과 없을 때.
        if (nearShops.length < 1) {
          this._customerAgentsearch.layout({
            type: 5,
            error: 'error4'
          });
          return;
        }
        // 반경 3km 이내에 매장 있는 경우
        if (option.distance < 800 * 1000) {
          this._customerAgentsearch.layout({
            type: 1,
            res: res.result
          });
          this._initMap(nearShops);
        } else { // 반경 3km 이내에는 매장이 없지만, 800km 안에는 매장이 있을 때
          this._customerAgentsearch.layout({
            type: 4,
            error: 'error3',
            res: res.result,
            isAllList: true
          });
        }
        this._popupService.close();
      }.bind(this));
    }.bind(this);

    funcRequest(options[i++]);
  },

  /**
   * @function
   * @param param{Object} 요청 파라미터
   * @desc 주변 매장 검색 요청
   */
  _requestNearShop: function (param) {
    var self = this;
    return {
      done: function (func) {
        return self._requestPromise(Tw.API_CMD.BFF_08_0008, param).done(func).fail(function(res){
          Tw.Error(res.code, res.msg).pop();
          self._customerAgentsearch.layout({
            type: 1,
            res: res.result
          });
        });
      }
    };
  },

  /**
   * @function
   * @returns {*}
   * @desc 반경 옵션. 근처 매장 정보가 있는 경우에는 최근 선택한 반경 옵션을 리턴하고,
   * 최초 조회인 경우는 전체 옵션 정보(500m, 1Km, 3Km) 를 리턴한다.
   */
  _getOptions: function () {
    return this._nearShops ? [this.$radiusOption.data('option')] : this.customerAgentsearchComponent.getRadiusList();
  },

  /**
   * @function
   * @returns {number}
   * @desc 매장유형 리턴. 0:전체, 1:지점, 2: 대리점
   */
  getStoreType : function () {
    if (!Tw.FormatHelper.isEmpty(this._lastParam.storeType)) {
      return this._lastParam.storeType;
    }
    return this._customerAgentsearch.getStoreTypeByQuery();
  },

  /**
   * @function
   * @desc 지도영역 초기화, 주변 매장 검색이 완료되면 이를 tmap 상의 layer에 marker로 표시
   * @param{array} shopList
   */
  _initMap: function (shopList) {
    shopList = !shopList ? this._nearShops : shopList;
    // 위치 권한 미동의 인 경우 지도 생성 안함.
    if (this._isNotAgreeLocation) {
      return;
    }
    // Tmap 생성
    this._tmapMakerComponent.makeTmap($.extend({
      id: 'fe-tmap-box',
      width: '100%',
      // height: '683px',
      height: this.$container.find('#fe-tmap-box').width() + 'px',
      zoom: this.$radiusOption.data('option').zoom
    }, this._location))
      .makeMarker($.extend({ // 마커 생성
        icon: Tw.TMAP.COMPASS, //Marker의 아이콘.
        width: 38
      }, this._location));

    var map = this._tmapMakerComponent;
    /**
     * 지도의 마커가 선택된 매장 정보 보여주기
     * 1 : 전체 매장 리스트에서 마커가 선택된 매장을 찾아서 삭제 및 해당 매장 데이터 추출.
     * 2 : 전체 매장 리스트의 최 상단에 방금 선택한 매장을 추가해준다.
     */
    var funcSelectShop = function (locCode) {
      if (!locCode) {
        return;
      }
      var selectIndex = _.findIndex(shopList, function (shop) {
        return shop.locCode === locCode;
      });
      if (selectIndex < 0){
        return;
      }
      var cloneShops = _.clone(shopList);
      var removeShop = cloneShops.splice(selectIndex, 1);
      cloneShops.unshift(removeShop[0]);
      this._customerAgentsearch.layout({
        type: 1,
        res: {
          regionInfoList: cloneShops,
          totalCount: cloneShops.length
        }
      });
    }.bind(this);

    // 마커 선택 표시 및 선택된 마커의 매장 정보 조회
    var funcCheckMarker = function (locCode) {
      // 현재 선택한 마커는 선택표시, 제외한 나머지 마커를 기본 마커로 변경
      var currentMarker = map.getSelectedMarker();
      if (currentMarker.options.locCode === locCode) {
        return;
      }
      map.markerSelect(locCode);
      funcSelectShop(locCode);
    };

    // 지점 대리점 리스트 전체 마커 생성
    shopList.forEach(function (shop, idx) {
      // 마커 파라미터
      var markerParam = {
        latitude: shop.geoY,
        longitude: shop.geoX,
        event: [
          {name: 'click', func: funcCheckMarker.bind(this, shop.locCode)}
        ],
        options: {
          locCode : shop.locCode
        }
      };
      // 첫번째 마커를 제외한, 나머지 마커는 비선택 아이콘으로 설정한다.
      if (idx > 0) {
        $.extend(markerParam, {
          iconType: Tw.TmapMakerComponent.ICON_TYPE.UN_CHECK
        });
      }
      this._tmapMakerComponent.makeMarker(markerParam);
    }.bind(this));
  },

  /**
   * @function
   * @desc 검색반경(500m/1km/3km) option 선택을 위한 actionsheet 발생
   */
  _onRadiusOption: function (e) {
    this._popupService.open({
        hbs: 'actionsheet01',
        layer: true,
        data: Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_NEAR_LOCATION,
        btnfloating: {'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
      }, $.proxy(function ($root) {
        Tw.CommonHelper.focusOnActionSheet($root);
        // 검색반경 체크
        var $target = $(e.currentTarget);
        $root.find('input#' + $target.data('option').id).prop('checked', true);
        $root.on('click', 'input[type=radio]', $.proxy(function (e1) { // 라디오 버튼 클릭 이벤트
          var $current = $(e1.currentTarget);
          this._popupService.close();
          if ($target.data('option').id === $current.data('option').id) {
            return;
          }
          $target.text($current.parents('label').text()).data('option', $current.data('option'));
          this._firstTimeFindNearShop();
        }, this));
      }, this),
      null,
      null,
      $(e.currentTarget));
  },

  _requestPromise: function (bff, param) {
    var $def = $.Deferred();
    this._apiService.request(bff, param).done(function (res){
      if (res.code !== Tw.API_CODE.CODE_00) {
        $def.reject(res);
      }else {
        $def.resolve(res);
      }
    });

    return $def.promise();
  }
};

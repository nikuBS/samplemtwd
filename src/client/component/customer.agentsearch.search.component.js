/**
 * @file 지점/대리점 화면 component
 * @author 양정규
 * @since 2020-08-14
 */

/**
 * @constructor
 * @param rootEl
 * @param svcInfo
 */
Tw.CustomerAgentsearchComponent = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this._svcInfo = svcInfo;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;

  this._init();
};

Tw.CustomerAgentsearchComponent.prototype = {

  _init: function () {
    this._cacheElements();
    this._bindEvents();
  },

  /**
   * @function
   * @desc DOM caching
   */
  _cacheElements: function () {
    this.$locationAlert = this.$container.find('.fe-location-alert');  // 위치정보 미동의 시 보이는 알럿 영역
    this.$loading = this.$container.find('.fe-loading');  // 로딩
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$container.on('click', '.fe-branch-detail', $.proxy(this.onBranchDetail, this));
    this.$container.on('click', '.fe-tel', $.proxy(this.goTel, this));
    this.$container.on('click', '.fe-booking', $.proxy(this.goBooking, this));
    this.$container.on('click', '[data-go-url]', $.proxy(this.goLoad, this)); // 페이지 이동
    this.$container.on('click', '.fe-close-alert', $.proxy(this.hideAlertMsg, this)); // 위치 권한 미동의 '닫기' 버튼 클릭 이벤트
  },

  goTel: function (event) {
    event.preventDefault();
    event.stopPropagation();
    this._historyService.goLoad('tel:'+$(event.currentTarget).data('tel'));
  },

  showDataCharge: function (callback) {
    var cookieName = Tw.COOKIE_KEY.ON_SESSION_PREFIX + 'AGENTSEARCH';
    // app 이 아닌 경우(web)거나, 쿠키값이 있으면
    if (!Tw.BrowserHelper.isApp() || Tw.CommonHelper.getCookie(cookieName)) {
      return callback();
    }
    var confirmOk = false;
    // wifi 아닌, 3G 사용일 때 과금 팝업 실행
    Tw.CommonHelper.showDataCharge(function () { // 확인 콜백
      Tw.CommonHelper.setCookie(cookieName, 'Y'); // 쿠키에 'Y' 저장
      // 과금팝업 동의 시 실행
      callback();
      confirmOk = true;
    }.bind(this), function () { // 닫기 콜백
      if (!confirmOk) {
        this._historyService.goBack();
      }
    }.bind(this));
  },

  registerHelper: function () {
    Handlebars.registerHelper({
      /**
       * 3항 연산식
       * @param context 비교 대상 context
       * @param target  context 와 같은지 비교
       * @param trueVal 참 일때 리턴할 값
       * @param falseVal 거짓일 때 리턴할 값
       */
      ternaryOp : function(context, target, trueVal, falseVal){
        return context === target ? trueVal : falseVal;
      }
    });
  },

  // 매장 예약하기 새창
  goBooking: function (e) {
    e.preventDefault();
    e.stopPropagation();
    var $this = $(e.currentTarget);
    var url = $this.data('bookingUrl');
    if ($this.data('charge') === true) {
      this._showDataChargeExt(url);
      return;
    }
    Tw.CommonHelper.openUrlExternal(url);
  },

  _showDataChargeExt: function (url) {
    if(Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.showDataCharge(
        $.proxy(function () {
          Tw.CommonHelper.openUrlExternal(url);
        }, this)
      );
    } else {
      Tw.CommonHelper.openUrlExternal(url);
    }
    return false;
  },

  onBranchDetail: function (e) {
    e.preventDefault();
    e.stopPropagation();
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + $(e.currentTarget).data('locCode'));
  },

  // 지점/대리점 찾기 리스트 > 처리업무들
  ableTasks: function (list) {
    if (Tw.FormatHelper.isEmpty(list)) {
      return;
    }
    var self = this;
    var saveTask = function (o, key) {
      var value = o[key];
      // 유선/인터넷TV(SK브로드밴드) 의 경우, Y/N으로 주지않고 1/0 으로 줌.
      if (key === 'hanaroCode') {
        value = ('' + value === '1' ? 'Y' : 'N');
      }
      // 주차 가능 prkPsblCnt > 0
      else if (key === 'prkPsblCnt') {
        value = (!!value && parseInt(value, 10) > 0) ? 'Y':'N';
      }

      if (!!value && ('' + value).toUpperCase() === 'Y') {
        if (!o.arrAbleTask) {
          o.arrAbleTask = [];
        }
        // 낙타형식을 언더바 형식으로 변환
        /*key = key.replace('Yn', ''); // key 이름 뒤에 ~Yn 을 제거해서 string.type.js 에 있는 키와 맞춘다.
        var keyName = key.split(/(?=[A-Z])/).join('_').toUpperCase();*/
        o.arrAbleTask.push(Tw.CUSTOMER_AGENT_SEARCH.FILTER[key]);
      }
    };

    // 매장분류
    var setShopType = function (item) {
      // OP002-11979 : 매장타입 노출 수 변경. 기존 1개 -> n개. 따라서 shopTypeNm string -> array 로 타입 변경함.
      if (!item.shopTypeNm) {
        item.shopTypeNm = [];
      }
      // "매장특성구분코드", (04:T Premium Store, 06:T Flagship Store)
      switch (item.shopTpsCd) {
        case '04' : item.shopTypeNm.push('T Premium Store'); break;
        case '06' : item.shopTypeNm.push('T Flagship Store'); break;
      }
      if (item.unmanShop === 'Y') {
        item.shopTypeNm.push('무인매장');
      }
      if (item.skMagicRent && item.skMagicRent === 'Y') {
        item.skMagicRentNm = Tw.CUSTOMER_AGENT_SEARCH.FILTER['skMagicRent'];
      }
    };

    list.forEach(function (o) {
      // 처리 가능업무
      saveTask(o, 'dvcChange');
      saveTask(o, 'nmChange');
      saveTask(o, 'feeAcceptance');
      saveTask(o, 'rbpAsYn');
      saveTask(o, 'hanaroCode');
      saveTask(o, 'secuConsulting');
      saveTask(o, 'appleYn');
      saveTask(o, 'pickupYn');
      saveTask(o, 'nameTheft');
      saveTask(o, 'callHistSearch');
      saveTask(o, 'rentYn');
      saveTask(o, 'safeDealKiosk');

      // SK매직
      saveTask(o, 'skMagicRent');

      // 체험존
      saveTask(o, 'fiveGxYn');
      saveTask(o, 'vrYn');
      saveTask(o, 'dvcExprZone');

      // 교육 프로그램
      saveTask(o, 'speedYn');
      saveTask(o, 'applEduYn');
      saveTask(o, 'codingEduYn');

      // 기타
      saveTask(o, 'prkPsblCnt');
      saveTask(o, 'disSlopeYn');

      setShopType(o);
      self.reserveCounsel(o);
      if (!!o.arrAbleTask) {
        o.ableTask = o.arrAbleTask.toString();
      }
    });
  },

  // 예약상담 URL 정보
  reserveCounsel: function (item) {
    if (item.tSharpYn === 'Y') { // Tshop 예약 가능이면
      var url = Tw.Environment.environment === 'prd' ? Tw.OUTLINK.T_SHOP.PRD : Tw.OUTLINK.T_SHOP.DEV;
      url += Tw.OUTLINK.T_SHOP.RESERVE;
      item.url = Tw.StringHelper.stringf(url, this._svcInfo.userId, this._svcInfo.svcMgmtNum, item.locCode);
    } else if (''+item.agnYn === 'Y') { // 지점이면
      item.url = undefined; //decodeURIComponent(Tw.OUTLINK.BRANCH_RERSERVE + item.storeName);
      item.charge = true; // 과금팝업 띄우기
    }
    // 티샵 예약 or 일반 지점 예약 가능 여부
    item.isReserve = !!item.url;
  },

  hasStorage: function () {
    var key = 'hideLocationMsg_' + this._svcInfo.userId;
    var value = Tw.BrowserHelper.isApp() ? Tw.CommonHelper.getLocalStorageExpire(key) : Tw.CommonHelper.getCookie(key);
    return !!value;
  },

  goLoad: function (e) {
    this._historyService.goLoad($(e.currentTarget).data('goUrl'));
  },

  hideAlertMsg: function () {
    // 닫기 버튼 클릭 시 일주일(7일) 동안 비노출 함
    var key = 'hideLocationMsg_' + this._svcInfo.userId;
    var expireDay = 7;  // 만료 기간(일)
    // App 인 경우 cookie 에 저장하면 지워져서, app = localStorage, web = cookie에 저장한다.
    if (Tw.BrowserHelper.isApp()) {
      Tw.CommonHelper.setLocalStorageExpire(key, 'Y', expireDay);
    } else {
      Tw.CommonHelper.setCookie(key, 'Y', expireDay);
    }
    // 알러트 영역 비노출
    this.$locationAlert.addClass('none');
  },

  getRadiusList: function () {
    if (this.$radiusList) {
      return this.$radiusList;
    }
    this.$radiusList = _.map(Tw.POPUP_TPL.CUSTOMER_AGENTSEARCH_NEAR_LOCATION[0].list, function (o) {
      return $('<div ' + o['radio-attr'] + ' />').data('option');
    });
    return this.$radiusList;
  },

  /**
   * @function
   * @param bff
   * @param param
   * @return {{done: (function(*): *)}}
   * @desc BFF 리퀘스트. 결과가 실패이면 로딩중 화면 비노출 및 다음스텝 진행안함.
   */
  request: function (bff, param) {
    var self = this;
    var fail = function (res) {
      Tw.Error(res.code, res.msg).pop();
      self.$loading.addClass('none');
    };
    return {
      done: function (func) {
        return self._apiService.request(bff, param).done(function (res){
          if (res.code !== Tw.API_CODE.CODE_00) {
            fail(res);
            return;
          }
          func(res);
        }).fail(fail);
      }
    };
  }
};

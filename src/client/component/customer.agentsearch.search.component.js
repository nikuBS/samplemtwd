/**
 * @file 지점/대리점 화면 component
 * @author Hakjoon Sim
 * @since 2018-10-16
 * @edit 2020-06-12 양정규 OP002-8862
 */

/**
 * @constructor
 * @param  {Object} svcInfo
 */
Tw.CustomerAgentsearchComponent = function (svcInfo) {
  this._svcInfo = svcInfo;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
};

Tw.CustomerAgentsearchComponent.prototype = {

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
    // Tw.CommonHelper.openUrlInApp(url);
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
    this._historyService.goLoad('/customer/agentsearch/detail?code=' + $(e.currentTarget).attr('href'));
  },

  // 지점/대리점 찾기 리스트 > 처리업무들
  ableTasks: function (list) {
    if (Tw.FormatHelper.isEmpty(list)) {
      return;
    }
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
      // "매장특성구분코드", (04:T Premium Store, 06:T Flagship Store)
      switch (item.shopTpsCd) {
        case '04' : item.shopTypeNm = 'T Premium Store'; break;
        case '06' : item.shopTypeNm = 'T Flagship Store'; break;
      }
      if (item.unmanShop === 'Y') {
        item.shopTypeNm = '무인매장';
      }
    };

    // 예약상담 URL 정보
    var reserveCounsel = function (item) {
      // 현재 실행되고 있는 서버 종류
      var server = Tw.Environment.environment !== 'prd' ? 'dev-' : '';
      if (item.tSharpYn === 'Y') { // Tshop 예약 가능이면
        item.url = Tw.StringHelper.stringf(Tw.OUTLINK.T_SHOP_RESERVE, server, this._svcInfo.userId, this._svcInfo.svcMgmtNum, item.locCode);
      } else if (''+item.storeType === '1') { // 지점이면
        item.url = Tw.OUTLINK.BRANCH_RERSERVE;
        item.charge = true; // 과금팝업 띄우기
      }
      // 티샵 예약 or 일반 지점 예약 가능 여부
      item.isReserve = !!item.url;
    }.bind(this);


    list.forEach(function (o) {
      // 처리 가능업무
      saveTask(o, 'dvcChange');
      saveTask(o, 'rbpAsYn');
      saveTask(o, 'hanaroCode');
      saveTask(o, 'secuConsulting');
      saveTask(o, 'appleYn');
      saveTask(o, 'pickupYn');
      saveTask(o, 'nameTheft');
      saveTask(o, 'callHistSearch');
      saveTask(o, 'rentYn');

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
      reserveCounsel(o);
      if (!!o.arrAbleTask) {
        o.ableTask = o.arrAbleTask.toString();
      }
    });
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
   * @returns {{done: *}}
   * @desc BFF Request
   */
  request: function (bff, param) {
    return this._apiService.requestDone(bff, param);
  }
};

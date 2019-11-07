/**
 * @file 데이터 시간설정 공통
 * @author 양정규
 * @since 2019-09-17
 */

/**
 * @constructor
 * @desc 초기화를 위한 class
 * @param {HTMLDivElement} rootEl 최상위 element
 */
Tw.MyTData5gSetting = function (params) {
  this.$container = params.rootEl;
  this._historyService = new Tw.HistoryService(this.$container);
  this._settingData = JSON.parse(window.unescape(params.data));
  this._initialize();
};

Tw.MyTData5gSetting.prototype = {
  _initialize: function () {
    this._cachedElement();
    this._bindEvent();
    // page 유형에 따라 호출하는 인스턴스 분리
    // [OP002-4982] - 5gx 관련 기능 개선 및 오류 수정
    // CDRS 잔여량 5분 캐시로딩으로 시간권 잔여량 실제 잔여량과 차이나는 이슈 수정
    // 데이터 시간권 사용중 페이지 내 '사용 가능 시간' 페이지 진입 시, API 호출하도록 수정
    switch ( this._settingData.pageType ) {
      case  'NO_USE':
        new Tw.MyTData5gSettingMain(this.$container, this._settingData);
        break;
      case 'IN_USE':
        new Tw.MyTData5gSettingMainInuse(this.$container, this._settingData); // 이용중일 때만 생성하기
        break;
    }
  },

  /**
   * @function
   * @desc dom caching
   */
  _cachedElement: function () {
    this.$btnHistory = this.$container.find('.fe-btn_history');
    this.$btnMyTdata = this.$container.find('.fe-btn_mytdata');
  },

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$btnHistory.on('click', $.proxy(this._historyService.goLoad, this, '/myt-data/5g-setting/history'));
    this.$btnMyTdata.on('click', $.proxy(this._historyService.goLoad, this, '/myt-join/myplan'));
  },

  /*
  * 5G API 는 swing에 직접 데이터를 요청하고 전달 받는 과정 및 데이터 설정에 있어
  * 딜레이가 발생하여 일부 API 호출 후 재요청하여 처리하는 부분이 있음
   */

  /**
   * 5G 데이터 시간 전환 사용중/예약 내역 조회
   * @returns {*}
   */
  requestGetConversions: function () {
    return Tw.Api.request(Tw.API_CMD.BFF_06_0078, {});
  },

  /**
   * 5G 데이터 시간 전환 가능 잔여량 조회
   * @param reqCnt
   * @returns {*}
   */
  requestAvailableTime: function (reqCnt) {
    return Tw.Api.request(Tw.API_CMD.BFF_06_0079, { reqCnt: reqCnt });
  },

  /**
   * 5G 데이터 시간 전환
   * @param time
   */
  requestEditConversions: function (time) {
    return Tw.Api.request(Tw.API_CMD.BFF_06_0080, {
      timeUnit: time
    });
  },

  /**
   * 5G 데이터 시간 전환 사용종료
   */
  requestDelConversions: function () {
    return Tw.Api.request(Tw.API_CMD.BFF_06_0081, {});
  },

  /**
   * 실시간잔여량 조회 캐쉬 정리
   */
  clearResidualQuantity: function () {
    return Tw.Api.request(Tw.NODE_CMD.DELETE_SESSION_STORE, { apiId: Tw.SESSION_CMD.BFF_05_0001 });
  },

  /**
   * @function
   * @desc API Fail
   * @param {JSON} err
   */
  onFail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code, err.msg).pop();
  }
};

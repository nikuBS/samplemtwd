/**
 * @file product.roaming.info.barocall.js
 * @desc T로밍 > 로밍안내 > baro 통화 (RM_18)
 * @author p026951
 * @since 2019.05.15
 */

Tw.ProductRoamingBaroCall = function (rootEl) {
  this.$container = rootEl;

  this.$container = rootEl;
  this._tidLanding = new Tw.TidLandingComponent();
  this._history = new Tw.HistoryService(rootEl);
  this._apiService = Tw.Api;

  this._cachedElement();
  this._bindEvents();
};

Tw.ProductRoamingBaroCall.prototype = {
  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$iqnResult1 = this.$container.find('.fe-iqn-result1'); // 가입 버튼
    this.$iqnResult2 = this.$container.find('.fe-iqn-result2'); // 가입 버튼
    this.$iqnResult3 = this.$container.find('.fe-iqn-result3'); // 가입 버튼
  },
  _bindEvents: function () {
    this.$container.on('click', '.fe-roaming-baro-Tcall', $.proxy(this._goLoadApp, this, 'TW50000002'));
    this.$container.on('click', '.fe-inq-search', $.proxy(this._inqSearch, this));
  },
  /**
   * @function
   * @desc 상품원장으로 이동
   * @param prodId
   * @private
   */
  _goLoadProduct: function (prodId) {
    var reqUrl = '/product/callplan?prod_id=' + prodId;
    this._history.goLoad(reqUrl);
  },
  /**
   * @function
   * @desc T앱으로 이동
   * @param appId
   * @private
   */
  _goLoadApp: function (appId) {
    var reqUrl = '/product/apps/app?appId=' + appId;
    this._history.goLoad(reqUrl);
  },

  /**
   * @function
   * @desc Baro 통화 가능여부 조회
   * @param 
   * @private
   */
  _inqSearch: function () {

    // 사용자 로그인 여부 검사
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
      .done($.proxy(this._getSvcInfoRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * @function
   * @desc 사용자 정보 값 확인
   * @param joinTermCd - 01 가입 03 해지
   * @param url - 타겟 url
   * @param resp - 사용자 정보 응답 값
   * @returns {*|*|void}
   */
  _getSvcInfoRes: function(resp) {

    // 로그인 세션 없을 경우
    if (resp.code !== Tw.API_CODE.CODE_00 || Tw.FormatHelper.isEmpty(resp.result)) {
      Tw.CommonHelper.endLoading('.container');
      var targetUrl = '/product/roaming/info/barocall';

      return this._tidLanding.goLogin(targetUrl);
    }

    //baro 통화 가능여부 조회(BFF_10_0182)
    this._apiService.request(Tw.API_CMD.BFF_10_0182, { gubunCd: '01' }, {}, [this._prodId])
    .done($.proxy(this._inqSearchResp, this));
  },

  /**
   * @function
   * @desc Baro 통화 가능여부 조회 결과
   * @param resp
   * @private
   */
  _inqSearchResp: function (resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return;
    }

    var result = resp.result;
    if( (result.baroPlanYn === 'Y' && result.baroDeviceYn === 'Y' && result.baroVasYn === 'Y')
      || result.baroItem4Yn === 'Y' || result.baroItem5Yn === 'Y' ){
      this.$iqnResult1.removeClass('none');

    }else if( result.baroItem6Yn === 'Y' || result.baroItem7Yn === 'Y'){
      this.$iqnResult2.removeClass('none');
    
    }else{
      this.$iqnResult3.removeClass('none');

    }

  }
};

/**
 * @file common.postcode.last.js
 * @author Jayoon Kong
 * @since 2018.11.13
 * @desc 우편번호 조회 컴포넌트, 풀팝업으로 되어 있음 (3/3)
 */


/**
 * @namespace
 * @desc 우편번호 3페이지 namespace
 * @param $container - 우편번호 호출한 부모페이지
 * @param $target - 우편번호 풀팝업 객체
 * @param $addressObject - 2페이지에서 넘어온 데이터
 * @param $callback - 우편번호 검색 완료 후 처리할 callback function
 */
Tw.CommonPostcodeLast = function ($container, $target, $addressObject, $callback) {
  this.$container = $container;
  this.$target = $target;
  this.$callback = $callback;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._inputHelper = Tw.InputHelper;

  this._init($addressObject);
};

Tw.CommonPostcodeLast.prototype = {
  /**
   * @function
   * @desc 2페이지에서 다음 버튼 클릭 시 팝업 load
   * @param $addressObject - 2페이지에서 넘어온 데이터
   */
  _init: function ($addressObject) {
    this._popupService.open({
        hbs: 'CO_UT_05_04_03'
      },
      $.proxy(this._onLastEvent, this, $addressObject),
      $.proxy(this._saveAddress, this),
      'post0003',
      this.$target
    );
  },
  /**
   * @function
   * @desc event binding
   * @param $addressObject - 2페이지에서 넘어온 데이터
   * @param $layer - 우편번호 팝업 객체
   */
  _onLastEvent: function ($addressObject, $layer) {
    this.$layer = $layer;

    this._setInitTab($addressObject);
    this._initVariables($addressObject.tabId);
    this._initData($addressObject);
    this._bindEvent();
  },
  /**
   * @function
   * @desc 우편번호 검색 최종 결과 저장
   */
  _saveAddress: function () {
    if (this.$isNext) { // 완료 시
      this.$target.focus();

      if (this.$callback) { // 호출된 페이지에서 콜백을 보냈으면 콜백에 정보 전달
        this.$callback(this.$saveAddress);
      } else { // 콜백이 없으면 부모페이지의 클래스명 찾아서 선택된 정보 셋팅
        this.$container.find('.fe-zip').val(this.$saveAddress.zip);
        this.$container.find('.fe-main-address').val(this.$saveAddress.main);
        this.$container.find('.fe-detail-address').val(this.$saveAddress.detail);
      }
    }
    this._setFocus();
  },
  /**
   * @function
   * @desc popup close 시 원래 페이지로 focus 이동
   */
  _setFocus: function () {
    this.$target.focus();
  },
  /**
   * @function
   * @desc tab 처리
   * @param $addressObject - 2페이지에서 넘어온 데이터
   */
  _setInitTab: function ($addressObject) {
    var $selectedTarget = this.$layer.find('#' + $addressObject.tabId);
    $selectedTarget.attr({ 'aria-selected': 'true', 'aria-hidden': 'false' }); // 웹접근성
    $selectedTarget.siblings().addClass('none').attr({ 'aria-selected': 'false', 'aria-hidden': 'true' }); // 웹접근성
  },
  /**
   * @function
   * @desc 변수 초기화
   * @param $targetId
   */
  _initVariables: function ($targetId) {
    this._selectedTabId = $targetId;
    this.$isNext = false;
    this.$selectedTab = this.$layer.find('#' + $targetId + '-tab');
    this.$mainAddress = this.$selectedTab.find('.fe-main');
    this.$number = this.$selectedTab.find('.fe-number');
    this.$building = this.$selectedTab.find('.fe-building');
    this.$zip = this.$selectedTab.find('.fe-zip');
    this.$detailAddress = this.$selectedTab.find('.fe-address');
    this._postType = this.$selectedTab.attr('data-type');
    this.$saveBtn = this.$layer.find('.fe-save');
    this.$saveAddress = {};
  },
  /**
   * @function
   * @desc 2페이지에서 넘어온 데이터 셋팅
   * @param $addressObject - 2페이지에서 넘어온 데이터
   */
  _initData: function ($addressObject) {
    this.$mainAddress.text($addressObject.originText)
      .attr({
        'data-bld-cd': $addressObject.bldCd,
        'data-ldong-cd': $addressObject.ldongCd,
        'data-origin': $addressObject.originText
      });
    this.$number.text($addressObject.number);
    this.$building.text($addressObject.building);
    this.$zip.text($addressObject.zip);
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$layer.on('keyup', '.fe-address', $.proxy(this._checkIsAbled, this));
    this.$layer.on('click', '.fe-close-all', $.proxy(this._close, this));
    this.$saveBtn.click(_.debounce($.proxy(this._getStandardAddress, this), 500));
  },
  /**
   * @function
   * @desc 필수 입력 필드 체크 및 버튼 활성화/비활성화 처리
   * @param event
   */
  _checkIsAbled: function (event) {
    var $address = $(event.currentTarget).val();
    if (Tw.FormatHelper.isEmpty($.trim($address))) {
      this.$saveBtn.attr('disabled', 'disabled');
    } else {
      this.$saveBtn.removeAttr('disabled');
    }
    this._checkIsEnter(event);
  },
  /**
   * @function
   * @desc 이동 버튼 및 엔터 클릭 시 저장버튼으로 이동
   * @param event
   */
  _checkIsEnter: function (event) {
    if (Tw.InputHelper.isEnter(event)) {
      this.$layer.find('.fe-save').focus();
    }
  },
  /**
   * @function
   * @desc 표준주소 조회 API 호출
   * @param e
   */
  _getStandardAddress: function (e) {
    var $apiName = this._getStandardApiName();
    var $reqData = this._getStandardReqData();
    var $target = $(e.currentTarget);

    this._apiService.request($apiName, $reqData)
      .done($.proxy(this._success, this, $target))
      .fail($.proxy(this._fail, this, $target));
  },
  /**
   * @function
   * @desc 표준주소 API name 조회
   * @returns {Tw.API_CMD.BFF_01_0012|{path, method}}
   * @private
   */
  _getStandardApiName: function () {
    var apiName = Tw.API_CMD.BFF_01_0012; // 도로명
    if (this._selectedTabId === 'tab2') {
      apiName = Tw.API_CMD.BFF_01_0013; // 지번
    }
    return apiName;
  },
  /**
   * @function
   * @desc 표준주소 API 요청 파라미터 생성
   * @returns {{postType: *, bldCd, baseAddress: string, detailAddress: string, ldongCd}}
   */
  _getStandardReqData: function () {
    return {
      postType: this._postType,
      bldCd: this.$mainAddress.attr('data-bld-cd'),
      baseAddress: encodeURI(this.$mainAddress.attr('data-origin') + ' ' + this.$number.text()),
      detailAddress: encodeURI($.trim(this.$detailAddress.val())),
      ldongCd: this.$mainAddress.attr('data-ldong-cd')
    };
  },
  /**
   * @function
   * @desc 표준주소 API 응답 처리
   * @param $target
   * @param res
   */
  _success: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._save(res.result);
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc 표준주소 API error 처리
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  /**
   * @function
   * @desc object에 조회된 결과 저장
   * @param $result
   */
  _save: function ($result) {
    var code = this._getStandardCode($result);

    this.$isNext = true;
    this.$saveAddress = {
      zip: $result.zip,
      main: code.main,
      detail: code.sub,
      addrId: $result.addrId
    };
    this._close();
  },
  /**
   * @function
   * @desc get code
   * @param $result
   * @returns {{main: *, sub: *}}
   */
  _getStandardCode: function ($result) {
    var code = { // 도로명
      main: $result.jusoMain,
      sub: $result.jusoSub
    };
    if (this._selectedTabId === 'tab2') { // 지번
      if ($result.stnmAddrFix === '') {
        code.main = $result.bunjiAddrFix;
        code.sub = $result.bunjiAddrDtl;
      } else {
        code.main = $result.stnmAddrFix;
        code.sub = $result.stnmAddrDtl;
      }
    }
    return code;
  },
  /**
   * @function
   * @desc 우편번호 전체 종료
   */
  _close: function () {
    this._popupService.closeAll(this.$container, this.$target);
  }
};
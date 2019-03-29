/**
 * FileName: common.postcode.last.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.11.13
 * Description: 우편번호 조회 컴포넌트, 풀팝업으로 되어 있음 (3/3)
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
  _init: function ($addressObject) {
    // 2페이지에서 다음 버튼 클릭 시 팝업 load
    this._popupService.open({
        hbs: 'CO_UT_05_04_03'
      },
      $.proxy(this._onLastEvent, this, $addressObject),
      $.proxy(this._saveAddress, this),
      'post0003',
      this.$target
    );
  },
  _onLastEvent: function ($addressObject, $layer) {
    this.$layer = $layer;

    this._setInitTab($addressObject);
    this._initVariables($addressObject.tabId);
    this._initData($addressObject);
    this._bindEvent();
  },
  _saveAddress: function () {
    if (this.$isNext) { // 완료 시
      this.$target.focus();

      if (this.$callback) { // 호출된 페이지에서 콜백을 보냈으면 콜백에 정보 전달
        this.$callback(this.$saveAddress);
      } else { // 콜백이 없으면 바닥페이지의 클래스명 찾아서 선택된 정보 셋팅
        this.$container.find('.fe-zip').val(this.$saveAddress.zip);
        this.$container.find('.fe-main-address').val(this.$saveAddress.main);
        this.$container.find('.fe-detail-address').val(this.$saveAddress.detail);
      }
    }
  },
  _setInitTab: function ($addressObject) {
    var $selectedTarget = this.$layer.find('#' + $addressObject.tabId);
    $selectedTarget.attr('aria-selected', 'true');

    if ($addressObject.tabId === 'tab2') {
      $selectedTarget.css('marginLeft', '0');
    }
    $selectedTarget.siblings().attr('aria-selected', 'false');
    $selectedTarget.siblings().find('a').addClass('disabled').addClass('none');
  },
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
  _bindEvent: function () {
    this.$layer.on('keyup', '.fe-address', $.proxy(this._checkIsAbled, this));
    this.$layer.on('click', '.fe-save', $.proxy(this._getStandardAddress, this));
  },
  _checkIsAbled: function (event) {
    var $address = $(event.currentTarget).val();
    if (Tw.FormatHelper.isEmpty($.trim($address))) {
      this.$saveBtn.attr('disabled', 'disabled');
    } else {
      this.$saveBtn.removeAttr('disabled');
    }
    this._checkIsEnter(event);
  },
  _checkIsEnter: function (event) {
    if (Tw.InputHelper.isEnter(event)) {
      this.$layer.find('.fe-save').focus();
    }
  },
  _getStandardAddress: function (e) {
    var $apiName = this._getStandardApiName();
    var $reqData = this._getStandardReqData();
    var $target = $(e.currentTarget);

    this._apiService.request($apiName, $reqData)
      .done($.proxy(this._success, this, $target))
      .fail($.proxy(this._fail, this, $target));
  },
  _getStandardApiName: function () {
    var apiName = Tw.API_CMD.BFF_01_0012;
    if (this._selectedTabId === 'tab2') {
      apiName = Tw.API_CMD.BFF_01_0013;
    }
    return apiName;
  },
  _getStandardReqData: function () {
    return {
      postType: this._postType,
      bldCd: this.$mainAddress.attr('data-bld-cd'),
      baseAddress: encodeURI(this.$mainAddress.attr('data-origin')),
      detailAddress: encodeURI($.trim(this.$detailAddress.val())),
      ldongCd: this.$mainAddress.attr('data-ldong-cd')
    };
  },
  _success: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._save(res.result);
    } else {
      this._fail($target, res);
    }
  },
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  _save: function ($result) {
    var code = this._getStandardCode($result);

    this.$isNext = true;
    this.$saveAddress = {
      zip: $result.zip,
      main: code.main,
      detail: code.sub,
      addrId: $result.addrId
    };

    this._popupService.close();
  },
  _getStandardCode: function ($result) {
    var code = {
      main: $result.jusoMain,
      sub: $result.jusoSub
    };
    if (this._selectedTabId === 'tab2') {
      if ($result.stnmAddrFix === '') {
        code.main = $result.bunjiAddrFix;
        code.sub = $result.bunjiAddrDtl;
      } else {
        code.main = $result.stnmAddrFix;
        code.sub = $result.stnmAddrDtl;
      }
    }
    return code;
  }
};
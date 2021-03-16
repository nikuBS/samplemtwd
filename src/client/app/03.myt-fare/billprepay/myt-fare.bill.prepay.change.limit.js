/**
 * @file myt.fare.bill.prepay.change.limit.js
 * @author Jayoon Kong
 * @since 2018.10.09
 * @desc 소액결제/콘텐츠이용료 한도변경
 */

/**
 * @namespace
 * @desc 소액결제/콘텐츠이용료 한도변경 namespace
 * @param rootEl - dom 객체
 * @param title - 소액결제/콘텐츠이용료
 * @param $target - 현재 객체를 호출한 엘리먼트(ex: button)의 currentTarget
 */
Tw.MyTFareBillPrepayChangeLimit = function (rootEl, title, $target) {
  this.$container = rootEl;
  this.$title = title;
  this.$target = $target;
  this.$isClicked = false;
  this._isUnpaid = 'N';
  this._isAdult = 'Y';  // OP002-7282. 미성년자 여부 추가(콘텐츠 이용요금 일때만 사용하기)

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._historyService = new Tw.HistoryService(rootEl);
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-change'));
  this._init();
};

Tw.MyTFareBillPrepayChangeLimit.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this._getLimit();

    this.$monthSelector = null;
    this.$daySelector = null;
    this.$onceSelector = null;
  },
  /**
   * @function
   * @desc 한도 조회 API 호출
   */
  _getLimit: function () {
    var $target = this.$container.find('.tw-popup-closeBtn');
    var apiName = this._getLimitApiName();

    this._apiService.request(apiName, {})
      .done($.proxy(this._getLimitSuccess, this, $target))
      .fail($.proxy(this._fail, this, $target));
  },
  /**
   * @function
   * @desc 한도조회 api name 조회
   * @returns {string}
   */
  _getLimitApiName: function () {
    var apiName = '';
    if (this.$title === 'small') {
      apiName = Tw.API_CMD.BFF_05_0080; // 소액결제
    } else {
      apiName = Tw.API_CMD.BFF_05_0066; // 콘텐츠이용료
    }
    return apiName;
  },
  /**
   * @function
   * @desc 한도조회 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _getLimitSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var result = res.result;
      this._isUnpaid = result.isUnpaid;
      // 콘텐츠 이용요금 일때만 사용
      this._isAdult = this.$title === 'contents' && (result.isAdult || 'Y');
      this._changeLimit(result);
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc 한도조회 API 응답 처리 (실패)
   */
  _getLimitFail: function () {
    this._popupService.openOneBtTypeB(
      Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_CHANGE_LIMIT,
      Tw.ALERT_MSG_MYT_FARE.NOT_ALLOWED_INFO_MESSAGE,
      [{
        style_class: 'fe-payment',
        txt: Tw.ALERT_MSG_MYT_FARE.GO_PAYMENT
      }],
      'type1',
      $.proxy(this._openLimitFail, this),
      null
    );
  },
  /**
   * @function
   * @desc 한도조회 실패 시 처리
   * @param $layer
   */
  _openLimitFail: function ($layer) {
    $layer.on('click', '.fe-payment', $.proxy(this._goSubmain, this));
  },
  /**
   * @function
   * @desc 서브메인 페이지로 이동
   */
  _goSubmain: function () {
    this._historyService.replaceURL('/myt-fare/submain');
  },
  /**
   * @function
   * @desc 한도변경 팝업 load
   * @param result
   */
  _changeLimit: function (result) {
    var hbsName = 'MF_06_02'; // 소액결제 한도변경
    if (this.$title === 'contents') {
      hbsName = 'MF_07_02'; // 콘텐츠이용료 한도변경
    }
    this._popupService.open({
      'hbs': hbsName
    }, $.proxy(this._openChangeLimit, this, result), null, 'change-limit', this.$target); // 한도변경 팝업
  },
  /**
   * @function
   * @desc 한도변경 팝업 load 후 init
   * @param result
   * @param $layer
   */
  _openChangeLimit: function (result, $layer) {
    this._initLayerVar($layer);
    this._setLimitData(result, $layer);
    this._setLimitEvent($layer);
  },
  /**
   * @function
   * @desc initialize variable
   * @param $layer
   */
  _initLayerVar: function ($layer) {
    this.$changeBtn = $layer.find('.fe-change');
  },
  /**
   * @function
   * @desc 한도 셋팅
   * @param result
   * @param $layer
   */
  _setLimitData: function (result, $layer) {
    this.$monthSelector = $layer.find('.fe-month'); // 월 한도
    this.$daySelector = $layer.find('.fe-day'); // 일 한도
    this.$onceSelector = $layer.find('.fe-once'); // 1회 한도

    var monthLimit = '';
    if (this.$title === 'small') {
      monthLimit = 'microPayLimitAmt'; // 소액결제
    } else {
      monthLimit = 'monLimit'; // 콘텐츠이용료
    }

    this.$monthSelector
      .attr({ 'id': result[monthLimit], 'origin-value': result[monthLimit] })
      .text(this._getLittleAmount(result[monthLimit]));
    this.$daySelector
      .attr({ 'id': result.dayLimit, 'origin-value': result.dayLimit })
      .text(this._getLittleAmount(result.dayLimit));
    this.$onceSelector
      .attr({ 'id': result.onceLimit, 'origin-value': result.onceLimit })
      .text(this._getLittleAmount(result.onceLimit));
  },
  /**
   * @function
   * @desc event binding
   * @param $layer
   */
  _setLimitEvent: function ($layer) {
    $layer.on('click', '.fe-month', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-day', $.proxy(this._selectAmount, this));
    $layer.on('click', '.fe-once', $.proxy(this._selectAmount, this));
    this.$changeBtn.click(_.debounce($.proxy(this._openChangeConfirm, this), 500));
    // 이용약관 팝업 띄우기
    this.$container.on('click', '.fe-open-pop', function(){
      Tw.CommonHelper.openTermLayer(35);
    });
  },
  /**
   * @function
   * @desc 금액 list 셋팅
   * @param amount
   * @returns {string}
   */
  _getLittleAmount: function (amount) {
    var defaultValue = 50;
    if (amount > 0) {
      defaultValue = amount / 10000;
    }
    return defaultValue + Tw.CURRENCY_UNIT.TEN_THOUSAND; // 단위 바꿔서 보여주기
  },
  /**
   * @function
   * @desc 금액 list load
   * @param event
   */
  _selectAmount: function (event) {
    var $target = $(event.currentTarget);
    var $amount = $target.attr('id');
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: this._getAmountList($target),
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(this._selectPopupCallback, this, $target, $amount));
  },

  /**
   * @function
   * @desc 한도변경 금액리스트
   * @param $target
   */
  _getAmountList: function ($target){
    var data = Tw.POPUP_TPL.FARE_PAYMENT_SMALL_LIMIT; // 20-05-26 OP002-8414 : 소액/콘텐츠 이용료 한도금액 통일 되어 한개로 사용.
    var max = -1; // -1은 제한 없음을 의미
    var _getOnlyNumber = function (value) {
      if (Tw.FormatHelper.isEmpty(value)) return value;
      return value.replace(/[^0-9]/g, '');
    };
    // max 만큼 1만원 단위로 금액리스트 반환
    var _getLimitList = function (max) {
      if (Tw.FormatHelper.isEmpty(max)) return [];
      var limitList = [];
      for (var i = max; i > 0; i--) {
        limitList.push(
          { 'label-attr': 'id="' + i + '0000"', 'radio-attr': 'name="r2" id="' + i + '0000"', txt: i+Tw.CURRENCY_UNIT.TEN_THOUSAND }
        );
      }
      return [{list: limitList}];
    };

    /**
     * 1일/1회 한도 인 경우만 상위에서 선택한 금액만큼으로 최대한도 설정
     * 1일 한도 : 최대 한도 금액은 월 한도 선택한 금액만큼
     * 1회 한도 : 최대 한도 금액은 1일 한도 선택한 금액만큼
     */
    if ($target.hasClass('fe-day') || $target.hasClass('fe-once')){
      var $selector = $target.hasClass('fe-day') ? this.$monthSelector : this.$daySelector;
      data = _getLimitList(_getOnlyNumber($selector.text()));
    }
    // 20.4.7 OP002-7282. 콘텐츠 이용료 이면서, 미성년자인 경우 최대한도 10만원
    if (this.$title === 'contents' && this._isAdult !== 'Y') {
      max = (max === -1) || max > 10 ? 10 : max;
    }
    if (max > 0) {
      data = [
        {
          list : _.filter(data[0].list, function(item) {
            return parseInt(item.txt.replace(/[^0-9]/g, ''), 10) <= max;
          })
        }
      ];
    }

    return data;
  },

  /**
   * @function
   * @desc actionsheet event binding
   * @param $target
   * @param $amount
   * @param $layer
   */
  _selectPopupCallback: function ($target, $amount, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성

    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
  },
  /**
   * @function
   * @desc 선택된 값 처리
   * @param $target
   * @param event
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr('id', $selectedValue.attr('id'));
    $target.text($selectedValue.parents('label').text());
    this._changeAmountByMonth($target);
    this._checkIsChanged();
    this._popupService.close();
  },

  /**
   * @function
   * @desc OP002-8414 매달/1일/1회 한도 금액 변경시 상위 한도 금액에 따라 하위 금액 영향.
   * @param $target
   */
  _changeAmountByMonth: function ($target) {
    var changeAmount = function (selector) {
      var currentAmount = parseInt(selector.attr('id'), 10);
      var targetAmount = parseInt($target.attr('id'), 10);
      // 하위 한도 금액이 상위 한도 금액 보다 큰 경우만 현재 한도 금액을 상위 한도 금액 으로 변경 한다.
      if (currentAmount >  targetAmount){
        selector.attr('id', targetAmount);
        selector.text($target.text());
      }
    };

    // 매달 / 1일 한도 변경 시 하위 한도 금액 영향
    if (!$target.hasClass('fe-once')){
      changeAmount(this.$daySelector);
      changeAmount(this.$onceSelector);
    }
  },

  /**
   * @function
   * @desc 변경여부 체크 후 버튼 활성화 처리
   */
  _checkIsChanged: function () {
    if (this._isChanged()) {
      this.$changeBtn.removeAttr('disabled');
    } else {
      this.$changeBtn.attr('disabled', 'disabled');
    }
  },
  /**
   * @function
   * @desc 한도변경 확인 confirm
   * @param e
   */
  _openChangeConfirm: function (e) {
    // OP002-2293 : 미납일 경우 한도 하향만 가능
    if (this._isUnpaid === 'Y' && this._checkIsUp()){
      this._getLimitFail();
    } else {
      var $target = $(e.currentTarget);
      this._popupService.open({
        title: Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.TITLE,
        contents: Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.MSG,
        title_type: 'sub',
        link_list: [{style_class: 'fe-open-pop', txt: Tw.ALERT_MSG_MYT_FARE.ALERT_2_A96.TERMS}],
        bt_b:[
          {style_class: 'pos-left fe-close', txt: Tw.BUTTON_LABEL.CANCEL},
          {style_class: 'bt-red1 pos-right fe-change', txt: Tw.BUTTON_LABEL.CHANGE}]
      }, $.proxy(function($layer){
        // 닫기 클릭
        $layer.on('click', '.fe-close', $.proxy(this._close, this));
        // 변경하기 클릭
        $layer.on('click', '.fe-change', $.proxy(this._change, this));
      }, this), null, null, $target);
    }
  },
  /**
   * @function
   * @desc 한도변경 팝업 닫기
   */
  _close: function () {
    // this.$isChange = true;
    this._popupService.close();
  },
  /**
   * @function
   * @desc 한도변경 API 호출
   * @param $target
   */
  _change: function ($target) {
    // if (this.$isChange) {
    this._popupService.close();
    var apiName = this._changeLimitApiName();
    var reqData = this._makeRequestData();

    this.$isChanged = parseInt(this.$monthSelector.attr('id'), 10) !== parseInt(this.$monthSelector.attr('origin-value'), 10);

    this._apiService.request(apiName, reqData)
      .done($.proxy(this._changeLimitSuccess, this, $target))
      .fail($.proxy(this._fail, this, $target));
    // }
  },
  /**
   * @function
   * @desc 한도변경 api name 조회
   * @returns {string}
   */
  _changeLimitApiName: function () {
    var apiName = '';
    var isUp = this._checkIsUp();

    if (this.$title === 'small') {
      if (isUp) {
        apiName = Tw.API_CMD.BFF_05_0081; // 소액결제 한도 상향
      } else {
        apiName = Tw.API_CMD.BFF_05_0176; // 소액결제 한도 하향
      }
    } else {
      if (isUp) {
        apiName = Tw.API_CMD.BFF_05_0067; // 콘텐츠이용료 한도 상향
      } else {
        apiName = Tw.API_CMD.BFF_05_0177; // 콘텐츠이용료 한도 하향
      }
    }
    return apiName;
  },
  /**
   * @function
   * @desc 한도 상향 여부 확인
   * @returns {boolean}
   */
  _checkIsUp: function () {
    // 2019-07-15 한도 상향 기준(OP002-2290) : "월한도"를 기준으로 함.
    return parseInt(this.$monthSelector.attr('id'), 10) > parseInt(this.$monthSelector.attr('origin-value'), 10);
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @returns {{}}
   */
  _makeRequestData: function () {
    var reqData = {};

    reqData.chgMLimit = this.$monthSelector.attr('id');
    reqData.chgDLimit = this.$daySelector.attr('id');
    reqData.chgOLimit = this.$onceSelector.attr('id');

    // 2019-08-26 OP002-3444 : 소액결제 한도변경(상/하향) 일 때, microPayLimitAmt(월한도) 값 추가됨.
    if (this.$title === 'small') {
      reqData.microPayLimitAmt = this.$monthSelector.attr('origin-value');
    }

    return reqData;
  },
  /**
   * @function
   * @desc 한도변경 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _changeLimitSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (this.$isChanged) {
        this._setRemainAmount();
      }
      this._popupService.close();
      this._commonHelper.toast(Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE_LIMIT);
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc 한도변경 API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  /**
   * @function
   * @desc 한도 변경 성공 시 잔여한도 표시
   */
  _setRemainAmount: function () {
    var $root = this.$container.find('[data-title="'+ this.$title +'"]');
    var usedAmount = $root.find('.fe-use-amount').attr('id');
    var remainAmount = this.$monthSelector.attr('id');
    var remain = parseInt(remainAmount, 10) - parseInt(usedAmount, 10);

    if (remain < 0) {
      remain = 0;
    }
    var remainText = remain.toString();
    $root.find('.fe-remain-amount').attr('id', remainText)
      .text(Tw.FormatHelper.addComma(remainText));
  },
  /**
   * @function
   * @desc 한도변경 여부 체크
   * @returns {boolean}
   */
  _isChanged: function () {
    return this.$monthSelector.attr('id') !== this.$monthSelector.attr('origin-value') ||
      this.$daySelector.attr('id') !== this.$daySelector.attr('origin-value') ||
      this.$onceSelector.attr('id') !== this.$onceSelector.attr('origin-value');
  }
};

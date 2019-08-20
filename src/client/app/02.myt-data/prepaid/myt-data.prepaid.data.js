/**
 * @file myt-data.prepaid.data.js
 * @data PPS (선불폰) 데이터 1회충천
 * @author Jayoon Kong
 * @since 2018.11.28
 */

/**
 * @namespace
 * @desc 선불폰 데이터 충전 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTDataPrepaidData = function (rootEl, skpayInfo) {
  this.$container = rootEl;
  this.skpayInfo = (skpayInfo) ? skpayInfo.skpayInfo : undefined;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-check-recharge'));
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-recharge'));
  this._historyService = new Tw.HistoryService(rootEl);
  this._backAlert = new Tw.BackAlert(rootEl, true);

  this._cachedElement();
  this._init();
};

Tw.MyTDataPrepaidData.prototype = {
  /**
   * @function
   * @desc 변수 초기화
   */
  _cachedElement: function () {
    this.$data = this.$container.find('.fe-data');
    this.$dataSelector = this.$container.find('.fe-select-data');
    this.$skpaySelector = this.$container.find('.fe-select-amount-skpay');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$cardPw = this.$container.find('.fe-card-pw');
    this.$rechargeBtn = this.$container.find('.fe-check-recharge');
    this.$emailAddress = this.$container.find('.fe-email-address');
    this.$btnRequestSKpay = this.$container.find('.fe-request-skpay');
  },
  /**
   * @function
   * @desc get pps info and email address
   */
  _init: function () {
    this._getPpsInfo();
    this._getEmailAddress();
  },
  /**
   * @function
   * @desc PPS info API 호출
   */
  _getPpsInfo: function () {
    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_05_0013, {})
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._getFail, this));
  },
  /**
   * @function
   * @desc PPS info API 응답 처리 (성공)
   * @param res
   */
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._bindEvent();
      this._setData(res.result);
    } else {
      this._getFail(res);
    }
  },
  /**
   * @function
   * @desc PPS info API 응답 처리 (실패)
   * @param err
   */
  _getFail: function (err) {
    Tw.CommonHelper.endLoading('.popup-page');
    Tw.Error(err.code, err.msg).replacePage();
  },
  /**
   * @function
   * @desc 이메일 주소 API 호출
   */
  _getEmailAddress: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0061, {})
      .done($.proxy(this._emailSuccess, this))
      .fail($.proxy(this._emailFail, this));
  },
  /**
   * @function
   * @desc 이메일 주소 API 응답 처리 (성공)
   * @param res
   */
  _emailSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this.$emailAddress.text(res.result.email);
    } else {
      this._emailFail();
    }
  },
  /**
   * @function
   * @desc 이메일 주소 API 응답 처리 (실패)
   */
  _emailFail: function () {
    this.$emailAddress.text('');
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-tab-wrap > li', $.proxy(this._changeTab, this));
    this.$dataSelector.on('click', $.proxy(this._openSelectPop, this, false));
    this.$skpaySelector.on('click', $.proxy(this._openSelectPop, this, true));
    this.$container.on('click', '.fe-close-popup', $.proxy(this._onClose, this));
    this.$rechargeBtn.on('click', $.proxy(this._checkPay, this));
    this.$container.on('click', '.fe-request-skpay', $.proxy(this._skpayPopDetail, this));
    this.$container.on('click', '.fe-skpay-complete', $.proxy(this._requestSKpay, this));
  },
    /**
   * @function
   * @desc tab change (SK pay/신용카드)
   * @param event
   */
  _changeTab: function (event) {
    var $target = $(event.currentTarget);
    $target.find('a').attr('aria-selected', 'true');
    $target.siblings().find('a').attr('aria-selected', 'false');

    if ($target.attr('id') === 'tab1') {
      this.$container.find('.fe-tab1-btn').show();
      this.$container.find('.fe-tab2-btn').hide();
    } else {
      this.$container.find('.fe-tab1-btn').hide();
      this.$container.find('.fe-tab2-btn').show();
    }
  },

  /**
   * @function
   * @desc set data
   * @param result
   */
  _setData: function (result) {
    var data = 0, dataText = 0;
    if (!Tw.FormatHelper.isEmpty(result.remained) && result.remained !== '0') {
      data = result.remained;
      dataText = Tw.FormatHelper.addComma(result.remained);
    }
    this.$data.attr('data-value', data).text(dataText);
    this.$dataSelector.attr('data-code', result.dataYn);
    this.$skpaySelector.attr('data-code', result.dataYn);

    this.$container.find('.fe-from-date').text(Tw.DateHelper.getShortDate(result.obEndDt));
    this.$container.find('.fe-to-date').text(Tw.DateHelper.getShortDate(result.inbEndDt));
    this.$container.find('.fe-remain-date').text(Tw.DateHelper.getShortDate(result.numEndDt));
  },
  /**
   * @function
   * @desc actionsheet data 생성
   * @param event
   */
  _openSelectPop: function (isSkpay, event) {
    var $target = $(event.currentTarget);
    var popupName = Tw.MYT_PREPAID_RECHARGE_DATA;

    if ($target.attr('data-code') === 'Y') {
      popupName = Tw.MYT_PREPAID_RECHARGE_DATA_ADD;
    }

    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01',
      layer: true,
      data: popupName,
      btnfloating: { 'class': 'fe-popup-close', 'txt': Tw.BUTTON_LABEL.CLOSE }
    },
      $.proxy(this._selectPopupCallback, this, $target, isSkpay),
      $.proxy(this._checkIsAbled, this),
      null,
      $target);
  },
  /**
   * @function
   * @desc actionsheet event binding
   * @param $target
   * @param $layer
   */
  _selectPopupCallback: function ($target, isSkpay, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성

    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target, isSkpay));
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this, isSkpay));
  },
  /**
   * @function
   * @desc actionsheet select 값 처리
   * @param $target
   * @param $layer
   */
  _setSelectedValue: function ($target, isSkpay, event) {
    var $selectedValue = $(event.target);
    $target.attr({
      'id': $selectedValue.attr('id'), 
      'data-value': $selectedValue.attr('data-value'),
      'data-amount': $selectedValue.attr('data-amount')
    });
    $target.text($selectedValue.parents('label').text());

    if (isSkpay){
      this.$skpaySelector.siblings('.fe-error-msg').hide();
      this._checkSkpayIsAbled();
    } else {
      this.$dataSelector.siblings('.fe-error-msg').hide();
      this._validationService.checkIsAbled();
    }
    this._popupService.close();
  },
  /**
   * @function
   * @desc check 여부 검증 및 에러메시지 노출
   */
  _checkSelected: function (isSkpay) {
    if (isSkpay){
      if (Tw.FormatHelper.isEmpty(this.$skpaySelector.attr('id'))) {
        this.$skpaySelector.siblings('.fe-error-msg').show();
        this.$skpaySelector.focus();
      }
    } else {
      if (Tw.FormatHelper.isEmpty(this.$dataSelector.attr('id'))) {
        this.$dataSelector.siblings('.fe-error-msg').show();
        this.$dataSelector.focus();
      }
    }
    this._popupService.close();
  },
  /**
   * @function
   * @desc X버튼 클릭 시 닫기 처리 (공통 confirm 호출)
   */
  _onClose: function () {
    this._backAlert.onClose();
  },
  /**
   * @function
   * @desc 충전내역 확인
   * @param e
   */
  _checkPay: function (e) {
    if (this._validationService.isAllValid()) {
      this._popupService.open({
        'hbs': 'DC_09_03_01',
        'title': Tw.MYT_DATA_PREPAID.DATA_TITLE
      },
        $.proxy(this._openCheckPay, this, false),
        $.proxy(this._afterRechargeSuccess, this),
        'check-pay',
        $(e.currentTarget)
      );
    }
  },
  /**
   * @function
   * @desc set layer data and event binding
   * @param $layer - 팝업 객체
   * @private
   */
  _openCheckPay: function (isSkpay, $layer) {
    this._setLayerData($layer, isSkpay);
    this._setEvent($layer, isSkpay);
  },
  /**
   * @function
   * @desc 데이터 충전 후 처리
   */
  _afterRechargeSuccess: function () {
    if (this._isRechargeSuccess) {
      var data = Tw.FormatHelper.customDataFormat(this._afterData.toString().replace(',',''), Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB);
      this._historyService.replaceURL('/myt-data/recharge/prepaid/data-complete?data=' + data.data);
    } else if (this._isRechargeFail) {
      Tw.Error(this._err.code, this._err.msg).pop();
    }
  },
  /**
   * @function
   * @desc set layer data
   * @param $layer - 팝업 객체
   */
  _setLayerData: function ($layer, isSkpay) {
    var remainData = this.$data.attr('data-value');
    this._afterData = parseInt(remainData, 10) +
      parseInt(this.$dataSelector.attr('data-value'), 10);

    if(isSkpay){
      this._afterData = parseInt(remainData, 10) + parseInt(this.$skpaySelector.attr('data-value'), 10);
    }
    $layer.find('.fe-remain-data').text(Tw.FormatHelper.addComma(remainData.toString()));
    $layer.find('.fe-after-data').text(Tw.FormatHelper.addComma(this._afterData.toString()));
    if (isSkpay) {
      $layer.find('.fe-recharge-amount').text($.trim(this.$skpaySelector.text()));
      $layer.find('.fe-email-address').text($.trim(this.$emailAddress.text()));
    } else {
      $layer.find('.fe-layer-card-number').text($.trim(this.$cardNumber.val()));
      $layer.find('.fe-layer-card-info').attr('data-code', this.$cardNumber.attr('data-code'))
        .text(this.$cardNumber.attr('data-name'));
      $layer.find('.fe-recharge-amount').text($.trim(this.$dataSelector.text()));
      $layer.find('.fe-email-address').text($.trim(this.$emailAddress.text()));
    }
  },
  /**
   * @function
   * @desc event binding
   * @param $layer - 팝업 객체
   */
  _setEvent: function ($layer, isSkpay) {
    $layer.on('click', '.fe-popup-close', $.proxy(this._close, this));
    if (isSkpay) {
      $layer.on('click', '.fe-recharge', $.proxy(this._requestSKpay, this));
    } else {
      $layer.on('click', '.fe-recharge', $.proxy(this._recharge, this, $layer));
    }
  },
  /**
   * @function
   * @desc 데이터 충전 API 호출
   * @param $layer - 팝업 객체
   */
  _recharge: function ($layer) {
    var reqData = this._makeRequestData();

    if ($layer.find('.fe-sms').is(':checked')) {
      reqData.smsYn = 'Y';
    }

    if ($layer.find('.fe-email').is(':checked')) {
      reqData.emailYn = 'Y';
    }

    Tw.CommonHelper.startLoading('.popup-page', 'grey');
    this._apiService.request(Tw.API_CMD.BFF_06_0058, reqData)
      .done($.proxy(this._rechargeSuccess, this))
      .fail($.proxy(this._rechargeFail, this));
  },
  /**
   * @function
   * @desc 데이터 충전 요청 파라미터 생성
   * @returns {{amtCd, amt, cardNum: string, expireMM: string, expireYY: string, pwd: string}}
   */
  _makeRequestData: function () {
    return {
      amtCd: this.$dataSelector.attr('id'), // 충전코드
      amt: this.$dataSelector.attr('data-amount'),
      cardNum: $.trim(this.$cardNumber.val()),
      expireMM: $.trim(this.$cardM.val()),
      expireYY: $.trim(this.$cardY.val()).substr(2,2),
      pwd: $.trim(this.$cardPw.val())
    };
  },
  /**
   * @function
   * @desc 데이터 충전 API 응답 처리 (성공)
   * @param res
   */
  _rechargeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._isRechargeSuccess = true;
      this._close();
    } else {
      this._rechargeFail(res);
    }
  },
  /**
   * @function
   * @desc 데이터 충전 API 응답 처리 (실패)
   * @param err
   */
  _rechargeFail: function (err) {
    Tw.CommonHelper.endLoading('.popup-page');
    this._isRechargeFail = true;
    this._err = {
      code: err.code,
      msg: err.msg
    };
    this._close();
  },
  /**
   * @function
   * @desc 팝업(페이지) 종료
   */
  _close: function () {
    this._popupService.close();
  },
  /**
   * @function
   * @desc input null check 후 버튼 활성화/비활성화 처리
   */
  _checkSkpayIsAbled: function () {
    if ( this.$skpaySelector.attr('id')) {
      this.$btnRequestSKpay.prop('disabled', false);
    } else {
      this.$btnRequestSKpay.prop('disabled', true);
    }
  },
      /**
   * @function
   * @desc SK pay 결제 준비
   * @param e
   */
  _skpayPopDetail: function (e) {
    var $elButton = $(e.currentTarget);
    var previousAmount = Number($('.fe-remain-amount').data('remainAmount'));
    var rechargeAmount = Number($('.fe-select-amount-skpay').data('amount'));
    var afterAmount = previousAmount + rechargeAmount;
    this.amountInfo = {
      previousAmount: previousAmount,
      afterAmount: afterAmount,
      rechargeAmount: rechargeAmount
    };

    this._popupService.open({
      'hbs': 'DC_09_03_02',
      'title': Tw.MYT_DATA_PREPAID.DATA_TITLE
    },
      $.proxy(this._openCheckPay, this, true),
      null,
      'check-pay',
      $(e.currentTarget)
    );
  },
    /**
   * @function
   * @desc SK pay 결제 요청
   */
  _requestSKpay: function (e) {
    if ($('.fe-sms').is(':checked')) {
      this.skpayInfo.sms = 'Y';
    } else {
      this.skpayInfo.sms = 'N';
    }
    if ($('.fe-email').is(':checked')) {
      this.skpayInfo.email = 'Y';
    } else {
      this.skpayInfo.email = 'N';
    }
    
    var remainData = this.$data.attr('data-value');
    var afterData = parseInt(remainData, 10) + parseInt(this.$skpaySelector.attr('data-value'), 10);
    var mb = Tw.FormatHelper.customDataFormat(afterData.toString().replace(',',''), Tw.DATA_UNIT.MB, Tw.DATA_UNIT.GB);
    this.skpayInfo.mb = mb.data; // 용량
    this.skpayInfo.amtCd = this.$skpaySelector.attr('id'); // 충전코드
    
    new Tw.MyTDataPrepaySKPaySdk({
      $element: this.$container,
      data : {
        skpayInfo: this.skpayInfo,
        title: 'data',
        requestSum: this.$skpaySelector.attr('data-amount')
      }
    }).goSkpay(e);
  }
};
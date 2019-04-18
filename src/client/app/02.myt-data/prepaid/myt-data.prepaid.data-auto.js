/**
 * @file myt-data.prepaid.data-auto.js
 * @desc 선불폰 데이터 자동 충전
 * @author Jayoon Kong
 * @since 2018.11.29
 */

/**
 * @namespace
 * @desc 선불폰 데이터 자동 충전 namespace
 * @param rootEl - dom 객체
 */
Tw.MyTDataPrepaidDataAuto = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._validationService = new Tw.ValidationService(rootEl, this.$container.find('.fe-recharge'));
  this._focusService = new Tw.InputFocusService(rootEl, this.$container.find('.fe-check-recharge'));
  this._backAlert = new Tw.BackAlert(rootEl, true);

  this._cachedElement();
  this._getPpsInfo();
};

Tw.MyTDataPrepaidDataAuto.prototype = {
  /**
   * @function
   * @desc 변수 초기화
   */
  _cachedElement: function () {
    this.$data = this.$container.find('.fe-data');
    this.$dataSelector = this.$container.find('.fe-select-data');
    this.$cancelBtn = this.$container.find('.fe-cancel');
    this.$isAuto = this.$cancelBtn.is(':visible');
    this.$cardNumber = this.$container.find('.fe-card-number');
    this.$hiddenNumber = this.$container.find('.fe-hidden');
    this.$cardY = this.$container.find('.fe-card-y');
    this.$cardM = this.$container.find('.fe-card-m');
    this.$rechargeBtn = this.$container.find('.fe-recharge');
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
   * @desc event binding
   */
  _bindEvent: function () {
    this.$dataSelector.on('click', $.proxy(this._openSelectPop, this));
    this.$cancelBtn.on('click', $.proxy(this._cancel, this));
    this.$container.on('click', '.fe-close', $.proxy(this._onClose, this));
    this.$rechargeBtn.on('click', $.proxy(this._recharge, this));
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

    this.$container.find('.fe-from-date').text(Tw.DateHelper.getShortDate(result.obEndDt));
    this.$container.find('.fe-to-date').text(Tw.DateHelper.getShortDate(result.inbEndDt));
    this.$container.find('.fe-remain-date').text(Tw.DateHelper.getShortDate(result.numEndDt));
  },
  /**
   * @function
   * @desc 자동충전 해지 confirm
   * @param e
   */
  _cancel: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MYT_DATA.ALERT_2_A70.MSG, Tw.ALERT_MSG_MYT_DATA.ALERT_2_A70.TITLE,
      $.proxy(this._onCancel, this), $.proxy(this._autoCancel, this), null, Tw.ALERT_MSG_MYT_DATA.ALERT_2_A70.BUTTON, $(e.currentTarget));
  },
  /**
   * @function
   * @desc 해지 confirm 확인
   */
  _onCancel: function () {
    this._isCancel = true;
    this._popupService.close();
  },
  /**
   * @function
   * @desc 자동충전 해지 API 호출
   */
  _autoCancel: function () {
    if (this._isCancel) {
      this._apiService.request(Tw.API_CMD.BFF_06_0061, {})
        .done($.proxy(this._cancelSuccess, this))
        .fail($.proxy(this._fail, this));
    }
  },
  /**
   * @function
   * @desc 자동충전 해지 완료 처리
   * @param res
   */
  _cancelSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._historyService.replaceURL('/myt-data/recharge/prepaid/data-complete?type=cancel');
    } else {
      this._fail(res);
    }
  },
  /**
   * @function
   * @desc actionsheet 생성
   * @param event
   */
  _openSelectPop: function (event) {
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
      $.proxy(this._selectPopupCallback, this, $target),
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
  _selectPopupCallback: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성

    var $id = $target.attr('id');
    if (!Tw.FormatHelper.isEmpty($id)) {
      $layer.find('input#' + $id).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._setSelectedValue, this, $target));
    $layer.on('click', '.fe-popup-close', $.proxy(this._checkSelected, this));
  },
  /**
   * @function
   * @desc actionsheet 선택된 값 처리
   * @param $target
   * @param event
   */
  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.target);
    $target.attr({
      'id': $selectedValue.attr('id'),
      'data-value': $selectedValue.attr('data-value'),
      'data-amount': $selectedValue.attr('data-amount')
    });
    $target.text($selectedValue.parents('label').text());

    this.$dataSelector.siblings('.fe-error-msg').hide();
    this._validationService.checkIsAbled();
    this._popupService.close();
  },
  /**
   * @function
   * @desc 선택된 값이 있는지 체크 및 에러메시지 노출
   */
  _checkSelected: function () {
    if (Tw.FormatHelper.isEmpty(this.$dataSelector.attr('id'))) {
      this.$dataSelector.siblings('.fe-error-msg').show();
      this.$dataSelector.focus();
    }
    this._popupService.close();
  },
  /**
   * @function
   * @desc 자동충전 API 요청 파라미터 생성
   * @returns {{amtCd, amt, cardNum: string, expireMM: string, expireYY: string, maskedYn: string}}
   */
  _makeRequestData: function () {
    return {
      amtCd: this.$dataSelector.attr('id'),
      amt: this.$dataSelector.attr('data-amount'),
      cardNum: $.trim(this.$cardNumber.val()),
      expireMM: $.trim(this.$cardM.val()),
      expireYY: $.trim(this.$cardY.val()).substr(2,2),
      maskedYn: ''
    };
  },
  /**
   * @function
   * @desc X버튼 클릭 시 닫기 처리 (공통 confirm)
   */
  _onClose: function () {
    this._backAlert.onClose();
  },
  /**
   * @function
   * @desc 자동충전 API 호출
   */
  _recharge: function () {
    if (this._validationService.isAllValid()) {
      var reqData = this._makeRequestData();
      if (this.$isAuto) {
        if ($.trim(this.$cardNumber.val()) === this.$hiddenNumber.val()) {
          reqData.maskedYn = 'Y';
        }
      }
      Tw.CommonHelper.startLoading('.popup-page', 'grey');
      this._apiService.request(Tw.API_CMD.BFF_06_0059, reqData)
        .done($.proxy(this._rechargeSuccess, this))
        .fail($.proxy(this._fail, this));
    }
  },
  /**
   * @function
   * @desc 자동충전 API 응답 처리 (성공)
   * @param res
   */
  _rechargeSuccess: function (res) {
    var type = 'auto';
    if (this.$isAuto) type = 'change';

    if (res.code === Tw.API_CODE.CODE_00) {
      var code = this.$dataSelector.attr('id');
      Tw.CommonHelper.endLoading('.popup-page', 'grey');
      this._historyService.replaceURL('/myt-data/recharge/prepaid/data-complete?data=' + code + '&type=' + type);
    } else {
      this._fail(res, 'recharge');
    }
  },
  /**
   * @function
   * @desc 자동충전 API 응답 처리 (실패)
   * @param err
   */
  _fail: function (err, type) {
    if (type === 'recharge') {
      Tw.CommonHelper.endLoading('.popup-page');
    }
    Tw.Error(err.code, err.msg).pop(null, this.$rechargeBtn);
  },
  /**
   * @function
   * @desc 기존 데이터와 충전된 데이터 합산해서 완료페이지로 전달
   * @returns {string}
   */
  _getAfterData: function () {
    var remainData = parseInt(this.$data.attr('data-value'), 10);
    var rechargeData = parseInt(this.$dataSelector.attr('data-value'), 10);
    var sum = remainData + rechargeData;

    return sum.toString().replace(',', '');
  }
};
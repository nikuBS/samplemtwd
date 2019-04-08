/**
 * @file myt-fare.bill.get.point.js
 * @author Jayoon Kong
 * @since 2019.01.10
 * @desc 포인트 즉시납부 및 OK cashbag 포인트 예약납부 시 카드번호 조회
 */

/**
 * @namespace
 * @desc 포인트 조회 팝업 namespace
 * @param rootEl - dom 객체
 * @param callbackFunc - 포인트 조회 이후 실행할 callback function
 * @param e
 */
Tw.MyTFareBillGetPoint = function (rootEl, callbackFunc, e) {
  this.$container = rootEl;
  this.$callback = callbackFunc;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._validation = Tw.ValidationHelper;

  this._openGetPoint(e);
};

Tw.MyTFareBillGetPoint.prototype = {
  /**
   * @function
   * @desc 포인트 조회 풀팝업 load
   * @param e
   */
  _openGetPoint: function (e) {
    this._popupService.open({
      'hbs':'MF_01_03_01'
    }, $.proxy(this._setPoint, this), null, 'get-point', $(e.currentTarget));
  },
  /**
   * @function
   * @desc event binding
   * @param $layer
   */
  _setPoint: function ($layer) {
    $layer.on('keyup', '.fe-only-number', $.proxy(this._checkNumber, this));
    $layer.on('keyup', '.fe-point-card-number', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('input', '.fe-point-card-number', $.proxy(this._setMaxValue, this));
    $layer.on('blur', '.fe-point-card-number', $.proxy(this._checkCardNumber, this, $layer));
    $layer.on('change', '.fe-cashbag-agree', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('click', '.cancel', $.proxy(this._checkIsLayerAbled, this, $layer));
    $layer.on('click', '.fe-get', $.proxy(this._getPoint, this));
  },
  /**
   * @function
   * @desc 숫자만 입력
   * @param event
   */
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  /**
   * @function
   * @desc 필수 입력필드 체크 후 버튼 활성화/비활성화 처리
   * @param $layer
   */
  _checkIsLayerAbled: function ($layer) {
    if ($layer.find('.fe-point-card-number').val() !== '' &&
      $layer.find('.fe-cashbag-agree').hasClass('checked')) {
      $layer.find('.fe-get').removeAttr('disabled');
    } else {
      $layer.find('.fe-get').attr('disabled', 'disabled');
    }
  },
  /**
   * @function
   * @desc max length 적용
   * @param event
   */
  _setMaxValue: function (event) {
    var $target = $(event.currentTarget);
    var maxLength = $target.attr('maxLength');
    if ($target.attr('maxLength')) {
      if ($target.val().length >= maxLength) {
        $target.val($target.val().slice(0, maxLength));
      }
    }
  },
  /**
   * @function
   * @desc 포인트카드번호 유효성 검증
   * @param $layer
   */
  _checkCardNumber: function ($layer) {
    var $pointCardNumber = $layer.find('.fe-point-card-number');
    this._pointCardNumber = $.trim($pointCardNumber.val());

    this.$isValid = this._validation.showAndHideErrorMsg($pointCardNumber, this._validation.checkMoreLength($pointCardNumber, 16));
  },
  /**
   * @function
   * @desc 포인트 조회 API 호출
   * @param e
   */
  _getPoint: function (e) {
    var $target = $(e.currentTarget);
    if (this.$isValid) {
      this._apiService.request(Tw.API_CMD.BFF_07_0043, { 'ocbCcno': this._pointCardNumber })
        .done($.proxy(this._getSuccess, this, $target))
        .fail($.proxy(this._getFail, this, $target));
    }
  },
  /**
   * @function
   * @desc 포인트 조회 API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _getSuccess: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._popupService.close();
      this.$callback(res.result); // 포인트 카드정보 성공 시 호출한 화면으로 데이터 전송
    } else {
      this._getFail($target, res);
    }
  },
  /**
   * @function
   * @desc 포인트 조회 API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _getFail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  }
};
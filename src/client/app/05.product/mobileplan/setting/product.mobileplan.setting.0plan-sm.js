/**
 * @file 상품 > 모바일요금제 > 설정 > 0플랜 스몰/미디엄
 * @author Ji Hun Yang (jihun202@sk.com)
 * @since 2019-01-10
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param prodId - 상품코드
 * @param displayId - 화면 ID
 * @param zeroPlanInfo - 0플랜 정보조회 데이터
 */
Tw.ProductMobileplanSetting0planSm = function(rootEl, prodId, displayId, zeroPlanInfo) {
  // 컨테이너 레이어 선언
  this.$container = rootEl;

  // 공통 모듈 선언
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();

  // 공통 변수 선언
  this._prodId = prodId;
  this._displayId = displayId;
  this._zeroPlanInfo = JSON.parse(zeroPlanInfo);
  this._currentOptionProdId = this._zeroPlanInfo.useOptionProdId;
  this._startTime = Tw.FormatHelper.isEmpty(this._zeroPlanInfo.applyStaTm) ? null : this._zeroPlanInfo.applyStaTm.substr(0, 2);
  this._isChangeTime = true;

  // Element 캐싱
  this._cachedElement();

  // 이벤트 바인딩
  this._bindEvent();

  // 최초 동작
  this._init();
};

Tw.ProductMobileplanSetting0planSm.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    if (this._historyService.isBack()) {
      this._historyService.goBack();
    }

    if (Tw.FormatHelper.isEmpty(this._currentOptionProdId)) {
      return;
    }

    if (!Tw.FormatHelper.isEmpty(this._startTime)) {
      var currentHour = new Date().getHours();
      this._setTimeButton(this._startTime);
      this._setTimeMsg(this._startTime);
      this._isChangeTime = !(parseInt(this._startTime, 10) <= currentHour && currentHour < (parseInt(this._startTime, 10) + 3));
    }

    this.$container.find('input[value="' + this._currentOptionProdId + '"]').trigger('click');
  },

  /**
   * @function
   * @desc Element 캐싱
   */
  _cachedElement: function() {
    this.$inputRadioInWidgetbox = this.$container.find('.widget-box.radio input[type="radio"]');
    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
    this.$btnTimeSelect = this.$container.find('.fe-btn_time_select');
    this.$msg = this.$container.find('.fe-msg');
    this.$hour = this.$container.find('.fe-hour');
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvent: function() {
    this.$inputRadioInWidgetbox.on('change', $.proxy(this._enableSetupButton, this));
    this.$btnSetupOk.on('click', _.debounce($.proxy(this._procSetupOk, this), 500));
    this.$btnTimeSelect.on('click', $.proxy(this._openTimeSelectPop, this));
  },

  /**
   * @function
   * @desc 시간 선택 액션시트 팝업 실행
   */
  _openTimeSelectPop: function() {
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data: [
        {
          'list': $.proxy(this._getTimeList, this)
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindTimePopup, this), null, 'select_time_select', this.$btnTimeSelect);
  },

  /**
   * @function
   * @desc 시간 선택 목록 산출
   * @returns {Array}
   */
  _getTimeList: function() {
    var resultList = [];

    for(var i = 5; i <= 21; i++) {
      var strHour = (i < 10 ? '0' + i : i).toString();
      resultList.push({
        'label-attr': 'id="ra' + i + '"',
        'txt': strHour,
        'radio-attr': 'id="ra' + i + '" data-time="' + strHour + '" ' + (this._startTime === strHour ? 'checked' : '')
      });
    }

    return resultList;
  },

  /**
   * @function
   * @desc 시간 선택 팝업 이벤트 바인딩
   * @param $popupContainer - 시간 선택 팝업 컨테이너 레이어
   */
  _bindTimePopup: function($popupContainer) {
    $popupContainer.on('click', '[data-time]', $.proxy(this._setTime, this));
  },

  /**
   * @function
   * @desc 시간 선택 팝업내 시간 선택 시
   * @param e - 시간 선택 클릭 이벤트
   */
  _setTime: function(e) {
    var time = $(e.currentTarget).data('time').toString();

    this._setTimeButton(time);
    this._setTimeMsg(time);

    this._startTime = time;
    this._popupService.close();
  },

  /**
   * @function
   * @desc 시간 선택 버튼 Element 설정
   * @param timeStr - 시간 문자열 값
   */
  _setTimeButton: function(timeStr) {
    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    this.$btnTimeSelect.html(timeStr + ' ' + Tw.PERIOD_UNIT.HOUR + $('<div\>').append(this.$btnTimeSelect.find('.ico')).html());
  },

  /**
   * @function
   * @desc 시간 설정 상태 메세지 설정
   * @param timeStr - 시간 문자열 값
   */
  _setTimeMsg: function(timeStr) {
    var endTime = parseInt(timeStr, 10) + 3;
    this.$hour.text(timeStr + Tw.PERIOD_UNIT.HOUR + '~' + (endTime < 10 ? '0' + endTime : endTime) + Tw.PERIOD_UNIT.HOUR);

    this.$msg.show().attr('aria-hidden', 'false');
    this.$msg.removeClass('disabled');
  },

  /**
   * @function
   * @desc 설정 완료 버튼 활성화
   * @param e - 설정 변경시 Radio change 이벤트
   * @returns {*}
   */
  _enableSetupButton: function(e) {
    if ($(e.currentTarget).val() === 'NA00006163' && this._isChangeTime) {
      this.$btnTimeSelect.prop('disabled', false).removeAttr('disabled');
      this.$msg.removeClass('disabled');
    } else {
      this.$btnTimeSelect.prop('disabled', true).attr('disabled');
      this.$msg.addClass('disabled');
    }

    if ($(e.currentTarget).val() === 'NA00006163' && !this._isChangeTime) {
      return this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }

    this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
  },

  /**
   * @function
   * @desc 설정 완료 버튼 클릭 시 & 설정 변경 API 요청
   */
  _procSetupOk: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked');

    if (this._currentOptionProdId === $checked.val()) {
      return this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A30.TITLE);
    }

    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService.request(Tw.API_CMD.BFF_10_0170, {
      beforeTDiyGrCd: this._currentOptionProdId,
      afterTDiyGrCd: $checked.val(),
      applyStaTm: $checked.val() === 'NA00006163' ? this._startTime + '00' : ''
    }, {}, []).done($.proxy(this._procSetupOkRes, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  /**
   * 설정 정보 텍스트 문자열 산출
   * @returns {string}
   */
  _getBasicText: function() {
    var $checked = this.$container.find('.widget-box.radio input[type="radio"]:checked'),
      txt = $checked.parent().find('.mtext').text() + '<br>';

    if ($checked.val() === 'NA00006163') {
      txt += this.$msg.text();
    } else {
      txt += $checked.data('desc');
    }

    return txt;
  },

  /**
   * @function
   * @desc 설정 변경 API 응답 시
   * @param resp - API 응답 값
   * @returns {*}
   */
  _procSetupOkRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');

    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: {
        prodCtgNm: Tw.PRODUCT_TYPE_NM.SETTING,
        typeNm: Tw.PRODUCT_TYPE_NM.CHANGE,
        basicTxt: this._getBasicText()
      }
    }, $.proxy(this._bindSuccessPopup, this), $.proxy(this._onClosePop, this), 'save_setting_success');
  },

  /**
   * @function
   * @desc 완료 팝업 실행
   * @param $popupContainer - 완료 팝업 컨테이너 레이어
   */
  _bindSuccessPopup: function($popupContainer) {
    $popupContainer.on('click', '.fe-btn_success_close', $.proxy(this._closePop, this));
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  /**
   * @function
   * @desc 완료 팝업 내 A 하이퍼링크 핸들링
   * @param e - A 하이퍼링크 클릭 이벤트
   */
  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  /**
   * @function
   * @desc 완료 팝업 내 닫기 버튼 클릭 시
   */
  _closePop: function() {
    this._popupService.close();
  },

  /**
   * @function
   * @desc 완료 팝업 종료 시
   */
  _onClosePop: function() {
    this._historyService.goBack();
  }

};

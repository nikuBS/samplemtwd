/**
 * @file myt-data.ting.js
 * @desc 팅요금제 충전 선물 관련 처리
 * @author Jiman Park (jiman.park@sk.com)
 * @since 2018.09.18
 */

Tw.MyTDataTing = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTDataTing.prototype = {
  _init: function () {
    this._getRemainDataInfo();
  },

  _cachedElement: function () {
    this.$btn_send_gift = $('.fe-btn_ting_send');
    this.$input_ting_receiver = $('.fe-input_ting_receiver');
    this.$btn_native_contact_list = $('.fe-btn_native_contact');
    this.$wrap_amount_select_list = $('.fe-ting_amount_select_list');
    this.$error_text = $('.fe-error-text');
  },

  _bindEvent: function () {
    this.$btn_send_gift.on('click', $.proxy(this._getReceiveUserInfo, this));
    this.$btn_native_contact_list.on('click', $.proxy(this._onClickBtnAddr, this));
    this.$input_ting_receiver.on('input change', $.proxy(this._onInputChangeTingGiftNumber, this));
    this.$wrap_amount_select_list.on('click', $.proxy(this._checkValidateSendingButton, this));
    this.$container.on('click', '.cancel', $.proxy(this._checkValidateSendingButton, this));
    // this.$container.on('click', '.prev-step', $.proxy(this._stepBack, this));
  },

  /**
   * @function
   * @desc BFF_06_0020 (new IA) 팅요금 충전선물 제공자 조회 API Request
   * @private
   */
  _getRemainDataInfo: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0020, {}).done($.proxy(this._onSuccessRemainDataInfo, this));
  },

  /**
   * @function
   * @desc BFF_06_0020 (new IA) 팅요금 충전선물 제공자 조회 API Response
   * @param res
   * @private
   */
  _onSuccessRemainDataInfo: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._setAmountUI(Number(res.result.transferableAmt));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  /**
   * @desc 충전 금액 영역 활성화/비활성화 세팅
   * @param nLimitMount
   * @private
   */
  _setAmountUI: function (nLimitMount) {
    var fnCheckedUI = function (nIndex, elInput) {
      var $input = $(elInput);

      if ( Number($input.val()) > nLimitMount ) {
        $input.prop('disabled', true);
        $input.parent().addClass('disabled');
      }

      // if ( Number($input.val()) === nLimitMount ) {
      //   $input.click();
      // }
    };

    this.$wrap_amount_select_list.find('input').each(fnCheckedUI);
    // var elAmount = this.$wrap_amount_select_list.find('input').each(fnCheckedUI);
    // elAmount.not(':disabled').get(0).click();
  },

  /**
   * @function
   * @desc native에 주소록 오픈 요청
   * @private
   */
  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  /**
   * @function
   * @desc 주소록에서 전화번호 선택 native Response
   * @param response
   * @private
   */
  _onContact: function (response) {
    if ( response.resultCode === Tw.NTV_CODE.CODE_00 ) {
      var params = response.params;
      this.$input_ting_receiver.val(this._convertDashNumber(params.phoneNumber)).trigger('change');
      this._validatePhoneNumber();
    }
  },

  /**
   * @function
   * @desc 핸드폰 번호에 하이픈(-) 처리
   * @param sTelNumber - 입력된 번호
   * @returns {String}
   * @private
   */
  _convertDashNumber: function (sTelNumber) {
    return Tw.StringHelper.phoneStringToDash(sTelNumber);
  },

  /**
   * @function
   * @desc 받는 분 번호 영역 input, change method 처리
   * @private
   */
  _onInputChangeTingGiftNumber: function () {
    this._checkValidateSendingButton();

    if ( this.$input_ting_receiver.val() ) {
      Tw.InputHelper.inputNumberOnly(this.$input_ting_receiver);
    }

    this.$input_ting_receiver.val(this._convertDashNumber(this.$input_ting_receiver.val()));

    this._validatePhoneNumber();
  },

  /**
   * @function
   * @desc 선물하기 버튼 선택
   * @param e
   * @private
   */
  _getReceiveUserInfo: function (e) {
    var $target = $(e.currentTarget);
    this.befrSvcNum = this.$input_ting_receiver.val().match(/\d+/g).join('');

    var isValidPhone = this._validatePhoneNumber(this.befrSvcNum);

    if ( isValidPhone ) {
      this._apiService.request(Tw.API_CMD.BFF_06_0022, { chrgSvcNum: this.befrSvcNum })
        .done($.proxy(this._onSuccessReceiveUserInfo, this, $target));
    }
  },

  /**
   * @function
   * @desc BFF_06_0022 (new IA) 팅요금 선물 수혜자조회 API Response
   * @param $target
   * @param res
   * @private
   */
  _onSuccessReceiveUserInfo: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._requestSendingData();
    } else if ( res.code === 'ZPAYE0077' ) {
      this._popupService.openAlert(Tw.MYT_DATA_TING.V31, null, null, null, null, $target);
    } else if ( res.code === 'ZINVE8164' ) {
      this._popupService.openAlert(Tw.MYT_DATA_TING.NOT_TING_SKT, null, null, null, null, $target);
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  /**
   * @function
   * @desc BFF_06_0023 (new IA) 팅요금 선물하기 Request
   * @private
   */
  _requestSendingData: function () {
    var htParams = {
      befrSvcNum: this.$input_ting_receiver.val().match(/\d+/g).join(''),
      amt: this.$wrap_amount_select_list.find('li.checked input').val()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0023, htParams)
      .done($.proxy(this._onSuccessSendingData, this));
  },

  /**
   * @function
   * @desc BFF_06_0023 (new IA) 팅요금 선물하기 API Response
   * @param res
   * @private
   */
  _onSuccessSendingData: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._historyService.replaceURL('/myt-data/recharge/ting/complete');
    } else {
      Tw.Error(res.code, res.msg).pop();
    }
  },

  /**
   * @function
   * @desc 하단 선물하기 버튼 활성화/비활성화 처리
   * @private
   */
  _checkValidateSendingButton: function () {
    var elAmount = this.$wrap_amount_select_list.find('li input:checked');

    if ( !Tw.FormatHelper.isEmpty(elAmount.val()) && this._validatePhoneNumber() ) {
      this.$btn_send_gift.attr('disabled', false);
    } else {
      this.$btn_send_gift.attr('disabled', true);
    }
  },

  /**
   * @function
   * @desc 받는 분 번호 validation Check
   * @returns {boolean}
   * @private
   */
  _validatePhoneNumber: function () {
    var sPhone = this.$input_ting_receiver.val().match(/\d+/g) ? this.$input_ting_receiver.val().match(/\d+/g).join('') : '';

    if ( sPhone.length < 10 ) {
      // Tw.Error(null, Tw.VALIDATE_MSG_MYT_DATA.V18).pop();
      this.$error_text.addClass('blind');
      $(this.$error_text.get(0)).removeClass('blind');
      return false;
    } else if ( !Tw.FormatHelper.isCellPhone(sPhone) ) {
      // Tw.Error(null, Tw.VALIDATE_MSG_MYT_DATA.V9).pop();
      this.$error_text.addClass('blind');
      $(this.$error_text.get(1)).removeClass('blind');
      return false;
    } else {
      this.$error_text.addClass('blind');
    }

    return true;
  },

  /**
   * 사용하지 않는 소스로 보임 => fe-common-back 클래스 공통 처리
   */
  _stepBack: function (e) {
    var $target = $(e.currentTarget);
    var confirmed = false;
    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
      Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
      $.proxy(function () {
        confirmed = true;
        this._popupService.close();
      }, this),
      $.proxy(function () {
        if ( confirmed ) {
          this._historyService.goBack();
        }
      }, this),
      Tw.BUTTON_LABEL.NO,
      Tw.BUTTON_LABEL.YES,
      $target
    );
  },

  /**
   * @function
   * @desc 나의 데이터 통화 서브메인으로 이동
   * @private
   */
  _goSubmain: function () {
    this._historyService.replaceURL('/myt-data/submain');
  }
};
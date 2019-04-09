/**
 * @file myt-fare.bill.small.set.password.js
 * @author Jayoon Kong
 * @since 2018.10.09
 * @desc 소액결제 비밀번호 설정
 */

/**
 * @namespace
 * @desc 소액결제 비밀번호 설정
 * @param rootEl - dom 객체
 * @param $target
 */
Tw.MyTFareBillSmallSetPassword = function (rootEl, $target) {
  this.$container = rootEl;
  this.$target = $target;
  this.$isValid = false;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;
  this._validation = Tw.ValidationHelper;
  this._historyService = new Tw.HistoryService(rootEl);

  this._init();
};

Tw.MyTFareBillSmallSetPassword.prototype = {
  /**
   * @function
   * @desc init
   */
  _init: function () {
    var code = this.$target.attr('data-code');

    if (code === Tw.API_CODE.CODE_00) {
      var cpinCode = this.$target.attr('data-cpin');
      var birth = this.$target.attr('data-birth');

      // data type에 따라 보여주는 text 변경
      switch (cpinCode) {
        case 'NC': {
          this.$type = 'new'; // 신청
          this._popupService.open({
            'hbs': 'MF_06_06'
          }, $.proxy(this._openPassword, this, birth), null, 'set-pwd', this.$target);
          break;
        }
        case 'AC': {
          this.$type = 'change'; // 변경
          this._popupService.open({
            'hbs': 'MF_06_06'
          }, $.proxy(this._openPassword, this, birth), null, 'set-pwd', this.$target);
          break;
        }
        case 'LC': { // 잠김 (안내 팝업 호출 후 처리)
          this._popupService.openConfirm(Tw.ALERT_MSG_MYT_FARE.PASSWORD_ADDITIONAL_INFO,
            Tw.POPUP_TITLE.NOTIFY, $.proxy(this._goAdditionalService, this), null, this.$target);
          break;
        }
        case 'IC': { // 초기화
          this.$type = 'change';
          this._popupService.open({
            'hbs': 'MF_06_06'
          }, $.proxy(this._openPassword, this, birth), null, 'set-pwd', this.$target);
          break;
        }
        default:
          break;
      }
    } else if (code === 'BIL0054') {
      // 부가서비스 페이지로 이동
      this._goProductService();
    }
  },
  /**
   * @function
   * @desc 비밀번호 변경 레이어 load
   * @param birth
   * @param $layer
   */
  _openPassword: function (birth, $layer) {
    this._focusService = new Tw.InputFocusService($layer, $layer.find('.fe-set'));

    this._initVariables($layer, birth);
    this._setData();
    this._bindEvent();
  },
  /**
   * @function
   * @desc initialize variables
   * @param $layer
   * @param birth
   */
  _initVariables: function ($layer, birth) {
    this.$layer = $layer;
    this.$birth = birth;
    this.$currentPassword = $layer.find('.fe-current-password');
    this.$newPassword = $layer.find('.fe-new-password');
    this.$confirmPassword = $layer.find('.fe-confirm-password');
    this.$setBtn = $layer.find('.fe-set');
  },
  /**
   * @function
   * @desc set data
   */
  _setData: function () {
    var newPasswordTitle = '';
    var confirmPasswordTitle = '';
    var btnName = '';

    if (this.$type === 'new') {
      this.$layer.find('.fe-current-password-wrap').hide();

      newPasswordTitle = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.PASSWORD;
      confirmPasswordTitle = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.CONFIRM_PASSWORD;
      btnName = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.BTN_NEW;
    } else {
      this.$layer.find('.fe-current-password-wrap').show();

      newPasswordTitle = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.CHANGE_PASSWORD;
      confirmPasswordTitle = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.CONFIRM_CHANGE_PASSWORD;
      btnName = Tw.MYT_FARE_PAYMENT_PREPAY_PASSWORD_NAME.BTN_CHANGE;
    }

    this.$layer.find('.fe-new-password-title').text(newPasswordTitle);
    this.$layer.find('.fe-confirm-password-title').text(confirmPasswordTitle);

    this.$setBtn.text(btnName);
  },
  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function () {
    this.$layer.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this));
    this.$layer.on('input', '.required-input-field', $.proxy(this._setMaxValue, this));
    this.$layer.on('blur', '.fe-current-password', $.proxy(this._checkCurrentPassword, this));
    this.$layer.on('blur', '.fe-new-password', $.proxy(this._checkPassword, this));
    this.$layer.on('blur', '.fe-confirm-password', $.proxy(this._checkConfirmPassword, this));
    this.$layer.on('click', '.cancel', $.proxy(this._checkIsAbled, this));
    this.$setBtn.click(_.debounce($.proxy(this._setPassword, this), 500));
  },
  /**
   * @function
   * @desc 입력필드 체크
   * @param event
   */
  _checkIsAbled: function (event) {
    this._checkNumber(event); // 숫자만 입력 가능

    // validation check
    var isValid = false;
    if (this.$type === 'new') {
      isValid = this.$newPassword.val() !== '' && this.$confirmPassword.val() !== '';
    } else {
      isValid = this.$currentPassword.val() !== '' && this.$newPassword.val() !== '' && this.$confirmPassword.val() !== '';
    }

    // 버튼 활성화 체크
    if (isValid) {
      this.$setBtn.removeAttr('disabled');
    } else {
      this.$setBtn.attr('disabled', 'disabled');
    }
  },
  /**
   * @function
   * @desc 숫자만 입력 가능
   * @param event
   */
  _checkNumber: function (event) {
    var target = event.target;
    Tw.InputHelper.inputNumberOnly(target);
  },
  /**
   * @function
   * @desc maxLength 적용
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
   * @desc 현재 패스워드 validation check
   * @param event
   */
  _checkCurrentPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._checkPasswordLength($target);
  },
  /**
   * @function
   * @desc 패스워드 유효성 검증
   * @param event
   */
  _checkPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._checkPasswordLength($target);

    if (this.$isValid) {
      var isValid = (this._validation.checkIsStraight(this.$newPassword.val(), 6) &&
        this._validation.checkIsDifferent(this.$newPassword.val(), this.$birth));

      this.$isValid = this._validation.showAndHideErrorMsg(this.$newPassword, isValid, Tw.ALERT_MSG_MYT_FARE.ALERT_2_V30);
    }
  },
  /**
   * @function
   * @desc 신청 및 변경할 비밀번호와 비밀번호 확인 시 입력한 비밀번호가 같은지 체크
   * @param event
   */
  _checkConfirmPassword: function (event) {
    var $target = $(event.currentTarget);
    this.$isValid = this._checkPasswordLength($target);

    if (this.$isValid) {
      if (Tw.FormatHelper.isEmpty(this.$newPassword.val())) {
        this.$isValid = this._checkPasswordLength(this.$newPassword);
        this.$newPassword.focus();
      } else {
        this.$isValid = this._validation.showAndHideErrorMsg(this.$confirmPassword,
          this._validation.checkIsSame(this.$newPassword.val(), this.$confirmPassword.val()),
          Tw.ALERT_MSG_MYT_FARE.ALERT_2_V12);
      }
    }
  },
  /**
   * @function
   * @desc 6자리 체크
   * @param $target
   * @returns {boolean|*}
   */
  _checkPasswordLength: function ($target) {
    return this._validation.showAndHideErrorMsg($target, this._validation.checkMoreLength($target, 6), Tw.ALERT_MSG_MYT_FARE.CHECK_PASSWORD_LENGTH);
  },
  /**
   * @function
   * @desc set password API 호출
   * @param e
   */
  _setPassword: function (e) {
    var $target = $(e.currentTarget);
    if (this.$isValid) {
      var apiName = this._getApiName();
      var reqData = this._makeRequestData();

      this._apiService.request(apiName, reqData)
        .done($.proxy(this._success, this, $target))
        .fail($.proxy(this._fail, this, $target));
    }
  },
  /**
   * @function
   * @desc set password API name 조회
   * @returns {string}
   */
  _getApiName: function () {
    var apiName = '';
    if (this.$type === 'new') {
      apiName = Tw.API_CMD.BFF_05_0086; // 비밀번호 신청
    } else {
      apiName = Tw.API_CMD.BFF_05_0087; // 비밀번호 변경
    }
    return apiName;
  },
  /**
   * @function
   * @desc 요청 파라미터 생성
   * @returns {{}}
   */
  _makeRequestData: function () {
    var reqData = {};

    reqData.modifyPassword1 = $.trim(this.$layer.find('.fe-new-password').val());
    reqData.modifyPassword2 = $.trim(this.$layer.find('.fe-confirm-password').val());

    if (this.$type === 'change') {
      reqData.oldPassword = $.trim(this.$layer.find('.fe-current-password').val());
    }
    
    return reqData;
  },
  /**
   * @function
   * @desc set password API 응답 처리 (성공)
   * @param $target
   * @param res
   */
  _success: function ($target, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      if (res.result.customerInfo.resultCd === 'VS000') {
        this._setNewPasswordData(); // 성공일 경우 메인화면 텍스트 변경
      } else {
        Tw.Error('', res.result.returnMessage).pop(null, $target);
      }
    } else {
      this._fail($target, res);
    }
  },
  /**
   * @function
   * @desc set password API 응답 처리 (실패)
   * @param $target
   * @param err
   */
  _fail: function ($target, err) {
    Tw.Error(err.code, err.msg).pop(null, $target);
  },
  /**
   * @function
   * @desc password 신청 이후 부모페이지의 text 변경
   */
  _setNewPasswordData: function () {
    var message = '';
    var code = 'AC';

    if (this.$type === 'change') {
      message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_CHANGE_PASSWORD;
    } else {
      message = Tw.ALERT_MSG_MYT_FARE.COMPLETE_REGISTER_PASSWORD;
    }

    var $changeBtn = this.$container.find('.fe-set-password');
    $changeBtn.attr('data-cpin', code);
    $changeBtn.find('span').text(Tw.MYT_FARE_PAYMENT_NAME.CHANGE);

    this._popupService.close();
    this._commonHelper.toast(message); // 신청 및 변경 완료 토스트 출력
  },
  /**
   * @function
   * @desc 잠김 시 부가서비스 페이지로 이동
   */
  _goAdditionalService: function () {
    this._historyService.replaceURL('/myt-join/additions');
  },
  /**
   * @function
   * @desc 초기화 시 부가서비스 페이지로 이동
   */
  _goProductService: function () {
    this._historyService.goLoad('/product/callplan?prod_id=' + this.$target.attr('data-cpin'));
  }
};
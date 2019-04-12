/**
 * @file 비로그인 미환급금 조회 시 sk sms 인증 선택한 경우에 대한 화면 처리
 * @author Hakjoon. sim
 * @since 2018-11-29
 */

Tw.CertificationSkSmsRefund = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;

  this._gender = undefined; // 2: female, 1: male
  this._isCertRequestSuccess = false;
  this._certBtnStatus = 0; // 0: 받기, 1: 다시받기

  this._startTime = undefined;
  this._timer = undefined;
  this._canTimeExpand = true;

  this._seqNo = undefined;
};

Tw.CertificationSkSmsRefund.prototype = {
  SMS_CERT_ERROR: { // validation 문구 출력을 위한 error code 정의
    ATH2003: 'ATH2003', // 재전송 제한시간이 지난 후에 이용
    ATH2006: 'ATH2006', // 제한시간 내 인증번호를 보낼 수 있는 횟수 초과
    ATH2007: 'ATH2007', // 인증번호 불일치
    ATH2008: 'ATH2008', // 인증번호 입력시간 초과
    ATH2011: 'ATH2011',
    ATH2014: 'ATH2014'
  },

  /**
   * @function
   * @desc layer popup으로 해당 인증 화면을 노출
   * @param  {Function} callback - 인증 완료 후 호출할 callback
   */
  openSmsPopup: function (callback) {
    this._callback = callback;

    this._popupService.open({
      hbs: 'MN_01_04_04'
    }, $.proxy(this._onOpenSmsPopup, this));
  },

  /**
   * @function
   * @desc 레이어팝업 발생 후 해당 화면의 각종 이벤트 바인딩
   * @param  {Object} $popupContainer - 해당 레이어 팝업의 최상위 elem
   */
  _onOpenSmsPopup: function ($popupContainer) {
    this.$container = $popupContainer;
    this.$inputName = $popupContainer.find('#fe-input-name');
    this.$inputBirth = $popupContainer.find('#fe-input-birth');
    this.$inputCaptcha = $popupContainer.find('#fe-input-captcha');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$inputNumber = $popupContainer.find('#fe-input-number');
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$captchaImage = $popupContainer.find('#fe-captcha-image');
    this.$captchaError = $popupContainer.find('.fe-captcha-error');
    this.$timer = $popupContainer.find('#fe-timer');
    this.$btnExpTime = $popupContainer.find('#fe-expand-time');

    $popupContainer.on('change', 'input[type="radio"]', $.proxy(this._onGenderChanged, this));
    $popupContainer.on('click', '.captcha-refresh', $.proxy(this._requestCaptchaImg, this));
    $popupContainer.on('click', '.captcha-sound', $.proxy(this._requestCaptchaSound, this));
    $popupContainer.on('click', '#fe-bt-cert', $.proxy(this._onCert, this));
    this.$inputName.on('keyup', $.proxy(this._enableConfirmIfPossible, this));
    this.$inputBirth.on('keyup', $.proxy(this._enableConfirmIfPossible, this));
    this.$inputCaptcha.on('keyup', $.proxy(this._enableConfirmIfPossible, this));
    this.$inputNumber.on('keyup', $.proxy(this._enableCertBtnIfPossible, this));
    this.$inputCert.on('keyup', $.proxy(this._enableConfirmIfPossible, this));
    this.$btConfirm.on('click', $.proxy(this._requestCertConfirm, this));
    this.$btnExpTime.on('click', $.proxy(this._onTimeExpandRequested, this));

    this._requestCaptchaImg();

    new Tw.InputFocusService($popupContainer, this.$btConfirm);
  },

  /**
   * @function
   * @desc BFF로 captcha 이미지 요청
   */
  _requestCaptchaImg: function () {
    this.$captchaImage.attr('src',
      '/bypass' + Tw.API_CMD.BFF_01_0053.path.replace(':version', 'v1') + '?rnd=' + Math.random());
  },

  /**
   * @function
   * @desc BFF로 captcha 사운드 요청
   */
  _requestCaptchaSound: function () {
    new Audio('/bypass' + Tw.API_CMD.BFF_01_0054.path.replace(':version', 'v1')).play();
  },

  /**
   * @function
   * @desc 성별 선택 변경될 경우 처리
   * @param  {Object} e - change event
   */
  _onGenderChanged: function (e) {
    this._gender = e.currentTarget.value;
    this._enableConfirmIfPossible();
  },

  /**
   * @function
   * @desc 인증번호 요청 시 관련 처리
   */
  _onCert: function () {
    if (!this._validate()) { // 인증번호 요청 전 필수 입력되어야 할 필드들이 모두 입력되었는 지 확인
      return;
    }

    var onCaptchaSuccess = function () {
      var data = {
        name: this.$inputName.val().trim(),
        birthDay: this.$inputBirth.val().trim(),
        gender: this._gender,
        svcNum: this.$inputNumber.val().trim()
      };

      // BFF로 인증번효 요청
      this._apiService.request(Tw.API_CMD.BFF_01_0051, data)
        .done($.proxy(function (res) {
          if (res.code === Tw.API_CODE.CODE_00) {
            this._isCertRequestSuccess = true;
            this._seqNo = res.result.seqNo;
            this._showCertSuccess();
            this._getCertNumFromNative();
          } else {
            this._isCertRequestSuccess = false;
            if (!!this.SMS_CERT_ERROR[res.code]) {
              this._showCertError(res.code);
            } else {
              Tw.Error(res.code, res.msg).pop();
            }
          }
          this._enableConfirmIfPossible();
        }, this))
        .fail($.proxy(function (err) {
          this._isCertRequestSuccess = false;
          this._enableConfirmIfPossible();
          Tw.Error(err.code, err.msg).pop();
        }, this));
    };

    var onReadyCert = function () {
      if (this._certBtnStatus === 0) {
        this._requestCaptchaConfirm($.proxy(onCaptchaSuccess, this));
      } else {  // 인증버호 재전송 케이스
        onCaptchaSuccess.call(this);
      }
    };

    if (Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid()) {
      this._nativeService.send(Tw.NTV_CMD.READY_SMS, {}, $.proxy(function () {
        onReadyCert.call(this);
      }, this));
    } else {
      onReadyCert.call(this);
    }
  },

  /**
   * @function
   * @desc 시간 연장하기 요청 시 관련 화면 처리 후 BFF로 신간 연장 요청
   */
  _onTimeExpandRequested: function () {
    if (!this._canTimeExpand) {
      this.$container.find('.fe-exp-txt').addClass('none');
      this.$container.find('#4v-17').removeClass('none');
      return;
    }
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this._seqNo })
      .done($.proxy(this._showTimeExpandSuccess, this));
  },

  /**
   * @function
   * @desc 필수 입력 항목들 유효성 체크 후 필요 시 validation msg 노출
   */
  _validate: function () {
    this.$container.find('.error-txt').addClass('none');
    var ret = true;

    // Name
    if (this.$inputName.val().trim().length === 0) {
      this.$container.find('#fe-name-error').removeClass('none');
      ret = false;
    }

    // Birth
    if (this.$inputBirth.val().trim().length === 0) {
      this.$container.find('#fe-birth-error').removeClass('none');
      ret = false;
    } else if (this.$inputBirth.val().trim().length !== 6) {
      this.$container.find('#fe-birth-wrong').removeClass('none');
      ret = false;
    }

    // Gender
    if (!this._gender) {
      this.$container.find('#fe-gender-error').removeClass('none');
      ret = false;
    }


    // Captcha
    if (this.$inputCaptcha.val().trim().length === 0) {
      this.$container.find('#fe-captcha-error').removeClass('none');
      ret = false;
    }

    return ret;
  },

  /**
   * @function
   * @desc 인증번호 요청 버튼의 활성화 여부 확인 후 처리
   * @param  {Object} e - keyup event
   */
  _enableCertBtnIfPossible: function (e) {
    if (!Tw.FormatHelper.isEmpty(e)) {
      Tw.InputHelper.inputNumberOnly(e.target);
    }

    var number = this.$inputNumber.val().trim();
    if (number.length === 10 || number.length === 11) {
      this.$btCert.removeAttr('disabled');
      return;
    }
    this.$btCert.attr('disabled', 'disabled');
  },

  /**
   * @function
   * @desc 인증하기 버튼 활성화 여부 확인 후 처리
   * @param  {Object} e - keyup event
   */
  _enableConfirmIfPossible: function (e) {
    if (e.currentTarget.id !== 'fe-input-name' && !Tw.FormatHelper.isEmpty(e)) {
      Tw.InputHelper.inputNumberOnly(e.target);
    }

    if (Tw.FormatHelper.isEmpty(this.$inputName.val()) ||
      Tw.FormatHelper.isEmpty(this.$inputBirth.val())) {
      this.$btConfirm.attr('disabled', 'disabled');
      return;
    }
    if (!this._gender) {
      this.$btConfirm.attr('disabled', 'disabled');
      return;
    }
    if (Tw.FormatHelper.isEmpty(this.$inputCaptcha.val())) {
      this.$btConfirm.attr('disabled', 'disabled');
      return;
    }
    if (!this._isCertRequestSuccess || Tw.FormatHelper.isEmpty(this.$inputCert.val())) {
      this.$btConfirm.attr('disabled', 'disabled');
      return;
    }

    this.$btConfirm.removeAttr('disabled');
  },

  /**
   * @function
   * @desc 입력한 captcha 번호 유효성 체크 BFF로 요청
   * @param  {Function} callback - captcha 인증 성공 시 호출할 callback
   */
  _requestCaptchaConfirm: function (callback) {
    this.$captchaError.addClass('none');

    var answer = this.$inputCaptcha.val().trim();
    if (answer === '') {
      this.$captchaError.removeClass('none');
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0055, {}, {}, [answer])
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          callback();
        } else {
          this.$captchaError.removeClass('none');
        }
      }, this))
      .fail(function (err) {
        Tw.Error(err.code, err.msg).pop();
      });
  },

  /**
   * @function
   * @desc 입력한 인증번호 유효성 여부 체크 BFF로 요청, 실패시 케이스에 따른 validation msg 노출
   */
  _requestCertConfirm: function () {
    var data = {
      name: this.$inputName.val().trim(),
      birthDay: this.$inputBirth.val().trim(),
      gender: this._gender,
      svcNum: this.$inputNumber.val().trim(),
      authNum: this.$inputCert.val().trim()
    };
    this._apiService.request(Tw.API_CMD.BFF_01_0052, data)
      .then($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          this._popupService.close();
          if (!!this._callback) {
            this._callback(res);
          }
        } else {
          if ( res.code === this.SMS_CERT_ERROR.ATH2011 ) {
            this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2011);
          } else if ( res.code === this.SMS_CERT_ERROR.ATH2014 ) {
            this._popupService.openAlert(Tw.SMS_VALIDATION.ATH2014);
          } else if (!!this.SMS_CERT_ERROR[res.code]) {
            this._showCertNumberError(res.code);
          } else {
            Tw.Error(res.code, res.msg).pop();
          }
        }
      }, this))
      .fail($.proxy(function (err) {
        Tw.Error(err.code, err.msg).pop();
      }, this));
  },

  /**
   * @function
   * @desc 인증번호 받기 성공 시 관련 화면 처리 및 타이머 동작 시작
   */
  _showCertSuccess: function () {
    this.$container.find('.fe-cert-txt').addClass('none');
    this.$container.find('#4-v8').removeClass('none');

    this.$btCert.text('인증번호 재전송');
    this._certBtnStatus += 1;

    this._startTime = new Date(); // 인증번호 받기 성공시간
    this._timer = setInterval($.proxy(this._tickTimer, this), 1000);
  },

  /**
   * @function
   * @desc timer 1초마다 업데이트하고, 시간 만료 시 처리
   */
  _tickTimer: function () {
    var remained = Tw.DateHelper.getRemainedSec(this._startTime);
    this.$timer.val(Tw.DateHelper.convertMinSecFormat(remained));
    if (remained <= 0) {
      clearInterval(this._timer);
      this._canTimeExpand = false;  // 시간 만료시 시간연장하기 버튼 동작하지 않도록..
    }

    this.$btnExpTime.removeAttr('disabled');  // 시간 연장하기 버튼 제공
  },

  /**
   * @function
   * @desc 시간 연장하기 BFF 요청 성공 시 timer 재설정 및 관련 화면 처리
   * @param  {} resp
   */
  _showTimeExpandSuccess: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      clearTimeout(this._timer);
      this._startTime = new Date();
      this._timer = setInterval($.proxy(this._tickTimer, this), 1000);
      this.$container.find('.fe-exp-txt').addClass('none');
      this.$container.find('#4v-16').removeClass('none');
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 인증번호 받기 실패 시 관련 validation msg 노출
   * @param  {String} code - 에러코드
   */
  _showCertError: function (code) {
    this.$container.find('.fe-cert-txt').addClass('none');
    this.$container.find('.fe-cert-txt.' + code).removeClass('none');
  },

  /**
   * @function
   * @desc 인증번호 입력 후 유효성 확인 실패 시 관련 validation msg 노출
   * @param  {String} code - 에러코드
   */
  _showCertNumberError: function (code) {
    this.$container.find('.fe-exp-txt').addClass('none');
    this.$container.find('.fe-exp-txt.' + code).removeClass('none');
  },

  /**
   * @function
   * @desc native로 부터 문자의 인증번호 전달 받음
   */
  _getCertNumFromNative: function () {
    if (Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid()) {
      this._nativeService.send(Tw.NTV_CMD.GET_CERT_NUMBER, {}, $.proxy(function (res) {
        var number = res.params.cert;
        this.$inputCert.val(number);
        this._enableConfirmIfPossible();
      }, this));
    }
  }
}

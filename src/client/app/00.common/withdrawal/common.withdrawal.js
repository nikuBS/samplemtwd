/**
 * @file common.withdrawal.js
 * @desc 회원탈퇴 처리
 * @author Jayoon Kong
 * @since 2018.10.31
 */

/**
 * @namespace Tw
 * @desc 회원탈퇴 namespace
 */
Tw.CommonWithdrawal = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._init();
};

Tw.CommonWithdrawal.prototype = {
  /**
   * @function
   * @desc 회원탈퇴 풀팝업 페이지 로드
   */
  _init: function () {
    this._popupService.open({
     hbs: 'CO_ME_01_05_01_01'
    },
     $.proxy(this._bindEvent, this),
     $.proxy(this._onCertify, this),
     'withdrawal-guide'
    );
  },
  /**
   * @function
   * @desc event binding
   * @param $layer - 팝업 객체
   */
  _bindEvent: function ($layer) {
    $layer.on('click', '.btn-next', $.proxy(this._requestIfForeigner, this));
  },
  /**
   * @function
   * @desc 내국인/외국인 여부 확인 API 호출
  */
  _requestIfForeigner: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0011)
      .done($.proxy(this._onForiegnerRequestDone, this))
      .fail($.proxy(this._error, this));
  },
  /**
   * @function
   * @desc _requestIfForeigner 호출 결과 처리
   * @param res
   */
  _onForiegnerRequestDone: function (res) {
    if (res.code === '00') {
      this._isForeigner = res.result.frgnrClCd === '9';
      this._isResponsed = true;
      this._popupService.close();
    } else {
      this._error(res);
    }
  },
  /**
   * @function
   * @desc popup close callback - 다음페이지(팝업)로 이동
   */
  _onCertify: function () {
   if (this._isResponsed) {
     this._showKYC();
   }
  },
  /**
   * @function
   * @desc 내국인/외국인 여부에 따라 인증페이지 다르게 호출
   */
  _showKYC: function () {
   var hbsFile = '';
   if (this._isForeigner) {
     hbsFile = 'CO_ME_01_05_01_02_02';
   } else {
     hbsFile = 'CO_ME_01_05_01_02_01';
   }
   this._popupService.open({
      hbs: hbsFile
   },
     $.proxy(this._onOpenKYC, this),
     $.proxy(this._onSurvey, this),
     'withdrawal-cert');
  },
  /**
   * @function
   * @desc 인증 페이지 event binding
   * @param $layer - 팝업 객체
   */
  _onOpenKYC: function ($layer) {
    this._focusService = new Tw.InputFocusService($layer, $layer.find('.btn-certify')); // 키패드의 이동 버튼 클릭 시 다음 input으로 이동

    $layer.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this, $layer));
    $layer.on('click', '.cancel', $.proxy(this._checkIsAbled, this, $layer));
    $layer.on('click', '.btn-certify', $.proxy(this._onConfirmKYC, this, $layer));
  },
  /**
   * @function
   * @desc 필수 input값 null check 후 인증하기 버튼 활성화/비활성화 처리
   * @param $layer - 팝업 객체
   */
  _checkIsAbled: function ($layer) {
    this._hideErrorMessage($layer);

    if ($.trim($layer.find('.fe-name').val()) !== '' && $.trim($layer.find('.fe-birth').val()) !== '') {
     $layer.find('.btn-certify').removeAttr('disabled');
    } else {
     $layer.find('.btn-certify').attr('disabled', 'disabled');
    }
  },
  /**
   * @function
   * @desc 인증하기 버튼 클릭 시 인증 API 호출
   * @param $layer - 팝업 객체
   */
  _onConfirmKYC: function ($layer) {
    var name = $.trim($layer.find('.fe-name').val());
    var birth = $.trim($layer.find('.fe-birth').val());

    this._apiService.request(Tw.API_CMD.BFF_03_0002, { name: name, birthDt: birth })
     .done($.proxy(this._onKycRequestDone, this, $layer))
     .fail($.proxy(this._showErrorMessage, this, $layer));
  },
  /**
   * @function
   * @desc 인증하기 API 호출 후 응답 처리
   * @param $layer - 팝업 객체
   * @param res
   */
  _onKycRequestDone: function ($layer, res) {
    if (res.code === '00') {
     this._isCertified = true;
     this._popupService.close();
    } else {
     this._showErrorMessage($layer);
    }
  },
  /**
   * @function
   * @desc 인증하기 실패 시 에러메시지 노출
   * @param $layer - 팝업 객체
   */
  _showErrorMessage: function ($layer) {
    $layer.find('.fe-input-box').addClass('error');
    $layer.find('.error-txt').show();
  },
  /**
   * @function
   * @desc 에러메시지 숨김
   * @param $layer - 팝엽 객체
   */
  _hideErrorMessage: function ($layer) {
   $layer.find('.fe-input-box').removeClass('error');
   $layer.find('.error-txt').hide();
  },
  /**
   * @function
   * @desc 인증 완료 후 다음 페이지(설문조사 팝업)으로 이동
   */
  _onSurvey: function () {
   if (this._isCertified) {
     new Tw.CommonWithdrawalSurvey();
   }
  },
  /**
   * @function
   * @desc API 에러 시 공통 에러팝업 호출
   * @param err
   */
  _error: function (err) {
   Tw.Error(err.code, err.msg).pop();
  }
};

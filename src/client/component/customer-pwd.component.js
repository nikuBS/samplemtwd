/**
 * @file 고객보호 비밀번호 관련 화면 처리
 * @author Hakjoon Sim
 * @since 2018-12-04
 */

/**
 * @constant
 * @param  {Object} rootEl - 최상위 elem
 * @param  {String} target - 완료 후 이동할 url
 */
Tw.CustomerPwdComponent = function (rootEl, target) {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._isCloseCallbackNeeded = false;
  this._pwdSuccess = false;
  this._target = target || '/main/home';

  // error when login
  this._loginErrorCode = {
    UNDER_3: 'ICAS3213',       // 고객보호비밀번호 오입력(3회 미만)
    ERROR_3: 'ICAS3212',       // 고객보호비밀번호 오입력(3회)
    ERROR_4: 'ICAS3215',       // 고객보호비밀번호 오입력 (4회)
    BLOCKED: 'ICAS3216'        // 고객보호비밀번호 잠김 (지점 내점 안내 노출)
  };

  this._lineChangeErrorCode = {
    ERROR_1: 'ICAS3481',       // 고객보호비밀번호 입력 오류 1회
    ERROR_2: 'ICAS3482',       // 고객보호비밀번호 입력 오류 2회
    ERROR_3: 'ICAS3483',       // 고객보호비밀번호 입력 오류 3회
    ERROR_4: 'ICAS3484',       // 고객보호비밀번호 입력 오류 4회
    BLOCKED: 'ICAS3215'        // 고객보호비밀번호 입력 오류 5회 (잠김예정)
  };

  if ( Tw.FormatHelper.isEmpty(rootEl) ) { // 고객보호 입력이 독립 페이지, 레이어 팝업 두 케이스가 있음으로 분기 처리
    this._isPopup = true;
    return;
  }

  this._isPopup = false;
  this.$container = rootEl;

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.CustomerPwdComponent.prototype = {

  /**
   * @function
   * @desc 레이어팝업 형태로 뜨는 케이스에 대한 초기화
   * @param  {Object} $layer - 레이어팝업의 최상위 elem
   */
  _onPopupOpend: function ($layer) {
    this.$container = $layer;
    this.$container.find('.fe-svc-num').text(this._mdn);

    this._cachedElement();
    this._init();
    this._bindEvent();
  },
  _cachedElement: function () {
    this.$pwdWrap = this.$container.find('.fe-pw-wrap');
    this.$firstPwd = this.$container.find('.fe-first-pwd');
    this.$errMsg = this.$container.find('.fe-error-msg');
    this.$pwd = this.$container.find('input');
  },
  _init: function () {
    this._hideErrMsg();
    this._removeValue();
    this._firstFocus();
  },
  _bindEvent: function () {
    this.$pwdWrap.on('input', 'input', $.proxy(this._onInput, this));
    this.$pwdWrap.on('keyup', 'input', $.proxy(this._checkDelete, this));
  },

  /**
   * @function
   * @desc 고객보호 비밀번호 각 자리수의 입력 이벤트 발생시 관련 처리
   * @param  {Object} event - input event
   */
  _onInput: function (event) {
    var $target = $(event.currentTarget);
    if ( !$target.hasClass('fe-first-pwd') ) { // 첫번째 필드의 입력이 아닌 경우 중간에 비어 있는 필드 있는지 확인 후 처리
      var $prev = $target.parent().prev().find('input');
      if ( Tw.FormatHelper.isEmpty($prev.val()) ) {
        this._removePwd();
        this.$firstPwd.focus();
        return;
      }
    }

    this._hideErrMsg();
    this._setAsterisk($target);
    this._moveFocus($target);
  },

  /**
   * @function
   * @desc backspace 이벤트 발생 시 현재 필드 입력내용 삭제하고 이전 필드로 포커스
   * @param  {Object} e - keyup event
   */
  _checkDelete: function (e) {
    var $target = $(e.currentTarget);
    if (e.key === 'Backspace' && !$target.hasClass('fe-first-pwd')) {
      var $prev = $target.parent().prev().find('input');
      $prev.val('');

      $prev.parent().addClass('active').removeClass('entered');
      setTimeout(function () {
        $prev.focus();
      }, 0);
    }
  },

  /**
   * @function
   * @desc 에러메세지 숨김
   */
  _hideErrMsg: function () {
    this.$errMsg.hide();
  },

  /**
   * @function
   * @desc 첫 입력필드로 포커스 이동
   */
  _firstFocus: function () {
    setTimeout($.proxy(function () {
      this.$firstPwd.focus();
    }, this), 300);
  },

  /**
   * @function
   * @desc 입력된 번호 삭제
   */
  _removeValue: function () {
    this.$pwd.val('');
  },

  /**
   * @function
   * @desc 입력된 비밀번호 masking
   * @param  {Object} $target - masking 처리할 elem
   */
  _setAsterisk: function ($target) {
    $target.parent().removeClass('active').addClass('entered');
  },

  /**
   * @function
   * @desc 마지막 필드에 입력이 완료된 경우 login 요청, 그렇지 안은 경우 다음 field로 포커스 이동
   * @param  {Object} $target - 현재 포커스된 elem
   */
  _moveFocus: function ($target) {
    if ( $target.hasClass('fe-last') ) {
      this._requestLogin();
    } else {
      var $nextTarget = $target.parent().next();
      $nextTarget.addClass('active');
      setTimeout(function () {
        $nextTarget.find('input').focus();
      }, 0);
    }
  },

  /**
   * @function
   * @desc 입력된 비밀번호 삭제
   */
  _removePwd: function () {
    this.$pwd.val('');
    this.$pwd.parent().addClass('active').removeClass('entered');
  },

  /**
   * @function
   * @desc 비번 입력 완료된 경우 회선변경 케이스인지, 로그인 케이스인지에 따른 각각 처리
   */
  _requestLogin: function () {
    var api = this._isPopup ? Tw.NODE_CMD.CHANGE_SESSION : Tw.NODE_CMD.LOGIN_SVC_PASSWORD;
    var data = { svcPwd: this._getPwd() };
    if ( this._isPopup ) {
      data.svcMgmtNum = this._serviceNumber;
    }
    this._apiService.request(api, data)
      .done($.proxy(this._onLoginReuestDone, this))
      .fail($.proxy(this._onError, this));
  },

  /**
   * @function
   * @desc 각각의 input 에 입력된 비밀번호 하나의 string 으로 합쳐 return
   */
  _getPwd: function () {
    var pwd = '';
    this.$pwd.each(function () {
      pwd += $(this).val().toString();
    });
    return pwd;
  },

  /**
   * @function
   * @desc login 시도 후 결과에 따라 에러메시지 노출 혹은 다음 단계로 진행
   * @param  {Object} res - login 시도 후 결과
   */
  _onLoginReuestDone: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._onSuccess();
    } else {
      var errCount = 0;
      var unexpectedError = false;
      switch ( res.code ) {
        case this._lineChangeErrorCode.ERROR_1:
          errCount = 1;
          break;
        case this._lineChangeErrorCode.ERROR_2:
          errCount = 2;
          break;
        case this._lineChangeErrorCode.ERROR_3:
        case this._loginErrorCode.ERROR_3:
          errCount = 3;
          break;
        case this._lineChangeErrorCode.ERROR_4:
        case this._loginErrorCode.ERROR_4:
          errCount = 4;
          break;
        case this._lineChangeErrorCode.BLOCKED:
        case this._loginErrorCode.BLOCKED:
          this._showFail();
          return;
        default:
          unexpectedError = true;
          break;
      }

      if ( errCount >= 1 ) {
        this.$errMsg.find('span').text(errCount);
        this.$errMsg.show();
      }

      if ( unexpectedError ) {
        this._onError(res);
      }
      this._initField();
    }
  },

  /**
   * @function
   * @desc 잘못된 비번 입력시 틀린 카운트 변경하여 string 값 return
   * @param  {String} msg - 출력할 메세지
   * @param  {number} count - 실패한 카운트
   */
  _changeCount: function (msg, count) {
    return msg.replace(/\d/, count);
  },

  /**
   * @function
   * @desc 비번 입력 필드 초기화
   */
  _initField: function () {
    this.$pwdWrap.find('li').removeClass('entered');
    this.$firstPwd.parent().addClass('active');

    this._removeValue();
    this._firstFocus();
  },

  /**
   * @function
   * @desc 레이어 팝업 케이스에서 팝업이 닫히는 경우 케이스별로 처리
   */
  _onPwdPopupClosed: function () {
    if ( !this._isCloseCallbackNeeded ) {
      if ( this._isPopup ) {
        this._callback( {code: Tw.CALLBACK_CODE.CANCEL });
      }
      return;
    }
    if ( this._pwdSuccess ) {
      if ( this._isPopup ) {
        this._callback({ code: Tw.CALLBACK_CODE.SUCCESS });
      }
    } else {
      if ( this._isPopup ) {
        this._goFailPage();
      }
    }
  },

  /**
   * @function
   * @desc 비번입력 성공 시 팝업(회선변경)/페이지(로그인) 케이스에 따라 각각 다음단계로 진행
   */
  _onSuccess: function () {
    this._pwdSuccess = true;
    if ( this._isPopup ) {
      this._isCloseCallbackNeeded = true;
      this._popupService.close();
    } else {
      this._apiService.sendNativeSession(Tw.AUTH_LOGIN_TYPE.TID, $.proxy(this._successSetSession, this));
    }
  },

  /**
   * @function
   * @desc 에러 발생 시 팝업으로 정보 노출
   * @param  {Object} err - 에러정보
   */
  _onError: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },

  /**
   * @function
   * @desc 로그인 session 연결 완료 후 target url로 이동
   */
  _successSetSession: function () {
    this._historyService.replaceURL(this._target);
  },

  /**
   * @function
   * @desc 비번 입력 실패(제한횟수 초과) 시 처리
   */
  _showFail: function () {
    this._pwdSuccess = false;
    if ( this._isPopup ) {
      this._isCloseCallbackNeeded = true;
      this._popupService.close();
    } else {
      this._goFailPage();
    }
  },

  /**
   * @function
   * @desc 실패 화면으로 이동
   */
  _goFailPage: function () {
    $(':focus').blur();
    setTimeout($.proxy(function () {
      this._historyService.replaceURL('/common/member/login/cust-pwdfail');
    }, this), 300);
    // this._historyService.replaceURL('/common/tid/logout?target=/common/member/login/cust-pwdfail');
  },

  /**
   * @function
   * @desc layer popup 띄우면서 필요한 정보들 넘겨줌
   * @param  {String} mdn - 전화번호
   * @param  {String} serviceNumber- 해당 고객의 service number
   * @param  {Function} callback - 완료 후 실행할 callback
   */
  openLayer: function (mdn, serviceNumber, callback) {
    this._mdn = mdn;
    this._serviceNumber = serviceNumber;
    this._callback = callback;

    this._popupService.open({
        url: '/hbs/',
        hbs: 'CO_ME_01_02_02_02_02',
        layer: true
      },
      $.proxy(this._onPopupOpend, this),
      $.proxy(this._onPwdPopupClosed, this));
  }
};

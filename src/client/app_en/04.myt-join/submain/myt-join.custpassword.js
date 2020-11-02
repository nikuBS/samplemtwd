/**
 * MenuName: 나의 가입정보 > 서브메인 > 고객보호 비밀번호 설정/변경(MS_01_01_01)
 * @file myt-join.custpassword.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.09.28
 * Summary: 고객 비밀번호 설정/변경
 */
Tw.MytJoinCustpassword = function ($element, isNew) {
 
  this.type = {
    SET: '20',    // 설정
    CHANGE: '30'  // 변경
  };

  this.$container = $element;
  this._new = (isNew === 'true');
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService($element);
  this._tidLanding = new Tw.TidLandingComponent();
  this._historyService.init('hash');
  this._currentHash = '';

 

 
  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MytJoinCustpassword.prototype = {
  _cachedElement: function () {
    this.$enterWrap = this.$container.find('.fe-enter-wrap'); //입력
    this.$confirmWrap = this.$container.find('.fe-confirm-wrap'); //확인
    this.$focusWrap = this.$container.find('.password-wrap.active'); //활성화된 입력
    this.$pwdInput = this.$container.find('.protect-pass-wrap '); //입력항목전체
    

    //활성화 변경시 변경되는 항목
    this.$pwdWrap = this.$focusWrap.find('.fe-pw-wrap'); //입력항목
    this.$firstPwd = this.$focusWrap.find('.fe-first-pwd');
    this.$pwd = this.$focusWrap.find('input');
    
  },
  _init: function () {
    this._initWrap();
    this._removeValue();
    this._firstFocus();
  },  
  /** 
   * @function
   * @desc 화면초기화
   */
  _initWrap: function () {
    this.$enterWrap.show();
    this.$confirmWrap.hide();
  },  
  //element event bind
  _bindEvent: function () {


    // 변경 혹은 설정
    $('#btn-change').on('click', $.proxy(this._onOkClicked, this));
    // 취소버튼
    $('.prev-step').on('click', $.proxy(this._confirmBack, this));

    this.$pwdInput.off('input').on('input', 'input', $.proxy(this._onInput, this));
    this.$pwdInput.off('keyup').on('keyup', 'input', $.proxy(this._checkDelete, this));    
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
   * @desc 마지막 필드에 입력이 완료된 경우 확인입력 화면 이동, 그렇지 안은 경우 다음 field로 포커스 이동
   * @param  {Object} $target - 현재 포커스된 elem
   */
  _moveFocus: function ($target) {
    $('#btn-change').prop('disabled',true);
    if ( $target.hasClass('fe-last') ) {
      //확인입력인지 확인하여 처리
      if(!$target.parent().parent().parent().hasClass('fe-confirm-wrap')) {
        this._moveWrap(1); //확인입력화면 이동
      } else {
        //저장버튼 활성화
        $('#btn-change').prop('disabled',false);
      }
    } else {//다음입력 이동
      var $nextTarget = $target.parent().next();
      $nextTarget.addClass('active');
      setTimeout(function () {
        $nextTarget.find('input').focus();
      }, 0);
    }
  },
  /**
   * @function
   * @desc 화면전환
   * @param  {int} num - 화면 인덱스
   */
  _moveWrap: function (num) {
    
    $('.password-wrap').removeClass('active');
    $('.password-wrap').eq(num).addClass('active');

    this.$focusWrap = this.$container.find('.password-wrap.active'); //활성화된 입력
    //활성화 변경시 변경되는 항목
    this.$pwdWrap = this.$focusWrap.find('.fe-pw-wrap'); //입력항목
    this.$firstPwd = this.$focusWrap.find('.fe-first-pwd');
    this.$pwd = this.$focusWrap.find('input');
    this._initField();

    $('.password-wrap').hide();
    $('.password-wrap').eq(num).show();
        
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
   * @desc 각각의 input 에 입력된 비밀번호 하나의 string 으로 합쳐 return
   */
  _getEnterPwd: function () {
    var pwd = '';
    this.$enterWrap.find('input').each(function () {
      pwd += $(this).val().toString();
    });
    return pwd;
  },  
  /**
   * @function
   * @desc 각각의 input 에 입력된 비밀번호 하나의 string 으로 합쳐 return
   */
  _getConfirmPwd: function () {
    var pwd = '';
    this.$confirmWrap.find('input').each(function () {
      pwd += $(this).val().toString();
    });
    return pwd;
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
   * step2. 변경 혹은 설정
   * @private
   */
  _onOkClicked: function (/*event*/) {

    var orgPwd = this._getEnterPwd();
    var checkPwd = this._getConfirmPwd();

    if( !orgPwd || !checkPwd ) return;

    // 비밀번호 입력과 확인이 다른 경우
    if ( orgPwd !== checkPwd ) {
      this._initField();     
      this._moveWrap(0);

      this._popupService.openAlert(
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A63.MSG,
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A63.TITLE);
      return;
    }

    // Call API
    var pwd = orgPwd;
    var api = Tw.NODE_CMD.CHANGE_SVC_PASSWORD;
    var data = {
      // 20:설정, 30:변경,
      chgCd: this._new ? this.type.SET : this.type.CHANGE, // 필수 값
      svcChgPwd: pwd // 변경, 설정
    };

    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService
      .request(api, data)
      .done($.proxy(this._onApiSuccess, this))
      .fail($.proxy(this._onApiError, this));
  },

  /**
   * 변경/설정 처리 완료시
   * @param params
   * @private
   */
  _onApiSuccess: function (params) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Logger.info(params);
    if ( params.code === Tw.API_CODE.CODE_00 ) {

      // update svcInfo
      this._apiService.request(Tw.NODE_CMD.UPDATE_SVC, {})
        .done($.proxy(function(){

          var msgObj = this._new ? Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A64 : Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A62;
          this._popupService.openAlert(msgObj.MSG, msgObj.TITLE, null, $.proxy(function(){
            // 완료 후 MS페이지로 이동
            this._historyService.goLoad('/en/myt-join/submain/');
          }, this));
        }, this));

    }
    else {
      // ICAS3215	고객보호비밀번호 오입력 5회(잠김 예정)
      // ICAS3216	고객보호비밀번호 기 잠김 (지점 내점 안내 노출)
      if ( params.code === 'ICAS3216' ) {
        this._popupService.openAlert(Tw.MYT_JOIN_CUSTPASS.BLOCKED_PWD);
      } else {
        Tw.Error(params.code, params.msg).pop();
      }
    }
  },

  _onApiError: function (params) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(params.code, params.msg).pop();
  },

  /**
   * 닫기(X) 버튼 클릭시
   * @private
   */
  _onclickBtnCancel: function(){
    // 입력한 값이 있는지
    var hasInput = (
      (this._getEnterPwd().length > 0) ||  (this._getConfirmPwd().length > 0)
    );

    // 입력값이 있는 경우 입력값 버릴건지 확인
    if(hasInput){
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(this._confirmBack, this),
        null,
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES);
    } else {
      this._confirmBack();
    }

  },

  _confirmBack: function(){

    if( this._new ){

      // 2_A200
      this._popupService.openConfirm(
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A200.MSG,
        Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A200.TITLE,
        $.proxy(function(){
          // logout and home(HO)으로 이동
          this._tidLanding.goLogout();
          //this._historyService.goLoad('/main/home');

          /*if ( Tw.BrowserHelper.isApp() ) {
            Tw.Native.send(Tw.NTV_CMD.LOGOUT, {}, $.proxy(function(){
              this._apiService.request(Tw.NODE_CMD.LOGOUT_TID, {})
                .done($.proxy(function(){
                  this._historyService.goLoad('/main/home');
                }, this));
            }, this));
          } else {
            this._historyService.goLoad(url);
          }*/
        }, this),
        function(){
          Tw.Popup.close();
        }
        );
    } else {

      // main(MS)으로 이동
      // this._historyService.goLoad('/myt-join/submain');
      this._historyService.goBack();

    }
  }


};
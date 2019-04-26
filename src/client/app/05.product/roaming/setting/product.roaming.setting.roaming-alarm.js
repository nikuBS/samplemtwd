/**
 * @file product.roaming.setting.roaming-alarm.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.05
 * ID : RM_11_01_02_01
 */
/**
 * @class
 * @desc 로밍 도착 알리미 회선 설정 페이지
 *
 * @param {Object} rootEl - 최상위 element Object
 * @param {String} prodTypeInfo - 상품 원장 정보
 * @param {Object} prodBffInfo – 상품 상세 정보
 * @param {String} prodId - 상품 id
 * @returns {void}
 */
Tw.ProductRoamingSettingRoamingAlarm = function (rootEl,prodTypeInfo,prodBffInfo,prodId) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._nativeService = Tw.Native;
  this._addedList = this._sortingSettingData(prodBffInfo.combinationLineList);
  this._prodTypeInfo = prodTypeInfo;
  this._prodBffInfo = prodBffInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;
  this._init();
  this._showAuthState = false;  //마스킹 해제 출력 상태 , 마스킹 해제시 새로고침되면서 기본값 으로 변경
};

Tw.ProductRoamingSettingRoamingAlarm.prototype = {
  /**
   * @function
   * @member
   * @desc 초기화 함수
   * @returns {void}
   */
  _init : function () {
    if(!Tw.BrowserHelper.isApp()){  //앱이 아닐경우 주소록 버튼 숨기기
      this.$container.find('#phone_book').hide();
    }
    this._bindElementEvt();
  },
  /**
   * @function
   * @member
   * @desc 이벤트 바인딩
   * @returns {void}
   */
  _bindElementEvt : function () {
    this.$container.on('click','.fe-btn_del_num',$.proxy(this._removeEvt,this));
    this.$inputElement = this.$container.find('#input_phone');
    this.$addBtn = this.$container.find('#add_list');
    this.$confirmBtn = this.$container.find('#confirm_info');
    this.$alarmTemplate = this.$container.find('#alarm_template');
    this.$container.on('keyup', '#input_phone', $.proxy(this._activateAddBtn, this));
    this.$container.on('blur', '#input_phone', $.proxy(this._inputBlurEvt, this));
    this.$container.on('focus', '#input_phone', $.proxy(this._inputFocusEvt, this));
    this.$container.on('click', '#phone_book', $.proxy(this._showPhoneBook, this));
    this.$container.on('click', '#add_list', $.proxy(this._addPhoneNumOnList, this));
    this.$container.on('click','.cancel',$.proxy(this._clearInput,this));
    this.$container.on('click','.prev-step.tw-popup-closeBtn',$.proxy(this._historyService.goBack,this));
    this.$container.on('click','.fe-bt-masking-alert',$.proxy(this._openAuthAlert,this));
  },
  /**
   * @function
   * @member
   * @desc 전화번호입력창 내용 삭제 함수
   * @returns {void}
   */
  _clearInput : function(){
    this.$inputElement.val('');
    this._activateAddBtn();
  },
  /**
   * @function
   * @member
   * @desc 전화번호입력창 blur시 실행 함수
   * @returns {void}
   */
  _inputBlurEvt : function(){ //인풋 blur 이벤트
    var tempVal = this.$inputElement.val();
    tempVal = Tw.FormatHelper.addLineCommonPhoneNumberFormat(tempVal);  //인풋 blur시 전화번호 하이픈 넣기
    this.$inputElement.attr('maxlength','13');  //하이픈 추가에 따른 최대 길이 변경
    this.$inputElement.val(tempVal);
    //this._activateAddBtn();
  },
  /**
   * @function
   * @desc 전화번호입력창 focus시 실행 함수
   * @returns {void}
   */
  _inputFocusEvt : function(){  //인풋 focus 이벤트
    var tempVal = this.$inputElement.val().replace(/\-/g,''); //하이픈 제거
    this.$inputElement.attr('maxlength','11');  //하이픈 제거에 따른 최대길이 변경
    this.$inputElement.val(tempVal);
  },
  /**
   * @function
   * @member
   * @desc 전화번호 추가 함수
   * @param evt 이벤트 객체
   * @returns {void}
   */
  _addPhoneNumOnList : function (evt) { //전화번호 추가 요청
    if(this._addedList.length>=5){  //전화번호 리스트 5명일경우 얼럿 출력

      this._openAlert(
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A7.MSG,
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A7.TITLE,evt);
      return;
    }
    var targetValue = this.$inputElement.val();
    if(targetValue.indexOf('-')<0){ //하이픈 없을경우 하이픈 추가
      targetValue = Tw.FormatHelper.addLineCommonPhoneNumberFormat(targetValue);
    }
    var tempPhoneNum = targetValue.split('-');  //하이픈으로 전화번호 잘라내기
    //var phonReg = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})([0-9]{3,4})([0-9]{4})$/;
    var phoneObj = {
      'serviceNumber1' : tempPhoneNum[0],
      'serviceNumber2' : tempPhoneNum[1],
      'serviceNumber3' : tempPhoneNum[2]
    };
    //정상적인 전화번호 아닐경우 얼럿 출력
    if(!Tw.FormatHelper.isPhoneNum(phoneObj.serviceNumber1+phoneObj.serviceNumber2+phoneObj.serviceNumber3)||parseInt(phoneObj.serviceNumber2.substring(0,phoneObj.serviceNumber2.length-2),10)===0){
      this._openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG,Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE,evt);
      return;
    }
    var requestValue = {
      'svcNumList' : [phoneObj]
    };
    Tw.CommonHelper.startLoading('.popup-page', 'white');
    this._apiService.request(Tw.API_CMD.BFF_10_0020, requestValue, {},[this._prodId]).
    done($.proxy(function (res) {
      Tw.CommonHelper.endLoading('.popup-page');
      if(res.code===Tw.API_CODE.CODE_00){
        this._historyService.reload();  //전화번호 추가시 새로고침
      }else{
        this._openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,evt); //실패시 얼럿
      }
    }, this)).fail($.proxy(function (err) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,evt);
    }, this));
  },
  /**
   * @function
   * @member
   * @desc 주소록 native interface 호출 함수
   * @returns {void}
   */
  _showPhoneBook : function () {  //주소록 호출 native interface
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._phoneBookCallBack,this));
  },
  /**
   * @function
   * @member
   * @desc 주소록 주소 선택 callback 함수
   * @param {Object} res 선택한 주소록 정보
   * @returns {void}
   */
  _phoneBookCallBack : function(res){ //주소록 선택 콜백
    if (res.resultCode === Tw.NTV_CODE.CODE_00) {
      this.$inputElement.val(res.params.phoneNumber.replace(/\-/g,''));
      this.$inputElement.trigger('keyup');
      this.$inputElement.blur();
    }
  },
  /**
   * @function
   * @member
   * @desc 전화번호 추가하기 버튼 활성화 함수
   * @param {Object} inputEvt 이벤트 객체
   * @returns {void}
   */
  _activateAddBtn : function (inputEvt) { //전화번호 입력 keyup 콜백, 추가버튼 활성화 함수
    if(inputEvt&&Tw.InputHelper.isEnter(inputEvt)){
      this.$addBtn.trigger('click');
    }
    var inputVal = this.$inputElement.val();
    var numReg = /[^0-9]/g;
    if(inputVal.length>0&&numReg.test(inputVal)){ //번호만 입력 확인
      var changedValue = inputVal.replace(numReg,'');
      this.$inputElement.blur();
      this.$inputElement.val('');
      this.$inputElement.val(changedValue);
      this.$inputElement.focus();
      if(changedValue.length<=0){
        this.$container.find('.cancel').trigger('click');
      }
    }
    if(this.$inputElement.val().length>=10){  //입력한 번호가 10개 미만일 경우 전화번호 추가 버튼 disable
      this.$addBtn.removeAttr('disabled');
    }else{
      this.$addBtn.attr('disabled','disabled');
    }
    this._activateConfirmBtn();
  },
  /**
   * @function
   * @member
   * @desc 정보확인 팝업 출력 버튼 활성화 함수
   * @returns {void}
   */
  _activateConfirmBtn : function () { //저장 버튼 활성화 함수
    if(this._addedList.length>=1){
      this.$confirmBtn.removeAttr('disabled');
    }else{
      this.$confirmBtn.attr('disabled','disabled');
    }
  },
  /**
   * @function
   * @member
   * @desc 얼럿 출력 함수
   * @param {String} msg 얼럿 메시지
   * @param {String} title 얼럿 타이틀
   * @param {Object} evt 이벤트객체
   * @returns {void}
   */
  _openAlert : function (msg,title,evt) { //얼럿 출력 함수 , 얼럿 출력시 바닥페이지 css 변하는 현상에 대한 처리
    this._popupService.openAlert(
      msg,
      title,
      null,
      $.proxy(function () {
        this.$addBtn.removeAttr('style');
        //$(evt.currentTarget).focus();
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      }, this),null,$(evt.currentTarget)
    );
    if(!this.$addBtn.attr('disabled')){
      this.$addBtn.css({'pointer-events':'none','background':'#3b98e6'});
    }
  },
  /**
   * @function
   * @member
   * @desc 전화번호 삭제 확인 팝업 호출 함수
   * @param {Object} btnEvt 이벤트객체
   * @returns {void}
   */
  _removeEvt : function (btnEvt) {  //전화번호 삭제 이벤트
    if(this._addedList.length<=1){  //전화번호 리스트 하나만 남았을 경우 얼럿 출력
      this._openAlert(null,Tw.ALERT_MSG_PRODUCT.ALERT_NUMBER_MIN,btnEvt);
      return;
    }
    this._popupService.openConfirmButton( //확인 팝업 출력
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
      $.proxy(function () {
        this._popupService.close();
        this._removeOnList(btnEvt);
      },this),
      $.proxy(function () {
        //닫힐 때 접근성 관련 처리
        this.$container.find('.fe-main-content').attr('aria-hidden',false);
      },this),
      Tw.BUTTON_LABEL.CLOSE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON,$(btnEvt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 전화번호 삭제 함수
   * @param {Object} evt 이벤트객체
   * @returns {void}
   */
  _removeOnList : function (evt) {  //전화번호 삭제 요청
    var $target = $(evt.currentTarget);
    //var selectedIndex = $target.data('idx');
    var selectedIndex = $target.parents('li').index();
    var requestValue = {
      'svcNumList' : [this._addedList[selectedIndex]]
    };
    Tw.CommonHelper.startLoading('.popup-page', 'white');
    this._apiService.request(Tw.API_CMD.BFF_10_0019, requestValue, {},[this._prodId]).
    done($.proxy(function (res) {
      Tw.CommonHelper.endLoading('.popup-page');
      if(res.code===Tw.API_CODE.CODE_00){
        this._addedList.splice(selectedIndex,1);
        $target.parents('li').remove();
      }else{
        this._openAlert(res.msg,Tw.POPUP_TITLE.NOTIFY,evt); //요청 실패시 얼럿
      }
    }, this)).fail($.proxy(function (err) {
      Tw.CommonHelper.endLoading('.popup-page');
      this._openAlert(err.msg,Tw.POPUP_TITLE.NOTIFY,evt);
    }, this));
  },
  /**
   * @function
   * @member
   * @desc 전화번호 리스트 변환
   * @param {Array} inputData 전화번호 리스트
   * @returns {Array}
   */
  _sortingSettingData : function (inputData) {
    for(var i=0;i<inputData.length;i++){
      if(!inputData[i].svcNumMask){
        return;
      }
      var tempArr = inputData[i].svcNumMask.split('-');
      inputData[i] = {
        'serviceNumber1' : tempArr[0],
        'serviceNumber2' : tempArr[1],
        'serviceNumber3' : tempArr[2]
      };
    }
    return inputData;
  },
  /**
   * @function
   * @member
   * @desc 마스킹 해제 확인 팝업 출력 함수
   * @param {String} evt 이벤트 객체
   * @returns {void}
   */
  _openAuthAlert : function (evt) { //마스킹 해제 확인 팝업 출력
    this._popupService.openConfirmButton(
      Tw.PRODUCT_AUTH_ALERT_STR.MSG,
      Tw.PRODUCT_AUTH_ALERT_STR.TITLE,
      $.proxy(this._showAuth,this),
      $.proxy(function () {
        if(!this._showAuthState){
          //$(evt.currentTarget).focus();
          this.$container.find('.fe-main-content').attr('aria-hidden',false);
        }else{
          this._showAuthState = false;
        }
      },this),
      Tw.BUTTON_LABEL.CANCEL,
      Tw.BUTTON_LABEL.CONFIRM,$(evt.currentTarget));
  },
  /**
   * @function
   * @member
   * @desc 마스킹 해제 액션시트 출력
   * @returns {void}
   */
  _showAuth : function () { //마스킹 해제 팝업 출력 함수
    this._showAuthState = true;
    this._popupService.close();
    $('.fe-bt-masking').trigger('click'); //실제 마스킹 해제 팝업 출력 하는 부분
  }

};

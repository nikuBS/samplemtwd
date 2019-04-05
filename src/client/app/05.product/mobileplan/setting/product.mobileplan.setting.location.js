/**
 * MenuName: 상품 > 가입설정해지 > 010캠퍼스요금제,TTL지역할인요금제,TTL캠퍼스10요금제 (MP_02_02_03_08)
 * @file product.mobileplan.setting.location.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.11.13
 * Page ID: MP_02_02_03_08
 * Summary: 할인지역,지정번호 입력/변경
 */
Tw.ProductMobileplanSettingLocation = function(rootEl, options, showNumberSetting) {
  this.$container = rootEl;
  this._options = options;
  this.showNumberSetting = showNumberSetting;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;
  this._maskingComp = null;

  this._init();
  this._bindEvent();
  this._registHelder();
  this._appendLocationLi(this._options.zoneSetInfoList);
  this._appendNumberLi(this._options.snumSetInfoList);

  setTimeout($.proxy(this._onHashChange, this), 0);
  // this._onHashChange();
};

Tw.ProductMobileplanSettingLocation.prototype = {

  /**
   * event binding
   * @private
   */
  _bindEvent: function() {
    $(window).on('hashchange', $.proxy(this._onHashChange, this));

    // 지역할인 tab
    $('.discount-location').on('click', '.fe-bt-loc-cancel', $.proxy(this._removeLocation, this));
    $('#btnSearchPop').click($.proxy(this._onclickLocSchPopup, this));
    $('#loc-search-input').click($.proxy(this._onclickLocSchPopup, this));

    // 지정번호 tab
    $('#btnAddr').click($.proxy(this._onClickBtnAddr, this));
    $('#btnNumAdd').click($.proxy(this._addNumber, this));
    $('.discount-number').on('click', '.fe-bt-masking-alert', $.proxy(this._openMaskingAlert, this));
    $('.discount-number').on('click', '.fe-bt-num-cancel', $.proxy(this._removeNumber, this));
    $('#num-input').on('input', $.proxy(this._oninputTelNumber, this));
    $('#num-input').on('keyup', $.proxy(this._onKeyUp, this));
    $('#num-input').on('focus', $.proxy(this._onfocusNumInput, this));
    $('#num-input').on('blur', $.proxy(this._onblurNumInput, this));
    $('#num-inputbox .cancel').on('click', $.proxy(this._onclickInputDel, this));

    $('#fe-prev-step').click($.proxy(this._onclickBtnClose, this));

    $('#tab2').on('click', $.proxy(this._setNumTab, this));

  },

  /**
   * hash change handler
   * @param event
   * @private
   */
  _onHashChange: function(){
    if(!this._historyService.getHash() || this._historyService.getHash() === '#tabpanel1'){
      $('#tab1 a').trigger('click').attr('aria-selected', true);
      $('#tab2 a').attr('aria-selected', false);
    }else if(this._historyService.getHash() === '#tabpanel2'){
      $('#tab2 a').trigger('click').attr('aria-selected', true);
      $('#tab1 a').attr('aria-selected', false);
    }
  },


  /**
   * 지정번호 텝 선택시
   * @private
   */
  _setNumTab: function(){
    if(!this._maskingComp){
      $('.fe-bt-masking').off('click');
      this._maskingComp = new Tw.MaskingComponent();
    }

    // 웹인 경우 주소록버튼 숨김
    if(!Tw.BrowserHelper.isApp()){
      $('#btnAddr', this.$container).parent().hide().attr('aria-hidden', true);
    }
  },

  /**
   * hbs 헬퍼 등록
   * @private
   */
  _registHelder: function(){
    Handlebars.registerHelper('hp', Tw.FormatHelper.conTelFormatWithDash);
    Handlebars.registerHelper('shortNm', function(val){
      val = val || ' ';
      return val.substr(0, 1);
    });
  },

  /**
   * initialize js app
   * @private
   */
  _init: function() {
    // 지역 item 템플릿
    this._tmpltLocItem = Handlebars.compile($('#loc-list-tmplt-item').html());
    this._tmpltNumItem = Handlebars.compile($('#num-list-tmplt-item').html());
    this._tmpltLocSchItem = Handlebars.compile($('#loc-search-list-tmplt-item').html());

    // 웹인 경우 주소록버튼 숨김
    if(!Tw.BrowserHelper.isApp()){
      $('#btnAddr', this.$container).parent().hide().attr('aria-hidden', true);
    }
  },

  _onclickBtnClose: function(){
    this._historyService.goLoad('/myt-join/myplan');
  },

  _onfocusNumInput: function(event){
    $(event.target).val($(event.target).val().replace(/-/g, ''));
  },

  _onblurNumInput: function(event){
    //$(event.target).val(Tw.FormatHelper.getDashedCellPhoneNumber($(event.target).val()));
    // var num = Tw.FormatHelper.getDashedPhoneNumber($(event.target).val());
    // if ( this._isCellPhone2(num) ) {    // 013번호
    //   num = Tw.FormatHelper.getDashedCellPhoneNumber(num.replace(/-/g,''));
    // }
    // $(event.target).val(num);
    var $inputNumber = $(event.target);

    $inputNumber.val(Tw.FormatHelper.conTelFormatWithDash($inputNumber.val()));

    /*if ($inputNumber.length > 8) {
      $inputNumber.val(Tw.FormatHelper.conTelFormatWithDash($inputNumber.val()));
    } else {
      $inputNumber.val(Tw.FormatHelper.getDashedCellPhoneNumber($inputNumber.val()));
    }*/
  },

  /**
   * input 키 입력시
   * @param event
   * @private
   */
  _oninputTelNumber: function () {
    this._checkAddNumberBtn();
  },

  /**
   * input 키 입력시 - 숫자이외의 문자만 막음
   * @param event
   * @private
   */
  _onKeyUp: function (event) {

    // 숫자 외 다른 문자를 입력한 경우
    var $input = $(event.target);
    var value = $input.val();
    var reg = /[^0-9]/g;

    if( reg.test(value) ){
      event.stopPropagation();
      event.preventDefault();
      $input.val(value.replace(reg, ''));
    }
  },


  // /**
  //  * input 키 입력시 - 전화번호 형식으로 변경
  //  * @param event
  //  * @private
  //  */
  // _onKeyUp: function (event) {
  //
  //   // 숫자 외 다른 문자를 입력한 경우
  //   var $input = $(event.target);
  //   var value = $input.val();
  //   var reg = /[^0-9-]/g;
  //
  //   if( reg.test(value) ){
  //     event.stopPropagation();
  //     event.preventDefault();
  //     $input.val(value.replace(reg, ''));
  //   }
  //
  //   this._resetPhoneNum($input);
  //
  //   // 전화번호 체크
  //   if ( this._isPhoneNum($input.val()) ) {
  //     $('#num-inputbox').removeClass('error');
  //
  //   } else {
  //     if( !$('#num-inputbox').hasClass('error') ){
  //       $('#num-inputbox').addClass('error');
  //     }
  //   }
  // },

  /**
   * 지정번호 번호입력 우측 x(삭제)버튼 클릭시
   * @private
   */
  _onclickInputDel: function(/*event*/){
    $('#btnNumAdd').prop('disabled', true);
    //$('#inputReqPhone').val('');
    $('#num-inputbox').removeClass('error');
  },

  /**
   * 지정번호 추가버튼 disabled
   * @private
   */
  _checkAddNumberBtn: function(){
    var disabled = $('#num-input').val().replace(/-/g,'').length < 9;
    $('#btnNumAdd').prop('disabled', disabled);
  },

  // 미사용
  _isPhoneNum: function(val){
    var phoneReg = /^\d{3}-\d{3,4}-\d{4}$/;
    return phoneReg.test(val);
  },

  // 미사용
  _resetPhoneNum: function($input){
    // var value = $input.val();
    // if(value.length === 3 && value.indexOf('-') === -1){
    //   $input.val(value + '-');
    // }
    // if(value.length === 8 && value.lastIndexOf('-') === 3){
    //   $input.val(value + '-');
    // }
    // if(value.length >= 9){
    //   value = value.replace(/-/g, '');
    //   value = value.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/, '$1-$2-$3');
    //   $('input').val(value);
    // }

    var _$this = $input;
    var data = _$this.val().replace(/-/g, '');
    var returnVal;

    //숫자,대시를 제외한 값이 들어 같을 경우
    if ( Tw.ValidationHelper.regExpTest(/[^\d-]/g, data) ) {
      returnVal = data.replace(/[^\d-]/g, ''); // 숫자가 아닌 문자 제거
      Tw.Logger.info('[returnVal 1]', returnVal);
      _$this.val(returnVal);
      return returnVal;

    } else {
      var rexTypeA = /(^02.{0}|^01.{1}|[0-9]{3})([0-9]+)([0-9]{4})/g;
      returnVal = data.replace(rexTypeA, '$1-$2-$3');
      Tw.Logger.info('[returnVal 2]', returnVal);
      _$this.val(returnVal);
      return returnVal;
    }

  },

  /**
   * 장소 li 추가
   * @param list
   * @private
   */
  _appendLocationLi: function(list){

    if(!list || list.length === 0){
      return;
    }
    var html = '';
    for(var i = 0; i < list.length; i++){
      list[i].no = (i + 1);
      html += this._tmpltLocItem(list[i]);
    }
    $('.discount-location').append(html);
  },


  /**
   * 할인지역 장소 검색 팝업 오픈전 메세지 출력
   * @param event
   * @private
   */
  _onclickLocSchPopup: function(event){
    if($(event.target).attr('id') === 'loc-search-input'){
      if(event.preventDefault){
        event.preventDefault();
      }
      event.stopPropagation();
      $('#loc-search-input').trigger('blur');
    }

    // 2개 이상인 경우
    //3_A78
    if($('.discount-location li').length >= 2){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A78.TITLE);
      return;
    }

    if(this.showNumberSetting){
      this._openLocSearchPopup();

    }else {
      // 지역할인요금제 및 TTL지역할인+요금제 인 경우
      // 3_A77 : "지역 추가 시, 1개 지역당 1,650원(부가세포함)씩 과금이 추가됩니다.지역을 추가하시겠습니까?"
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_PRODUCT.ALERT_3_A77.TITLE,
        null,
        $.proxy(function(){
          this._popupService.close();
          setTimeout($.proxy(function(){
            this._openLocSearchPopup();
          }, this), 500);
          // this._popupService.close();
          // this._openLocSearchPopup();
        }, this),
        // $.proxy(this._openLocSearchPopup, this),
        null,
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES
      );
    }
  },

  /**
   * 지역찾기 팝업
   */
  _openLocSearchPopup: function(){

    $('#loc-search-input').trigger('blur');
    var keyword = $('#loc-search-input').val();
    this._popupService.open(
      { hbs: 'MP_02_02_03_09' },
      $.proxy(function ($root) {
        new Tw.ProductMobileplanSettingLocationSearch(
          $root,
          keyword,
          $.proxy(this._addLocation, this),
          this._tmpltLocSchItem);
      }, this),
      $.proxy(function (){
        // close func..
      }, this),
      'searchlocation'
    );
  },

  /**
   * 할인지역 추가
   * @private
   */
  _addLocation: function(dcArea) {

    if(this.showNumberSetting){
      // TTL캠퍼스10요금제인 경우 갱신
      dcArea.oldNum = $('.discount-location li').data('dcareanum');
      dcArea.auditDtm = $('.discount-location li').data('auditdtm');
      this._settingTargetLocation('2', dcArea, $.proxy(this._reloadLocList, this));
    } else {
      this._settingTargetLocation('1', dcArea, $.proxy(this._reloadLocList, this));
    }
  },

  /**
   * 할인지역 삭제
   * @private
   */
  _removeLocation: function(event){
    if ($('.discount-location li').length === 1) {
      this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_LOCATION_MIN);
      return;
    }

    var dcAreaNum = $(event.target).closest('li').data('dcareanum');
    var dcAreaNm = $(event.target).closest('li').data('dcareanm');
    var auditDtm = $(event.target).closest('li').data('auditdtm');


    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.TITLE,
      $.proxy(function(){
        this._popupService.close();
        this._settingTargetLocation(
          '3',
          {num: dcAreaNum, name: dcAreaNm, auditDtm: auditDtm},
          function(){
            $('.discount-location li').filter('[data-dcareanum='+dcAreaNum+']').remove();
          });
      }, this),
      null,
      Tw.BUTTON_LABEL.CLOSE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.BUTTON
    );

    // this._popupService.openModalTypeA(
    //   Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.TITLE,
    //   Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.MSG,
    //   Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.BUTTON, null,
    //   $.proxy(function(){
    //     this._popupService.close();
    //     this._settingTargetLocation(
    //       '3',
    //       {num: dcAreaNum, name: dcAreaNm, auditDtm: auditDtm},
    //       function(){
    //         $('.discount-location li').filter('[data-dcareanum='+dcAreaNum+']').remove();
    //       });
    //   }, this));
  },

  /**
   * 지역 추가/삭제 api 호출
   * @private
   */
  _settingTargetLocation: function(chgCd, dcArea, callback){
    var params = {
      opClCd: chgCd,             // 변경코드 1:등록, 2:변경, 3:삭제
      frDcAreaNum: dcArea.oldNum,// 현재 할인지역코드
      toDcAreaNum: dcArea.num,   // 변경할 할인지역코드
      toDcAreaNm: dcArea.name,   // 변경할 할인지역명
      auditDtm: dcArea.auditDtm  // 최종변경일시 (조회때 받은값)
    };

    Tw.CommonHelper.startLoading('.container', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_10_0045, params )
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }
        callback();

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });

  },


  /**
   * reload 할인지역 목록
   * @private
   */
  _reloadLocList: function(){

    $('.discount-location').html('');

    Tw.CommonHelper.startLoading('.container', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_10_0043, {})
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        this._appendLocationLi(resp.result.zoneSetInfoList);

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  },

  /**
   * 지정번호 li 추가
   * @param list
   * @private
   */
  _appendNumberLi: function(list){

    if(!list || list.length === 0){
      return;
    }
    var html = '';
    for(var i = 0; i < list.length; i++){
      html += this._tmpltNumItem(list[i]);
    }
    $('.discount-number').append(html);
  },

  /**
   * 지정번호 추가하기 버튼 클릭시
   * @private
   */
  _addNumber: function(){

    // 3개 이상인 경우
    //3_A8
    if($('.discount-number li').length >= 3){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A8.TITLE);
      return;
    }
    var num = $('#num-input').val();
    if (!Tw.ValidationHelper.isCellPhone(num) && !Tw.ValidationHelper.isTelephone(num)) {
      //if (!Tw.ValidationHelper.isCellPhone(num) ) {
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
      return;
    }

    this._settingTargetNumber('1', {svcnum:num}, $.proxy(this._reloadNumList, this));
  },


  /**
   * 지정번호 해지하기 버튼 클릭시
   * @private
   */
  _removeNumber: function(event){

    if ($('.discount-number li').length === 1) {
      this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_NUMBER_MIN);
      return;
    }

    var svcnum = $(event.target).closest('li').data('svcnum');
    var auditdtm = $(event.target).closest('li').data('auditdtm');

    this._popupService.openConfirmButton(
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
      $.proxy(function(){
        this._popupService.close();
        this._settingTargetNumber('2', {svcnum:svcnum, auditdtm:auditdtm}, function(){
          $('.discount-number li').filter('[data-svcnum='+svcnum+']').remove();
        });
      }, this),
      null,
      Tw.BUTTON_LABEL.CLOSE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON
    );

    // this._popupService.openModalTypeA(
    //   Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
    //   Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
    //   Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON, null,
    //   $.proxy(function(){
    //     this._popupService.close();
    //     this._settingTargetNumber('2', {svcnum:svcnum, auditdtm:auditdtm}, function(){
    //       $('.discount-number li').filter('[data-svcnum='+svcnum+']').remove();
    //     });
    //   }, this));

  },

  /**
   * 지정번호 해지시 마스킹이 걸려있는 경우 alert
   * @private
   */
  _openMaskingAlert: function() {

    if ($('.discount-number li').length === 1) {
      this._popupService.openAlert(null, Tw.ALERT_MSG_PRODUCT.ALERT_NUMBER_MIN);
      return;
    }

    this._popupService.openConfirmButton(
      Tw.PRODUCT_AUTH_ALERT_STR.MSG,
      Tw.PRODUCT_AUTH_ALERT_STR.TITLE,
      $.proxy(this._showAuth,this),
      null,
      Tw.BUTTON_LABEL.CANCEL,
      Tw.BUTTON_LABEL.CONFIRM);
  },

  /**
   * 마스킹 해제 인증창 띄우기
   * @private
   */
  _showAuth : function () {
    this._popupService.close();
    $('.fe-bt-masking').trigger('click');
  },

  /**
   * 지정번호 추가/삭제 api 호출
   * @private
   */
  _settingTargetNumber: function(opClCd, asgnNum, callback){
    if( !opClCd || !asgnNum || !asgnNum.svcnum){
      return;
    }

    var params = null;
    asgnNum.svcnum = asgnNum.svcnum.replace(/-/g, '');

    if(opClCd === '1'){
      params = {
        opClCd: opClCd,           // 변경코드 1:등록, 2:삭제, 3:변경
        frAsgnNum: null,          // 변경전 지정번호 3인 경우만
        asgnNum: asgnNum.svcnum,  // 지정번호
        auditDtm: null            // 변경일자 3인경우 조회시 내려준 값
      };
    } else if(opClCd === '2'){
      params = {
        opClCd: opClCd,           // 변경코드 1:등록, 2:삭제, 3:변경
        frAsgnNum: null,          // 변경전 지정번호 3인 경우만
        asgnNum: asgnNum.svcnum,  // 지정번호
        auditDtm: asgnNum.auditdtm// 변경일자 3인경우 조회시 내려준 값
      };
    }

    Tw.CommonHelper.startLoading('.container', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_10_0074, params )
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        if(opClCd === '1'){
          $('#num-input').val('');
          $('#num-inputbox .cancel').hide().attr('aria-hidden', true);
          $('#btnNumAdd').prop('disabled', true);
        }

        callback();

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  },


  /**
   * native 주소록 호출
   * @param e
   * @private
   */
  _onClickBtnAddr: function (e) {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, e));
  },

  /**
   * native 주소록 호출 결과
   * @param e
   * @param resp
   * @private
   */
  _onContact: function (e, resp) {
    if(resp.resultCode === Tw.NTV_CODE.CODE_00) {
      var params = resp.params;
      var phoneNum = Tw.StringHelper.phoneStringToDash(params.phoneNumber);
      $('#num-input').val(phoneNum);
      this._checkAddNumberBtn();
      $('#num-inputbox .cancel').show().attr('aria-hidden', false);
    }
  },

  /**
   * 지정번호 목록 조회
   * @private
   */
  _reloadNumList: function(){

    Tw.CommonHelper.startLoading('.container', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_10_0073, {} )
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        $('.discount-number').html('');
        this._appendNumberLi(resp.result.snumSetInfoList);

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });


  }
};
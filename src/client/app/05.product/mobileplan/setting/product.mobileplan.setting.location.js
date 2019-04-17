/**
 * @file 상품 > 모바일요금제 > 설정 > 010캠퍼스요금제,TTL지역할인요금제,TTL캠퍼스10요금제 (MP_02_02_03_08)
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018-11-13
 */

/**
 * @class
 * @param rootEl - 컨테이너 레이어
 * @param options - 옵션 값
 * @param showNumberSetting - 번호 설정 값
 */
Tw.ProductMobileplanSettingLocation = function(rootEl, options, showNumberSetting) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._options = options;
  this.showNumberSetting = showNumberSetting;
  this._maskingComp = null;

  this._init();
  this._bindEvent();
  this._registHelder();
  this._appendLocationLi(this._options.zoneSetInfoList);
  this._appendNumberLi(this._options.snumSetInfoList);

  setTimeout($.proxy(this._onHashChange, this), 0);
};

Tw.ProductMobileplanSettingLocation.prototype = {

  /**
   * @function
   * @desc event binding
   */
  _bindEvent: function() {
    $(window).on('hashchange', $.proxy(this._onHashChange, this));

    // 지역할인 tab
    $('.discount-location').on('click', '.fe-bt-loc-cancel', $.proxy(this._removeLocation, this));
    $('#btnSearchPop').click($.proxy(this._onclickLocSchPopup, this));
    $('#loc-search-input').click($.proxy(this._onclickLocSchPopup, this));

    // 지정번호 tab
    $('#btnAddr').click(_.debounce($.proxy(this._onClickBtnAddr, this), 500));
    $('#btnNumAdd').click(_.debounce($.proxy(this._addNumber, this), 500));
    $('.discount-number').on('click', '.fe-bt-masking-alert', $.proxy(this._openMaskingAlert, this));
    $('.discount-number').on('click', '.fe-bt-num-cancel', $.proxy(this._removeNumber, this));
    $('#num-input').on('input', $.proxy(this._oninputTelNumber, this));
    $('#num-input').on('keyup', $.proxy(this._onKeyUp, this));
    $('#num-input').on('focus', $.proxy(this._onfocusNumInput, this));
    $('#num-input').on('blur', $.proxy(this._onblurNumInput, this));
    $('#num-inputbox .cancel').on('click', _.debounce($.proxy(this._onclickInputDel, this), 500));

    $('#fe-prev-step').click($.proxy(this._onclickBtnClose, this));

    $('#tab2').on('click', $.proxy(this._setNumTab, this));

  },

  /**
   * @function
   * @desc hash change handler
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
   * @function
   * @desc 지정번호 텝 선택시
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
   * @function
   * @desc hbs 헬퍼 등록
   */
  _registHelder: function(){
    Handlebars.registerHelper('hp', Tw.FormatHelper.conTelFormatWithDash);
    Handlebars.registerHelper('shortNm', function(val){
      val = val || ' ';
      return val.substr(0, 1);
    });
  },

  /**
   * @function
   * @desc initialize js app
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

  /**
   * @function
   * @desc 닫기 버튼 클릭 시
   */
  _onclickBtnClose: function(){
    this._historyService.goLoad('/myt-join/myplan');
  },

  /**
   * @function
   * @desc 숫자 입력 란 focus 시
   * @param event - focus Event
   */
  _onfocusNumInput: function(event){
    $(event.target).val($(event.target).val().replace(/-/g, ''));
  },

  /**
   * @function
   * @desc 숫자 입력 란 blur 시
   * @param event - blur Event
   */
  _onblurNumInput: function(event){
    var $inputNumber = $(event.target);
    $inputNumber.val(Tw.FormatHelper.conTelFormatWithDash($inputNumber.val()));
  },

  /**
   * @function
   * @desc input 키 입력시
   */
  _oninputTelNumber: function () {
    this._checkAddNumberBtn();
  },

  /**
   * @function
   * @desc input 키 입력시 - 숫자이외의 문자만 막음
   * @param event - 입력 이벤트
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

  /**
   * @function
   * @desc 지정번호 번호입력 우측 x(삭제)버튼 클릭시
   */
  _onclickInputDel: function(/*event*/){
    $('#btnNumAdd').prop('disabled', true);
    //$('#inputReqPhone').val('');
    $('#num-inputbox').removeClass('error');
  },

  /**
   * @function
   * @desc 지정번호 추가버튼 disabled
   */
  _checkAddNumberBtn: function(){
    var disabled = $('#num-input').val().replace(/-/g,'').length < 9;
    $('#btnNumAdd').prop('disabled', disabled);
  },

  /**
   * @function
   * @desc 장소 li 추가
   * @param list - 장소 목록
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
   * @function
   * @desc 할인지역 장소 검색 팝업 오픈전 메세지 출력
   * @param event - 팝업 오픈 클릭 이벤트
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
   * @function
   * @desc 지역찾기 팝업
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
   * @function
   * @desc 할인지역 추가
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
   * @function
   * @desc 할인지역 삭제
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
  },

  /**
   * @function
   * @desc 지역 추가/삭제 api 호출
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
   * @function
   * @desc reload 할인지역 목록
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
   * @function
   * @desc 지정번호 li 추가
   * @param list - 지정번호 목록
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
   * @function
   * @desc 지정번호 추가하기 버튼 클릭시
   */
  _addNumber: function(){
    // 3개 이상인 경우
    if($('.discount-number li').length >= 3){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A8.TITLE);
      return;
    }
    var num = $('#num-input').val();
    if (!Tw.ValidationHelper.isCellPhone(num) && !Tw.ValidationHelper.isTelephone(num)) {
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.MSG, Tw.ALERT_MSG_PRODUCT.ALERT_3_A29.TITLE);
      return;
    }

    this._settingTargetNumber('1', {svcnum:num}, $.proxy(this._reloadNumList, this));
  },


  /**
   * @function
   * @desc 지정번호 해지하기 버튼 클릭시
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
  },

  /**
   * @function
   * @desc 지정번호 해지시 마스킹이 걸려있는 경우 alert
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
   * @function
   * @desc 마스킹 해제 인증창 띄우기
   */
  _showAuth : function () {
    this._popupService.close();
    $('.fe-bt-masking').trigger('click');
  },

  /**
   * @function
   * @desc 지정번호 추가/삭제 api 호출
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
   * @function
   * @desc native 주소록 호출
   * @param e - 주소록 버튼 클릭 이벤트
   */
  _onClickBtnAddr: function (e) {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, e));
  },

  /**
   * @function
   * @desc native 주소록 호출 결과
   * @param e - 주소록 버튼 클릭 이벤트
   * @param resp - App 콜백 값
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
   * @function
   * @desc 지정번호 목록 조회
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
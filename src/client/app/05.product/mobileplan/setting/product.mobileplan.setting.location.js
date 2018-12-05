/**
 * FileName: product.mobileplan.setting.location.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.11.13
 * Page ID: MP_02_02_03_08
 * Desctiption: 상품 > 가입설정해지 > MYT > TTL캠퍼스10요금제> 할인지역,지정번호입력변경
 */
Tw.ProductMobileplanSettingLocation = function(rootEl, options) {
  this.$container = rootEl;
  this._options = options;
  this._historyService = new Tw.HistoryService();
  this._popupService = new Tw.PopupService();
  this._nativeService = Tw.Native;
  this._apiService = Tw.Api;

  this._init();
  this._bindEvent();
  this._registHelder();
  this._appendLocationLi(this._options.zoneSetInfoList);
  this._appendNumberLi(this._options.snumSetInfoList);
};

Tw.ProductMobileplanSettingLocation.prototype = {

  /**
   * event binding
   * @private
   */
  _bindEvent: function() {
    // 지역할인 tab
    $('.discount-location').on('click', '.bt-line-gray1', $.proxy(this._removeLocation, this));
    $('#btnSearchPop').click($.proxy(this._openLocSearchPopup, this));

    // 지정번호 tab
    $('#btnAddr').click($.proxy(this._onClickBtnAddr, this));
    $('#btnNumAdd').click($.proxy(this._addNumber, this));
    $('.comp-box').on('click', '.bt-line-gray1', $.proxy(this._removeNumber, this));

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
    this._tmpltLocSchItem = Handlebars.compile($('#loc-search-list-tmplt-item').html())
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
      html += this._tmpltLocItem(list[i]);
    }
    $('.discount-location').append(html);
  },


  /**
   * 지역찾기 팝업
   */
  _openLocSearchPopup: function(){
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
    this._settingTargetLocation('1', dcArea, $.proxy(this._reloadLocList, this));
  },

  /**
   * 할인지역 삭제
   * @private
   */
  _removeLocation: function(event){
    var dcAreaNum = $(event.target).closest('li').data('dcareanum');
    var auditDtm = $(event.target).closest('li').data('auditdtm');

    this._popupService.openModalTypeA(
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.TITLE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A6.BUTTON, null,
      $.proxy(function(){
        this._popupService.close();
        this._settingTargetLocation('3', {num:dcAreaNum, auditDtm:auditDtm}, function(){
          $('.discount-location li').filter('[data-dcareanum='+dcAreaNum+']').remove();
        });
      }, this));
  },

  /**
   * 지역 추가/삭제 api 호출
   * @private
   */
  _settingTargetLocation: function(chgCd, dcArea, callback){
    var params = null;

    if(chgCd === '1'){
      params = {
        opClCd: chgCd,            // 변경코드 1:등록, 2:변경, 3:삭제
        frDcAreaNum: dcArea.num,  // 현재 할인지역코드
        toDcAreaNum: null,        // 변경할 할인지역코드
        toDcAreaNm: null,         // 변경할 할인지역명
        auditDtm: dcArea.auditDtm // 최종변경일시 (조회때 받은값)
      };
    } else if(chgCd === '3'){
      params = {
        opClCd: chgCd,            // 변경코드 1:등록, 2:변경, 3:삭제
        frDcAreaNum: dcArea.num,  // 현재 할인지역코드
        toDcAreaNum: dcArea.num,  // 변경할 할인지역코드
        toDcAreaNm: null,         // 변경할 할인지역명
        auditDtm: dcArea.auditDtm // 최종변경일시 (조회때 받은값)
      };
    }
    Tw.CommonHelper.startLoading('.container', 'grey', true);

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

    Tw.CommonHelper.startLoading('.container', 'grey', true);

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
    $('.comp-box').append(html);
  },

  /**
   * 지정번호 추가하기 버튼 클릭시
   * @private
   */
  _addNumber: function(){
    // 3개 이상인 경우
    //3_A8
    if($('.comp-box li').length >= 3){
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT.ALERT_3_A8.TITLE);
      return;
    }
    var num = $('#num-input').val();
    this._settingTargetNumber('1', {svcnum:num}, $.proxy(this._reloadNumList, this));
  },

  /**
   * 지정번호 해지하기 버튼 클릭시
   * @private
   */
  _removeNumber: function(event){
    var svcnum = $(event.target).closest('li').data('svcnum');
    var auditdtm = $(event.target).closest('li').data('auditdtm');

    this._popupService.openModalTypeA(
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.MSG,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.TITLE,
      Tw.ALERT_MSG_PRODUCT.ALERT_3_A5.BUTTON, null,
      $.proxy(function(){
        this._popupService.close();
        this._settingTargetNumber('2', {svcnum:svcnum, auditdtm:auditdtm}, function(){
          $('.comp-box li').filter('[data-svcnum='+svcnum+']').remove();
        });
      }, this));

  },


  /**
   * 지정번호 추가/삭제 api 호출
   * @private
   */
  _settingTargetNumber: function(opClCd, asgnNum, callback){
    if( !opClCd || !asgnNum ){
      return;
    }

    var params = null;

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

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0074, params )
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
   * 주소록 호출
   * @param e
   * @private
   */
  _onClickBtnAddr: function (e) {
    Tw.Native.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this, e));
  },

  /**
   * 주소록 호출 결과
   * @param e
   * @param resp
   * @private
   */
  _onContact: function (e, resp) {
    if(resp.resultCode === Tw.NTV_CODE.CODE_00) {
      var params = resp.params;
      var phoneNum = Tw.StringHelper.phoneStringToDash(params.phoneNumber);
      $('#num-input').val(phoneNum);
    }
  },

  /**
   * 지정번호 목록 조회
   * @private
   */
  _reloadNumList: function(){

    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0073, {} )
      .done($.proxy(function (resp) {

        Tw.CommonHelper.endLoading('.container');
        if( !resp || resp.code !== Tw.API_CODE.CODE_00 ){
          Tw.Error(resp.code, resp.msg).pop();
          return ;
        }

        $('.comp-box').html('');
        this._appendNumberLi(resp.result.snumSetInfoList);

      }, this))
      .fail(function(err){
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });


  }
};

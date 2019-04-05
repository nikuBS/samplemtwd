/**
 * MenuName: 나의 가입정보 > 서브메인(인터넷/집전화/IPTV 회선) > 상품변경(MS_04_05)
 * @file myt-join.wire.modify.product.js
 * @author Kim Myoung-Hwan (skt.P130714@partner.sk.com)
 * @since 2018.10.15
 * Summary: 유선상품 상품변경 신청
 */
Tw.MyTJoinWireModifyProduct = function (rootEl, resData) {
  this.resData = resData;
  Tw.Logger.info('[Server Res Data]', resData);

  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._history = new Tw.HistoryService(this.$container);

  this.productFormData = {
    cntcPrefrMblPhonNum: '',              // 휴대폰번호(0000-0000-0000 형식)
    cntcPrefrPhonNum: '',                 // 일반전화번호(0000-0000-0000 형식)
    prodMediaNm: '',                      // 상품선택
    prodNm: ''                            // 상품서비스
  };

  this.productBillList = Tw.MYT_JOIN_WIRE_MODIFY_PRODUCT.PRODUCTBILLLIST;
  this.productBillSelect = null; // productBillList에서 선택한 데이터

  this.productSelect = { // 상품선택시 리스트 순번과 이름을 저장한다.
    id: null
  };

  this._init();
};

Tw.MyTJoinWireModifyProduct.prototype = {
  _init: function () {
    if(this.resData.resDataInfo.coClCd === 'B'){
      // sk브로드밴드인 경우 팝업 변경 (myt-join공통함수로 처리)
      (new Tw.MyTJoinCommon()).openSkbdAlertOnInit(this._history);

      return;
    }
    this._bindEvent();
    this._cachedElement();
    this._productBillSelectFun();
    this._svcCtgNmFun();
  },
  /**
   * element cache
   * @private
   */
  _cachedElement: function () {
    this.$select_product= $('[data-target="select_product"]'); // 상품선택 버튼
    this.$select_product_bill= $('[data-target="select_product_bill"]'); // 요금상품선택 버튼

    this.$input_hp= $('[data-target="input_hp"]'); // 휴대폰 번호
    this.$input_phone= $('[data-target="input_phone"]'); // 일반전화 (선택항목)
    this.$submitApply= $('[data-target="submitApply"]'); // 신청하기 버튼
  },
  /**
   * event bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '[data-target="select_product"]', $.proxy(this.$select_productEvt, this));
    this.$container.on('click', '[data-target="select_product_bill"]', $.proxy(this.$select_product_billEvt, this));

    this.$container.on('keyup', '[data-target="input_hp"]', $.proxy(this.input_hpEvt, this));
    this.$container.on('keyup', '[data-target="input_phone"]', $.proxy(this.input_phoneEvt, this));
    this.$container.on('click', '[data-target="submitApply"]', $.proxy(this.$submitApplyEvt, this));
    this.$container.on('click', '#btn_hp_del', $.proxy(this._formValidateionChk, this));

    this.$container.on('click', '#page-prev-step', $.proxy(this._closeCheck, this));

    new Tw.InputFocusService(this.$container, $('[data-target="submitApply"]'));
  },

  //--------------------------------------------------------------------------[EVENT]
  /**
   * close 버튼 클릭시
   * @private
   */
  _closeCheck: function(){
    this._history.goLoad('/myt-join/submain');

    // 필드에 입력된 부분이 있는지 체크(안하기로 해서 주석처리)
    //if(this.productFormData.prodMediaNm ||
    //  this.productFormData.prodNm ||
    //  $('[data-target="input_hp"]').val() ||
    //  $('[data-target="input_phone"]').val()) {
    //
    //  this._popupService.openConfirmButton(
    //    Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
    //    Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
    //    $.proxy(function(){
    //      this._history.goLoad('/myt-join/submain');
    //    }, this),
    //    null,
    //    Tw.BUTTON_LABEL.NO,
    //    Tw.BUTTON_LABEL.YES);
    //} else {
    //  this._history.goBack();
    //}//
  },

  /**
   * 상품 선택 버튼 클릭시 -> 상품선택 액션시트 팝업
   * @param event
   */
  $select_productEvt: function(event) {
    Tw.Logger.info('[상품 선택]', event);
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet_select_a_type';
    var hashName = 'select_product';
    var data = [{
      list: []
    }];
    var listData = _.map(this.productBillSelect.type, function (item, idx) {
      Tw.Logger.info('[상품선택 IDX]', idx);
      return {
        value: item,
        option: '',
        attr: 'data-value="' + item + '", data-target="selectBtn"'
      };
    });
    data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: Tw.MYT_FARE_BILL_GUIDE_PPS.POP_TITLE_TYPE_0
      },
      $.proxy(this.select_productEvtOpen, this, $target),
      $.proxy(this.select_productEvtClose, this, $target),
      hashName);
  },

  /**
   * 요금상품 선택버튼 클릭시 -> 요금상품 선택 액션시트 팝업
   * @param event
   */
  $select_product_billEvt: function(event) {
    Tw.Logger.info('[요금상품 선택]', event);
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet_select_a_type';
    var hashName = 'select_product_bill';
    var data = [{
      list: []
    }];
    var childId = this.productSelect.id;


    var listData = _.map(this.productBillSelect.child[childId], function (item, idx) {
      Tw.Logger.info('[상품선택 IDX]', idx);
      return {
        value: item,
        option: '',
        attr: 'data-value="' + item + '", data-target="selectBtn"'
      };
    });
    data[0].list = listData;

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: data,
        title: Tw.MYT_FARE_BILL_GUIDE_PPS.POP_TITLE_TYPE_0
      },
      $.proxy(this.select_product_billEvtOpen, this, $target),
      $.proxy(this.select_product_billEvtClose, this, $target),
      hashName);
  },

  /**
   * 신청하기 버튼 클릭시 -> 신청 api호출
   * @param event
   */
  $submitApplyEvt: function(event) {
    Tw.Logger.info('[신청하기]', event);
    var param = this.productFormData;
    this._chgProductInfo(param);
  },

  // 휴대폰 번호 입력시 validation
  input_hpEvt: function(event) {
    var tempNum = this._onFormatHpNum(event);

    if(!Tw.ValidationHelper.isCellPhone($('[data-target="input_hp"]').val())){  //
      this.productFormData.cntcPrefrMblPhonNum = '';
      $('#spanHpValid').text(Tw.VALIDATE_MSG_MYT_DATA.V9).show().attr('aria-hidden', false);
    } else {
      this.productFormData.cntcPrefrMblPhonNum = tempNum;
      $('#spanHpValid').text('').hide().attr('aria-hidden', true);
    }
    this._formValidateionChk();
    Tw.Logger.info('[productFormData]', this.productFormData);
  },

  // 일반전화 입력시
  input_phoneEvt: function(event) {
    var tempNum = this._onFormatHpNum(event);
    this.productFormData.cntcPrefrPhonNum = tempNum;
    this._formValidateionChk();
    Tw.Logger.info('[productFormData]', this.productFormData);
  },
  //--------------------------------------------------------------------------[SVC]
  // 상품선택 클릭시 실행
  select_productEvtOpen: function( $target, $layer ) {
    var tempData = this.productFormData.prodMediaNm;
    var indexOfVal = this.productBillSelect.type.indexOf(tempData);

    if ( indexOfVal !== -1 ) { // 존재할때 실행 체크
      $layer.find('.chk-link-list > li').eq(indexOfVal).find('button')
        .addClass('checked')
        .find('input[type=radio]').prop('checked', true);
    }

    //팝업 속 버튼을 클릭했을 때
    $layer.on('click', '[data-target="selectBtn"]', $.proxy( function(event) {
      this.$select_product_bill.attr('disabled', false); // 요금상품 선택 버튼 활성화
      this.$select_product_bill.text(Tw.MYT_JOIN_WIRE_MODIFY_PRODUCT.SEL_PROD_TYPE_DEF);
      this.productFormData.prodNm = '';


      var $targetChild = $(event.currentTarget);
      var tempDataVal = $targetChild.attr('data-value');

      this.productFormData.prodMediaNm = tempDataVal; // 클릭시 form 변경 값

      this.productSelect.id = this.productBillSelect.type.indexOf(tempDataVal);
      Tw.Logger.info('[상품선택 > id]', this.productSelect.id );

      $target.text( tempDataVal );

      $layer.find('.chk-link-list li > button').removeClass('checked');
      $targetChild.addClass('checked')
        .find('input[type=radio]').prop('checked', true);
      this._popupService.close();

    }, this));

  },
  // 상품선택 액션시트 close
  select_productEvtClose: function() {
    Tw.Logger.info('[팝업 close > select_productEvtOpen]');
    this._formValidateionChk();
    Tw.Logger.info('[productFormData]', this.productFormData);
  },

  // 요금상품 선택 클릭시 실행
  select_product_billEvtOpen: function( $target, $layer ) {
    var tempData = this.productFormData.prodNm;
    var indexOfVal = this.productBillSelect.child[this.productSelect.id].indexOf(tempData);

    if ( indexOfVal !== -1 ) { // 존재할때 실행 체크
      $layer.find('.chk-link-list > li').eq(indexOfVal).find('button')
        .addClass('checked')
        .find('input[type=radio]').prop('checked', true);
    }

    //팝업 속 버튼을 클릭했을 때
    $layer.on('click', '[data-target="selectBtn"]', $.proxy( function(event) {
      var $targetChild = $(event.currentTarget);
      var tempDataVal = $targetChild.attr('data-value');

      this.productFormData.prodNm = tempDataVal; // 클릭시 변경 값

      $target.text( tempDataVal );

      $layer.find('.chk-link-list li > button').removeClass('checked');
      $targetChild.addClass('checked')
        .find('input[type=radio]').prop('checked', true);
      this._popupService.close();

    }, this));

  },
  // 요금상품 액션시트 close
  select_product_billEvtClose: function() {
    Tw.Logger.info('[팝업 close > select_productEvtOpen]');
    this._formValidateionChk();
    Tw.Logger.info('[productFormData]', this.productFormData);
  },

  // 회선에 맞는 데이터로 세팅
  _productBillSelectFun: function() {

    this.productBillSelect = _.filter( this.productBillList, $.proxy(function(item){
      return item.id === this.resData.svcAttrCd;
      // return item.id === 'S3';
    }, this) )[0];

    Tw.Logger.info('[productBillSelect]', this.productBillSelect);
  },

  _svcCtgNmFun: function() {

    var idVar = this.resData.svcAttrCd;

    switch ( idVar) {
      case 'S1':
        this.svcCtgNm = Tw.MYT_JOIN_WIRE_MODIFY_PRODUCT.SVCCTG[idVar];
        break;
      case 'S2':
        this.svcCtgNm = Tw.MYT_JOIN_WIRE_MODIFY_PRODUCT.SVCCTG[idVar];
        break;
      case 'S3':
        this.svcCtgNm = Tw.MYT_JOIN_WIRE_MODIFY_PRODUCT.SVCCTG[idVar];
        break;
      default:

    }
    Tw.Logger.info('[svcCtgNm]', this.svcCtgNm);

  },
  /*
  * Form Validation
   */
  _formValidateionChk: function() {

    var tempObj = this.productFormData;

    try {
      _.map(tempObj, function( item, key ) {

        Tw.Logger.info('[ productFormData > _.map > '+ key +']', item, Tw.FormatHelper.isEmpty(item));

        if ( key !== 'cntcPrefrPhonNum' ) { //일반전화가 아닐때
          if ( key === 'cntcPrefrMblPhonNum' ) { // 휴대폰
            if(!Tw.ValidationHelper.isCellPhone($('[data-target="input_hp"]').val())){  //
              throw new Error('break');
            }
          } else {
            if ( Tw.FormatHelper.isEmpty(item) ) {
              Tw.Logger.info('[값을 입력하세요.]', key);
              throw new Error('break');
            }
          }
        }

      });

    } catch(e) {
      if(e.message === 'break'){
        //break successful
        Tw.Logger.info('[catch > break]', e);
        this.$submitApply.attr('disabled', true);
        return;
      }
    }

    Tw.Logger.info('[유효성 체크 완료]');

    this.$submitApply.attr('disabled', false);


  },

  //--------------------------------------------------------------------------[API]
  /**
   * 상품변경신청 api 호출
   * @param param
   * @returns {*}
   * @private
   */
  _chgProductInfo: function (param) {
    Tw.CommonHelper.startLoading('.container', 'grey');
    return this._apiService.request(Tw.API_CMD.BFF_05_0165, param)
      .done($.proxy(this._chgProductInfoInit, this))
      .fail(function (err) {
        Tw.CommonHelper.endLoading('.container');
        Tw.Error(err.status, err.statusText).pop();
      });
  },
  /**
   * 상품변경신청 api 결과
   * @param res
   * @private
   */
  _chgProductInfoInit: function (res) {
    Tw.CommonHelper.endLoading('.container');
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('[결과] _chgProductInfoInit', res);
      // 성공시 2_A36 alert 노출
      // 가입 서비스 변경 신청이 완료 되었습니다 빠른 시일내에 연락 드리도록 하겠습니다
      this._popupService.openAlert(Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A36.MSG, Tw.ALERT_MSG_MYT_JOIN.ALERT_2_A36.TITLE, null,
        $.proxy(function(){
          this._goLoad('/myt-join/submain/wire/history');
        }, this));

    } else if ( res.code === 'WI0007' ) {
      // 선택하신 서비스는 SK브로드밴드를 통해 가입하신 서비스이므로 전화 106 또는 SK브로드밴드 웹사이트를 이용해 주시기 바랍니다.

      this._popupService.openOneBtTypeB(
        Tw.MYT_JOIN.BROADBAND_ERROR.TITLE,
        Tw.MYT_JOIN_WIRE_MODIFY_PRODUCT.ERROR_ALERT,
        [{
          style_class: 'link',
          txt: Tw.MYT_JOIN.BROADBAND_ERROR.LINK_TXT
        }],
        'type1',
        $.proxy(function ($layer) {
          $layer.on('click', '.link', $.proxy(Tw.CommonHelper.openUrlExternal, this, Tw.MYT_JOIN.BROADBAND_ERROR.LINK));
        }, this)
      );

      // this._popupService.openAlert(Tw.MYT_JOIN_WIRE_MODIFY_PRODUCT.ERROR_ALERT, null, null,
      //   $.proxy(function(){
      //     this._goLoad('/myt-join/submain/wire/history');
      // }, this));
    } else {
      Tw.Error(res.code, res.msg).pop();
    }

  },


  //--------------------------------------------------------------------------[COM]
  _noDash: function(str) {
    str = String(str);
    return str.split('-').join('');
  },
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  _comUnComma: function (str) {
    str = String(str);
    // return str.replace(/[^\d]+/g, '');
    return str.replace(/,/g, '');
  },
  _phoneStrToDash: function (str) {
    var strVal = String(str);
    return strVal.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _goBack: function () {
    this._history.goBack();
  },
  _goLoad: function (url) {
    this._history.goLoad(url);
  },
  _go: function (hash) {
    this._history.goHash(hash);
    // this._history.setHistory();
    // window.location.hash = hash;
  },
  // 휴대폰/일반전화 입력 시 자동 하이픈 넣기
  _onFormatHpNum : function (e) {
    var _$this = $(e.currentTarget);
    var data = this._noDash(_$this.val());
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

  }

};
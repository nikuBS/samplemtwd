/**
 * MenuName: 나의 요금 > 요금안내서
 * @file myt-fare.common.js
 * @author 
 * @since 2020.01.22
 * Summay: 통합청구(대표,일반), 개별청구 공통 JS
 */
Tw.MyTFareCommon = function (rootEl, resData) {

  this.resData = JSON.parse(window.unescape(resData));
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;

  this._showLineComponent = false;
  this._history = new Tw.HistoryService();


  if( this.resData.reqQuery){
    this.paramLine = this.resData.reqQuery.line || '';
    this._showLineComponent = true;
  }
  this._init();

};

Tw.MyTFareCommon.prototype = {
  _init: function () {

    this._bindEvent();
    // OP002-8156: [개선][FE](W-2002-034-01) 회선선택 영역 확대 2차
    /* this._lineComponent = */ 
    if( this._showLineComponent )
      new Tw.LineComponent(this.$container, '.fe-bt-line', true, null);
  },

  /**
   * 화면 element cache
   * @private
   */
  _cachedElement: function () {
    // Handlebars.registerPartial('billContent', $('#fe-bill-detail').html());  --영문화

    // this.$entryTplUseBill = $('#fe-entryTplUseBill');  --영문화
    // this.$entryTplChild = $('#fe-entryTplChild');      --영문화

    // this.$hbDetailListArea = $('[data-target="hbDetailListArea"]');  --영문화
    // this.$hbChildListArea = $('[data-target="hbChildListArea"]');    --영문화
    this.$conditionChangeBtn = $('[data-target="conditionChangeBtn"]');
  },
  /**
   * 이벤트 bind
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '[data-target="conditionChangeBtn"]', $.proxy(this._conditionChangeEvt, this));

    this.$container.on('click', '[data-id="goKrHome"]'              , $.proxy(this._goKrHome, this));
    this.$container.on('click', '[data-id="goHome"]'                , $.proxy(this._goHome, this));
    this.$container.on('click', '[data-id="goOtherLine"]'           , $.proxy(this._goOtherLine, this));
    this.$container.on('click', '[data-id="goHotBill"]'             , $.proxy(this._goHotBill, this));

  },
  //--------------------------------------------------------------------------[EVENT]
  /**
   * 상품원장 페이지로 이동
   * @private
   */
  _goProdPage: function (event) {
    var url = $(event.currentTarget).data('prod-page-url');
    this._history.goLoad(url);
  },
  // 요금납부 호출
  _feePayBtnEvt: function (event) {
    // Tw.Logger.info('[요금납부]', Tw.MyTFareBill);
    this.myTFarePayment = new Tw.MyTFareBill(this.$container, this.resData.svcAttrCd, $(event.currentTarget));
  },

  // HOME 이동
  _goKrHome: function () {
    // Tw.Logger.info('[국문홈이동]');
    this._history.goLoad('/main/home');
  },


  // HOME 이동
  _goHome: function () {
    // Tw.Logger.info('[영문홈이동]');
    this._history.goLoad('/en/main/home');
  },

  _goOtherLine: function () {
    // Tw.Logger.info('[영문회선선택]');
    this._history.goLoad('/en/common/member/line');
  },

  _goHotBill: function () {
    // Tw.Logger.info('[영문실시간요금 이동]');
    this._history.goLoad('/en/myt-fare/bill/hotbill');    
  },

  /**
   * 날짜조건 변경 actionsheet 팝업
   * @param event
   * @private
   */
  _conditionChangeEvt: function (event) {
    var $target = $(event.currentTarget);
    var hbsName = 'actionsheet01';
    var hashName = 'conditionChange';
    var reqDate = this.resData.reqQuery.date;
    // 데이터 초기화
    var invDtArr = this.resData.billpayInfo.invDtArr; // data-value
    var conditionChangeDtList = this.resData.commDataInfo.conditionChangeDtList; // value
    var listData = _.map(invDtArr, function (item, idx) {
      var radioAttr = 'id="ra'+idx+'" name="r1" data-value="' + invDtArr[idx] + '"';
      if(reqDate === invDtArr[idx] || (idx === 0 && !reqDate)){
        radioAttr += ' checked';
      }
      return {
        'label-attr': 'id="ra'+idx+'"',
        'radio-attr': radioAttr,
        'txt': conditionChangeDtList[idx]
      };
    });

    this._popupService.open({
        hbs: hbsName,
        layer: true,
        data: [{ list: listData }],
        title: Tw.MYT_FARE_BILL_GUIDE.POP_TITLE_TYPE_0,
        btnfloating : { attr: 'type="button"', 'class': 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE }
      },
      $.proxy(this._conditionChangeEvtInit, this, $target),
      $.proxy(this._conditionChangeEvtClose, this, $target),
      hashName, $target);
  },
  _conditionChangeEvtInit: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer);
    $layer.one('click', 'li.type1', $.proxy(this._setSelectedValue, this));
  },
  // 안씀. 조건변경 팝업 닫히면..
  _conditionChangeEvtClose: function () {

  },
  // [날짜변경 actionsheet] 날짜 선택시
  _setSelectedValue: function (event) {
    var $tg = $(event.currentTarget);
    this.paramDate = $tg.find('input[type=radio]').attr('data-value');

    if(this.paramDate === this.resData.reqQuery.date){
      this._popupService.close();
    } else {

      var param = {
        date: this.paramDate
      };
      this._history.goLoad('/en/myt-fare/billguide/guide?' + $.param(param));
    }
  },


  //--------------------------------------------------------------------------[SVC]
  _useSvcTypeFun: function () {
    var svcTypeList = this.resData.commDataInfo.intBillLineList;
    var svcMgmtNum = this.resData.svcMgmtNum;
    var selectSvcType = _.find(svcTypeList, function (item) {
      return item.svcMgmtNum === svcMgmtNum;
    });
    return selectSvcType;

  },
  /**
   * hbs script 템플릿 출력
   * @param resData - 데이터
   * @param $jqTg - 출력될 html area
   * @param $hbTg - hbs 템플릿
   * @private
   */
  _svcHbDetailList: function (resData, $jqTg, $hbTg) {
    var jqTg = $jqTg;
    var hbTg = $hbTg;
    var source = hbTg.html();
    var template = Handlebars.compile(source);
    var data = {
      resData: resData
    };
    var html = template(data);
    jqTg.append(html);
  },

  // allSvc 정보에서 해당 상품의 id와 이름을 찾아서 리턴한다.
  _getProdInfo: function(svcMgmtNum) {
    var svcS = this.resData.allSvc.s || [];
    var svcM = this.resData.allSvc.m || [];
    var svcO = this.resData.allSvc.o || [];
    for(var i = 0; i < svcS.length; i++){
      if(svcMgmtNum === svcS[i].svcMgmtNum){
        return {id: svcS[i].prodId, nm: svcS[i].prodNm};
      }
    }
    for(i = 0; i < svcM.length; i++){
      if(svcMgmtNum === svcM[i].svcMgmtNum){
        return {id: svcM[i].prodId, nm: svcM[i].prodNm};
      }
    }
    for(i = 0; i < svcO.length; i++){
      if(svcMgmtNum === svcO[i].svcMgmtNum){
        return {id: svcO[i].prodId, nm: svcO[i].prodNm};
      }
    }
    return {id: '', nm: ''};
  },

  /**
   * 웹접근성 부가세 제외대상 * -> icon으로 변경
   * @private
   */
  _insertAsteMark: function(){
    $('.basic-list .title').each(function(){
      var str = $(this).text().trim();
      if(str.indexOf(Tw.MYT_FARE_BILL_GUIDE_TPL.ASTERISK_TPL.SCH_ID) === str.length-1){
        $(this).html(
          $(this).text().replace(
            Tw.MYT_FARE_BILL_GUIDE_TPL.ASTERISK_TPL.SCH_ID,
            Tw.MYT_FARE_BILL_GUIDE_TPL.ASTERISK_TPL.ELEMENT)
        );
      }
    });
  },
  //--------------------------------------------------------------------------[COM]
  /**
   * 요금 데이터를 그룹핑하고 합계를 구함
   * @param $data - 그룹핑할 데이터
   * @param $groupKey - 그룹핑할 object key
   * @param $priceKey - 합계 key
   * @returns {*}
   * @private
   */
  _comTraverse: function ($data, $groupKey, $priceKey) {
    var thisMain = this;
    var tempData = _.groupBy($data, $groupKey);
    var tempKey = _.keys(tempData);
    var tempCom = _.map(tempKey, function (val) {

      var childItemArr = tempData[val];

      var tempSum = 0;
      //토탈 계산
      for ( var i = 0; i < childItemArr.length; i++ ) {
        tempSum += Number(thisMain._comUnComma(childItemArr[i][$priceKey]));
      }
      tempSum = thisMain._comComma(tempSum);

      return {
        id: val,
        label: tempData[val][0].svcNm,
        svcInfoNm: tempData[val][0].svcInfoNm,
        children: tempData[val],
        totPrice: tempSum
      };
    });

    return tempCom;
  },
  // 요금에 콤마 추가
  _comComma: function (str) {
    str = String(str);
    return Tw.FormatHelper.addComma(str);
  },
  // 요금에 콤마 삭제
  _comUnComma: function (str) {
    str = String(str);
    return str.replace(/,/g, '');
  },
  // 휴대폰 번호 포맷
  _phoneStrToDash: function (str) {
    var strVal = String(str);
    return strVal.replace(/(^02.{0}|^01.{1}|[0-9]{3})([0-9\*]+)([[0-9\*]{4})/, '$1-$2-$3');
  },
  _go: function (hash) {
    this._history.setHistory();
    this._history.goHash(hash);
  }
};
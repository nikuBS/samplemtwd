Tw.MyTDataUsage = function (rootEl, options) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._options = options;

  this._bindEvent();
  this._registerHelper();
  this._requestServices();
};

Tw.MyTDataUsage.prototype = {

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {

    this.$container.on('click', '#head-tdata-share .info-view-ic', $.proxy(this.showGuidePopup, this,
      Tw.MSG_MYT.TDATA_SHARE.M01_TITLE, Tw.MSG_MYT.TDATA_SHARE.M01_CONTENTS));

    this.$container.on('click', '#head-ting .info-view-ic', $.proxy(this.showGuidePopup, this,
      Tw.MSG_MYT.TDATA_SHARE.M01_TITLE, Tw.MSG_MYT.TDATA_SHARE.M01_CONTENTS));

    this.$container.on('click', '#head-discount .info-view-ic', $.proxy(this.showGuidePopup, this,
      Tw.MSG_MYT.DISCOUNT.M01_TITLE, Tw.MSG_MYT.DISCOUNT.M01_CONTENTS));

    // 24시간 데이터 50% 할인 사용량 - 실시간 사용 요금 바로가기 버튼 - 실시간 사용 요금으로 이동
    this.$container.on('click', '#cont-discount .bt-slice button', function(){
      location.href = 'myt/bill/hotbill';
    });

    // 데이터 한도 요금제 - 충전 가능 금액 확인 버튼 - 데이터 한도 요금제로 이동
    this.$container.on('click', '#cont-data-limit .bt-slice button', function(){
      location.href = '/myt/data/limit';
    });
  },

  /**
   * 서비스 호출
   * @private
   */
  _requestServices : function () {

    var reqList = [];

    if( 'Y' === this._options.tdataSharing ){
      reqList.push({ command: Tw.API_CMD.BFF_05_0005, params: {} }); // T데이터셰어링 사용량 조회
    }
    if( 'Y' === this._options.troamingSharing ){
      reqList.push({ command: Tw.API_CMD.BFF_05_0003, params: {} }); // T로밍 함께쓰기
    }
    if( 'Y' === this._options.dataTopUp ){
      reqList.push({ command: Tw.API_CMD.BFF_05_0006, params: {} }); // 데이터한도요금제 조회
    }
    if( 'Y' === this._options.ting ){
      reqList.push({ command: Tw.API_CMD.BFF_05_0007, params: {} }); // 팅요금상품 사용량 조회
    }
    if( 'Y' === this._options.dataDiscount ){
      reqList.push({ command: Tw.API_CMD.BFF_05_0008, params: {} }); // 24시간 데이터 50% 할인 조회
    }
    if( 'Y' === this._options.bandDataSharing ){
      reqList.push({ command: Tw.API_CMD.BFF_05_0078, params: {} }); // 내 폰끼리 결합
    }

    if(reqList.length <= 0){
      return ;
    }

    this._apiService.requestArray(reqList)
      .done($.proxy(function () {

        for(var i = 0; i < reqList.length; i++){
          var resp = arguments[i];
          if( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result){
            this._showErrorAlert(resp.code, resp.msg);
            continue;
          }

          switch ( reqList[i].command.path ) {
            case Tw.API_CMD.BFF_05_0005.path :
              this._resultHandlerTDataShare(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0003.path :
              this._resultHandlerTRoamingShare(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0006.path :
              this._resultHandlerDataLimit(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0007.path :
              this._resultHandlerTing(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0008.path :
              this._resultHandler24Data50per(resp.result);
              break;
            case Tw.API_CMD.BFF_05_0078.path :
              this._resultHandlerBandDataShare(resp.result);
              break;
            default : break;
          }
        }

      }, this))
      .fail($.proxy(this._requestFail, this));

  },

  _requestFail: function (resp) {
    this._showErrorAlert(resp.code, resp.msg);
  },


  /**
   * t데이터 세어링 result handler
   * @param data
   * @private
   */
  _resultHandlerTDataShare : function (data){
    //console.log('== RESP T데이터셰어링 ==');
    //console.log(data);

    var fmtData = {data:'', unit:''};

    // 사용 중인 요금상품 + 기본제공량
    fmtData = Tw.FormatHelper.convDataFormat(data.opmdBasic, Tw.DATA_UNIT.KB);
    $('#head-tdata-share .tit').text(data.prodNm + ' ' + fmtData.data + fmtData.unit);

    // 총데이터 사용량
    fmtData = Tw.FormatHelper.convDataFormat(data.totShar, Tw.DATA_UNIT.KB);
    $('#head-tdata-share .num em').text(fmtData.data);
    $('#head-tdata-share .num span').text(fmtData.unit);

    var childHtml = this._dataToHtml(data.childList, '#fe-tdata-share-child-item');
    $('#list-tdata-share').append(childHtml);

  },

  /**
   * t로밍 함께쓰기 result handler
   * @param data
   * @private
   */
  _resultHandlerTRoamingShare : function (data){
    //console.log('== RESP T로밍 함께쓰기 ==');
    //console.log(data);

    var fmtData = {data:'', unit:''};

    // 상단 잔여량
    fmtData = Tw.FormatHelper.convDataFormat(data.dataSharing.data.remained, Tw.DATA_UNIT.KB);
    $('#head-troaming-share .num em').text(fmtData.data);
    $('#head-troaming-share .num span').text(fmtData.unit);
    // t로밍상품명
    $('#cont-troaming-share .graphbox-title').text(data.roamProdNm);
    // 잔여량
    fmtData = Tw.FormatHelper.convDataFormat(data.dataSharing.data.remained, Tw.DATA_UNIT.KB);
    $('#cont-troaming-share .data-state:eq(0) .str span:eq(0)').text(fmtData.data);
    $('#cont-troaming-share .data-state:eq(0) .str span:eq(1)').text(fmtData.unit);
    // 사용량
    fmtData = Tw.FormatHelper.convDataFormat(data.dataSharing.data.used, Tw.DATA_UNIT.KB);
    $('#cont-troaming-share .data-state:eq(1) .str span:eq(0)').text(fmtData.data);
    $('#cont-troaming-share .data-state:eq(1) .str span:eq(1)').text(fmtData.unit);

    // 그래프 표시
    var per = data.dataSharing.data.used / data.dataSharing.data.total * 100;
    $('#cont-troaming-share .data-bar .red').css('width', per + '%');
    // 잔여일시
    var times = this.minToDayHourMin(data.dispRemainDay);
    var strTimes = times.days > 0 ? times.days + Tw.PERIOD_UNIT.DAYS : '';
    strTimes = strTimes + times.hours + Tw.PERIOD_UNIT.HOURS + times.minutes + Tw.PERIOD_UNIT.MINUTES;
    $('#cont-troaming-share .chargedate-box span').text(strTimes);

    var childHtml = this._dataToHtml(data.childList, '#fe-troaming-share-child-item');
    $('#list-troaming-share').append(childHtml);

  },

  /**
   * 데이터 한도 요금제 잔여량
   * @param data
   * @private
   */
  _resultHandlerDataLimit : function (data){
    //console.log('== RESP 데이터한도요금제 ==');
    //console.log(data);

    // 충전금액
    $('#cont-data-limit .subtit').text('충전금액 : ' + data.total);
    // 잔여량
    $('#cont-data-limit .remain .str').text(data.remained);
  },

  /**
   * 팅 요금상품 잔여량
   * @param data
   * @private
   */
  _resultHandlerTing : function (data){
    //console.log('== RESP 팅요금상품 사용량 ==');
    //console.log(data);

    for ( var i = 0; i < data.length ; i++ ) {
      data[i].skipLabel = Tw.TING_TITLE[data[i].skipId];
    }

    var childHtml = this._dataToHtml(data, '#fe-ting-child-item');
    $('#list-ting').append(childHtml);

  },

  /**
   * 24시간 데이터 50% 할인 사용량
   * @param data
   * @private
   */
  _resultHandler24Data50per : function (data){
    //console.log('== RESP 24시간 데이터 50% 할인 ==');
    //console.log(data);

    // 쿠폰 적용 기간
    $('#cont-discount .subtit span:eq(1)').text(Tw.DateHelper.getShortDateAndTime(data.couponDate) + ' ~ ' + Tw.DateHelper.getAddDay(data.couponDate));

    // 사용량
    var fmtData = Tw.FormatHelper.convDataFormat(data.used, Tw.DATA_UNIT.KB);
    $('#cont-discount .remain span:eq(0)').text(fmtData.data);
    $('#cont-discount .remain span:eq(1)').text(fmtData.data);

  },

  /**
   * 내폰끼리 결합 사용량
   * @param data
   * @private
   */
  _resultHandlerBandDataShare : function (data){
    //console.log('== RESP 내폰끼리결합 사용량 ==');
    //console.log(data);

    // 총 사용량
    var fmtData = Tw.FormatHelper.convDataFormat(data.data.used, Tw.DATA_UNIT.KB);
    $('#head-band-data-share .num em').text(fmtData.data);
    $('#head-band-data-share .num span').text(fmtData.unit);

    var childHtml = this._dataToHtml(data.childList, '#fe-band-data-share');
    $('#list-band-data-share').append(childHtml);

  },

  /**
   * 핸들바 helper 등록
   * @private
   */
  _registerHelper : function() {
    Handlebars.registerHelper('byteFormat', function (amt){
      return Tw.FormatHelper.convDataFormat(amt, Tw.DATA_UNIT.KB).data;
    });
    Handlebars.registerHelper('byteUnit', function (amt){
      return Tw.FormatHelper.convDataFormat(amt, Tw.DATA_UNIT.KB).unit;
    });
    Handlebars.registerHelper('dateFormat', function (strDate){
      return Tw.DateHelper.getShortDateNoDot(strDate);
    });
  },

  /**
   * 팝업 - 정보보기 버튼 클릭
   * @param title
   * @param contents
   */
  showGuidePopup : function (title, contents) {
    this._popupService.openTypeA(title, contents);
  },

  /**
   * data로 html을 만들어서 리턴
   * @param list - data list
   * @param tmpId - hbs script
   * @returns list html {string}
   * @private
   */
  _dataToHtml : function (list, tmpId){
    if( !list || list.length < 0) {
      return '';
    }

    var tmpl = Handlebars.compile($(tmpId).html());
    var html = '';
    for ( var i = 0; i < list.length ; i++ ) {
      html += tmpl( list[i] );
    }

    return html;
  },

  /**
   * show error alert popup
   * @param code
   * @param msg
   * @private
   */
  _showErrorAlert: function (code, msg) {
    return Tw.Error(code, msg).pop();
  },


  /**
   * minutes -> {days, hours, minutes}
   * @param min
   * @return object {days, hours, minutes}
   */
  minToDayHourMin : function (min) {
    var endDate = moment().add(min, 'minutes');
    var diff = moment(endDate).diff(new Date());
    var diffDuration = moment.duration(diff);
    return {
      days: diffDuration.days(),
      hours: diffDuration.hours(),
      minutes: diffDuration.minutes()
    }
  }


};

/**
 * FileName: myt-fare.bill.set.return-history.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 9. 14
 */
Tw.MyTFareBillSetReturnHistory = function (rootEl) {
  this.$container = rootEl;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._init();
};

Tw.MyTFareBillSetReturnHistory.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._registerHelper();
    this._reqReturnHistory();
    // this._reqMock();
  },
  _initVariables: function () {
    this.returnHistory = this.$container.find('#fe-return-history');
    this._totalCount =  this.$container.find('#fe-total-cnt');
  },
  _bindEvent: function () {

  },

  // 요금 안내서 반송내역 조회
  _reqReturnHistory : function () {
    Tw.Api
      .request(Tw.API_CMD.BFF_05_0039_N, {})
      .done($.proxy(this._successReturnHistory, this))
      .fail($.proxy(this._onFail, this));
  },

  // 요금 안내서 반송내역 조회 (목업)
  _reqMock : function () {
    $.ajax('/mock/myt.return-history.json')
      .done($.proxy(this._successReturnHistory, this))
      .fail($.proxy(this._onFail, this));
  },

  // 데이터 파싱
  _parseData : function (list) {
    // 반송 등록일 기준으로 내림차순 정렬
    list = Tw.FormatHelper.sortObjArrDesc(list, 'undlvRgstDt');
    _.forEach(list, function(data){
      data.undlvRgstDt = Tw.DateHelper.getShortDateNoDot(data.undlvRgstDt);
      data.invDt = Tw.DateHelper.getShortDateNoDot(data.invDt);
      data.sndDt = Tw.DateHelper.getShortDateNoDot(data.sndDt);
      data.billTyp = Tw.MYT_FARE_BILL_SET.RETURN_HISTORY.BILL_TYPE_NAME[$.trim(data.billTyp)] || data.billTyp;
    });
  },

  _parseDate : function (date) {
    return Tw.DateHelper.getShortDateWithFormat(date, 'MM.DD','MMDD');
  },

  _registerHelper : function() {
    Handlebars.registerHelper('formatDate', this._parseDate);
  },

  // 반송내역조회 호출 후 > 반송내역 리스트 더보기 세팅
  _successReturnHistory : function (res) {
    // 발행내역 없는 경우
    if ( res.code === 'ZINVN8319' ) {
      // this._onFail(res);
      return;
    } else if ( res.code !== Tw.API_CODE.CODE_00 ) { // 결과가 성공이 아닐경우
      this._onFail(res);
      return;
    } else if (res.result.returnInfoList.length < 1) { // 리스트가 없을때
      return;
    }

    this._totalCount.text(res.result.returnInfoList.length);
    this._parseData(res.result.returnInfoList);
    this.returnHistory.empty();
    this._moreViewSvc.init({
      list : res.result.returnInfoList,
      callBack : $.proxy(this._renderList,this),
      listOption : {
        groupDateKey : 'undlvRgstDt'
      },
      isOnMoreView : true
    });
  },

  // 반송내역 리스트 생성
  _renderList : function (res) {
    var source = $('#tmplMore').html();
    var template = Handlebars.compile(source);
    var output = template({data : res});
    this.returnHistory.append(output);
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code,err.msg).pop();
  }
};
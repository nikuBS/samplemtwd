/**
 * FileName: myt-fare.bill.set.return-history.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * 요금안내서 반송내역
 * Date: 2018. 9. 14
 */
Tw.MyTFareBillSetReturnHistory = function (rootEl) {
  this.$container = rootEl;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._init();
};

Tw.MyTFareBillSetReturnHistory.prototype = {
  /**
   * 최초 실행
   * @private
   */
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._registerHelper();
    this._reqReturnHistory();
  },
  /**
   * 초기값 설정
   * @private
   */
  _initVariables: function () {
    this.returnHistory = this.$container.find('#fe-return-history');
    this._totalCount =  this.$container.find('#fe-total-cnt');
  },
  /**
   * 이벤트 설정
   * @private
   */
  _bindEvent: function () {

  },

  /**
   * 요금 안내서 반송내역 조회
   * @private
   */
  _reqReturnHistory : function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    Tw.Api
      .request(Tw.API_CMD.BFF_05_0039_N, {})
      .done($.proxy(this._successReturnHistory, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * _reqReturnHistory() 성공 콜백. 반송내역 리스트 더보기 세팅
   * @param res : API Response
   * @private
   */
  _successReturnHistory : function (res) {
    Tw.CommonHelper.endLoading('.container');
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

  /**
   * 수신 데이터 파싱
   * @param list : 반송내역 리스트
   * @private
   */
  _parseData : function (list) {
    // 반송 등록일 기준으로 내림차순 정렬
    list = Tw.FormatHelper.sortObjArrDesc(list, 'undlvRgstDt');
    _.forEach(list, function(data){
      data.undlvRgstDt = Tw.DateHelper.getShortDate(data.undlvRgstDt);
      data.invDt = Tw.DateHelper.getShortDate(data.invDt);
      data.sndDt = Tw.DateHelper.getShortDate(data.sndDt);
      data.billTyp = Tw.MYT_FARE_BILL_SET.RETURN_HISTORY.BILL_TYPE_NAME[$.trim(data.billTyp)] || data.billTyp;
    });
  },

  /**
   * 핸들바스 파일에서 사용할 펑션 등록
   * @private
   */
  _registerHelper : function() {
    Handlebars.registerHelper('formatDate', this._parseDate);
  },

  /**
   * 날짜 포맷팅
   * @param date : 포맷팅 할 날짜(MMDD)
   * @returns {Date}
   * @private
   */
  _parseDate : function (date) {
    return Tw.DateHelper.getShortDateWithFormat(date, 'MM.DD','MMDD');
  },

  /**
   * 반송내역 리스트 생성
   * @param res
   * @private
   */
  _renderList : function (res) {
    var source = $('#tmplMore').html();
    var template = Handlebars.compile(source);
    var output = template({data : res});
    this.returnHistory.append(output);
  },

  /**
   * API Fail
   * @param err
   * @private
   */
  _onFail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code,err.msg).pop();
  }
};
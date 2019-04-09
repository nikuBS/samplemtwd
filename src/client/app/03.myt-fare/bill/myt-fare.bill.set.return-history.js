/**
 * @file myt-fare.bill.set.return-history.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018-09-14
 */

/**
 * @class
 * @desc MyT > 나의요금 > 요금 안내서 설정 > 안내서 반송내역
 * @param {Object} rootEl - dom 객체
 */
Tw.MyTFareBillSetReturnHistory = function (rootEl) {
  this.$container = rootEl;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._init();
};

Tw.MyTFareBillSetReturnHistory.prototype = {
  /**
   * @function
   * @desc 최초 실행
   */
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._reqReturnHistory();
  },
  /**
   * @function
   * @desc 초기값 설정
   */
  _initVariables: function () {
    this.returnHistory = this.$container.find('#fe-return-history');
    this._totalCount =  this.$container.find('#fe-total-cnt');
    this._noReturnHistory =  this.$container.find('#fe-no-list');
  },
  /**
   * @function
   * @desc 이벤트 설정
   */
  _bindEvent: function () {

  },

  /**
   * @function
   * @desc 요금 안내서 반송내역 조회
   */
  _reqReturnHistory : function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    Tw.Api
      .request(Tw.API_CMD.BFF_05_0039_N, {})
      .done($.proxy(this._successReturnHistory, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc _reqReturnHistory() 성공 콜백. 반송내역 리스트 더보기 세팅
   * @param {JSON} res : API Response
   */
  _successReturnHistory : function (res) {
    Tw.CommonHelper.endLoading('.container');
    // 발행내역 없는 경우
    if ( res.code === 'ZINVN8319' ) {
      this._noReturnHistory.removeClass('none');
      return;
    } else if ( res.code !== Tw.API_CODE.CODE_00 ) { // 결과가 성공이 아닐경우
      this._onFail(res);
      return;
    } else if (res.result.returnInfoList.length < 1) { // 리스트가 없을때
      this._noReturnHistory.removeClass('none');
      return;
    }

    this._totalCount.text(res.result.returnInfoList.length);
    this._parseData(res.result.returnInfoList);
    this.returnHistory.empty();
    this._moreViewSvc.init({
      list : res.result.returnInfoList,
      callBack : $.proxy(this._renderList,this),
      isOnMoreView : true
    });
  },

  /**
   * @function
   * @desc 수신 데이터 파싱
   * @param {Array} list : 반송내역 리스트
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
   * @function
   * @desc 반송내역 리스트 생성
   * @param {JSON} res
   */
  _renderList : function (res) {
    var source = $('#tmplMore').html();
    var template = Handlebars.compile(source);
    var output = template({list : res.list});
    this.returnHistory.append(output);
  },

  /**
   * @function
   * @desc API Fail
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code,err.msg).pop();
  }
};
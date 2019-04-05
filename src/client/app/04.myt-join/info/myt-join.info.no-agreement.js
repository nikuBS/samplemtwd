/**
 * @file myt-join.info.no-agreement.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018. 10. 08
 * 무약정 플랜 포인트 내역
 */
Tw.MyTJoinInfoNoAgreement = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._dateHelper = Tw.DateHelper;
  this._init();
};

Tw.MyTJoinInfoNoAgreement.prototype = {
  /**
   * 최초 실행
   * @private
   */
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._registerHelper();
    this._reqNoAgreement();
  },
  /**
   * 초기값 설정
   * @private
   */
  _initVariables: function () {
    this._data = {};  // 무약정 플랜 조회 데이타
    
    // elements..
    this.$list = this.$container.find('#fe-list');
    this.$noData = this.$container.find('#fe-no-data');
    this.$btnCondition = this.$container.find('.bt-select'); // 포인트 사용유형 조회 버튼
    this.$usablePoint = this.$container.find('#fe-usable-point'); // 사용 가능한 포인트
    this.$removeDate = this.$container.find('#fe-remove-date'); // 소멸 예정 일자
    this.$removePoint = this.$container.find('#fe-remove-point'); // 소멸 예정 포인트
    this.$totalCount = this.$container.find('#fe-total-cnt'); // 총 건수
    this.$totalSave = this.$container.find('#fe-total-save'); // 총 적립
    this.$totalUse = this.$container.find('#fe-total-use'); // 총 사용
    this.$totalRemove = this.$container.find('#fe-total-remove'); // 총 소멸
  },
  /**
   * 이벤트 설정
   * @private
   */
  _bindEvent: function () {
    this.$btnCondition.on('click', $.proxy(this._changeCondition, this));
  },

  /**
   * 무약정 플랜 포인트 내역 조회 파라미터 설정
   * @returns {{startMonth: (*|string), startDay: (*|string), endDay: (*|string), startYear: (*|string), endMonth: (*|string), endYear: (*|string)}}
   * @private
   */
  _makeParam : function () {
    var edate = this._dateHelper.getCurrentShortDate(new Date());
    var sdate = this._periodDate(edate, -3, 'years');

    return {
      startYear : this._dateForamtConvert(sdate, 'YYYY'),
      startMonth : this._dateForamtConvert(sdate, 'MM'),
      startDay : this._dateForamtConvert(sdate, 'DD'),
      endYear : this._dateForamtConvert(edate, 'YYYY'),
      endMonth : this._dateForamtConvert(edate, 'MM'),
      endDay : this._dateForamtConvert(edate, 'DD')
    };
  },

  /**
   * 무약정 플랜 포인트 내역 API 조회
   * @private
   */
  _reqNoAgreement : function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService
      .request(Tw.API_CMD.BFF_05_0060, this._makeParam())
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * 무약정 플랜 포인트 내역 조회 성공시
   * @param resp : API response
   * @private
   */
  _onSuccess : function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._onFail(resp);
      return;
    }

    this._parseData(resp.result);
    this._setData(resp.result);
    this._data = resp.result;
    this._search();
    Tw.CommonHelper.endLoading('.container');
  },

  /**
   * 수신 데이터 파싱
   * @param resp
   * @private
   */
  _parseData : function (resp) {
    var _format = Tw.FormatHelper;
    resp.usablePt = _format.addComma(resp.usablePt);
    resp.extnSchdDt = this._dateForamt(resp.extnSchdDt);
    resp.extnSchdPt = _format.addComma(resp.extnSchdPt);
    resp.totAccumPt = _format.addComma(resp.totAccumPt);
    resp.totUsedPt = _format.addComma(resp.totUsedPt);
    resp.totExtnPt = _format.addComma(resp.totExtnPt);
  },

  /**
   * 수신 데이터 일러먼트에 값 설정
   * @param resp
   * @private
   */
  _setData : function (resp) {
    this.$usablePoint.text(resp.usablePt);
    if (Number(Tw.FormatHelper.removeComma(resp.extnSchdPt)) > 0 && resp.extnSchdDt !== '') {
      this.$removeDate.text(resp.extnSchdDt).parent().removeClass('none');
    }
    this.$removePoint.text(resp.extnSchdPt);
    this.$totalCount.text(resp.datas.length);
    this.$totalSave.text(resp.totAccumPt);
    this.$totalUse.text(resp.totUsedPt);
    this.$totalRemove.text(resp.totExtnPt);
  },

  /**
   * 수신한 무약정 플랜 데이터를 가지고 리스트 생성
   * @private
   */
  _search : function () {
    var _list = this._data.datas;
    var _type = this.$btnCondition.attr('id');
    // "전체" 가 아닐 경우만 해당 타입의 리스트만 뽑는다.
    if (_type !== '0') {
      _list = _.filter(_list, function (o) {
        return o.chg_typ === Tw.JOIN_INFO_NO_AGREEMENT.CHANGE_TYPE[_type];
      });
    }

    this.$list.empty();
    this.$totalCount.text(_list.length);

    this.$noData.addClass('none');
    if ( _list.length < 1 ) {
      this.$noData.removeClass('none');
      return;
    }

    // 더보기 설정
    this._moreViewSvc.init({
      list : _.sortBy(_list, 'op_dt').reverse(),
      callBack : $.proxy(this._renderList,this),
      isOnMoreView : true
    });
  },

  /**
   * 날짜 포맷 설정
   * @param date
   * @returns {string} : YYYY.M.D. ex) 2018.6.1.
   * @private
   */
  _dateForamt : function (date) {
    return Tw.FormatHelper.isEmpty(date) ? date:Tw.DateHelper.getShortDate(date);
  },

  /**
   * 날짜 포맷 설정
   * @param date : 변환하려는 날짜 (YYYYMMDD)
   * @param format : 변환하려는 포맷
   * @returns {*}
   * @private
   */
  _dateForamtConvert : function (date, format) {
    if (!Tw.DateHelper.isValid(date)) {
      return '';
    }
    return Tw.DateHelper.getShortDateWithFormat(date, format,'YYYYMMDD');
  },

  /**
   * 주어진 날짜에서 특정 기간의 날짜 구하기
   * @param date    : 날짜 (YYYYMMDD)
   * @param amount  : 기간 ( -1 , 2 ..)
   * @param unit    : 단위 (years, month, day ..)
   * @returns {Date}
   * @private
   */
  _periodDate : function (date, amount, unit) {
    var format = 'YYYYMMDD';

    return Tw.DateHelper.getShortDateWithFormatAddByUnit(date,amount,unit,format,format);
  },

  /**
   * 핸들바스로 리스트 생성
   * @param res
   * @private
   */
  _renderList : function (res) {
    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var output = template({ list: res.list });
    this.$list.append(output);
  },

  /**
   * 핸들바스 파일에서 사용할 펑션 등록
   * @private
   */
  _registerHelper : function() {
    Handlebars.registerHelper('formatDate', this._dateForamt);
    Handlebars.registerHelper('removeKorean', this._removeKorean);
  },

  /**
   * 포인트 사용유형 조회 조건 액션시트
   * @param event
   * @private
   */
  _changeCondition: function (event) {
    var $target = $(event.currentTarget);
    var options = {
      hbs:'actionsheet01',
      layer:true,
      data:Tw.POPUP_TPL.JOIN_INFO_NO_AGREEMENT,
      btnfloating : {'attr':'type="button" id="fe-back"','txt':Tw.BUTTON_LABEL.CLOSE}
    };
    this._popupService.open(options, $.proxy(this._selectPopupCallback, this, $target));
  },

  /**
   * [포인트 사용유형 조회 조건] 오픈 후 콜백 함수. 액션시트 내의 항목에 대한 클릭 이벤트 설정한다.
   * @param $searchType : 조회조건 (0:전체, 1:포인트 사용, 2:포인트 적립, 3:포인트 소멸)
   * @param $layer
   * @private
   */
  _selectPopupCallback: function ($searchType, $layer) {
    // 아이템 클릭이벤트 및 checked 설정
    $layer.find('[name="r1"]')
      .one('click', $.proxy(this._setSelectedValue, this, $searchType))
      .eq(this.$btnCondition.attr('id')).prop('checked',true);

    // 닫기 버튼 클릭
    $layer.one('click', '#fe-back', this._popupService.close);
  },

  /**
   * _selectPopupCallback() 에서 선택항목 클릭 시 처리하는 함수
   * _selectPopupCallback()에서 선택한 항목의 리스트를 다시 호출
   * @param $searchType
   * @param event
   * @private
   */
  _setSelectedValue: function ($searchType, event) {
    var $target = $(event.currentTarget);
    $searchType.attr('id', $target.attr('id'));
    $searchType.text($target.val());

    // 선택한 유형으로 리스트업
    this._search();
    this._popupService.close();
  },

  /**
   * 한글 삭제 함수
   * @param str : 한글 삭제할 텍스트
   * @returns {*} : 한글이 삭제된 값 반환
   * @private
   */
  _removeKorean : function (str) {
    return str.replace(/[가-힣]/g,'');
  },

  /**
   * API Fail 시 호출
   * @param err
   * @private
   */
  _onFail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code,err.msg).pop();
  }
};

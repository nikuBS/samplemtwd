/**
 * @file myt-join.info.no-agreement.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018-10-08
 */

/**
 * @class
 * @desc MyT > 나의가입정보 > 무약정 플랜 포인트 내역
 * @param {Object} rootEl - dom 객체
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
   * @function
   * @desc 최초 실행
   */
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._registerHelper();
    this._reqNoAgreement();
  },
  /**
   * @function
   * @desc 초기값 설정
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
   * @function
   * @desc 이벤트 설정
   */
  _bindEvent: function () {
    this.$btnCondition.on('click', $.proxy(this._changeCondition, this));
  },

  /**
   * @function
   * @desc 무약정 플랜 포인트 내역 조회 파라미터 설정
   * @returns {JSON} 검색일자(최근 3년)
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
   * @function
   * @desc 무약정 플랜 포인트 내역 API 조회
   */
  _reqNoAgreement : function () {
    Tw.CommonHelper.startLoading('.container', 'grey', true);
    this._apiService
      .request(Tw.API_CMD.BFF_05_0060, this._makeParam())
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  /**
   * @function
   * @desc 무약정 플랜 포인트 내역 조회 성공시
   * @param {JSON} resp : API response
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
   * @function
   * @desc 수신 데이터 파싱
   * @param {JSON} resp
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
   * @function
   * @desc 수신 데이터 일러먼트에 값 설정
   * @param {JSON} resp
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
   * @function
   * @desc 수신한 무약정 플랜 데이터를 가지고 리스트 생성
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
   * @function
   * @desc 날짜 포맷 설정
   * @param {String} date
   * @returns {string} : YYYY.M.D. ex) 2018.6.1.
   */
  _dateForamt : function (date) {
    return Tw.FormatHelper.isEmpty(date) ? date:Tw.DateHelper.getShortDate(date);
  },

  /**
   * @function
   * @desc 날짜 포맷 설정
   * @param {String} date : 변환하려는 날짜 (YYYYMMDD)
   * @param {String} format : 변환하려는 포맷
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  _dateForamtConvert : function (date, format) {
    if (!Tw.DateHelper.isValid(date)) {
      return '';
    }
    return Tw.DateHelper.getShortDateWithFormat(date, format,'YYYYMMDD');
  },

  /**
   * @function
   * @desc 주어진 날짜에서 특정 기간의 날짜 구하기
   * @param {String} date    : 날짜 (YYYYMMDD)
   * @param {int} amount  : 기간 ( -1 , 2 ..)
   * @param {String} unit    : 단위 (years, month, day ..)
   * @returns {Date}
   */
  _periodDate : function (date, amount, unit) {
    var format = 'YYYYMMDD';

    return Tw.DateHelper.getShortDateWithFormatAddByUnit(date,amount,unit,format,format);
  },

  /**
   * @function
   * @desc 핸들바스로 리스트 생성
   * @param {JSON} res
   */
  _renderList : function (res) {
    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var output = template({ list: res.list });
    this.$list.append(output);
  },

  /**
   * @function
   * @desc 핸들바스 파일에서 사용할 펑션 등록
   */
  _registerHelper : function() {
    Handlebars.registerHelper('formatDate', this._dateForamt);
    Handlebars.registerHelper('removeKorean', this._removeKorean);
  },

  /**
   * @function
   * @desc 포인트 사용유형 조회 조건 액션시트
   * @param {Object} event
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
   * @function
   * @desc [포인트 사용유형 조회 조건] 오픈 후 콜백 함수. 액션시트 내의 항목에 대한 클릭 이벤트 설정한다.
   * @param {Object} $searchType : 조회조건 (0:전체, 1:포인트 사용, 2:포인트 적립, 3:포인트 소멸)
   * @param {Object} $layer
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
   * @function
   * @desc _selectPopupCallback() 에서 선택항목 클릭 시 처리하는 함수
   * @param {Object} $searchType
   * @param {Object} event
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
   * @function
   * @desc 한글 삭제 함수
   * @param {String} str : 한글 삭제할 텍스트
   * @returns {String} : 한글이 삭제된 값 반환
   */
  _removeKorean : function (str) {
    return str.replace(/[가-힣]/g,'');
  },

  /**
   * @function
   * @desc API Fail 시 호출
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.CommonHelper.endLoading('.container');
    Tw.Error(err.code,err.msg).pop();
  }
};

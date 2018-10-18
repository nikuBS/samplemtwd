/**
 * FileName: myt-join.info.no-agreement.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 10. 08
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
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._registerHelper();
    this._reqNoAgreement();
  },
  _initVariables: function () {
    this._lastYear = new Date().getFullYear().toString(); // 마지막 append 년도
    this._data = {};  // 무약정 플랜 조회 데이타
    
    // elements..
    this.$list = this.$container.find('#fe-list');
    this.$btnCondition = this.$container.find('.bt-select'); // 포인트 사용유형 조회 버튼
    this.$usablePoint = this.$container.find('#fe-usable-point'); // 사용 가능한 포인트
    this.$removeDate = this.$container.find('#fe-remove-date'); // 소멸 예정 일자
    this.$removePoint = this.$container.find('#fe-remove-point'); // 소멸 예정 포인트
    this.$totalCount = this.$container.find('#fe-total-cnt'); // 총 건수
    this.$totalSave = this.$container.find('#fe-total-save'); // 총 적립
    this.$totalUse = this.$container.find('#fe-total-use'); // 총 사용
    this.$totalRemove = this.$container.find('#fe-total-remove'); // 총 소멸

  },
  _bindEvent: function () {
    this.$btnCondition.on('click', $.proxy(this._changeCondition, this));
  },

  _makeParam : function () {
    var edate = this._dateHelper.getCurrentShortDate(new Date());
    var sdate = this._periodDate(edate, -3, 'years');

    return {
      startYear : this._dateForamt2(sdate, 'YYYY'),
      startMonth : this._dateForamt2(sdate, 'MM'),
      startDay : this._dateForamt2(sdate, 'DD'),
      endYear : this._dateForamt2(edate, 'YYYY'),
      endMonth : this._dateForamt2(edate, 'MM'),
      endDay : this._dateForamt2(edate, 'DD')
    };
  },

  // 무약정 플랜 포인트 내역 조회
  _reqNoAgreement : function () {
    this._apiService
      .request(Tw.API_CMD.BFF_05_0060, this._makeParam())
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  // Mockup
  _mockReqNoAgreement : function () {
    $.ajax('/mock/myt.join.info.no-agreement.json')
      .done($.proxy(this._onSuccess, this))
      .fail($.proxy(this._onFail, this));
  },

  _dateForamt : function (date) {
    return this._dateForamt2(date, 'YYYY.MM.DD');
  },

  _dateForamt2 : function (date, format) {
    if (!Tw.DateHelper.isValid(date)) {
      return '';
    }
    return Tw.DateHelper.getShortDateWithFormat(date, format,'YYYYMMDD');
  },

  _periodDate : function (date, amount, unit) {
    var format = 'YYYYMMDD';

    return Tw.DateHelper.getShortDateWithFormatAddByUnit(date,amount,unit,format,format);
  },

  _parseDate : function (date) {
    return Tw.DateHelper.getShortDateWithFormat(date, 'MM.DD','MMDD');
  },

  _parseData : function (resp) {
    var _format = Tw.FormatHelper;
    resp.usablePt = _format.addComma(resp.usablePt);
    resp.extnSchdDt = this._dateForamt(resp.extnSchdDt);
    resp.extnSchdPt = _format.addComma(resp.extnSchdPt);
    resp.totAccumPt = _format.addComma(resp.totAccumPt);
    resp.totUsedPt = _format.addComma(resp.totUsedPt);
    resp.totExtnPt = _format.addComma(resp.totExtnPt);
  },

  _setData : function (resp) {
    this.$usablePoint.text(resp.usablePt);
    if (resp.extnSchdDt !== '') {
      this.$removeDate.text(resp.extnSchdDt).parent().removeClass('none');
    }
    this.$removePoint.text(resp.extnSchdPt);
    this.$totalCount.text(resp.datas.length);
    this.$totalSave.text(resp.totAccumPt);
    this.$totalUse.text(resp.totUsedPt);
    this.$totalRemove.text(resp.totExtnPt);
  },

  _onSuccess : function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._onFail(resp);
      return;
    }

    this._parseData(resp.result);
    this._setData(resp.result);
    this._data = resp.result;
    this._search();
  },

  _search : function () {

    // 조회 데이터가 없거나, 포인트 사용,적립 내역이 없는 경우는 보여주지 않는다.
    if ( this._data.datas.length < 1 ) {
      this.$list.text(Tw.JOIN_INFO_NO_AGREEMENT.NO_DATA);
      this.$totalCount.text(0);
      return;
    }

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

    // 더보기 설정
    this._moreViewSvc.init({
      list : _.sortBy(_list, 'op_dt').reverse(),
      callBack : $.proxy(this._render,this),
      isOnMoreView : true
    });
  },

  // 마크업의 리스트 구조로 변경해준다.
  _convertData : function (resp) {
    var _this = this;
    // 년도별로 그룹바이
    var yearGroup = _.groupBy(resp.list, function(o){
      return o.op_dt.substring(0, 4);
    });

    //
    var data = _.map(yearGroup, function(o, k){
      var dateGroup = _.groupBy(o, function(objectOfYearGroup){
        return objectOfYearGroup.op_dt.substring(4);
      });

      var _data = _.map(dateGroup,function(objectOfDateGroup, k1){
        var sortData = _.sortBy(objectOfDateGroup, function(o1){
          var _text = o1.dtl_ctt.substring(0,7);
          if ( _this._dateHelper.isValid(_text) ) {
            o1.hasDtlCttDate = true;
            o1.dtlCttDate = _text;
            o1.dtl_ctt = o1.dtl_ctt.substring(_text.length);
          }

          return [o1.op_dt, o1.op_tm];
        });

        return {
          date : k1,
          subList : sortData.reverse()
        };
      });


      return {
        year : k,
        list : _.sortBy(_data,'date').reverse()
      };
    });

    return data.reverse();
  },

  _render : function (res) {
    var convertData = this._convertData(res);
    var _this = this;
    _.forEach(convertData, function (o) {

      o.hasYear = _this._lastYear === o.year ? false:true;
      _this._lastYear = o.hasYear ? o.year : _this._lastYear;
      _this._renderList(o);

    });
  },

  _renderList : function (res) {
    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var output = template({ data: res });
    this.$list.append(output);
  },

  _registerHelper : function() {
    Handlebars.registerHelper('numComma', Tw.FormatHelper.addComma);
    Handlebars.registerHelper('formatDate', this._parseDate);
    Handlebars.registerHelper('formatDateFull', this._dateForamt);
    Handlebars.registerHelper('removeKorean', this._removeKorean);
  },

  _changeCondition: function (event) {
    var $target = $(event.currentTarget);

    this._popupService.open({
      hbs: 'actionsheet_select_a_type',
      layer: true,
      title: Tw.POPUP_TPL.JOIN_INFO_NO_AGREEMENT.title,
      data: Tw.POPUP_TPL.JOIN_INFO_NO_AGREEMENT.data
    }, $.proxy(this._selectPopupCallback, this, $target));
  },

  _selectPopupCallback: function ($target, $layer) {
    $layer.one('click', '.condition', $.proxy(this._setSelectedValue, this, $target));
    $layer.find('#' + this.$btnCondition.attr('id')).addClass('checked');
  },

  _setSelectedValue: function ($target, event) {
    var $selectedValue = $(event.currentTarget);
    var _id = $selectedValue.attr('id');
    $target.attr('id', _id);
    $target.text($selectedValue.text());

    // 선택한 유형으로 리스트업
    this._search();
    this._popupService.close();
  },

  // 한글 삭제
  _removeKorean : function (str) {
    return str.replace(/[가-힣]/g,'');
  },

  // API Fail
  _onFail: function (err) {
    Tw.Error(err.code,err.msg).pop();
  }
};

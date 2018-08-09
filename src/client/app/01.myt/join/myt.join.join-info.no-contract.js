/**
 * FileName: myt.join.join-info.no-contract
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.08.03
 */
Tw.MyTJoinJoinInfoNoContract = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._dateHelper = Tw.DateHelper;
  this._formatHelper = Tw.FormatHelper;
  this._totoalList = [];
  this._init();
};

Tw.MyTJoinJoinInfoNoContract.prototype = {

  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._getNoContractResponse();
  },

  _initVariables: function () {
    this.$header = this.$container.find('#fe-header');
    this.$historyList = this.$container.find('#fe-history-list');
    this.$noList = this.$container.find('#fe-no-list');
    this.$list = this.$historyList.find('.payment-detail-wrap');
    this.$more = this.$container.find('.bt-more-wrap');
    this.$moreCnt = this.$container.find('#fe-more-cnt');
    this.$bottom = this.$container.find('#fe-bottom');
    this.$tSdate = this.$container.find('#fe-t-sdate');
    this.$tEdate = this.$container.find('#fe-t-edate');
    this.$inputSdate = this.$container.find('#fe-sdate');
    this.$inputEdate = this.$container.find('#fe-edate');
    this.$period = this.$container.find('.tube-list [role=radio]');
    this.$search = this.$container.find('#fe-search');
    this.$dateSelcet = this.$container.find('.date-selcet');
    this._initPeriod();
  },

    _bindEvent: function () {
    this._popupService._popupClose();
    this.$period.on('click',$.proxy(this._changePeriod,this));
    this.$search.on('click', $.proxy(this._search,this));
    this.$more.on('click', $.proxy(this._onMore,this));
  },

  _setHeaderPeriod : function (sdate , edate) {
    this.$tSdate.text(sdate);
    this.$tEdate.text(edate);
  },

  _initPeriod : function () {
    var eDate = this._dateHelper.getCurrentShortDate();
    eDate = this._dateHelper.getShortDateWithFormat(eDate, 'YYYY-MM-DD', 'YYYYMMDD');
    var sDate = this._dateHelper.getShortDateWithFormatAddByUnit(eDate,-10,'days','YYYY-MM-DD','YYYY-MM-DD');


    this.$inputSdate.val(sDate);
    this.$inputEdate.val(eDate);
  },

  _changePeriod : function (e) {
    var $this = $(e.currentTarget);
    var endDate = this._dateHelper.getCurrentShortDate();
    endDate = this._dateHelper.getShortDateNoDot(endDate);
    var startDate = this.$tSdate.text();
    var days = 'days', month = 'month', years = 'years';

    switch ($this.index()) {
      case 0 :
        this.$dateSelcet.hide('slow');
        startDate = this._periodDate(endDate, -7, days); // 1주일
        break;
      case 1 :
        this.$dateSelcet.hide('slow');
        startDate = this._periodDate(endDate, -1, month); // 1개월
        break;
      case 2 :
        this.$dateSelcet.hide('slow');
        startDate = this._periodDate(endDate, -3, month); // 3개월
        break;
      case 3 :
        this.$dateSelcet.hide('slow');
        startDate = this._periodDate(endDate, -6, month); // 6개월
        break;
      case 4 :
        this.$dateSelcet.hide('slow');
        startDate = this._periodDate(endDate, -1, years); // 1년
        break;
      case 5 :
        this.$dateSelcet.toggle('slow');
        break;
    }

    this._setHeaderPeriod(startDate, endDate);
  },

  _periodDate : function (date, amount, unit) {
    var format = 'YYYY.MM.DD';
    var currentFormat = 'YYYY.MM.DD';

    return this._dateHelper.getShortDateWithFormatAddByUnit(date,amount,unit,format,currentFormat);
  },

  // 조회 버튼 클릭 이벤트
  _search : function () {
    // 기간 선택이 직접 설정일 경우
    if ( this.$period.eq(5).hasClass('checked') ) {
      var sdate = this.$inputSdate.val();
      var edate = this.$inputEdate.val();
      var diff = this._dateHelper.getDiffByUnit(sdate, edate, 'days');

      // 시작일이 종료일보다 클 경우
      if ( diff > 0 ) {
        this._popupService.openAlert(Tw.MSG_MYT.JOIN_INFO_A01, Tw.POPUP_TITLE.NOTIFY);
        return false;
      }
      // 시작일이 365일 이상일 경우
      if ( diff < -365 ) {
        var beforeDate365 = this._dateHelper.getShortDateWithFormatAddByUnit(edate,-365,'days','YYYY-MM-DD','YYYY-MM-DD');
        var msg = Tw.MSG_MYT.JOIN_INFO_A02.replace(/\{0\}/, beforeDate365);
        this._popupService.openAlert(msg, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._setBefore365, this,beforeDate365));
        return false;
      }
      // 시작일이 유효한 일자가 아닐경우
      if ( !this._dateHelper.isValid(sdate) ) {
        this._popupService.openAlert(Tw.MSG_MYT.JOIN_INFO_A03, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._invalidDate, this, this.$inputSdate));
        return false;
      }
      // 종료일이 유효한 일자가 아닐경우
      if ( !this._dateHelper.isValid(edate) ) {
        this._popupService.openAlert(Tw.MSG_MYT.JOIN_INFO_A04, Tw.POPUP_TITLE.NOTIFY, $.proxy(this._invalidDate, this, this.$inputEdate));
        return false;
      }

      sdate = this._dateHelper.getShortDateWithFormat(sdate, 'YYYY.MM.DD', 'YYYY-MM-DD');
      edate = this._dateHelper.getShortDateWithFormat(edate, 'YYYY.MM.DD', 'YYYY-MM-DD');
      this._setHeaderPeriod(sdate, edate);
    }

    // 날짜 선택 영역 toggle
    this.$container.find('.btn-toggle').click();
    this._getNoContractResponse();

  },

  _setBefore365 : function (date) {
    this.$inputSdate.val(date);
    this._popupService.close();
  },

  _invalidDate : function ($selector) {
    $selector.focus();
    this._popupService.close();
  },

  _getNoContractResponse: function () {

    var sdate = this.$tSdate.text();
    var edate = this.$tEdate.text();
    if ( !sdate || !edate) {
      edate = this._dateHelper.getCurrentShortDate();
      edate = this._dateHelper.getShortDateNoDot(edate);
      sdate = this._periodDate(edate, -7, 'days');
      this._setHeaderPeriod(sdate, edate);
    }
    var regx = '/[^0-9]/g';
    sdate = sdate.replace(regx, '');
    edate = edate.replace(regx, '');

    var _startYear = this._dateHelper.getShortDateWithFormat(sdate, 'YYYY','YYYYMMDD'),
      _startMonth = this._dateHelper.getShortDateWithFormat(sdate, 'MM','YYYYMMDD'),
      _startDay = this._dateHelper.getShortDateWithFormat(sdate, 'DD','YYYYMMDD'),
      _endYear = this._dateHelper.getShortDateWithFormat(edate, 'YYYY','YYYYMMDD'),
      _endMonth = this._dateHelper.getShortDateWithFormat(edate, 'MM','YYYYMMDD'),
      _endDay = this._dateHelper.getShortDateWithFormat(edate, 'DD','YYYYMMDD');

    this._apiService
      .request(Tw.API_CMD.BFF_05_0060, {
        startYear : _startYear,
        startMonth : _startMonth,
        startDay : _startDay,
        endYear : _endYear,
        endMonth : _endMonth,
        endDay : _endDay
      })
      .done($.proxy(this._renderTemplate, this))
      .fail($.proxy(this._onFail, this));
  },

  _renderTemplate : function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      res = res.result;

      this._renderHader(res);
      this._renderListOne(res);

    } else {
      this._onFail(res);
    }
  },

  _parseHeader : function (res) {
    res.usablePt = this._formatHelper.addComma(res.usablePt);
    res.extnSchdDt = this._dateHelper.getShortDateWithFormat(res.extnSchdDt, 'YYYY.MM.DD','YYYYMMDD');
    res.extnSchdPt = this._formatHelper.addComma(res.extnSchdPt);

    return res;
  },

  // 상단 템플릿 생성
  _renderHader : function (res) {
    var source = $('#tmplHeader').html();
    var template = Handlebars.compile(source);
    var data = this._parseHeader(res);
    var output = template({ data: data });
    this.$header.empty().append(output);
  },

  _parseList : function (res) {
    if(!res){
      return res;
    }
    _.map(res, $.proxy(function( line ){
      line.op_dt = this._dateHelper.getShortDateWithFormat(line.op_dt, 'YYYY.MM.DD','YYYYMMDD');
      line.chg_pt = this._formatHelper.addComma(line.chg_pt);
      line.isUse = false;
      switch (line.chg_typ) {
        case Tw.NO_CONTRACT_TYPE.USE :
          line.isUse = true;
          break;
        case Tw.NO_CONTRACT_TYPE.SAVE :
          line.css = 'tx-blue';
          break;
        case Tw.NO_CONTRACT_TYPE.EXTINCTION :
          line.css = 'tx-red';
          break;
      }

    },this));

    return res;
  },

  // 리스트 조회 후 처음 한번 호출
  _renderListOne : function (res) {
    var list = res.datas;
    this.$noList.empty();
    this.$list.empty();
    this.$bottom.hide();
    this.$more.hide();

    if ( list.length > 0 ){
      this._totoalList = _.chunk(list, Tw.DEFAULT_LIST_COUNT);
      this._renderList(this.$list, this._totoalList.shift());
      this._renderBottom(res);

    } else {
      this._renderNoList();
    }
  },

  _moreButton : function () {
    var nextList = _.first(this._totoalList);
    if ( nextList ) {
      this.$moreCnt.text( '(0)'.replace('0', nextList.length) );
      this.$more.show();
    } else {
      this.$more.hide();
    }
  },

  // 리스트
  _renderList : function ($container, res) {
    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var data = this._parseList(res);
    var output = template({ list: data });
    $container.append(output);
    this._moreButton();
  },

  _renderNoList : function () {
    var source = $('#tmplNoList').html();
    var template = Handlebars.compile(source);
    var output = template();
    this.$noList.empty().append(output);
  },

  // 더보기 클릭
  _onMore : function () {
    if( this._totoalList.length > 0 ){
      this._renderList(this.$list, this._totoalList.shift());
    }
  },

  _parseBottom : function (res) {
    res.totAccumPt = this._formatHelper.addComma(res.totAccumPt);
    res.totUsedPt = this._formatHelper.addComma(res.totUsedPt);
    res.totExtnPt = this._formatHelper.addComma(res.totExtnPt);

    return res;
  },

  // 상단 템플릿 생성
  _renderBottom : function (res) {
    var source = $('#tmpBottom').html();
    var template = Handlebars.compile(source);
    var data = this._parseBottom(res);
    var output = template({ data: data });
    this.$bottom.empty().append(output).show();
  },

  _onFail: function (err) {
    this._popupService.openAlert(err.msg + ' : ' + err.code);
  }


};
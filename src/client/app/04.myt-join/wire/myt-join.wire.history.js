/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청현황(MS_04_01_01)
 * FileName: myt-join.wire.history.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 * Summary: 인터넷/집전화/IPTV 신청현황 목록 조회
 */
Tw.MyTJoinWireHistory = function (rootEl, strInitData) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
  this._registerHelper();
  this._initListUi(JSON.parse(strInitData));
};

Tw.MyTJoinWireHistory.prototype = {

  // API TYPEs
  _ATYPE_167 : '167',  // 신규가입상세내역
  _ATYPE_162 : '162',  // 설치장소변경상세
  _ATYPE_168 : '168',  // 가입상품변경 상세내역
  _ATYPE_143 : '143',  // 유선 약정기간 상세내역
  _ATYPE_153 : '153',  // 요금상품변경 상세내역

  /**
   * 현재 페이지 번호
   */
  _totPageNum: 0,

  /**
   * 현재 페이지 번호
   */
  _nowPageNum: 1,

  /**
   * 목록 전체 count
   */
  _listTotCnt: 0,

  /**
   * 목록 data
   */
  _list: [],

  /**
   * 페이징 목록 data
   */
  _pagingList: [],

  /**
   * 목록의 마지막 년도
   */
  _listLastYear: '',

  /**
   * templates
   */
  _listContBox : null,
  _listMoreBtn : null,
  _listItemTmpltMap : {},
  _listYearDivTmplt : null,

  /**
   * 초기화 데이터 ui로 변경
   * @private
   */
  _initListUi: function(initData) {
    if(!initData || initData.length === 0){
      this._listNoData = $('#no-data-tmplt').html();
      $('#cont-boxes').html(this._listNoData);
      return;
    }

    // init templates
    this._listContBox = $('#list-cont-box-tmplt').html();
    this._listMoreBtn = $('#bt-more-tmplt').html();
    this._listItemTmpltMap[this._ATYPE_167] = Handlebars.compile($('#list-cont-item-tmplt-'+this._ATYPE_167).html());
    this._listItemTmpltMap[this._ATYPE_162] = Handlebars.compile($('#list-cont-item-tmplt-'+this._ATYPE_162).html());
    this._listItemTmpltMap[this._ATYPE_168] = Handlebars.compile($('#list-cont-item-tmplt-'+this._ATYPE_168).html());
    this._listItemTmpltMap[this._ATYPE_143] = Handlebars.compile($('#list-cont-item-tmplt-'+this._ATYPE_143).html());
    this._listItemTmpltMap[this._ATYPE_153] = Handlebars.compile($('#list-cont-item-tmplt-'+this._ATYPE_153).html());
    this._listYearDivTmplt = Handlebars.compile($('#list-year-div-tmplt').html());

    this._list = initData;
    this._listTotCnt = this._list.length;
    this._insertDateFieldAndSort();

    // 페이징 목록 만들기, 날짜 입력
    var page = 0;
    var pageSize = 20;
    for(var i = 0; i < this._list.length; i++){

      if(i % pageSize === 0){
        page++;
      }
      if(!this._pagingList[page]){
        this._pagingList[page] = [];
      }
      this._list[i].dataNo = i;
      this._pagingList[page].push(this._list[i]);

      // 날짜 및 데이터 변경
      if ( this._list[i].atype === '167' || this._list[i].atype === '168' ) {
        this._list[i].svcPrefrDtm = Tw.DateHelper.getCurrentDateTime(this._list[i].svcPrefrDtm);
      }
      if ( this._list[i].atype === '162') {
        this._list[i].onOffName = Tw.MYT_JOIN_WIRE_LOC_CHG_CONN_TYPE[this._list[i].onOff];
        this._list[i].setPrefrDt = Tw.DateHelper.getShortDate(this._list[i].setPrefrDt);
      }
    }
    this._totPageNum = page;

    this._printList(this._pagingList[1]);
  },

  /**
   * 날짜필드를 통일하고, 전체 list를 날짜기준으로 sort
   * @private
   */
  _insertDateFieldAndSort: function(){
    for(var i = 0; i < this._list.length; i++){
      if(this._list[i].atype === this._ATYPE_162){
        this._list[i].dt = this._list[i].occrDt;
      } else {
        this._list[i].dt = this._list[i].rcvDt;
      }
    }
    this._list.sort(function(a,b){
      if (a.dt.substr(0,8) > b.dt.substr(0,8)) {
        return -1;
      }
      if (a.dt.substr(0,8) < b.dt.substr(0,8)) {
        return 1;
      }
      return 0;
    });
  },

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {

    // 목록 클릭시 - 화면이동
    this.$container.on('click', '.history-list li[data-no]', $.proxy(this._showListDetail, this));

    // 더보기 버튼 클릭시
    this.$container.on('click', '.bt-more', $.proxy(this._nextData, this));
  },

  /**
   * hbs register helper 등록
   * @private
   */
  _registerHelper: function () {
    Handlebars.registerHelper('noYearDate', Tw.DateHelper.getShortDate);
  },

  /**
   * 목록 출력
   * @private
   */
  _printList: function (list) {
    if( !list || list.length === 0 ){
      this._removeMoreBtn();
      //this._showOrHideMoreBtn();
      return;
    }
    var $contBoxes = $('#cont-boxes');
    var $lastBox = $('.history-list:last ul:eq(0)', $contBoxes);

    for( var i = 0; i < list.length; i++ ){

      if( this._lastYear !== list[i].dt.substr(0,4) ){
        // 연도 출력
        this._lastYear = list[i].dt.substr(0,4);
        // $contBoxes.append(this._listYearDivTmplt({year: this._lastYear}));
        $contBoxes.append(this._listContBox);
        $lastBox = $('.history-list:last ul:eq(0)', $contBoxes);
      }

      $lastBox.append(this._listItemTmpltMap[list[i].atype]( list[i] ));
    }

    // 당년도인 경우 숨김
    var nowYear = new Date().getFullYear();
    $('.data-select-wrap').each(function(){
      if($(this).text().trim() === String(nowYear)){
        $(this).hide().attr('aria-hidden', true);
      }
    });

    this._addMoreBtn();
    //this._showOrHideMoreBtn();

    // 동적 list 추가시 tip버튼 이벤트 bind
    Tw.Tooltip.separateInit();
  },


  /**
   * 다음 데이터 호출
   * @private
   */
  _nextData: function () {
    this._removeMoreBtn();
    Tw.CommonHelper.startLoading('.container', 'grey');

    this._nowPageNum += 1;
    this._printList(this._pagingList[this._nowPageNum]);

    Tw.CommonHelper.endLoading('.container');
  },

  /**
   * 더보기버튼 삭제
   * @private
   */
  _removeMoreBtn: function(){
    $('.bt-more').remove();
  },
  /**
   * 더보기버튼 추가
   * @private
   */
  _addMoreBtn: function(){
    if( this._nowPageNum < this._totPageNum ) {
      $('.cont-box').last().append(this._listMoreBtn);
    }
  },


  /**
   * 상세화면으로 이동
   * @private
   */
  _showListDetail: function(event) {
    // tip 버튼, tip label 클릭시 리턴
    if($('.fe-tip').index(event.target) !== -1 || $('.fe-tip').parent().index(event.target) !== -1 ){
      return;
    }

    var num = event.currentTarget.getAttribute('data-no');
    var item = null;
    for(var i = 0; i < this._list.length; i++){
      if(this._list[i].dataNo === parseInt(num, 10)){
        item = this._list[i];
        break;
      }
    }

    var param = {
      key : item.detailkey,
      atype : item.atype,
      dt : item.dt
    };
    this._historyService.goLoad('/myt-join/submain/wire/historydetail?'+$.param(param));

    // this._historyService.goLoad('/myt-join/submain/wire/historydetail?data='+encodeURI(JSON.stringify(item)));
  }
};

/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청현황(MS_04_01_01)
 * @file myt-join.wire.history.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 신청현황 목록 조회
 */
/**
 *
 * @param {jQuery} rootEl
 * @param {Array} data
 * @constructor
 */
Tw.MyTJoinWireHistory = function (rootEl, data) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
  this._registerHelper();
  this._initListUi(data);
};

Tw.MyTJoinWireHistory.prototype = {

  /* jshint -W116 */
  _compareOperators: {
    '==': function (l, r) {
      return l == r;
    },
    '===': function (l, r) {
      return l === r;
    },
    '!=': function (l, r) {
      return l != r;
    },
    '!==': function (l, r) {
      return l !== r;
    },
    '<': function (l, r) {
      return l < r;
    },
    '>': function (l, r) {
      return l > r;
    },
    '<=': function (l, r) {
      return l <= r;
    },
    '>=': function (l, r) {
      return l >= r;
    },
    'typeof': function (l, r) {
      return typeof l == r;
    }
  },
  /* jshint +W116 */

  // API TYPEs
  _ATYPE_143: '143',  // 유선 약정기간 상세내역
  _ATYPE_153: '153',  // 요금상품변경 상세내역
  _ATYPE_162: '162',  // 설치장소변경상세
  _ATYPE_167: '167',  // 신규가입상세내역
  _ATYPE_168: '168',  // 가입상품변경 상세내역

  /**
   * 현재 페이지 번호
   */
  _totPageNum: 0,

  /**
   * 현재 페이지 번호
   */
  _curPageNum: 0,

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
  _tmplListBox: null,
  // _listMoreBtn: null,
  _tmplListItem: {},
  _tmplYearDiv: null,

  /**
   * 초기화 데이터 ui로 변경
   * @param {Array} data
   * @private
   */
  _initListUi: function (data) {
    if (!data || data.length === 0) {
      $('#cont-boxes').html($.trim($('#no-data-tmplt').html()));
      return;
    }

    this._$contBoxes = $('#cont-boxes');
    // init templates
    this._tmplListBox = $.trim($('#list-cont-box-tmplt').html());
    // this._listMoreBtn = $.trim($('#bt-more-tmplt').html());
    this._tmplListItem[this._ATYPE_143] = Handlebars.compile($.trim($('#list-cont-item-tmplt-' + this._ATYPE_143).html()));
    this._tmplListItem[this._ATYPE_153] = Handlebars.compile($.trim($('#list-cont-item-tmplt-' + this._ATYPE_153).html()));
    this._tmplListItem[this._ATYPE_162] = Handlebars.compile($.trim($('#list-cont-item-tmplt-' + this._ATYPE_162).html()));
    this._tmplListItem[this._ATYPE_167] = Handlebars.compile($.trim($('#list-cont-item-tmplt-' + this._ATYPE_167).html()));
    this._tmplListItem[this._ATYPE_168] = Handlebars.compile($.trim($('#list-cont-item-tmplt-' + this._ATYPE_168).html()));
    this._tmplYearDiv = Handlebars.compile($.trim($('#list-year-div-tmplt').html()));

    this._list = data;
    this._listTotCnt = this._list.length;
    this._insertDateFieldAndSort();

    // 페이징 목록 만들기, 날짜 입력
    this._pagingList = [];
    var countItem = this._list.length;
    var indexPage = 0;
    var pageSize = 15;
    // 역순으로 넣어야 한다.
    var indexItem = 0;
    var iterator = $.proxy(function (item, index) {
      item.dataNo = indexItem + index;
      // 날짜 및 데이터 변경
      if (item.atype === this._ATYPE_167 || item.atype === this._ATYPE_168) {
        item.svcPrefrDtm = Tw.DateHelper.getCurrentDateTime(item.svcPrefrDtm);
      } else if (item.atype === this._ATYPE_162) {
        item.onOffName = Tw.MYT_JOIN_WIRE_LOC_CHG_CONN_TYPE[item.onOff];
        item.setPrefrDt = Tw.DateHelper.getShortDate(item.setPrefrDt);
      }
      return item;
    }, this);
    while (indexItem < countItem) {
      this._pagingList[indexPage] = _.map(this._list.slice(indexItem, indexItem + pageSize), iterator);
      indexPage += 1;
      indexItem += pageSize;
    }
    /*
    for (var i = 0; i < this._list.length; i += 1) {
      var item = this._list[i];
      var paging;
      // 항목이 20개가 한 페이지
      // if (j % pageSize === 0) {
      if (!paging) {
        paging = [];
      } else {
        if (paging.length === pageSize) {
          this._pagingList.push(paging);
          paging = [];
        }
      }
      paging.push(item);
      item.dataNo = i;
      // 날짜 및 데이터 변경
      if (item.atype === this._ATYPE_167 || item.atype === this._ATYPE_168) {
        item.svcPrefrDtm = Tw.DateHelper.getCurrentDateTime(item.svcPrefrDtm);
      } else if (item.atype === this._ATYPE_162) {
        item.onOffName = Tw.MYT_JOIN_WIRE_LOC_CHG_CONN_TYPE[item.onOff];
        item.setPrefrDt = Tw.DateHelper.getShortDate(item.setPrefrDt);
      }
      this._pagingList[page] = paging;
    }
    */
    this._totPageNum = indexPage;

    this._printList(this._pagingList[0]);
  },

  /**
   * 날짜필드를 통일하고, 전체 list를 날짜기준으로 sort
   * @private
   */
  _insertDateFieldAndSort: function () {
    _.each(this._list, function (item) {
      if (item.atype === this._ATYPE_162) {
        item.dt = item.occrDt;
      } else {
        item.dt = item.rcvDt;
      }
    }, this);
    this._list.sort(function (a, b) {
      var dtA = a.dt.substr(0, 8);
      var dtB = b.dt.substr(0, 8);
      if (dtA > dtB) {
        return -1;
      }
      if (dtA < dtB) {
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
    this.$container.on('click', '.history-list li', $.proxy(this._showListDetail, this));
    // 더보기 버튼 클릭시
    this.$container.on('click', '.btn-more', $.proxy(this._onBtnMoreClicked, this));
  },

  /**
   * hbs register helper 등록
   * @private
   */
  _registerHelper: function () {
    Handlebars.registerHelper('convertShortDate', Tw.DateHelper.getShortDate);
    Handlebars.registerHelper('ifv', (function () {
      var operators = Tw.MyTJoinWireHistory.prototype._compareOperators;
      return function (lvalue, operator, rvalue, options) {
        var result;

        if (arguments.length < 3) {
          throw new Error('Handlerbars Helper "ifv" needs 2 parameters');
        }

        if (options === undefined) {
          options = rvalue;
          rvalue = operator;
          operator = '===';
        }

        if (!operators[operator]) {
          throw new Error('Handlerbars Helper "ifv" doesn\'t know the operator ' + operator);
        }

        result = operators[operator](lvalue, rvalue);

        if (result) {
          return options.fn(this);
        }
        return options.inverse(this);
      };
    })());
  },

  /**
   * 목록 출력
   * @pram {Array} list
   * @private
   */
  _printList: function (list) {
    if (!list || list.length === 0) {
      this._removeMoreBtn();
      return;
    }
    var $contBoxes = this._$contBoxes;
    // var $lastBox = $('.history-list:last ul:eq(0)', $contBoxes);
    // var $lastBox = $('.history-list').last().find('ul').eq(0), $contBoxes);
    var $lastBox = $contBoxes.find('.history-list').last().find('ul');

    for (var i = 0, count = list.length; i < count; i += 1) {
      var item = list[i];
      var yearLast = item.dt.substr(0, 4);
      if (this._lastYear !== yearLast) {
        // 연도 출력
        this._lastYear = yearLast;
        // $contBoxes.append(this._tmplYearDiv({year: this._lastYear}));
        $contBoxes.append(this._tmplListBox);
        $lastBox = $('.history-list:last ul:eq(0)', $contBoxes);
      }
      $lastBox.append(this._tmplListItem[item.atype](item));
    }

    // 당년도인 경우 숨김
    var yearNow = String(new Date().getFullYear());
    $('.data-select-wrap').each(function () {
      var $this = $(this);
      if ($this.text().trim() === yearNow) {
        $this.hide().attr('aria-hidden', true);
      }
    });

    if (this._curPageNum + 1 < this._totPageNum) {
      this._addMoreBtn();
    }

    // 동적 list 추가시 tip버튼 이벤트 bind
    Tw.Tooltip.separateInit();
  },

  /**
   * 다음 데이터 호출
   * @private
   */
  _onBtnMoreClicked: function () {
    this._removeMoreBtn();
    Tw.CommonHelper.startLoading('.container', 'grey');

    this._curPageNum += 1;
    this._printList(this._pagingList[this._curPageNum]);

    Tw.CommonHelper.endLoading('.container');
  },

  /**
   * 더보기버튼 삭제
   * @private
   */
  _removeMoreBtn: function () {
    $('.btn-more').remove();
  },

  /**
   * 더보기버튼 추가
   * @private
   */
  _addMoreBtn: function () {
    // $('.cont-box').last().append(this._listMoreBtn);
    this._$contBoxes.append($.trim($('#bt-more-tmplt').html()));
  },

  /**
   * 상세화면으로 이동
   * @param {Object} event
   * @private
   */
  _showListDetail: function (event) {
    // tip 버튼, tip label 클릭시 리턴
    var $tip = $('.fe-tip');
    if ($tip.index(event.target) !== -1 || $tip.parent().index(event.target) !== -1) {
      return;
    }

    var no = parseInt($(event.currentTarget).data('no'), 10);
    /*
    var itemDetail = null;

    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].dataNo === no) {
        itemDetail = this._list[i];
        break;
      }
    }
    */
    var itemDetail = _.find(this._list, function (item) {
      return item.dataNo === no;
    });
    this._historyService.goLoad('/myt-join/submain/wire/historydetail?' + $.param({
      key: itemDetail.detailkey,
      atype: itemDetail.atype,
      dt: itemDetail.dt
    }));
    // this._historyService.goLoad('/myt-join/submain/wire/historydetail?data='+encodeURI(JSON.stringify(item)));
  }
};

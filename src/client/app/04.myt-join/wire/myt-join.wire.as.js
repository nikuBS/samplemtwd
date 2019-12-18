/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청내역 > 장애/AS 신청현황(MS_04_01_03)
 * @file myt-join.wire.as.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 장애/AS 신청내역 목록 조회
 */
/**
 *
 * @param {jQuery} rootEl
 * @param {Object} data
 * @param {Array} data.history
 * @constructor
 */
Tw.MyTJoinWireAS = function (rootEl, data) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
  this._registerHelper();
  this._initListUi(data); // this._initListUi(JSON.parse(data));
};

Tw.MyTJoinWireAS.prototype = {

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
   * 목록의 마지막 년도
   */
  _listLastYear: '',

  /**
   * templates
   */
  _tmplListBox: null,
  // _listMoreBtn: null,
  _tmplListItem: null,
  _tmplYearDiv: null,

  /**
   * 초기화 데이터 ui로 변경
   * @param {Object} data
   * @param {number} [data.totalCnt]
   * @param {Array} [data.history]
   * @private
   */
  _initListUi: function (data) {
    if (!data.history || data.history.length === 0) {
      $('#cont-boxes').html($.trim($('#no-data-tmplt').html()));
      return;
    }
    this._$contBoxes = $('#cont-boxes');
    // init templates
    this._tmplListBox = $.trim($('#list-cont-box-tmplt').html());
    // this._listMoreBtn = $.trim($('#bt-more-tmplt').html());
    this._tmplListItem = Handlebars.compile($.trim($('#list-cont-item-tmplt').html()));
    this._tmplYearDiv = Handlebars.compile($.trim($('#list-year-div-tmplt').html()));

    this._listTotCnt = parseInt(data.totalCnt, 10);
    this._printList(data.history);
  },

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    // 목록 클릭시 - 화면이동
    this.$container.on('click', '.history-list li', $.proxy(this._showListDetail, this));
    // 더보기 버튼 클릭시
    this.$container.on('click', '.btn-more', $.proxy(this._onBtMoreClicked, this));
  },

  /**
   * hbs register helper 등록
   * @private
   */
  _registerHelper: function () {
    Handlebars.registerHelper('convertShortDate', Tw.DateHelper.getShortDate);
  },

  /**
   * 목록 출력
   * @param {Array} list
   * @private
   */
  _printList: function (list) {
    if (!list || list.length === 0) {
      this._removeMoreBtn();
      //this._showOrHideMoreBtn();
      return;
    }
    var $contBoxes = this._$contBoxes;
    // var $lastBox = $('.cont-box ul', $contBoxes).last();
    var $lastBox = $contBoxes.find('.cont-box').find('ul').last();

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var yearLast = item.troubleDt.substr(0, 4);
      if (this._lastYear !== yearLast) {
        // 연도 출력
        this._lastYear = yearLast;
        // $contBoxes.append(this._tmplYearDiv({year: this._lastYear}));
        $contBoxes.append(this._tmplListBox);
        // $lastBox = $('.cont-box ul', $contBoxes).last();
        $lastBox = $contBoxes.find('.cont-box').find('ul').last();
      }
      $lastBox.append(this._tmplListItem(item));
    }

    // 당년도인 경우 숨김
    var yearNow = String(new Date().getFullYear());
    $('.data-select-wrap').each(function () {
      var $this = $(this);
      if ($this.text().trim() === yearNow) {
        $this.hide();
      }
    });

    this._list = this._list.concat(list);

    if (this._listTotCnt > this._list.length) {
      this._addMoreBtn();
      //this._showOrHideMoreBtn();
    }
  },


  /**
   * 다음 데이터 호출
   * @private
   */
  _onBtMoreClicked: function () {
    this._removeMoreBtn();
    Tw.CommonHelper.startLoading('.container', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_05_0156, {page: String(this._nowPageNum + 1)})
      .done($.proxy(function (resp) {
        this._nowPageNum += 1;

        if (!resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result) {
          this._showErrorAlert(resp.code, resp.msg);
          return;
        }

        this._printList(resp.result.history);
        Tw.CommonHelper.endLoading('.container');
      }, this))
      .fail($.proxy(this._requestFail, this));
  },

  _showErrorAlert: function (code, msg) {
    Tw.Error(code, msg).pop();
    Tw.CommonHelper.endLoading('.container');
  },
  _requestFail: function (err) {
    Tw.Error(err.status, err.statusText).pop();
    Tw.CommonHelper.endLoading('.container');
  },

  /**
   * 더보기버튼 삭제
   * @private
   */
  _removeMoreBtn: function () {
    $('.bt-more').remove();
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
   * '더 보기' 버튼 출력
   * @private
   */
  _showOrHideMoreBtn: function () {
    $('.bt-more').hide().attr('aria-hidden', this._listTotCnt <= this._list.length);
  },

  /**
   * 상세화면으로 이동
   * @private
   */
  _showListDetail: function (event) {
    var no = String($(event.currentTarget).data('no'));
    /*var num = event.currentTarget.getAttribute('data-no');
    var item = null;
    for (var i = 0; i < this._list.length; i++) {
      if (this._list[i].troubleNum === num.toString()) {
        item = this._list[i];
        break;
      }
    }
    */
    var itemDetail = _.find(this._list, function (item) {
      return item.troubleNum === no;
    });
    this._historyService.goLoad('./asdetail?' + $.param({
      troubleNum: no,
      troubleDt: itemDetail.troubleDt,
      svcNm: itemDetail.svcNm,
      troubleDetail: itemDetail.troubleDetail,
      stNm: itemDetail.stNm
    }));
  }
};

/**
 * @file [나의요금-환불처리-리스트] 관련 처리
 * @author Lee Kirim 
 * @since 2018-09-17
 */

/**
 * @class 
 * @desc 환불처리 리스트를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.info.overpay-refund.controller.ts 로 부터 전달되어 온 납부내역 정보
 */
Tw.MyTFareInfoOverpayRefund = function (rootEl, data) {
  this.$container = rootEl;

  this._historyService = new Tw.HistoryService(rootEl);

  this.data = data ? JSON.parse(data) : '';

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTFareInfoOverpayRefund.prototype = {

  /**
   * @function
   * @member 
   * @desc 리스트 생성 실행
   * @return {void}
   */
  _init: function () {
    this._initRefundList();
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function () {

  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.info.overpay-refund.html 참고
   */
  _cachedElement: function () {
    this.$template = {
      // wraper
      $domListWrapper: this.$container.find('#fe-refund-history-wrapper'),
      // 리스트 내용
      $templateItem: Handlebars.compile($('#fe-template-list-items').html()),
      // 일
      $templateItemDay: Handlebars.compile($('#fe-template-list-day').html()),
      // 년
      $templateYear: Handlebars.compile($('#fe-template-list-year').html()),
      // list wraper
      $listWrapper: Handlebars.compile($('#list-template-list-wrapper').html()),
      // 내역 없을 때
      $emptyList: Handlebars.compile($('#list-empty').html())
    };
    // 리스트 내용
    Handlebars.registerPartial('chargeItems', $('#fe-template-list-items').html());
    // 일
    Handlebars.registerPartial('list', $('#fe-template-list-day').html());
    // 년
    Handlebars.registerPartial('year', $('#fe-template-list-year').html());
  },

  /**
   * @function
   * @member
   * @desc 환불내역 리스트 , 리스트 렌더링 후 이벤트 바인드
   */
  _initRefundList: function () {
    var initedListTemplate;
    var totalDataCounter = this.data.length; // 받아온 리스트 갯수
    this.renderListData = {};

    // 리스트 없을 때와 있을 때 분기 처리
    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } else {
      this.listRenderPerPage = Tw.DEFAULT_LIST_COUNT; // 한번에 노출 갯수 20

      this.listLastIndex = this.listRenderPerPage; // 노출된 마지막 인덱스 
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter); // 더보기버튼 숨길 지 여부

      this.renderableListData = this.data.slice(0, this.listRenderPerPage); // 렌더링할 리스트

      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
      this.renderListData.records = this.renderableListData.reduce($.proxy(function (prev, cur) {
        prev.push({items: [cur], date:cur.listDt, yearHeader:cur.yearHeader});
        return prev;
      }, this), []);

      initedListTemplate = this.$template.$listWrapper(this.renderListData);
    }

    this.$template.$domListWrapper.append(initedListTemplate);

    this.$listWrapper = this.$container.find('#fe-refund-history-wrapper');
    this.$btnListViewMorewrapper = this.$container.find('#fe-refund-history-wrapper .bt-more');
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updateRefundList, this)); // 더보기버튼 클릭 이벤트
    this.$appendListTarget = this.$listWrapper.find('.fe-list-inner');
    // 상세보기 버튼 클릭 이벤트 
    this.$appendListTarget.on('click', 'button', $.proxy(this._listViewDetailHandler, this)); 
    this.$appendListTarget.on('click', '.inner', $.proxy(this._listViewDetailHandler, this));
  },

  /**
   * @function
   * @member
   * @desc 상세보기로 이동, 클릭 이벤트 발생한 객체 엘리먼트의 listId 값을 파라미터로 이동 시킴
   * /myt-fare/info/overpay-refund/detail?
   * @param {number>string} lsitId
   * @param {event} e 
   */
  _listViewDetailHandler: function (e) {
    var detailData = this.data[$(e.currentTarget).data('listId')];

    detailData.isPersonalBiz = this.data.isPersonalBiz;

    this._historyService.goLoad(this._historyService.pathname + '/detail?listId='+detailData.listId);
  },

  /**
   * @function
   * @member
   * @desc 더보기 버튼 이벤트 리스트 추가
   * @param {event} e 
   */
  _updateRefundList: function (e) {
    this._updateRefundListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.length ? 'none' : ''});
    // this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var $domAppendTarget  = this.$appendListTarget;

    this.renderableListData.map($.proxy(function (o) {
      var renderedHTML = this.$template.$templateItemDay({records:[{items:[o], date:o.listDt, yearHeader:o.yearHeader}]});

      $domAppendTarget.append(renderedHTML);

    }, this));
  },

  /**
   * @function
   * @member
   * @desc 추가할 리스트 목록 구하기
   */
  _updateRefundListData: function () {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.length ?
        this.data.length : this.listNextIndex;
  },

  /**
   * @function
   * @member
   * @param {event} e
   * @returns {void}
   * @desc 더보기 클릭시 남은 리스트 갯수 표현하는 것이었으나 현재 사용되지는 않음
   */
  _updateViewMoreBtnRestCounter: function (e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  }

  
};
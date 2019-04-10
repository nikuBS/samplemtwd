/**
 * @file [나의요금-현금영수증발급내역_리스트] 관련 처리
 * @author Lee Kirim 
 * @since 2018-09-17
 */

/**
 * @class 
 * @desc 현금영수증발급내역 리스트를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.info.bill-cash.controlloer.ts 로 부터 전달되어 온 현금영수증내역 정보
 */
Tw.MyTFareInfoBillCash = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this.data = JSON.parse(data);

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareInfoBillCash.prototype = {
  
  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * @return {void}
   */
  _init: function () {
    var initedListTemplate;
    var totalDataCounter = this.data.list.length; // 리스트 총 갯수
    this.renderListData = {}; // 렌더할 리스트 갯수

    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } else {
      this.listRenderPerPage = Tw.DEFAULT_LIST_COUNT; // 한번에 노출할 리스트갯수 20

      this.listLastIndex = this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.list.slice(0, this.listRenderPerPage);

      // this.renderListData = this.data.noticeInfo;
      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
      
      this.renderListData.records = this.renderableListData.reduce($.proxy(function (prev, cur) {
        if (prev.length) {
          if (prev.slice(-1)[0].date === cur.listDt) {
            prev.slice(-1)[0].items.push(cur);
          } else {
            prev.push({items: [cur], date: cur.listDt});
          }
        } else {
          prev.push({items: [cur], date: cur.listDt});
        }

        return prev;
      }, this), []);
      
      initedListTemplate = this.$template.$listCashWrapper(this.renderListData);
    }

    this.$template.$domCashListWrapper.append(initedListTemplate);

    this.$listWrapper = this.$container.find('#fe-cash-list-wrapper');
    this.$btnListViewMorewrapper = this.$listWrapper.find('.bt-more');
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updateCashList, this));
    this.$appendListTarget = this.$listWrapper.find('.fe-list-inner');
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.info.history.html 참고
   */
  _cachedElement: function () {
    this.$template = {
      $domCashListWrapper: this.$container.find('#fe-cash-list-wrapper'),

      $templateCashItem: Handlebars.compile($('#fe-template-cash-items').html()),
      $templateCashItemDay: Handlebars.compile($('#fe-template-cash-day').html()),
      $templateCashYear: Handlebars.compile($('#fe-template-cash-year').html()),
      $listCashWrapper: Handlebars.compile($('#list-template-cash-wrapper').html()),

      $emptyList: Handlebars.compile($('#list-empty').html())
    };
    
    Handlebars.registerPartial('chargeItems', $('#fe-template-cash-items').html());
    Handlebars.registerPartial('list', $('#fe-template-cash-day').html());
    Handlebars.registerPartial('year', $('#fe-template-cash-year').html());

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
   * @desc 더보기 실행
   * @param {event} e 더보기 버튼 클릭 이벤트 발생 시킨 엘리먼트
   * @returns {void}
   */
  _updateCashList: function (e) {
    this._updateCashListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.list.length ? 'none' : ''});
    // this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var insertCompareData = this.data.list[this.listLastIndex - this.listRenderPerPage - 1],
        $domAppendTarget  = this.$appendListTarget;

    this.renderableListData.map($.proxy(function (o) {
      var renderedHTML;
      if (insertCompareData.listDt === o.listDt) {
        $domAppendTarget = $('.fe-list-inner li:last-child');
        renderedHTML = this.$template.$templateCashItem({items: [o], date: o.listDt});
      } else {
        insertCompareData = o;
        $domAppendTarget = this.$appendListTarget;
        renderedHTML = this.$template.$templateCashItemDay({
          records: [{
            items: [o],
            date: o.listDt,
            yearHeader: o.yearHeader
          }]
        });
      }

      $domAppendTarget.append(renderedHTML);

    }, this));
  },

  /**
   * @function
   * @member
   * @desc 리스트
   * @returns {void}
   */
  _updateCashListData: function () {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.list.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.list.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.list.length ?
        this.data.list.length : this.listNextIndex;
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
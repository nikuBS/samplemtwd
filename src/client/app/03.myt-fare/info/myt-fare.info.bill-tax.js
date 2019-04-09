/**
 * @file [나의요금-세금계산서발급내역_리스트] 관련 처리
 * @author Lee Kirim 
 * @since 2018-09-17
 */

/**
 * @class 
 * @desc 세금계산서발급내역 리스트를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.info.bill-cash.controlloer.ts 로 부터 전달되어 온 현금영수증내역 정보
 */
Tw.MyTFareInfoBillTax = function (rootEl, data) {
  this.$container = rootEl;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);  

  this.data = JSON.parse(data);

  this._cachedElement();
  
  this._init();
  this._bindEvent();
};

Tw.MyTFareInfoBillTax.prototype = {

  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * - rootPathName 현재 주소
   * - renderListData 렌더링될 리스트
   * - liistLastIndex 보여질 마지막 인덱스
   * - listViewMoreHide 더보기 버튼 보일지 여부
   * - 템플릿 저장
   * @return {void}
   */
  _init: function () {
    this.rootPathName = this._historyService.pathname;
    var initedListTemplate;
    var totalDataCounter = this.data.items.length;
    this.renderListData = {};

    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } else {
      this.listRenderPerPage = Tw.DEFAULT_LIST_COUNT; // 20 

      this.listLastIndex = this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.items.slice(0, this.listRenderPerPage);
      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
      initedListTemplate = this.$template.$listTaxWrapper({
        limitMonth:this.data.limitMonth,
        listViewMoreHide:this.listViewMoreHide,
        renderableListData:this.renderableListData
      });
    }

    this.$template.$domTaxListWrapper.append(initedListTemplate);

    this.$listWrapper = this.$container.find('#fe-tax-list-wrapper');
    this.$btnListViewMorewrapper = this.$listWrapper.find('.bt-more');
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updateTaxList, this)); // 더보기버튼
    this.$appendListTarget = this.$listWrapper.find('.fe-list-inner');
    // 세금계산서 재발급 버튼 클릭 이벤트
    this.$listWrapper.on('click', '.fe-btn-reprint button', $.proxy(this._reRequestHandler, this));
  },

  /**
   * @function
   * @member
   * @desc 더보기 실행
   * @param {event} e 더보기 버튼 클릭 이벤트 발생 시킨 엘리먼트
   * @returns {void}
   */
  _updateTaxList: function (e) {
    this._updateTaxListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.items.length ? 'none' : ''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var $domAppendTarget  = this.$appendListTarget;

    this.renderableListData.map($.proxy(function (o) {
      var renderedHTML;
      
      $domAppendTarget = $('.fe-list-inner div.myfare-result-wrap:last-child');

      renderedHTML = this.$template.$templateTaxItem({renderableListData: [o]});

      $domAppendTarget.after(renderedHTML);

    }, this));
  },

  /**
   * @function 
   * @member
   * @returns {void}
   * @desc 리스트 
   */
  _updateTaxListData: function () {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.items.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.items.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.items.length ?
        this.data.items.length : this.listNextIndex;
  },

  /**
   * @function
   * @member
   * @returns {void}
   * @param {event} e 
   * @desc 세금계산서 재발급 버튼 클릭 이벤트 실행
   */
  _reRequestHandler: function (e) {
    var target = $(e.currentTarget);
    var targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    
    this.isFax  = target.attr('class').search('fax') >= 0;
    this.targetData = this.data.items[target.data('listId')];
    

    if (this.isFax) {      
      this._historyService.goLoad(targetURL + '/send-fax?date=' + target.data('listDate'));
    } else {
      this._historyService.goLoad(targetURL + '/send-email?date=' + target.data('listDate'));
    }
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.info.bill-tax.html 참고
   */
  _cachedElement: function () {
    this.$template = {
      $domTaxListWrapper: this.$container.find('#fe-tax-list-wrapper'),

      $templateTaxItem: Handlebars.compile($('#fe-template-tax-items').html()),
      $listTaxWrapper: Handlebars.compile($('#fe-template-tax-list').html()),


      $emptyList: Handlebars.compile($('#list-empty').html())
    };
    Handlebars.registerPartial('taxList', $('#fe-template-tax-items').html());

  },
  _bindEvent: function () {

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
/**
 * @file 지점/대리점 검색 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-16
 * @edit 2020-06-12 양정규 OP002-8862
 */
/**
 * @constructor
 * @param {Object} rootEl - 최상위 elem
 * @param {String} params - isAcceptAge(Y: 14세 이상, N)
 * @param {Object} svcInfo
 */
Tw.CustomerAgentsearch = function (rootEl) {
  this.$container = rootEl;
  this.agentNumber = this.$container.find('#agent-number');
  this._popupService = Tw.Popup;
  this._uri = window.location.search.split('=')[1];
  this._historyService = new Tw.HistoryService();
  this._init();
  
};

Tw.CustomerAgentsearch.prototype = {

  _init: function () {
    this.$eventSelector = this.$container.find('.bt-select');
    this._bindEvents();
  },
  
  _bindEvents: function () {
    this.$eventSelector.on('click', $.proxy(this._openEventPop, this));
    this.$container.on('click', '.fe-tel', $.proxy(this.goTel, this));
    this.$container.on('click', '.address', $.proxy(this._goGoogleMap, this)); 
  },

  _openEventPop: function (e) {
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01_en',
      layer: true,
      data: [
        {
          'list': [
            { 'label-attr': 'id="All"', 'radio-attr': 'name="r2" id="all"', txt: 'All' },
            { 'label-attr': 'id="Seoul"', 'radio-attr': 'name="r2" id="seoul"', txt: 'Seoul' },
            { 'label-attr': 'id="Gyeonggi-do"', 'radio-attr': 'name="r2" id="gyeonggi"', txt: 'Gyeonggi-do' },
            { 'label-attr': 'id="Gwangju"', 'radio-attr': 'name="r2" id="gwangju"', txt: 'Gwangju' },
            { 'label-attr': 'id="Daegu"', 'radio-attr': 'name="r2" id="daegu"', txt: 'Daegu' },
            { 'label-attr': 'id="Ulsan"', 'radio-attr': 'name="r2" id="ulsan"', txt: 'Ulsan' },
            { 'label-attr': 'id="Gyeongsangnam-do"', 'radio-attr': 'name="r2" id="gyeongsangnamdo"', txt: 'Gyeongsangnam-do' },
            { 'label-attr': 'id="Busan"', 'radio-attr': 'name="r2" id="busan"', txt: 'Busan' }
          ]
        }
      ],
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': 'CLOSE' }
    },
      $.proxy(this._onOpenPopup, this),
      null,
      'store_info',
      $(e.currentTarget));

  },

  _onOpenPopup: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    if(this._uri===''||this._uri===null||this._uri===undefined){
      $layer.find('input#all').attr('checked', 'checked');
    }
    else{$layer.find('input#' + this._uri).attr('checked', 'checked');}
    $layer.on('change', '.ac-list', $.proxy(this._goLoad, this));
  },

  _goLoad: function (event) {
    var $uri = $(event.target).attr('id');
    if($uri==='all'){
      this._historyService.replaceURL('/en/customer/agentsearch');

    }
    else{
      this._historyService.replaceURL('/en/customer/agentsearch?location=' + $uri);
    }
  },

  goTel: function (event) {
    event.preventDefault();
    event.stopPropagation();
    this._historyService.goLoad('tel:'+$(event.currentTarget).data('tel'));
  },
  _goGoogleMap: function (event) {
    Tw.CommonHelper.openUrlExternal('https://www.google.co.kr/maps/place/' + $(event.currentTarget).data('map'));
  }
};


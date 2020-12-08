/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 */
Tw.CustomerFaq = function (rootEl) {
  this.$container = rootEl;
  this.viewMoreCount=1;
  this.$allContents = this.$container.find('.acco-box');
  this.$allContentsBtn = this.$container.find('.btn-more');
  this._popupService = Tw.Popup;
  this._uri = window.location.search.split('=')[1];
  this._historyService = new Tw.HistoryService();
  this.accoBoxNum = $('.acco-box').length;
  this.countNum = 10;
  this.checkNum = 0;
  this._init();
};

Tw.CustomerFaq.prototype = {
  _init: function () {
    for(var b = 0; b<10; b++){
      $('.acco-box').eq(b).css('display','list-item');
    } // 최초 10개 보이기
    if(this.accoBoxNum <11){
      this.$allContentsBtn.remove();
    } // 10개 이하면 더보기 버튼 삭제
    this.$eventSelector = this.$container.find('.bt-select');
    this._bindEvents();
    this._setupscroll();
    
  },

  _showMoreContent: function() {
    if(this.accoBoxNum - this.countNum > 10){
      this.checkNum=10;
    }else{
      this.checkNum = this.accoBoxNum - this.countNum;
      this.$allContentsBtn.remove();
    }
    for(var b = this.countNum ; b < this.countNum + this.checkNum ; b++){
      $('.acco-box').eq(b).css('display','list-item');
    }

    setTimeout($.proxy(function() {
      $('.acco-box').eq(this.countNum).children('div.acco-tit').children('button').focus();
      this.countNum+=10;
    }, this), 100);
  },


  _bindEvents: function () {
    this.$eventSelector.on('click', $.proxy(this._openEventPop, this));
    this.$allContentsBtn.on('click', $.proxy(this._showMoreContent, this));
    
  },

  _openEventPop: function (e) { // 팝업 생성
    this._popupService.open({
      url: '/hbs/',
      hbs: 'actionsheet01_en',
      layer: true,
      data: [
        {
          'list': [
            { 'label-attr': 'id="All"', 'radio-attr': 'name="r2" id="all"', txt: 'View all FAQs' },
            { 'label-attr': 'id="tworldguide"', 'radio-attr': 'name="r2" id="tworldguide"', txt: 'T world Guide' },
            { 'label-attr': 'id="appAddOns"', 'radio-attr': 'name="r2" id="appAddOns"', txt: 'App/Add-ons' },
            { 'label-attr': 'id="roaming"', 'radio-attr': 'name="r2" id="roaming"', txt: 'Roaming' },
            { 'label-attr': 'id="subscription"', 'radio-attr': 'name="r2" id="subscription"', txt: 'Subscription/Change/Cancellation' },
            { 'label-attr': 'id="plans"', 'radio-attr': 'name="r2" id="plans"', txt: 'Plans' }
          ]
        }
      ],
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': 'CLOSE' }
    },
      $.proxy(this._onOpenPopup, this, $(e.currentTarget)),
      $.proxy(this._onClosePopup, this, $(e.currentTarget)),
      'faq',
      $(e.currentTarget));
  },

  _onOpenPopup: function ($target, $layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    if(this._uri==='' || this._uri===null || this._uri === undefined){
      $layer.find('input#all').attr('checked', 'checked');
    } else {
      $layer.find('input#' + this._uri).attr('checked', 'checked');
    }
    $layer.on('change', '.ac-list', $.proxy(this._goLoad, this));
    $layer.on('click', '.tw-popup-closeBtn', function() { $target.focus(); } );
  },

  _onClosePopup: function ($target, $layer) {
    $target.focus();
  },

  _goLoad: function (event) { //url 이동
    var $uri = $(event.target).attr('id');
    if($uri==='all') {
      this._historyService.replaceURL('/en/customer/faq');
    }
    else{
    this._historyService.replaceURL('/en/customer/faq?faq=' + $uri );
    }
  },

  _setupscroll: function (){ // 상단 필더 바 고정
    var jbHeight = $( '.sc-util' ).outerHeight();
    $( window ).scroll( function() {
      if ( $( document ).scrollTop() > 0 ) {
          $( '.sc-util' ).addClass( 'jbFixed' );
          $('.cont-box').css('padding-top', jbHeight + 'px');
      }
      else {
          $( '.sc-util' ).removeClass( 'jbFixed' );
          $('.cont-box').css('padding-top', '');
      }
  });
  }
};
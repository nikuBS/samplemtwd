/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 */
Tw.CustomerFaq = function (rootEl) {
  this.$container = rootEl;
  this.viewMoreCount=1;
  this.$allContents = this.$container.find(".acco-box");
  this.$allContentsBtn = this.$container.find(".btn-more");
  this.$firstViewMore = this.$container.find(".first-view-more");
  this.$secondViewMore = this.$container.find(".second-view-more");
  this.$thirdViewMore = this.$container.find(".third-view-more");
  this.$fourthViewMore = this.$container.find(".fourth-view-more");
  this.$fifthViewMore = this.$container.find(".fifth-view-more");
  this._popupService = Tw.Popup;
  this._uri = window.location.search.split('=')[1];
  this._historyService = new Tw.HistoryService();
  this._init();
};

Tw.CustomerFaq.prototype = {
  _init: function () {
    if(this._uri=="" || this._uri==null || this._uri == 'tworldguide'){
      this.$allContentsBtn.on('click', $.proxy(this._showContent_all_tworldguide, this));
    }
    else if(this._uri == 'appAddOns' || this._uri == 'roaming'){
      this._showAllcontent();
    }
    
    else if(this._uri == 'subscription'){
      this._showContent_subscription();
    }
    else if(this._uri == 'plans'){
      this._showContent_plans();
    }
    this.$eventSelector = this.$container.find('.bt-select');
    this._bindEvents();
    this._setupscroll();
  },

  _showContent_all_tworldguide: function() {
    if(this.viewMoreCount==1){
      if(this.$firstViewMore.length){
        this.$firstViewMore.css("display","list-item");
      }
      else {this._showAllcontent();}
    }
    else if(this.viewMoreCount==2){
      if(this.$secondViewMore.length){
        this.$secondViewMore.css("display","list-item");
      }
      else {this._showAllcontent();}
    }
    else if(this.viewMoreCount==3){
      if(this.$thirdViewMore.length){
        this.$thirdViewMore.css("display","list-item");
      }
      else {this._showAllcontent();}
    }
    else if(this.viewMoreCount==4){
      if(this.$fourthViewMore.length){
        this.$fourthViewMore.css("display","list-item");
      }
      else {this._showAllcontent();}
    }
    else if(this.viewMoreCount==5){
      if(this.$fifthViewMore.length){
        this.$fifthViewMore.css("display","list-item");
      }
      else {this._showAllcontent();}
    }
    else {this._showAllcontent();}
    this.viewMoreCount++;

  },

  _showContent_subscription: function() {
    $('.subscription1st').css("display","list-item");
    this.$allContentsBtn.on('click', $.proxy(this._showAllcontent, this));
  },

  _showContent_plans: function() {
    $('.plans1st').css("display","list-item");
    this.$allContentsBtn.on('click', $.proxy(function(){
      if(this.viewMoreCount==1){
        $('.plans2nd').css("display","list-item");
        this.viewMoreCount++;
      }else{
        this._showAllcontent();
      }
    }, this));
  },
  
  _showAllcontent: function() {
    this.$allContentsBtn.remove();
    this.$allContents.css("display","list-item");
  },
  /**
   * @function
   * @desc 이벤트 바인딩
   */
  _bindEvents: function () {
    this.$eventSelector.on('click', $.proxy(this._openEventPop, this));
    
  },

  _openEventPop: function (e) {
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
            { 'label-attr': 'id="plans"', 'radio-attr': 'name="r2" id="plans"', txt: 'Plans' },
          ]
        }
      ],
      btnfloating: { 'class': 'tw-popup-closeBtn', 'txt': 'CLOSE' }
    },
      $.proxy(this._onOpenPopup, this),
      null,
      'faq',
      $(e.currentTarget));
  },

  _onOpenPopup: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    if(this._uri==""||this._uri==null){
      $layer.find('input#all').attr('checked', 'checked');
    }
    else{$layer.find('input#' + this._uri).attr('checked', 'checked');}
    $layer.on('change', '.ac-list', $.proxy(this._goLoad, this));
  },

  _goLoad: function (event) {
    var $uri = $(event.target).attr('id');
    if($uri=="all"){
      this._historyService.replaceURL('/en/customer/faq');
    }
    else{
    this._historyService.replaceURL('/en/customer/faq?faq=' + $uri );
    }
  },

  _setupscroll: function (){
    var jbHeight = $( '.sc-util' ).outerHeight();
    $( window ).scroll( function() {
      if ( $( document ).scrollTop() > 0 ) {
          $( '.sc-util' ).addClass( 'jbFixed' );
          $(".cont-box").css("padding-top", jbHeight + "px");
      }
      else {
          $( '.sc-util' ).removeClass( 'jbFixed' );
          $(".cont-box").css("padding-top", "");
      }
  });
  }
};
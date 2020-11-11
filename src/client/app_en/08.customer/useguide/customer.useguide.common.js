/**
 * @file customer.useguide.common.js
 * @author Lee Sanghyoung (silion@sk.com)
 * @since 2018. 10. 18
 */
Tw.CustomerUseguideCommon = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this.crtVideo=1;

  this._$confirm1 = this.$container.find('#videoConfirm1');
  this._$confirm2 = this.$container.find('#videoConfirm2');
  this._$confirm3 = this.$container.find('#videoConfirm3');
  this._$confirm4 = this.$container.find('#videoConfirm4');
  this._$confirm5 = this.$container.find('#videoConfirm5');
  this._$confirm6 = this.$container.find('#videoConfirm6');
  this._$confirm7 = this.$container.find('#videoConfirm7');
  this._$popup = this.$container.find('.popup');
  this._$cancelbtn = this.$container.find('.pos-left');
  this._$confirmbtn = this.$container.find('.pos-right');
  this._bindEvent(); 
  //Tw.Native.send(Tw.NTV_CMD.GET_NETWORK,{},
  //    $.proxy(function (res) {
  //     this._init(res);
  //    }, this)
  //  );
   
  // 핸드폰에 적용시 수정
   this._init();
};

Tw.CustomerUseguideCommon.prototype = {
  //  _init : function(res) { //핸드폰에 적용 시 수정
   _init : function(){ 
  //     if(!res.params.isWifiConnected){  //핸드폰에 적용시 수정
      if(true){
        this._$confirm1.css('display','block');
        this._$confirm2.css('display','block');
        this._$confirm3.css('display','block');
        this._$confirm4.css('display','block');
        this._$confirm5.css('display','block');
        this._$confirm6.css('display','block');
        this._$confirm7.css('display','block');
        this._$confirm1.on('click', $.proxy(this._loadpopup1, this));
        this._$confirm2.on('click', $.proxy(this._loadpopup2, this));
        this._$confirm3.on('click', $.proxy(this._loadpopup3, this));
        this._$confirm4.on('click', $.proxy(this._loadpopup4, this));
        this._$confirm5.on('click', $.proxy(this._loadpopup5, this));
        this._$confirm6.on('click', $.proxy(this._loadpopup6, this));
        this._$confirm7.on('click', $.proxy(this._loadpopup7, this));
      }
    },

  _loadpopup1: function (e) {
    this.crtVideo=1;
    $.proxy(this._loadPopup(e),this);
  },

  _loadpopup2: function (e) {
    this.crtVideo=2;
    $.proxy(this._loadPopup(e),this);
  },

  _loadpopup3: function (e) {
    this.crtVideo=3;
    $.proxy(this._loadPopup(e),this);
  },

  _loadpopup4: function (e) {
    this.crtVideo=4;
    $.proxy(this._loadPopup(e),this);
  },

  _loadpopup5: function (e) {
    this.crtVideo=5;
    $.proxy(this._loadPopup(e),this);
  },

  _loadpopup6: function (e) {
    this.crtVideo=6;
    $.proxy(this._loadPopup(e),this);
  },

  _loadpopup7: function (e) {
    this.crtVideo=7;
    $.proxy(this._loadPopup(e),this);
  },

  _loadPopup: function (e) {
    this._popupService.open({
      url: '/hbs/' ,
      hbs: 'popup_a5_en'
    },
      $.proxy(this._onOpenPopup, this),
      null,
      'prod_info',
      $(e.currentTarget));
  },

  _confirm: function () {
    
    var outlinkUrl = '';
    if(this.crtVideo===1){ // 비디오일 때 처리
      outlinkUrl = 'https://www.youtube.com/watch?v=fUMu9LdtVeE&feature=emb_logo';
    }
    if(this.crtVideo===2){
      outlinkUrl = 'https://www.youtube.com/watch?v=JVu2wc1GBpg&feature=emb_logo';
      }
    if(this.crtVideo===3){
      outlinkUrl = 'https://www.youtube.com/watch?v=lHqxkq_WfUk&feature=emb_logo';
    }
    if(this.crtVideo===4){
      outlinkUrl = 'https://www.youtube.com/watch?v=P9_32clrvLk&feature=emb_logo';
    }
    if(this.crtVideo===5){
      outlinkUrl = 'https://www.youtube.com/watch?time_continue=1&v=KLvdZnF2FZI&feature=emb_logo';
    }
    if(this.crtVideo===6){
      outlinkUrl = 'https://www.youtube.com/watch?v=gYt00x7QsbY&feature=emb_logo';
    }
    if(this.crtVideo===7){
      outlinkUrl = 'https://youtu.be/iyCDDPpbpMI';
    }
    this._$confirm1.remove();
    this._$confirm2.remove();
    this._$confirm3.remove();
    this._$confirm4.remove();
    this._$confirm5.remove();
    this._$confirm6.remove();
    this._$confirm7.remove();
    Tw.CommonHelper.openUrlExternal(outlinkUrl);
  },

  _onOpenPopup: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    $layer.on('click', '.pos-right', $.proxy(this._confirm, this));
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onOutLink, this)); //외부 링크 이동
  },

  _onOutLink: function (e) {
    Tw.CommonHelper.openUrlExternal(e.currentTarget.value);
  }
};


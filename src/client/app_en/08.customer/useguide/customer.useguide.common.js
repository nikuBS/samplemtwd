/**
 * @file customer.useguide.common.js
 * @author Lee Sanghyoung (silion@sk.com)
 * @since 2018. 10. 18
 */
Tw.CustomerUseguideCommon = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this.crtVideo='videoConfirm1';

  this._$popup = this.$container.find('.popup');
  this._$cancelbtn = this.$container.find('.pos-left');
  this._$confirmbtn = this.$container.find('.pos-right');
  this._bindEvent(); 
  Tw.Native.send(Tw.NTV_CMD.GET_NETWORK,{},
      $.proxy(function (res) {
       this._init(res);
      }, this)
    );
   
  // 핸드폰에 적용시 수정
   //this._init();
};

Tw.CustomerUseguideCommon.prototype = {
    _init : function(res) { //핸드폰에 적용 시 수정
  // _init : function(){ 
       if(!res.params.isWifiConnected){  //핸드폰에 적용시 수정
  //    if(true){
        $('.confirmDiv').css('display','block');
        $('.confirmDiv').on('click', $.proxy(this._setcrtVideo, this));
      }
    },
  
  _setcrtVideo: function(e) {
    this.crtVideo = $(e.currentTarget).attr('id');
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
    if(this.crtVideo==='videoConfirm1'){ // 비디오일 때 처리
      outlinkUrl = 'https://www.youtube.com/watch?v=fUMu9LdtVeE&feature=emb_logo';
    }
    if(this.crtVideo==='videoConfirm2'){
      outlinkUrl = 'https://www.youtube.com/watch?v=JVu2wc1GBpg&feature=emb_logo';
      }
    if(this.crtVideo==='videoConfirm3'){
      outlinkUrl = 'https://www.youtube.com/watch?v=lHqxkq_WfUk&feature=emb_logo';
    }
    if(this.crtVideo==='videoConfirm4'){
      outlinkUrl = 'https://www.youtube.com/watch?v=P9_32clrvLk&feature=emb_logo';
    }
    if(this.crtVideo==='videoConfirm5'){
      outlinkUrl = 'https://www.youtube.com/watch?time_continue=1&v=KLvdZnF2FZI&feature=emb_logo';
    }
    if(this.crtVideo==='videoConfirm6'){
      outlinkUrl = 'https://www.youtube.com/watch?v=gYt00x7QsbY&feature=emb_logo';
    }
    if(this.crtVideo==='videoConfirm7'){
      outlinkUrl = 'https://youtu.be/iyCDDPpbpMI';
    }

    $('.confirmDiv').remove();
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


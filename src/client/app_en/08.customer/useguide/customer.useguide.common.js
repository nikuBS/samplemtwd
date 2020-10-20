/**
 * @file customer.useguide.common.js
 * @author Lee Sanghyoung (silion@sk.com)
 * @since 2018. 10. 18
 */
Tw.CustomerUseguideCommon = function (rootEl) {
  this.$container = rootEl;
  this.crtVideo=1;

  this._$video1 = this.$container.find('#video1');
  this._$video2 = this.$container.find('#video2');
  this._$video3 = this.$container.find('#video3');
  this._$confirm1 = this.$container.find('#videoConfirm1');
  this._$confirm2 = this.$container.find('#videoConfirm2');
  this._$confirm3 = this.$container.find('#videoConfirm3');
  this._$popup = this.$container.find('.popup');
  this._$cancelbtn = this.$container.find('.pos-left');
  this._$confirmbtn = this.$container.find('.pos-right');
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
  //  _init : function(){ 
      if(!res.params.isWifiConnected){  //핸드폰에 적용시 수정
    //  if(true){
        this._$confirm1.css("display","block");
        this._$confirm2.css("display","block");
        this._$confirm3.css("display","block");
        this._$confirm1.on('click', $.proxy(this._setConfirm1, this));
        this._$confirm2.on('click', $.proxy(this._setConfirm2, this));
        this._$confirm3.on('click', $.proxy(this._setConfirm3, this));
        this._$cancelbtn.on('click', $.proxy(this._cancel, this));
        this._$confirmbtn.on('click', $.proxy(this._confirm, this));
      }
    },

  _setConfirm1: function() {
    this.crtVideo=1;
    this._$popup.css("display","block");
  },

  _setConfirm2: function() {
    this.crtVideo=2;
    this._$popup.css("display","block");
  },

  _setConfirm3: function() {
    this.crtVideo=3;
    this._$popup.css("display","block");
  },

  _cancel: function () {
    this._$popup.css("display","none");
  },

  _confirm: function () {
    this._$popup.css("display","none");
    if(this.crtVideo==1){
      this._$video1.attr("allow","autoplay");
      this._$video1.attr("src","https://www.youtube.com/embed/fUMu9LdtVeE?rel=0;amp;autoplay=1;amp;autopause=0");
    }
    if(this.crtVideo==2){
      this._$video2.attr("allow","autoplay");
      this._$video2.attr("src","https://www.youtube.com/embed/JVu2wc1GBpg?rel=0;amp;autoplay=1;amp;autopause=0");
      }
    if(this.crtVideo==3){
      this._$video3.attr("allow","autoplay");
      this._$video3.attr("src","https://www.youtube.com/embed/lHqxkq_WfUk?rel=0;amp;autoplay=1;amp;autopause=0");
    }
    this._$confirm1.remove();
    this._$confirm2.remove();
    this._$confirm3.remove();
  }

};

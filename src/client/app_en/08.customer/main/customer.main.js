/**
 * @file [고객센터-메인]
 * @author Lee Kirim
 * @since 2018-12-27
 */

 /**
 * @class 
 * @desc 고객센터 class
 * @param {Object} rootEl - 최상위 element Object
 */
Tw.CustomerMain = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._$video = this.$container.find('#video');
  this._$confirm = this.$container.find('#videoConfirm');

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
  this._bindEvent();
};

Tw.CustomerMain.prototype = {
   _init : function(res) { //핸드폰에 적용 시 수정
  //_init : function(){
        if(!res.params.isWifiConnected){  //핸드폰에 적용시 수정
        //if(true){
          this._$confirm.css("display","block");
          this._$confirm.on('click', $.proxy(this._setConfirm, this));
          this._$cancelbtn.on('click', $.proxy(this._cancel, this));
          this._$confirmbtn.on('click', $.proxy(this._confirm, this));
        }
  },

  _setConfirm: function() {
    this._$popup.css("display","block");
  },

  _cancel: function () {
    this._$popup.css("display","none");
  },

  _confirm: function () {
    
    this._$popup.css("display","none");
   
      this._$video.attr("allow","autoplay");
      this._$video.attr("src","https://www.youtube.com/embed/fUMu9LdtVeE?rel=0;amp;autoplay=1;amp;autopause=0");
   
    this._$confirm.remove();
  },


  _bindEvent: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onOutLink, this)); //외부 링크 이동
  },
  
  /**
   * @function
   * @desc 링크 외브 브라우저로 열기
   * @param  {Object} e - click event
   */
  _onOutLink: function (e) {
    Tw.CommonHelper.openUrlExternal(e.currentTarget.value);
  }
};
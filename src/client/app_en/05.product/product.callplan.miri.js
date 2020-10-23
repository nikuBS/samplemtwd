
Tw.ProductCallplanMiri = function (rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this.crtVideo=2;

  this._$video0 = this.$container.find('#video0');
  this._$video1 = this.$container.find('#video1');
  this._$confirm0 = this.$container.find('#videoConfirm0');
  this._$confirm1 = this.$container.find('#videoConfirm1');

  this._$popup = this.$container.find('.popup');
  this._$cancelbtn = this.$container.find('.pos-left');
  this._$confirmbtn = this.$container.find('.pos-right');

  Tw.Native.send(Tw.NTV_CMD.GET_NETWORK,{},
     $.proxy(function (res) {
      this._init(res);
     }, this)
   );
  // 핸드폰에 적용시 수정
  // this._init();
};

Tw.ProductCallplanMiri.prototype = {
     _init : function(res) { //핸드폰에 적용 시 수정
    //_init : function(){
            if(!res.params.isWifiConnected){  //핸드폰에 적용시 수정
     //       if(true){
              this._$confirm0.css("display","block");
              this._$confirm1.css("display","block");
              this._$confirm0.on('click', $.proxy(this._loadpopup0, this));
              this._$confirm1.on('click', $.proxy(this._loadpopup1, this));
            }
          },
        
        _loadpopup0: function () {
          this.crtVideo=0;
          var tplPlanCard = Handlebars.compile(Tw.POPUP_A5);
            $('.popupDiv').html(tplPlanCard({}));
            $('.pos-left').on('click', $.proxy(this._cancel, this));
            $('.pos-right').on('click', $.proxy(this._confirm, this));
          },

        _loadpopup1: function () {
          this.crtVideo=1;
          var tplPlanCard = Handlebars.compile(Tw.POPUP_A5);
            $('.popupDiv').html(tplPlanCard({}));
            $('.pos-left').on('click', $.proxy(this._cancel, this));
            $('.pos-right').on('click', $.proxy(this._confirm, this));
        },
      
        _cancel: function () {
          $('.popup').remove();
        },
      
        _confirm: function () {
          $('.popup').remove();
          if(this.crtVideo==0){
            this._$video0.attr("allow","autoplay");
            this._$video0.attr("src","https://www.youtube.com/embed/fUMu9LdtVeE?rel=0;amp;autoplay=1;amp;autopause=0");
          }
          if(this.crtVideo==1){
            this._$video1.attr("allow","autoplay");
            this._$video1.attr("src","https://www.youtube.com/embed/P9_32clrvLk?rel=0;amp;autoplay=1;amp;autopause=0");
            }
          this._$confirm0.remove();
          this._$confirm1.remove();
        }
};
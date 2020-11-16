
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
  this._bindEvent(); 
    Tw.Native.send(Tw.NTV_CMD.GET_NETWORK,{},
    $.proxy(function (res) {
      this._init(res);
        }, this)
    );
  // 핸드폰에 적용시 수정
  //this._init();
};

Tw.ProductCallplanMiri.prototype = {
     _init : function(res) { //핸드폰에 적용 시 수정
    // _init : function(){
            if(!res.params.isWifiConnected){  //핸드폰에 적용시 수정
     //       if(true){
              this._$confirm0.css('display','block');
              this._$confirm1.css('display','block');
              this._$confirm0.on('click', $.proxy(this._loadpopup0, this));
              this._$confirm1.on('click', $.proxy(this._loadpopup1, this));
            }
          },
        
        _loadpopup0: function (e) {
          this.crtVideo=0;
          this._loadPopup(e);
          },

        _loadpopup1: function (e) {
          this.crtVideo=1;
          this._loadPopup(e);
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
          if(this.crtVideo === 0){
            outlinkUrl = 'https://www.youtube.com/watch?v=fUMu9LdtVeE&feature=emb_logo';
          }
          if(this.crtVideo === 1){
            outlinkUrl = 'https://www.youtube.com/watch?v=P9_32clrvLk&feature=emb_logo';
            }
          this._$confirm0.remove();
          this._$confirm1.remove();

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
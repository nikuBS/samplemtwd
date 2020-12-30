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
  
  this._historyService = new Tw.HistoryService();
 
  this._$popup = this.$container.find('.popup');
  this._$cancelbtn = this.$container.find('.pos-left');
  this._$confirmbtn = this.$container.find('.pos-right');
  if(Tw.BrowserHelper.isApp()){
    Tw.Native.send(Tw.NTV_CMD.GET_NETWORK,{},
      $.proxy(function (res) {
        this._init(res);
      }, this)
    );
  } else {
    this.$container.on('click', '.embed-container', $.proxy(this._confirm, this));
  }

  // 핸드폰에 적용시 수정
  //this._init();
  this._bindEvent();
};

Tw.CustomerMain.prototype = {
   _init : function(res) { //핸드폰에 적용 시 수정
   //_init : function(){
         if(!res.params.isWifiConnected){  //핸드폰에 적용시 수정
      //   if(true){
          this.$container.on('click', '.embed-container', $.proxy(this._loadPopup, this));
        } else {
          this.$container.on('click', '.embed-container', $.proxy(this._confirm, this));
        }
  },

   _confirm: function () {
    Tw.CommonHelper.openUrlExternal('https://www.youtube.com/watch?v=fUMu9LdtVeE&feature=emb_logo');
  },


  _bindEvent: function () {
    this.$container.on('click', '.fe-outlink', $.proxy(this._onOutLink, this)); //외부 링크 이동
    this.$container.on('click', '.fe-tel', $.proxy(this.goTel, this));
  },
  
  /**
   * @function
   * @desc 링크 외브 브라우저로 열기
   * @param  {Object} e - click event
   */
  _onOutLink: function (e) {
    Tw.CommonHelper.openUrlExternal(e.currentTarget.value);
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

  _onOpenPopup: function ($layer) {
    Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    $layer.on('click', '.pos-right', $.proxy(this._confirm, this));
  },

  goTel: function (event) {
    event.preventDefault();
    event.stopPropagation();
    this._historyService.goLoad('tel:'+$(event.currentTarget).data('tel'));
  }
};
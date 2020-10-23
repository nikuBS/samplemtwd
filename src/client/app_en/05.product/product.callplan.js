Tw.ProductCallplan = function(rootEl) {
    this.$container = rootEl;
    this._popupService = Tw.Popup;

    this.$button = this.$container.find('.nogaps .link-long-list .link-long button');
    this.$popup = this.$container.find('.popup-page');
    this.$closePopup = this.$container.find('.popup-closeBtn');
    this.$bgDiv = this.$container.find('.productdetails-bg');
    this.$hTit = this.$container.find('.h-tit');
    this.$header = this.$container.find('#header');
    this.$hTit.css("color",bgColor);
    this.body = this.$container.find('.bg-productdetail');
    this._uri = window.location.search.split('=')[1];
    var prodGroup = $('#prodGroup').val();
    //헤더 요금제 이름 숨기기
    var bgColor = "rgb(0,0,0)"
        if(prodGroup == '5GX Plan'){
            bgColor = "rgb(205, 14, 44)";
        }
        else{
            bgColor = "rgb(53, 131, 227)";
        }
    this.$hTit.css("color",bgColor);
    if(skt_landing.util.win_info.get_scrollT()>39) {
        this.$hTit.css("color","rgb(0,0,0)");
    }
    $(window).bind('scroll', $.proxy(function(){
        if(skt_landing.util.win_info.get_scrollT()>39) {
            this.$hTit.css("color","rgb(0,0,0)");
        }else{
            this.$hTit.css("color",bgColor);
        }
    },this));
    this._init();
  };

  Tw.ProductCallplan.prototype = {
    _init: function(){
        this.$button.on("click",$.proxy(this._popup,this));
    },
    _popup: function(e){
        
        if( this._uri== 'NA00006405' ||  this._uri== 'NA00006404' || this._uri== 'NA00006403' ) {
            prodNm = "MP2_1"
        }
        else if( this._uri== 'NA00006402' ){
            prodNm = "MP2_2"
        }
        else if( this._uri== 'NA00006817' ){
            prodNm = "MP2_3"
        }
        else if( this._uri== 'NA00006539' || this._uri== 'NA00006538' ){
            prodNm = "MP2_4"
        }
        else if( this._uri== 'NA00006537' || this._uri== 'NA00006536' || this._uri== 'NA00006535' ){
            prodNm = "MP2_5"
        }
        else if( this._uri== 'NA00006534' ){
            prodNm = "MP2_6"
        }
        else if( this._uri== 'NA00006157' ){
            prodNm = "MP2_7"
        }
        else if( this._uri== 'NA00006156' || this._uri== 'NA00006155' ){
            prodNm = "MP2_8"
        }
        else if( this._uri== 'NA00005629' || this._uri== 'NA00005628' || this._uri== 'NA00005627' ){
            prodNm = "MP2_9"
        }
        else if( this._uri== 'NA00006797' || this._uri== 'NA00006796' || this._uri== 'NA00006795' || this._uri== 'NA00006794'){
            prodNm = "MP2_10"
        }
        else if( this._uri== 'NA00006793' ){
            prodNm = "MP2_11"
        }
        else if( this._uri== 'NA00006862' || this._uri== 'NA00006864' ){
            prodNm = "MP2_12"
        }

        this._popupService.open({
            url: '/hbs/',
            hbs: prodNm,
          },
            $.proxy(this._onOpenPopup, this),
            null,
            'prod_info',
            $(e.currentTarget));
    },

    _onOpenPopup: function ($layer) {
        Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
       // $('.popup-closeBtn').on('click',$.proxy(this._closePopup,this));
    },

    _closePopup: function(){
        $('.popup').remove();
    },

    _setBgcolor: function(){
        var prodGroup = $('#prodGroup').val();
        if(prodGroup == '5GX Plan'){
            this.bgColor = '#cd0e2c';
        }
        else{
            this.bgColor = '#3583e3';
        }
    }
  }
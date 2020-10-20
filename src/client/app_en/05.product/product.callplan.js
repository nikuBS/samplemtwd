Tw.ProductCallplan = function(rootEl) {
    this.$container = rootEl;

    this.$button = this.$container.find('.nogaps .link-long-list .link-long button');
    this.$popup = this.$container.find('.popup-page');
    this.$closePopup = this.$container.find('.popup-closeBtn');
    this.$bgDiv = this.$container.find('.productdetails-bg');
    this.bgColor = this.$bgDiv.css('background-color');
    this.$hTit = this.$container.find('.h-tit');
    this.$header = this.$container.find('#header');
    this.$hTit.css("color",this.bgColor);
    this.body = this.$container.find('.bg-productdetail');
    console.log(this.bgColor);
    console.log(this.$header.hasClass('bg-type'));
    $(window).bind('scroll', $.proxy(function(){
        if(skt_landing.util.win_info.get_scrollT()>39){
            this.$hTit.css("color","rgb(0,0,0)");
        }else{
            this.$hTit.css("color",this.bgColor);
        }
    },this));
    this._init();
  };

  Tw.ProductCallplan.prototype = {
    _init: function(){
        this.$button.on("click",$.proxy(this._popup,this));
        this.$closePopup.on("click",$.proxy(this._closePopup,this));
    },
    _popup: function(){
        this.$popup.css("display","block");

    },
    _closePopup: function(){
        this.$popup.css("display","none");
    }
  }
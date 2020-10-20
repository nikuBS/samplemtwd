Tw.ProductCallplanHardcording = function(rootEl) {
    this.$container = rootEl;

    this.$button = this.$container.find('.nogaps .link-long-list .link-long button');
    this.$popup = this.$container.find('.popup-page');
    this.$closePopup = this.$container.find('.popup-closeBtn');
    this._init();
  };

  Tw.ProductCallplanHardcording.prototype = {
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
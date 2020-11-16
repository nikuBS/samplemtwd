Tw.ProductCallplan = function(rootEl,contents) {
    this.$container = rootEl;
    this.$ProdContents = contents;
    this._popupService = Tw.Popup;
    this.$button = this.$container.find('.nogaps .link-long-list .link-long button');
    this.$popup = this.$container.find('.popup-page');
    this.$closePopup = this.$container.find('.popup-closeBtn');
    this.$bgDiv = this.$container.find('.productdetails-bg');
    this.$hTit = this.$container.find('.h-tit');
    this.$header = this.$container.find('#header');
    this.body = this.$container.find('.bg-productdetail');
    this._uri = window.location.search.split('=')[1];
    
    // 헤더 요금제 이름 숨기기
    
    
    this._init();
  };

  Tw.ProductCallplan.prototype = {
    _init: function(){
        this.$button.on('click', $.proxy(this._popup,this));
    },
    _popup: function(e){
        this._popupService.open({
            url: '/hbs/' ,
            hbs: 'en.product.callplan.detailtemp',
            data: {
                'prodContents': this._makePopupContents(),
                //'DetailTitle': Handlebars.compile($('#popupTitle').html())()
                'DetailTitle': $('#popupTitle').html()
            }
          },
            $.proxy(this._onOpenPopup, this),
            null,
            'prod_info',
            $(e.currentTarget));
    },

    _onOpenPopup: function ($layer) {
        Tw.CommonHelper.focusOnActionSheet($layer); // 접근성
    },

    _closePopup: function(){
        $('.popup').remove();
    },

    _makePopupContents: function(){
        return $('#popupContents').html();
    }
  };


Tw.ProductAppsDetail = function(rootEl) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.ProductAppsDetail.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '#fe-images', $.proxy(this._handleOpenImgDetail, this));
  },

  _handleOpenImgDetail: function(e) {
    var images = e.currentTarget.getAttribute('data-images').split(',');

    this._popupService.open({
      hbs: 'TA_02_01',
      images: images
    });
  }

  // _handleCheckApp: function() {
  // var isIos = Tw.BrowserHelper.isIos(), isAndroid = Tw.BrowserHelper.isAndroid();

  // setTimeout(function() {
  //   window.location = 'https://play.google.com/store/apps/details?id=com.tms';
  // }, 1000);
  // window.location = 'youtube://';
  // }
};

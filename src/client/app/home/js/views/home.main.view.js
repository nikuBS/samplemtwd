Tw.HomeMainView = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.apiService.getInstance();

  this._bindEvent();
  this._bindSwiper();
};

Tw.HomeMainView.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.wrapper_btn', $.proxy(this._onClickAddButton, this));
  },

  _bindSwiper: function () {
    $('.swiper-container').slick({
      arrows: false,
      lazyLoad: 'ondemand'
    });
  },

  _onClickAddButton: function ($event) {
    // $event.preventDefault();
    var $target = $($event.currentTarget);
    $('.swiper-container').slick('slickGoTo', $target.index());

    this._apiService.request(Tw.API_CMD.FAKE_POST, { postId: 1 })
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },

  _success: function (resp) {
    console.log('api success', resp);
  },

  _fail: function (err) {
    console.log('api fail', err);
  }

};
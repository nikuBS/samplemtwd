Tw.HomeMainView = function (rootEl) {
  this.$container = rootEl;
  this._bindEvent();
  this._bindSwiper();
};

Tw.HomeMainView.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.wrapper_btn', $.proxy(this._onClickAddButton, this));
  },

  _bindSwiper: function() {
    $('.swiper-container').slick({
      arrows: false,
      lazyLoad: 'ondemand'
    });
  },

  _onClickAddButton: function ($event) {
    // $event.preventDefault();
    var $target = $($event.currentTarget);
    $('.swiper-container').slick('slickGoTo', $target.index());
  }
};
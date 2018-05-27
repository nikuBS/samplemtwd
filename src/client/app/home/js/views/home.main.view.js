Tw.HomeMainView = function (rootEl) {
  this.$container     = rootEl;
  this._apiService    = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._bindEvent();
  this._bindSwiper();
};

Tw.HomeMainView.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.wrapper_btn', $.proxy(this._onClickGnbButton, this));
    this.$container.on('click', '.btn_test', $.proxy(this._onClickAjaxButton, this));
  },

  _bindSwiper: function () {
    $('.swiper-container').slick({
      arrows: false,
      lazyLoad: 'ondemand'
    });
  },

  _onClickGnbButton: function ($event) {
    // $event.preventDefault();
    var $target = $($event.currentTarget);
    $('.swiper-container').slick('slickGoTo', $target.index());

    this._nativeService.send('cmd', 'pr', this.nativeCallback)
      .success(function () {
        console.log();
      })
  },

  _onClickAjaxButton: function ($event) {
    this._apiService.request(Tw.API_CMD.FAKE_POST, { postId: 1 })
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));

    this._nativeService.send(Tw.NTV_CMD.TOAST, { message: 'test' }, this.nativeCallback);
  },

  _success: function (resp) {
    console.log('api success', resp);
    var $box = this.$container.find('.notice');
    $box.append(JSON.stringify(resp));
  },

  _fail: function (err) {
    console.log('api fail', err);
  },

  nativeCallback: function (resp) {
    console.log('native callback' + resp);
  }

};
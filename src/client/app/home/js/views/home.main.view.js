Tw.HomeMainView = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();
  console.log(this.$container);

  this._bindEvent();
};

Tw.HomeMainView.prototype = {
  _bindEvent: function () {
    this.$container.on('click', '.btn-search', $.proxy(this._onClickAjaxButton, this));

    // this._apiService.mockJson(Tw.API_CMD.SESSION_CHECK, {})
    //   .done($.proxy(this._success, this))
    //   .fail($.proxy(this._fail, this));
    $.ajax('/mock/client-test.json')
      .done((function(resp){
        console.log(resp);
      }));
  },

  _onClickGnbButton: function ($event) {
    // $event.preventDefault();
    // var $target = $($event.currentTarget);
    // $('.swiper-container').slick('slickGoTo', $target.index());
  },

  _onClickAjaxButton: function ($event) {
    console.log('button click');
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
Tw.TooltipService = function () {
  this.$document = $(document);
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._init();
};

Tw.TooltipService.prototype = {
  getTip: function (event) {
    var $targetId = $(event.currentTarget).attr('id');
    //this._apiService.request('', { id: $targetId })
    $.ajax('/mock/tip.json')
      .done($.proxy(this._success, this, $targetId))
      .fail($.proxy(this._fail, this));
  },
  _init: function () {
    this.$document.on('click', '.btn-tip', $.proxy(this.getTip, this));
    this.$document.on('click', '.tip-view', $.proxy(this.getTip, this));
  },
  _success: function ($targetId, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $content = res.result.tip;
      for (var i = 0; i < $content.length; i++) {
        if ($content[i].id === $targetId) {
          this._openTip($content[i]);
        }
      }
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _openTip: function ($result) {
    this._popupService.open({
      url: '/hbs/',
      'pop_name': 'type_tx_scroll',
      'title': $result.title,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': $result.contents,
      'bt_b': [{
        style_class: 'tw-popup-closeBtn pos-center',
        txt: '닫기'
      }]
    });
  }
};
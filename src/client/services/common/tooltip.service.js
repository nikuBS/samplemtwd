Tw.TooltipService = function () {
  this.$document = $(document);

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._tooltipList = [];
  this._id = null;
  this._link = null;

  this._inapp = false;
  this._isExternal = false;
  this._isLink = false;

  this._bindEvent();
};

Tw.TooltipService.prototype = {
  getTip: function (event) {
    var $target = $(event.currentTarget);
    var $targetId = $target.attr('page-id');
    this._id = $target.attr('id');

    if (this._isExist($targetId)) {
      this._getContents(this._tooltipList[$targetId], 'exist');
    } else {
      //this._apiService.request('', { id: $targetId })
      $.ajax('/mock/tip.json')
        .done($.proxy(this._success, this, $targetId))
        .fail($.proxy(this._fail, this));
    }
  },
  _isExist: function ($targetId) {
    if (Tw.FormatHelper.isEmpty(this._tooltipList)) {
      return false;
    }

    for (var key in this._tooltipList) {
      if (key === $targetId) {
        return true;
      }
    }
    return false;
  },
  _bindEvent: function () {
    this.$document.on('click', '.btn-tip', $.proxy(this.getTip, this));
    this.$document.on('click', '.tip-view', $.proxy(this.getTip, this));
  },
  _success: function ($targetId, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $content = res.result.tip[$targetId];
      this._tooltipList.push($content);
      this._getContents($content, 'api');
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _getContents: function ($content) {
    for (var i = 0; i < $content.length; i++) {
      if ($content[i].id === this._id) {
        this._openTip($content[i]);
      }
    }
  },
  _openTip: function ($result) {
    this._popupService.open({
      url: Tw.Environment.cdn + '/hbs/',
      'pop_name': 'type_tx_scroll',
      'title': $result.title,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': $result.contents,
      'bt_b': [{
        style_class: 'tw-popup-closeBtn bt-red1 pos-right',
        txt: '닫기'
      }]
    },
      $.proxy(this._onOpen, this),
      $.proxy(this._onClose, this));
  },
  _onOpen: function ($layer) {
    $layer.on('click', 'a', $.proxy(this._onClick, this));
  },
  _onClick: function (event) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    this._link = $target.attr('href');

    if (Tw.BrowserHelper.isApp()) {
      if ($target.hasClass('fe-link-inapp')) {
        this._inapp = true;
      }
    }

    if ($target.hasClass('fe-link-external')) {
      this._isExternal = true;
    } else {
      this._isLink = true;
    }

    this._popupService.close();
  },
  _onClose: function () {
    if (this._inapp) {
      Tw.CommonHelper.openUrlInApp(this._link);
    }
    if (this._isExternal) {
      Tw.CommonHelper.openUrlExternal(this._link);
    }
    if (this._isLink) {
      window.location.href = this._link;
    }
  }
};
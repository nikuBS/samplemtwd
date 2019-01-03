Tw.TooltipService = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._hashService = Tw.Hash;

  this._link = null;

  this._inapp = false;
  this._isExternal = false;
  this._isLink = false;

  this._init();
};

Tw.TooltipService.prototype = {
  _init: function () {
    var $menuId = $('.wrap').attr('data-menuId');
    this._getTip($menuId);
  },
  popInit: function ($menuId) {
    if (window.location.hash.indexOf('_P') !== -1) {
      this._getTip($menuId);
    }
  },
  _getTip: function ($menuId) {
    if ($menuId) {
      this._apiService.request(Tw.NODE_CMD.GET_TOOLTIP, {menuId: $menuId})
        .done($.proxy(this._success, this, $menuId))
        .fail($.proxy(this._fail, this, $menuId));
    }
  },
  _success: function ($menuId, res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      var $content = res.result.tooltip;
      if (!Tw.FormatHelper.isEmpty($content)) {
        this._getContents($content);
      }
    } else {
      this._fail($menuId, res);
    }
  },
  _fail: function ($menuId, err) {
    $('button[page-id="' + $menuId + '"]').on('click', $.proxy(this._failAlert, this, err));
  },
  _failAlert: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _getContents: function ($content) {
    for (var i = 0; i < $content.length; i++) {
      this._setTitle($content[i]);
    }
  },
  _setTitle: function ($result) {
    var $target = $('#' + $result.mtwdTtipId);
    var cloneTarget = $target.clone();
    var parentTarget = $target.parent();
    parentTarget.text($result.ttipTitNm);
    parentTarget.append(cloneTarget);

    cloneTarget.on('click', $.proxy(this._openTip, this, $result));
  },
  _openTip: function ($result) {
    this._popupService.open({
      url: Tw.Environment.cdn + '/hbs/',
      'pop_name': 'type_tx_scroll',
      'title': $result.ttipTitNm,
      'title_type': 'sub',
      'cont_align': 'tl',
      'contents': $result.ttipCtt,
      'bt_b': [{
        style_class: 'tw-popup-closeBtn bt-red1 pos-right',
        txt: Tw.BUTTON_LABEL.CONFIRM
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
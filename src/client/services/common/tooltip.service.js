Tw.TooltipService = function () {
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._contentList = [];
  this._link = null;

  this._inapp = false;
  this._isExternal = false;
  this._isLink = false;

  this._init();
};

Tw.TooltipService.prototype = {
  _init: function () {
    this.$container = $('.wrap');
    this.$menuId = this.$container.attr('data-menuId');
    this._getTip();
  },
  popInit: function ($layer) {
    if (window.location.hash.indexOf('_P') !== -1) {
      this.$container = $layer;
      var $menuId = this.$container.attr('data-menuId');

      if (Tw.FormatHelper.isEmpty($menuId) || this.$menuId === $menuId) {
        this._getContents();
      } else {
        this.$menuId = $menuId;
        this._getTip();
      }
    }
  },
  separateInit: function ($target) {
    this._getContents($target);
  },
  _getTip: function () {
    if (this.$menuId) {
      this._apiService.request(Tw.NODE_CMD.GET_TOOLTIP, {menuId: this.$menuId})
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
  },
  _success: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._contentList = res.result.tooltip;
      if (!Tw.FormatHelper.isEmpty(this._contentList)) {
        this._getContents();
      }
    } else {
      this._fail(res);
    }
  },
  _fail: function (err) {
    this.$container.find('button[page-id="' + this.$menuId + '"]').on('click', $.proxy(this._failAlert, this, err));
  },
  _failAlert: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _getContents: function (target) {
    for (var i = 0; i < this._contentList.length; i++) {
      var $target = target || this.$container.find('button[id="' + this._contentList[i].mtwdTtipId + '"]');
      if (!$target.hasClass('fe-tip')) {
        $target.addClass('fe-tip');

        if (this._contentList[i].ttipPresTypCd === Tw.REDIS_TOOLTIP_CODE.ALL) {
          this._setTitle($target, this._contentList[i]);
        } else {
          if (this._contentList[i].ttipPresTypCd === Tw.REDIS_TOOLTIP_CODE.TEXT) {
            $target.text(this._contentList[i].ttipTitNm);
          }
          $target.on('click', $.proxy(this._openTip, this, this._contentList[i]));
        }
      }
    }
  },
  _setTitle: function ($target, $result) {
    var $children = $target.children().clone();
    $target.text($result.ttipTitNm);
    $target.append($children);

    $target.on('click', $.proxy(this._openTip, this, $result));
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
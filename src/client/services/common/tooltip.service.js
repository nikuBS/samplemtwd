/**
 * @namespace
 * @desc tootip 공통 처리하는 서비스
 */
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
  /**
   * @function
   * @desc init
   */
  _init: function () {
    this.$container = $('.wrap');
    this.$menuId = this.$container.attr('data-menuId');
    this._getTip();
  },
  /**
   * @function
   * @desc popup에서 호출 시 init
   * @param $layer
   */
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
  /**
   * @function
   * @desc 동적으로 생성한 페이지에서 호출 시 init
   * @param $target
   */
  separateInit: function ($target) {
    this._getContents($target);
  },
  /**
   * @function
   * @desc dom 변경 후 init
   * @param rootEl
   */
  separateMultiInit: function (rootEl) {
    this.$container = rootEl;
    this._getContents();
  },
  /**
   * @function
   * @desc tooltip 조회 API 호출
   */
  _getTip: function () {
    if (this.$menuId) {
      this._apiService.request(Tw.NODE_CMD.GET_TOOLTIP, {menuId: this.$menuId})
        .done($.proxy(this._success, this))
        .fail($.proxy(this._fail, this));
    }
  },
  /**
   * @function
   * @desc tooltip 조회 API 응답 처리 (성공)
   * @param res
   */
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
  /**
   * @function
   * @desc tooltip 조회 API 응답 처리 (실패)
   * @param err
   */
  _fail: function (err) {
    this.$container.find('button[page-id="' + this.$menuId + '"]').on('click', $.proxy(this._failAlert, this, err));
  },
  /**
   * @function
   * @desc Error alert
   * @param err
   */
  _failAlert: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  /**
   * @function
   * @desc get contents and setting
   * @param target
   */
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
  /**
   * @function
   * @desc set title
   * @param $target
   * @param $result
   */
  _setTitle: function ($target, $result) {
    if ($target.hasClass('fe-insert-parent')) {
      var $parent = $target.parent();
      var $parentOriginal = $parent.children().first().remove().clone();
      $parent.text($result.ttipTitNm);
      $parent.append($parentOriginal);
      $target = $parent.find('.fe-insert-parent');
    } else {
      var $children = $target.children().first().clone();
      $target.text($result.ttipTitNm);
      $target.append($children);
    }

    $target.on('click', $.proxy(this._openTip, this, $result, $target));
  },
  /**
   * @function
   * @desc open tooltip popup
   * @param $result
   * @param $target
   */
  _openTip: function ($result, $target) {
    this._popupService.open({
      url: '/hbs/',
      hbs: 'popup',
      'title': $result.ttipTitNm,
      'btn-close': 'btn-tooltip-close tw-popup-closeBtn',
      'title_type': 'tit-tooltip',
      'cont_align': 'tl font-only-black',
      'contents': $result.ttipCtt, // 웹 접근성 위배 조치
      'tooltip': 'tooltip-pd'
    },
      $.proxy(this._onOpen, this),
      $.proxy(this._onClose, this),
      null, $target
    );
  },
  /**
   * @function
   * @desc tooltip 내용 중 a 태그가 있을 경우 처리
   * @param $layer
   */
  _onOpen: function ($layer) {
    $layer.on('click', 'a', $.proxy(this._onClick, this));
  },
  /**
   * @function
   * @desc a tag 클릭 시 링크 처리
   * @param event
   */
  _onClick: function (event) {
    event.preventDefault();

    var $target = $(event.currentTarget);
    this._link = $target.attr('href');

    if ($target.hasClass('fe-link-inapp')) {
      this._inapp = true;
    } else if ($target.hasClass('fe-link-external')) {
      this._isExternal = true;
    } else if ($target.hasClass('fe-link-internal')) {
      this._isLink = true;
    }
    this._popupService.close();
  },
  /**
   * @function
   * @desc tooltip close 이후 callback 처리
   */
  _onClose: function () {
    if (this._inapp) {
      Tw.CommonHelper.openUrlInApp(this._link);
      this._inapp = false;
    }
    if (this._isExternal) {
      Tw.CommonHelper.openUrlExternal(this._link);
      this._isExternal = false;
    }

    var $wrap = $('.wrap');
    if (this._isLink && $wrap.hasClass('fe-tooltip-replaced-link')) {
      this._popupService.closeAllAndGo(this._link);
      this._isLink = false;
    }
    if (this._isLink && !$wrap.hasClass('fe-tooltip-replaced-link')) {
      window.location.href = this._link;
      this._isLink = false;
    }
  },
  /**
   * @function
   * @desc tooltip contents를 제공
   * @returns {*}
   */
  getContentList: function () {
    return _.clone( this._contentList );
  }
};
Tw.MytUsageTdatashare = function () {
  this._ui = {};

  this._uiFunction();
};

Tw.MytUsageTdatashare.prototype = {
  currentUShimListLastIndex: null,
  _setUI: function () {
    this._ui.$contentWrap = $('body');
    this._ui.$miniPopupTriggers = $('.btn-detail');
    this._ui.$miniPopupWrap = $('#miniPopupWrapper');
    this._ui.$miniPopupSubWrap = this._ui.$miniPopupWrap.find('.popup-base');
    this._ui.$miniPopup = this._ui.$miniPopupWrap.find('.container');
    this._ui.$miniPopupCloser = $('.popup-base .container a');
    this._ui.$childUSimList = $('.d-table.type02');
    this._ui.$childUSimListShowMore = $('.btn-more-list');
    this._ui.$GBtoMB_Switcher = $('#data-size-changer.btn-change');
  },
  _uiFunction: function () {
    this._setUI();

    this.descriptionLayerBtnClickHandler();
    this.uShimListInit();
  },
  contentOverflowToggle: function () {
    var currentState = this._ui.$contentWrap,
        miniPopUpWrap = this._ui.$miniPopupWrap,
        miniPopUpSubWrap = this._ui.$miniPopupSubWrap;

    if (currentState.css('overflow-y') === 'visible') {
      currentState.css({'overflow-y': 'hidden'});
      miniPopUpWrap.show();
      miniPopUpSubWrap.show();
    } else {
      currentState.css({'overflow-y': 'visible'});
      miniPopUpWrap.hide();
      miniPopUpSubWrap.hide();
    }

  },
  miniPopupToggle: function (targetTag) {
    this.contentOverflowToggle();
    if (targetTag) {
      $('#' + targetTag).show();
    } else {
      this._ui.$miniPopup.hide();
    }
  },
  descriptionLayerBtnClickHandler: function () {
    var miniPopupTriggers = this._ui.$miniPopupTriggers;
    this._ui.$miniPopup.hide();


    if (miniPopupTriggers.length) {
      miniPopupTriggers.on('click', $.proxy(function (e) {
        e.preventDefault();
        // if(e.target.nodeName.toLowerCase() === 'span') e.target = e.target.parentNode;

        this.miniPopupToggle('miniPopup0' + $(e.target).data("popup-type"));
      }, this));
    }
    if (this._ui.$miniPopupCloser.length) {
      this._ui.$miniPopupCloser.on('click', $.proxy(function (e) {
        e.preventDefault();
        this.miniPopupToggle();
      }, this));
    }
  },
  uShimListInit: function () {
    if (this._ui.$childUSimListShowMore) {
      this._ui.$childUSimList.map(function (i, o) {
        if (i > 4) {
          $(o).hide();
        }
      });
      this.currentUShimListLastIndex = 4;
      this._ui.$childUSimListShowMore.on('click', 'a', this.uShimListShowMore.bind(this));
    }
  },
  uShimListShowMore: function (e) {
    e.preventDefault();
    this._ui.$childUSimList.slice(this.currentUShimListLastIndex + 1, this.currentUShimListLastIndex + 6).show();
    if (this.currentUShimListLastIndex + 6 >= this._ui.$childUSimList.length) {
      this._ui.$childUSimListShowMore.hide();
    }
  }
};

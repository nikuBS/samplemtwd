/**
 * @file myt-join.suspend.js
 * @author Hyeryoun Lee (skt.P130712@partner.sk.com)
 * @since 2018. 10. 15.
 */

Tw.MyTJoinSuspend = function (rootEl, params) {
  this.$container = rootEl;
  this.TYPE = {
    TEMPORARY: '#temporary',
    LONG_TERM: '#long-term'
  };
  this._params = params;
  this._historyService = new Tw.HistoryService();
  this._historyService.init();
  this._popupService = Tw.Popup;

  this._temp = null;
  this._long = null;
  this._cachedElement();
  this._bindEvent();
};

Tw.MyTJoinSuspend.prototype = {
  _cachedElement: function () {
    this.$tabLinker = this.$container.find('.tab-linker button');
    this.$tabTemp = this.$container.find('[data-id="fe-tab-temporary"]');
    this.$tabLong = this.$container.find('[data-id="fe-tab-long-term"]');
  },

  _bindEvent: function () {
    this.$tabLinker.on('click', $.proxy(this._onTabChanged, this));
    this.$container.on('click', '.fe-bt-back', $.proxy(this._onClose, this));
    $(document).on('ready', $.proxy(this._setInitialTab, this));
  },

  /**
   * URL hash로 초기 선택 탭 설정
   * 일시정: '#temporary',
   * 장기일시정지: '#long-term'
   * @private
   */
  _setInitialTab: function () {
    var type;
    if ( this._params.suspend.status ) {
      type = this.TYPE.LONG_TERM;
    } else {
      type = window.location.hash || this.TYPE.TEMPORARY;
      if ( Object.values(this.TYPE).indexOf(type) < 0 ) {
        type = this.TYPE.TEMPORARY;
      }
    }
    this.$tabLinker.filter('[href="' + type + '"]').click();
  },
  /**
   * Event listener for the button click on '.tab-linker button'(탭버튼)
   * @param e
   * @returns {boolean}
   * @private
   */
  _onTabChanged: function (e) {
    var hash = e.target.getAttribute('href');
    if ( this._params.suspend.status && hash === this.TYPE.TEMPORARY ) {
      e.stopPropagation();
      return false;
    }
    this._setActiveTab(hash);
  },
  /**
   * 일시정지 타입별로 class 분리해서 관리
   * 일시정지: Tw.MyTJoinSuspendTemporary
   * 장기일시정지: Tw.MyTJoinSuspendLongTerm
   * @param type
   * @private
   */
  _setActiveTab: function (type) {
    type = type.toLowerCase();
    switch ( type ) {
      case this.TYPE.TEMPORARY:
        if ( !this._temp ) {
          this._temp = new Tw.MyTJoinSuspendTemporary(this.$tabTemp);
        }
        this.$tabTemp.attr('aria-hidden', false);
        this.$tabLong.attr('aria-hidden', true);

        break;
      case this.TYPE.LONG_TERM:
        if ( !this._long ) {
          this._long = new Tw.MyTJoinSuspendLongTerm(this.$tabLong, this._params);
        }
        this.$tabTemp.attr('aria-hidden', true);
        this.$tabLong.attr('aria-hidden', false);
        break;
    }
  },


  _onClose: function () {
    this._historyService.goBack();
    // 입력값 있을 경우 확인창
    /*
    if ( (this._temp && this._temp.hasChanged()) || (this._long && this._long.hasChanged()) ) {
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(function () {
          this._historyService.go(-2);
        }, this),
        null,
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES);
    } else {
      this._historyService.goBack();
    }
    */
  }
};
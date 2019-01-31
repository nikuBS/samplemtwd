/**
 * FileName: myt-join.suspend.js
 * Author: Hyeryoun Lee (skt.P130712@partner.sk.com)
 * Date: 2018. 10. 15.
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
    this.$tabLinker = this.$container.find('.tab-linker a');
    this.$tabTemp = this.$container.find('[data-id="fe-tab-temporary"]');
    this.$tabLong = this.$container.find('[data-id="fe-tab-long-term"]');
  },

  _bindEvent: function () {
    this.$tabLinker.on('click', $.proxy(this._onTabChanged, this));
    this.$container.on('click', '.fe-bt-back', $.proxy(this._onClose, this));
    $(document).on('ready', $.proxy(this._setInitialTab, this));
  },

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

  _onTabChanged: function () {
    this._setActiveTab(hash);
  },

  _setActiveTab: function (type) {
    type = type.toLowerCase();
    switch ( type ) {
      case this.TYPE.TEMPORARY:
        if ( !this._temp ) {
          this._temp = new Tw.MyTJoinSuspendTemporary(this.$tabTemp);
        }
        break;
      case this.TYPE.LONG_TERM:
        if ( !this._long ) {
          this._long = new Tw.MyTJoinSuspendLongTerm(this.$tabLong, this._params);
        }
        break;
    }
  },


  _onClose: function () {
    if ( (this._temp && this._temp.hasChanged()) || (this._long && this._long.hasChanged()) ) {
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(function () {
          this._historyService.goBack();
        }, this),
        null,
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES);
    } else {
      this._historyService.goBack();
    }
  }
};
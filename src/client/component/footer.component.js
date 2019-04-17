/**
 * @file footer.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.01.25
 */

Tw.FooterComponent = function () {
  this.$footer = $('#gnb');
  new Tw.ShareComponent();
  new Tw.QuickMenuComponent();

  if ( this.$footer.length > 0 ) {
    this._nativeSrevice = Tw.Native;
    this._init();
    this._setCoachMark();
  }
};

Tw.FooterComponent.prototype = {
  _init: function () {
    this.$backDisable = this.$footer.find('#fe-back-disable');
    this.$backEnable = this.$footer.find('#fe-back-enable');
    this.$forwardDisable = this.$footer.find('#fe-forward-disable');
    this.$forwardEnable = this.$footer.find('#fe-forward-enable');

    this._nativeSrevice.send(Tw.NTV_CMD.CAN_GO_HISTORY, {}, $.proxy(this._onCanGoHistory, this));
  },
  _onCanGoHistory: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( resp.params.back === 'N' ) {
        this.$backDisable.removeClass('none');
        this.$backEnable.addClass('none');
      }
      this.$backEnable.attr('data-history', resp.params.historySize);

      if ( resp.params.forward === 'N' ) {
        this.$forwardDisable.removeClass('none');
        this.$forwardEnable.addClass('none');
      }
    }
  },
  _setCoachMark: function () {
    new Tw.CoachMark(this.$footer, '#fe-coach-masking', '.fe-coach-masking-target', Tw.NTV_STORAGE.COACH_MASKING);
    new Tw.CoachMark(this.$footer, '#fe-coach-quick', '.fe-coach-quick-target', Tw.NTV_STORAGE.COACH_QUICK);
  }
};

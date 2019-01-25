/**
 * FileName: footer.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.01.25
 */

Tw.FooterComponent = function () {
  this.$footer = $('#gnb');
  new Tw.MaskingComponent();
  new Tw.ShareComponent();
  new Tw.QuickMenuComponent();

  if ( this.$footer.length > 0 ) {
    this._nativeSrevice = Tw.Native;
    this._init();
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
    console.log(resp);
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( resp.params.back === 'N' ) {
        this.$backDisable.removeClass('none');
        this.$backEnable.addClass('none');
      }

      if ( resp.params.forward === 'N' ) {
        console.log('forward n');
        this.$forwardDisable.removeClass('none');
        this.$forwardEnable.addClass('none');
      }
    }
  }
};

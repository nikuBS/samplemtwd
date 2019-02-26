/**
 * FileName: coach-mark.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.02.11
 */

Tw.CoachMark = function ($container, targetId, nativeCmd) {
  this._nativeService = Tw.Native;

  this.$coachView = $container.find(targetId);
  this._nativeCmd = nativeCmd;
  $container.on('click', targetId + ' > button', $.proxy(this._onClickCoachClose, this));

  this._setCoachMark();
};

Tw.CoachMark.prototype = {
  _setCoachMark: function () {
    if ( this.$coachView.length > 0 ) {
      this._nativeService.send(Tw.NTV_CMD.LOAD, { key: this._nativeCmd }, $.proxy(this._onLoadCoach, this));
    }
  },
  _onLoadCoach: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( resp.params.value === 'N' ) {
        this.$coachView.removeClass('none');
      }
    } else {
      this.$coachView.removeClass('none');
    }
  },
  _onClickCoachClose: function () {
    this.$coachView.addClass('none');
    this._nativeService.send(Tw.NTV_CMD.SAVE, { key: this._nativeCmd, value: 'Y' });
  }
};
/**
 * @file coach-mark.component.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2019.02.11
 */

/**
 * @class
 * @desc 공통 > 코치마크
 * @param $container
 * @param targetId
 * @param focusId
 * @param nativeCmd
 * @constructor
 */
Tw.CoachMark = function ($container, targetId, focusId, nativeCmd) {
  this._nativeService = Tw.Native;

  this.$coachView = $container.find(targetId);
  this.$focusTarget = $container.find(focusId);
  this._nativeCmd = nativeCmd;
  $container.on('click', targetId + ' > button', $.proxy(this._onClickCoachClose, this));

  this._setCoachMark();
};

Tw.CoachMark.prototype = {
  /**
   * @function
   * @desc 코치마크 확인 여부 요청
   * @private
   */
  _setCoachMark: function () {
    if ( this.$coachView.length > 0 ) {
      this._nativeService.send(Tw.NTV_CMD.LOAD, { key: this._nativeCmd }, $.proxy(this._onLoadCoach, this));
    }
  },

  /**
   * @function
   * @desc 코치마크 확인 여부 응답 처리
   * @param resp
   * @private
   */
  _onLoadCoach: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      if ( resp.params.value === 'N' ) {
        this.$coachView.removeClass('none');
      }
    } else {
      this.$coachView.removeClass('none');
    }
  },

  /**
   * @function
   * @desc 코치마크 닫기 버튼 클릭 이벤트 처리
   * @private
   */
  _onClickCoachClose: function () {
    this.$coachView.addClass('none');
    this.$focusTarget.focus();
    this._nativeService.send(Tw.NTV_CMD.SAVE, { key: this._nativeCmd, value: 'Y' });
  }
};
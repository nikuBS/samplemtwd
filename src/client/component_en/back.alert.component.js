/**
 * @file back.alert.component.js
 * @author Jayoon Kong
 * @since 2019.02.14
 * @desc 중요 화면에서 x 버튼 클릭 시 노출하는 공통 confirm
 */

/**
 * @namespace
 * @desc 중요 화면에서 x 버튼 클릭 시 노출하는 공통 confirm namespace
 * @param rootEl - dom 객체 (부모 페이지)
 * @param isPage
 */
Tw.BackAlert = function (rootEl, isPage) {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);

  this._isPage = isPage;
  this._isClose = false;
};

Tw.BackAlert.prototype = {
  /**
   * @function
   * @desc native back key 클릭 시 뒤로가기 처리 - 현재 사용하지 않음
   */
  init: function () {
    $(window).on(Tw.NATIVE_BACK, $.proxy(this.onClose, this));
  },
  /**
   * @function
   * @desc confirm
   */
  onClose: function () {
    this._popupService.openConfirmButton(Tw.ALERT_CANCEL.CONTENTS, Tw.ALERT_CANCEL.TITLE,
      $.proxy(this._closePop, this), $.proxy(this._closeCallback, this),
      Tw.BUTTON_LABEL.NO, Tw.BUTTON_LABEL.YES);
  },
  /**
   * @function
   * @desc confirm 확인 시 닫기 처리
   */
  _closePop: function () {
    this._isClose = true;

    if (this._isPage) {
      this._popupService.close();
    } else {
      this._popupService.closeAll();
    }
  },
  /**
   * @function
   * @desc close 이후 뒤로가기
   */
  _closeCallback: function () {
    if (this._isClose) {
      this._historyService.goBack();
    }
  }
};
/**
 * @file myt-fare.bill.small.set.use.js
 * @author Jayoon Kong
 * @since 2018.10.09
 * @desc 소액결제 사용 및 차단 설정
 */

/**
 * @namespace
 * @desc 소액결제 사용 및 차단 설정 namespace
 * @param rootEl - dom 객체
 * @param $target
 */
Tw.MyTFareBillSmallSetUse = function (rootEl, $target) {
  this.$container = rootEl;
  this.$target = $target;

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._commonHelper = Tw.CommonHelper;

  this._init();
};

Tw.MyTFareBillSmallSetUse.prototype = {
  /**
   * @function
   * @desc init (API call)
   */
  _init: function () {
    var id = this.$target.attr('id');

    this._apiService.request(Tw.API_CMD.BFF_05_0083, { rtnUseYn: id })
      .done($.proxy(this._changeSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  /**
   * @function
   * @desc API 응답 처리 (성공)
   * @param tx
   * @param res
   */
  _changeSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._getUseStatus(); // 성공 후 status 조회
    } else {
      this._fail(res);
    }
  },
  /**
   * @function
   * @desc API 응답 처리 (실패)
   * @param err
   */
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop(null, this.$target);
  },
  /**
   * @function
   * @desc 처리상태 조회 API 호출
   * @param tx
   */
  _getUseStatus: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0079, {})
      .done($.proxy(this._getSuccess, this))
      .fail($.proxy(this._fail, this));
  },
  /**
   * @function
   * @desc 처리상태 조회 API 응답 처리
   * @param tx
   * @param res
   */
  _getSuccess: function (res) {
    if (res.code === Tw.API_CODE.CODE_00) {
      this._setId(res.result.rtnUseYn);
      this._setToast();
    } else {
      this._fail(res);
    }
  },
  /**
   * @function
   * @desc set id
   * @param id
   */
  _setId: function (id) {
    this.$target.attr('id', id);
  },
  /**
   * @function
   * @desc set toast
   * @param tx
   */
  _setToast: function () {
    var message = this._getToastMessage();
    this._commonHelper.toast(message);
  },
  /**
   * @function
   * @desc get toast message
   * @param tx
   * @returns {string}
   */
  _getToastMessage: function () {
    var message = Tw.ALERT_MSG_MYT_FARE.MICRO_USE;

    if (this.$target.attr('checked') === 'checked') { // 사용
      // 허용되었습니다.
      message += Tw.ALERT_MSG_MYT_FARE.ALLOW + Tw.ALERT_MSG_MYT_FARE.MSG_DONE;
    } else {
      // 차단되었습니다.
      message += Tw.ALERT_MSG_MYT_FARE.PROHIBIT + Tw.ALERT_MSG_MYT_FARE.MSG_DONE;
    }

    return message;
  }
};

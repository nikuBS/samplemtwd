/**
 * @class
 * @param $container - 컨테이너 레이어
 */
Tw.XtractorService = function($container) {
  this.$container = $container;

  // Log
  Tw.Logger.info('[Xtractor] init container', this.$container);

  // Init
  setTimeout($.proxy(this._init, this), 500);

};

Tw.XtractorService.prototype = {

  /**
   * @function
   * @desc 최초 동작
   */
  _init: function() {
    this._loggedList = [];
    this._isScript = window.XtractorScript && window.XtractorScript.xtrCSDummy;

    this._bindBC();
    this._onLoadBV();
  },

  /**
   * @function
   * @desc 노출 처리
   */
  _onLoadBV: function() {
    _.each(this.$container.find('[data-xt_action="BV"]'), $.proxy(this._sendBV, this));
  },

  /**
   * @function
   * @desc 클릭 이벤트 바인딩
   */
  _bindBC: function() {
    this.$container.on('mousedown', '[data-xt_action="BC"],[data-xt_action2="BC"]', $.proxy(this._sendBC, this));
  },

  /**
   * @function
   * @desc 노출 이벤트 수행
   * @param elem - 노출 선언된 객체
   * @returns {boolean}
   */
  _sendBV: function(elem) {
    var $elem = $(elem),
      E_ID = $elem.data('xt_eid'),
      CS_ID = $elem.data('xt_csid');

    if (Tw.FormatHelper.isEmpty(E_ID) || Tw.FormatHelper.isEmpty(CS_ID)) {
      Tw.Logger.warn('[Xtractor] E_ID and CS_ID is required.', { E_ID: E_ID, CS_ID: CS_ID });
      return false;
    }

    this.logView(E_ID, CS_ID);
  },

  /**
   * @function
   * @desc 클릭 이벤트 수행
   * @param e - 클릭 이벤트
   * @returns {boolean}
   */
  _sendBC: function(e) {
    var $elem = $(e.currentTarget),
      E_ID = $elem.data('xt_eid'),
      CS_ID = $elem.data('xt_csid');

    if (Tw.FormatHelper.isEmpty(E_ID) || Tw.FormatHelper.isEmpty(CS_ID)) {
      Tw.Logger.warn('[Xtractor] E_ID and CS_ID is required.', { E_ID: E_ID, CS_ID: CS_ID });
      return false;
    }

    this.logClick(E_ID, CS_ID);
  },

  /**
   * @function
   * @desc 클릭 통계 수행
   * @param E_ID - Xtractor E_ID
   * @param CS_ID - Xtractor CS_ID
   * @returns {*|boolean}
   */
  logClick: function(E_ID, CS_ID) {
    return this._sendXtrCSDummy(E_ID, CS_ID, 'BC');
  },

  /**
   * @function
   * @desc 노출 통계 수행
   * @param E_ID - Xtractor E_ID
   * @param CS_ID - Xtractor CS_ID
   * @returns {*|boolean}
   */
  logView: function(E_ID, CS_ID) {
    return this._sendXtrCSDummy(E_ID, CS_ID, 'BV');
  },

  /**
   * @function
   * @desc 노출 이벤트 영역 직접 호출
   * @param $wrap - BV노출 이벤트를 처리할 영역
   */
  sendBVWrap: function($wrap) {
    _.each($wrap.find('[data-xt_action="BV"]'), $.proxy(this._sendBV, this));
  },

  /**
   * @function
   * @desc Xtractor CS 통계 수행
   * @param E_ID - Xtractor E_ID
   * @param CS_ID - Xtractor CS_ID
   * @param ACTION - Xtractor ACTION
   * @returns {boolean}
   */
  _sendXtrCSDummy: function(E_ID, CS_ID, ACTION) {
    var key = E_ID + '|' + CS_ID + '|' + ACTION;

    if (!this._isScript) {
      Tw.Logger.warn('[Xtractor] Logger is failed. Xtractor script is not found.');
      return false;
    }

    if (this._loggedList.indexOf(key) !== -1) {
      Tw.Logger.info('[Xtractor] this key already logged.');
      return false;
    }

    try {
      window.XtractorScript.xtrCSDummy(E_ID, CS_ID, ACTION);
      this._loggedList.push(key);
    } catch (e) {
      console.log(e);
    }
  }

};

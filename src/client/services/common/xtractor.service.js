/**
 * @class
 * @param $container - 컨테이너 레이어
 * @param isTosBanner - TOS 배너 여부
 */
Tw.XtractorService = function($container, isTosBanner) {
  this.$container = $container;
  this._isTosBanner = isTosBanner || false;

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
    this._isScript = this._isTosBanner && (window.XtractorEvent && window.XtractorEvent.xtrEvent) || !this._isTosBanner && (window.XtractorScript && window.XtractorScript.xtrCSDummy);

    this._bindBC();
    this._onLoadBV();
  },

  /**
   * @function
   * @desc 노출 처리
   */
  _onLoadBV: function() {
    if (this._isTosBanner) {
      _.each(this.$container.find('[data-xt_action="BN"]'), $.proxy(this._sendBV, this));
    } else {
      _.each(this.$container.find('[data-xt_action="BV"]'), $.proxy(this._sendBV, this));
    }
  },

  /**
   * @function
   * @desc 클릭 이벤트 바인딩
   */
  _bindBC: function() {
    if (this._isTosBanner) {
      this.$container.on('mousedown', '[data-xt_action="BN"]', $.proxy(this._sendBC, this));
    } else {
      this.$container.on('mousedown', '[data-xt_action="BC"],[data-xt_action2="BC"]', $.proxy(this._sendBC, this));
    }
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

    if (!this._isTosBanner && !Tw.FormatHelper.isEmpty(E_ID) && !Tw.FormatHelper.isEmpty(CS_ID)) {
      this.logView(E_ID, CS_ID);
    }

    /* TOS Banner */
    var BannerArgs = {
      CMPGN_NUM: $elem.data('xt_cmpgn_num'),
      EXEC_SCHD_NUM: $elem.data('xt_schd_num'),
      CELL_NUM: $elem.data('xt_cell_num'),
      MSG_SER_NUM: $elem.data('xt_msg_ser_num'),
      ACTION: 'Exp'
    };

    if (this._isTosBanner &&
      !Tw.FormatHelper.isEmpty(BannerArgs.CMPGN_NUM) &&
      !Tw.FormatHelper.isEmpty(BannerArgs.EXEC_SCHD_NUM) &&
      !Tw.FormatHelper.isEmpty(BannerArgs.CELL_NUM) &&
      !Tw.FormatHelper.isEmpty(BannerArgs.MSG_SER_NUM)) {
      this._sendXtrEvent($.param(BannerArgs));
    }
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

    if (!this._isTosBanner && !Tw.FormatHelper.isEmpty(E_ID) && !Tw.FormatHelper.isEmpty(CS_ID)) {
      this.logClick(E_ID, CS_ID);
    }

    /* TOS Banner */
    var BannerArgs = {
      CMPGN_NUM: $elem.data('xt_cmpgn_num'),
      EXEC_SCHD_NUM: $elem.data('xt_schd_num'),
      CELL_NUM: $elem.data('xt_cell_num'),
      MSG_SER_NUM: $elem.data('xt_msg_ser_num'),
      ACTION: 'Clk'
    };

    if (this._isTosBanner &&
      !Tw.FormatHelper.isEmpty(BannerArgs.CMPGN_NUM) &&
      !Tw.FormatHelper.isEmpty(BannerArgs.EXEC_SCHD_NUM) &&
      !Tw.FormatHelper.isEmpty(BannerArgs.CELL_NUM) &&
      !Tw.FormatHelper.isEmpty(BannerArgs.MSG_SER_NUM)) {
      this._sendXtrEvent($.param(BannerArgs));
    }
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
  },

  /**
   * @function
   * @desc Xtractor Event
   * @returns {boolean}
   */
  _sendXtrEvent: function(param) {
    if (!this._isScript) {
      Tw.Logger.warn('[Xtractor] Logger is failed. Xtractor script is not found.');
      return false;
    }

    if (this._loggedList.indexOf(param) !== -1) {
      Tw.Logger.info('[Xtractor] this param already logged.');
      return false;
    }

    try {
      window.XtractorEvent.xtrEvent(param);
      this._loggedList.push(param);
    } catch (e) {
      console.log(e);
    }
  }

};

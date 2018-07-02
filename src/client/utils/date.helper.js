Tw.DateHelper = (function() {
  var getDate = function() {
    var date = new Date();
    return date;
  };

  var getNextMonth = function () {
    var next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() +1);
    return next;
  };

  var getRemainDate = function () {
    var current = getDate();
    var next = getNextMonth();
    var remain = Math.floor((next.getTime() - current.getTime()) / 1000 / 60 / 60 / 24);
    return remain;
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 20180601
   */
  var getCurrentShortDate = function(){
    return moment().format('YYYYMMDD');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 20180601 - 1 year
   */
  var getPastYearShortDate = function(){
    return moment().subtract(1, 'years').format('YYYYMMDD');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01.
   */
  var getShortDate = function (date) {
    return moment(convDateFormat(date)).format('l');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01
   */
  var getShortDateNoDot = function (date) {
    return moment(convDateFormat(date)).format('YYYY.MM.DD');
  };

  /**
   * Convert Date Format (BFF string to Date)
   * @param {string} date
   * @returns {Date}
   */
  var convDateFormat = function(date) {
    if ( !(date instanceof Date) ) {
      return moment(date, 'YYYYMMDDhhmmss').toDate();
    }
    return date;
  };

  /**
   * Return Date width Format parameter
   * @param {date} date || {string} date, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  var getShortDateWithFormat = function(date, format) {
    return moment(date).format(format);
  }

  /**
   * Convert Date Format (BFF string to Date)
   * @param {date} date || {string} date, {number} amount, {string} unit, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  var getShortDateWithFormatAddByUnit = function(date, amount, unit, format) {
    return moment(date).add(amount, unit).format(format);
  }

  return {
    getRemainDate: getRemainDate,
    getShortDate: getShortDate,
    getShortDateNoDot: getShortDateNoDot,
    convDateFormat: convDateFormat,
    getCurrentShortDate: getCurrentShortDate,
    getPastYearShortDate: getPastYearShortDate,
    getShortDateWithFormat: getShortDateWithFormat,
    getShortDateWithFormatAddByUnit: getShortDateWithFormatAddByUnit
  }
})();
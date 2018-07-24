Tw.DateHelper = (function () {
  var getDate = function () {
    var date = new Date();
    return date;
  };

  var getNextMonth = function () {
    var next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return next;
  };

  var getRemainDate = function () {
    var current = getDate();
    var next = getNextMonth();
    var remain = Math.floor((next.getTime() - current.getTime()) / 1000 / 60 / 60 / 24);
    return remain;
  };

  /**
   * Convert Date Format (BFF string to Date)
   * @param {string} date
   * @returns {Date}
   */
  var convDateFormat = function (date) {
    if (!(date instanceof Date)) {
      return moment(date, 'YYYYMMDDhhmmss').toDate();
    }
    return date;
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 20180601
   */
  var getCurrentShortDate = function () {
    return moment().format('YYYYMMDD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 2018.06.01 12:00:00
   */
  var getCurrentDateTime = function () {
    return moment().format('YYYY.MM.DD hh:mm:ss');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : currentDateTime - 1 year
   */
  var getPastYearShortDate = function () {
    return moment().subtract(1, 'years').format('YYYYMMDD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : currentDateTime + 1 year
   */
  var getNextYearShortDate = function () {
    return moment().add(1, 'years').format('YYYY.MM.DD');
  };

  /**
   * @param period {period}
   * @returns {string} : currentDateTime - {period}
   */
  var getPastShortDate = function (period) {
    var matches = period.replace(/\s/g, '').match(/(\d*)(.*)/);

    if (matches.length !== 3)
      return null;

    var unit = '';
    switch (matches[2]) {
      case Tw.DATE_UNIT.YEAR:
        unit = 'years';
        break;
      case Tw.DATE_UNIT.MONTH:
        unit = 'months';
        break;
      default:
        unit = 'months';
        break;
    }

    return moment().subtract(matches[1], unit).format('YYYYMMDD');
  };

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
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 06.01
   */
  var getShortDateNoYear = function (date) {
    return moment(convDateFormat(date)).format('MM.DD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01 12:00
   */
  var getShortDateAndTime = function (date) {
    return moment(convDateFormat(date)).format('YYYY.MM.DD hh:mm');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01 12:00:00
   */
  var getFullDateAndTime = function (date) {
    return moment(convDateFormat(date)).format('YYYY.MM.DD hh:mm:ss');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018-06-02 11:59
   */
  var getAddDay = function (date) {
    return moment(convDateFormat(date))
      .add(1, 'days')
      .subtract(1, 'minutes')
      .format('YYYY.MM.DD hh:mm');
  };

  /**
   * Return Date width Format parameter
   * @param {date} date || {string} date, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  var getShortDateWithFormat = function (date, format, currentFormat) {
    return moment(date, currentFormat).format(format);
  };

  /**
   * Convert Date Format (BFF string to Date)
   * @param {date} date || {string} date, {number} amount, {string} unit, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  var getShortDateWithFormatAddByUnit = function (date, amount, unit, format, currentFormat) {
    return moment(date, currentFormat).add(amount, unit).format(format);
  };

  var getEndOfMonth = function (date, format, currentFormat) {
    var days = moment(date, currentFormat).daysInMonth();
    return moment(date, currentFormat).add(days - 1, 'days').format(format);
  };

  return {
    getRemainDate: getRemainDate,
    getShortDate: getShortDate,
    getShortDateNoDot: getShortDateNoDot,
    getShortDateNoYear: getShortDateNoYear,
    getShortDateAndTime: getShortDateAndTime,
    getFullDateAndTime: getFullDateAndTime,
    getAddDay: getAddDay,
    convDateFormat: convDateFormat,
    getCurrentShortDate: getCurrentShortDate,
    getCurrentDateTime: getCurrentDateTime,
    getPastYearShortDate: getPastYearShortDate,
    getNextYearShortDate: getNextYearShortDate,
    getEndOfMonth: getEndOfMonth,
    getPastShortDate: getPastShortDate,
    getShortDateWithFormat: getShortDateWithFormat,
    getShortDateWithFormatAddByUnit: getShortDateWithFormatAddByUnit
  };
})();
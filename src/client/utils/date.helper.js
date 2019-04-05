Tw.DateHelper = (function () {
  moment.locale('ko', {
    weekdaysMin: Tw.WEEKDAYS
  });

  /**
   * Convert Date Format (BFF string to Date)
   * @param {string} date
   * @returns {Date}
   */
  var convDateFormat = function (date) {
    if ( !date ) {
      return new Date();
    }
    if ( !(date instanceof Date) ) {
      return moment(date, 'YYYYMMDDhhmmss').toDate();
    }
    return date;
  };

  /**
   * Convert Date Format (formatted date to Date)
   * @param {string} date
   * @param {string} format
   * @returns {Date}
   */
  var convDateCustomFormat = function (date, format) {
    return moment(date, format).toDate();
  };

  /**
   * Get Date
   * @returns {Date}
   */
  var getDate = function () {
    var date = new Date();
    return date;
  };

  /**
   * Get first day of next month
   * @returns {Date}
   */
  var getNextMonth = function () {
    var next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return next;
  };

  /**
   * Get remain days to last day of this month
   * @returns {Date}
   */
  var getRemainDate = function () {
    var current = getDate();
    var next = getNextMonth();
    var remain = Math.floor((next.getTime() - current.getTime()) / 1000 / 60 / 60 / 24);
    return remain;
  };

  /**
   * Get remain days to the given date
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {number} : 30
   */
  var getNewRemainDate = function (date) {
    return moment(this.convDateFormat(date)).diff(new Date(), 'day') + 2;
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 20180601
   */
  var getCurrentShortDate = function (date) {
    return moment(this.convDateFormat(date)).format('YYYYMMDD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 201806
   */
  var getYearMonth = function (date) {
    return moment(this.convDateFormat(date)).format('YYYYM');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 2018.06.01 12:00:00
   */
  var getCurrentDateTime = function (format) {
    return moment().format(format || 'YYYY.MM.DD hh:mm:ss');
  };

  /**
   * @param none
   * @returns {string} : 12
   */
  var getCurrentMonth = function (date) {
    return moment(this.convDateFormat(date)).format('M');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss or none
   * @returns {string} : 2018
   */
  var getCurrentYear = function (date) {
    return moment(this.convDateFormat(date)).format('YYYY');
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
   * @returns {string} : currentDateTime - 6 months
   */
  var getPast6MonthsShortDate = function () {
    return moment().subtract(6, 'months').format('YYYYMMDD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : currentDateTime + 1 year
   */
  var getNextYearShortDate = function () {
    return moment().add(1, 'years').format('YYYY.M.D.');
  };

  /**
   * @param period {period}
   * @returns {string} : currentDateTime - {period}
   */
  var getPastShortDate = function (period) {
    var matches = period.replace(/\s/g, '').match(/(\d*)(.*)/);

    if ( matches.length !== 3 )
      return null;

    var unit = '';
    switch ( matches[2] ) {
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
   * @returns {string} : 2018.6.1.
   */
  var getShortDate = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D.');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1
   */
  var getShortDateNoDot = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1 (first date of this month)
   */
  var getShortFirstDateNoDot = function (date) {
    return moment(this.convDateFormat(date)).date(1).format('YYYY.M.D');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. (first date of this month)
   */
  var getShortFirstDate = function (date) {
    return moment(this.convDateFormat(date)).date(1).format('YYYY.M.D.');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. (last date of this month)
   */
  var getShortLastDate = function (date) {
    return moment(this.convDateFormat(date)).add('months', 1).date(0).format('YYYY.M.D.');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.05
   */
  var getShortDateNoDate = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 06.01
   */
  var getShortDateNoYear = function (date) {
    return moment(convDateFormat(date)).format('M.DD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00
   */
  var getShortDateAndTime = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D. hh:mm');
  };
  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00:00
   */
  var getFullDateAndTime = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D. hh:mm:ss');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00:00
   */
  var getFullDateAnd24Time = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D. HH:mm:ss');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018-06-02 11:59
   */
  var getAddDay = function (date, format) {
    return moment(convDateFormat(date))
      .add(1, 'days')
      .subtract(1, 'minutes')
      .format(format || 'YYYY.MM.DD hh:mm');
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
    return moment(date.slice(0, 6) + days, currentFormat).format(format);
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018년 12월 31일
   */
  var getFullKoreanDate = function (date) {
    return moment(convDateFormat(date)).format('YYYY년 M월 DD일');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 18년 12월 31일
   */
  var getShortKoreanDate = function (date) {
    return moment(convDateFormat(date)).format('YY년 M월 DD일');
  };

  /**
   * @input 12월
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 11월 | 18년12월
   */
  var getShortKoreanAfterMonth = function (date, isYear) {
    var opt = 'M월';
    if ( isYear ) {
      opt = 'YY년M월';
    }
    return moment(convDateFormat(date)).add('1', 'months').format(opt);
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 12월 | 18년12월
   */
  var getShortKoreanMonth = function (date, isYear) {
    var opt = 'M월';
    if ( isYear ) {
      opt = 'YY년M월';
    }
    return moment(convDateFormat(date)).format(opt);
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @param {string} : 10월 9일 화요일
   */
  var getKoreanDateWithDay = function (date) {
    return moment(this.convDateFormat(date)).locale('ko').format('MMM Do dddd');
  };

  /** 
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @param {string} : 오후 2시 11분
   */
  var getKoreanTime = function (date) {
    return moment(this.convDateFormat(date)).locale('ko').format('a h시 m분');
  };

  /** 
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @param {string} : 월
   */  
  var getDayOfWeek = function (date) {
    return moment(convDateFormat(date)).format('dd');
  };

  var getDiffByUnit = function (sdate, edate, unit) {
    return moment(sdate).diff(edate, unit);
  };

  var isValid = function (date) {
    return moment(date).isValid();
  };

  var getStartOfMonSubtractDate = function (date, subStr, format) {
    return moment(this.convDateFormat(date)).subtract(subStr, 'months').startOf('month').format(format);
  };

  var getEndOfMonSubtractDate = function (date, subStr, format) {
    return moment(this.convDateFormat(date)).subtract(subStr, 'months').endOf('month').format(format);
  };

  var getStartOfMonDate = function (date, format) {
    return moment(this.convDateFormat(date)).startOf('month').format(format);
  };

  var getEndOfMonDate = function (date, format) {
    return moment(this.convDateFormat(date)).endOf('month').format(format);
  };

  /**
   * Get difference end date to start date
   * @param endDate {date} or {string}, startDate {date} or {string}
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  var getDifference = function (endDate, startDate) {
    return moment(endDate).diff(startDate || new Date());
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : YYYYMMDD
   */
  var AddMonth = function (date) {
    return moment(convDateFormat(date))
      .add(1, 'month')
      .format('YYYYMMDD');
  };

  var isBefore = function (date) {
    return moment(date).isBefore(new Date());
  };

  var getTomorrowDate = function () {
    return moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
  };

  var getDateCustomFormat = function (format) {
    return moment().format(format);
  };

  var add5min = function(date) {
    return moment(this.convDateFormat(date)).add(5, 'minutes').format('YYYYMMDDHHmmss');
  };

  var getRemainedSec = function(startTime, diff) {
    diff = diff || Tw.SMS_CERT_TIME;
    var currentTime = new Date().getTime();
    var passed = currentTime - startTime.getTime();
    var remained = Math.round((diff - passed) / 1000);
    remained = remained > 0 ? remained : 0;

    return remained;
  };

  var convertMinSecFormat = function (target) {
    var min = parseInt(target / 60, 10);
    var sec = target % 60;

    min = min < 10 ? '0' + min : min;
    sec = sec < 10 ? '0' + sec : sec;

    return min + '분 ' + sec + '초';
  };


  return {
    getRemainDate: getRemainDate,
    getNewRemainDate: getNewRemainDate,
    getShortDate: getShortDate,
    getShortFirstDate: getShortFirstDate,
    getShortDateNoDot: getShortDateNoDot,
    getShortFirstDateNoDot: getShortFirstDateNoDot,
    getShortLastDate: getShortLastDate,
    getShortDateNoDate: getShortDateNoDate,
    getShortDateNoYear: getShortDateNoYear,
    getShortDateAndTime: getShortDateAndTime,
    getFullDateAndTime: getFullDateAndTime,
    getFullDateAnd24Time: getFullDateAnd24Time,
    getAddDay: getAddDay,
    convDateFormat: convDateFormat,
    convDateCustomFormat: convDateCustomFormat,
    getCurrentShortDate: getCurrentShortDate,
    getYearMonth: getYearMonth,
    getCurrentDateTime: getCurrentDateTime,
    getCurrentMonth: getCurrentMonth,
    getCurrentYear: getCurrentYear,
    getPastYearShortDate: getPastYearShortDate,
    getPast6MonthsShortDate: getPast6MonthsShortDate,
    getNextYearShortDate: getNextYearShortDate,
    getEndOfMonth: getEndOfMonth,
    getPastShortDate: getPastShortDate,
    getShortDateWithFormat: getShortDateWithFormat,
    getShortDateWithFormatAddByUnit: getShortDateWithFormatAddByUnit,
    getDayOfWeek: getDayOfWeek,
    getDiffByUnit: getDiffByUnit,
    getFullKoreanDate: getFullKoreanDate,
    getShortKoreanDate: getShortKoreanDate,
    getShortKoreanAfterMonth: getShortKoreanAfterMonth,
    getShortKoreanMonth: getShortKoreanMonth,
    getKoreanDateWithDay: getKoreanDateWithDay,
    getKoreanTime: getKoreanTime,
    isValid: isValid,
    getStartOfMonSubtractDate: getStartOfMonSubtractDate,
    getEndOfMonSubtractDate: getEndOfMonSubtractDate,
    getStartOfMonDate: getStartOfMonDate,
    getEndOfMonDate: getEndOfMonDate,
    getDifference: getDifference,
    getTomorrowDate: getTomorrowDate,
    AddMonth: AddMonth,
    isBefore: isBefore,
    getDateCustomFormat : getDateCustomFormat,
    add5min: add5min,
    getRemainedSec: getRemainedSec,
    convertMinSecFormat: convertMinSecFormat
  };
})();
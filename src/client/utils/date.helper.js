Tw.DateHelper = (function () {
  moment.locale('ko', {
    weekdaysMin: Tw.WEEKDAYS
  });

  /**
   * @desc Convert Date Format (BFF string to Date)
   * @param {string} date
   * @returns {Date}
   * @public
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
   * @desc Convert Date Format (formatted date to Date)
   * @param {string} date
   * @param {string} format
   * @returns {Date}
   * @public
   */
  var convDateCustomFormat = function (date, format) {
    return moment(date, format).toDate();
  };

  /**
   * @desc Get Date
   * @returns {Date}
   * @public
   */
  var getDate = function () {
    var date = new Date();
    return date;
  };

  /**
   * @desc Get remain days to the given date
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {number} : 30
   * @public
   */
  var getNewRemainDate = function (date) {
    return moment(this.convDateFormat(date)).diff(new Date(), 'day') + 2;
  };

  /**
   * @param {Date or string} date YYYYMMDD
   * @returns {string} : 20180601
   * @public
   */
  var getCurrentShortDate = function (date) {
    return moment(this.convDateFormat(date)).format('YYYYMMDD');
  };

  /**
   * @param {Date or string} date YYYYMMDD
   * @returns {string} : 2018.06.01 12:00:00
   * @public
   */
  var getCurrentDateTime = function (format) {
    return moment().format(format || 'YYYY.MM.DD hh:mm:ss');
  };

  /**
   * @param none
   * @returns {string} : 12
   * @public
   */
  var getCurrentMonth = function (date) {
    return moment(this.convDateFormat(date)).format('M');
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss or none
   * @returns {string} : 2018
   * @public
   */
  var getCurrentYear = function (date) {
    return moment(this.convDateFormat(date)).format('YYYY');
  };

  /**
   * @param {Date or string} date YYYYMMDD
   * @returns {string} : currentDateTime - 1 year
   * @public
   */
  var getPastYearShortDate = function () {
    return moment().subtract(1, 'years').format('YYYYMMDD');
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1.
   * @public
   */
  var getShortDate = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D.');
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1
   * @public
   */
  var getShortDateNoDot = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D');
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1 (first date of this month)
   * @public
   */
  var getShortFirstDateNoDot = function (date) {
    return moment(this.convDateFormat(date)).date(1).format('YYYY.M.D');
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. (first date of this month)
   * @public
   */
  var getShortFirstDate = function (date) {
    return moment(this.convDateFormat(date)).date(1).format('YYYY.M.D.');
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00
   * @public
   */
  var getShortDateAndTime = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D. hh:mm');
  };
  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00:00
   * @public
   */
  var getFullDateAndTime = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D. hh:mm:ss');
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00:00
   * @public
   */
  var getFullDateAnd24Time = function (date) {
    return moment(convDateFormat(date)).format('YYYY.M.D. HH:mm:ss');
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018-06-02 11:59
   * @public
   */
  var getAddDay = function (date, format) {
    return moment(convDateFormat(date))
      .add(1, 'days')
      .subtract(1, 'minutes')
      .format(format || 'YYYY.MM.DD hh:mm');
  };

  /**
   * @des Return Date with Format parameter
   * @param {date} date || {string} date, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   * @public
   */
  var getShortDateWithFormat = function (date, format, currentFormat) {
    return moment(date, currentFormat).format(format);
  };

  /**
   * @desc Convert Date Format (BFF string to Date)
   * @param {date} date || {string} date, {number} amount, {string} unit, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   * @public
   */
  var getShortDateWithFormatAddByUnit = function (date, amount, unit, format, currentFormat) {
    return moment(date, currentFormat).add(amount, unit).format(format);
  };

  var getEndOfMonth = function (date, format, currentFormat) {
    var days = moment(date, currentFormat).daysInMonth();
    return moment(date.slice(0, 6) + days, currentFormat).format(format);
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 2018년 12월 31일
   * @public
   */
  var getFullKoreanDate = function (date) {
    return moment(convDateFormat(date)).format('YYYY년 M월 DD일');
  };

  /**
   * @desc Get next month in korean
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 11월 | 18년12월
   * @public
   */
  var getShortKoreanAfterMonth = function (date, isYear) {
    var opt = 'M월';
    if ( isYear ) {
      opt = 'YY년M월';
    }
    return moment(convDateFormat(date)).add('1', 'months').format(opt);
  };

  /**
   * * @desc Get month in korean
   * @param {Date or string} date YYYYMMDD
   * @returns {string} : 12월 | 18년12월
   * @public
   */
  var getShortKoreanMonth = function (date, isYear) {
    var opt = 'M월';
    if ( isYear ) {
      opt = 'YY년M월';
    }
    return moment(convDateFormat(date)).format(opt);
  };

  /**
   * @desc Get date in korean
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 10월 9일 화요일
   * @public
   */
  var getKoreanDateWithDay = function (date) {
    return moment(this.convDateFormat(date)).locale('ko').format('MMM Do dddd');
  };

  /** 
   * @desc Get time in korean
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 오후 2시 11분
   * @public
   */
  var getKoreanTime = function (date) {
    return moment(this.convDateFormat(date)).locale('ko').format('a h시 m분');
  };

  /** 
   * @desc Get day of week
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : 월
   */
  var getDayOfWeek = function (date) {
    return moment(convDateFormat(date)).format('dd');
  };

  /**
   * @desc Get difference between start date and end date
   * @param {Date or string} sdate start date
   * @param {Date or string} edate end date
   * @param {string} unit 
   * @public
   */
  var getDiffByUnit = function (sdate, edate, unit) {
    return moment(sdate).diff(edate, unit);
  };

  /**
   * @desc whether is valid or not
   * @param {Date or string} date YYYYMMDDhhmmss
   * @public
   */
  var isValid = function (date) {
    return moment(date).isValid();
  };

  var getEndOfMonSubtractDate = function (date, subStr, format) {
    return moment(this.convDateFormat(date)).subtract(subStr, 'months').endOf('month').format(format);
  };

  /**
   * @desc Get difference between end date and start date
   * @param {Date or string} endDate YYYYMMDDhhmmss
   * @returns {number} milliseconds
   * @public
   */
  var getDifference = function (endDate, startDate) {
    return moment(endDate).diff(startDate || new Date());
  };

  /**
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : YYYYMMDD
   * @public
   */
  var AddMonth = function (date) {
    return moment(convDateFormat(date))
      .add(1, 'month')
      .format('YYYYMMDD');
  };

  /**
   * @desc whether is before of not
   * @param {Date or string} date YYYYMMDDhhmmss
   * @returns {string} : YYYYMMDD
   * @public
   */
  var isBefore = function (date) {
    return moment(date).isBefore(new Date());
  };

  /**
   * @desc get tomorrow
   * @returns {string} YYYY-MM-DD
   * @public
   */
  var getTomorrowDate = function () {
    return moment(new Date()).add(1, 'days').format('YYYY-MM-DD');
  };

  /**
   * @desc get date with format
   * @param {string} format 
   * @returns {string} formatted date
   * @public
   */
  var getDateCustomFormat = function (format) {
    return moment().format(format);
  };

  /**
   * @desc add 5 minutes
   * @param {Date or string} date 
   * @returns {string} : YYYYMMDD
   * @public
   */
  var add5min = function(date) {
    return moment(this.convDateFormat(date)).add(5, 'minutes').format('YYYYMMDDHHmmss');
  };

  /**
   * @desc Get remained seconds
   * @param {Date} startTime 
   * @param {number} diff 
   * @returns {number} milliseconds
   * @public
   */
  var getRemainedSec = function(startTime, diff) {
    diff = diff || Tw.SMS_CERT_TIME;
    var currentTime = new Date().getTime();
    var passed = currentTime - startTime.getTime();
    var remained = Math.round((diff - passed) / 1000);
    remained = remained > 0 ? remained : 0;

    return remained;
  };

  /**
   * @desc get remained time in korean
   * @param {number} target milliseconds
   * @returns {string} mm분 ss초
   * @public
   */
  var convertMinSecFormat = function (target) {
    var min = parseInt(target / 60, 10);
    var sec = target % 60;

    min = min < 10 ? '0' + min : min;
    sec = sec < 10 ? '0' + sec : sec;

    return min + '분 ' + sec + '초';
  };


  return {
    getNewRemainDate: getNewRemainDate,
    getShortDate: getShortDate,
    getShortFirstDate: getShortFirstDate,
    getShortDateNoDot: getShortDateNoDot,
    getShortFirstDateNoDot: getShortFirstDateNoDot,
    getShortDateAndTime: getShortDateAndTime,
    getFullDateAndTime: getFullDateAndTime,
    getFullDateAnd24Time: getFullDateAnd24Time,
    getAddDay: getAddDay,
    convDateFormat: convDateFormat,
    convDateCustomFormat: convDateCustomFormat,
    getCurrentShortDate: getCurrentShortDate,
    getCurrentDateTime: getCurrentDateTime,
    getCurrentMonth: getCurrentMonth,
    getCurrentYear: getCurrentYear,
    getPastYearShortDate: getPastYearShortDate,
    getEndOfMonth: getEndOfMonth,
    getShortDateWithFormat: getShortDateWithFormat,
    getShortDateWithFormatAddByUnit: getShortDateWithFormatAddByUnit,
    getDayOfWeek: getDayOfWeek,
    getDiffByUnit: getDiffByUnit,
    getFullKoreanDate: getFullKoreanDate,
    getShortKoreanAfterMonth: getShortKoreanAfterMonth,
    getShortKoreanMonth: getShortKoreanMonth,
    getKoreanDateWithDay: getKoreanDateWithDay,
    getKoreanTime: getKoreanTime,
    isValid: isValid,
    getEndOfMonSubtractDate: getEndOfMonSubtractDate,
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

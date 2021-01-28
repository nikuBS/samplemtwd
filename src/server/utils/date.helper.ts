import moment from 'moment';

moment.locale('ko'); // set 'ko' timezone

class DateHelper {
  /**
   * Convert Date Format (BFF string to Date)
   * @param {string} date
   * @returns {Date}
   */
  static convDateFormat(date: any): Date {
    if (date === undefined) {
      return new Date();
    }
    if (!(date instanceof Date)) {
      return moment(date, 'YYYYMMDDhhmmss').toDate();
    }
    return date;
  }


  /**
   * @function
   * @desc Get current date
   * @returns {Date}
   * @public
   */
  static getCurrentDate(): any {
    return new Date();
  }

  /**
   * @function
   * @desc Convert to date object
   * @param {string|Date} date
   * @param {string} format
   * @public
   */
  static convDateCustomFormat(date: any, format: string): Date {
    return moment(date, format).toDate();
  }

  /**
   * @function
   * @desc get first date of next month
   * @returns {Date}
   * @public
   */
  static getNextMonth(): Date {
    const next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  /**
   * @function
   * @desc get month before given months
   * @param {Date|string} date YYYYMMDDhhmmss
   * @param {number} before months
   * @returns {string} : 6
   * @public
   */
  static getFromCurrentPrevMonth(date: any, before: number): string {
    return moment(this.convDateFormat(date)).add(-before, 'months').format('M');
  }

  /**
   * @function
   * @desc get year before given months
   * @param {Date|string} date YYYYMMDDhhmmss
   * @param {number} before months
   * @returns {string} : 6
   * @public
   */
  static getFromCurrentPrevYear(date: any, before: number): string {
    return moment(this.convDateFormat(date)).add(-before, 'months').format('YYYY');
  }

  /**
   * @function
   * @desc get formatted date
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 20180601
   * @public
   */
  static getCurrentShortDate(date?: any): string {
    return moment(this.convDateFormat(date)).format('YYYYMMDD');
  }

  /**
   * @function
   * @desc get first date of next month
   * @param {Date|string} date YYYYMMDDhhmmss
   * @return {string} : 2018.6.
   * @public
   */
  static getYearNextMonthFromDate(date: Date | string): string {
    const next = this.convDateFormat(date);
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return moment(next).format('YYYY.M.');
  }

  /**
   * @function
   * @desc get first date of next month without last dot
   * @param {Date|string} date YYYYMMDDhhmmss
   * @return {string} : 2018.6
   * @public
   */
  static getYearNextNoDotMonthFromDate(date: Date | string): string {
    const next = this.convDateFormat(date);
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return moment(next).format('YYYY.M');
  }

  /**
   * @function
   * @desc get formatted date
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01 12:00:00
   * @public
   */
  static getCurrentDateTime = function (format) {
    return moment().format(format || 'YYYY.M.DD hh:mm:ss');
  };

  /**
   * @function
   * @desc get month from date
   * @param {Date|string} date YYYYMMDDhhmmss|none
   * @returns {string} : 12
   */
  static getCurrentMonth(date?: any): string {
    return moment(this.convDateFormat(date)).format('M');
  }

  /**
   * @function
   * @desc get year from date
   * @param {Date|string} date YYYYMMDDhhmmss|none
   * @returns {string} : 2018
   * @public
   */
  static getCurrentYear(date?: any): string {
    return moment(this.convDateFormat(date)).format('YYYY');
  }

  /**
   * @function
   * @desc get a date before 1 year
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : currentDateTime - 1 year
   * @public
   */
  static getPastYearShortDate = function () {
    return moment().subtract(1, 'years').format('YYYYMMDD');
  };

  /**
   * @function
   * @desc get a date before 6 months
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : currentDateTime - 6 months
   * @public
   */
  static getPast6MonthsShortDate = function () {
    return moment().subtract(6, 'months').format('YYYYMMDD');
  };

  /**
   * @function
   * @desc get a date after 1 year
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : currentDateTime + 1 year
   * @public
   */
  static getNextYearShortDate = function () {
    return moment().add(1, 'years').format('YYYY.M.D.');
  };

  /**
   * @function
   * @desc get a date in korean
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018년 12월 31일
   * @public
   */
  static getKoreanDate(date: any): string {
    return moment(this.convDateFormat(date)).format('LL');
  }

  /**
   * @function
   * @desc get month in korean
   * @param {Date|string} date YYYYMMDDhhmmss
   * @param {boolean} incYear include year number to result
   * @returns {string} : 12월
   * @public
   */
  static getShortKoreanMonth(date: any, incYear?: boolean): string {
    return moment(this.convDateFormat(date)).format(incYear ? 'YY년M월' : 'M월');
  }

  /**
   * @function
   * @desc get formatted date
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1.
   * @public
   */
  static getShortDate(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY.M.D.');
  }

  /**
   * @function
   * @desc get formatted date without last dot
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1
   * @public
   */
  static getShortDateNoDot(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY.M.D');
  }

  /**
   * @function
   * @desc get formatted date
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1
   * @public
   */
  static getDashShortDateNoDot(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY-MM-DD');
  }

  /**
   * @function
   * @desc get first day of the month from given date
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1
   * @public
   */
  static getShortFirstDate(date: any): string {
    return moment(this.convDateFormat(date)).date(1).format('YYYY.M.D.');
  }

  /**
   * @function
   * @desc get last day of the month from given date
   * @param date {Date}|{string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. (last date of this month)
   * @public
   */
  static getShortLastDate(date: any) {
    return moment(this.convDateFormat(date)).add(1, 'months').date(0).format('YYYY.M.D.');
  }

  /**
   * @function
   * @desc get date and time
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00
   * @public
   */
  static getShortDateAndTime(date) {
    return moment(this.convDateFormat(date)).format('YYYY.M.D. hh:mm');
  }

  /**
   * @function
   * @desc get date and time with 24 hour format
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00
   * @public
   */
  static getShortDateAnd24Time(date) {
    return moment(this.convDateFormat(date)).format('YYYY.M.D. HH:mm');
  }

  /**
   * @function
   * @desc get date and time
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1 12:00:00
   * @public
   */
  static getFullDateAndTime(date) {
    return moment(this.convDateFormat(date)).format('YYYY.M.D. hh:mm:ss');
  }

  /**
   * @function
   * @desc get date and time with 24 hour format
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1 12:00:00
   * @public
   */
  static getFullDateAnd24Time(date) {
    return moment(this.convDateFormat(date)).format('YYYY.M.D. HH:mm:ss');
  }

  /**
   * @function
   * @desc get next day
   * @param {Date|string} date YYYYMMDDhhmmss
   * @param format
   * @returns {string} : 2018-06-02 11:59
   * @public
   */
  static getAddDay(date, format = 'YYYY.M.DD hh:mm') {
    return moment(this.convDateFormat(date))
      .add(1, 'days')
      .subtract(1, 'minutes')
      .format(format);
  }

  /**
   * @function
   * @desc get formatted date
   * @param {date} date || {string} date, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   * @public
   */
  static getShortDateWithFormat(date: any, format: string, currentFormat?: any): any {
    return moment(this.convDateFormat(date), currentFormat).format(format);
  }

  /**
   * @function
   * @desc get day after given days
   * @param {date} date || {string} date, {number} amount, {string} unit, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   * @public
   */
  static getShortDateWithFormatAddByUnit(date: any, amount: any, unit: any, format: string): string {
    return moment(date).add(amount, unit).format(format);
  }

  /**
   * @function
   * @desc get difference between two days
   * @param {date} date || {string} date, {number} amount, {string} unit, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   * @public
   */
  static getDifference(endDate: string, startDate?: string): number {
    return moment(endDate).diff(startDate || new Date());
  }

  /**
   * @param {string} date, {string} subStr, {string} format
   * @returns {Date}
   */
  static getStartOfMonSubtractDate(date: any, subStr: string, format: string): any {
    return moment(this.convDateFormat(date)).subtract(subStr, 'months').startOf('month').format(format);
  }

  static getEndOfMonSubtractDate(date: any, subStr: string, format: string): any {
    return moment(this.convDateFormat(date)).subtract(subStr, 'months').endOf('month').format(format);
  }

  /**
   * @function
   * @desc get first day of given date with format
   * @param {any} date, {string} format
   * @returns {Date}
   * @public
   */
  static getStartOfMonDate(date: any, format: string): any {
    return moment(this.convDateFormat(date)).startOf('month').format(format);
  }

  /**
   * @function
   * @desc get last day of given date with format
   * @param {any} date, {string} format
   * @returns {Date}
   * @public
   */
  static getEndOfMonDate(date: any, format: string): any {
    return moment(this.convDateFormat(date)).endOf('month').format(format);
  }

  /**
   * @function
   * @desc get difference between two days
   * @param {string} endDate, {string} startDate, {any} unit
   * @returns {number}
   * @public
   */
  static getDiffByUnit(endDate: string, startDate: string, unit: any): number {
    return moment(endDate).diff(startDate, unit);
  }

  /**
   * @function
   * @dest get d-day
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {number} : 30
   * @public
   */
  static getDday(date: any): number {
    return moment(date).diff(this.getCurrentShortDate(new Date()), 'day');
  }

  /**
   * @function
   * @desc get date and time after 5 minutes
   * @param {string|Date} date
   * @public
   */
  static add5min(date: any): any {
    return moment(this.convDateFormat(date)).add(5, 'minutes').format('YYYYMMDDHHmmss');
  }

  /**
   * @function
   * @desc get next day
   * @param {Date|string} date YYYYMMDDhhmmss
   * @param format
   * @returns {string} : 2019-07-11
   * @public
   */
  static getAddDays(date, days, format) {
    return moment(this.convDateFormat(date))
      .add(days, 'days')
      .format(format);
  }

  /**
   * @function
   * @desc 현재 날짜를 기준으로 목표 나이가 만 targetAge 미만인 지 여부를 T/F 반환 (미만이면 TRUE)
   * @param {number} targetAge 목표 나이
   * @param {string} birthday 대상자의 생년월일, YYYYMMDD
   */
  static isUnderAge(targetAge, birthday) {
    return targetAge > moment(this.getCurrentShortDate()).diff(birthday, 'year');
  }

  /**
   * @desc Get time in korean
   * @param {Date|string} date YYYYMMDDhhmmss
   * @returns {string} : 오후 2시 11분
   * @public
   */
  static getKoreanTime(date: any) {
    return moment(this.convDateFormat(date)).format('a h시 m분');
  }

  /**
   * @desc 대상 날짜가 시작날짜와 종료 날짜 사이에 있는지 여부
   * @param {date|string} target 대상날짜
   * @param {date|string} start 시작날짜
   * @param {date|string} end 종료날짜
   * @returns {boolean} true | false
   * @public
   */
  static isBetween(target, start, end) {
    if ( !target || !start || !end ) {
      throw new Error('[date.helper]\', \'invalid value!!');
    }
    target = this.convDateFormat(target);
    start = this.convDateFormat(start);
    end = this.convDateFormat(end);
    return moment(target).isBetween(start, end, undefined, '[]');
  }

  /**
   * @desc 이전날짜인지 여부
   * @param {date|string} sDate 시작일자
   * @param {date|string} eDate 종료일자
   */
  static isBefore(sDate, eDate): boolean {
    return moment(sDate).isBefore(eDate);
  }
}

export default DateHelper;

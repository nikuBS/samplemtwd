import moment from 'moment';

moment.locale('ko'); // set 'ko' timezone

class DateHelper {
  /**
   * Convert Date Format (BFF string to Date)
   * @param {string} date
   * @returns {Date}
   */
  static convDateFormat(date: any): Date {
    if ( date  === undefined ) {
      return new Date();
    }
    if ( !(date instanceof Date) ) {
      return moment(date, 'YYYYMMDDhhmmss').toDate();
    }
    return date;
  }

  static getCurrentDate(): any {
    return new Date();
  }

  static getNextMonth(): any {
    const next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  static getRemainDate(): number {
    const current = DateHelper.getCurrentDate();
    const next = DateHelper.getNextMonth();
    const remain = Math.floor((next.getTime() - current.getTime()) / 1000 / 60 / 60 / 24);
    return remain;
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 20180601
   */
  static getCurrentShortDate(date?: any): string {
    return moment(this.convDateFormat(date)).format('YYYYMMDD');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 201806
   */
  static getYearMonth(date) {
    return moment(this.convDateFormat(date)).format('YYYYMM');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 2018.06.01 12:00:00
   */
  static getCurrentDateTime = function (format) {
    return moment().format(format || 'YYYY.MM.DD hh:mm:ss');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss or none
   * @returns {string} : 12
   */
  static getCurrentMonth(date?: any): string {
    return moment(this.convDateFormat(date)).format('M');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss or none
   * @returns {string} : 2018
   */
  static getCurrentYear(date?: any): string {
    return moment(this.convDateFormat(date)).format('YYYY');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : currentDateTime - 1 year
   */
  static getPastYearShortDate = function () {
    return moment().subtract(1, 'years').format('YYYYMMDD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : currentDateTime + 1 year
   */
  static getNextYearShortDate = function () {
    return moment().add(1, 'years').format('YYYY.MM.DD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 18년 12월 31일
   */
  static getShortKoreanDate(date: any): string {
    return moment(this.convDateFormat(date)).format('YY년 MM월 DD일');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 12월
   */
  static getShortKoreanMonth(date: any): string {
    return moment(this.convDateFormat(date)).format('MM월');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @param {string} : 10월 9일 화요일
   */
  static getKoreanDateWithDay(date: any): string {
    return moment(this.convDateFormat(date)).format('MMM Do dddd');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @param {string} : 오전 10시 9분
   */
  static getKoreanTime(date: any): string {
    return moment(this.convDateFormat(date)).format('a h시 m분');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {number} : 30
   */
  static getNewRemainDate(date: any): number {
    return moment(this.convDateFormat(date)).diff(new Date(), 'day') + 2;
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01.
   */
  static getShortDate(date: any): string {
    return moment(this.convDateFormat(date)).format('l');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01
   */
  static getShortDateNoDot(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY.MM.DD');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01 (first date of this month)
   */
  static getShortFirstDateNoNot(date: any): string {
    const curDate = this.convDateFormat(date);
    const firstDate = new Date(curDate.setDate(1));
    return moment(firstDate).format('YYYY.MM.DD');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 06.01
   */
  static getShortDateNoYear(date: any): string {
    return moment(this.convDateFormat(date)).format('MM.DD');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01 12:00
   */
  static getShortDateAndTime(date) {
    return moment(this.convDateFormat(date)).format('YYYY.MM.DD hh:mm');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.06.01 12:00:00
   */
  static getFullDateAndTime(date) {
    return moment(this.convDateFormat(date)).format('YYYY.MM.DD hh:mm:ss');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018-06-02 11:59
   */
  static getAddDay(date) {
    return moment(this.convDateFormat(date))
      .add(1, 'days')
      .subtract(1, 'minutes')
      .format('YYYY.MM.DD hh:mm');
  }

  /**
   * Return Date width Format parameter
   * @param {date} date || {string} date, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  static getShortDateWithFormat(date: any, format: string, currentFormat?: any): any {
    return moment(this.convDateFormat(date), currentFormat).format(format);
  }

  /**
   * Convert Date Format (BFF string to Date)
   * @param {date} date || {string} date, {number} amount, {string} unit, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  static getShortDateWithFormatAddByUnit(date: any, amount: any, unit: any, format: string): string {
    return moment(date).add(amount, unit).format(format);
  }

  static getEndOfMonth(date: any, format: string, currentFormat?: string): string {
    const days = moment(date, currentFormat).daysInMonth();
    return moment(date.slice(0, 6) + days, currentFormat).format(format);
  }

  /**
   * Convert Date Format (BFF string to Date)
   * @param {date} date || {string} date, {number} amount, {string} unit, {string} format
   * @returns {Date} : YYMMDD, YYYYMMDD, YY.MM.DD
   */
  static getDifference(endDate: string, startDate?: string): number {
    return moment(endDate).diff(startDate || new Date());
  }

  /**
   * Return duration difference
   * @param {Moment} : moment
   * @returns {Moment} : moment
   */
  static getDiffDuration(endDate: any): any {
    const diff = moment(endDate).diff(new Date());
    return moment.duration(diff);
  }
}

export default DateHelper;

/**
 * @file date.helper.ts
 * @author
 * @since 2018.05
 */

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

  static convDateCustomFormat(date: any, format: string): Date {
    return moment(date, format).toDate();
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
   * @returns Unix timestamp
   */
  static getUnixTimeStamp(date: any) {
    return moment(date).unix();
  }
  
  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 6
   */
  static getFromCurrentPrevMonth(date: any, before: number ): string {
    return moment(this.convDateFormat(date)).add(-before, 'months').format('M');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 6
   */
  static getFromCurrentPrevYear(date: any, before: number ): string {
    return moment(this.convDateFormat(date)).add(-before, 'months').format('YYYY');
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
    return moment(this.convDateFormat(date)).format('YYYYM');
  }

  /**
   *  @param data {Date} or {string} : YYYYMMDDhhmmss
   *  @return {string} : 2018.6.
   */
  static getYearNextMonthFromDate(date: Date | string): string {
    const next = this.convDateFormat(date);
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return moment(next).format('YYYY.M.');
  }

  /**
   *  @param data {Date} or {string} : YYYYMMDDhhmmss
   *  @return {string} : 2018.6
   */
  static getYearNextNoDotMonthFromDate(date: Date | string): string {
    const next = this.convDateFormat(date);
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return moment(next).format('YYYY.M');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : 2018.06.01 12:00:00
   */
  static getCurrentDateTime = function (format) {
    return moment().format(format || 'YYYY.M.DD hh:mm:ss');
  };

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
   * @returns {string} : currentDateTime - 6 months
   */
  static getPast6MonthsShortDate = function () {
    return moment().subtract(6, 'months').format('YYYYMMDD');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDD
   * @returns {string} : currentDateTime + 1 year
   */
  static getNextYearShortDate = function () {
    return moment().add(1, 'years').format('YYYY.M.D.');
  };

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018년 12월 31일
   */
  static getKoreanDate(date: any): string {
    return moment(this.convDateFormat(date)).format('LL');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 18년 12월 31일
   */
  static getShortKoreanDate(date: any): string {
    return moment(this.convDateFormat(date)).format('YY년 M월 DD일');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2919년 3월 5일
   */
  static getFullKoreanDate(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY년 M월 D일');
  }

  /**
   * @input 11월
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 12월
   */
  static getShortKoreanAfterMonth(date: any): string {
    return moment(this.convDateFormat(date)).add(1, 'months').format('M월');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 12월
   */
  static getShortKoreanMonth(date: any): string {
    return moment(this.convDateFormat(date)).format('M월');
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
   * @returns {string} : 2018.6.1.
   */
  static getShortDate(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY.M.D.');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1
   */
  static getShortDateNoDot(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY.M.D');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1
   */
  static getDashShortDateNoDot(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY-MM-DD');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1 (first date of this month)
   */
  static getShortFirstDateNoDot(date: any): string {
    return moment(this.convDateFormat(date)).date(1).format('YYYY.M.D');
  }
  
  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1 (first date of this month)
   */
  static getShortFirstDate(date: any): string {
    return moment(this.convDateFormat(date)).date(1).format('YYYY.M.D.');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. (last date of this month)
   */
  static getShortLastDate(date: any) {
    return moment(this.convDateFormat(date)).add('months', 1).date(0).format('YYYY.M.D.');
  }

   /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.05
   */
  static getShortDateNoDate(date: any): string {
    return moment(this.convDateFormat(date)).format('YYYY.M');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 06.01
   */
  static getShortDateNoYear(date: any): string {
    return moment(this.convDateFormat(date)).format('M.DD');
  }


  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00
   */
  static getShortDateAndTime(date) {
    return moment(this.convDateFormat(date)).format('YYYY.M.D. hh:mm');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1. 12:00
   */
  static getShortDateAnd24Time(date) {
    return moment(this.convDateFormat(date)).format('YYYY.M.D. HH:mm');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {string} : 2018.6.1 12:00:00
   */
  static getFullDateAndTime(date) {
    return moment(this.convDateFormat(date)).format('YYYY.M.D. hh:mm:ss');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDHHmmss
   * @returns {string} : 2018.6.1 12:00:00
   */
  static getFullDateAnd24Time(date) {
    return moment(this.convDateFormat(date)).format('YYYY.M.D. HH:mm:ss');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @param format
   * @returns {string} : 2018-06-02 11:59
   */
  static getAddDay(date, format = 'YYYY.M.DD hh:mm') {
    return moment(this.convDateFormat(date))
      .add(1, 'days')
      .subtract(1, 'minutes')
      .format(format);
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

  /**
    * @param {any} date, {string} subStr, {string} format
    * @returns {Date}
  */
  static getStartOfMonSubtractDate( date: any, subStr: string, format: string ): any {
    return moment(this.convDateFormat(date)).subtract( subStr, 'months' ).startOf('month').format(format);
  }

  static getEndOfMonSubtractDate( date: any, subStr: string, format: string ): any {
    return moment(this.convDateFormat(date)).subtract( subStr, 'months' ).endOf('month').format(format);
  }

  /**
   * @param {any} date, {string} format
   * @returns {Date}
   */
  static getStartOfMonDate( date: any, format: string ): any {
    return moment(this.convDateFormat(date)).startOf('month').format(format);
  }

  static getEndOfMonDate( date: any, format: string ): any {
    return moment(this.convDateFormat(date)).endOf('month').format(format);
  }

  /**
   * Return difference by unit
   * @param {string} endDate, {string} startDate, {any} unit
   * @returns {Moment} : moment
   */
  static getDiffByUnit(endDate: string, startDate: string, unit: any): number {
    return moment(endDate).diff(startDate, unit);
  }

  /**
   * @param {any} date
   * @returns {string} : yyyy-mm-01
   */
  static getMonthFirstDay( date: any): any {
    return moment(this.convDateFormat(date)).date(1).format('YYYY.M.D.');
  }

  /**
   * @param {any} date
   * @returns {string} : yyyy-mm-30 or 31
   */
  static getMonthLastDay( date: any): any {
    return moment(this.convDateFormat(date)).add(1, 'months').date(0).format('YYYY.M.D.');
  }

  /**
   * @param date {Date} or {string} : YYYYMMDDhhmmss
   * @returns {number} : 30
   */
  static getDday(date: any): number {
    return moment(date).diff(this.getCurrentShortDate(new Date()), 'day');
  }

  static add5min(date: any): any {
    return moment(this.convDateFormat(date)).add(5, 'minutes').format('YYYYMMDDHHmmss');
  }
}

export default DateHelper;

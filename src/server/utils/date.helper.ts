import moment from 'moment';

moment.locale('ko'); // set 'ko' timezone

class DateHelper {
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
   * Convert Date Format (BFF string to Date)
   * @param {string} date
   * @returns {Date}
   */
  static convDateFormat(date: any): Date {
    if ( !(date instanceof Date) ) {
      return moment(date, 'YYYYMMDDhhmmss').toDate();
    }
    return date;
  }
}

export default DateHelper;

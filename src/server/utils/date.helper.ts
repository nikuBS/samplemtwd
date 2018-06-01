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
   * @param date
   * @returns {string} : 2018.06.01.
   */
  static getShortDate(date) {
    return moment(date).format('l');
  }

  /**
   * @param date
   * @returns {string} : 2018.06.01
   */
  static getShortDateNoDot(date) {
    return moment(date).format('YYYY.MM.DD');
  }

  static getDateFormat(data) {
    return moment(data);
  }

}

export default DateHelper;

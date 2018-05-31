class DateHelper {
  static getDate(): any {
    return new Date();
  }

  static getNextMonth(): any {
    const next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  static getRemainDate(): number {
    const current = DateHelper.getDate();
    const next = DateHelper.getNextMonth();
    const remain = (next.getTime() - current.getTime()) / 1000 / 60 / 60 / 24;
    return remain;
  }
}

export default DateHelper;

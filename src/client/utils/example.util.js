Tw.ExampleUtil = function () {};

Tw.ExampleUtil.prototype = {
  getDate: function () {
    var date = new Date();
    return date;
  },
  getLastDate: function () {
    var month = this.getDate().getMonth() + 1;
    var lastDate = 31;
    if (month === 4 || month === 6 || month === 9 || month === 11) {
      lastDate = 30;
    }
    else if (month === 2) {
      lastDate = 28;
    }
    return lastDate;
  },
  getRemainDate: function () {
    var date = this.getDate().getDate();
    var lastDate = this.getLastDate();
    var remainDate = lastDate - date;
    return remainDate;
  }
};
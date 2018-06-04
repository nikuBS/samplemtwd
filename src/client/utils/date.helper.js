Tw.DateHelper = (function() {
  var getDate = function() {
    var date = new Date();
    return date;
  };

  var getNextMonth = function () {
    var next = new Date();
    next.setDate(1);
    next.setMonth(next.getMonth() +1);
    return next;
  };

  var getRemainDate = function () {
    var current = getDate();
    var next = getNextMonth();
    var remain = Math.floor((next.getTime() - current.getTime()) / 1000 / 60 / 60 / 24);
    return remain;
  };

  /**
   * @param date
   * @returns {string} : 2018.06.01.
   */
  var getShortDate = function (date) {
    return moment(date).format('l');
  };

  /**
   * @param date
   * @returns {string} : 2018.06.01
   */
  var getShortDateNoDot = function (date) {
    return moment(date).format('YYYY.MM.DD');
  };

  var getDateFormat = function(data) {
    return moment(data);
  };

  return {
    getRemainDate: getRemainDate,
    getShortDate: getShortDate,
    getShortDateNoDot: getShortDateNoDot,
    getDateFormat: getDateFormat
  }
})();
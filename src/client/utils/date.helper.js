Tw.DateHelper = (function() {
  var getDate = function() {
    var date = new Date();
    return date;
  };

  var getNextMonth = function () {
    var next = new Date();
    next.setMonth(next.getMonth() +1);
    next.setDate(1);
    return next;
  };

  var getRemainDate = function () {
    var current = getDate();
    var next = getNextMonth();
    var remain = (next.getTime() - current.getTime()) / 1000 / 60 / 60 / 24;
    return remain;
  };

  return {
    getRemainDate: getRemainDate
  }
})();
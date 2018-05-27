Tw.ApiService = function () {
};

Tw.ApiService.prototype = {
  request: function (command, params) {
    return $.ajax({
      type: command.method,
      url: '/api' + command.path,
      dataType: 'json',
      timeout: 10000,
      data: params
    });
  }
};

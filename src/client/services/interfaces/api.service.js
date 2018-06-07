Tw.ApiService = function () {
};

Tw.ApiService.prototype = {
  request: function (command, data, params) {
    var htOptions = {
      type: command.method,
      url: '/api' + command.path,
      dataType: 'json',
      timeout: 10000,
      data: data
    }

    return $.ajax($.extend(htOptions, params));
  }
};

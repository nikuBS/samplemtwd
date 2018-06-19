Tw.ApiService = function () {
};

Tw.ApiService.prototype = {
  request: function (command, params, headers) {
    var htOptions = {
      type: command.method,
      url: '/api' + command.path,
      dataType: 'json',
      timeout: 10000,
      headers: headers,
      data: params
    };

    return $.ajax(htOptions);
  }
};

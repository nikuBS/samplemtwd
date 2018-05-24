Tw.apiService = (function () {
  var _instance;

  function ApiService() {
    if ( !(this instanceof ApiService) ) {
      return new ApiService();
    }
  }

  ApiService.prototype = {
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

  return {
    init: function () {
      if ( !_instance ) {
        return _instance = ApiService.apply(null, arguments);
      }
      return _instance;
    },
    getInstance: function () {
      if ( !_instance ) {
        return this.init.apply(this, arguments);
      }
      return _instance;
    }
  };
}());
Tw.DeviceService = function() {
  this._deffered = $.Deferred();

  this._appVersion = null;
  this._osType = null;
  this._osVersion = null;
};

Tw.DeviceService.prototype = {
  setDeviceInfo: function (params) {
    this._appVersion = params.appVersion;
    this._osType = params.osType;
    this._osVersion = params.osVersion;

    this._deffered.resolve({
      appVersion : this._appVersion,
      osType: this._osType,
      osVersion: this._osVersion
    });
  },
  getDeviceInfo: function () {
    return this._deffered;
  }
};
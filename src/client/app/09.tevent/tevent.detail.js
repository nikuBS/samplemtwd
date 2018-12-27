/**
 * FileName: tevent.detail.js
 * Author: Jayoon Kong (jayoon.kong@sk.com)
 * Date: 2018.12.27
 */

Tw.TeventDetail = function (rootEl) {
  this.$container = rootEl;
  this.$iframe = rootEl.find('iframe');

  this._apiService = Tw.Api;

  this._getBpcp();
};

Tw.TeventDetail.prototype = {
  _getBpcp: function() {
    var url = this.$iframe.attr('src');
    this._apiService.request(Tw.API_CMD.BFF_01_0039, { bpcpServiceId: url.replace('/tworld/detail/', '') })
      .done($.proxy(this._resBpcp, this));
  },

  _resBpcp: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    var url = resp.result.svcUrl;
    if (!Tw.FormatHelper.isEmpty(resp.result.tParam)) {
      url += (url.indexOf('?') !== -1 ? '&tParam=' : '?tParam=') + resp.result.tParam;
    }

    this.iframe.src(url);
  }
};
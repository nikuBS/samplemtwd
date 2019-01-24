/**
 * FileName: myt-data.familydata.history.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2019.01.21
 */

Tw.MyTDataFamilyHistory = function(rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;

  this._bindEvent();
};

Tw.MyTDataFamilyHistory.prototype = {
  _bindEvent: function() {
    this.$container.on('click', '.fe-before', $.proxy(this._handleRetrieveData, this));
  },

  _handleRetrieveData: function(e) {
    var $target = $(e.currentTarget),
      serialNumber = $target.data('serial-number');

    $target.addClass('none');
    $target.siblings('.fe-ing').removeClass('none');
    this._requestRetrieve(serialNumber, 0, $target);
  },

  _requestRetrieve: function(serialNumber, requestCount, $before) {
    this._apiService
      .request(Tw.API_CMD.BFF_06_0072, { reqCnt: requestCount, shrpotSerNo: serialNumber })
      .done($.proxy(this._handleSuccessRetrieve, this, serialNumber, $before));
  },

  _handleSuccessRetrieve: function(serialNumber, $before, resp) {
    var $ing = $before.siblings('.fe-ing'),
      $after = $before.siblings('.fe-after');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(resp.code, resp.msg).pop();
      $before.removeClass('none');
      $ing.addClass('none');
    } else {
      if (resp.result && resp.result.nextReqYn === 'Y') {
        setTimeout($.proxy(this._requestRetrieve, this, serialNumber, resp.result.reqCnt, $before), 3000);
        return;
      } else {
        $ing.addClass('none');
        $after.removeClass('none');
        $after.find('strong').text(resp.result.remGbGty + 'GB');
      }
    }
  }
};

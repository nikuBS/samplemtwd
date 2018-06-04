Tw.MytUsageView = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._showAndHide();
  this._bindEvent();
};

Tw.MytUsageView.prototype = {
  _showAndHide: function () {
    this._getUsageBtn();
  },
  _bindEvent: function () {
    this._changeDataUnit();
  },
  _changeDataUnit: function () {
    var changeBtn = $('.btn-change');
    this.$container.find(changeBtn).on('change', $.proxy(this._setDataByUnit, this));
  },
  _setDataByUnit: function ($event) {
    var defaultUnit = 'KB';
    var unit = this._getUnit($event.target.checked);

    var targetSelector = $('.data-value');
    this.$container.find(targetSelector).each(function () {
      var $this = $(this);
      var dataValue = $this.attr('data-value');
      var data = Tw.FormatHelper.customDataFormat(dataValue, defaultUnit, unit);

      $this.text(data.data);
      $this.siblings('span').text(data.unit);
    })
  },
  _getUnit: function (isMb) {
    var unit = 'GB';
    if (isMb) {
      unit = 'MB';
    }
    return unit;
  },
  _getUsageBtn: function () {
    this._apiService.request(Tw.API_CMD.TEST_GET_USAGE_BTN, {})
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _success: function (resp) {
    console.log('api success', resp.result);
    //var $box = this.$container.find('.notice');
    //$box.append(JSON.stringify(resp));
  },
  _fail: function (err) {
    console.log('api fail', err);
  }
};
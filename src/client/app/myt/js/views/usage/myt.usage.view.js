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
    $.ajax('/mock/myt.usage-btn.json')
      .done($.proxy(this._success, this))
      .fail($.proxy(this._fail, this));
  },
  _setBtnVisibility: function (result) {
    var dataSharingBtn = this.$container.find('.data-sharing-btn');
    var tDataSharingBtn = this.$container.find('.t-data-sharing-btn');
    var tRoamingSharingBtn = this.$container.find('.t-roaming-sharing-btn');

    if (result.dataSharing === 'Y') dataSharingBtn.show();
    if (result.tdataSharing === 'Y') tDataSharingBtn.show();
    if (result.troamingSharing === 'Y') tRoamingSharingBtn.show();
  },
  _success: function (res) {
    var result = res.result;
    this._setBtnVisibility(result);
  },
  _fail: function (err) {
    console.log('api fail', err);
  }
};
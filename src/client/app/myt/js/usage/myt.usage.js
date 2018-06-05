Tw.MytUsage = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._showAndHide();
  this._bindEvent();
};

Tw.MytUsage.prototype = {
  _showAndHide: function () {
    this.$container.find('.child-btn').hide();

    this._getUsageBtn();
    this._getChildren();
  },
  _bindEvent: function () {
    this._changeDataUnit();
  },
  _changeDataUnit: function () {
    this.$container.find('.btn-change').on('change', $.proxy(this._setDataByUnit, this));
  },
  _setDataByUnit: function ($event) {
    var defaultUnit = 'KB';
    var unit = this._getUnit($event.target.checked);

    this.$container.find('.data-value').each(function () {
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
      .done($.proxy(this._btnSuccess, this))
      .fail($.proxy(this._btnFail, this));
  },
  _getChildren: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0010, {})
      .done($.proxy(this._childSuccess, this))
      .fail($.proxy(this._childFail, this));
  },
  _setBtnVisibility: function (result) {
    var dataSharingBtn = this.$container.find('.data-sharing-btn');
    var tDataSharingBtn = this.$container.find('.t-data-sharing-btn');
    var tRoamingSharingBtn = this.$container.find('.t-roaming-sharing-btn');

    if (result.dataSharing === 'Y') dataSharingBtn.show();
    if (result.tdataSharing === 'Y') tDataSharingBtn.show();
    if (result.troamingSharing === 'Y') tRoamingSharingBtn.show();
  },
  _btnSuccess: function (res) {
    var result = res.result;
    this._setBtnVisibility(result);
  },
  _btnFail: function (err) {
    console.log('btn api fail', err);
  },
  _childSuccess: function (res) {
    var childBtn = this.$container.find('child-btn');
    var childCntField = this.$container.find('child-cnt');

    if (res.result.length > 0) {
      childCntField.text(res.result.length);
      childBtn.show();
    }
  },
  _childFail: function (err) {
    console.log('child api fail', err);
  }
};
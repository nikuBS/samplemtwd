Tw.MytUsageTroamingShare = function (rootEl) {
  this.$container = rootEl;

  this._bindEvent();
};

Tw.MytUsageTroamingShare.prototype = {
  _bindEvent: function () {
    this.$container.on('change', '.fe-unit-switch', $.proxy(this._setDataByUnit, this));
  },
  _setDataByUnit: function (event) {
    var defaultUnit = 'KB';
    var unit = event.currentTarget.querySelector('input[name="gbmb"]:checked').value;
    this.$container.find('[data-value]').each(function () {
      var $this = $(this);
      var dataValue = $this.attr('data-value');
      var data = Tw.FormatHelper.customDataFormat(dataValue, defaultUnit, unit);

      $this.text(data.data);
      $this.parent()[0].childNodes[2].nodeValue = data.unit;
    });
  },
};

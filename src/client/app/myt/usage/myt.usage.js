Tw.MytUsage = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._showAndHide();
  this._bindEvent();
};

Tw.MytUsage.prototype = Object.create(Tw.View.prototype);
Tw.MytUsage.prototype.constructor = Tw.MytUsage;

Tw.MytUsage.prototype = Object.assign(Tw.MytUsage.prototype, {
  _showAndHide: function () {
    this._getUsageBtn();
    this._getChildren();
    this._checkExceed();
    this._setSmsStyle();
  },
  _bindEvent: function () {
    this._changeDataUnit();
  },
  _changeDataUnit: function () {
    this.$container.on('change', '.btn-change', $.proxy(this._setDataByUnit, this));
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
  _checkExceed: function () {
    if (this.$container.find('.exceed').is('visible')) {
      this.$container.find('.ad2').show();
    }
  },
  _getUsageBtn: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0002, {})
      .done($.proxy(this._btnSuccess, this))
      .fail($.proxy(this._btnFail, this));
  },
  _getChildren: function () {
    this._apiService.request(Tw.API_CMD.BFF_05_0010, {})
      .done($.proxy(this._childSuccess, this))
      .fail($.proxy(this._childFail, this));
  },
  _setBtnVisibility: function (result) {
    if (result.dataSharing === 'Y') {
      this.$container.find('.data-sharing-btn').show();
    }
    if (result.tdataSharing === 'Y') {
      this.$container.find('.t-data-sharing-btn').show();
    }
    if (result.troamingSharing === 'Y') {
      this.$container.find('.t-roaming-sharing-btn').show();
    } else {
      this.$container.find('.ad1').show();
    }

    this._makeBorderStyle(false);
  },
  _setRefillCoupon: function (result) {
    var refillCouponLength = result.length;

    if (refillCouponLength > 0) {
      var refillCnt = this.$container.find('.refill-cnt');
      refillCnt.text('(' + refillCouponLength + ')');
    }
  },
  _btnSuccess: function (res) {
    var sharingService = res.result.sharingService;
    var refillCoupon = res.result.refillCoupon;

    this._setBtnVisibility(sharingService);
    this._setRefillCoupon(refillCoupon);
  },
  _btnFail: function (err) {
    console.log('btn api fail', err);
  },
  _childSuccess: function (res) {
    var childBtn = this.$container.find('.child-btn');
    var childCntField = this.$container.find('.child-cnt');

    if (res.result.length > 0) {
      childCntField.text(res.result.length);

      this._makeBorderStyle(true);
      childBtn.show();
    }
    else {
      this._makeBorderStyle(false);
    }
  },
  _childFail: function (err) {
    console.log('child api fail', err);
  },
  _makeBorderStyle: function (isVisible) {
    if (isVisible) {
      this.$container.find('temp-last')
        .css('border-bottom', '1px solid #ccc');
    }
    else {
      this.$container.find('.add-on li:visible:last')
        .addClass('temp-last')
        .css('border-bottom', 0);
    }
  },
  _setSmsStyle: function () {
    this.$container.find('.sms .sec:last').addClass('mb0');
  }
});

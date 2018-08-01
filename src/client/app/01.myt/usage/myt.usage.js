Tw.MytUsage = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();

  this._showAndHide();
  this._bindEvent();
};

Tw.MytUsage.prototype = {
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
    // this.$container.on('change', '.btn-change', $.proxy(this._setDataByUnit, this));/
    this.$container.on('change', '.fe-unit-switch', $.proxy(this._setDataByUnit, this));
  },
  _setDataByUnit: function (event) {
    var defaultUnit = 'KB';
    // var unit = this._getUnit(event.currentTarget.checked);
    var unit = event.currentTarget.querySelector('input[name="gbmb"]:checked').value;
    this.$container.find('[data-value]').each(function () {
      var $this = $(this);
      var dataValue = $this.attr('data-value');
      var data = Tw.FormatHelper.customDataFormat(dataValue, defaultUnit, unit);

      $this.text(data.data);
      // $this.siblings('span').text(data.unit);
      $this.parent()[0].childNodes[2].nodeValue = data.unit;
    });
  },
  _getUnit: function (isMb) {
    var unit = 'GB';
    if ( isMb ) {
      unit = 'MB';
    }
    return unit;
  },
  _checkExceed: function () {
    if ( this.$container.find('.exceed').is('visible') ) {
      this.$container.find('.fe-ad2').show();
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
    if ( result.dataSharing === 'Y' ) {
      this.$container.find('.fe-data-sharing-btn').show();
    }
    if ( result.tdataSharing === 'Y' ) {
      this.$container.find('.fe-t-data-sharing-btn').show();
    }
    if ( result.troamingSharing === 'Y' ) {
      this.$container.find('.fe-t-roaming-sharing-btn').show();
    } else {
      this.$container.find('.fe-ad1').show();
    }

    if ( result.bandDataSharing === 'Y' ) {
      this.$container.find('.fee-band-data-sharing').show();
    }

    this._makeBorderStyle(false);
  },
  _setRefillCoupon: function (result) {
    var refillCouponLength = result.length;

    if ( refillCouponLength > 0 ) {
      this.$container.find('.fe-refill-btn').show();
      var refillCnt = this.$container.find('.fe-refill-cnt');
      refillCnt.text(refillCouponLength);
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
    var childBtn = this.$container.find('.fe-child-btn');
    var childCntField = this.$container.find('.fe-child-cnt');

    if ( res.result && res.result.length > 0 ) {
      childCntField.text(res.result.length);

      // this._makeBorderStyle(true);
      childBtn.show();
    }
    // else {
    //     //   // this._makeBorderStyle(false);
    //     // }
  },
  _childFail: function (err) {
    console.log('child api fail', err);
  },
  _makeBorderStyle: function (isVisible) {
    if ( isVisible ) {
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
};

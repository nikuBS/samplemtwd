/**
 * FileName: membership.submain.js
 * Author: EunJung Jung
 * Date: 2018.12.26
 */

Tw.MembershipSubmain = function(rootEl, membershipData) {
  this.$container = rootEl;
  this._membershipData = membershipData;
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._map = undefined;
  this._cachedElement();
  this._bindEvent();
  this._checkCurrentLocation();
};

Tw.MembershipSubmain.prototype = {

  _cachedElement: function() {
    this.$barCode = this.$container.find('#fe-barcode-img');
  },

  _bindEvent: function() {
    this.$barCode.on('click', $.proxy(this._showBarCodePopup, this));
  },
  _checkCurrentLocation: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._onCurrentLocation(location);
    } else {
      this._askCurrentLocation();
    }
  },
  _askCurrentLocation: function() {
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(function (res) {
        if (res.resultCode === 401) {
          this._historyService.goBack();
          return;
        } else {
          //this._checkLocationAgreement(res.params);
        }
      }, this));
    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition($.proxy(function (location) {
          this._onCurrentLocation({
            longitude: location.coords.longitude,
            latitude: location.coords.latitude
          });
        }, this));
      }
    }
  },
  _onCurrentLocation: function (location) {
    Tw.Logger.info(location);
  },
  _showBarCodePopup : function () {
    var cardNum = this.$barCode.data('cardnum');
    this._mbrGrStr = this._membershipData.mbrGrStr;
    this._mbrGrCd = this._membershipData.mbrGrCd;
    this._usedAmt = this._membershipData.showUsedAmount;

    this._popupService.open({
      hbs: 'HO_01_01_02',
      layer: true,
      data: {
        mbrGr: this._mbrGrStr.toLowerCase(),
        mbrGrStr: this._mbrGrStr,
        cardNum: cardNum,
        usedAmount: this._usedAmt
      }
    }, $.proxy(this._onOpenBarcode, this, cardNum));

  },

  _onOpenBarcode: function (cardNum, $popupContainer) {
    var extendBarcode = $popupContainer.find('#fe-membership-barcode-extend');
    if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
      extendBarcode.JsBarcode(cardNum);
    }
  },

  _reload: function() {
    this._historyService.reload();
  }
};

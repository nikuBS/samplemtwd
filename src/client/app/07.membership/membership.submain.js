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
  ICON: {
    V: 'vip',
    G: 'gold',
    S: 'silver',
    A: 'all'
  },
  _cachedElement: function() {
    this.$barCode = this.$container.find('#fe-barcode-img');
    this.$nearBrand = this.$container.find('#fe-memebership-near');
    this._nearBrandTmpl = Handlebars.compile($('#tmplList').html());
  },

  _bindEvent: function() {
    this.$barCode.on('click', $.proxy(this._showBarCodePopup, this));
    this.$container.on('click', '.fe-benefit-title', $.proxy(this._goBenefitBrand, this));
    this.$container.on('click', '.fe-membership-grade', $.proxy(this._goMembershipGrade, this));
    this.$container.on('click', '.box-app-down', $.proxy(this._goTmembership, this));
    this.$container.on('click', '.data-plus', $.proxy(this._goChocolate, this));

  },
  _goChocolate: function () {
    Tw.CommonHelper.openUrlExternal(Tw.URL_PATH.CHOCOLATE_MALL,'');
  },
  _goTmembership: function () {
    this._historyService.goLoad('/product/apps/app?appId=TW50000020');
  },
  _goMembershipGrade: function () {
    this._historyService.goLoad('/membership/membership_info/mbrs_0001');
  },
  _goBenefitBrand: function () {
    this._historyService.goLoad('/membership/benefit/brand');
  },
  _checkCurrentLocation: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._getAreaByGeo(location);
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
          this._getAreaByGeo(res.params);
        }
      }, this));
    } else {
      this._getAreaByGeo({
        mapX: '37.5600420',
        mapY: '126.9858500'
      });
    }
  },
  _getAreaByGeo: function (location) {
    Tw.Logger.info('current location : ', location);
    this.currentLocation = {
      mapX: location.mapX,
      mapY: location.mapY
    };
    this._apiService.request(Tw.API_CMD.BFF_11_0026, this.currentLocation)
    // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0059.json')
        .done($.proxy(this._handleSuccessAreaByGeo, this))
        .fail($.proxy(this._handleFailCallBack, this));
  },
  _handleSuccessAreaByGeo: function (resp) {
    var _result = resp.result;
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('result : ', _result);
      var location = _result.area1 + ' ' + _result.area2;
      this.$container.find('.fe-membership-location').text(location);
      this.currentLocation.area1 = encodeURIComponent(_result.area1);
      this.currentLocation.area2 = encodeURIComponent(_result.area2);
      Tw.Logger.info('this.currentLocation : ', this.currentLocation);
      this._apiService.request(Tw.API_CMD.BFF_11_0025, this.currentLocation)
      // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0059.json')
          .done($.proxy(this._handleSuccessNeaBrand, this))
          .fail($.proxy(this._handleFailCallBack, this));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _changeIcoGrade: function(ico) {
    var iconGrade = ico.split('');
    var iconArr = [];
    for(var i in iconGrade){
      iconArr.push(this.ICON[iconGrade[i]]);
    }
    return iconArr;
  },
  _handleSuccessNeaBrand: function (resp) {
    var _result = resp.result.list;
    for(var idx in _result){
      _result[idx].showIcoGrd1 = this._changeIcoGrade(_result[idx].icoGrdChk1);
      _result[idx].showIcoGrd2 = this._changeIcoGrade(_result[idx].icoGrdChk2);
      _result[idx].showIcoGrd3 = this._changeIcoGrade(_result[idx].icoGrdChk3);
      _result[idx].showIcoGrd4 = this._changeIcoGrade(_result[idx].icoGrdChk4);
    }
    Tw.Logger.info('near brand resp :', _result);
    this.$nearBrand.append(this._nearBrandTmpl({ list : _result }));
  },
  _handleFailCallBack: function () {

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

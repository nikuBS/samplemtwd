/**
 * FileName: myt-data.refill.coupon.use.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.09.19
 */

Tw.MyTDataRefillCouponUse = function (rootEl, couponNo) {
  this.$container = rootEl;

  this._couponNo = couponNo;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;
  this._hashService = Tw.Hash;
  this._historyService = new Tw.HistoryService();

  this._currentTab = 'refill';

  this._cacheElements();
  this._bindEvent();
  this._init();
};

Tw.MyTDataRefillCouponUse.prototype = {
  _cacheElements: function () {
    this.$btnUse = this.$container.find('.fe-btn-use');
    this.$numberInput = this.$container.find('input[type=text]');
  },
  _bindEvent: function () {
    this.$container.on('change', 'input[type=radio]', $.proxy(this._onOptionSelected, this));
    this.$numberInput.on('keyup', $.proxy(this._onNumberChanged, this));
    this.$container.on('click', '.cancel', $.proxy(this._onNumberCancel, this));
    this.$container.on('click', '.fe-btn-contacts', $.proxy(this._onClickContacts, this));
    this.$btnUse.on('click', $.proxy(this._onSubmitClicked, this));
  },
  _init: function () {
    if (!Tw.BrowserHelper.isApp()) {
      this.$container.find('.fe-cancel-btn-box').addClass('none');
    }

    this._hashService.initHashNav($.proxy(this._onTabChanged, this));
    this._currentTab =
      this.$container.find('#tab1').attr('aria-selected') === 'true' ? 'refill' : 'gift';
  },
  _onTabChanged: function (hash) {
    if (hash.raw === 'refill') {
      this._onOptionSelected();
      this._currentTab = 'refill';
    } else if (hash.raw === 'gift') {
      this._onNumberChanged();
      this._currentTab = 'gift';
    }
  },
  _onOptionSelected: function () {
    var checked = this.$container.find('input[type=radio][checked="checked"]');
    if (checked.length === 0) {
      this.$btnUse.attr('disabled', true);
    } else {
      this.$btnUse.attr('disabled', false);
    }
  },
  _onNumberChanged: function () {
    var number = this.$numberInput.val();
    if (Tw.FormatHelper.isEmpty(number.trim())) {
      this.$btnUse.attr('disabled', true);
    } else {
      this.$btnUse.attr('disabled', false);
    }
  },
  _onNumberCancel: function () {
    this.$btnUse.attr('disabled', true);
  },
  _onClickContacts: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(function (res) {
      if (res.resultCode === Tw.NTV_CODE.CODE_00) {
        var number = res.params.phoneNumber;
        this.$numberInput.val(number);
      }
    }, this));
  },
  _onSubmitClicked: function () {
    switch (this._currentTab) {
      case 'refill':
        this._popupService.openConfirm(
          Tw.REFILL_COUPON_CONFIRM.CONTENTS, Tw.REFILL_COUPON_CONFIRM.TITLE,
          $.proxy(this._refill, this)
        );
        break;
      case 'gift':
        this._gift();
        break;
      default:
        break;
    }
  },
  _refill: function () {
    this._popupService.close();
    var desc = this.$container.find('input[type=radio][checked="checked"]')[0].value;
    var reqData = {
      copnIsueNum: this._couponNo,
      ofrRt: desc.split('::')[0],
      copnDtlClCd: desc.split('::')[1]
    };
    var type = 'voice';
    this._apiService.request(Tw.API_CMD.BFF_06_0007, reqData)
      .done($.proxy(this._success, this, type))
      .fail($.proxy(this._fail, this));
  },
  _gift: function () {
    var reqData = {
      copnIsueNum: this._couponNo,
      befrSvcNum: this.$numberInput.val()
    };
    this._apiService.request(Tw.API_CMD.BFF_06_0008, reqData)
      .done($.proxy(this._success, this, 'gift'))
      .fail($.proxy(this._fail, this));
  },
  _success: function (type, res) {
    if (res.code !== Tw.API_CODE.CODE_00) {
      Tw.Error(res.code, res.msg).pop();
      return;
    }

    switch (type) {
      case 'data':
        this._historyService.goLoad('/myt/data/refill/coupon/complete?category=data');
        break;
      case 'voice':
        this._historyService.goLoad('/myt/data/refill/coupon/complete?category=voice');
        break;
      case 'gift':
        this._historyService.goLoad('/myt/data/refill/coupon/complete?category=gift');
        break;
      default:
        break;
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};

/**
 * FileName: myt-data.recharge.coupon.use.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.09.19
 */

Tw.MyTDataRechargeCouponUse = function (rootEl, couponNo) {
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

Tw.MyTDataRechargeCouponUse.prototype = {
  _cacheElements: function () {
    this.$btnUse = this.$container.find('.fe-btn-use');
    this.$numberInput = this.$container.find('input[type=text]');
  },
  _bindEvent: function () {
    this.$container.on('change', 'input[type=radio]', $.proxy(this._onOptionSelected, this));
    this.$numberInput.on('keyup', $.proxy(this._onNumberChanged, this));
    this.$container.on('click', '.cancel', $.proxy(this._onNumberCancel, this));
    this.$container.on('click', '#fe-btn-contacts', $.proxy(this._onClickContacts, this));
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
    var checked = this.$container.find('input[type=radio]:checked');
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
        this._popupService.openModalTypeA(
          Tw.REFILL_COUPON_CONFIRM.TITLE_REFILL,
          Tw.REFILL_COUPON_CONFIRM.CONTENTS_REFILL,
          Tw.REFILL_COUPON_CONFIRM.CONFIRM_REFILL,
          null,
          $.proxy(this._refill, this)
        );
        break;
      case 'gift':
        var $errorSpan = this.$container.find('.fe-number-error');
        $errorSpan.addClass('none');

        var number = this.$numberInput.val().trim();
        if (number.length < 10) {
          $errorSpan.removeClass('none');
          // $errorSpan.children().addClass('none');
          // $errorSpan.find('#fe-2-v18').removeClass('none');
          return;
        }

        var confirmed = false;
        this._popupService.openModalTypeA(
          Tw.REFILL_COUPON_CONFIRM.TITLE_GIFT,
          Tw.REFILL_COUPON_CONFIRM.CONTENTS_GIFT,
          Tw.REFILL_COUPON_CONFIRM.CONFIRM_GIFT,
          null,
          $.proxy(function () {
            confirmed = true;
            this._popupService.close();
          }, this),
          $.proxy(function () {
            if (confirmed) {
              this._gift();
            }
          }, this)
        );
        break;
      default:
        break;
    }
  },
  _refill: function () {
    this._popupService.close();
    var desc = this.$container.find('input[type=radio]:checked')[0].value;
    var reqData = {
      copnIsueNum: this._couponNo,
      ofrRt: desc.split('::')[0],
      copnDtlClCd: desc.split('::')[1]
    };
    var type = desc.split('::')[2] === 'D' ? 'data' : 'voice';
    this._apiService.request(Tw.API_CMD.BFF_06_0007, reqData)
      .done($.proxy(this._success, this, type))
      .fail($.proxy(this._fail, this));
  },
  _gift: function () {
    this._popupService.close();
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
      if (type === 'gift') {
        if (res.code === Tw.API_CODE.NOT_FAMILY || res.code === 'RCG3004') {
          this._popupService.open({
            title: Tw.POPUP_TITLE.NOT_FAMILY,
            title_type: 'sub',
            cont_align: 'tl',
            contents: Tw.POPUP_CONTENTS.REFILL_COUPON_FAMILY,
            infocopy: [{
              info_contents: Tw.POPUP_CONTENTS.REFILL_COUPON_FAMILY_INFO,
              bt_class: 'none'
            }],
            bt: [{
              style_class: 'tw-popup-closeBtn',
              txt: Tw.BUTTON_LABEL.CLOSE
            }]
          });
          return;
        }

        if (res.code === Tw.API_CODE.RECEIVER_LIMIT || res.code === 'RCG3005') {
          this._popupService.openAlert(Tw.POPUP_CONTENTS.COUPON_RECEIVER_LIMIT);
          return;
        }

        if (res.code === 'RCG3003') {
          this._popupService.openAlert(Tw.REFILL_COUPON_ALERT.A211);
          return;
        }

        if (res.code === 'RCG3006') {
          this._popupService.openAlert(Tw.REFILL_COUPON_ALERT.A212);
          return;
        }

        this._popupService.openAlert(Tw.REFILL_COUPON_ALERT.A213);
        return;
      }

      Tw.Error(res.code, res.msg).pop();
      return;
    }

    Tw.CommonHelper.setLocalStorage('recharge', 'done');
    switch (type) {
      case 'data':
        this._historyService.replaceURL('/myt-data/recharge/coupon/complete?category=data');
        break;
      case 'voice':
        this._historyService.replaceURL('/myt-data/recharge/coupon/complete?category=voice');
        break;
      case 'gift':
        var number = Tw.FormatHelper.getFormattedPhoneNumber(this.$numberInput.val());
        this._historyService.replaceURL(
          '/myt-data/recharge/coupon/complete?category=gift&number=' + number);
        break;
      default:
        break;
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};

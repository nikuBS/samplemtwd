/**
 * @file 쿠폰 사용하기 화면관련 처리
 * @author Hakjoon Sim
 * @since 2018-09-19
 */

/**
 * @constructor
 * @param  {Object} rootEl - 최상위 elem
 * @param  {String} couponNo - 선택된 쿠폰 번호
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
    this.$numberInput = this.$container.find('input[type=tel]');
    this.$tipRefill = this.$container.find('.fe-tip-refill');
    this.$tipGift = this.$container.find('.fe-tip-gift');

    // this.$errorSpan = this.$container.find('.error-txt');
    // this.$errorV18 = this.$container.find('#fe-2-v18');
    // this.$errorV9 = this.$container.find('#fe-2-v9');
  },
  _bindEvent: function () {
    this.$container.on('change', 'input[type=radio]', $.proxy(this._onOptionSelected, this));
    this.$numberInput.on('keyup', $.proxy(this._onNumberChanged, this));
    this.$container.on('click', '.cancel', $.proxy(this._onNumberCancel, this));
    this.$container.on('click', '#fe-btn-contacts', $.proxy(this._onClickContacts, this));
    // this.$container.on('click', '.prev-step', $.proxy(this._onCancel, this));
    this.$container.on('click', 'button.fe-replace-url', $.proxy(this._onReplaceUrl, this));
    this.$btnUse.on('click', $.proxy(this._onSubmitClicked, this));
  },

  /**
   * @function
   * @desc myt-data submain에서 진입 후 뒤로가기 시 submain으로 이동시키기 위한 처리
   */
  _init: function () {
    if (!Tw.BrowserHelper.isApp()) {
      this.$container.find('.fe-cancel-btn-box').addClass('none');
    }

    this._hashService.initHashNav($.proxy(this._onTabChanged, this));
    this._currentTab =
      this.$container.find('#tab1').attr('aria-selected') === 'true' ? 'refill' : 'gift';
    if (!Tw.BrowserHelper.isApp()) {
      this.$container.find('#fe-btn-contacts').hide();
    }
  },

  /**
   * @function
   * @desc 탭 변경에 따른 UI처리
   * @param  {String} hash - 현재 선택된 tab의 hash 값
   */
  _onTabChanged: function (hash) {
    if (hash.raw === 'refill') {
      this._onOptionSelected();
      this.$tipGift.hide();
      this.$tipRefill.show();
      this._currentTab = 'refill';
    } else if (hash.raw === 'gift') {
      this._onNumberChanged();
      this.$tipRefill.hide();
      this.$tipGift.show();
      this._currentTab = 'gift';
    }

    // 웹접근성, 선택된 tab에 aria-selected - true 로 설정
    this.$container.find('.fe-tab').attr('aria-selected', 'false');
    this.$container.find('#fe-tab-' + this._currentTab).attr('aria-selected', 'true');
  },

  /**
   * @function
   * @desc 리필하기 음성/데이터 옵션 선택에 따른 처리
   */
  _onOptionSelected: function () {
    var checked = this.$container.find('input[type=radio]:checked');
    if (checked.length === 0) {
      this.$btnUse.attr('disabled', true);
    } else {
      this.$btnUse.attr('disabled', false);
    }
  },

  /**
   * @function
   * @desc 선물하기 받는사람 번호 변경에 따른 처리
   */
  _onNumberChanged: function () {
    var number = this.$numberInput.val().trim();
    this.$numberInput.val(number.replace(/[^0-9]/gi, '').trim());
    this.$numberInput.val(Tw.StringHelper.phoneStringToDash(this.$numberInput.val()).trim());

    var pureNumber = number.replace(/[^0-9]/gi, '').trim();
    /*
    if (pureNumber.length === 0) {
      this.$errorSpan.addClass('none');
      return;
    }
    if (pureNumber.length < 10) {
      this.$errorSpan.addClass('none');
      this.$errorV18.removeClass('none');
      return;
    }
    if (!Tw.FormatHelper.isCellPhone(pureNumber)) {
      this.$errorSpan.addClass('none');
      this.$errorV9.removeClass('none');
      return;
    }
    */

    // this.$errorSpan.addClass('none');

    if (pureNumber.length === 0) {
      this.$btnUse.attr('disabled', true);
    } else {
      this.$btnUse.attr('disabled', false);
    }
  },

  /**
   * @function
   * @desc 받는사람 번호 input에 x버튼 선택시의 동작
   */
  _onNumberCancel: function () {
    // this.$errorSpan.addClass('none');
    this.$btnUse.attr('disabled', true);
  },

  /**
   * @function
   * @desc 주소록 버튼 클릭시 native로 주소록 화면 요청
   */
  _onClickContacts: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(function (res) {
      if (res.resultCode === Tw.NTV_CODE.CODE_00) {
        var number = res.params.phoneNumber.replace(/[^0-9]/gi, '').trim();
        number = Tw.FormatHelper.getDashedCellPhoneNumber(number);
        this.$numberInput.val(number);
        this.$numberInput.trigger('keyup'); // x버튼 표시되도록 keyup 이벤트 임의로 발생
        this._onNumberChanged();
      }
    }, this));
  },


  /**
   * @function
   * @desc submit 버튼 클릭시 선물하기/리필하기 각각에 따른 처리
   */
  _onSubmitClicked: function () {
    var confirmed = false;
    switch (this._currentTab) {
      case 'refill':
        this._popupService.openModalTypeA(
          Tw.REFILL_COUPON_CONFIRM.TITLE_REFILL,
          Tw.REFILL_COUPON_CONFIRM.CONTENTS_REFILL,
          Tw.REFILL_COUPON_CONFIRM.CONFIRM_REFILL,
          null,
          $.proxy(function () {
            confirmed = true;
            this._popupService.close();
          }, this),
          $.proxy(function () {
            if (confirmed) {
              this._refill();
            }
          }, this)
        );
        break;
      case 'gift':
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
  _onReplaceUrl: function () {
    this._historyService.goLoad('/myt-data/recharge/coupon');
  },

  /**
   * @function
   * @desc 리필하기에 대한 BFF 요청
   */
  _refill: function () {
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

  /**
   * @function
   * @desc 선물하기에 대한 BFF 요청
   */
  _gift: function () {
    this._popupService.close();
    var reqData = {
      copnIsueNum: this._couponNo,
      befrSvcNum: this.$numberInput.val().replace(/[^0-9]/gi, '').trim()
    };

    this._apiService.request(Tw.API_CMD.BFF_06_0008, reqData)
      .done($.proxy(this._success, this, 'gift'))
      .fail($.proxy(this._fail, this));
  },

  /**
   * @function
   * @desc BFF요청(선물하기/리필하기) 완료 후 처리
   * @param  {String} type - 선물하기/리필하기 타입 정의
   * @param  {Object} res - BFF로 부터 받은 response json 객체
   */
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
              txt: Tw.BUTTON_LABEL.CONFIRM
            }]
          });
          return;
        }

        if (res.code === Tw.API_CODE.RECEIVER_LIMIT || res.code === 'RCG3005') {
          this._showAlert(Tw.POPUP_CONTENTS.COUPON_RECEIVER_LIMIT);
          return;
        }

        if (res.code === 'RCG3003') {
          this._showAlert(Tw.REFILL_COUPON_ALERT.A211);
          return;
        }

        if (res.code === 'RCG3006') {
          this._showAlert(Tw.REFILL_COUPON_ALERT.A212);
          return;
        }

        this._showAlert(Tw.REFILL_COUPON_ALERT.A213);
        return;
      }

      Tw.Error(res.code, res.msg).pop();
      return;
    }

    // submain에서 진입한 경우 뒤로가기 동작에서 submain으로 보내주기 위함
    Tw.CommonHelper.setLocalStorage('recharge', 'done');
    // [OP002-2795] 잔여량 세션 데이터 업데이트 필요
    this._apiService.request(Tw.NODE_CMD.DELETE_SESSION_STORE, { apiId : Tw.SESSION_CMD.BFF_05_0001 });
    switch (type) {
      case 'data':
        this._historyService.replaceURL('/myt-data/recharge/coupon/complete?category=data');
        break;
      case 'voice':
        this._historyService.replaceURL('/myt-data/recharge/coupon/complete?category=voice');
        break;
      case 'gift':
        var number = this.$numberInput.val();
        number = Tw.FormatHelper.getFormattedPhoneNumber(number.replace(/[^0-9]/gi, ''));
        this._historyService.replaceURL(
          '/myt-data/recharge/coupon/complete?category=gift&number=' + number);
        break;
      default:
        break;
    }
  },
  _fail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  },
  _showAlert: function (content) {  // alert 후 focus 를 다시 input 창으로 (웹접근성)
    this._popupService.openAlert(content, null, null, $.proxy(function () {
      setTimeout($.proxy(function () {
        this.$numberInput.focus();
      }, this), 300)
    }, this));
  }
  /* 취소팝업 삭제
  _onCancel: function () {
    var needToPop = false;
    if (this._currentTab === 'refill') {
      var checked = this.$container.find('input[type=radio]:checked');
      if (checked.length !== 0) {
        needToPop = true;
      }
    } else {
      if (this.$numberInput.val().trim() !== '') {
        needToPop = true;
      }
    }

    if (needToPop) {
      var confirmed = false;
      this._popupService.openConfirmButton(
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.MSG,
        Tw.ALERT_MSG_COMMON.STEP_CANCEL.TITLE,
        $.proxy(function () {
          confirmed = true;
          this._popupService.close();
        }, this),
        $.proxy(function () {
          if (confirmed) {
            this._historyService.goBack();
          }
        }, this),
        Tw.BUTTON_LABEL.NO,
        Tw.BUTTON_LABEL.YES
      );
    } else {
      this._historyService.goBack();
    }
  }
  */
};
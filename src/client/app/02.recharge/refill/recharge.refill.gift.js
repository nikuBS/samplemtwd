Tw.MytRefillGift = function (rootEl) {
  this.$container = rootEl;
  this._apiService = new Tw.ApiService();
  this._nativeService = new Tw.NativeService();

  this._assign();
  this._bindEvent();
  this._init();
};
Tw.MytRefillGift.prototype = Object.create(Tw.View.prototype);
Tw.MytRefillGift.prototype.constructor = Tw.MytRefillGift;
Tw.MytRefillGift.prototype = Object.assign(Tw.MytRefillGift.prototype, {
  _assign: function () {
    this._$inputPhone = this.$container.find('.input-phone');
    this._$btnNext = this.$container.find('.btn-next');
    this._$btnAddr = this.$container.find('.btn-addr');
  },

  _bindEvent: function () {
    this._$inputPhone.on('keyup', $.proxy(this._setDisableStatus, this));
    this._$btnNext.on('click', $.proxy(this._onClickBtnNext, this));
    this._$btnAddr.on('click', $.proxy(this._onClickBtnAddr, this));
  },

  _init: function () {
    this._$inputPhone.trigger('focus');
  },

  _onClickBtnNext: function (event) {
    var befrSvcNum = this._$inputPhone.val();
    var copnNm = this._$btnNext.attr('copn-nm');
    var svcNum = this._$btnNext.attr('svc-num');
    var fomattedBefrSvcNum = this._getFormattedPhoneNumber(befrSvcNum);
    var msg = svcNum + '님' + fomattedBefrSvcNum + '님으로 리필쿠폰을 선물하시겠습니까? \n신청 후 취소가 불가능합니다.';
    if ( !Tw.ValidationHelper.isCellPhone(befrSvcNum) ) {
      alert('유효한 휴대폰번호가 아닙니다.');
      return;
    }
    if ( !copnNm ) {
      alert('선택된 쿠폰이 없습니다.');
      return;
    }
    if ( !confirm(msg) ) {
      return;
    }
    var data = JSON.stringify({
      copnIsueNum: copnNm,
      befrSvcNum: befrSvcNum
    });
    this._apiService.request(Tw.API_CMD.BFF_03_0023, data, { "Content-Type": "application/json" })
      .done($.proxy(this._sendSuccess, this))
      .fail($.proxy(this._sendFail, this));
  },

  _onClickBtnAddr: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_CONTACT, {}, $.proxy(this._onContact, this));
  },

  _onContact: function (resp) {
    var params = resp.params;
    var phoneNumber = params.phoneNumber.replace(/-/gi, "");
    this._$inputPhone.val(phoneNumber);
    this._setDisableStatus();
  },

  _sendSuccess: function (resp) {
    if ( resp.code === '00' ) {
      var befrSvcNum = this._$inputPhone.val();
      var fomattedBefrSvcNum = this._getFormattedPhoneNumber(befrSvcNum);
      window.location.href = '/recharge/refill/gift-complete?befrSvcNum=' + fomattedBefrSvcNum;
    } else {
      this._showFailAlert(resp);
    }
  },

  _sendFail: function (err) {
    this._showFailAlert(err);
  },

  _showFailAlert: function (resp) {
    var RESP_CODE = {
      RCG3003: 'RCG3003',
      ZORDE4011: 'ZORDE4011',
      RCG3005: 'RCG3005',
      RCG3006: 'RCG3006'
    };
    switch ( resp.code ) {
      case RESP_CODE.ZORDE4011:
        window.location.href = '/recharge/refill/gift-products';
        break;
      case RESP_CODE.RCG3003:
        alert('리필쿠폰은 가족 구성원에게 쿠폰유효기간 내 최대 2회까지 선물하실 수 있습니다.');
        break;
      case RESP_CODE.RCG3005:
        alert('선물 받으시는 분께서 선물 받을 수 있는 횟수가 초과되셨습니다. \n 리필쿠폰은 가족구성원에게 연간 최대 2회까지만 선물 받으실 수 있습니다.');
        break;
      case RESP_CODE.RCG3006:
        alert('팅요금제 이용 고객님은 가족간 리필쿠폰 선물이 불가합니다.');
        break;
      default:
        alert(resp.orgDebugMessage);
        break;
    }
  },

  _setDisableStatus: function () {
    var disabled = !(10 <= this._$inputPhone.val().length);
    this._$btnNext.attr('disabled', disabled);
  },

  _getFormattedPhoneNumber: function (phoneNumber) {
    var getDashedNumber = function (phoneNumber) {
      var str = '';
      if ( phoneNumber.length <= 10 ) {
        str += phoneNumber.substr(0, 3);
        str += '-';
        str += phoneNumber.substr(3, 3);
        str += '-';
        str += phoneNumber.substr(6);
      } else {
        str += phoneNumber.substr(0, 3);
        str += '-';
        str += phoneNumber.substr(3, 4);
        str += '-';
        str += phoneNumber.substr(7);
      }
      return str;
    };
    var getMaskingPhoneNumber = function (mpn) {
      var tmpArr = mpn.split('-');
      var MASKING_MARK = '*';
      tmpArr[1] = Tw.StringHelper.masking(tmpArr[1], MASKING_MARK, 2);
      tmpArr[2] = Tw.StringHelper.masking(tmpArr[2], MASKING_MARK, 2);
      return tmpArr.join('-');
    };
    return getMaskingPhoneNumber(getDashedNumber(phoneNumber));
  }
});
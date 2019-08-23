/**
 * @file myt-fare.bill.prepay.sdk.skpay.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.08.20
 * @desc SK pay SDK 연결
 */

/**
 * @namespace
 * @desc SK pay SDK 연결
 */
Tw.MyTDataPrepaySKPaySdk = function (params) {
  this.$container = params.$element;
  this._data = params.data;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
};

Tw.MyTDataPrepaySKPaySdk.prototype = {
  goSkpay: function (e) {
    try {
      var _itemsName = '';
      var _linChnlClCd = '';
      
      if (this._data.title === 'voice') {
        _itemsName = '음성1회충전'; //음성
        _linChnlClCd = 'MPS';
      } else {
        _itemsName = '데이터1회충전'; //데이터
        _linChnlClCd = 'MPD';
      }

      this._encryptedUserAgent = SKpaySDK.generateUserAgent();
      var _itemsOffered = [{
        "identifier": this._data.skpayInfo.svcMgmtNum,
        "name": _itemsName,
        "price": this._data.requestSum, //충전총금액,
        "category": "PPS충전" //fix
      }];
      var _acceptedPaymentMethods = [];
      _acceptedPaymentMethods.push({ category: "CreditCard"});
      _acceptedPaymentMethods.push({ category: "DebitCard"});
      _acceptedPaymentMethods.push({ category: "DirectDebit"});
  
      var dateReq = {
        "linChnlClCd" : _linChnlClCd, //진입구분
        "totPayAmt": this._data.requestSum, //충전총금액
        "encryptedUserAgent": this._encryptedUserAgent, //User Agent
        "offer": {
          "identifier": '',
          "name": 'SKT 요금', //fix
          "price": this._data.requestSum, //충전총금액
          "itemsOffered": _itemsOffered,
          "acceptedPaymentMethods": _acceptedPaymentMethods,
          "offeredBy": {
            "identifier": "skt-tworld" //fix
          }
        }
      };

      this._apiService.request(Tw.API_CMD.BFF_06_0085, dateReq)
        .done($.proxy(this._onSuccessSkpayAuth, this))
        .fail($.proxy(this._onFailSkpayAuth, this));
    } catch (e) {
      if (e instanceof ReferenceError) {
        Tw.Error(Tw.ALERT_MSG_SKPAY.NOT_RESPONSE.CODE, Tw.ALERT_MSG_SKPAY.NOT_RESPONSE.CONTENTS).pop();
      }
    }
  },
    /**
   * @function
   * @desc SK pay 납부 API 성공 시 SK Pay 페이지 호출
   * @param resp
   */
  _onSuccessSkpayAuth: function (resp) {
    Tw.CommonHelper.endLoading('.popup-page');

    if (resp.code === Tw.API_CODE.CODE_00) {
      if (this._data.title === 'voice') {
        _redirectUri = this._data.skpayInfo.redirectUri + '?dataKey=' + resp.result.orderNumber + "&source=" + this._data.title
        + "&previousAmount=" + this._data.skpayInfo.previousAmount + "&afterAmount=" + this._data.skpayInfo.afterAmount + "&rechargeAmount=" + this._data.skpayInfo.rechargeAmount
        + "&sms=" + this._data.skpayInfo.sms + "&email=" + this._data.skpayInfo.email
      } else {
        _redirectUri = this._data.skpayInfo.redirectUri + '?dataKey=' + resp.result.orderNumber + "&source=" + this._data.title
        + "&mb=" + this._data.skpayInfo.mb + "&amtCd=" + this._data.skpayInfo.amtCd + "&sms=" + this._data.skpayInfo.sms + "&email=" + this._data.skpayInfo.email
      }
      SKpaySDK.performPaymentWithUI({
        authorizationGrant: resp.result.authorizationGrant,
        offerToken: resp.result.offerToken,
        orderNumber: resp.result.orderNumber,
        redirectUri: _redirectUri
      });
    }
    else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  /**
   * Error callback for _requestMembershipJoin
   * @param resp
   * @private
   */
  _onFailSkpayAuth: function (resp) {
    Tw.CommonHelper.endLoading('.popup-page');
    Tw.Error(resp.code, resp.msg).pop();
  }
};
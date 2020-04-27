/**
 * @file myt-fare.bill.prepay.sdk.skpay.js
 * @author Kyoungsup Cho (kscho@partner.sk.com)
 * @since 2019.07.24
 * @desc SK pay SDK 연결
 */

/**
 * @namespace
 * @desc SK pay SDK 연결
 */
Tw.MyTFareBillPrepaySdkSKPay = function (params) {
  this.$container = params.$element;
  this._data = params.data;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(this.$container);
};

Tw.MyTFareBillPrepaySdkSKPay.prototype = {
  goSkpay: function (e) {
    try {
      var _linChnlClCd = '';
      var _itemsName = '';
      
      if (this._data.title === 'small') {
        _linChnlClCd = 'MSS'; //소액선결제
        _itemsName = '소액결제'; //소액결제
      } else if (this._data.title === 'contents') {
        _linChnlClCd = 'MSC'; //컨텐츠이용료
        _itemsName = '콘텐츠이용료'; //콘텐츠이용료
      }

      this._encryptedUserAgent = SKpaySDK.generateUserAgent();
      var _itemsOffered = [{
        "identifier": this._data.skpayInfo.svcMgmtNum,
        "name": _itemsName,
        "price": this._data.requestSum, //선결제금액,
        "category": "선결제" //fix
      }];
      var _acceptedPaymentMethods = [];
      _acceptedPaymentMethods.push({ category: "CreditCard"});
      _acceptedPaymentMethods.push({ category: "DebitCard"});
      _acceptedPaymentMethods.push({ category: "DirectDebit"});
  
      var dateReq = {
        "linChnlClCd": _linChnlClCd, //진입구분
        "totPayAmt": this._data.requestSum, //총선결제금액
        "encryptedUserAgent": this._encryptedUserAgent, //User Agent
        "offer": {
          "identifier": '',
          "name": 'SKT 요금', //fix
          "price": this._data.requestSum, //선결제금액
          "itemsOffered": _itemsOffered,
          "acceptedPaymentMethods": _acceptedPaymentMethods,
          "offeredBy": {
            "identifier": "skt-tworld" //fix
          }
        }
      };

      this._apiService.request(Tw.API_CMD.BFF_07_0099, dateReq)
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
      SKpaySDK.performPaymentWithUI({
        authorizationGrant: resp.result.authorizationGrant,
        offerToken: resp.result.offerToken,
        orderNumber: resp.result.orderNumber,
        redirectUri: this._data.skpayInfo.redirectUri + '?dataKey=' + resp.result.orderNumber + "&source=" + this._data.title
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
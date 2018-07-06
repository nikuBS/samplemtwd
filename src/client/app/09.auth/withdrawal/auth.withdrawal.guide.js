/**
 * FileName: auth.withdrawal.guide.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.03
 */

 Tw.AuthWithdrawalGuide = function (rootEl) {
   this.$container = rootEl;

   this._bindEvent();
 };

 Tw.AuthWithdrawalGuide.prototype = {
   _bindEvent: function () {
     this.$container.on('click', '.btn-next', $.proxy(this._requestIfForeigner, this));
   },
   _requestIfForeigner: function () {
     Tw.Api.request(Tw.API_CMD.BFF_03_0011)
       .done(function (res) {
         if (res.code === '00') {
           var isForeigner = res.result.frgnrClCd === '9' ? true : false;
           this._showVerification(isForeigner);
         } else {
           Tw.Popup.openAlert(Tw.POPUP_TITLE.NOTIFY, res.msg);
         }
       })
       .fail(function (err) {
         Tw.Logger.error('BFF_03_0011 Fail', err);
       });
   },
   _showVerification: function(isForeigner) {
     // show popup
   },
   _complete: function() {
     // TODO: check and move to survey
   }
 };

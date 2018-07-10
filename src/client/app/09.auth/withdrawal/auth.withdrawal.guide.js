/**
 * FileName: auth.withdrawal.guide.js
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.07.03
 */

 Tw.AuthWithdrawalGuide = function (rootEl) {
   this.$container = rootEl;
   this._popupService = Tw.Popup;
   this._apiService = Tw.Api;

   this._bindEvent();
 };

 Tw.AuthWithdrawalGuide.prototype = {
   _bindEvent: function () {
     this.$container.on('click', '.btn-next', $.proxy(this._requestIfForeigner, this));
   },
   _requestIfForeigner: function () {
     this._apiService.request(Tw.API_CMD.BFF_03_0011)
       .done($.proxy(this._onForiegnerRequestDone, this))
       .fail(function (err) {
         Tw.Logger.error('BFF_03_0011 Fail', err);
       });
   },
   _onForiegnerRequestDone: function (res) {
     if (res.code === '00') {
       var isForeigner = res.result.frgnrClCd === '9' ? true : false;
       this._showKYC(isForeigner);
     } else {
       this._popupService.openAlert(res.msg);
     }
   },
   _showKYC: function (isForeigner) {
     var hbsFile = '';
     if (isForeigner) {
       hbsFile = 'CO_01_05_01_02_P02';
     } else {
       hbsFile = 'CO_01_05_01_02_P01';
     }
     this._popupService.open({
        hbs: hbsFile
     }, $.proxy(this._onOpenKYC, this));
   },
   _onOpenKYC: function ($layer) {
     console.log($layer);
     $layer.on('click', '[data-target="sendTextCancelBtn"]', $.proxy(this._closePopup, this));
     $layer.on('click', '[data-target="sendTextBtn"]', $.proxy(this._onConfirmKYC, this, $layer));
   },
   _onConfirmKYC: function ($layer) {
     var name = $layer.find('[aria-labelledby="aria-citation-name"]').val();
     var birth = $layer.find('[aria-labelledby="aria-citation-birth"]').val();
     if (Tw.FormatHelper.isEmpty(name)) {
       this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_AUTH.WITHDRAW_A02_01);
       return;
     }
     if (Tw.FormatHelper.isEmpty(birth)) {
       this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, Tw.MSG_AUTH.WITHDRAW_A02_02);
       return;
     }

     this._apiService.request(Tw.API_CMD.BFF_03_0002, { name: name, birthDt: birth })
       .done($.proxy(this._onKycRequestDone, this))
       .fail(function (err) {
         Tw.Logger.error('BFF_03_0002 Fail', err);
       });
   },
   _onKycRequestDone: function (res) {
     if (res.code === '00') {
       this._closePopup();
       window.location = '/auth/withdrawal/survey';
     } else {
       this._popupService.openAlert(Tw.POPUP_TITLE.NOTIFY, res.msg);
     }
   },
   _closePopup: function () {
     this._popupService.close();
   }
 };

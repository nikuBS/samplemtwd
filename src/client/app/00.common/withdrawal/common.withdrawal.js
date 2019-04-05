/**
 * @file common.withdrawal.js
 * @author Jayoon Kong (jayoon.kong@sk.com)
 * @since 2018.10.31
 */

 Tw.CommonWithdrawal = function () {
   this._popupService = Tw.Popup;
   this._apiService = Tw.Api;

   this._init();
 };

 Tw.CommonWithdrawal.prototype = {
   _init: function () {
     this._popupService.open({
       hbs: 'CO_ME_01_05_01_01'
     },
       $.proxy(this._bindEvent, this),
       $.proxy(this._onCertify, this),
       'withdrawal-guide'
     );
   },
   _bindEvent: function ($layer) {
     $layer.on('click', '.btn-next', $.proxy(this._requestIfForeigner, this));
   },
   _requestIfForeigner: function () {
     this._apiService.request(Tw.API_CMD.BFF_03_0011)
       .done($.proxy(this._onForiegnerRequestDone, this))
       .fail($.proxy(this._error, this));
   },
   _onForiegnerRequestDone: function (res) {
     if (res.code === '00') {
       this._isForeigner = res.result.frgnrClCd === '9';
       this._isResponsed = true;
       this._popupService.close();
     } else {
       this._error(res);
     }
   },
   _onCertify: function () {
     if (this._isResponsed) {
       this._showKYC();
     }
   },
   _showKYC: function () {
     var hbsFile = '';
     if (this._isForeigner) {
       hbsFile = 'CO_ME_01_05_01_02_02';
     } else {
       hbsFile = 'CO_ME_01_05_01_02_01';
     }
     this._popupService.open({
        hbs: hbsFile
     },
       $.proxy(this._onOpenKYC, this),
       $.proxy(this._onSurvey, this),
       'withdrawal-cert');
   },
   _onOpenKYC: function ($layer) {
     this._focusService = new Tw.InputFocusService($layer, $layer.find('.btn-certify'));

     $layer.on('keyup', '.required-input-field', $.proxy(this._checkIsAbled, this, $layer));
     $layer.on('click', '.cancel', $.proxy(this._checkIsAbled, this, $layer));
     $layer.on('click', '.btn-certify', $.proxy(this._onConfirmKYC, this, $layer));
   },
   _checkIsAbled: function ($layer) {
     this._hideErrorMessage($layer);

     if ($.trim($layer.find('.fe-name').val()) !== '' && $.trim($layer.find('.fe-birth').val()) !== '') {
       $layer.find('.btn-certify').removeAttr('disabled');
     } else {
       $layer.find('.btn-certify').attr('disabled', 'disabled');
     }
   },
   _onConfirmKYC: function ($layer) {
     var name = $.trim($layer.find('.fe-name').val());
     var birth = $.trim($layer.find('.fe-birth').val());

     this._apiService.request(Tw.API_CMD.BFF_03_0002, { name: name, birthDt: birth })
       .done($.proxy(this._onKycRequestDone, this, $layer))
       .fail($.proxy(this._showErrorMessage, this, $layer));
   },
   _onKycRequestDone: function ($layer, res) {
     if (res.code === '00') {
       this._isCertified = true;
       this._popupService.close();
     } else {
       this._showErrorMessage($layer);
     }
   },
   _showErrorMessage: function ($layer) {
     $layer.find('.fe-input-box').addClass('error');
     $layer.find('.error-txt').show();
   },
   _hideErrorMessage: function ($layer) {
     $layer.find('.fe-input-box').removeClass('error');
     $layer.find('.error-txt').hide();
   },
   _onSurvey: function () {
     if (this._isCertified) {
       new Tw.CommonWithdrawalSurvey();
     }
   },
   _error: function (err) {
     Tw.Error(err.code, err.msg).pop();
   }
 };

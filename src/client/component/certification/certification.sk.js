/**
 * FileName: certification.sk.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.08.20
 */

Tw.CertificationSk = function () {
  this._certSms = new Tw.CertificationSkSms();
  this._certKeyin = new Tw.CertificationSkKeyin();
  this._certMotp = new Tw.CertificationSkMotp();

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._nativeService = Tw.Native;

  this._svcInfo = null;
  this._authUrl = null;
  this._authKind = null;
  this._command = null;
  this._callback = null;

  this._callbackParam = null;
  this._smsType = '';
  this._enableKeyin = false;
  this._defaultKeyin = false;
  this._securityAuth = false;
  this._securityMdn = '';
  this._seqNo = '';
  this._onKeyin = false;
};


Tw.CertificationSk.prototype = {
  SMS_CERT_ERROR: {
    SMS2001: 'SMS2001',
    SMS2002: 'SMS2002',
    SMS2003: 'SMS2003',
    SMS2004: 'SMS2004',
    SMS2005: 'SMS2005',
    SMS2006: 'SMS2006',
    SMS2007: 'SMS2007',
    SMS2008: 'SMS2008',
    SMS2009: 'SMS2009',
    SMS2010: 'SMS2010',
    SMS2011: 'SMS2011',
    SMS2013: 'SMS2013',
    SMS2014: 'SMS2014',
    SMS3001: 'SMS3001'
  },
  open: function (svcInfo, authUrl, authKind, command, callback, opMethods, optMethods, isWelcome, methodCnt) {
    this._callbackParam = null;
    this._svcInfo = svcInfo;
    this._authUrl = authUrl;
    this._authKind = authKind;
    this._command = command;
    this._callback = callback;

    this._getAllSvcInfo(opMethods, optMethods, isWelcome, methodCnt);
  },
  _checkSmsType: function (opMethods) {
    if ( opMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE) !== -1 ) {
      this._smsType = Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE;
    } else {
      this._smsType = Tw.AUTH_CERTIFICATION_METHOD.SK_SMS;
    }
  },
  _checkOption: function (optMethods) {
    if ( optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SMS_KEYIN) !== -1 ) {
      this._enableKeyin = true;
      this._defaultKeyin = this._svcInfo.smsUsableYn === 'N' || this._svcInfo.svcStCd === Tw.SVC_STATE.SP;

    }
    if ( optMethods.indexOf(Tw.AUTH_CERTIFICATION_METHOD.SMS_SECURITY) !== -1 && Tw.BrowserHelper.isApp() && Tw.BrowserHelper.isAndroid() ) {
      this._securityAuth = true;

    }
  },
  _getAllSvcInfo: function (opMethods, optMethods, isWelcome, methodCnt) {
    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done($.proxy(this._onSuccessAllSvcInfo, this, opMethods, optMethods, isWelcome, methodCnt));
  },
  _onSuccessAllSvcInfo: function (opMethods, optMethods, isWelcome, methodCnt, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      _.map(resp.result, $.proxy(function (info) {
        if ( info.repSvc === 'Y' ) {
          this._svcInfo = info;
        }
      }, this));

      this._openSmsOnly(opMethods, optMethods, isWelcome, methodCnt);
    } else {
      // error
    }
  },
  _openSmsOnly: function (opMethods, optMethods, isWelcome, methodCnt) {
    this._checkSmsType(opMethods);
    this._checkOption(optMethods);

    this._popupService.open({
      hbs: 'CO_CE_02_02_01_02',
      layer: true,
      data: {
        isWelcome: isWelcome,
        isOnly: methodCnt === 1,
        sLogin: this._svcInfo.loginType === Tw.AUTH_LOGIN_TYPE.EASY,
        masking: this._authKind === Tw.AUTH_CERTIFICATION_KIND.A,
        svcNum: this._svcInfo.svcNum,
        enableKeyin: this._enableKeyin
      }
    }, $.proxy(this._onOpenSmsOnly, this), $.proxy(this._onCloseSmsOnly, this));
  },
  _onOpenSmsOnly: function ($popupContainer) {
    this.$checkKeyin = $popupContainer.find('#fe-check-keyin');
    this.$inputMdn = $popupContainer.find('#fe-input-mdn');
    this.$inputCert = $popupContainer.find('#fe-input-cert');
    this.$btCert = $popupContainer.find('#fe-bt-cert');
    this.$btReCert = $popupContainer.find('#fe-bt-recert');
    this.$btCertAdd = $popupContainer.find('#fe-bt-cert-add');
    this.$btConfirm = $popupContainer.find('#fe-bt-confirm');
    this.$validCert = $popupContainer.find('#aria-sms-exp-desc2');
    this.$errorCert = $popupContainer.find('#aria-sms-exp-desc1');
    this.$errorConfirm = $popupContainer.find('#aria-sms-exp-desc3');

    $popupContainer.on('click', '#fe-other-cert', $.proxy(this._onClickOtherCert, this));

    this.$checkKeyin.on('change', $.proxy(this._onChangeKeyin, this));
    this.$inputMdn.on('input', $.proxy(this._onInputMdn, this));
    this.$inputCert.on('input', $.proxy(this._onInputCert, this));
    this.$btCert.on('click', $.proxy(this._onClickCert, this));
    this.$btReCert.on('click', $.proxy(this._onClickReCert, this));
    this.$btCertAdd.on('click', $.proxy(this._onClickCertAdd, this));
    this.$btConfirm.on('click', $.proxy(this._onClickConfirm, this));

    if ( this._defaultKeyin ) {
      this.$checkKeyin.trigger('click');
      this.$checkKeyin.attr('disabled', true);
    } else {
      this._checkCertType();
    }

    if ( this._securityAuth ) {
      this.$btReCert.parent().addClass('none');
    }
  },
  _onCloseSmsOnly: function () {
    if ( !Tw.FormatHelper.isEmpty(this._callbackParam) ) {
      this._callback(this._callbackParam);
    }
  },
  _onInputMdn: function () {
    var mdnLength = this.$inputMdn.val().length;
    if ( mdnLength === Tw.MIN_MDN_LEN || mdnLength === Tw.MAX_MDN_LEN ) {
      this.$btCert.attr('disabled', false);
    } else {
      this.$btCert.attr('disabled', true);
    }
  },
  _onInputCert: function () {
    var inputCert = this.$inputCert.val();
    if ( inputCert.length >= Tw.DEFAULT_CERT_LEN ) {
      this.$inputCert.val(inputCert.slice(0, Tw.DEFAULT_CERT_LEN));
      this.$btConfirm.attr('disabled', false);
    } else {
      this.$btConfirm.attr('disabled', true);
    }
  },

  _onClickOtherCert: function () {
    this._callbackParam = { code: 'CERT0001' };
    this._popupService.close();
  },
  _onChangeKeyin: function (event) {
    var $target = $(event.target);
    if ( $target.is(':checked') ) {
      this._onKeyin = true;
      this.$inputMdn.prop('readonly', false);
      this.$inputMdn.val('');
      this.$inputMdn.parents('#fe-inputbox-mdn').removeClass('readonly');
      this.$btReCert.parent().addClass('none');
      this.$btCertAdd.parent().addClass('none');
      this.$btCert.parent().removeClass('none');
    } else {
      this.$inputMdn.prop('readonly', true);
      this.$inputMdn.val(this._svcInfo.svcNum);
      this.$inputMdn.parents('#fe-inputbox-mdn').addClass('readonly');
      this.$btCert.parent().addClass('none');
      if ( !this._securityAuth ) {
        this.$btReCert.parent().removeClass('none');
      }
    }
  },
  _getMdn: function () {
    this._nativeService.send(Tw.NTV_CMD.GET_MDN, {}, $.proxy(this._onMdn, this));
  },
  _onMdn: function (resp) {
    if ( resp.resultCode === Tw.NTV_CODE.CODE_00 ) {
      this._securityMdn = resp.params.mdn;
      this._requestCert();
    } else {
      // error
    }
  },
  _checkCertType: function () {
    if ( this._securityAuth && Tw.FormatHelper.isEmpty(this._securityMdn) ) {
      this._getMdn();
    } else {
      this._requestCert();
    }
  },
  _requestCert: function () {
    if ( this._smsType === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS ) {
      this._apiService.request(Tw.API_CMD.BFF_01_0014, {
        jobCode: 'NFM_TWD_MBIMASK_AUTH',
        receiverNum: this._onKeyin ? this.$inputMdn.val() : '',
        mdn: this._securityMdn
      }).done($.proxy(this._onSuccessCert, this));
    } else if ( this._smsType === Tw.AUTH_CERTIFICATION_METHOD.SK_SMS_RE ) {
      this._apiService.request(Tw.API_CMD.BFF_01_0057, {
        jobCode: 'NFM_TWD_MBIMASK_AUTH',
        mdn: this._securityMdn
      }).done($.proxy(this._onSuccessCert, this));

    }
  },
  _onSuccessCert: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.seqNo = resp.result.seqNo;
      this.$validCert.removeClass('none');
      this.$btReCert.parent().addClass('none');
      this.$btCert.parent().addClass('none');
      this.$btCertAdd.parent().removeClass('none');
    } else {

    }
  },
  _onClickCert: function () {
    this._requestCert();
  },
  _onClickReCert: function () {
    this._requestCert();
  },
  _onClickCertAdd: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0027, { seqNo: this._seqNo })
      .done($.proxy(this._successCertAdd, this));
  },
  _successCertAdd: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.$btReCert.parent().removeClass('none');
      this.$btCertAdd.parent().addClass('none');
    }
  },
  _onClickConfirm: function () {
    this._apiService.request(Tw.API_CMD.BFF_01_0015, {
      jobCode: 'NFM_TWD_MBIMASK_AUTH',
      authNum: this.$inputCert.val(),
      authUrl: this._authUrl,
      receiverNum: this._onKeyin ? this.$inputMdn.val() : '',
      authKind: this._authKind,
      prodAuthKey: this._authKind === Tw.AUTH_CERTIFICATION_KIND.R ? this._command.params.prodId + this._command.params.prodProctypeCd : ''
    }).done($.proxy(this._successConfirm, this));
  },
  _successConfirm: function (resp) {
    // if ( resp.code === Tw.API_CODE.CODE_00 ) {
    //
    // }
    this._callbackParam = resp;
    this._popupService.close();
  }
};
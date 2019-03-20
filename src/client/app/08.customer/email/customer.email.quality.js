/**
 * FileName: customer.email.quality.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.10.29
 */

Tw.CustomerEmailQuality = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailQuality.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$wrap_tpl_quality = this.$container.find('.fe-wrap_tpl_quality');
    this.$quality_depth1 = this.$container.find('.fe-quality_depth1');
    this.tpl_quality_cell_content = Handlebars.compile($('#tpl_quality_cell_content').html());
  },

  _bindEvent: function () {
    this.$container.on('validateForm', $.proxy(this._validateForm, this));
    this.$container.on('change', '[required]', $.proxy(this._validateForm, this));
    this.$wrap_tpl_quality.on('click', '.fe-quality_register', $.proxy(this._request, this));
  },

  _request: function (e) {
    var qualityCategory = this.$quality_depth1.data('quality-depth1');

    if ( !this._isValidQualityPhone() ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.INVALID_PHONE,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(function () {
          setTimeout(function () {
            $('.fe-quality_phone').click();
            $('.fe-quality_phone').focus();
          }, 500);
        }, this),
        null,
        $(e.currentTarget)
      );

      return false;
    }

    if ( !this._isValidQualityEmail() ) {
      this._popupService.openAlert(
        Tw.CUSTOMER_EMAIL.INVALID_EMAIL,
        Tw.POPUP_TITLE.NOTIFY,
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(function () {
          setTimeout(function () {
            $('.fe-quality_email').click();
            $('.fe-quality_email').focus();
          }, 500);
        }, this),
        null,
        $(e.currentTarget)
      );

      return false;
    }


    switch ( qualityCategory ) {
      case 'cell':
        this._requestCell($(e.currentTarget));
        break;
      case 'internet':
        this._requestInternet($(e.currentTarget));
        break;
      default:
    }
  },

  _makeParams: function () {
    var arrPhoneNumber = $('.fe-quality_phone').val().split('-');
    var params = {
      connSite: Tw.BrowserHelper.isApp() ? '19' : '15',
      cntcNumClCd: $('.fe-quality-cntcNumClCd').find(':checked').val(),
      inqSvcClCd: $('.fe-quality-inqSvcClCd').find(':checked').val(),
      content: this.$wrap_tpl_quality.find('.fe-text_content').val(),
      cntcNum1: arrPhoneNumber[0],
      cntcNum2: arrPhoneNumber[1],
      cntcNum3: arrPhoneNumber[2],
      email: $('.fe-quality_email').val(),
      smsRcvYn: $('.fe-quality_sms').prop('checked') ? 'Y' : 'N'
    };

    return params;
  },

  _requestCell: function ($target) {
    var elSelectedLine = this.$wrap_tpl_quality.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var $elInputline = this.$wrap_tpl_quality.find('.fe-quality-line');
    var elInputlineVal = $elInputline.is('button') ? $elInputline.text() : $elInputline.val();
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString().replace(/-/gi, '') : '0'; // 현재 와이브로 옵션 없으므로 - 대시만 없애는 방향으로 가능
    var selSvcNum = !!elInputlineVal ? elInputlineVal : '';

    var htParams = $.extend(this._makeParams(), {
      inptZip: $('.fe-zip').val(),
      inptBasAddr: $('.fe-main-address').val(),
      inptDtlAddr: $('.fe-detail-address').val(),
      selSvcMgmtNum: selSvcMgmtNum,
      content: this.tpl_quality_cell_content({
        place: $('.fe-place').text(),
        place_detail: $('.fe-place_detail').text(),
        occurrence: $('.fe-occurrence').text(),
        text_name: $('.fe-text_name').val(),
        text_content: this.$wrap_tpl_quality.find('.fe-text_content').val(),
        occurrence_date: $('.fe-occurrence_date').text(),
        occurrence_detail: $('.fe-occurrence_detail').text(),
        inqSvcClCd: $('.fe-quality-inqSvcClCd').find(':checked').parent().text().trim(),
        svcNum: $('.fe-quality-line').is('input') ? $('.fe-quality-line').val() : $('.fe-quality-line').text().trim(),
        inptZip: $('.fe-zip').val(),
        inptBasAddr: $('.fe-main-address').val(),
        inptDtlAddr: $('.fe-detail-address').val()
      })
    });

    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0044, htParams)
      .done($.proxy(this._onSuccessRequest, this, $target));
  },

  _requestInternet: function ($target) {
    var elSelectedLine = this.$wrap_tpl_quality.find('[data-svcmgmtnum]').data('svcmgmtnum');
    var $qualityLine = this.$wrap_tpl_quality.find('.fe-quality-line'); 
    var elInputline = $qualityLine.length ? ( 
                        $qualityLine.is('.fe-numeric') ? $qualityLine.val().replace(/-/gi, '') : $qualityLine.val()
                      ) : '';
    var selSvcMgmtNum = !!elSelectedLine ? elSelectedLine.toString() : '0';
    var selSvcNum = !!elInputline ? elInputline : '';

    var htParams = $.extend(this._makeParams(), {
      subject: this.$wrap_tpl_quality.find('.fe-text_title').val(),
      inptZip: $('.fe-zip').val(),
      inptBasAddr: $('.fe-main-address').val(),
      inptDtlAddr: $('.fe-detail-address').val(),
      selSvcMgmtNum: selSvcMgmtNum
    });

    if ( selSvcMgmtNum === '0' ) {
      htParams = $.extend(htParams, { selSvcNum: selSvcNum });
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0045, htParams)
      .done($.proxy(this._onSuccessRequest, this, $target));
  },

  _onSuccessRequest: function ($target, res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this._history.replaceURL('/customer/emailconsult/complete?email=' + $('.fe-quality_email').val());
    } else {
      Tw.Error(res.code, res.msg).pop(null, $target);
    }
  },

  _validateForm: function () {
    var arrValid = [];

    this.$wrap_tpl_quality.find('[required]').each(function (nIndex, item) {
      if ( $(item).prop('type') === 'checkbox' ) {
        arrValid.push($(item).prop('checked'));
      }

      if ( $(item).prop('type') === 'number' ) {
        var isValidNumber = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidNumber);
      }

      if ( $(item).prop('type') === 'text' ) {
        var isValidText = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidText);
      }

      if ( $(item).prop('type') === 'textarea' ) {
        var isValidTextArea = $(item).val().length !== 0 ? true : false;
        arrValid.push(isValidTextArea);
      }
    });

    if ( arrValid.indexOf(false) === -1 && !!this.$quality_depth1.data('qualityDepth1') ) {
      $('.fe-quality_register').prop('disabled', false);
    } else {
      $('.fe-quality_register').prop('disabled', true);
    }
  },

  _isValidQualityPhone: function () {
    var sPhone = $('.fe-quality_phone').val();

    return Tw.ValidationHelper.isCellPhone(sPhone) || Tw.ValidationHelper.isTelephone(sPhone);
  },

  _isValidQualityEmail: function () {
    var sEmail = $('.fe-quality_email').val();

    return Tw.ValidationHelper.isEmail(sEmail);
  }
};
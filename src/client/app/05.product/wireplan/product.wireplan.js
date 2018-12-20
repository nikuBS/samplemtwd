Tw.ProductWireplan = function(rootEl) {
  this.container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.ProductWireplan.prototype = {
  _bindEvent: function() {
    this.container.on('click', '#fe-reservation', $.proxy(this._handleClickReservation, this));
  },

  _handleClickReservation: function() {
    if (this._hasReservation) {
      if (this._hasReservation.isNeedDocument) {
        this._openGoToHistoryPopup();
      } else {
        this._openSelectProductType();
      }
    } else {
      this._apiService.request(Tw.API_CMD.BFF_10_0078, {}).done($.proxy(this._handleGetReservation, this));
    }
  },

  _handleGetReservation: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._hasReservation = this._convertReservation(resp.result);
    if (Tw.FormatHelper.isEmpty(this._hasReservation) || !this._hasReservation.isNeedDocument) {
      this._openSelectProductType();
    } else {
      this._openGoToHistoryPopup();
    }
  },

  _convertReservation: function(result) {
    var latestItem = result.necessaryDocumentInspectInfoList[0];

    if (latestItem && latestItem.nextSchddt) {
      isExpired = Tw.DateHelper.getDifference(latestItem.nextSchddt) <= 0;
      return {
        isNeedDocument:
          (!isExpired && latestItem.ciaInsptRslt === PRODUCT_CALLPLAN.CIA_INSPT_RSLT) || (isExpired && latestItem.abnSaleOpClCd === '000'),
        isProcess: !isExpired && FormatHelper.isEmpty(latestItem.abnSaleOpClCd)
      };
    }

    return {};
  },

  _openGoToHistoryPopup: function() {
    var ALERT = Tw.PRODUCT_CONFIRM_GO_TO_DOCUMENT;
    this._popupService.openConfirmButton(
      null,
      ALERT.TITLE,
      $.proxy(this._go, this, '/product/wireplan/join/require-document/apply'),
      $.proxy(this._openSelectProductType, this),
      ALERT.GO_RESERVATION_BTN,
      ALERT.GO_DOCUMENT_BTN
    );
  },

  _go: function(url) {
    window.location.href = url;
  },

  _openSelectProductType: function() {
    this._popupService.open(
      {
        hbs: 'actionsheet01', // hbs의 파일명
        btnfloating: { attr: 'type="button"', class: 'tw-popup-closeBtn', txt: Tw.BUTTON_LABEL.CLOSE },
        data: [{ list: Tw.PRODUCT_JOIN_TYPE }],
        layer: true
      },
      $.proxy(this._handleOpenProductType, this),
      $.proxy(this._closeProductType, this)
    );
  },

  _handleOpenProductType: function($layer) {
    $layer.on('click', 'li.type1', $.proxy(this._goToReservation, this));
  },

  _goToReservation: function(e) {
    this._typeCode = $(e.currentTarget)
      .find('input')
      .data('type-code');

    this._popupService.close();
  },

  _closeProductType: function() {
    if (this._typeCode) {
      this._go('/product/wireplan/join/reservation?type_cd=' + this._typeCode);
    }
  }
};

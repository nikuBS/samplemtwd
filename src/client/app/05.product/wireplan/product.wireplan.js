Tw.ProductWireplan = function(rootEl) {
  this.container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._bindEvent();
};

Tw.ProductWireplan.prototype = {
  _bindEvent: function() {
    this.container.on('click', '#fe-reservation', $.proxy(this._openSelectProductType, this));
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
      window.location.href = '/product/wireplan/join/reservation?type_cd=' + this._typeCode;
    }
  }
};

/**
 * FileName: product.roaming.info.guide.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingGuide = function (rootEl) {
  this.$container = rootEl;

  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._bindBtnEvents();
};

Tw.ProductRoamingGuide.prototype = {
    _bindBtnEvents: function () {
      this.$container.on('click', '#fe-rm-info-slide1', $.proxy(this._goLteGuide, this));
      this.$container.on('click', '#fe-rm-info-slide2', $.proxy(this._goSecureTroaming, this));
      this.$container.on('click', '#fe-rm-info-slide3', $.proxy(this._goDataRoaming, this));
      this.$container.on('click', '#fe-rm-smart-guide', $.proxy(this._onDowonloadGuid, this));
      this.$container.on('click', '#fe-rm-phone-guide', $.proxy(this._onDowonloadGuid, this));
      this.$container.on('click', '#fe-rm-rental-guide', $.proxy(this._onDowonloadGuid, this));
      // this.$container.on('click', '#fe-rm-fee-detail', $.proxy(this._goLoadDetailView, this));
      this.$container.on('click', '#fe-rm-add-guide', $.proxy(this._goLoadAddView, this));
      this.$container.on('click', '#fe-rm-ceter-detail', $.proxy(this._goLoadCenterView, this));
      // this.$container.on('click', '#fe-rm-op-detail', $.proxy(this._goLoadDetailView, this));
      this.$container.on('click', '#fe-rm-airport-detail', $.proxy(this._goLoadAirportCenter, this));
      this.$container.on('click', '#fe-rm-cruise-detail', $.proxy(this._goLoadCruiseService, this));
      this.$container.on('click', '#fe-rm-faq', $.proxy(this._goLoadFaq, this));
  },
  _goLteGuide : function() {
    this._history.goLoad('/product/roaming/info/lte');
  },
  _goSecureTroaming : function () {
    this._history.goLoad('/product/roaming/info/secure-troaming');
  },
  _goDataRoaming : function () {
    this._history.goLoad('/product/roaming/info/data-roaming');
  },
  _onDowonloadGuid : function (e) {
    var $target = $(e.target);
    var targetName = $target.attr('name');

    switch(targetName){
      case 'smartGuide':
        break;
      case 'phoneGuide':
        break;
      case 'rentalGuide':
        break;
    }
  },
  // _goLoadDetailView : function () {

  //   console.log('go roaming fee page');
  //   //this._history.goLoad('/customer/faq');
  //     this._prodId = 'NA00003196';
  //   this._history.goLoad('/product/detail/' + this._prodId);
  // },
  _goLoadAddView : function () {

  },
  _goLoadCenterView : function () {

  },
  _goLoadAirportCenter : function () {

  },
  _goLoadCruiseService : function () {

  },
  _goLoadFaq : function () {
    this._history.goLoad('/customer/faq');
  }

};

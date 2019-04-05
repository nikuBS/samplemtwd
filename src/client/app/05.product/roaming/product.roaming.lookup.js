/**
 * @file product.roaming.lookup.js
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.03
 */

Tw.ProductRoamingLookup = function (rootEl,prodBffInfo,prodId) {

  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);
  this._prodBffInfo = prodBffInfo;
  this.$serviceTipElement = this.$container.find('.tip-view-btn');
  this._showDateFormat = 'YYYY. MM. DD.';
  this._init();
  this._bindBtnEvents();
  this._tooltipInit(prodId);
};

Tw.ProductRoamingLookup.prototype = {
  _init : function(){
    var startDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcStartDt,this._showDateFormat,'YYYYMMDD');
    var endDate = Tw.DateHelper.getShortDateWithFormat(this._prodBffInfo.svcEndDt,this._showDateFormat,'YYYYMMDD');
    this.$container.find('#start_date').text(startDate+' '+this._prodBffInfo.svcStartTm+':00');
    this.$container.find('#end_date').text(endDate+' '+this._prodBffInfo.svcEndTm+':00');
    if(isNaN(this._prodBffInfo.prodFee)){
      this.$container.find('.point').text(this._prodBffInfo.prodFee);
    }else{
      this.$container.find('.point').text(Tw.FormatHelper.addComma(this._prodBffInfo.prodFee+Tw.CURRENCY_UNIT.WON));
    }
  },
  _bindBtnEvents: function () {
    this.$container.on('click','.popup-closeBtn',$.proxy(this._goBack,this));
  },
  _goBack : function () {
    this._history.goBack();
  },
  _tooltipInit : function (prodId) {
    switch (prodId) {
      case 'NA00004088':
      case 'NA00005047':
      case 'NA00005502':
      case 'NA00004883':
      case 'NA00004326':
        this.$serviceTipElement.attr('id','RM_11_01_02_06_tip_01_01');
        break;
      case 'NA00005692':
      case 'NA00005695':
        this.$serviceTipElement.attr('id','RM_11_01_02_06_tip_01_02');
        break;
      case 'NA00005821':
        this.$serviceTipElement.attr('id','RM_11_01_02_06_tip_01_03');
        break;
      default:
        this.$serviceTipElement.hide();
        break;
    }
  }
};

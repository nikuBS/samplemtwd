/**
 * FileName: product.roaming.lookup.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

Tw.ProductRoamingLookup = function (rootEl,prodBffInfo,prodId) {

  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);
  this._prodBffInfo = prodBffInfo;
  this._bindBtnEvents();
  this._init();
  this.$serviceTipElement = this.$container.find('.tip-view.set-service-range');
  this._tooltipInit(prodId);
};

Tw.ProductRoamingLookup.prototype = {
    _init : function(){
        var startDate = moment(this._prodBffInfo.svcStartDt,'YYYYMMDD').format('YYYY.MM.DD');
        var endDate = moment(this._prodBffInfo.svcEndDt,'YYYYMMDD').format('YYYY.MM.DD');
        this.$container.find('#start_date').text(startDate+' '+this._prodBffInfo.svcStartTm+':00');
        this.$container.find('#end_date').text(endDate+' '+this._prodBffInfo.svcEndTm+':00');
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
            this.$container.find('.cont-box.nogaps-btm').css('display','block');
            break;
        case 'NA00005821':
            this.$serviceTipElement.attr('id','RM_11_01_02_06_tip_01_03');
            break;
    }
}
};

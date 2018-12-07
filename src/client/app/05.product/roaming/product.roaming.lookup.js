/**
 * FileName: product.roaming.lookup.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

Tw.ProductRoamingLookup = function (rootEl,prodBffInfo) {

  this.$container = rootEl;
  this._history = new Tw.HistoryService(rootEl);
  this._prodBffInfo = prodBffInfo;
  this._bindBtnEvents();
  this._init();
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
    }
};

/**
 * FileName: product.roaming.setting.roaming-setup.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

Tw.ProductRoamingSettingRoamingBeginSetup = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId) {

  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._bindBtnEvents();
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodRedisInfo = prodRedisInfo;
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._apiService = Tw.Api;
  this._init();
  this.$serviceTipElement = this.$container.find('.tip-view.set-service-range');
  this._tooltipInit(prodId);
};

Tw.ProductRoamingSettingRoamingBeginSetup.prototype = {
    _init : function(){
        var startDate = moment(this._prodBffInfo.svcStartDt,'YYYYMMDD').format('YYYY. MM. DD');
        this.$container.find('#start_date').text(startDate);
        this.$container.find('#start_date').attr('data-number',this._prodBffInfo.svcStartDt);
    },
    _bindBtnEvents: function () {
      this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
      this.$container.on('click','.bt-fixed-area #do_setting',$.proxy(this._changeInformationSetting, this));
      this.$container.on('click','.bt-fixed-area #do_setting',$.proxy(this._changeInformationSetting, this));
    },
    _getDateArrFromToDay : function(range,format){
        var dateFormat = 'YYYY. MM. DD';
        var resultArr = [];
        if(format){
            dateFormat = format;
        }
        for(var i=0;i<range;i++){
            resultArr.push(moment().add(i, 'days').format(dateFormat));
        }
        return resultArr;
    },
    _convertDateArrForActionSheet : function(dateArr,attr,nowValue){
        var returnArr = [];
        for(var i=0;i<dateArr.length;i++){
            returnArr.push({'value':dateArr[i],'option':nowValue===dateArr[i]?'checked':'','attr':attr});
        }
        return returnArr;
    },

    _makeActionSheetDate : function(data){
        var returnActionSheetData = [
            {
                'list': data
            }
        ];
        return returnActionSheetData;
    },
    _btnDateEvent : function($this){
        var nowValue = $($this.currentTarget).text().trim();
        var dateArr = this._getDateArrFromToDay(30);
        var convertedArr = this._convertDateArrForActionSheet(dateArr,'data-name="'+$($this.currentTarget).attr('id')+'"',nowValue);
        var actionSheetData = this._makeActionSheetDate(convertedArr);
        if(nowValue.length<10){
            actionSheetData[0].list[0].option = 'checked';
        }
        actionSheetData[0].list[0].value+= ' ('+Tw.SELECTED_DATE_STRING.TODAY+')';
        this._openSelectDatePop(actionSheetData,'');
    },


    _bindActionSheetElementEvt : function($layer){
        $layer.on('click', '.chk-link-list button', $.proxy(this._actionSheetElementEvt, this));
        $layer.on('click', '.popup-closeBtn', $.proxy(this._actionSheetCloseEvt, this));
    },
    _actionSheetElementEvt : function($this){
        $($this.delegateTarget).find('button').removeClass('checked');
        $($this.currentTarget).addClass('checked');
    },
    _actionSheetCloseEvt : function($layer){
        var $selectedTarget = $($layer.delegateTarget).find('.chk-link-list button.checked');
        var dateValue = $selectedTarget.text().trim().substr(0,12);
        var dateAttr = $selectedTarget.attr('data-name');
        var changeTarget = this.$container.find('#'+dateAttr);
        changeTarget.text(dateValue);
        changeTarget.removeClass('placeholder');
        changeTarget.attr('data-number',dateValue.replace(/\.\ /g, ''));
        changeTarget.attr('data-idx',$selectedTarget.parent().index());
        this._validateDateValue();
    },
    _validateDateValue : function(){
        var startDate = this.$container.find('#start_date').attr('data-number');



        if(!isNaN(startDate)){
            this.$container.find('.bt-fixed-area button').removeAttr('disabled');
        }else{
            this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
        }

    },
    _validateTimeValueAgainstNow : function(paramDate,paramTime,className){
        var returnValue = false;
        var $errorsElement = this.$container.find('.error-txt.'+className);
        if((paramDate===moment().format('YYYYMMDD'))&&(parseInt(paramTime,10)<=parseInt(moment().format('HH'),10))){
            $errorsElement.removeClass('none');
        }else{
            returnValue = true;
            if(!$errorsElement.hasClass('none')){
                $errorsElement.addClass('none');
            }
        }
        return returnValue;
    },

    _openSelectDatePop: function (data,title) {
      this._popupService.open({
              hbs: 'actionsheet_select_a_type',// hbs의 파일명
              layer: true,
              title: title,
              data: data
          },
          $.proxy(this._bindActionSheetElementEvt, this),
          null,
          'select_date');
    },

    _changeInformationSetting : function () {
        var userSettingInfo = {
            'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
            'svcEndDt' : {},
            'svcStartTm' : {},
            'svcEndTm' : {},
            'startEndTerm' : {}
        };

        this._apiService.request(Tw.API_CMD.BFF_10_0085, userSettingInfo, {},this._prodId).
        done($.proxy(function (res) {
            if(res.code===Tw.API_CODE.CODE_00){
                this._historyService.goBack();
            }
        }, this));
    },
    _goBack : function(){
        this._historyService.goBack();
    },
    _tooltipInit : function (prodId) {
        switch (prodId) {
            case 'NA00003015':
                this.$container.find('.cont-box.nogaps-btm').css('display','block');
                this.$serviceTipElement.attr('id','RM_11_01_02_03_tip_01_01');
                break;
            case 'NA00004229':
            case 'NA00004230':
            case 'NA00004231':
                this.$serviceTipElement.attr('id','RM_11_01_02_03_tip_01_02');
                break;
        }
    }
};

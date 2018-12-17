/**
 * FileName: product.roaming.setting.roaming-auto.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

Tw.ProductRoamingSettingRoamingAuto = function (rootEl,prodRedisInfo,prodBffInfo,svcInfo,prodId,expireDate) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._bindBtnEvents();
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodRedisInfo = prodRedisInfo;
  this._prodBffInfo = prodBffInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
  this._expireDate = expireDate;
  this._apiService = Tw.Api;
  this._init();
};

Tw.ProductRoamingSettingRoamingAuto.prototype = {
    _init : function(){

        var startDate = moment(this._prodBffInfo.svcStartDt,'YYYYMMDD').format('YYYY. MM. DD');
        var endDate = moment(this._prodBffInfo.svcEndDt,'YYYYMMDD').format('YYYY. MM. DD');
        var startTime = this._prodBffInfo.svcStartTm;
        var endTime = this._prodBffInfo.svcEndTm;

        this.$container.find('#start_date').text(startDate);
        this.$container.find('#start_date').attr('data-number',this._prodBffInfo.svcStartDt);
        this.$container.find('#end_date').text(endDate);
        this.$container.find('#end_date').attr('data-number',this._prodBffInfo.svcEndDt);
        this.$container.find('#start_time').text(startTime);
        this.$container.find('#start_time').attr('data-number',this._prodBffInfo.svcStartTm);
        this.$container.find('#end_time').text(endTime);
        this.$container.find('#end_time').attr('data-number',this._prodBffInfo.svcEndTm);
    },
    _bindBtnEvents: function () {
      this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
      this.$container.on('click', '.bt-dropdown.time', $.proxy(this._btnTimeEvent, this));
      this.$container.on('click','.bt-fixed-area #do_setting',$.proxy(this._settingInformationSetting, this));
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
    _getTimeArr : function(){
        var timeArr = [];
        for(var i=0;i<24;i++){
            timeArr.push(i<10?'0'+i:''+i);
        }
        return timeArr;
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
    _btnTimeEvent : function($this){
        var nowValue = $($this.currentTarget).text().trim();
        var timeArr = this._getTimeArr();
        var convertedArr = this._convertDateArrForActionSheet(timeArr,'data-name="'+$($this.currentTarget).attr('id')+'"',nowValue);
        var actionSheetData = this._makeActionSheetDate(convertedArr);
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
        var startDateElement = this.$container.find('#start_date');
        var startTimeElement = this.$container.find('#start_time');
        var startDate = startDateElement.attr('data-number');
        var startTime = startTimeElement.attr('data-number');
        var endDateElement = this.$container.find('#end_date');
        var endTimeElement = this.$container.find('#end_time');
        var startDateValidationResult = false;
        // var endDateValidationResult = false;

        if(!isNaN(startDate)&&!isNaN(startTime)){
            startDateValidationResult = this._validateTimeValueAgainstNow(startDate,startTime,'start');
        }

        if(startDateValidationResult){
            this.$container.find('.bt-fixed-area button').removeAttr('disabled');
            var expireDate = parseInt(this._expireDate,10) + parseInt(startDateElement.attr('data-idx'),10);
            var endDate = moment().add(expireDate, 'days').format('YYYY. MM. DD');
            endDateElement.text(endDate);
            endTimeElement.text(startTime);
        }else{
            this.$container.find('.bt-fixed-area button').attr('disabled','disabled');
            endDateElement.text(Tw.POPUP_TITLE.SELECT);
            endTimeElement.text(Tw.POPUP_TITLE.SELECT);
        }

    },
    _validateTimeValueAgainstNow : function(paramDate,paramTime,className){
        var returnValue = false;
        var $errorsElement = this.$container.find('.error-txt.'+className);
        if((paramDate===moment().format('YYYYMMDD'))&&(parseInt(paramTime,10)<=parseInt(moment().format('HH'),10))){
            $errorsElement.text(Tw.ROAMING_SVCTIME_SETTING_ERR_CASE.ERR_START_TIME);
            $errorsElement.removeClass('none');
        }else{
            returnValue = true;
            if(!$errorsElement.hasClass('none')){
                $errorsElement.addClass('none');
            }
        }
        return returnValue;
    },
    _validateRoamingTimeValue : function(startDate,startTime,endDate,endTime){
        var returnValue = false;
        var startValue = parseInt(startDate+''+startTime,10);
        var endValue = parseInt(endDate+''+endTime,10);
        if(startValue>=endValue){
            var $errorsElement = this.$container.find('.error-txt.end');
            $errorsElement.text('the error message in this case is not defined');
            $errorsElement.removeClass('none');
        }else{
            returnValue = true;
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
    _settingInformationSetting : function () {

        var userSettingInfo = {
            'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
            'svcEndDt' : {},
            'svcStartTm' : this.$container.find('#start_time').attr('data-number'),
            'svcEndTm' : {},
            'startEndTerm' : {}
        };


        this._apiService.request(Tw.API_CMD.BFF_10_0085, userSettingInfo, {},this._prodId).
        done($.proxy(function (res) {
            if(res.code===Tw.API_CODE.CODE_00){
                this._goBack();
            }
        }, this));
    },
    _goBack : function () {
        this._historyService.goBack();
    }



};

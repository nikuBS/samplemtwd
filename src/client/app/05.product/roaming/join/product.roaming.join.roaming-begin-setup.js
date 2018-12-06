/**
 * FileName: product.roaming.setting.roaming-setup.js
 * Author: Hyunkuk Lee (max5500@pineone.com)
 * Date: 2018.12.03
 */

Tw.ProductRoamingJoinRoamingBeginSetup = function (rootEl,prodRedisInfo,prodApiInfo,svcInfo,prodId) {
  this.$container = rootEl;
  this._popupService = Tw.Popup;
  this._bindBtnEvents();
  this._historyService = new Tw.HistoryService(this.$container);
  this._prodRedisInfo = prodRedisInfo;
  this._prodApiInfo = prodApiInfo;
  this._svcInfo = svcInfo;
  this._prodId = prodId;
};

Tw.ProductRoamingJoinRoamingBeginSetup.prototype = {
    _bindBtnEvents: function () {
      this.$container.on('click', '.bt-dropdown.date', $.proxy(this._btnDateEvent, this));
      this.$container.on('click','.bt-fixed-area #do_confirm',$.proxy(this._confirmInformationSetting, this));
    },
    _getDateArrFromToDay : function(range,format){
        var dateFormat = 'YYYY-MM-DD';
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
        actionSheetData[0].list[0].value+= ' (오늘)';
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
        var dateValue = $selectedTarget.text().trim().substr(0,10);
        var dateAttr = $selectedTarget.attr('data-name');
        var changeTarget = this.$container.find('#'+dateAttr);
        changeTarget.text(dateValue);
        changeTarget.removeClass('placeholder');
        changeTarget.attr('data-number',dateValue.replace(/-/g, ''));
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
    _doJoin : function(data,apiService,historyService,$containerData){

        var completePopupData = {
            prodNm : data.prodNm,
            isBasFeeInfo : data.prodFee,
            typeNm : data.svcType,
            settingType : (data.svcType+' '+data.processNm),
            btnNmList : ['나의 가입정보 확인']
        };

        apiService.request(Tw.API_CMD.BFF_10_0084, data.userJoinInfo, {},data.prodId).
        done($.proxy(function (res) {
            console.log('success');
            console.log(res);

            this._popupService.open({
                    hbs: 'complete_product_roaming',
                    layer: true,
                    data : completePopupData
                },
                $.proxy($containerData._bindCompletePopupBtnEvt,this,$containerData),
                null,
                'complete');
        }, this)).fail($.proxy(function (err) {
            console.log('fail');
            console.log(err);
        }, this));
    },
    _bindCompletePopupBtnEvt : function($args1,$args2){
        $($args2).on('click','.btn-round2',$args1._goMyInfo);
        $($args2).on('click','.btn-floating',$args1._goBack);
    },
    _goMyInfo : function(){
        //TODO link my roaming info
    },
    _goBack : function(){
        //TODO lik product info
    },
    _confirmInformationSetting : function () {


        var userJoinInfo = {
            'svcStartDt' : this.$container.find('#start_date').attr('data-number'),
            'svcEndDt' : {},
            'svcStartTm' : {},
            'svcEndTm' : {},
            'startEndTerm' : {}
        };

        var data = {
                        popupTitle : Tw.PRODUCT_TYPE_NM.JOIN,
                        userJoinInfo : userJoinInfo,
                        prodId : this._prodId,
                        svcNum : Tw.FormatHelper.getDashedCellPhoneNumber(this._svcInfo.showSvc),
                        processNm : Tw.PRODUCT_TYPE_NM.JOIN,
                        prodType : Tw.NOTICE.ROAMING+' '+Tw.PRODUCT_CTG_NM.PLANS,
                        svcType : Tw.PRODUCT_CTG_NM.ADDITIONS,
                        prodNm : this._prodRedisInfo.prodNm,
                        prodFee : this._prodRedisInfo.basFeeInfo,
                        description : this._prodRedisInfo.prodSmryDesc,
                        autoInfo : this._prodApiInfo,
                        showStipulation : Object.keys(this._prodApiInfo.stipulationInfo).length>0,
                        joinType : 'begin'
                   };

        new Tw.ProductRoamingJoinConfirmInfo(this.$container,data,this._doJoin,null,'confirm_data',this);

    }



};

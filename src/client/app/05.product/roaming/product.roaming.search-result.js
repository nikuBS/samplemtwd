/**
 * FileName: product.roaming.do.search-before.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingSearchResult = function (rootEl, svcInfo, srchInfo, rateInfo) {
  this.$container = rootEl;
  this.$inputContrySearch = this.$container.find('#fe-rm-input');

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._svcInfo = svcInfo;
  this._srchInfo = srchInfo;
  this._rateInfo = rateInfo;

  this._roamingSearchInit();
  this._bindEvents();
};

Tw.ProductRoamingSearchResult.prototype = {
    type: {
        lte:0,
        wcdma:1,
        cdma:2,
        gsm:3,
        rent:4
    },
    _roamingSearchInit: function () {
        this.$roamingRatelist = this.$container.find('.fe-rate-info');
        this.$roamingNoti = this.$container.find('#fe-rm-noti');
        this.$notiButton = this.$container.find('.fe-noti-btn');
        this.reqParams = {
            'countryCode': this._srchInfo.countryCd,
            'manageType': '',
            'showDailyPrice': 'N'
        };

        this.$container.find('.fe-search-input').val(this._srchInfo.countryNm);
        this.manageType = [];
        this.typeTxt = [];
        if(this._rateInfo.lte > 0){
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.lte].value);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.lte]);
        }
        if(this._rateInfo.wcdma > 0){
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma].value);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma]);
        }
        if(this._rateInfo.cdma > 0){
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma].value);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma]);
        }
        if(this._rateInfo.gsm > 0){
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm].value);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm]);
        }
        if(this._rateInfo.rent > 0){
            this.reqParams.showDailyPrice = 'Y';
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.R].value);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.R]);
        }else {
            this.reqParams.showDailyPrice = 'N';
            if(this._svcInfo === null){
                this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.rent].value);
                this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.rent]);
            }
        }

        this.reqParams.manageType = this.manageType[0].type;
        this.manageType[0].option = 'checked';
        this.$container.find('.fe-rm-type').text(this.typeTxt.join(', '));

        Tw.Logger.info('this.reqParams : ', this.reqParams);

        this._getCountryRoamingRate(this.reqParams);
        this._rmRateInfoTmpl = Handlebars.compile($('#fe-roaming-rate').html());
        this._rmNoticeTmpl = Handlebars.compile($('#fe-roaming-notice').html());
    },
    _getCountryRoamingRate: function (params) {
        Tw.Logger.info('get countryRoamingRate params :::: ', params);
        this._apiService.request(Tw.API_CMD.BFF_10_0058, params)
            .done($.proxy(this._handleSuccessRateResult, this))
            .fail($.proxy(this._handleFailSearch, this));
    },
    _handleSuccessRateResult: function (resp) {
        if (resp.code !== Tw.API_CODE.CODE_00) {
            Tw.Error(resp.code, resp.msg).pop();
            return;
        }

        var _result = resp.result;
        var typeIndex = null;
        for(var idx in this.manageType) {
            if(this.manageType[idx].type === this.reqParams.manageType) {
                typeIndex = idx;
                this.manageType[idx].option = 'checked';
            }else {
                this.manageType[idx].option = '';
            }
        }

        var noticeParam = {
            voiceShown: true,
            ableShown: true,
            attentionShown: false,
            svcAttention: _result.svcAttention
        };

        if(this.reqParams.manageType === 'L'){
            _result.lteShown = true;
            noticeParam.voiceShown = false;
        }else if(this.reqParams.manageType === ''){
            _result.rentShown = true;
        }

        if(_result.ableAreaType === 'A'){
            noticeParam.ableShown = false;
        }

        noticeParam.attentionShown = (_result.svcAttention) ? true : false;

        Tw.Logger.info('result noticeParam = ', JSON.stringify(noticeParam));
        if(typeIndex === null || typeIndex === ''){
            typeIndex = -1;
        }

        this.$container.find('.fe-manage-type').text(this.manageType[typeIndex].value);
        this.$roamingRatelist.empty();
        this.$roamingRatelist.append(this._rmRateInfoTmpl({ items: _result }));

        this.$roamingNoti.empty();
        this.$roamingNoti.append(this._rmNoticeTmpl({ items: noticeParam }));

    },
    _handleFailSearch:function () {

    },
    _bindEvents: function () {
        this.$container.on('click', '#fe-search-btn', $.proxy(this._onBtnClicked, this));
        this.$container.on('click', '.fe-rmplan-btn', $.proxy(this._goRoamingPlan, this));
        this.$container.on('click', '.fe-btn-rmadd', $.proxy(this._goRoamingPlanAdd, this));
        this.$container.on('click', '.fe-rm-card', $.proxy(this._goRoamingCard, this));
        this.$container.on('click', '.fe-noti-btn', $.proxy(this._notiDetailView, this));

        this.$container.on('click', '.fe-manage-type', $.proxy(this._openMangeType, this));
    },
    _notiDetailView: function (e) {
        var $target = $(e.currentTarget);
        var ariaPressed = $target.attr('aria-pressed');
        if(ariaPressed === 'false'){
            $target.attr('aria-pressed', 'true');
            $target.parents('li').addClass('on');
        }else {
            $target.attr('aria-pressed', 'false');
            $target.parents('li').removeClass('on');
        }
    },
    _openMangeType: function (){
        this._popupService.open(
            {
                hbs: 'actionsheet_select_a_type', // hbs의 파일명
                layer: true,
                data: [{ list: this.manageType }]
            },
            $.proxy(this._handleOpenTypePopup, this),
            undefined
        );
    },
    _handleOpenTypePopup: function ($layer) {
        $layer.on('click', 'ul.chk-link-list > li > button', $.proxy(this._handleSelectRoamingType, this));
    },
    _handleSelectRoamingType: function (e) {
        var $target = $(e.currentTarget);
        var rmType = $target.attr('data-manage-type');

        if(this.reqParams.manageType === rmType){
            this._popupService.close();
        }else {
            this.reqParams.manageType = rmType;
            this._popupService.close();
            this._getCountryRoamingRate(this.reqParams);
            console.log('this.reqParams.manageType : ' + this.reqParams.manageType);
        }
    },
    _selectPopupCallback:function () {

    },
    _closeActionPopup : function () {

    },
    _goRoamingPlan: function () {
        this._history.goLoad('/product/roaming/fee');
    },
    _goRoamingPlanAdd: function () {
        this._history.goLoad('/product/roaming/planadd');
    },
    _goRoamingCard: function () {
        this._history.goLoad('/product/roaming/coupon');
    },
    _onBtnClicked : function () {
        this.keyword = this.$container.find('.fe-search-input').val().trim();
        this.searchKeyword = encodeURI(this.$container.find('.fe-search-input').val().trim());
        var ALERT = Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A23;

        Tw.Logger.info(this.searchKeyword);

        if(this.searchKeyword === ''){
            this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
        }else {
            this._apiService.request(Tw.API_CMD.BFF_10_0060, { keyword: this.searchKeyword })
                .done($.proxy(this._handleSuccessSearchResult, this))
                .fail($.proxy(this._handleFailSearchResult, this));
        }
    },
    _handleSuccessSearchResult : function (resp) {
        var _result = resp.result;

        console.log(_result.length);
        var alertMsg = this.keyword + '은(는) 로밍 서비스 국가가 아닙니다.';
        if(_result.length === 0) {
            this._popupService.openAlert(alertMsg, Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A22.TITLE);
            this.$inputContrySearch.val('');
            return;
        }

        if(_result.length > 1 ){
            var listData = _.map(_result, function (item, idx) {
                return {
                    value: _result[idx].countryNm,
                    option: 'hbs-country-name',
                    attr: 'data-value="' + _result[idx].countryCode + '|' + _result[idx].countryNm + '"'
                };
            });

            console.log(JSON.stringify(listData));

            var data = [{
                list: null
            }];

            data[0].list = listData;
            this._popupService.open({
                    hbs: 'actionsheet_select_a_type',
                    layer: true,
                    title: Tw.POPUP_TITLE.SELECT_COUNTRY,
                    data: data
                },
                $.proxy(this._selectPopupCallback, this),
                $.proxy(this._closeActionPopup, this)
            );

        }else {
            var countryCode = _result[0].countryCode;
            var countryNm = encodeURIComponent(_result[0].countryNm);
            var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm;

            console.log('resultUrl : ' + resultUrl);
            this._history.goLoad(resultUrl);
        }

    },
    _handleFailSearchResult : function () {

    }
};

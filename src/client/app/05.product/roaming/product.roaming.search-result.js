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

    Tw.Logger.info('_srchInfo :', this._srchInfo);
    Tw.Logger.info('_rateInfo :', this._rateInfo);

  this._roamingSearchInit();
  this._bindEvents();
};

Tw.ProductRoamingSearchResult.prototype = {
    _roamingSearchInit: function () {
        this.$roamingRatelist = this.$container.find('.fe-rate-info');

        this.reqParams = {
            'countryCode': this._srchInfo.countryCd,
            'manageType': this._srchInfo.countryCd,
            'showDailyPrice': 'N'
        };

        if(this._rateInfo.lte > 0){
            this.reqParams.manageType = 'L';
        }else if(this._rateInfo.wcdma > 0){
            this.reqParams.manageType = 'W';
        }else if(this._rateInfo.gsm > 0){
            this.reqParams.manageType = 'G';
        }else if(this._rateInfo.cdma > 0){
            this.reqParams.manageType = 'C';
        }else if(this._rateInfo.rent > 0){
            this.reqParams.manageType = '';
            this.reqParams.showDailyPrice = 'Y';
        }else {
            this.reqParams.manageType = '';
            this.reqParams.showDailyPrice = 'N';
        }

        Tw.Logger.info('this.reqParams : ', this.reqParams);

        this._getCountryRoamingRate(this.reqParams);
        this._rmRateInfoTmpl = Handlebars.compile($('#fe-roaming-rate').html());
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
        Tw.Logger.info('success rate result ==== ', _result);
        // this.$roamingRatelist.text('요금 정보 입력');

        this.$roamingRatelist.append(this._rmRateInfoTmpl({ items: _result }));
    },
    _handleFailSearch:function () {

    },
    _bindEvents: function () {
        this.$container.on('click', '#fe-search-btn', $.proxy(this._onBtnClicked, this));
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

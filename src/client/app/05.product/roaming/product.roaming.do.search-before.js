/**
 * FileName: product.roaming.do.search-before.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingSearchBefore = function (rootEl) {
  this.$container = rootEl;
  this.$inputContrySearch = this.$container.find('#fe-rm-input');

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._searchResultView = false;

  this._roamingSearchInit();
  this._bindEvents();
};

Tw.ProductRoamingSearchBefore.prototype = {
    _roamingSearchInit: function () {
      if(!this._searchResultView) {
        $('.fe-search-result').hide();
      }
    },
  _bindEvents: function () {
    this.$container.on('click', '#fe-search-btn', $.proxy(this._onBtnClicked, this));
    this.$container.on('click', '#fe-rm-hp-search', $.proxy(this._onHpSearch, this));
  },
  _onBtnClicked : function () {
    this.keyword = this.$inputContrySearch.val().trim();
    this.searchKeyword = encodeURI(this.$inputContrySearch.val().trim());
    var ALERT = Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A23;

    Tw.Logger.info(this.searchKeyword);

    if(this.searchKeyword === ''){
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE);
    }else {

      this._apiService.request(Tw.API_CMD.BFF_10_0060, { keyword: this.searchKeyword })
          .done($.proxy(this._handleSuccessSearchResult, this))
          .fail($.proxy(this._handleFailSearch, this));
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
  _handleFailSearch : function () {

  },
  _onHpSearch : function () {
    var mfactCd = 'ALL'; // test code
    var modelNm = '';

    if(modelNm !== ''){

    }else {
      this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A24.MSG, Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A24.TITLE);
    }
  },
  _selectPopupCallback : function ($layer) {
    console.log('select popup callback');
    $layer.on('click', '.hbs-country-name', $.proxy(this._goLoadSearchResult, this, $layer));
  },
    _closeActionPopup : function () {
      // this._history.goLoad('/product/roaming/search-result');
      // this._goLoad('/myt-fare/billguide/guide?' + $.param(param));
      console.log('goLoad');
  },
  _goLoadSearchResult: function ($layer, e) {
      var target = $(e.currentTarget);
      var optValue = target.attr('data-value');

      var valueArr = optValue.split('|');
      var countryCode = valueArr[0];
      var countryNm = encodeURIComponent(valueArr[1]);
      var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm;

      this._history.goLoad(resultUrl);
  }
};

/**
 * FileName: product.roaming.do.search-before.js
 * Author: Eunjung Jung ()
 * Date: 2018.11.12
 */

Tw.ProductRoamingSearchBefore = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this.$inputContrySearch = this.$container.find('#fe-rm-input');

  this._svcInfo = svcInfo;
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService(rootEl);
  this._history.init('hash');

  this._roamingSearchInit();
  this._bindEvents();
};

Tw.ProductRoamingSearchBefore.prototype = {
  _roamingSearchInit: function () {
    this.$userPhoneInfo = this.$container.find('#fe-search-phone');

    this._phoneInfo = {
        eqpMdlNm : ''
    };

    this._rmPhoneInfoTmpl = Handlebars.compile($('#fe-phone-info').html());
    this._rmPhoneSelectTmpl = Handlebars.compile($('#fe-phone-select').html());

    if(this._svcInfo !== null){
        this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._svcInfo }));
    }else {
        this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: this._svcInfo }));
    }

  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-search-btn', $.proxy(this._onBtnClicked, this));
    this.$container.on('click', '.fe-roaming-mfactCd', $.proxy(this._onHpSearch, this));
    this.$container.on('click', '.fe-change-model', $.proxy(this._onChangeModel, this));
    this.$container.on('click', '#fe-phone-btn', $.proxy(this._onClickSelectBtn, this));
  },
  _onClickSelectBtn: function () {
    console.log('this._phoneInfo.eqpMdlNm : ' + this._phoneInfo.eqpMdlNm);
    if(this._phoneInfo.eqpMdlNm !== '') {
        this.$userPhoneInfo.empty();
        this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._phoneInfo }));
    }else {
        this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A24.MSG, Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A24.TITLE);
    }
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
  _onChangeModel: function () {
    this._phoneInfo.eqpMdlNm = '';
    this.$userPhoneInfo.empty();
    this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: null }));
  },
  _handleSuccessSearchResult : function (resp) {

      var _result = resp.result;
      if ( resp.code === Tw.API_CODE.CODE_00 ) {
          console.log(_result.length);
          var alertMsg = this.keyword + '은(는) 로밍 서비스 국가가 아닙니다.';
          if (_result.length === 0) {
              this._popupService.openAlert(alertMsg, Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A22.TITLE);
              this.$inputContrySearch.val('');
              return;
          }

          if (_result.length > 1) {
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

          } else {
              var countryCode = _result[0].countryCode;
              var countryNm = encodeURIComponent(_result[0].countryNm);
              var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm;

              this._history.goLoad(resultUrl);
          }
      } else {
          Tw.Error(resp.code, resp.msg).pop();
      }

  },
  _handleFailSearch : function (err) {
      Tw.Error(err.code, err.msg).pop();
  },
  _onHpSearch : function () {
    this._popupService.open({
            hbs: 'actionsheet_select_a_type',
            layer: true,
            data: [{ list: Tw.ROAMING_MFACTCD_LIST.list }]
        },
        $.proxy(this._selectMfactCdCallback, this),
        $.proxy(this._closeActionPopup, this)
    );
  },
  _selectMfactCdCallback: function ($layer) {
      $layer.on('click', '.hbs-mfact-cd', $.proxy(this._getModelInfo, this, $layer));
  },
  _getModelInfo: function ($layer, e) {
      var target = $(e.currentTarget);
      var cdValue = target.attr('data-mfact-code');
      var cdName = target.attr('data-mfact-name');
      console.log('search before cdValue : ' + cdValue + ' cdName : ' + cdName);

      this._popupService.close();
      this.$container.find('.fe-roaming-mfactCd').text(cdName);

      this._onSearchModel(cdValue);
  },
  _onSearchModel: function (val) {
    this._apiService.request(Tw.API_CMD.BFF_10_0059, { mfactCd:val })
    // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0059.json')
        .done($.proxy(this._handleSuccessSearchModelResult, this))
        .fail($.proxy(this._handleFailModelSearch, this));
  },
  _handleSuccessSearchModelResult : function (resp) {
    var _result = resp.result;

    if ( resp.code === Tw.API_CODE.CODE_00 ) {
        var listData = _.map(_result, function (item, idx) {
            return {
                value: _result[idx].eqpMdlNm,
                option: 'hbs-model-name',
                attr: 'data-model-code="' + _result[idx].eqpMdlNm + '"'
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
                data: data
            },
            $.proxy(this._selectModelCallback, this),
            $.proxy(this._closeActionPopup, this)
        );
    } else {
        this.$container.find('.fe-roaming-mfactCd').text('제조사를 선택하세요');
        Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _selectModelCallback: function ($layer) {
    console.log('model select ... ');
    $layer.on('click', '.hbs-model-name', $.proxy(this._onPhoneSelect, this, $layer));
  },
  _onPhoneSelect: function ($layer, e) {
    var target = $(e.currentTarget);
    var modelValue = target.attr('data-model-code');

    console.log('modelValue : ' + modelValue);

    this._phoneInfo.eqpMdlNm = modelValue;

    this.$container.find('.fe-roaming-model').text(modelValue);

    this._popupService.close();

  },
  _handleFailModelSearch: function () {

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

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

  this._roamingSearchInit();
  this._bindEvents();
};

Tw.ProductRoamingSearchBefore.prototype = {
  MFACT_CODE: {
    ALL: 0,
      SS: 1,
      LG: 2,
      PT: 3,
      CG: 4,
      ETC: 5
  },
  _roamingSearchInit: function () {
    this.$userPhoneInfo = this.$container.find('#fe-search-phone');

    this._phoneInfo = {
        eqpMdlNm : ''
    };

    this._rmPhoneInfoTmpl = Handlebars.compile($('#fe-phone-info').html());
    this._rmPhoneSelectTmpl = Handlebars.compile($('#fe-phone-select').html());

    if(this._svcInfo !== null){
        if(this._svcInfo.eqpMdlNm !== ''){
          this._phoneInfo.eqpMdlNm = this._svcInfo.eqpMdlNm;
          this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._svcInfo }));
        }else {
          this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: this._svcInfo }));
        }
    }else {
        this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: this._svcInfo }));
    }
    this._desciptionInit();
  },
  _desciptionInit: function () {
      if(this._svcInfo !== null){
          this._svcInfo.totalSvcCnt = Number(this._svcInfo.totalSvcCnt);
          if(this._svcInfo.totalSvcCnt > 1 ){
              if(this._svcInfo.svcGr !== 'A'){
                  this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_LINE_MSG);
                  this.$container.find('.fe-bottom-msg').html('');
              } else {
                  if(this._phoneInfo.eqpMdlNm !== ''){
                      this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                      this.$container.find('.fe-bottom-msg').html('');
                  } else {
                      this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                      this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_PHONE_MSG);
                  }
              }
          }else if(this._svcInfo.totalSvcCnt === 1){
              this._svcInfo.svcGr = 'A';
              if(this._svcInfo.svcGr !== 'A'){
                  this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_LINE_MSG);
                  this.$container.find('.fe-bottom-msg').html('');
              } else {
                  if(this._phoneInfo.eqpMdlNm !== ''){
                      this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                      this.$container.find('.fe-bottom-msg').html('');

                  } else {
                      this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                      this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_PHONE_MSG);
                  }
              }
          }
      }else {
          this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
          this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_LOGIN_MSG);
      }
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-search-btn', $.proxy(this._onBtnClicked, this));
    this.$container.on('click', '.fe-roaming-mfactCd', $.proxy(this._onHpSearch, this));
    this.$container.on('click', '.fe-change-model', $.proxy(this._onChangeModel, this));
    this.$container.on('click', '#fe-phone-btn', $.proxy(this._onClickSelectBtn, this));
    this.$container.on('click', '.fe-roaming-model', $.proxy(this._onSelectModel, this));
  },
  _onSelectModel: function () {
      if(this.cdValue === undefined || this.cdValue === ''){
          return;
      }else {
          var data = [{
              list: null
          }];
          data[0].list = this.listData;
          this._popupService.open({
                  hbs: 'actionsheet_select_a_type',
                  layer: true,
                  data: data
              },
              $.proxy(this._selectModelCallback, this),
              $.proxy(this._closeActionPopup, this)
          );
      }
  },
  _onClickSelectBtn: function () {
    if(this.modelValue !== '') {
        this._phoneInfo.eqpMdlNm = this.modelValue;
        this.$userPhoneInfo.empty();
        this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._phoneInfo }));
        this._desciptionInit();
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
    this.modelValue = '';
    this.$userPhoneInfo.empty();
    this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: null }));

    this._desciptionInit();
  },
  _handleSuccessSearchResult : function (resp) {

      var _result = resp.result;
      if ( resp.code === Tw.API_CODE.CODE_00 ) {
          var alertMsg = this.keyword + Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A22.MSG;
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
              var eqpMdlNm = '';

              if(this._svcInfo){
                  eqpMdlNm = encodeURIComponent(this._svcInfo.eqpMdlNm);
              }else {
                  if(this._phoneInfo.eqpMdlNm !== null || this._phoneInfo.eqpMdlNm  !== ''){
                      eqpMdlNm = encodeURIComponent(this._phoneInfo.eqpMdlNm);
                  }
              }
              var countryCode = _result[0].countryCode;
              var countryNm = encodeURIComponent(_result[0].countryNm);
              var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm + '&eqpNm=' + eqpMdlNm;

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
      // $layer.find('button').removeClass('checked');
      var target = $(e.currentTarget);
      this.cdValue = target.attr('data-mfact-code');
      this.cdName = target.attr('data-mfact-name');
      for (var i in Tw.ROAMING_MFACTCD_LIST.list){
          Tw.ROAMING_MFACTCD_LIST.list[i].option = 'hbs-mfact-cd';
      }
      var list = Tw.ROAMING_MFACTCD_LIST.list.slice();
      var codeType = this.MFACT_CODE[this.cdValue];
      list[codeType].option = 'hbs-mfact-cd checked';
      this._popupService.close();
      this.$container.find('.fe-roaming-mfactCd').text(this.cdName);

      this._onSearchModel(this.cdValue);
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
        this.listData = _.map(_result, function (item, idx) {
            return {
                value: _result[idx].eqpMdlNm,
                option: 'hbs-model-name',
                attr: 'data-model-code="' + _result[idx].eqpMdlNm + '"'
            };
        });
    } else {
        this.$container.find('.fe-roaming-mfactCd').text(Tw.ROAMING_DESC.MFACTCD_DESC);
        Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _selectModelCallback: function ($layer) {
    $layer.on('click', '.hbs-model-name', $.proxy(this._onPhoneSelect, this, $layer));
  },
  _onPhoneSelect: function ($layer, e) {
    var target = $(e.currentTarget);
    this.modelValue = target.attr('data-model-code');

    // this._phoneInfo.eqpMdlNm = this.modelValue;
    for(var i in this.listData){
        if(this.listData[i].value === this.modelValue){
            this.listData[i].option = 'hbs-model-name checked';
        }else {
            this.listData[i].option = 'hbs-model-name';
        }
    }

    this.$container.find('.fe-roaming-model').text(this.modelValue);
    this._popupService.close();

  },
  _handleFailModelSearch: function () {

  },
  _selectPopupCallback : function ($layer) {
    $layer.on('click', '.hbs-country-name', $.proxy(this._goLoadSearchResult, this, $layer));
  },
  _closeActionPopup : function () {
  },
  _goLoadSearchResult: function ($layer, e) {
      var target = $(e.currentTarget);
      var optValue = target.attr('data-value');
      var valueArr = optValue.split('|');
      var countryCode = valueArr[0];
      var countryNm = encodeURIComponent(valueArr[1]);
      var eqpMdlNm = '';
      if(this._svcInfo){
          eqpMdlNm = encodeURIComponent(this._svcInfo.eqpMdlNm);
      }else {
          if(this._phoneInfo.eqpMdlNm !== null || this._phoneInfo.eqpMdlNm  !== ''){
              eqpMdlNm = encodeURIComponent(this._phoneInfo.eqpMdlNm);
          }
      }

      var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm + '&eqpNm=' + eqpMdlNm;

      this._history.goLoad(resultUrl);
  }
};

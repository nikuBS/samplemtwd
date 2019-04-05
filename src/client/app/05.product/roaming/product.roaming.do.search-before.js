/**
 * MenuName: T로밍 > 국가별 로밍 요금조회 검색 전 화면 (RM_03_01_01_01)
 * FileName: product.roaming.do.search-before.js
 * Author: Eunjung Jung
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
  MFACT_CODE: { // 휴대폰 제조사 코드
    ALL: 0,     // 전체
      SS: 1,    // 삼성
      LG: 2,    // LG
      PT: 3,    // 팬텍
      CG: 4,    // 애플
      ETC: 5    // 기타
  },
  _roamingSearchInit: function () {
    this.$userPhoneInfo = this.$container.find('#fe-search-phone');

    this._phoneInfo = {
        eqpMdlNm : '',      // 휴대폰 이름
        eqpMdlCd : ''       // 휴대폰 모델 정보
    };

    this._rmPhoneInfoTmpl = Handlebars.compile($('#fe-phone-info').html());
    this._rmPhoneSelectTmpl = Handlebars.compile($('#fe-phone-select').html());

    // 사용자 회선 정보에 따른 휴대폰 정보 입력
    if(this._svcInfo !== null){
        this._svcInfo.totalSvcCnt = Number(this._svcInfo.totalSvcCnt);
        this._svcAttrCd = this._svcInfo.svcAttrCd.charAt(0);
        if(this._svcInfo.totalSvcCnt > 1 ){
            // 사용자 회선정보가 일반 폰이 아닌 경우 휴대폰 정보 없음 처리.
            if(this._svcAttrCd !== 'M'){
                this._svcInfo.eqpMdlNm = '';
                this._svcInfo.eqpMdlCd = '';
            }
        }
        if(this._svcInfo.eqpMdlNm !== ''){      // 사용자 휴대폰 정보가 있는 경우 휴대폰 정보 노출
            this._phoneInfo.eqpMdlNm = this._svcInfo.eqpMdlNm;
            this._phoneInfo.eqpMdlCd = this._svcInfo.eqpMdlCd;
             this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._svcInfo }));
        }else {     // 사용자 휴대폰 정보가 없는 경우 휴대폰 선택 화면 노출.
            this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: this._svcInfo }));
        }
    }else {
        this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: this._svcInfo }));
    }

    this._desciptionInit();
  },
  /**
   * 휴대폰 선택 case별 상/하단 안내 메시지
   * @private
   */
  _desciptionInit: function () {
      if(this._svcInfo !== null){   // 사용자 로그인
          if(this._svcInfo.totalSvcCnt > 1 ){   // 회선정보가 여러개일 경우
              if(this._svcAttrCd !== 'M'){  // 유무선 서비스에 가입되어 있으나 유선 회선으로 접속한 회원
                  this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_LINE_MSG);
                  this.$container.find('.fe-bottom-msg').html('');
              } else {
                  if(this._phoneInfo.eqpMdlNm !== ''){  // 단말 정보가 있는 Type
                      this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                      this.$container.find('.fe-bottom-msg').html('');
                  } else {  // 단말정보가 없는Type
                      this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                      this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_PHONE_MSG);
                  }
              }
          }else if(this._svcInfo.totalSvcCnt === 1){    // 회선정보가 한개일 경우
              if(this._svcAttrCd !== 'M'){  // 유선에만 가입된 회원
                  this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_LOGIN_MSG);
                  this.$container.find('.fe-bottom-msg').html('');
              } else {
                  if(this._phoneInfo.eqpMdlNm !== ''){ // 단말 정보가 있는 Type
                      this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                      this.$container.find('.fe-bottom-msg').html('');
                  } else {  // 단말정보가 없는Type
                      this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                      this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_PHONE_MSG);
                  }
              }
          } else {  // 단말정보가 없는Type
              this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
              this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_PHONE_MSG);
          }
      }else { // 사용자 비로그인
          this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
          this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_LOGIN_MSG);
      }
  },
  _bindEvents: function () {
    this.$container.on('click', '#fe-search-btn', $.proxy(this._onBtnClicked, this));       // 검색
    this.$container.on('click', '.fe-roaming-mfactCd', $.proxy(this._onHpSearch, this));    // 휴대폰 제조사 선택
    this.$container.on('click', '.fe-change-model', $.proxy(this._onChangeModel, this));    // 휴대폰 정보 변경
    this.$container.on('click', '#fe-phone-btn', $.proxy(this._onClickSelectBtn, this));    // 휴대폰 정보 선택
    this.$container.on('click', '.fe-roaming-model', $.proxy(this._onSelectModel, this));   // 휴대폰 모델명 선택
  },
    /**
     * 휴대폰 모델명 선택
     * @private
     */
  _onSelectModel: function () {
      if(this.cdValue === undefined || this.cdValue === ''){
          return;
      }else {
          var data = [{
              list: null
          }];
          data[0].list = this.listData;
          this._popupService.open({
                  hbs: 'actionsheet01',
                  btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
                  layer: true,
                  data: data
              },
              $.proxy(this._selectModelCallback, this),
              $.proxy(this._closeActionPopup, this)
          );
      }
  },
  /**
   * 휴대폰 정보 선택
   * @param e
   * @private
   */
  _onClickSelectBtn: function (e) {
      if(this.modelValue === undefined || this.modelValue === ''){
          this._popupService.openAlert(Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A24.MSG,
              Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A24.TITLE, null, null, null, $(e.currentTarget));
      } else {
          this._phoneInfo.eqpMdlNm = this.modelValue;
          this._phoneInfo.eqpMdlCd = this.modelCode;
          this.$userPhoneInfo.empty();
          this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._phoneInfo }));
          this._desciptionInit();
      }
  },
  /**
   * 국가 검색
   * @param e
   * @private
   */
  _onBtnClicked : function (e) {
    this.keyword = this.$inputContrySearch.val().trim();
    this.searchKeyword = encodeURI(this.$inputContrySearch.val().trim());
    var ALERT = Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A23;
    Tw.Logger.info(this.searchKeyword);
    if(this.searchKeyword === ''){
      // 검색어가 없는 경우 alert 호출
      this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, null, null, $(e.currentTarget));
    }else {

      this._apiService.request(Tw.API_CMD.BFF_10_0060, { keyword: this.searchKeyword })
          .done($.proxy(this._handleSuccessSearchResult, this))
          .fail($.proxy(this._handleFailSearch, this));
    }
  },
  /**
   * 휴대폰 변경 버튼 선택 시 휴대폰 정보 초기화
   * @private
   */
  _onChangeModel: function () {
    this._phoneInfo.eqpMdlNm = '';
    this._phoneInfo.eqpMdlCd = '';
    this.cdValue = '';
    this.cdName = '';
    this.modelValue = '';
    this.modelCode = '';
    this.cdName = '';
    this.$userPhoneInfo.empty();
    this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: null }));
    this._desciptionInit();
  },
  /**
   * _onBtnClicked Success callback
   * @param resp
   * @private
   */
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
                      txt: _result[idx].countryNm,
                      attr: 'data-value="' + _result[idx].countryCode + '|' + _result[idx].countryNm + '"',
                      'label-attr':'id="ra' + [idx] + '"',
                      'radio-attr': 'id="ra' + [idx] + '" name="r2" data-value="' + _result[idx].countryCode + '|' + _result[idx].countryNm + '"'
                  };
              });

              var data = [{
                  list: null
              }];

              data[0].list = listData;
              this._popupService.open({
                      hbs: 'actionsheet01',
                      layer: true,
                      title: Tw.POPUP_TITLE.SELECT_COUNTRY,
                      btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
                      data: data
                  },
                  $.proxy(this._selectPopupCallback, this)
              );

          } else {
              var eqpMdlNm = '';

              if(this._svcInfo){
                  if(this._phoneInfo.eqpMdlNm !== null || this._phoneInfo.eqpMdlNm  !== ''){
                      eqpMdlNm = encodeURIComponent(this._phoneInfo.eqpMdlNm);
                  }else {
                      eqpMdlNm = encodeURIComponent(this._svcInfo.eqpMdlNm);
                  }
              }else {
                  if(this._phoneInfo.eqpMdlNm !== null || this._phoneInfo.eqpMdlNm  !== ''){
                      eqpMdlNm = encodeURIComponent(this._phoneInfo.eqpMdlNm);
                  }
              }
              var countryCode = _result[0].countryCode;
              var countryNm = encodeURIComponent(_result[0].countryNm);
              var eqpMdlCd = this._phoneInfo.eqpMdlCd;
              var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm + '&eqpNm=' + eqpMdlNm + '&eqpCd=' + eqpMdlCd;
              this.$inputContrySearch.val('');
              this._history.goLoad(resultUrl);
          }
      } else {
          Tw.Error(resp.code, resp.msg).pop();
      }
  },
  /**
   * _onBtnClicked Fail callback
   * @param err
   * @private
   */
  _handleFailSearch : function (err) {
      Tw.Error(err.code, err.msg).pop();
  },
  /**
   * 휴대폰 제조사 선택
   * @private
   */
  _onHpSearch : function () {
    this._popupService.open({
              hbs: 'actionsheet01',
              layer: true,
              btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
              data: [{ list: Tw.ROAMING_MFACTCD_LIST.list }]
          },
          $.proxy(this._selectMfactCdCallback, this)
      );
  },
  /**
   * _onHpSearch open callback
    * @param $layer
   * @private
   */
  _selectMfactCdCallback: function ($layer) {
      $layer.find('[data-mfact-name="' + this.cdName + '"]').attr('checked', 'checked');
      $layer.find('[name="r2"]').on('click', $.proxy(this._getModelInfo, this, $layer));
      $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
  },
  _getModelInfo: function ($layer, e) {
      // $layer.find('button').removeClass('checked');
      var target = $(e.currentTarget);
      this.cdValue = target.attr('data-mfact-code');    // 휴대폰 제조사 코드
      this.cdName = target.attr('data-mfact-name');     // 휴대폰 제조사 이름
      this._popupService.close();
      this.$container.find('.fe-roaming-mfactCd').text(this.cdName);
      this._onSearchModel(this.cdValue);    // 휴대폰 제조사 모델명 리스트 요청
  },
  /**
   * 휴대폰 제조사 모델명 리스트 요청.
    * @param val
   * @private
   */
  _onSearchModel: function (val) {
    this._apiService.request(Tw.API_CMD.BFF_10_0059, { mfactCd:val })
    // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0059.json')
        .done($.proxy(this._handleSuccessSearchModelResult, this))
        .fail($.proxy(this._handleFailModelSearch, this));
  },
  _handleSuccessSearchModelResult : function (resp) {
    var _result = resp.result;
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
        if(_result.length > 0){
            this.$container.find('.fe-roaming-model').text(Tw.ROAMING_DESC.MODEL_DESC);
            this.modelValue = '';
            // 휴대폰 모델명 리스트 생성
            this.listData = _.map(_result, function (item, idx) {
                return {
                    txt: _result[idx].eqpMdlNm,
                    'label-attr':'id="ra' + [idx] + '"',
                    'radio-attr': 'id="ra' + [idx] + '" name="r2" data-model-code="' + _result[idx].mfrModlCd + '"' +
                        ' data-model-nm="' + _result[idx].eqpMdlNm + '"',
                    option: 'hbs-model-name',
                    attr: 'data-model-code="' + _result[idx].eqpMdlNm + '"'
                };
            });
        } else {
            // 휴대폰 모델명 리스트를 가져오지 못한 경우 alert 호출.
            var ALERT = Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A71;
            this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, $.proxy(this._closeAlertPopup, this));
        }
    } else {
        this.$container.find('.fe-roaming-mfactCd').text(Tw.ROAMING_DESC.MFACTCD_DESC);
        Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _closeAlertPopup: function () {
      this.cdValue = '';
      for (var i in Tw.ROAMING_MFACTCD_LIST.list){
          Tw.ROAMING_MFACTCD_LIST.list[i].option = 'hbs-mfact-cd';
      }
      this.$container.find('.fe-roaming-mfactCd').text(Tw.ROAMING_DESC.MFACTCD_DESC);
  },
  _selectModelCallback: function ($layer) {
      $layer.find('[data-model-nm="' + this.modelValue + '"]').attr('checked', 'checked');
      $layer.find('[name="r2"]').on('click', $.proxy(this._onPhoneSelect, this, $layer));
      $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
  },
  _onPhoneSelect: function ($layer, e) {
    var target = $(e.currentTarget);
    this.modelValue = target.attr('data-model-nm');
    this.modelCode = target.attr('data-model-code');

    // this._phoneInfo.eqpMdlNm = this.modelValue;
    this.$container.find('.fe-roaming-model').text(this.modelValue);
    this._popupService.close();

  },
  _handleFailModelSearch: function () {

  },
  _selectPopupCallback : function ($layer) {
    $layer.find('[name="r2"]').on('click', $.proxy(this._goLoadSearchResult, this, $layer));
    $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
  },
  _closeActionPopup : function () {
  },
  /**
   * 국가별 로밍 요금조회 결과 화면으로 이동
   */
  _goLoadSearchResult: function ($layer, e) {
      var target = $(e.currentTarget);
      var optValue = target.attr('data-value');
      var valueArr = optValue.split('|');
      var countryCode = valueArr[0];                    // 검색 국가 코드
      var countryNm = encodeURIComponent(valueArr[1]);  // 검색 국가 이름
      var eqpMdlNm = '';
      if(this._svcInfo){
          if(this._phoneInfo.eqpMdlNm !== null || this._phoneInfo.eqpMdlNm  !== ''){
              eqpMdlNm = encodeURIComponent(this._phoneInfo.eqpMdlNm);  // 휴대폰 이름
          }else {
              eqpMdlNm = encodeURIComponent(this._svcInfo.eqpMdlNm);    
          }
      }else {
          if(this._phoneInfo.eqpMdlNm !== null || this._phoneInfo.eqpMdlNm  !== ''){
              eqpMdlNm = encodeURIComponent(this._phoneInfo.eqpMdlNm);
          }
      }

      var eqpMdlCd = this._phoneInfo.eqpMdlCd;
      var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm + '&eqpNm=' + eqpMdlNm + '&eqpCd=' + eqpMdlCd;
      this.$inputContrySearch.val('');
      this._history.goLoad(resultUrl);
  }
};

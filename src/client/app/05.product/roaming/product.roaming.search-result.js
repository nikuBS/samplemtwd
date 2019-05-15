/**
 * @file product.roaming.do.search-before.js
 * @desc T로밍 > 국가별 로밍 요금조회 검색 결과 화면 (RM_04)
 * @author Eunjung Jung
 * @since 2018.11.12
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
  this._rentYn = false; // 임대로밍 선택여부

  this._roamingSearchInit();
  this._bindEvents();
};

Tw.ProductRoamingSearchResult.prototype = {
    type: {     // 로밍 서비스 방식
        lte:0,      // LTE
        wcdma:1,    // 3G
        cdma:2,     // 2G
        gsm:3,      // GSM
        rent:4      // 임대
    },
    MFACT_CODE: {   // 휴대폰 제조사 코드
        ALL: 0, // 전체
        SS: 1,  // 삼성
        LG: 2,  // LG
        PT: 3,  // 팬텍
        CG: 4,  // 애플
        ETC: 5  // 기타
    },
    _roamingSearchInit: function () {
        this.$roamingRatelist = this.$container.find('.fe-rate-info');
        this.$roamingNoti = this.$container.find('#fe-rm-noti');
        this.$notiButton = this.$container.find('.fe-noti-btn');
        this.$userPhoneInfo = this.$container.find('#fe-search-phone');
        this._phoneInfo = { // 사용자 휴대폰 정보
            eqpMdlNm : this._srchInfo.eqpMdlNm, // 휴대폰 이름
            eqpMdlCd : this._srchInfo.eqpMdlCd  // 휴대폰 모델 코드
        };
        this.reqParams = {
            'countryCode': this._srchInfo.countryCd,    // 국가 코드
            'manageType': '',                           // 로밍 서비스 방식
            'showDailyPrice': 'N'                       // 로밍서비스방식이 임대로밍 인경우는 Y , 나머지는 N
        };

        // 휴대폰 정보 있는 경우 사용자 휴대폰 정보 노출
        this._rmPhoneInfoTmpl = Handlebars.compile($('#fe-phone-info').html());
        this._rmPhoneSelectTmpl = Handlebars.compile($('#fe-phone-select').html());
        if(this._svcInfo !== null){
            if(this._phoneInfo.eqpMdlNm !== ''){
                this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._phoneInfo }));
            }else {
                if(this._phoneInfo.eqpMdlNm !== ''){
                    this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._srchInfo }));
                }else {
                    this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: this._svcInfo }));
                }
            }
        }else {
            Tw.Logger.info('==== this._srchInfo.eqpMdlNm : ', this._srchInfo.eqpMdlNm);
            Tw.Logger.info('this._srchInfo : ' + JSON.stringify(this._srchInfo));
            if(this._srchInfo.eqpMdlNm !== '' ){
                this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._srchInfo }));
            }else {
                this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: null }));
            }
        }
        this.$container.find('.fe-search-input').val(this._srchInfo.countryNm);
        this.manageType = [];
        this.typeTxt = [];

        Tw.Logger.info('roaming service info : ', JSON.stringify(this._rateInfo));

        // 국가별 이용가능 서비스 리스트 생성
        if(this._rateInfo.iPoPhone){    // 단말기 가능폰 확인
            if(this._rateInfo.iPoPhone === '0') {   // 지원가능 서비스 없는 경우
                if(this._rateInfo.eqpMthdCd === 'W'){   // wcdma+gsm
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma]);
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm]);
                }else if(this._rateInfo.eqpMthdCd === 'D'){ // cdma
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma]);
                }else {
                    if(this._rateInfo.lte > 0 && this._rateInfo.iLtePhone !== '' && this._rateInfo.iLtePhone !== 'N'){
                        this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.lte].txt);
                        this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.lte]);
                    }
                    if(this._rateInfo.wcdma > 0){
                        this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma].txt);
                        this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma]);
                    }
                    if(this._rateInfo.cdma > 0){
                        this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma].txt);
                        this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma]);
                    }
                    if(this._rateInfo.gsm > 0){
                        this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm].txt);
                        this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm]);
                    }
                }
            } else {
                if(this._rateInfo.lte > 0 && this._rateInfo.iLtePhone !== '' && this._rateInfo.iLtePhone !== 'N'){
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.lte].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.lte]);
                }

                if(this._rateInfo.iPoPhone === '1' && this._rateInfo.wcdma > 0) {    // WCDMA Only
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma]);
                } else if(this._rateInfo.iPoPhone === '2' && this._rateInfo.wcdma > 0 && this._rateInfo.gsm > 0){ // WCDMA+GSM
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma]);
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm]);
                } else if(this._rateInfo.iPoPhone === '4' && this._rateInfo.wcdma > 0 && this._rateInfo.cdma > 0){ // WCDMA+CDMA
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma]);
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma]);
                } else if(this._rateInfo.iPoPhone === '3' && this._rateInfo.gsm > 0 && this._rateInfo.cdma > 0){ // GSM+CDMA(SIM자동 로밍)
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma]);
                    this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm].txt);
                    this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm]);
                }
            }
        } else {
            if(this._rateInfo.lte > 0 && this._rateInfo.iLtePhone !== '' && this._rateInfo.iLtePhone !== 'N'){
                this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.lte].txt);
                this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.lte]);
            }
            if(this._rateInfo.wcdma > 0){
                this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma].txt);
                this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.wcdma]);
            }
            if(this._rateInfo.cdma > 0){
                this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma].txt);
                this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.cdma]);
            }
            if(this._rateInfo.gsm > 0){
                this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm].txt);
                this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.gsm]);
            }
        }

        // 임대 로밍 서비스가 가능한 경우
        if(this._rateInfo.rent > 0){
            this.reqParams.showDailyPrice = 'Y';
            this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.rent].txt);
            this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.rent]);
        }else {
            this.reqParams.showDailyPrice = 'N';
            // if(this._svcInfo === null && this._srchInfo.eqpMdlNm === ''){
            //     this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.rent].txt);
            //     this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.rent]);
            // } else {
            //     if(this._srchInfo.eqpMdlNm === ''){
            //         this.typeTxt.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.rent].txt);
            //         this.manageType.push(Tw.ROAMING_MANAGE_TYPE.list[this.type.rent]);
            //     }
            // }
        }

        // 이용가능 서비스가 있는 경우 로밍 요금 조회 요청.
        if(this.manageType.length > 0) {
            this.reqParams.manageType = this.manageType[0].type;
            this.$container.find('.fe-rm-type').text(this.typeTxt.join(', '));
            Tw.Logger.info('this.reqParams : ', this.reqParams);
            this._getCountryRoamingRate(this.reqParams, this);
        } else {
            // 이용가능한 서비스가 없는 경우 alert 호출.
            setTimeout($.proxy(this._openAlertPopup, this, null), 500);
        }
        this._rmRateInfoTmpl = Handlebars.compile($('#fe-roaming-rate').html());
        this._rmNoticeTmpl = Handlebars.compile($('#fe-roaming-notice').html());
        this._roamingDecriptonInit();
    },
    _openAlertPopup: function () {
        var alertMsg = this._srchInfo.countryNm + Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A21.MSG;
        this._popupService.openAlert(alertMsg, Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A21.TITLE, null,
            $.proxy(this._goBackSearchBefore, this), null);
    },
    _goBackSearchBefore: function () {
      this._history.goLoad('/product/roaming/do/search-before');
    },
    /**
     * @function
     * @desc 로밍 이용가능 서비스 요금 조회
     * @param params
     * @param event
     * @private
     */
    _getCountryRoamingRate: function (params, event) {
        Tw.Logger.info('get countryRoamingRate params :::: ', params);
        this._apiService.request(Tw.API_CMD.BFF_10_0058, params)
            .done($.proxy(this._handleSuccessRateResult, this, event))
            .fail($.proxy(this._handleFailSearch, this));
    },
    _bindEvents: function () {
        this.$container.on('click', '#fe-search-btn', $.proxy(this._onBtnClicked, this));       // 검색
        this.$container.on('click', '.fe-rmplan-btn', $.proxy(this._goRoamingPlan, this));      // 로밍요금제
        this.$container.on('click', '.fe-btn-rmadd', $.proxy(this._goRoamingPlanAdd, this));    // 로밍 부가서비스
        this.$container.on('click', '.fe-rm-card', $.proxy(this._goRoamingCard, this));         // 로밍 카드 쿠폰
        this.$container.on('click', '.fe-noti-btn', $.proxy(this._notiDetailView, this));       // 음성통화 수신요금 안내
        this.$container.on('click', '.fe-change-model', $.proxy(this._onChangeModel, this));    // 휴대폰 정보 변경
        this.$container.on('click', '.fe-manage-type', $.proxy(this._openMangeType, this));     // 이용가능 서비스 방식
        this.$container.on('click', '.fe-roaming-mfactCd', $.proxy(this._onHpSearch, this));    // 휴대폰 제조사 선택
        this.$container.on('click', '.fe-roaming-model', $.proxy(this._onSelectModel, this));   // 휴대폰 모델명 선택
        this.$container.on('click', '#fe-phone-btn', $.proxy(this._onClickSelectBtn, this));    // 휴대폰 정보 선택
        this.$container.on('click', '.fe-rm-asiapass', $.proxy(this._goAsiaPassPlan, this));    // 아시아패스
        this.$container.on('click', '.fe-rm-europepass', $.proxy(this._goEuropePassPlan, this));    // 유럽패스
        this.$container.on('click', '.fe-rm-data', $.proxy(this._goRoamingList, this, 'data'));
        this.$container.on('click', '.fe-rm-voice', $.proxy(this._goRoamingList, this, 'voice'));
    },
    _goRoamingList: function (type) {
        if(type === 'data') {
            this._history.goLoad('/product/roaming/fee?filters=F01531');
        } else if (type === 'voice') {
            this._history.goLoad('/product/roaming/fee?filters=F01532');
        }
    },
    _goAsiaPassPlan: function () {
        this._history.goLoad('/product/callplan?prod_id=NA00005900');
    },
    _goEuropePassPlan: function () {
        this._history.goLoad('/product/callplan?prod_id=NA00006046');
    },
  /**
   * @function
   * @desc 휴대폰 정보 선택.
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
            this._srchInfo.eqpMdlNm = this.modelValue;
            this.$userPhoneInfo.empty();
            this.$userPhoneInfo.append(this._rmPhoneInfoTmpl({ items: this._phoneInfo }));
            this._roamingDecriptonInit();
        }
    },
  /**
   * @function
   * @desc 휴대폰 모델 리스트 선택.
   * @private
   */
  _onSelectModel: function (e) {
        if(this.cdValue === undefined || this.cdValue === ''){
            return;
        }else {
            var data = [{
                list: null
            }];
            data[0].list = this.listData;
            this._popupService.open({
                    hbs: 'actionsheet01',
                    layer: true,
                    btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
                    data: data
                },
                $.proxy(this._selectModelCallback, this),
                $.proxy(this._closeActionPopup, this), null, $(e.currentTarget)
            );
        }
    },
    _selectModelCallback: function ($layer) {
        Tw.CommonHelper.focusOnActionSheet($layer); // IOS에서 포커스 이동이 되지 않아 강제로 포커스 이동(웹접근성)
        $layer.find('[data-model-nm="' + this.modelValue + '"]').attr('checked', 'checked');
        $layer.find('[name="r2"]').on('click', $.proxy(this._onPhoneSelect, this, $layer));
        $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
    },
  /**
   * @function
   * @desc 휴대폰 제조사 선택.
   * @param $layer
   * @param e
   * @private
   */
    _onPhoneSelect: function ($layer, e) {
        var target = $(e.currentTarget);
        this.modelValue = target.attr('data-model-nm');
        this.modelCode = target.attr('data-model-code');

        this.$container.find('.fe-roaming-model').text(this.modelValue);
        this._popupService.close();
    },
    _handleSuccessRateResult: function (event, resp) {
        if (resp.code !== Tw.API_CODE.CODE_00) {
            Tw.Error(resp.code, resp.msg).pop();
            return;
        }
        var _result = resp.result;
        _result.countryCd =  this._srchInfo.countryCd;         // 검색 국가
        Tw.Logger.info('rate result _result : ' + JSON.stringify(_result));

        if( this._rentYn === true ){ // 임대로밍을 선택한 경우 manageType 값 ''
          this.reqParams.manageType = '';
        }
        var typeIndex = null;
        for(var idx in this.manageType) {
            if(this.manageType[idx].type === this.reqParams.manageType) {
                typeIndex = idx;
                // this.manageType[idx].option = 'checked';
            }else {
                // this.manageType[idx].option = '';
            }
        }

        var noticeParam = {
            voiceShown: true,   // 음성통화 수신 요금 안내 노출 여부
            ableShown: true,
            attentionShown: false,  // 로밍 시 국가별 주의사항 노출 여부
            svcAttention: _result.svcAttention, // 로밍 시 국가별 주의 사항 내용
            hanaroMtCharge: _result.hanaroMtCharge, // 음성통화 수신 요금 sk브로드밴드
            dacomMtCharge: _result.dacomMtCharge,   // 음성통화 수신 요금 LG U+
            ktMtCharge: _result.ktMtCharge,         // 음성통화 수신 요금 KT
            onseMtCharge: _result.onseMtCharge      // 음성통화 수신 요금 세종텔레콤
        };

        if(this.reqParams.manageType === 'L'){  // 서비스 방식이 LTE인 경우
            _result.lteShown = true;    // LTE 안내 사항 노출
            noticeParam.voiceShown = false;
        }else if(this.reqParams.manageType === ''){ // 서비스 방식이 임대로밍 인 경우
            _result.rentShown = true;   // 임대로밍 안내사항 노출
        } else if(this.reqParams.manageType === 'C'){   // 서비스 방식이 2G인 경우 
            if(_result.dMoChargeMin){       //데이터 이용료가 있는 경우
                _result.cdmaUnit = true;
                _result.mTxtCharge = _result.dMoChargeMin;
                _result.mMtmCharge = _result.dMoChargeMin;
            }

            if(_result.countryCd == "USA"){     //  미국 CDMA(2G) 종료에 따른 안내 문구
                _result.usa2gOnly = true;
            }
        }

        if(_result.ableAreaType === 'A'){   // 이용가능 지역 상세보기 여부
            noticeParam.ableShown = false;
        }

        _result.dMoChargeMin = Number(_result.dMoChargeMin);    // 데이터 이용료
        _result.mTxtCharge =  Number(_result.mTxtCharge);       // MMS-텍스트 발신
        _result.mMtmCharge =  Number(_result.mMtmCharge);       // MMS 멀티미디어 발신
        noticeParam.attentionShown = (_result.svcAttention) ? true : false;

        Tw.Logger.info('result noticeParam = ', JSON.stringify(noticeParam));
        if(typeIndex === null || typeIndex === ''){
            typeIndex = -1;
        }

        this.$container.find('.fe-manage-type').text(this.manageType[typeIndex].txt);
        this.$roamingRatelist.empty();
        this.$roamingRatelist.append(this._rmRateInfoTmpl({ items: _result }));

        this.$roamingNoti.empty();
        this.$roamingNoti.append(this._rmNoticeTmpl({ items: noticeParam }));
        // 서비스 국가가 러시아이고, 3G인 경우 안내팝업 호출
        if(this.reqParams.manageType === 'W' && this._srchInfo.countryCd === 'RUS'){
            this._popupService.close();
            this._popupService.open({
                    hbs: 'RM_10',
                    layer: true
                }, $.proxy(this._closeRusNotiPopup, this), null, null, $(event.currentTarget));
        }
        this.$container.find('.round-dot-list li > a').attr('href', '/product/callplan?prod_id=TW61000002');
        this.$container.find('.round-dot-list li > a').removeAttr('target');

        // 팔라우, 세이셸, 마다가스카르의 국가의 경우 공지팝업 호출
        if(_result.dablYn === 'Y') {
            var popupDesc = _result.dablCtt;
            setTimeout($.proxy(this._openNoticePopup, this, popupDesc, event), 500);
        }

    },
  /**
   * @function
   * @desc 팔라우, 세이셸, 마다가스카르의 공지팝업
   * @param desc
   * @param event
   * @private
   */
    _openNoticePopup: function (desc, event) {
        this._popupService.open({
            'pop_name': 'type_tx_scroll',
            'title': Tw.ROAMING_ERROR.TITLE,
            'title_type': 'sub',
            'cont_align': 'tl',
            'contents': desc,
            'bt_b': Tw.ROAMING_ERROR.BUTTON
        }, null, $.proxy(this._onCloseRoamingNotice, this), null, $(event.currentTarget));
    },
    _onCloseRoamingNotice: function() {
        this._popupService.close();
    },
    _closeRusNotiPopup: function ($layer) {
        $layer.on('click', '.bt-red1', $.proxy(this._selectOkBtn, this));   // 러시아 3G 안내 팝업 닫기
        $layer.on('click', '.fe-rm-center', $.proxy(this._selectRoamingCenter, this));  // 로밍센터 안내 링크
    },
    _selectRoamingCenter: function () {
        this._popupService.close();
        setTimeout(function () {
            window.location.href = '/product/roaming/info/center';
        }, 300);

    },
    _selectOkBtn: function () {
        this._popupService.close();
    },
    _handleFailSearch:function () {

    },
    _onHpSearch: function (e) {
        this._popupService.open({
                hbs: 'actionsheet01',
                layer: true,
                btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
                data: [{ list: Tw.ROAMING_MFACTCD_LIST.list }]
            },
            $.proxy(this._selectMfactCdCallback, this), null, null, $(e.currentTarget)
        );
    },
    _selectMfactCdCallback: function ($layer) {
        Tw.CommonHelper.focusOnActionSheet($layer); // IOS에서 포커스 이동이 되지 않아 강제로 포커스 이동(웹접근성)
        $layer.find('[data-mfact-name="' + this.cdName + '"]').attr('checked', 'checked');
        $layer.find('[name="r2"]').on('click', $.proxy(this._getModelInfo, this, $layer));
        $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
    },
    _getModelInfo: function ($layer, e) {
        var target = $(e.currentTarget);
        this.cdValue = target.attr('data-mfact-code');
        this.cdName = target.attr('data-mfact-name');
        this._popupService.close();
        this.$container.find('.fe-roaming-mfactCd').text(this.cdName);

        this._onSearchModel(this.cdValue, e);
    },
    _onSearchModel: function (val, e) {
        this._apiService.request(Tw.API_CMD.BFF_10_0059, { mfactCd:val })
        // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0059.json')
            .done($.proxy(this._handleSuccessSearchModelResult, this, e))
            .fail($.proxy(this._handleFailModelSearch, this));
    },
    _handleSuccessSearchModelResult : function (e, resp) {
        var _result = resp.result;
        if ( resp.code === Tw.API_CODE.CODE_00 ) {
            if(_result.length > 0){
                this.$container.find('.fe-roaming-model').text(Tw.ROAMING_DESC.MODEL_DESC);
                this.modelValue = '';
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
                var ALERT = Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A71;
                this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, $.proxy(this._closeAlertPopup, this), null, $(e.currentTarget));
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
    _handleFailModelSearch: function () {

    },
  /**
   * @function
   * @desc 휴대폰 변경 선택 시 데이터 초기화.
   * @private
   */
  _onChangeModel: function (){
        this._phoneInfo.eqpMdlNm = '';
        this._phoneInfo.eqpMdlCd = '';
        this._srchInfo.eqpMdlNm = '';
        this._srchInfo.eqpMdlCd = '';
        this.modelValue = '';
        this.modelCode = '';
        this.cdValue = '';
        this.cdName = '';
        this.cdName = '';
        this.$userPhoneInfo.empty();
        this.$userPhoneInfo.append(this._rmPhoneSelectTmpl({ items: null }));
        this._roamingDecriptonInit();
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
  /**
   * @function
   * @desc 이용가능한 로밍 서비스 방식 액션시트 노출.
   * @private
   */
  _openMangeType: function (e){
        this._popupService.open(
            {
                hbs: 'actionsheet01',
                layer: true,
                btnfloating: { 'attr': 'type="button" data-role="fe-bt-close"', 'txt': '닫기' },
                data: [{ list: this.manageType }]
            },
            $.proxy(this._handleOpenTypePopup, this),
            undefined, undefined, $(e.currentTarget)
        );
    },
    _handleOpenTypePopup: function ($layer) {
        // $layer.on('click', 'ul.chk-link-list > li > button', $.proxy(this._handleSelectRoamingType, this));
        Tw.CommonHelper.focusOnActionSheet($layer); // IOS에서 포커스 이동이 되지 않아 강제로 포커스 이동(웹접근성) d
        $layer.find('[data-manage-type="' + this.reqParams.manageType + '"]').attr('checked', 'checked');
        $layer.find('[name="r2"]').on('click', $.proxy(this._handleSelectRoamingType, this, $layer));
        $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
    },
  /**
   * @function
   * @desc 로밍 서비스 방식 선택 후 이용요금 조회 요청.
   * @param $layer
   * @param e
   * @private
   */
    _handleSelectRoamingType: function ($layer, e) {
        var $target = $(e.currentTarget);
        var rmType = $target.attr('data-manage-type');

        if(this.reqParams.manageType === rmType){
            this._popupService.close();
        }else {
            // 로밍 서비스 방식이 빈값인 경우는 임대로밍이므로 manageType:G, showDailyPrice:Y로 변경함.
            this.reqParams.manageType = rmType;
            if(this.reqParams.manageType === ''){
                this._rentYn = true;
                this.reqParams.manageType = 'G';
                this.reqParams.showDailyPrice = 'Y';
            }else {
                this._rentYn = false;
                this.reqParams.showDailyPrice = 'N';
            }
            this._popupService.close();
            this._getCountryRoamingRate(this.reqParams, e);
        }
    },
    _selectPopupCallback:function ($layer) {
        Tw.CommonHelper.focusOnActionSheet($layer); // IOS에서 포커스 이동이 되지 않아 강제로 포커스 이동(웹접근성)
        $layer.find('[name="r2"]').on('click', $.proxy(this._goLoadSearchResult, this, $layer));
        $layer.find('[data-role="fe-bt-close"]').on('click', $.proxy(this._popupService.close, this));
    },
    _goLoadSearchResult: function ($layer, e) {
        var target = $(e.currentTarget);
        var optValue = target.attr('data-value');
        var valueArr = optValue.split('|');
        var countryCode = valueArr[0];
        var countryNm = encodeURIComponent(valueArr[1]);

        var eqpMdlNm = '';
        var eqpMdlCd = this._phoneInfo.eqpMdlCd;
        if(this._srchInfo.eqpMdlNm !== ''){
            eqpMdlNm = encodeURIComponent(this._srchInfo.eqpMdlNm);
        }

        var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm + '&eqpNm=' + eqpMdlNm + '&eqpCd=' + eqpMdlCd;

        this._history.goLoad(resultUrl);
    },
    _closeActionPopup: function () {

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
    _onBtnClicked : function (e) {
        this.keyword = this.$container.find('.fe-search-input').val().trim();
        this.searchKeyword = encodeURI(this.$container.find('.fe-search-input').val().trim());
        var ALERT = Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A23;

        Tw.Logger.info(this.searchKeyword);

        if(this.searchKeyword === ''){
            this._popupService.openAlert(ALERT.MSG, ALERT.TITLE, null, null, null, $(e.currentTarget));
        }else {
            this._apiService.request(Tw.API_CMD.BFF_10_0060, { keyword: this.searchKeyword })
                .done($.proxy(this._handleSuccessSearchResult, this, e))
                .fail($.proxy(this._handleFailSearchResult, this));
        }
    },
    /**
     * @function
     * @desc 국가 검색. 키워드 포함된 나라가 1개 이상인 경우 액션팝업 호출.
     * @param resp
     * @private
     */
    _handleSuccessSearchResult : function (e, resp) {
        var _result = resp.result;

        var alertMsg = this.keyword + Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A22.MSG;
        if(_result.length === 0) {
            this._popupService.openAlert(alertMsg, Tw.ALERT_MSG_PRODUCT_ROAMING.ALERT_3_A22.TITLE,
              null, null, null, $(e.currentTarget));
            this.$inputContrySearch.val('');
            return;
        }

        if(_result.length > 1 ){
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
                $.proxy(this._selectPopupCallback, this), null, null, $(e.currentTarget)
            );

        }else {
            var countryCode = _result[0].countryCode;
            var countryNm = encodeURIComponent(_result[0].countryNm);

            var eqpMdlNm = '';
            var eqpMdlCd = this._phoneInfo.eqpMdlCd;
            if(this._phoneInfo.eqpMdlNm !== ''){
                eqpMdlNm = encodeURIComponent(this._phoneInfo.eqpMdlNm);
            }
            var resultUrl = '/product/roaming/search-result?code=' + countryCode + '&nm=' + countryNm + '&eqpNm=' + eqpMdlNm + '&eqpCd=' + eqpMdlCd;

            this._history.goLoad(resultUrl);
        }
    },
    /**
     * @function
     * @desc 휴대폰 선택 case별 상/하단 안내 메시지
     * @private
     */
    _roamingDecriptonInit: function () {
        if(this._svcInfo !== null){ // 사용자 로그인
            this._svcInfo.totalSvcCnt = Number(this._svcInfo.totalSvcCnt);
            this._svcAttrCd = this._svcInfo.svcAttrCd.charAt(0);
            if(this._svcInfo.totalSvcCnt > 1 ){ // 회선정보가 여러개일 경우
                if(this._svcAttrCd !== 'M'){ // 유무선 서비스에 가입되어 있으나 유선 회선으로 접속한 회원
                    this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_LINE_MSG);
                    this.$container.find('.fe-bottom-msg').html('');
                } else {
                    if(this._srchInfo.eqpMdlNm !== ''){ // 단말 정보가 있는 Type
                        this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                        this.$container.find('.fe-bottom-msg').html('');
                    } else {    // 단말정보가 없는Type
                        this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                        this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_PHONE_MSG);
                    }
                }
            }else if(this._svcInfo.totalSvcCnt === 1){  // 회선정보가 한개일 경우
                if(this._svcAttrCd !== 'M'){    // 유선에만 가입된 회원
                    this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_LOGIN_MSG);
                    this.$container.find('.fe-bottom-msg').html('');
                } else {
                    if(this._srchInfo.eqpMdlNm !== ''){ // 단말 정보가 있는 Type
                        this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                        this.$container.find('.fe-bottom-msg').html('');
                    } else {    // 단말정보가 없는Type
                        this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                        this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_PHONE_MSG);
                    }
                }
            } else {    // 단말정보가 없는Type
                this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
                this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_PHONE_MSG);
            }
        } else {    // 사용자 비로그인
            this.$container.find('.fe-header-msg').html(Tw.ROAMING_DESC.HEADER_NOTI_MSG);
            this.$container.find('.fe-bottom-msg').html(Tw.ROAMING_DESC.BOTTOM_NOTI_LOGIN_MSG);
        }
    },
    _handleFailSearchResult : function () {

    }
};

/**
 * @file membership.submain.js
 * @desc T멤버십 > submain (BE_01)
 * @author EunJung Jung
 * @since 2018.12.26
 */

Tw.MembershipSubmain = function(rootEl, membershipData, svcInfo, menuId) {
  this.$container = rootEl;
  this._membershipData = membershipData;
  this._svcInfo = svcInfo;
  this._membershipLayerPopup = new Tw.MembershipInfoLayerPopup(this.$container, this._svcInfo);
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._xTractorService = new Tw.XtractorService(this.$container);
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._map = undefined;
  this._menuId = menuId;
  this._cachedElement();
  this._bindEvent();
  //this._getMembershipBanner();
  this._getTosAdminMembershipBanner();
  this._checkLocationAgreement();
};

Tw.MembershipSubmain.prototype = {
  ICON: {
    V: 'vip',
    G: 'gold',
    S: 'silver',
    A: 'all'
  },
  _cachedElement: function() {
    this.$barCode = this.$container.find('#fe-barcode-btn');          // 멤버십 바코드
    this.$nearBrand = this.$container.find('#fe-memebership-near');   // 내 주변 제휴 브랜드
    this._nearBrandTmpl = Handlebars.compile($('#tmplList').html());
    this._noBrandTmpl = Handlebars.compile($('#tmplList-no-data').html());
  },

  _bindEvent: function() {
    this.$barCode.on('click', $.proxy(this._showBarCodePopup, this));   // 멤버십 바코드 이미지
    this.$container.on('click', '.fe-benefit-title', $.proxy(this._goBenefitBrand, this));  // 제휴 브랜드
    this.$container.on('click', '.fe-membership-grade', $.proxy(this._goMembershipGrade, this));  // 멤버십 카드/등급 안내
    this.$container.on('click', '.box-app-down', $.proxy(this._goTmembership, this));   // T앱
    this.$container.on('click', '.data-plus', $.proxy(this._selectChocolate, this));    // 초콜릿
    this.$container.on('click', '.coalition-brand-list .map', $.proxy(this._getBrandDetailInfo, this)); // 지도보기
    this.$container.on('click', '#fe-membership-join', $.proxy( this._membershipLayerPopup.onClickJoinBtn, this._membershipLayerPopup));  // 가입하기
    // this.$container.on('click', '#fe-membership-join', $.proxy( this._membershipLoginCheck, this));
    this.$container.on('click', '.fe-mebership-my', $.proxy(this._goMyMembership, this));   // 나의 멤버십
    this.$container.on('click', '.fe-membership-location', $.proxy(this._selectLocationAgreement, this)); // 사용자 위치
    this.$container.on('click', '.fe-membership-tday', $.proxy(this._selectTday, this));  // T day
    this.$container.on('click', '.fe-movie-culture', $.proxy(this._selectMovieCulture, this));  // 무비/컬처
  },
  /**
   * @function
   * @desc 내주변 제휴 브랜드 위치 선택 시 위치동의 여부 확인
   * @private
   */
  _selectLocationAgreement:function () {
    if(this._svcInfo) { // 사용자 로그인
      if(this._svcInfo.loginType !== Tw.AUTH_LOGIN_TYPE.EASY){
        this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
            .done($.proxy(function (res) {
              if (res.code === Tw.API_CODE.CODE_00) {
                Tw.Logger.info('check loc agreement : ', res);
                if (res.result.twdLocUseAgreeYn === 'Y') {  // 위치정보 이용 동의 여부 'Y'인 경우 현재 위치 요청.
                  this._askCurrentLocation();
                } else {
                  this._showAgreementPopup(); // 위치정보 이용 동의 'N'인 경우 동의 팝업 호출
                }
              } else if (res.code === Tw.API_CODE.BFF_0006 || res.code === Tw.API_CODE.BFF_0007) {
                this.$container.find('.fe-near-brand').hide();
              }
              else {
                Tw.Error(res.code, res.msg).pop();
              }
            }, this))
            .fail(function (err) {
              Tw.Error(err.code, err.msg).pop();
            });
      } else {  // 간편로그인 사용자의 경우 alert 호출
        this._popupService.openAlert(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A72.MSG, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A72.TITLE);
      }

    } else {  // 비로그인 시 로그인 화면으로 이동
      this._goLogin();
    }
  },
  /**
   * @function
   * @desc 위치 동의 여부 확인 후 현재 위치 요청
   * @private
   */
  _checkLocationAgreement:function () {
    if(this._svcInfo && this._svcInfo.loginType !== Tw.AUTH_LOGIN_TYPE.EASY) {
      this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
          .done($.proxy(function (res) {
            if (res.code === Tw.API_CODE.CODE_00) {
              Tw.Logger.info('check loc agreement : ', res);
              if (res.result.twdLocUseAgreeYn === 'Y') {
                this._askCurrentLocation();
              } else {
                this._getAreaByGeo({
                  latitude: '37.5600420',
                  longitude: '126.9858500'
                });

              }
            } else {
              Tw.Error(res.code, res.msg).pop();
            }
          }, this))
          .fail(function (err) {
            Tw.Error(err.code, err.msg).pop();
          });
    } else {
      this._getAreaByGeo({
        latitude: '37.5600420',
        longitude: '126.9858500'
      });
    }
  },
  /**
   * @function
   * @desc 혜택바로가기 > 무비/컬처
   * @param e
   * @private
   */
  _selectMovieCulture: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A70.MSG, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A70.TITLE,
      $.proxy(this._goMovieCulture, this),
      $.proxy(function () {
        this._popupService.close();
      }, this), Tw.BUTTON_LABEL.CLOSE, Tw.BUTTON_LABEL.CONFIRM, $(e.currentTarget));
  },
  /**
   * @function
   * @desc 혜택바로가기 > T Day
   * @param e
   * @private
   */
  _selectTday: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A70.MSG, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A70.TITLE,
      $.proxy(this._goTday, this),
      $.proxy(function () {
        this._popupService.close();
      }, this), Tw.BUTTON_LABEL.CLOSE, Tw.BUTTON_LABEL.CONFIRM, $(e.currentTarget));
  },
  /**
   * @function
   * @desc 혜택바로가기 > 초콜릿
   * @param e
   * @private
   */
  _selectChocolate: function (e) {
    this._popupService.openConfirmButton(Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A70.MSG, Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A70.TITLE,
      $.proxy(this._goChocolate, this),
      $.proxy(function () {
        this._popupService.close();
      }, this), Tw.BUTTON_LABEL.CLOSE, Tw.BUTTON_LABEL.CONFIRM, $(e.currentTarget));
  },
  /**
   * @function
   * @desc T Day 링크 이동
   * @private
   */
  _goTday: function () {
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(Tw.MEMBERSHIP_URL.TDAY,'');
  },
  /**
   * @function
   * @desc 로그인페이지 이동
   * @private
   */
  _goLogin: function () {
    this._tidLanding.goLogin();
  },
  /**
   * @function
   * @desc 위치 정보 이용 동의 여부 'N'일 경우 위치 정보 이용 동의 팝업 호출
   * @private
   */
  _showAgreementPopup: function () {
    this._popupService.open({
          ico: 'type3', title: Tw.BRANCH.PERMISSION_TITLE, contents: Tw.BRANCH.PERMISSION_DETAIL,
          link_list: [{style_class: 'fe-link-term', txt: Tw.BRANCH.VIEW_LOCATION_TERM}],
          bt: [{style_class: 'bt-blue1', txt: Tw.BRANCH.AGREE},
            {style_class: 'bt-white2', txt: Tw.BRANCH.CLOSE}]
        }, $.proxy(function (root) {
          root.on('click', '.fe-link-term', $.proxy(function () {
            // 약관 보기 화면으로 이동
            this._historyService.goLoad('/main/menu/settings/terms?id=33&type=a');
          }, this));
          root.on('click', '.bt-white2', $.proxy(function () {
            this._popupService.close();
          }, this));
          root.on('click', '.bt-blue1', $.proxy(function () {
            this._popupService.close();
            var data = { twdLocUseAgreeYn: 'Y' };
            this._apiService.request(Tw.API_CMD.BFF_03_0022, data)
                .done($.proxy(function (res) {
                  if (res.code === Tw.API_CODE.CODE_00) {
                    this._askCurrentLocation();
                  } else {
                    Tw.Error(res.code, res.msg).pop();
                  }
                }, this))
                .fail(function (err) {
                  Tw.Error(err.code, err.msg).pop();
                });
          }, this));
        }, this),
        $.proxy(function () {
          this._popupService.close();
        }, this)
    );
  },


  /**
   * @function
   * @desc 토스 배너 정보 요청
   * @private
   */
  _getTosAdminMembershipBanner: function () {
    this._apiService.requestArray([
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: '0006' } },
      { command: Tw.NODE_CMD.GET_NEW_BANNER_TOS, params: { code: '0007' } },
      { command: Tw.NODE_CMD.GET_BANNER_ADMIN, params: { menuId: this._menuId } }
    ]).done($.proxy(this._successTosAdminMemberShipBanner, this));
  },

  /**
   * @function
   * @desc 토스 배너 처리
   * @param resp
   * @private
   */
  _successTosAdminMemberShipBanner: function (banner1, banner2, admBanner) {
    var result = [{ target: 'S', banner: banner1 },
    { target: 'B', banner: banner1 }];

    result.forEach(function(row){
      if(row.banner && row.banner.code === Tw.API_CODE.CODE_00){
        if(!row.banner.result.summary){
          row.banner.result.summary = {target: row.target};  
        }
        row.banner.result.summary.kind = Tw.REDIS_BANNER_TYPE.TOS;
        row.banner.result.imgList = Tw.CommonHelper.setBannerForStatistics(row.banner.result.imgList, row.banner.result.summary);
      }else{
        row.banner = { result: {summary : { target: row.target }, imgList : [] } };
      }

      if(admBanner.code === Tw.API_CODE.CODE_00){
        row.banner.result.imgList = row.banner.result.imgList.concat( 
          admBanner.result.banners.filter(function(admbnr){
            return admbnr.bnnrLocCd === row.target;
          }).map(function(admbnr){
            admbnr.kind = Tw.REDIS_BANNER_TYPE.ADMIN;
            admbnr.bnnrImgAltCtt = admbnr.bnnrImgAltCtt.replace(/<br>/gi, ' ');
            return admbnr;
          })
        );
      }
    })
    this._drawTosAdminMemberShipBanner(result);
  },

  /**
   * @function
   * @desc 토스 배너 렌더링
   * @param banners
   * @private
   */
  _drawTosAdminMemberShipBanner: function (banners) {
    _.map(banners, $.proxy(function (bnr) {
      if ( bnr.banner.result.bltnYn === 'N' ) {
        this.$container.find('ul.slider[data-location=' + bnr.target + ']').parents('div.nogaps').addClass('none');
      }
      
      if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) ) {
        if ( bnr.target === 'B' ) {
          this._membershipPopupBanner = {
            kind: Tw.REDIS_BANNER_TYPE.TOS_ADMIN,
            list: bnr.banner.result.imgList
          };
        } else {
          new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS_ADMIN, bnr.banner.result.imgList, bnr.target, $.proxy(this._successDrawBanner, this));
        }
      }
    }, this));
    
    new Tw.XtractorService(this.$container);

  },
  _checkTosBanner: function (tosBanner) {
    if ( tosBanner.code === Tw.API_CODE.CODE_00 ) {
      if ( tosBanner.result.bltnYn === 'N' ) {
        return true;
      } else {
        if ( tosBanner.result.tosLnkgYn === 'Y' ) {
          return true;
        } else {
          return false;
        }
      }
    }
    return false;
  },
  /**
   * @function
   * @desc 나의 멤버십 화면으로 이동
   * @private
   */
  _goMyMembership: function() {
    this._historyService.goLoad('/membership/my');
  },
  _getBrandDetailInfo: function (event) {
    this.currentTarget = $(event.currentTarget);
    var params = {
      coCd: this.currentTarget.data('cocd'),
      joinCd: this.currentTarget.data('joincd')
    };

    this._apiService.request(Tw.API_CMD.BFF_11_0024, params)
        .done($.proxy(this._handleSuccessDetailInfo, this))
        .fail($.proxy(this._handleFailCallBack, this));
  },
  _handleSuccessDetailInfo: function (resp) {
    Tw.Logger.info('_handleSuccessDetailInfo resp', resp);
    var _result = resp.result;
    var param = {
      coCd: _result.coCd,
      joinCd: _result.joinCd,
      mapX: _result.googleMapCoordX,
      mapY: _result.googleMapCoordY,
      brandCd:_result.brandCd,
      cateCd: _result.cateCd
    };
    this._historyService.goLoad('/membership/benefit/map?' + $.param(param));
  },
  /**
   * @function
   * @desc 초콜릿 링크 이동
   * @private
   */
  _goChocolate: function () {
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(Tw.MEMBERSHIP_URL.CHOCOLATE,'');
  },
  _goTmembership: function () {
    this._historyService.goLoad('/product/apps/app?appId=TW50000020');
  },
  _goMembershipGrade: function () {
    this._historyService.goLoad('/membership/membership_info/mbrs_0001');
  },
  /**
   * @function
   * @desc 제휴 브랜드 화면으로 이동
   * @private
   */
  _goBenefitBrand: function () {
    this._historyService.goLoad('/membership/benefit/brand');
  },
  _checkCurrentLocation: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._getAreaByGeo(location);
    } else {
      this._askCurrentLocation();
    }
  },
  /**
   * @function
   * @desc 현재 사용자 위치 정보 요청
   * @private
   */
  _askCurrentLocation: function() {
    Tw.Logger.info('[_askCurrentLocation]');
    if(this._svcInfo){
      // app인 경우
      if (Tw.BrowserHelper.isApp()){
        // 기기 gps에 문제가 있는 경우 native에서 리턴없으므로 자체적으로 처리 (DV001-13593)
        this._getCurrentLocationTimeout = setTimeout($.proxy(function(){
          if(this._getCurrentLocationTimeout){
            this._getCurrentLocationTimeout = null;
            // 위치 가져오지 못한 경우 서울 중구를 기본값으로 데이터 요청.
            this._getAreaByGeo({
              latitude: '37.5600420',
              longitude: '126.9858500'
            });
          }
        }, this), 2000);
        this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(function(result){
              this._getCurrentLocationTimeout = null;
              if(result && result.resultCode === Tw.NTV_CODE.CODE_00){
                this._getAreaByGeo(result.params);
              } else {
                // 위치 가져오지 못한 경우 서울 중구를 기본값으로 데이터 요청.
                this._getAreaByGeo({
                  latitude: '37.5600420',
                  longitude: '126.9858500'
                });
              }
            }, this));
      } else {
        // app이 아닌 경우
        if ('geolocation' in navigator) {
          // Only works in secure mode(Https) - for test, use localhost for url
          var geoOptions = {timeout: 1000};
          navigator.geolocation.getCurrentPosition($.proxy(this._successGeolocation, this), $.proxy(this._failGeolocation, this), geoOptions);
        } else {
          // 위치 가져오지 못한 경우 서울 중구를 기본값으로 데이터 요청.
          this._getAreaByGeo({
            latitude: '37.5600420',
            longitude: '126.9858500'
          });
        }
      }
    } else {
      // 위치 가져오지 못한 경우 서울 중구를 기본값으로 데이터 요청.
      this._getAreaByGeo({
        latitude: '37.5600420',
        longitude: '126.9858500'
      });
    }
  },
  /**
   * @function
   * @desc 현재 사용자 위치 정보 요청 실패한 경우 서울 중구를 기본값으로 지역정보 요청.
   * @param resp
   * @private
   */
  _failGeolocation: function (resp) {
    Tw.Logger.info('_fail geolocation getCurrentPosition resp: ', resp);
    setTimeout($.proxy(this._openFailNoticePopup, this), 500);
  },
  _openFailNoticePopup: function () {
    this._getAreaByGeo({
      latitude: '37.5600420',
      longitude: '126.9858500'
    });
  },
  /**
   * @function
   * @desc 현재 사용자 위치 정보 요청 성공한 경우 현재 위치의 지역정보 요청.
   * @param location
   * @private
   */
  _successGeolocation: function (location) {
    Tw.Logger.info('_success geolocation getCurrentPosition');
    this._getAreaByGeo({
      longitude: location.coords.longitude,
      latitude: location.coords.latitude
    });
  },
  /**
   * @function
   * @desc 사용자 위치의 지역정보 요청
   * @param location
   * @private
   */
  _getAreaByGeo: function (location) {
    Tw.Logger.info('current location : ', location);
    this.currentLocation = {
      mapX: location.latitude,
      mapY: location.longitude
    };

    Tw.Logger.info('this.currentLocation : ', this.currentLocation);
    this._apiService.request(Tw.API_CMD.BFF_11_0026, this.currentLocation)
    // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0059.json')
        .done($.proxy(this._handleSuccessAreaByGeo, this))
        .fail($.proxy(this._handleFailCallBack, this));
  },
  _handleSuccessAreaByGeo: function (resp) {
    var _result = resp.result;
    Tw.Logger.info('result : ', _result);
    // [2019.03.29 BE요청사항] 좌표값 이상하게 들어오는 경우에 대해 BE에서 아래와 같이 처리하기로 함.
    // 현재 : COM1017 에러 발생
    // 변경 후 : success로 리턴, 각 필드 빈값('')으로 결과값 리턴
    if ( resp.code === Tw.API_CODE.CODE_00 && _result.area1 !== '' && _result.area2 !== '') {
      var location = _result.area1 + ' ' + _result.area2;
      this.$container.find('.fe-membership-location').text(location);
      this.currentLocation.area1 = encodeURIComponent(_result.area1);
      this.currentLocation.area2 = encodeURIComponent(_result.area2);
      Tw.Logger.info('this.currentLocation : ', this.currentLocation);
      this._apiService.request(Tw.API_CMD.BFF_11_0025, this.currentLocation)
          .done($.proxy(this._handleSuccessNeaBrand, this))
          .fail($.proxy(this._handleFailCallBack, this));
    } else if (resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0007) {
      this.$container.find('.fe-near-brand').hide();
    }
    else {
      this._getAreaByGeo({
        latitude: '37.5600420',
        longitude: '126.9858500'
      });
    }
  },
  /**
   * @function
   * @desc 내 주변 제휴브랜드 등급별 혜택 아이콘 정렬
   * @param ico
   * @private
   */
  _changeIcoGrade: function(ico) {
    var iconGrade = ico.split('');
    var iconArr = [];
    for(var i in iconGrade){
      iconArr.push(this.ICON[iconGrade[i]]);
    }
    return iconArr;
  },
  /**
   * @function
   * @desc 내 주변 제휴브랜드 노출
   * @param resp
   * @private
   */
  _handleSuccessNeaBrand: function (resp) {
    Tw.Logger.info('near brand resp :', resp);
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      if(Number(resp.result.totalCnt) > 0){
        this.nearBrandData = resp.result.list;
        for(var idx in this.nearBrandData){
          this.nearBrandData[idx].showIcoGrd1 = this._changeIcoGrade(this.nearBrandData[idx].icoGrdChk1);
          this.nearBrandData[idx].showIcoGrd2 = this._changeIcoGrade(this.nearBrandData[idx].icoGrdChk2);
          this.nearBrandData[idx].showIcoGrd3 = this._changeIcoGrade(this.nearBrandData[idx].icoGrdChk3);
          this.nearBrandData[idx].showIcoGrd4 = this._changeIcoGrade(this.nearBrandData[idx].icoGrdChk4);
        }
        Tw.Logger.info('near brand resp :', this.nearBrandData);
        this.$nearBrand.empty();
        this.$nearBrand.append(this._nearBrandTmpl({ list : this.nearBrandData }));
      } else {
        this.$nearBrand.empty();
        this.$nearBrand.append(this._noBrandTmpl());
      }

    } else if (resp.code === Tw.API_CODE.BFF_0006 || resp.code === Tw.API_CODE.BFF_0007) {
      this.$container.find('.fe-near-brand').hide();
    }
    else {
      this._getAreaByGeo({
        latitude: '37.5600420',
        longitude: '126.9858500'
      });
    }
  },
  _handleFailCallBack: function () {

  },
  /**
   * @function
   * @desc 멤버십 바코드 팝업 호출
   * @param event
   * @private
   */
  _showBarCodePopup : function (event) {
    var cardNum = this.$container.find('#fe-barcode-img').data('cardnum');
    this._mbrGrStr = this._membershipData.mbrGrStr;
    this._mbrGrCd = this._membershipData.mbrGrCd;
    this._usedAmt = this._membershipData.showUsedAmount;
    this._showCardNum = this._membershipData.showCardNum;

    this._popupService.open({
      hbs: 'HO_01_01_02',
      layer: true,
      data: {
        mbrGr: this._mbrGrStr.toLowerCase(),
        mbrGrStr: this._mbrGrStr,
        cardNum: cardNum,
        showCardNum: this._showCardNum,
        usedAmount: this._usedAmt
      }
    }, $.proxy(this._onOpenBarcode, this, cardNum), null, null,  $(event.currentTarget));
  },
  /**
   * @function
   * @desc 멤버십 바코드 생성 및 배너 그리기
   * @param cardNum
   * @param $popupContainer
   */
  _onOpenBarcode: function (cardNum, $popupContainer) {
    var membershipBarcode = $popupContainer.find('#fe-membership-barcode-extend');
    if ( !Tw.FormatHelper.isEmpty(cardNum) ) {
      membershipBarcode.JsBarcode(cardNum, {
        height: 60,
        margin: 0,
        displayValue: false
      });
    }
    if ( !Tw.FormatHelper.isEmpty(this._membershipPopupBanner) ) {
      new Tw.BannerService($popupContainer, this._membershipPopupBanner.kind, this._membershipPopupBanner.list, '7');
    }
  },
  /**
   * @function
   * @desc 무비/컬처 링크 이동
   * @private
   */
  _goMovieCulture: function () {
    this._popupService.close();
    Tw.CommonHelper.openUrlExternal(Tw.MEMBERSHIP_URL.MOVIE,'');
  },
  
};

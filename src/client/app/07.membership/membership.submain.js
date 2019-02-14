/**
 * FileName: membership.submain.js
 * Author: EunJung Jung
 * Date: 2018.12.26
 */

Tw.MembershipSubmain = function(rootEl, membershipData, svcInfo, membershipCheckData, menuId) {
  this.$container = rootEl;
  this._membershipData = membershipData;
  this._svcInfo = svcInfo;
  this._membershipLayerPopup = new Tw.MembershipInfoLayerPopup(this.$container);
  this._nativeService = Tw.Native;
  this._historyService = new Tw.HistoryService();
  this._tidLanding = new Tw.TidLandingComponent();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._map = undefined;
  this._menuId = menuId;
  this._membershipInit();
  this._cachedElement();
  this._bindEvent();
  this._getMembershipBanner();
  this._askCurrentLocation();
};

Tw.MembershipSubmain.prototype = {
  ICON: {
    V: 'vip',
    G: 'gold',
    S: 'silver',
    A: 'all'
  },
  _membershipInit: function () {
    if(this._svcInfo){
      this._membershipLayerPopup.reqPossibleJoin();
    }
  },
  _cachedElement: function() {
    this.$barCode = this.$container.find('#fe-barcode-img');
    this.$nearBrand = this.$container.find('#fe-memebership-near');
    this._nearBrandTmpl = Handlebars.compile($('#tmplList').html());
  },

  _bindEvent: function() {
    this.$barCode.on('click', $.proxy(this._showBarCodePopup, this));
    this.$container.on('click', '.fe-benefit-title', $.proxy(this._goBenefitBrand, this));
    this.$container.on('click', '.fe-membership-grade', $.proxy(this._goMembershipGrade, this));
    this.$container.on('click', '.box-app-down', $.proxy(this._goTmembership, this));
    this.$container.on('click', '.data-plus', $.proxy(this._selectChocolate, this));
    this.$container.on('click', '.coalition-brand-list .map', $.proxy(this._getBrandDetailInfo, this));
    // this.$container.on('click', '#fe-membership-join', $.proxy( this._membershipLayerPopup.onClickJoinBtn, this._membershipLayerPopup));
    this.$container.on('click', '#fe-membership-join', $.proxy( this._membershipLoginCheck, this));
    this.$container.on('click', '.fe-mebership-my', $.proxy(this._goMyMembership, this));
    this.$container.on('click', '.fe-membership-location', $.proxy(this._checkLocationAgreement, this));
    this.$container.on('click', '.fe-membership-tday', $.proxy(this._selectTday, this));
  },
  _checkLocationAgreement:function () {
    if(this._svcInfo) {
      this._apiService.request(Tw.API_CMD.BFF_03_0021, {})
          .done($.proxy(function (res) {
            if (res.code === Tw.API_CODE.CODE_00) {
              Tw.Logger.info('check loc agreement : ', res);
              if (res.result.twdLocUseAgreeYn === 'Y') {
                this._askCurrentLocation();
              } else {
                this._showAgreementPopup();
              }
            } else {
              Tw.Error(res.code, res.msg).pop();
            }
          }, this))
          .fail(function (err) {
            Tw.Error(err.code, err.msg).pop();
          });
    } else {
      this._goLogin();
    }

  },
  _selectTday: function() {
    if (Tw.BrowserHelper.isApp()) {
      this._popupService.openConfirm(Tw.POPUP_CONTENTS.NO_WIFI, Tw.POPUP_TITLE.EXTERNAL_LINK, null, $.proxy(this._goTday, this));
    } else {
      this._goTday();
    }
  },
  _selectChocolate: function () {
    if (Tw.BrowserHelper.isApp()) {
      this._popupService.openConfirm(Tw.POPUP_CONTENTS.NO_WIFI, Tw.POPUP_TITLE.EXTERNAL_LINK, null, $.proxy(this._goChocolate, this));
    } else {
      this._goChocolate();
    }
  },
  _goTday: function () {
    Tw.CommonHelper.openUrlExternal(Tw.MEMBERSHIP_URL.TDAY,'');
  },
  _membershipLoginCheck: function () {
    if(this._svcInfo && this._svcInfo.loginType !== Tw.AUTH_LOGIN_TYPE.EASY ) {
      this._membershipLayerPopup.onClickJoinBtn();
    } else {
      this._popupService.openConfirmButton(
          Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A68.MSG,
          Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A68.TITLE,
          $.proxy(function () {
            this._goLogin();
          }, this),
          $.proxy(function () {
            this._popupService.close();
          }, this),
          Tw.BUTTON_LABEL.CLOSE,
          Tw.ALERT_MSG_MEMBERSHIP.ALERT_1_A68.BUTTON
      );
    }
  },
  _goLogin: function () {
    this._tidLanding.goLogin();
  },
  _showAgreementPopup: function () {
    this._popupService.open({
          ico: 'type3', title: Tw.BRANCH.PERMISSION_TITLE, contents: Tw.BRANCH.PERMISSION_DETAIL,
          link_list: [{style_class: 'fe-link-term', txt: Tw.BRANCH.VIEW_LOCATION_TERM}],
          bt: [{style_class: 'bt-blue1', txt: Tw.BRANCH.AGREE},
              {style_class: 'bt-white2', txt: Tw.BRANCH.CLOSE}]
        }, $.proxy(function (root) {
          root.on('click', '.fe-link-term', $.proxy(function () {
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
  _getMembershipBanner: function (){
    this._apiService.requestArray([
        { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0006' } },
        { command: Tw.NODE_CMD.GET_BANNER_TOS, params: { code: '0007' } }
     ]).done($.proxy(this._successTosBanner, this));
  },
  _successTosBanner: function (banner1, banner2) {
      var result = [{ target: '6', banner: banner1 },
                    { target: '7', banner: banner2 }];
    var adminList = [];
    _.map(result, $.proxy(function (bnr) {
      if ( this._checkTosBanner(bnr.banner) ) {
        if ( !Tw.FormatHelper.isEmpty(bnr.banner.result.summary) ) {
          if ( bnr.target === '7' ) {
            this._membershipPopupBanner = {
              type: Tw.REDIS_BANNER_TYPE.TOS,
              list: bnr.banner.result.imgList
            };
          } else {
            new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.TOS, bnr.banner.result.imgList, '6');
          }
        }
      } else {
        adminList.push(bnr);
      }
    }, this));

    if ( adminList.length > 0 ) {
      this._getAdminBanner(adminList);
    }
  },
  _successAdminBanner: function (adminList, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      _.map(adminList, $.proxy(function (target) {
        var banner = _.filter(resp.result.banners, function (banner) {
          return banner.bnnrLocCd === target.target;
        });
        if ( banner.length > 0 ) {
          if ( target.target === '7' ) {
            this._membershipPopupBanner = {
              type: Tw.REDIS_BANNER_TYPE.ADMIN,
              list: banner
            };
          } else {
            new Tw.BannerService(this.$container, Tw.REDIS_BANNER_TYPE.ADMIN, banner, target.target);
          }
        } else {
          this.$container.find('.fe-membership-banner').remove();
        }
      }, this));
    }
  },
  _getAdminBanner: function (adminList) {
    this._apiService.request(Tw.NODE_CMD.GET_BANNER_ADMIN, { menuId: this._menuId })
        .done($.proxy(this._successAdminBanner, this, adminList));
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
  _goChocolate: function () {
    Tw.CommonHelper.openUrlExternal(Tw.MEMBERSHIP_URL.CHOCOLATE,'');
  },
  _goTmembership: function () {
    this._historyService.goLoad('/product/apps/app?appId=TW50000020');
  },
  _goMembershipGrade: function () {
    this._historyService.goLoad('/membership/membership_info/mbrs_0001');
  },
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
  _askCurrentLocation: function() {
    if (Tw.BrowserHelper.isApp()) {
      this._nativeService.send(Tw.NTV_CMD.GET_LOCATION, {}, $.proxy(function (res) {
        if (res.resultCode !== Tw.NTV_CODE.CODE_00 ) {
          this._getAreaByGeo({
            mapX: '37.5600420',
            mapY: '126.9858500'
          });
        } else {
          this._getAreaByGeo(res.params);
        }
      }, this));
    } else {
      this._getAreaByGeo({
        mapX: '37.5600420',
        mapY: '126.9858500'
      });
    }
  },
  _getAreaByGeo: function (location) {
    Tw.Logger.info('current location : ', location);
    this.currentLocation = {
      mapX: location.mapX,
      mapY: location.mapY
    };
    this._apiService.request(Tw.API_CMD.BFF_11_0026, this.currentLocation)
    // $.ajax('http://localhost:3000/mock/product.roaming.BFF_10_0059.json')
        .done($.proxy(this._handleSuccessAreaByGeo, this))
        .fail($.proxy(this._handleFailCallBack, this));
  },
  _handleSuccessAreaByGeo: function (resp) {
    var _result = resp.result;
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      Tw.Logger.info('result : ', _result);
      var location = _result.area1 + ' ' + _result.area2;
      this.$container.find('.fe-membership-location').text(location);
      this.currentLocation.area1 = encodeURIComponent(_result.area1);
      this.currentLocation.area2 = encodeURIComponent(_result.area2);
      Tw.Logger.info('this.currentLocation : ', this.currentLocation);
      this._apiService.request(Tw.API_CMD.BFF_11_0025, this.currentLocation)
          .done($.proxy(this._handleSuccessNeaBrand, this))
          .fail($.proxy(this._handleFailCallBack, this));
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },
  _changeIcoGrade: function(ico) {
    var iconGrade = ico.split('');
    var iconArr = [];
    for(var i in iconGrade){
      iconArr.push(this.ICON[iconGrade[i]]);
    }
    return iconArr;
  },
  _handleSuccessNeaBrand: function (resp) {
    this.nearBrandData = resp.result.list;
    for(var idx in this.nearBrandData){
      this.nearBrandData[idx].showIcoGrd1 = this._changeIcoGrade(this.nearBrandData[idx].icoGrdChk1);
      this.nearBrandData[idx].showIcoGrd2 = this._changeIcoGrade(this.nearBrandData[idx].icoGrdChk2);
      this.nearBrandData[idx].showIcoGrd3 = this._changeIcoGrade(this.nearBrandData[idx].icoGrdChk3);
      this.nearBrandData[idx].showIcoGrd4 = this._changeIcoGrade(this.nearBrandData[idx].icoGrdChk4);
    }
    Tw.Logger.info('near brand resp :', this.nearBrandData);
    this.$nearBrand.append(this._nearBrandTmpl({ list : this.nearBrandData }));
  },
  _handleFailCallBack: function () {

  },
  _showBarCodePopup : function () {
    var cardNum = this.$barCode.data('cardnum');
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
    }, $.proxy(this._onOpenBarcode, this, cardNum));

  },

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
      new Tw.BannerService($popupContainer, this._membershipPopupBanner.type, this._membershipPopupBanner.list, '7');
    }
  },

  _reload: function() {
    this._historyService.reload();
  }
};

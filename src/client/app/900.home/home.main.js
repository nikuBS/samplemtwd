/**
 * FileName: home.main.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2018.06.22
 */

Tw.HomeMain = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._nativeSrevice = Tw.Native;
  this._lineRegisterLayer = new Tw.LineRegisterComponent();

  this._init();
  this._bindEvent();
  this._clearHistory();


  // For dev (Determine if api service issue or bff issue)
  // this._testApi();
};


Tw.HomeMain.prototype = {
  _init: function () {
    var giftTemp = $('.gift-template').html();
    if ( !Tw.FormatHelper.isEmpty(giftTemp) ) {
      this.tplGiftCard = Handlebars.compile($('.gift-template').html());
    }
    this.$giftCard = this.$container.find('#gift-card');

    this._openPopup();

    // var commands = [];
    // commands.push({command: Tw.NODE_CMD.GET_DOMAIN, params: {}});
    // commands.push({command: Tw.NODE_CMD.GET_SVC_INFO, params: {}});
    // commands.push({command: Tw.NODE_CMD.GET_ENVIRONMENT, params: {}});
    //
    // this._apiService.requestArray(commands)
    //   .done(function (res1, res2, res3) {
    //     console.log(res1);
    //     console.log(res2);
    //     console.log(res3);
    //   });
    // this._apiService.request(Tw.NODE_CMD.GET_SVC_INFO, {})
    //   .done(function (resp) {
    //     console.log(resp);
    //   });

  },
  _bindEvent: function () {
    this.$container.on('click', '#refill-product', $.proxy(this._openRefillProduct, this));
    this.$container.on('click', '#gift-product', $.proxy(this._openGiftProduct, this));
    this.$container.on('click', '#gift-balance', $.proxy(this._getGiftBalance, this));
  },
  _clearHistory: function () {
    this._nativeSrevice.send(Tw.NTV_CMD.CLEAR_HISTORY, {});
  },
  _openPopup: function () {
    var layerType = this.$container.data('layertype');
    console.log('layerType : ', layerType);
    if ( !Tw.FormatHelper.isEmpty(layerType) ) {
      this._lineRegisterLayer.openRegisterLinePopup(layerType);
    }
  },

  // 리필하기
  _openRefillProduct: function () {
    this._popupService.open({
      hbs: 'DA_01_01_01_L01'// hbs의 파일명
    });
  },

  // 선물하기
  _openGiftProduct: function () {
    this._popupService.open({
      hbs: 'DA_02_01_L01'// hbs의 파일명
    });
  },

  _getGiftBalance: function () {
    this._apiService.request(Tw.API_CMD.BFF_06_0014, {})
      .done($.proxy(this._successGiftBalance, this))
      .fail($.proxy(this._failGiftBalance, this));
  },

  _successGiftBalance: function (resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      resp.result.showDataMb = Tw.FormatHelper.addComma(resp.result.dataRemQty);
      resp.result.showDataGb = Tw.FormatHelper.customDataFormat(resp.result.dataRemQty, 'MB', 'GB').data;
      this.$giftCard.html(this.tplGiftCard(resp.result));
    }
  },
  _failGiftBalance: function (error) {
    console.log(error);
  },

  _testApi: function () {
    this._apiService.request(Tw.API_CMD.GET, {})
      .done(function (resp) {
        console.log('[Api test] get success', resp);
      });
    this._apiService.request(Tw.API_CMD.GET_PARAM, { postId: 1 })
      .done(function (resp) {
        console.log('[Api test] get param success', resp);
      });
    this._apiService.request(Tw.API_CMD.GET_PATH_PARAM, {}, {}, 1)
      .done(function (resp) {
        console.log('[Api test] get path param success', resp);
      });
    this._apiService.request(Tw.API_CMD.POST, {})
      .done(function (resp) {
        console.log('[Api test] post success', resp);
      });
    this._apiService.request(Tw.API_CMD.POST_PARAM, {
      title: 'foo',
      body: 'bar',
      userId: 1
    })
      .done(function (resp) {
        console.log('[Api test] post param success', resp);
      });
    this._apiService.request(Tw.API_CMD.PUT_PARAM, {
      id: 1,
      title: 'foo',
      body: 'bar',
      userId: 1
    })
      .done(function (resp) {
        console.log('[Api test] put param success', resp);
      });
    this._apiService.request(Tw.API_CMD.DELETE, {})
      .done(function (resp) {
        console.log('[Api test] delete success', resp);
      });

  }
};
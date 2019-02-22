/**
 * FileName: line-layer.component.js
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.02.01
 */

Tw.LineLayerComponent = function () {
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  this._apiService = Tw.Api;
  var layerType = Tw.CommonHelper.getCookie(Tw.COOKIE_KEY.LAYER_CHECK);
  Tw.Logger.info('[LineLayerComponent]', layerType);

  if ( !Tw.FormatHelper.isEmpty(layerType) ) {
    this._checkLayerType(layerType);
  }
};

Tw.LineLayerComponent.prototype = {
  _checkLayerType: function (layerType) {
    Tw.Logger.info('[Home] layerType', layerType);
    if ( !Tw.FormatHelper.isEmpty(layerType) ) {
      if ( layerType === Tw.LOGIN_NOTICE_TYPE.NEW_CUSTOMER || layerType === Tw.LOGIN_NOTICE_TYPE.EXIST_CUSTOMER ) {
        this._openLineResisterPopup(layerType);
      } else if ( layerType === Tw.LOGIN_NOTICE_TYPE.CUSTOMER_PASSWORD ) {
        this._openPasswordGuide();
      } else if ( layerType === Tw.LOGIN_NOTICE_TYPE.NEW_LINE ) {
        this._openNewLine();
      }
    }
  },
  _updateNoticeType: function () {
    this._apiService.request(Tw.NODE_CMD.UPDATE_NOTICE_TYPE, {})
      .done($.proxy(this._successUpdateNoticeType, this));
  },
  _successUpdateNoticeType: function (resp) {
    Tw.CommonHelper.setCookie(Tw.COOKIE_KEY.LAYER_CHECK, '');
  },
  _openLineResisterPopup: function (layerType) {
    this._apiService.request(Tw.API_CMD.BFF_03_0029, {
      svcCtg: Tw.LINE_NAME.ALL,
      pageSize: Tw.DEFAULT_LIST_COUNT,
      pageNo: 1
    }).done($.proxy(this._successExposableLine, this, layerType));

    // var lineRegisterLayer = new Tw.LineRegisterComponent();
    // setTimeout($.proxy(function () {
    //   lineRegisterLayer.openRegisterLinePopup(layerType);
    // }, this), 2000);
  },
  _successExposableLine: function (layerType, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 && resp.result.totalCnt > 0 ) {
      this._historyService.goLoad('/common/member/line/register?type=' + layerType);
    }
  },
  _openPasswordGuide: function () {
    setTimeout($.proxy(function () {
      this._openCustomerPasswordGuide();
    }, this), 2000);
  },
  _openNewLine: function () {
    setTimeout($.proxy(function () {
      this._popupService.openAlert(Tw.ALERT_MSG_HOME.NEW_LINE, null, null, $.proxy(this._closeNewLine, this));
    }, this), 2000);
  },
  _openCustomerPasswordGuide: function () {
    this._popupService.open({
      hbs: 'popup',
      title: Tw.LOGIN_CUS_PW_GUIDE.TITLE,
      title_type: 'sub',
      cont_align: 'tl',
      contents: Tw.LOGIN_CUS_PW_GUIDE.CONTENTS,
      infocopy: [{
        info_contents: Tw.LOGIN_CUS_PW_GUIDE.INFO,
        bt_class: 'none'
      }],
      bt_b: [{
        style_class: 'bt-red1 pos-right fe-go',
        txt: Tw.LOGIN_CUS_PW_GUIDE.BUTTON
      }]
    }, $.proxy(this._confirmCustPwGuide, this), $.proxy(this._closeCustPwGuide, this));
  },
  _confirmCustPwGuide: function ($popupContainer) {
    $popupContainer.on('click', '.fe-go', $.proxy(this._onClickGoPwGuide, this));
  },
  _closeCustPwGuide: function () {
    if ( this._goCustPwd ) {
      this._historyService.goLoad('/myt-join/custpassword');
    }
  },
  _onClickGoPwGuide: function () {
    this._goCustPwd = true;
    this._popupService.close();
  },
  _closeNewLine: function () {
    this._historyService.goLoad('/common/member/line');
  }
};


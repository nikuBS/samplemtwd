/**
 * FileName: membership-info.layer.component.js
 * Author: Kim InHwan (skt.P132150@partner.sk.com)
 * Date: 2018.10.29
 *
 */

Tw.MembershipInfoLayerPopup = function ($element) {
  this.$container = $element;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(this.$container);
  this._historyService.init('hash');
};

Tw.MembershipInfoLayerPopup.prototype = {
  open: function (hbs) {
    // BE_04_01_L01, BE_04_01_L02, BE_04_01_L03
    this._hbs = hbs;
    var option = {
      hbs: this._hbs,// hbs의 파일명
      layer: true
    };
    if ( this._hbs === 'BE_04_01_L01' ) {
      option.data = {
        tpleUrl: Tw.OUTLINK.TPLECARD_BENEFIT,
        coupleUrl: Tw.OUTLINK.COUPLECARD_BENEFIT
      };
    }
    this._popupService.open(option, $.proxy(this._openCallback, this), $.proxy(this._closeCallback, this), this._hbs);
  },

  _openCallback: function ($element) {
    if ( this._hbs === 'BE_04_01_L02' ) {
      this.reqPossibleJoin();
      $element.find('button[data-id=join]').off().on('click', $.proxy(this.onClickJoinBtn, this));
    }
    else if ( this._hbs === 'BE_04_01_L01' ) {
      $element.find('.fe-outlink').off().on('click', $.proxy(this._openExternalUrl,this));
    }
  },

  _openExternalUrl : function (e) {
    e.preventDefault();
    var _url = $(e.currentTarget).attr('href');
    Tw.CommonHelper.openUrlExternal(_url);
  },

  // 가입 가능여부 조회 요청
  reqPossibleJoin : function(){
    if ( !Tw.FormatHelper.isEmpty(this._isJoinOk) ) {
      return;
    }
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });
    var mockup = function () {
      $.ajax('/mock/membership.info.BFF_11_0015.json')
        .done($.proxy(this._onSuccess, this))
        .fail($.proxy(this._onFail, this));
    };

    var real = function () {
      this._apiService
        .request(Tw.API_CMD.BFF_11_0015, {})
        .done($.proxy(this._onSuccess, this))
        .fail($.proxy(this._onFail, this));
    };
    // TODO : API 개발완료되기 전까지 목업호출..
    mockup.call(this);
  },

  _onSuccess : function (resp) {
    if ( resp.code !== Tw.API_CODE.CODE_00 ) {
      this._onFail(resp);
      return false;
    }
    this._isJoinOk = resp.result.cardCreatableYn;
    skt_landing.action.loading.off({ ta: '.container' });
  },

  _closeCallback: function () {
    this._popupService.close();
  },

  onClickJoinBtn: function () {
    if (this._isJoinOk === 'N') {
      var param = Tw.ALERT_MSG_MEMBERSHIP.NO_JOIN;
      this._popupService.openOneBtTypeB(
        param.TITLE,
        param.CONTENTS,
        [{
          style_class: 'fe-manage-line',
          txt: param.TXT
        }],
        'type1',
        $.proxy(this._noJoinOpenCallBack,this), null
        );
      return;
    }

    this._historyService.goLoad('/benefit/membership/join');
  },

  _noJoinOpenCallBack : function ($layer) {
    $layer.on('click', '.fe-manage-line', $.proxy(this._goManageLine, this));
  },

  _goManageLine : function () {
    this._historyService.goLoad('/common/line');
  },

  // API Fail
  _onFail: function (err) {
    skt_landing.action.loading.off({ ta: '.container' });
    Tw.Error(err.code, err.msg).pop();
  }
};
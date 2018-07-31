/*
 * FileName: customer.researches.js
 * Author: Jiyoung Jo (jiyoungjo@sk.com)
 * Date: 2018.07.30
 */

Tw.CustomerResearches = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService(rootEl);

  this._bindEvent();
};

Tw.CustomerResearches.prototype = {
  _bindEvent: function () {
    this.$container.on('click', 'li.bt-blue1 > button', $.proxy(this._handleParticipate, this));
    this.$container.on('click', 'ul.select-list > li', $.proxy(this._setAvailableBtn, this));
  },

  _handleParticipate: function (e) {
    // 참여하기 버튼 클릭
    // var $root = $(e.currentTarget).parents('li.acco-box');
    // var $list = $root.find('ul.select-list > li');

    // var options = {
    //   bnnr_rsrch_id: $root.data('research-id'),
    //   bnnr_rsrch_typ_cd: $root.data('type-code'),
    //   canswNum: $root.data('answer-num')
    // };

    // for (var i = 0; i < $list.length; i++) {
    //   options['rps_ctt' + (i + 1)] = $list[i].getAttribute('aria-checked');
    // }

    // this._apiService.request(Tw.API_CMD.BFF_08_0035, options).done();
    this._successParticipate({
      code: Tw.API_CODE.CODE_00,
      result: {
        errorCode: "SUCCESSY"
      }
    });
  },

  _successParticipate: function (resp) {
    if (resp.code === Tw.API_CODE.CODE_00) {
      switch (resp.result.errorCode) {
        case "DUPLICATE":
          this._popupService.openAlert(Tw.MSG_CUSTOMER.RESEARCH_A01);
          break;
        case "SUCCESSY":
        case "SUCCESSN":
          this._popupService.openAlert(Tw.MSG_CUSTOMER.RESEARCH_A02);
          break;
      }
    } else {
      this._popupService.openAlert(resp.msg);
    }
  },

  _setAvailableBtn: function (e) {
    var $target = $(e.currentTarget);
    var $root = $target.parents('li.acco-box');
    var selectedLi = $root.find('ul.select-list li[aria-checked="true"]');
    var $btn = $root.find('.bt-blue1 button');

    if (selectedLi.length === 0 && $target.hasClass('checkbox')) {
      $btn.attr('disabled', true);
    } else if ($btn.attr('disabled')) {
      $btn.attr('disabled', false);
    }
  }
};
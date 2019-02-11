/**
 * FileName: benefit.join.tb-combination.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.11
 */

Tw.BenefitJoinTbCombination = function(rootEl, prodId, svcMgmtNum) {
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$container = rootEl;
  this._prodId = prodId;
  this._svcMgmtNum = svcMgmtNum;
  this._template = Handlebars.compile($('#tpl_line_list').html());

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.BenefitJoinTbCombination.prototype = {

  _init: function() {
    if (this.$lineList.find('li').length > 0) {
      this.$lineList.show();
    }

    if (this.$lineList.find('li input[type=radio]:not(:disabled)').length < 1 || this.$lineList.find('li').length < 1) {
      this._setValidation(true, Tw.BENEFIT_TBCOMBINATION_JOIN_VALIDATION.UN_VALID_LINE);
    }
  },

  _cachedElement: function() {
    this.$btnSelectCombineLine = this.$container.find('.fe-btn_select_combine_line');
    this.$msg = this.$container.find('.fe-msg_valid,.fe-msg_unvalid');
    this.$msgValid = this.$container.find('.fe-msg_valid');
    this.$msgUnValid = this.$container.find('.fe-msg_unvalid');
    this.$lineList = this.$container.find('.fe-line_list');
    this.$lineListHtml = this.$container.find('.fe-line_list_html');

    this.$btnSetupOk = this.$container.find('.fe-btn_setup_ok');
  },

  _bindEvent: function() {
    this.$btnSelectCombineLine.on('click', $.proxy(this._getMobileSvcInfo, this));
  },

  _getMobileSvcInfo: function() {
    this._apiService.request(Tw.NODE_CMD.GET_ALL_SVC, {})
      .done($.proxy(this._openSelectLine, this));
  },

  _openSelectLine: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list': _.map(resp.result.m, $.proxy(this._getConvertListItem, this))
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._bindSelectLinePop, this), $.proxy(this._onSelectLine, this), 'select_line');
  },

  _getConvertListItem: function(lineInfo, idx) {
    return {
      'label-attr': 'id="ra' + idx + '"',
      'txt': lineInfo.nickNm,
      'add': Tw.FormatHelper.conTelFormatWithDash(lineInfo.svcNum),
      'radio-attr':'id="ra' + idx + '" data-svc_mgmt_num="' + lineInfo.svcMgmtNum + '" data-num="' +
        Tw.FormatHelper.conTelFormatWithDash(lineInfo.svcNum) + '" ' + (this._svcMgmtNum === lineInfo.svcMgmtNum ? 'checked' : '')
    };
  },

  _bindSelectLinePop: function($popupContainer) {
    $popupContainer.on('click', '[data-svc_mgmt_num]', $.proxy(this._setSvcMgmtNum, this));
  },

  _setSvcMgmtNum: function(e) {
    this.$btnSelectCombineLine.html($(e.currentTarget).data('num') +
      $('<div\>').append(this.$btnSelectCombineLine.find('.ico')).html());
    this._svcMgmtNum = $(e.currentTarget).data('svc_mgmt_num');
    this._popupService.close();
  },

  _onSelectLine: function() {
    this._apiService.request(Tw.API_CMD.BFF_10_0142, { choiceSvcMgmtNum: this._svcMgmtNum }, {}, [this._prodId])
      .done($.proxy(this._setUseList, this));
  },

  _setUseList: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this.$lineListHtml.empty();
    this.$lineListHtml.html(this._template(this._getConvertCombiWireProductList(resp.result)));

    setTimeout($.proxy(this._setDisabledUseList, this));
  },

  _setDisabledUseList: function() {
    _.each(this.$lineList.find('li'), function(item) {
      var $item = $(item);
      if ($item.attr('aria-disabled') !== 'true') {
        return true;
      }

      $item.addClass('disabled');
      $item.find('input[type=radio]').attr('disabled', 'disabled')
        .prop('disabled', true);
    });
  },

  _setValidation: function(isError, statusText) {
    this.$msg.hide();

    var $msgElem = isError ? this.$msgUnValid : this.$msgValid;
    $msgElem.text(statusText).show();
  },

  _getConvertCombiWireProductList: function(joinInfo) {
    if (Tw.FormatHelper.isEmpty(joinInfo.useLineList) || Tw.FormatHelper.isEmpty(joinInfo.useLineList[0].combiWireProductList)) {
      return [];
    }

    return {
      list: _.map(joinInfo.useLineList[0].combiWireProductList, function (item) {
        return $.extend(item, {
          combStaDt: Tw.DateHelper.getShortDateWithFormat(item.combStaDt, 'YYYY.M.DD.'),
          combStatusText: Tw.FormatHelper.isEmpty(item.combYn) ? Tw.BENEFIT_TBCOMBINATION_JOIN_STATUS.IS_COMBINED :
            Tw.BENEFIT_TBCOMBINATION_JOIN_STATUS.DIS_COMBINED,
          isDisabled: !Tw.FormatHelper.isEmpty(item.combYn)
        });
      })
    };
  }

};
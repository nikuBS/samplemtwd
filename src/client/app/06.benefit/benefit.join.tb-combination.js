/**
 * FileName: benefit.join.tb-combination.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2019.02.11
 */

Tw.BenefitJoinTbCombination = function(rootEl, prodId, prodNm) {
  this._historyService = new Tw.HistoryService();
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this.$container = rootEl;
  this._prodId = prodId;
  this._prodNm = prodNm;
  this._svcMgmtNum = null;
  this._wireSvcMgmtNum = null;
  this._template = Handlebars.compile($('#tpl_line_list').html());
  this._isNotRegisterLine = false;

  this._cachedElement();
  this._bindEvent();
};

Tw.BenefitJoinTbCombination.prototype = {

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
    this.$btnSetupOk.on('click', $.proxy(this._procConfirmReq, this));

    this.$lineList.on('change', 'input[type=radio]:not(:disabled)', $.proxy(this._setWireSvcMgmtNum, this));
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
      'txt': Tw.FormatHelper.conTelFormatWithDash(lineInfo.svcNum),
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
    this._svcMgmtNum = $(e.currentTarget).data('svc_mgmt_num').toString();
    this._popupService.close();
  },

  _onSelectLine: function() {
    if (Tw.FormatHelper.isEmpty(this._svcMgmtNum)) {
      return;
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0142, { choiceSvcMgmtNum: this._svcMgmtNum }, {}, [this._prodId])
      .done($.proxy(this._setUseList, this));
  },

  _setUseList: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this.$lineList.hide().attr('aria-hidden', 'true');
    this.$lineListHtml.empty();

    var useLineInfo = this._getCurrentUseLineInfo(resp.result),
      convertCombiWireProductList = this._getConvertCombiWireProductList(useLineInfo);

    if (convertCombiWireProductList.list.length > 0) {
      this.$lineListHtml.html(this._template(convertCombiWireProductList));
      this.$lineList.show().attr('aria-hidden', 'false');
    }

    skt_landing.widgets.widget_init('.fe-line_list');

    this._isNotRegisterLine = useLineInfo.needCertifyYn === 'Y';
    this._setDisabledUseList();
    this._setResultText(useLineInfo);
    this._toggleSetupButton(false);
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
    this.$msg.hide().attr('aria-hidden', 'true');

    var $msgElem = isError ? this.$msgUnValid : this.$msgValid;
    $msgElem.text(statusText).show().attr('aria-hidden', 'false');
  },

  _getCurrentUseLineInfo: function(joinInfo) {
    if (Tw.FormatHelper.isEmpty(joinInfo.useLineList)) {
      return [];
    }

    var useLineInfo = [];

    _.each(joinInfo.useLineList, function(line) {
      if (line.svcMgmtNum === this._svcMgmtNum) {
        useLineInfo = line;
        return false;
      }
    }.bind(this));

    return useLineInfo;
  },

  _getConvertCombiWireProductList: function(useLineInfo) {
    if (Tw.FormatHelper.isEmpty(useLineInfo.combiWireProductList)) {
      return {
        list: []
      };
    }

    return {
      list: _.map(useLineInfo.combiWireProductList, function (item) {
        return $.extend(item, {
          combStatusText: Tw.FormatHelper.isEmpty(item.combYn) ? Tw.BENEFIT_TBCOMBINATION_JOIN_STATUS.IS_COMBINED :
            Tw.BENEFIT_TBCOMBINATION_JOIN_STATUS.DIS_COMBINED,
          svcMgmtNum: item.svcMgmtNum,
          isDisabled: !Tw.FormatHelper.isEmpty(item.combYn)
        });
      })
    };
  },

  _setResultText: function(useLineInfo) {
    var isAllowedCombineLength = this.$lineList.find('li input[type=radio]:not(:disabled)').length;

    if (useLineInfo.combiLineYn === 'N' && isAllowedCombineLength.length > 0) {
      return this._setValidation(false, Tw.BENEFIT_TBCOMBINATION_JOIN_VALIDATION.IS_VALID);
    }

    if (useLineInfo.combiLineYn === 'Y') {
      return this._setValidation(true, Tw.BENEFIT_TBCOMBINATION_JOIN_VALIDATION.ALERADY_COMBINED);
    }

    if (isAllowedCombineLength < 1) {
      return this._setValidation(true, Tw.BENEFIT_TBCOMBINATION_JOIN_VALIDATION.UN_VALID_LINE);
    }
  },

  _toggleSetupButton: function(isEnable) {
    if (isEnable) {
      this.$btnSetupOk.removeAttr('disabled').prop('disabled', false);
    } else {
      this.$btnSetupOk.attr('disabled', 'disabled').prop('disabled', true);
    }
  },

  _setWireSvcMgmtNum: function(e) {
    this._wireSvcMgmtNum = $(e.currentTarget).data('svc_mgmt_num');
    this._toggleSetupButton(true);
  },

  _procConfirmReq: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    this._apiService.request(Tw.API_CMD.BFF_10_0143, {
      choiceSvcMgmtNum: this._svcMgmtNum,
      wireSvcMgmtNum: this._wireSvcMgmtNum
    }, {}, [this._prodId]).done($.proxy(this._openConfirm, this))
      .fail($.proxy(Tw.CommonHelper.endLoading('.container'), this));
  },

  _convertData: function(confirmInfo) {
    this._isAgreement = confirmInfo.agreeOpNeedYn === 'Y';
    return $.extend(confirmInfo, {
      wirelessMember: this._convertWirelessMember(confirmInfo.wirelessMember),
      wireMember: this._convertWireMember(confirmInfo.wireMember),
      isAgreement: this._isAgreement,
      prodStpl: Tw.ProductHelper.convStipulation(confirmInfo.prodStpl, false)
    });
  },

  _convertWirelessMember: function(wireless) {
    return $.extend(wireless, {
      svcNum: Tw.FormatHelper.conTelFormatWithDash(wireless.svcNum),
      isFamlUse: wireless.famlUseYn === 'Y'
    });
  },

  _convertWireMember: function(wire) {
    return $.extend(wire, {
      svcNum: wire.svcCd === 'P' ? Tw.FormatHelper.conTelFormatWithDash(wire.svcNum) : wire.svcNum,
      svcNm: Tw.SVC_CD[wire.svcCd]
    });
  },

  _openConfirm: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.open($.extend({
      hbs: 'BS_07_01_01_02',
      layer: true
    }, this._convertData(resp.result)), $.proxy(this._openBindConfirmPop, this));
  },

  _openBindConfirmPop: function($popupContainer) {
    new Tw.ProductCommonConfirm(false, $popupContainer, {
      isWidgetInit: true
    }, $.proxy(this._procApply, this));
  },

  _procApply: function() {
    var reqData = {
      choiceSvcMgmtNum: this._svcMgmtNum,
      wireSvcMgmtNum: this._wireSvcMgmtNum
    };

    if (this._isAgreement) {
      reqData.agreeOpNeedYn = 'Y';
    }

    this._apiService.request(Tw.API_CMD.BFF_10_0144, reqData,
      {}, [this._prodId]).done($.proxy(this._procApplyRes, this));
  },

  _procApplyRes: function(resp) {
    Tw.CommonHelper.endLoading('.container');
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._popupService.close();
    setTimeout($.proxy(this._openSuccessPop, this), 100);
  },

  _openSuccessPop: function() {
    var successData = {
      prodNm: this._prodNm,
      prodCtgNm: Tw.PRODUCT_CTG_NM.COMBINATIONS,
      typeNm: Tw.PRODUCT_TYPE_NM.JOIN,
      btList: [{ link: '/myt-join/combinations', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.COMBINE }]
    };

    if (this._isNotRegisterLine) {
      successData.basicTxt = Tw.BENEFIT_TBCOMBINE_NEED_REGISTER;
      successData.btList.push({ link: '/common/member/line/register', txt: Tw.PRODUCT_SUCCESS_BTN_TEXT.LINE_REGISTER });
    }

    this._popupService.open({
      hbs: 'complete_product',
      data: successData
    }, $.proxy(this._bindJoinResPopup, this), $.proxy(this._onClosePop, this), 'join_success');
  },

  _bindJoinResPopup: function($popupContainer) {
    $popupContainer.on('click', 'a', $.proxy(this._closeAndGo, this));
  },

  _closeAndGo: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.closeAllAndGo($(e.currentTarget).attr('href'));
  },

  _onClosePop: function() {
    this._historyService.goBack();
  }

};
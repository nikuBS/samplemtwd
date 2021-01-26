/**
 * @file common.member.line.edit.js
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.10.01
 */

/**
 * @class
 * @desc 공통 > 회선관리 > 회선편집
 * @param rootEl
 * @param category
 * @param otherCnt
 * @constructor
 */
Tw.CommonMemberLineEdit = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.lineMarketingLayer = new Tw.LineMarketingComponent();
  this._historyService = new Tw.HistoryService();
  this._marketingSvc = '';

  this._init();
  this._bindEvent();
};

Tw.CommonMemberLineEdit.prototype = {
  /**
   * @function
   * @desc 초기화
   * @private
   */
  _init: function () {

    var $itemLists = this.$container.find('.fe-item-list');
    _.map($itemLists, $.proxy(function (item) {

      var selector = '#' + $(item).attr('id');
      this._initSortable(selector);
    }, this));
  },
  /**
   * 회선 이동 추가 기능
   * UI Event Attach
   */
  _initSortable: function (selector) {
    skt_landing.dev.sortableInit(selector, {
      axis: 'y',
      scrollSensitivity: 100,
      scrollSpeed: 30,
      forceScroll: true
    });
    var $target = $(selector).length === 1 ? $(selector) : $( "#sortable-enabled" );
    $target.parent().on('click', '.connectedSortable .bt-sort', function(event) {
      console.log('sortBUtton Click');
      var $parentTarget = $(event.currentTarget).parents('.connectedSortable.enabled');
      if ($parentTarget.length > 0) {
        var buttonList = $parentTarget.find('.state-bt');
        $parentTarget.find('.state-bt').each(function(index, item) {
          var $item = $(item);
          if (index === 0) {
            $item.find('.up').attr('disabled', 'disabled');
            $item.find('.down').removeAttr('disabled');
          } else if (index === buttonList.length -1) {
            $item.find('.up').removeAttr('disabled');
            $item.find('.down').attr('disabled', 'disabled');
          } else {
            $item.find('.up').removeAttr('disabled');
            $item.find('.down').removeAttr('disabled');
          }
        });
      }
    });
  },

  /**
   * @function
   * @desc 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '.fe-bt-complete', _.debounce($.proxy(this._completeEdit, this), 500));
    this.$container.on('click', '.fe-bt-more', $.proxy(this._onClickMore, this));
  },

  /**
   * @function
   * @desc drag&drop callback
   * @private
   */
  _onUpdateDnd: function () {

  },

  /**
   * @function
   * @desc 회선 편집 처리
   * @param $event
   * @private
   */
  _completeEdit: function ($event) {
    var $target = $($event.currentTarget);
    var list = this.$container.find('.fe-line');
    var svcNumList = [];
    _.map(list, $.proxy(function (line) {
      svcNumList.push($(line).data('svcmgmtnum'));
    }, this));
    this._openRegisterPopup(svcNumList, $target);
  },

  /**
   * @function
   * @desc 회선편집 확인 팝업 오픈
   * @param svcNumList
   * @param $target
   * @private
   */
  _openRegisterPopup: function (svcNumList, $target) {
    this._popupService.openConfirm(Tw.ALERT_MSG_AUTH.L04, Tw.POPUP_TITLE.NOTIFY,
      $.proxy(this._onConfirmRegisterPopup, this, svcNumList, $target), null, $target);
  },

  /**
   * @function
   * @desc 회선편집 요청
   * @param svcNumList
   * @param $target
   * @private
   */
  _onConfirmRegisterPopup: function (svcNumList, $target) {
    this._popupService.close();
    var lineList = svcNumList.join('~');

    Tw.CommonHelper.startLoading('.container', 'grey');
    this._apiService.request(Tw.NODE_CMD.CHANGE_LINE, {
      params: { svcCtg: 'a', svcMgmtNumArr: lineList }
    }).done($.proxy(this._successRegisterLineList, this, svcNumList, $target))
      .fail($.proxy(this._failRegisterLineList, this));
  },

  /**
   * @function
   * @desc 회선편집 요청 resp 처리
   * @param svcNumList
   * @param $target
   * @param resp
   * @private
   */
  _successRegisterLineList: function (svcNumList, $target, resp) {
    Tw.CommonHelper.endLoading('.container');
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this._marketingSvc = resp.result.offerSvcMgmtNum;
      Tw.Logger.info('[marketingSvc]', this._marketingSvc);
      this._checkRepSvc(resp.result, svcNumList, $target);
    } else {
      Tw.Error(resp.code, resp.msg).pop(null, $target);
    }
  },

  /**
   * @function
   * @desc 회선편집 요청 실패 처리
   * @param error
   * @private
   */
  _failRegisterLineList: function (error) {
    Tw.Logger.error(error);
    Tw.CommonHelper.endLoading('.container');
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 기준회선 변경 여부 확인
   * @param result
   * @param svcNumList
   * @param $target
   * @private
   */
  _checkRepSvc: function (result, svcNumList, $target) {
    if ( result.repSvcChgYn === 'Y' ) {
      this._popupService.openAlert(Tw.ALERT_MSG_AUTH.L02, null, null, $.proxy(this._onCloseChangeRepSvc, this), null, $target);
    } else {
      this._checkMarketingOffer();
    }
  },

  /**
   * @function
   * @desc 기준회선 변경 팝업 클로즈 callback
   * @private
   */
  _onCloseChangeRepSvc: function () {
    this._checkMarketingOffer();
  },

  /**
   * @function
   * @desc 마케팅 동의 여부 확인 요청
   * @private
   */
  _checkMarketingOffer: function () {
    if ( !Tw.FormatHelper.isEmpty(this._marketingSvc) && this._marketingSvc !== '0' ) {
      var list = this.$container.find('.fe-line');
      var $target = list.filter('[data-svcmgmtnum=' + this._marketingSvc + ']');
      if ( $target.length > 0 ) {
        this._apiService.request(Tw.API_CMD.BFF_03_0014, {}, {}, [this._marketingSvc])
          .done($.proxy(this._successGetMarketingOffer, this, $target.data('showname'), $target.data('svcnum')))
          .fail($.proxy(this._failGetMarketingOffer, this));
      } else {
        this._closeMarketingOfferPopup();
      }
    } else {
      this._closeMarketingOfferPopup();
    }
  },

  /**
   * @function
   * @desc 마케팅 동의 여부 처리 및 팝업 오픈
   * @param showName
   * @param svcNum
   * @param resp
   * @private
   */
  _successGetMarketingOffer: function (showName, svcNum, resp) {
    if ( resp.code === Tw.API_CODE.CODE_00 ) {
      this.agr201Yn = resp.result.agr201Yn;
      this.agr203Yn = resp.result.agr203Yn;

      if ( this.agr201Yn !== 'Y' || this.agr203Yn !== 'Y' ) {
        setTimeout($.proxy(function () {
          this.lineMarketingLayer.openMarketingOffer(this._marketingSvc,
            showName, svcNum, this.agr201Yn, this.agr203Yn, $.proxy(this._onCloseMarketingOfferPopup, this));
        }, this), 0);
      } else {
        this._closeMarketingOfferPopup();
      }
    } else {
      Tw.Error(resp.code, resp.msg).pop();
    }
  },

  /**
   * @function
   * @desc 마케팅 동의 여부 요청 실패 처리
   * @private
   */
  _failGetMarketingOffer: function (error) {
    Tw.Logger.error(error);
    this._popupService.openAlert(Tw.TIMEOUT_ERROR_MSG);
  },

  /**
   * @function
   * @desc 마케팅 동의 팝업 닫기
   * @private
   */
  _closeMarketingOfferPopup: function () {
    this._historyService.goBack();
  },

  /**
   * @function
   * @desc 마케팅 동의 팝업 클로즈 callback
   * @private
   */
  _onCloseMarketingOfferPopup: function () {
    this._closeMarketingOfferPopup();
  },

  /**
   * @function
   * @desc 더보기 클릭 처리
   * @private
   */
  _onClickMore: function (event) {
    var $target = $(event.currentTarget);
    var $list = $target.parents('.fe-line-cover').find('.fe-item-list');

    var $hideList = $list.filter('.none');
    var $showList = $hideList.filter(function (index) {
      return index < Tw.DEFAULT_LIST_COUNT;
    });
    var remainCnt = $hideList.length - $showList.length;
    $showList.removeClass('none');
    if ( remainCnt === 0 ) {
      $target.parents('.tod-add-btn').removeClass('tod-add-btn');
      $target.hide();
    }
  }
};

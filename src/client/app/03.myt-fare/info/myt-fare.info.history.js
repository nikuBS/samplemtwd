/**
 * FileName: myt-fare.info.history.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 9. 17
 */
Tw.MyTFareInfoHistory = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._bankList = new Tw.MyTFareBillBankList(this.$container);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTFareInfoHistory.prototype = {
  _init: function () {

    this.rootPathName = this._historyService.pathname;

    if(this.data){
      this.currentActionsheetIndex = Tw.MYT_PAYMENT_HISTORY_TYPE.reduce($.proxy(function (prev, cur, index) {
        if (this.data.current === cur) {
          prev = index;
        }
        return prev;
      }, this), 0);
      this._initPaymentList();
    }
  },

  _initPaymentList: function() {
    var initedListTemplate;
    var totalDataCounter = this.data.listData.mergedListData.length;
    this.renderListData = {};

    if (!totalDataCounter) {
      initedListTemplate = this.$template.$emptyList();
    } 
    else {
      this.listRenderPerPage = 20;

      this.listLastIndex = Tw.UIService.getLocalStorage('listLastIndex') || this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.listData.mergedListData.slice(0, this.listRenderPerPage);

      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage;
      this.renderListData.records = this.renderableListData.reduce($.proxy(function(prev, cur) {
        prev.push({items: [cur], date:cur.listDt});
        /*if (prev.length) {
          if (prev.slice(-1)[0].date === cur.listDt) {
            prev.slice(-1)[0].items.push(cur);
          } else {
            prev.push({items: [cur], date:cur.listDt});
          }
        } else {
          prev.push({items: [cur], date:cur.listDt});
        }*/

        localStorage.removeItem('listLastIndex'); // 예약취소시 사용되는 로컬스토리지

        return prev;
      }, this), []);

      initedListTemplate = this.$template.$listWrapper(this.renderListData);
    }

    this.$domListWrapper.append(initedListTemplate);
    this._afterList();
    
  },

  _cachedElement: function () {
    this.$domListWrapper = this.$container.find('#fe-list-wrapper');
    this.$actionSheetTrigger = this.$container.find('#fe-type-trigger');
    this.$addRefundAccountTrigger = this.$container.find('#fe-refund-add-account');
    this.$openAutoPaymentLayerTrigger = this.$container.find('#fe-go-refund-quit');
    this.$moveRefundListTrigger = this.$container.find('#fe-go-refund-list');

    this.$template = {
      // $list: this.$container.find('#list-default'),

      $templateItem: Handlebars.compile($('#fe-template-items').html()),
      $templateItemDay: Handlebars.compile($('#fe-template-day').html()),
      $templateYear: Handlebars.compile($('#fe-template-year').html()),

      $listWrapper: Handlebars.compile($('#list-template-wrapper').html()),
      $emptyList: Handlebars.compile($('#list-empty').html())
    };

    Handlebars.registerPartial('chargeItems', $('#fe-template-items').html());
    Handlebars.registerPartial('list', $('#fe-template-day').html());
    Handlebars.registerPartial('year', $('#fe-template-year').html());
  },

  _bindEvent: function () {
    // 분류 선택 버튼 (셀렉트 버튼 노출)
    this.$actionSheetTrigger.on('click', $.proxy(this._typeActionSheetOpen, this));
    // 과납내역 환불받기 
    this.$addRefundAccountTrigger.on('click', $.proxy(this._openAddRefundAccount, this));
    // 자동납부 통합인출 해지 버튼
    this.$openAutoPaymentLayerTrigger.on('click', $.proxy(this._openAutoPaymentLayer, this));
    // 환불 처리 내역
    this.$moveRefundListTrigger.on('click', $.proxy(this._moveRefundList, this));
    // - TIP버튼의 클릭이동에 대한 정의 추가 필요
  },

  _afterList: function() {
    this.$btnListViewMorewrapper = this.$domListWrapper.find('.bt-more');
    this.$appendListTarget = this.$domListWrapper.find('.inner');

    // 더 보기 버튼
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updatePaymentList, this));
    // 리스트 내 클릭 이벤트 정의
    // - 상세보기
    this.$domListWrapper.on('click', '.inner', $.proxy(this._listViewDetailHandler, this));
    this.$domListWrapper.on('click', '.btn', $.proxy(this._listViewDetailHandler, this));
    // - 예약취소(포인트 예약)
    this.$domListWrapper.on('click','button.bt-link-tx',$.proxy(this._reserveCancelHandler,this));
  },

  // 상세보기 이동
  _listViewDetailHandler: function(e) {
    // 링크가 없다면 return ;
    if(!$(e.currentTarget).data('listId')) return ;

    var detailData = this.data.listData.mergedListData[$(e.currentTarget).data('listId')];
    detailData.isPersonalBiz = this.data.isPersonalBiz;

    Tw.UIService.setLocalStorage('detailData', JSON.stringify(detailData));
    this._historyService.goLoad(this._historyService.pathname + "/detail?type=" + detailData.dataPayMethodCode + 
      (detailData.dataIsBank? "&isBank=" + detailData.dataIsBank:'') +
      (detailData.settleWayCd? "&settleWayCd=" + detailData.settleWayCd:"") +
      (detailData.dataPayType? "&paytype=" + detailData.dataPayType:"") +
      (detailData.dataPayMethodCode === "DI"? "&opDt=" + detailData.opDt + "&payOpTm=" + detailData.payOpTm: "")
    );
  },

  // 예약 취소
  _reserveCancelHandler: function(e) {
    e.stopPropagation();
    this.reserveCancelData = this.data.listData.mergedListData[$(e.currentTarget).data('listId')];
    var alertCode, alertType;

    // alertCode 설정
    if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.T)>=0) alertCode='ALERT_2_A85';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.RAINBOW)>=0) alertCode='ALERT_2_A87';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.OK)>=0) alertCode='ALERT_2_A92';

    if(alertCode) alertType = Tw.ALERT_MSG_MYT_FARE[alertCode];

    if(alertType) this._popupService.openConfirm(alertType.MSG,alertType.TITLE,$.proxy(this._execReserveCancel,this),$.proxy(this._popupService.close,this));
    
  },

  // 포인트 1회 납부예약 취소 실행
  _execReserveCancel: function(){
    this._popupService.close();

    var apiCode, apiBody={};

    //apiCode,apiBody 설정
    if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.T)>=0||this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.OK)>=0){ 
      apiCode='BFF_07_0047';
      apiBody={
        ptClCd:this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.T)>=0?'TPT':'CPT',
        opDt:this.reserveCancelData.opDt,
        payOpTm:this.reserveCancelData.opTm,//.substring(8),
        rbpSerNum:this.reserveCancelData.rbpSerNum
      }
    }
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.RAINBOW)>=0){ 
      apiCode='BFF_07_0050';
      apiBody={
        rbpSerNum:this.reserveCancelData.rbpSerNum
      }
    }

    if(apiCode){
      this._apiService.request(Tw.API_CMD[apiCode], apiBody)
        .done($.proxy(this._successReserveCancel, this)).fail($.proxy(this._apiError, this));
    }
  },

  // 포인트 1회 납부예약 취소 res
  _successReserveCancel: function(res){
    var alertCode, alertType;
    if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.T)>=0) alertCode='ALERT_2_A86';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.RAINBOW)>=0) alertCode='ALERT_2_A88';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.OK)>=0) alertCode='ALERT_2_A93';

    alertType = Tw.ALERT_MSG_MYT_FARE[alertCode];

    if(res.code === '00') {
      this._popupService.openAlert(alertType.MSG, alertType.TITLE, Tw.BUTTON_LABEL.CONFIRM, $.proxy(this._reLoading, this));
    } else {
      this._popupService.openAlert(res.msg, Tw.POPUP_TITLE.NOTIFY, Tw.BUTTON_LABEL.CONFIRM, $.proxy(function() {
        this._popupService.close();
      }, this));
    }
  },

  // 예약 취소 성공 후 리로딩
  _reLoading: function(){
    // 예약 취소 시 오픈된 리스트 기억
    Tw.UIService.setLocalStorage('listLastIndex', this.listLastIndex);
    this._historyService.reload();
  },
  /*function() {
        this._popupService.close();
      }*/
  // 포인트 예약 취소 end

  // 더 보기
  _updatePaymentList: function(e) {
    this._updatePaymentListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.listData.mergedListData.length ? 'none':''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var insertCompareData = this.data.listData.mergedListData[this.listLastIndex - this.listRenderPerPage - 1],
        $domAppendTarget = this.$domListWrapper.find('.inquire-link-list ul');

    this.renderableListData.map($.proxy(function(o) {
      var renderedHTML;
      /* if (insertCompareData.listDt === o.listDt) {
        $domAppendTarget = $('.fe-list-inner li:last-child');
        renderedHTML = this.$template.$templateItem({items:[o], date: o.listDt});
      } else {*/
        // insertCompareData = o;
        // $domAppendTarget = this.$appendListTarget;
        renderedHTML = this.$template.$templateItemDay({records:[{items:[o], date:o.listDt, yearHeader:o.yearHeader}]});
      // }

      $domAppendTarget.append(renderedHTML);

    }, this));
  },

  _updatePaymentListData: function() {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.listData.mergedListData.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.listData.mergedListData.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.listData.mergedListData.length ?
        this.data.listData.mergedListData.length : this.listNextIndex;
  },

  _updateViewMoreBtnRestCounter: function(e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  },
  // 더 보기 end

  // 과납내역 환불받기
  _openAddRefundAccount: function () {
    this._popupService.open(
        {
          hbs: 'MF_08_02',
          overPayList:this.data.listData.overPaymentList,
          totalOverAmt:this.data.refundTotalAmount
        },
        $.proxy(this._openAddRefundAccountCallback, this), $.proxy(this._closeAddRefundAccountCallback, this),
        Tw.MYT_PAYMENT_HISTORY_HASH.OVERPAY_REFUND,
        'refundAccount'
    );
  },

  _openAddRefundAccountCallback: function ($container) {
    this.refundAPI_option = {
      //rfndBankNum // 계좌번호
      //svcMgmtNum: this.paramData.svcMgmtNum,
      //rfndBankCd // 은행코드
    };
    this.$refundRequestBtn = $($container).find('.bt-fixed-area button');
    this.$bankList = $($container).find('.bt-dropdown.big');

    this.$bankList.on('click', $.proxy(this._selectBank, this));
    $container.on('click', '.bt-fixed-area button', $.proxy(this._refundRequestSend, this));
    $container.on('keyup', '#fe-bank-account', $.proxy(this._accountInputHandler, this));
    $($container).find('#fe-bank-account').siblings('button.cancel').eq(0).on('click', $.proxy(this._accountInputHandler, this));
  },

  _closeAddRefundAccountCallback: function() {
    
    this._historyService.reload();
  },

  _selectBank: function (event) {
    this._bankList.init(event, $.proxy(this._checkIsAbled, this));
  },

  _checkIsAbled: function () {
    this.isBankNameSeted = true;
    this.refundAPI_option.rfndBankCd = this.$bankList.attr('id');
    this._refundAccountInfoUpdateCheck();
  },

  _refundRequestSend: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0088, this.refundAPI_option)
        .done($.proxy(this._successRegisterAccount, this)).fail($.proxy(this._apiError, this));
  },

  _successRegisterAccount: function(res) {
    if(res.code === '00') {
      this._popupService.openAlert(Tw.POPUP_CONTENTS.REFUND_ACCOUNT_SUCCESS, Tw.POPUP_TITLE.NOTIFY, Tw.BUTTON_LABEL.CONFIRM, $.proxy(function() {
        this._popupService.close();
      }, this));
    } else {
      this._popupService.openAlert(res.msg, Tw.POPUP_TITLE.NOTIFY, Tw.BUTTON_LABEL.CONFIRM, null);
    }
  },

  _accountInputHandler: function (e) {
    this.isBankAccountNumberSeted = ($(e.currentTarget).val().length > 0);
    this.refundAPI_option.rfndBankNum = $(e.currentTarget).val();
    this._refundAccountInfoUpdateCheck();
  },

  _refundAccountInfoUpdateCheck: function () {
    if (this.isBankNameSeted && this.isBankAccountNumberSeted) {
      this.$refundRequestBtn.attr('disabled', false);
    } else {
      this.$refundRequestBtn.attr('disabled', true);
    }
  },
  // 과납내역 환불받기 end

  // 자동납부 통합인출 해지
  _openAutoPaymentLayer: function () {
    this._popupService.open(
        {
          hbs: 'MF_08_03',
          bankName: this.data.autoWithdrawalBankName,
          bankAccount: this.data.autoWithdrawalBankNumber
        },
        $.proxy(this._autoWithdrawalOpenCallback, this), null, Tw.MYT_PAYMENT_HISTORY_HASH.AUTO_WITHDRAWAL
    );
  },

  _autoWithdrawalOpenCallback: function ($container) {
    $container.on('click', '.bt-red1 button', $.proxy(this._processAutoWithdrawalCancel, this));
  },

  _processAutoWithdrawalCancel: function () {
    this._apiService.request(Tw.API_CMD.BFF_07_0069, {
      bankCd: this.data.autoWithdrawalBankCode,
      bankSerNum: this.data.autoWithdrawalBankSerNum
    }).done($.proxy(this._successCancelAccount, this)).fail($.proxy(this._apiError, this));
  },

  _successCancelAccount: function (res) {
    this._popupService.close();
    if (res.code === '00') {
      Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_PAYMENT.CANCEL_AUTO_WITHDRAWAL);
      this.$openAutoPaymentLayerTrigger.hide();
    } else {
      $.proxy(this._apiError, this);
    }
  },
  // 자동납부 통합인출 해지 end

  // 분류선택 
  _typeActionSheetOpen: function () {
    this._popupService.open({
      hbs: 'actionsheet_select_a_type',// hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_PAYMENT_TYPE,
      data: Tw.POPUP_TPL.PAYMENT_HISTORY_TYPE
    }, $.proxy(this._openTypeSelectHandler, this), $.proxy(this._closeTypeSelect, this));
  },

  _openTypeSelectHandler: function ($container) {
    this.$typeSelectActionsheetButtons = $container.find('.chk-link-list button');
    $(this.$typeSelectActionsheetButtons[0]).removeClass('checked');
    $(this.$typeSelectActionsheetButtons[this.currentActionsheetIndex]).addClass('checked');
    this.$typeSelectActionsheetButtons.on('click', $.proxy(this._moveByPaymentType, this));
  },
  _moveByPaymentType: function (e) {
    var target    = $(e.currentTarget),
        targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName

    this._popupService.close();
    if (!target.hasClass('checked')) {
      targetURL = !Tw.MYT_PAYMENT_HISTORY_TYPE[this.$typeSelectActionsheetButtons.index(target)] ?
          targetURL : targetURL + '?sortType=' + Tw.MYT_PAYMENT_HISTORY_TYPE[this.$typeSelectActionsheetButtons.index(target)];

      this._historyService.goLoad(targetURL);
    }
  },

  _closeTypeSelect: function () {
    this._popupService.close();
  },
  // 분류선택 end

  // 과납 환불 처리 내역으로 이동
  _moveRefundList: function () {
    this._historyService.goLoad(this.data.refundURL);
  },

  _apiError: function (err) {
    Tw.Logger.error(err.code, err.msg);
    this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg);
    return false;
  }
};

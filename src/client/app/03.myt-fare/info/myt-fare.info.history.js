/**
 * @file myt-fare.info.history.js
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018. 9. 17
 */
Tw.MyTFareInfoHistory = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  // this._bankList = new Tw.MyTFareBillBankList(this.$container);

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTFareInfoHistory.prototype = {
  _init: function () {

    this.rootPathName = this._historyService.pathname; // URL
    this.queryParams = Tw.UrlHelper.getQueryParams(); // 분류코드 

    if(!Tw.FormatHelper.isEmpty(this.data)){
      // 현재 선택된 카테고리 
      this.currentActionsheetIndex = Tw.MYT_PAYMENT_HISTORY_TYPE.reduce($.proxy(function (prev, cur, index) {
        if (this.data.current === cur) {
          prev = index;
        }
        return prev;
      }, this), 0);

      // 리스트 출력
      this._initPaymentList();
    }
  },

  // 리스트 출력
  _initPaymentList: function() {
    var initedListTemplate;
    var totalDataCounter = this.data.listData.mergedListData.length; // 리스트 갯수
    this.renderListData = {};

    // 리스트
    if (!totalDataCounter) {
      // 리스트 없으면 빈 화면 렌더링
      initedListTemplate = this.$template.$emptyList();
    } 
    else {
      this.listRenderPerPage = 20; // 한번에 보여질 리스트 개수 -> 더보기로 20개씩 추가로 노출

      this.listLastIndex = Tw.CommonHelper.getLocalStorage('listLastIndex') || this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.listData.mergedListData.slice(0, this.listRenderPerPage);

      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage; // 남은 리스트 갯수
      this.renderListData.records = this.renderableListData.reduce($.proxy(function(prev, cur) {
        prev.push({items: [cur], date:cur.listDt});
        // localStorage.removeItem('listLastIndex'); // 예약취소시 사용되는 로컬스토리지
        return prev;
      }, this), []);

      initedListTemplate = this.$template.$listWrapper(this.renderListData);
      /* renderListData 의 형태 {
        initialMoreData: boolean 처음 더보기 버튼 보일지 여부 true 면 보임
        restCount: 노출하고 남은 리스트 갯수 
        records: {items: [], date: }[]
      }*/
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
    // 자동납부 통합인출 해지 버튼
    this.$openAutoPaymentLayerTrigger.on('click', $.proxy(this._openAutoPaymentLayer, this));
    // 환불 처리 내역
    this.$moveRefundListTrigger.on('click', $.proxy(this._moveRefundList, this));
    // 과납내역 환불받기 
    this.$addRefundAccountTrigger.on('click', $.proxy(this._moveRefundAccount, this));
  },

  // 리스트 렌더링 후 호출 이벤트 바인드
  _afterList: function() {
    this.$btnListViewMorewrapper = this.$domListWrapper.find('.fe-btn-more'); // 더 보기 버튼
    this.$appendListTarget = this.$domListWrapper.find('.inner');

    // 더 보기 버튼
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updatePaymentList, this));
    // 리스트 내 클릭 이벤트 정의
    // - 상세보기
    this.$domListWrapper.on('click', '.fe-list-detail', $.proxy(this._listViewDetailHandler, this));
    this.$domListWrapper.on('click', '.btn', $.proxy(this._listViewDetailHandler, this));
    // - 예약취소(포인트 예약)
    this.$domListWrapper.on('click','button.fe-cancel-reserve',$.proxy(this._reserveCancelHandler,this));
  },

  // 상세보기 이동
  _listViewDetailHandler: function(e) {
    // 링크가 없다면 return ;
    if(!$(e.currentTarget).data('listId') &&
        $(e.currentTarget).data('listId') !== 0 && 
        $(e.currentTarget).data('listId') !== '0'
      ) return ;

    var detailData = this.data.listData.mergedListData[$(e.currentTarget).data('listId')];
    detailData.isPersonalBiz = this.data.isPersonalBiz;

    this._historyService.goLoad(this._historyService.pathname + '/detail?type=' + detailData.dataPayMethodCode +
      (detailData.innerIndex !== undefined ? '&innerIndex=' + detailData.innerIndex: '') +
      (detailData.dataPayMethodCode === 'DI' ? '&opDt=' + detailData.opDt + '&payOpTm=' + detailData.payOpTm: '')
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

    if(alertCode){
      alertType = Tw.ALERT_MSG_MYT_FARE[alertCode];
    } 

    if(alertType){
      this._popupService.openConfirm(
        alertType.MSG,
        alertType.TITLE,
        $.proxy(this._execReserveCancel,this, $(e.currentTarget)),
        $.proxy(this._popupService.close,this),
        $(e.currentTarget)
      );
    } 
    
  },

  // 포인트 1회 납부예약 취소 실행
  _execReserveCancel: function($target){
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
      };
    }
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.RAINBOW)>=0){ 
      apiCode='BFF_07_0050';
      apiBody={
        rbpSerNum:this.reserveCancelData.rbpSerNum
      };
    }

    if(apiCode){
      this._apiService.request(Tw.API_CMD[apiCode], apiBody)
        .done($.proxy(this._successReserveCancel, this, $target)).fail($.proxy(this._apiError, this, $target));
    }
  },

  // 포인트 1회 납부예약 취소 res
  _successReserveCancel: function($target, res){
    var alertCode, alertType;
    if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.T)>=0) alertCode='ALERT_2_A86';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.RAINBOW)>=0) alertCode='ALERT_2_A88';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.OK)>=0) alertCode='ALERT_2_A93';

    alertType = Tw.ALERT_MSG_MYT_FARE[alertCode];

    if(res.code === '00') {
      this._popupService.openAlert(
        alertType.MSG, 
        alertType.TITLE, 
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(this._reLoading, this)
        // 예약취소 확인 후 리로딩 되므로 되돌아갈 타켓 지정 필요없음
      );
    } else {
      this._popupService.openAlert(
        res.msg, 
        Tw.POPUP_TITLE.NOTIFY, 
        Tw.BUTTON_LABEL.CONFIRM, 
        $.proxy(function() {
          this._popupService.close();
        }, this),
        null,
        $target
      );
    }
  },

  // 예약 취소 성공 후 리로딩
  _reLoading: function(){
    // 예약 취소 시 오픈된 리스트 기억
    Tw.CommonHelper.setLocalStorage('listLastIndex', this.listLastIndex);
    this._historyService.reload();
  },
  // 포인트 예약 취소 end

  // 더 보기
  _updatePaymentList: function(e) {
    this._updatePaymentListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.listData.mergedListData.length ? 'none':''});
    this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var $domAppendTarget = this.$domListWrapper.find('.inquire-link-list ul');

    this.renderableListData.map($.proxy(function(o) {
      var renderedHTML;
      
      renderedHTML = this.$template.$templateItemDay({records:[{items:[o], date:o.listDt, yearHeader:o.yearHeader}]});
      
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


  // 자동납부 통합인출 해지
  _openAutoPaymentLayer: function () {
    this._historyService.goLoad('/myt-fare/info/cancel-draw');
  },
  
  // 분류선택 
  _typeActionSheetOpen: function (evt) {
    this._popupService.open({
      hbs: 'actionsheet01',// hbs의 파일명
      layer: true,
      title: Tw.POPUP_TITLE.SELECT_PAYMENT_TYPE,
      data: this._setSelectPayType(Tw.POPUP_TPL.PAYMENT_HISTORY_TYPE),
      btnfloating: {
        txt: '닫기',
        attr: 'type="button"',
        'class': 'tw-popup-closeBtn'
      }
    }, 
    $.proxy(this._openTypeSelectHandler, this), 
    $.proxy(this._closeTypeSelect, this),
    null, $(evt.currentTarget)
    );
  },

  // 유무선 여부에 따라 셀렉트 타입 결정
  _setSelectPayType: function (arr) {
    var types = arr[0].list;
    return [{list: _.reduce(types, $.proxy(function(prev, type){
      if (this.data.isMobile || type.onlyType !== 'M') {
        prev.push(type);
      } 
      return prev;
    }, this), [])}];
  },

  _openTypeSelectHandler: function ($container) {
    this.$typeSelectActionsheetButtons = $container.find('.ac-list>li');
    $(this.$typeSelectActionsheetButtons[0]).find('input').prop('checked', false);
    $(this.$typeSelectActionsheetButtons[this.currentActionsheetIndex]).find('input').prop('checked', true);
    this.$typeSelectActionsheetButtons.on('click', $.proxy(this._clickPaymentType, this));
    $container.on('change', 'input', $.proxy(this._moveByPaymentType, this));
  },

  _clickPaymentType: function (e) {
    if ($(e.currentTarget).is('li')) {
      e.stopPropagation();
      $(e.currentTarget).siblings().find('input').prop('checked', false);
      $(e.currentTarget).find('input').prop('checked', true).trigger('change');
    }
  },

  _moveByPaymentType: function (e) {
    var target    = $(e.currentTarget),
        targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    
    if (Tw.MYT_PAYMENT_HISTORY_TYPE[target.val()] !== this.queryParams.sortType) {
      // this.$typeSelectActionsheetButtons.find('input').prop('checked', false);
      // target.prop('checked', true);
      targetURL = !Tw.MYT_PAYMENT_HISTORY_TYPE[target.val()] ?
          targetURL : targetURL + '?sortType=' + Tw.MYT_PAYMENT_HISTORY_TYPE[target.val()];

      this._popupService.closeAllAndGo(targetURL);
      
    } else {
      this._popupService.close();
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

  // 과납내역 환불 받기 페이지로 이동
  _moveRefundAccount: function () {
    this._historyService.goLoad(this.data.refundAccountURL);
  },

  _apiError: function ($target, err) {
    // Tw.Logger.error(err.code, err.msg);
    Tw.Error(err.code, Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.msg).pop(null, $target);
    // this._popupService.openAlert(Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.code + ' : ' + err.msg);
    return false;
  }
};

/**
 * @file [나의요금-요금납부조회-리스트] 관련 처리
 * @author Lee Kirim 
 * @since 2018-09-17
 */

/**
 * @class 
 * @desc 요금납부조회 리스트를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.info.history.controlloer.ts 로 부터 전달되어 온 납부내역 정보
 */
Tw.MyTFareInfoHistory = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';

  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);  

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.MyTFareInfoHistory.prototype = {

  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * - rootPathName 현재 주소
   * - queryParams 쿼리로 받아온 객체
   * - currentActionsheetIndex 선택된 카테고리 인덱스, 카테고리 액션시트 호출 시 선택됨 표기를 위해 설정
   * - renderListData 리스트 데이터 
   * - initPaymentList @function
   * @return {void}
   */
  _init: function () {

    this.rootPathName = this._historyService.pathname; // URL
    this.queryParams = Tw.UrlHelper.getQueryParams(); // 분류코드 
    this.renderListData = {}; // 리스트 데이터

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
  /**
   * @function
   * @member
   * @desc 리스트 출력
   * - 리스트를 this.renderListData 객체에 저장함 
   * - 템플릿에 render 및 붙이기
   * - 더보기 관련 변수 함께 설정
   * - 렌더 후 afterList 호출
   * @returns {void}
   */
  _initPaymentList: function() {
    var initedListTemplate;
    var totalDataCounter = this.data.listData.mergedListData.length; // 리스트 갯수

    // 리스트
    if (!totalDataCounter) {
      // 리스트 없으면 빈 화면 렌더링
      initedListTemplate = this.$template.$emptyList();
    } 
    else {
      this.listRenderPerPage = Tw.DEFAULT_LIST_COUNT; // 한번에 보여질 리스트 개수 -> 더보기로 20개씩 추가로 노출

      this.listLastIndex = Tw.CommonHelper.getLocalStorage('listLastIndex') || this.listRenderPerPage;
      this.listViewMoreHide = (this.listLastIndex < totalDataCounter);

      this.renderableListData = this.data.listData.mergedListData.slice(0, this.listLastIndex);

      Tw.CommonHelper.removeLocalStorage('listLastIndex'); // 예약취소시 재로딩 후 해당 리스트까지 보여주기 위함 사용 후 지움

      this.renderListData.initialMoreData = this.listViewMoreHide;
      this.renderListData.restCount = totalDataCounter - this.listRenderPerPage; // 남은 리스트 갯수
      this.renderListData.records = this.renderableListData.reduce($.proxy(function(prev, cur) {
        prev.push({items: [cur], date:cur.listDt});
        return prev;
      }, this), []);

      initedListTemplate = this.$template.$listWrapper(this.renderListData);
    }
    this.$domListWrapper.append(initedListTemplate);
    this._afterList();
    
  },


  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.info.history.html 참고
   */
  _cachedElement: function () {
    this.$domListWrapper = this.$container.find('#fe-list-wrapper'); // 렌더링된 리스트를 여기에 붙여넣는다
    this.$actionSheetTrigger = this.$container.find('#fe-type-trigger');
    this.$addRefundAccountTrigger = this.$container.find('#fe-refund-add-account');
    this.$openAutoPaymentLayerTrigger = this.$container.find('#fe-go-refund-quit');
    this.$moveRefundListTrigger = this.$container.find('#fe-go-refund-list');

    this.$template = {
      $templateItem: Handlebars.compile($('#fe-template-items').html()), // 리스트 데이터 렌더링
      $templateItemDay: Handlebars.compile($('#fe-template-day').html()), // 날짜
      $templateYear: Handlebars.compile($('#fe-template-year').html()), // 년도

      $listWrapper: Handlebars.compile($('#list-template-wrapper').html()), // 리스트 wraper
      $emptyList: Handlebars.compile($('#list-empty').html()) // 내역 없을 경우
    };

    Handlebars.registerPartial('chargeItems', $('#fe-template-items').html()); // 업데이트 시 리스트 데이터 렌더링
    Handlebars.registerPartial('list', $('#fe-template-day').html()); // 날짜
    Handlebars.registerPartial('year', $('#fe-template-year').html()); // 년도
  },


  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
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

  /**
   * @function
   * @member
   * @desc 리스트 렌더링 후 호출 이벤트 바인드
   * - this.$btnListViewMorewrapper 더 보기 버튼 
   */
  _afterList: function() {
    this.$btnListViewMorewrapper = this.$domListWrapper.find('.fe-btn-more'); // 더 보기 버튼

    // 더 보기 버튼
    this.$btnListViewMorewrapper.on('click', 'button', $.proxy(this._updatePaymentList, this));
    // 리스트 내 클릭 이벤트 정의
    // - 상세보기
    this.$domListWrapper.on('click', '.fe-list-detail', $.proxy(this._listViewDetailHandler, this));
    this.$domListWrapper.on('click', '.btn', $.proxy(this._listViewDetailHandler, this));
    // - 예약취소(포인트 예약)
    this.$domListWrapper.on('click','button.fe-cancel-reserve',$.proxy(this._reserveCancelHandler,this));
  },


  /**
   * @function
   * @member
   * @desc 상세보기 이동
   * - myt-fare/info/history/detail? 
   * @param {string} type - 카테고리타입 상세페이지에서 어떤 API 를 호출할 지 기준이 됨
   * @param {number>string} innerIndex - 리스트내 인덱스 존재 할 경우 / 상세보기 페이지에서도 같은 API 를 호출하고 id 값이 존재하지 않아 innerIndex 값을 저장해서 파라미터로 넘겨 해당 데이터를 찾을 수 있도록 함
   * @param {date>string} opDt, payOpTm- 즉시납부 코드일 경우 (=== DI ) 파라미터 전송 해당 파라미터로 상세페이지에서 검색
   */
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

  /**
   * @function
   * @member
   * @param {event} e
   * @desc 예약취소 클릭 이벤트 발생 처리
   * @returns {void}
   */
  _reserveCancelHandler: function(e) {
    e.stopPropagation();
    this.reserveCancelData = this.data.listData.mergedListData[$(e.currentTarget).data('listId')];
    var alertCode, alertType;

    // alertCode 설정 포인트 종류별로 확인 메세지 결정
    if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.T)>=0) alertCode='ALERT_2_A85';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.RAINBOW)>=0) alertCode='ALERT_2_A87';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.OK)>=0) alertCode='ALERT_2_A92';

    if(alertCode){
      alertType = Tw.ALERT_MSG_MYT_FARE[alertCode];
    } 

    if(alertType){
      /**
       * @desc 포인트 예약취소 확인 팝업
       * @param {string} msg 확인 메세지
       * @param {string} title 확인 제목
       * @param {function} open_call_back_function 창 열린 후 실행한 function
       * @param {function} close_call_back_function 창 닫힌 후 실행할 function
       * @param {Object} $target 창 닫힌 후 포커스 될 타겟 element
       */
      this._popupService.openConfirm(
        alertType.MSG,
        alertType.TITLE,
        $.proxy(this._execReserveCancel,this, $(e.currentTarget)),
        $.proxy(this._popupService.close,this),
        $(e.currentTarget)
      );
    } 
    
  },

  /**
   * @function 
   * @member
   * @desc 포인트 1회 납부예약 취소 실행
   * @param {Object} $target  처음 이벤트 발생시켰던 버튼 엘리먼트
   */
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
        .done($.proxy(this._successReserveCancel, this, $target))
        .fail($.proxy(this._apiError, this, $target));
    }
  },


  /**
   * @function 
   * @member
   * @desc 포인트 1회 납부예약 취소 결과값 반환 후 처리
   * @param {Object} $target 처음 이벤트 발생시켰던 버튼 엘리먼트
   * @param {JSON} res 반환 값 JSON
   */
  _successReserveCancel: function($target, res){
    var alertCode, alertType;

    // 포인트 종류에 따라 성공 메세지 설정
    if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.T)>=0) alertCode='ALERT_2_A86';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.RAINBOW)>=0) alertCode='ALERT_2_A88';
    else if(this.reserveCancelData.listTitle.indexOf(Tw.POINT_NM.OK)>=0) alertCode='ALERT_2_A93';

    alertType = Tw.ALERT_MSG_MYT_FARE[alertCode];

    if(res.code === '00') {
      // 성공시
      /**
       * @desc 포인트 예약취소 알림 팝업
       * @param {string} msg 확인 메세지
       * @param {string} title 확인 제목
       * @param {string} label 확인 버튼 문구
       * @param {function} close_call_back_function 창 닫힌 후 실행할 function
       * @param {Object} $target 창 닫힌 후 포커스 될 타겟 element
       */
      this._popupService.openAlert(
        alertType.MSG, 
        alertType.TITLE, 
        Tw.BUTTON_LABEL.CONFIRM,
        $.proxy(this._reLoading, this)
        // 예약취소 확인 후 리로딩 되므로 되돌아갈 타켓 지정 필요없음
      );
    } else {
      // 실패시
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

  /**
   * @function
   * @member
   * @desc 예약 취소 성공 후 리로딩
   * @returns {void}
   */
  _reLoading: function(){
    // 예약 취소 시 오픈된 리스트 기억
    Tw.CommonHelper.setLocalStorage('listLastIndex', this.listLastIndex);
    this._historyService.reload();
  },

  // 포인트 예약 취소 end
  
  /**
   * @function
   * @member
   * @desc 더보기 실행
   * @param {event} e 더보기 버튼 클릭 이벤트 발생 시킨 엘리먼트
   * @returns {void}
   */
  _updatePaymentList: function(e) {
    // 표현할 리스트 데이터 호출
    this._updatePaymentListData();

    this.$btnListViewMorewrapper.css({display: this.listLastIndex >= this.data.listData.mergedListData.length ? 'none':''});
    // this._updateViewMoreBtnRestCounter($(e.currentTarget));

    var $domAppendTarget = this.$domListWrapper.find('.inquire-link-list ul');

    this.renderableListData.map($.proxy(function(o) {
      var renderedHTML;
      
      renderedHTML = this.$template.$templateItemDay({records:[{items:[o], date:o.listDt, yearHeader:o.yearHeader}]});
      
      $domAppendTarget.append(renderedHTML);

    }, this));
  },

  /**
   * @function 
   * @member
   * @returns {void}
   * @desc 리스트 
   */
  _updatePaymentListData: function() {
    this.listNextIndex = this.listLastIndex + this.listRenderPerPage;
    this.renderableListData = this.data.listData.mergedListData.slice(this.listLastIndex, this.listNextIndex);
    this.renderListData.restCount = this.data.listData.mergedListData.length - this.listNextIndex;

    this.listLastIndex = this.listNextIndex >= this.data.listData.mergedListData.length ?
        this.data.listData.mergedListData.length : this.listNextIndex;
  },

  /**
   * @function
   * @member
   * @param {event} e
   * @returns {void}
   * @desc 더보기 클릭시 남은 리스트 갯수 표현하는 것이었으나 현재 사용되지는 않음
   */
  _updateViewMoreBtnRestCounter: function(e) {
    e.text(e.text().replace(/\((.+?)\)/, '(' + this.renderListData.restCount + ')'));
  },
  // 더 보기 end


  /**
   * @function
   * @member
   * @returns {void}
   * @desc 자동납부 통합인출 해지 페이지 이동
   */
  _openAutoPaymentLayer: function () {
    this._historyService.goLoad('/myt-fare/info/cancel-draw');
  },
  
  /**
   * @function
   * @member
   * @param {event} evt 
   * @desc 분류선택 액션시트 호출
   */
  _typeActionSheetOpen: function (evt) {
    /**
     * @function 
     * @param {Object} {hbs: hbs 의 파일명, layer: 레이어 여부, title: 액션시트 제목, data: 데이터 리스트, btnfloating: {txt: 닫기버튼 문구, attr: 닫기버튼 attribute, class: 닫기버튼 클래스}}
     * @param {function} function_open_call_back 액션시트 연 후 호출 할 function
     * @param {function} function_close_call_back 액션시트 닫힌 후 호출할 function
     * @param {string} 액션시트 열 때 지정할 해쉬값, 기본값 popup{n}
     * @param {Object} $target 액션시트 닫힐 때 포커스 될 엘리먼트 여기에서는 카테고리 선택 버튼
     * @desc 라디오 선택 콤보박스 형태
     */
    this._popupService.open({
      hbs: 'actionsheet01',
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

  /**
   * @function
   * @member
   * @param {Array} arr 
   * @desc 회원 회선번호가 유무선 여부에 따라 셀렉트 타입 결정 (유선 회원일 경우(인터넷 가입회원 등) 소액결제 등의 선택상자는 나오지 않도록 처리)
   * @returns {Array}
   */
  _setSelectPayType: function (arr) {
    var types = arr[0].list;
    return [{list: _.reduce(types, $.proxy(function(prev, type){
      if (this.data.isMobile || type.onlyType !== 'M') {
        prev.push(type);
      } 
      return prev;
    }, this), [])}];
  },

  /**
   * @function
   * @member
   * @desc 카테고리 선택 액션시트 열린 후 callback function
   * - 각 리스트에 클릭 이벤트 바인드 -> 라디오 버튼 체인지 이벤트를 발생 시킴
   * - 각 라디오 버튼에 체인지 이벤트 바인드
   * - 선택된 카테고리 라디오 버튼에 checked 처리
   * @param {Object} $container 카테고리 선택 액션시트 wraper 엘리먼트
   * @returns {void}
   */
  _openTypeSelectHandler: function ($container) {
    this.$typeSelectActionsheetButtons = $container.find('.ac-list>li');
    $(this.$typeSelectActionsheetButtons[0]).find('input').prop('checked', false);
    $(this.$typeSelectActionsheetButtons[this.currentActionsheetIndex]).find('input').prop('checked', true);
    this.$typeSelectActionsheetButtons.on('click', $.proxy(this._clickPaymentType, this));
    $container.on('change', 'input', $.proxy(this._moveByPaymentType, this));
  },

  /**
   * @function
   * @member
   * @desc 라디오 액션 시트 내 리스트 클릭 이벤트, 해당 리스트 내 라디오 버튼 체인지 이벤트를 발생시킴
   * @param {event} e 
   * @returns {void}
   */
  _clickPaymentType: function (e) {
    if ($(e.currentTarget).is('li')) {
      e.stopPropagation();
      $(e.currentTarget).siblings().find('input').prop('checked', false);
      $(e.currentTarget).find('input').prop('checked', true).trigger('change');
    }
  },

  /**
   * @function
   * @member
   * @desc 라디오 액션시트 체인지 이벤트 발생 시 실행 , 해당 카테고리 파라미터를 붙여 이동함 (sortType)
   * @param {event} e 
   * @returns {void}
   */
  _moveByPaymentType: function (e) {
    var target    = $(e.currentTarget),
        targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    
    if (Tw.MYT_PAYMENT_HISTORY_TYPE[target.val()] !== this.queryParams.sortType) {
      targetURL = !Tw.MYT_PAYMENT_HISTORY_TYPE[target.val()] ?
          targetURL : targetURL + '?sortType=' + Tw.MYT_PAYMENT_HISTORY_TYPE[target.val()];

      this._popupService.closeAllAndGo(targetURL);
      
    } else {
      this._popupService.close();
    }
  },

  /**
   * @function
   * @member
   * @desc 카테고리 선택 액션시트 닫기
   */
  _closeTypeSelect: function () {
    this._popupService.close();
  },
  // 분류선택 end

  /**
   * @function
   * @member
   * @desc 과납 환불 처리 내역으로 이동 myt-fare.info.history.controller.ts 에서 해당정보 받아옴(refundURL)
   */
  _moveRefundList: function () {
    this._historyService.goLoad(this.data.refundURL);
  },

  /**
   * @function
   * @member
   * @desc 과납내역 환불 받기 페이지로 이동 myt-fare.info.history.controller.ts 에서 해당정보 받아옴(refundAccountURL)
   */
  _moveRefundAccount: function () {
    this._historyService.goLoad(this.data.refundAccountURL);
  },

  /**
   * @function
   * @desc API 호출 후 에러 반환시 에러 서비스 호출
   * @param {Oject} $target API 호출시 이벤트 발생 시킨 엘리먼트
   * @param {JSON} err API 반환 코드 
   * @returns {boolean} false
   */
  _apiError: function ($target, err) {
    Tw.Error(err.code, Tw.MSG_COMMON.SERVER_ERROR + '<br />' + err.msg).pop(null, $target);
    return false;
  }
};

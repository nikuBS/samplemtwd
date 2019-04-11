/**
 * @file [소액결제-결제내역-상세]
 * @author Lee kirim
 * @since 2018-11-29
 */

 /**
 * @class 
 * @desc 결제내역 상세 위한 class
 * @param {Element} rootEl - 레이어 element Object
 * @param {Object} data - myt-fare.bill.small.history.js 에서 상세 팝업 호출시 전달되어 온 데이터
 * @param {function} updateFunc - 데이터 업데이트 시 부모 함수 호출 [차단하기]에서 사용
 */
Tw.MyTFareBillSmallHitstoryDetail = function (rootEl, data, updateFunc) {
  this.$container = rootEl;
  this.data = data;
  this.updateFunc = updateFunc;
  this._apiService = Tw.Api;
  this._historyService = new Tw.HistoryService(rootEl);
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillSmallHitstoryDetail.prototype = {

  /**
   * @function
   * @member 
   * @desc 객체가 생성될 때 동작에 필요한 내부 변수를 정의 한다.
   * @return {void}
   */
  _init: function() { },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - MF_06_01_01.hbs 참고
   */
  _cachedElement: function() {
    this.$showBlockList = this.$container.find('#fe-btn-view-block'); // 차단내역 보기 버튼
    this.$setBlock = this.$container.find('#fe-btn-set-block'); // 차단내역 보기 버튼
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function() {
    // 차단하기 클릭
    this.$setBlock.on('click', $.proxy(this._setBillBlock, this));
  
    // 차단내역으로 이동 클릭
    this.$showBlockList.on('click', $.proxy(this._moveBlockList, this));
  },

  /**
   * @method
   * @desc 차단내역으로 이동 팝업이 열린상태에서 이동으로 replaceURL 사용
   */
  _moveBlockList: function() {
    this._historyService.replaceURL('/myt-fare/bill/small/block');
  },

  /**
   * @method
   * @desc 차단하기 클릭, 차단하기 확인 팝업 노출
   * @param {event} e 
   */
  _setBillBlock: function(e) {
    /**
       * @desc 차단하기 확인 팝업
       * @param {string} title 확인 제목
       * @param {string} msg 확인 메세지
       * @param {string} btn 확인 버튼 문구
       * @param {function} open_call_back_function 창 열린 후 실행한 function
       * @param {function} confirm_function 확인으로 닫힌 후 실행할 function
       * @param {function} close_call_back_function 창 닫힌 후(취소버튼으로) 실행할 function
       * @param {string} hash 해쉬이름
       * @param {string} align 정렬될 클래스
       * @param {Object} $target 창 닫힌 후 포커스 될 타겟 element
       */
    this._popupService.openModalTypeA(
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.TITLE,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.MSG,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A94.BUTTON,
      null,
      $.proxy(this._execBillBlock, this, $(e.currentTarget)),
      null,
      'confirmBlock',
      null,
      $(e.currentTarget)
    );
  },

  /**
   * @method
   * @desc 차단하기 API 호출
   * @param {element} $target
   */
  _execBillBlock: function($target) {
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_05_0082, {
      idPg: this.data.idpg,
      tySvc: this.data.tySvc,
      cpCode: this.data.cpCode,
      state: 'A'
    })
      .done($.proxy(this._successBillBlock, this, $target))
      .fail($.proxy(this._failBillBlock, this, $target));
  },

  /**
   * @method
   * @desc 차단 API 응답시 실행
   * @param {element} $target
   * @param {JSON} res 
   */
  _successBillBlock: function($target, res) {
    if(res.code !== Tw.API_CODE.CODE_00) {
      this._failBillBlock($target, res);
    }
    // 차단완료
    Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.BLOCK);
    
    // view update
    this.$setBlock.addClass('none').attr('aria-hidden', true)
    this.$showBlockList.removeClass('none').attr('aria-hidden', false);
    if (this.$container.find('.fe-block-state').length) {
      this.$container.find('.fe-block-state').text(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TYPE.A1);
    }

    // data update
    this.updateFunc(this.data.plainTime, this.data.listId, {
      cpState:'A1',
      blockState:Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TYPE.A1,
      isBlocked:true
    });
  },

  /**
   * @method
   * @desc API 응답 에러 반환 시 에러메세지 팝업 실행
   * @param {element} $target 
   * @param {JSON} res 
   */
  _failBillBlock: function($target, res) {
    /**
     * @param {function} 팝업 닫힌 후 실행될 callback function
     * @param {element} 팝업 닫힌 후 포커스 이동할 DOM 객체 (웹접근성 반영)
     */
    return Tw.Error(res.code, res.msg).pop(null, $target);
  }
 
};

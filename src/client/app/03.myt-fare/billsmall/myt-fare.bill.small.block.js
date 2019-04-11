/**
 * @file [소액결제-차단내역-리스트]
 * @author Lee kirim
 * @since 2018-11-29
 */

 /**
 * @class 
 * @desc 차단내역 리스트를 위한 class
 * @param {Object} rootEl - 최상위 element Object
 * @param {JSON} data - myt-fare.bill.small.block.controlloer.ts 로 부터 전달되어 온 내역 정보
 */
Tw.MyTFareBillSmallBlock = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._init();
  this._bindEvent();
};

Tw.MyTFareBillSmallBlock.prototype = {

  /**
   * @function
   * @member 
   * @desc 데이터 렌더링
   * @return {void}
   */
  _init: function() {
    var renderedHTML;
    if(!this.data.cpHistories.length){
      renderedHTML = this.$template.$emptyList();
    }else{
      renderedHTML = this.$template.$blockContents(this.data);
    }
    this.$domWrapper.append(renderedHTML);
  },

  /**
   * @function
   * @member
   * @desc 생성자 생성시 템플릿 엘리먼트 설정
   * - myt-fare.bill.small.block.html 참고
   */
  _cachedElement: function() {
    this.$domWrapper = this.$container.find('#fe-block-list'); 
    this.$template = {
      $blockContents: Handlebars.compile($('#fe-block-contents').html()), // 차단내역 리스트 
      $emptyList: Handlebars.compile($('#list-empty').html()) // 화면 없을 경우
    };
  },

  /**
   * @function
   * @member
   * @desc 생성시 이벤트 바인드
   */
  _bindEvent: function() {
    this.$domWrapper.find('.on-tx').on('click',$.proxy(this._UnBlockThis,this)); // 해제하기
    // 차단하기는 리스트에서 해제된 내역 불러와 지지 않으므로 토글 할 수 없음 ( 기존 기획 토글이었으나 해당 기능 삭제)
  },

  /**
   * @function
   * @desc 해제하기 버튼 눌렀을 시 확인 팝업 띄움
   * @param {event} e 
   */
  _UnBlockThis: function(e) {
    e.stopPropagation();
    this.$li = this.$domWrapper.find('li').filter(function(){ return $(this).data('listId') === $(e.currentTarget).data('listId'); }); // 클릭이벤트 발생한 엘리먼트를 저장 성공후 DOM에서 제거 목적
    this.blockData = this.data.cpHistories[$(e.currentTarget).data('listId')]; // 블록될 데이터를 찾아 저장
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
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A95.TITLE,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A95.MSG,
      Tw.ALERT_MSG_MYT_FARE.ALERT_2_A95.BUTTON,
      null,
      $.proxy(this._execUnBlock, this, $(e.currentTarget)),
      null,
      'confirmBlock',
      null,
      $(e.currentTarget)
    );
  },
  
  /**
   * @method
   * @desc 해제하기 API 호출
   * @param {element} $target
   */
  _execUnBlock: function($target) {
    this.$li.find('.btn-switch.type1').removeClass('on');
    this._popupService.close();
    this._apiService.request(Tw.API_CMD.BFF_05_0082, {
      idPg: this.blockData.idpg,
      tySvc: this.blockData.tySvc,
      cpCode: this.blockData.cpCode,
      state: 'C'
    })
      .done($.proxy(this._successUnBlock, this, $target))
      .fail($.proxy(this._failBlock, this, $target));
  },

  /**
   * @method
   * @desc 해제 API 응답시 실행
   * @param {element} $target
   * @param {JSON} res 
   */
  _successUnBlock: function($target, res) {
    if(res.code !== Tw.API_CODE.CODE_00) {
      this._failBlock($target, res);
      this.$li.find('.btn-switch.type1').addClass('on');
    } else {
      // 해제완료 토스트 팝업
      Tw.CommonHelper.toast(Tw.MYT_FARE_HISTORY_MICRO_BLOCK_TOAST.REVOCATION);
      // 데이터 변경
      this.data.payHistoryCnt = parseFloat(this.data.payHistoryCnt) - 1;
      // DOM 업데이트
      this.$li.remove();
      this.$container.find('.ti-caption-gray .num em').text(this.data.payHistoryCnt);
      // 0건이 되면
      if(!this.data.payHistoryCnt) {
        this.$domWrapper.append(this.$template.$emptyList());
      }
    }
  },

  /**
   * @method
   * @desc API 응답 에러 반환 시 에러메세지 팝업 실행
   * @param {element} $target 
   * @param {JSON} res 
   */
  _failBlock: function($target, res) {
    /**
     * @param {function} 팝업 닫힌 후 실행될 callback function
     * @param {element} 팝업 닫힌 후 포커스 이동할 DOM 객체 (웹접근성 반영)
     */
    return Tw.Error(res.code, res.msg).pop(null, $target);
  }

 
};

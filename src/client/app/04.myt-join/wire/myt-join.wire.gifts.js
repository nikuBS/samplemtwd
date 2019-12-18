/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 사은품 조회(MS_04_01_04)
 * @file myt-join.wire.gifts.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 사은품 내역 조회
 */
/**
 *
 * @param {jQuery} rootEl
 * @param {Object} data
 * @param {Object} svcInfo
 * @constructor
 */
Tw.MyTJoinWireGifts = function (rootEl, data, svcInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  // svcInfo 값 추가 [DV001-14262]
  this._svcInfo = svcInfo;

  this._bindEvent();
  this._registerHelper();
  this._initListUi(data);
};

Tw.MyTJoinWireGifts.prototype = {

  /**
   * 현재 페이지 번호
   */
  _nowPageNum: 1,

  /**
   * 목록 전체 count
   */
  _listTotCnt: 0,

  /**
   * 목록 data
   */
  _list: [],

  /**
   * templates
   */
  _tmplListBox: null,
  _listMoreBtn: null,
  _tmplListItem: null,

  /**
   * 초기화 데이터 ui로 변경
   * @param {Object} data
   * @private
   */
  _initListUi: function (data) {
    // hasSKTWire:SK브로드밴드 가입여부(Y/N), resultValue:사은품 여부(Y/N)
    if ( 'Y' === data.hasSKTWire ) {
      // sk브로드밴드인 경우 팝업 변경 (myt-join공통함수로 처리)
      (new Tw.MyTJoinCommon()).openSkbdAlertOnInit(this._historyService);
      //return;
    }

    // init templates
    this._tmplListBox = $.trim($('#list-cont-box-tmplt').html());
    this._listMoreBtn = $('.btn-more');
    this._tmplListItem = Handlebars.compile($.trim($('#list-cont-item-tmplt').html()));

    this._listTotCnt = parseInt(data.totalCnt, 10);
    if ( this._listTotCnt <= 0 ) {
      $('#divListBox').hide().attr('aria-hidden', true);
      $('#divNoListBox').show().attr('aria-hidden', false);
    }
    else {
      $('#divListBox').show().attr('aria-hidden', false);
      $('#divNoListBox').hide().attr('aria-hidden', true);
      this._printList(data.giftProvideList);
    }
  },

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    // 배송조회
    this.$container.on('click', '.bt-alone', $.proxy(this._goDelivPage, this));
    // 더보기 버튼 클릭시
    this.$container.on('click', '.btn-more', $.proxy(this._requestNextData, this));
  },

  /**
   * hbs register helper 등록
   * @private
   */
  _registerHelper: function () {
    Handlebars.registerHelper('convertShortDate', Tw.DateHelper.getShortDate);
  },

  /**
   * 목록 출력
   * @private
   */
  _printList: function (list) {
    if ( !list || list.length === 0 ) {
      this._showOrHideMoreBtn();
      return;
    }

    var $listBox = this.$container.find('.history-list').find('ul');

    for ( var i = 0; i < list.length; i++ ) {
      var item = list[i];
      item.giftNm = item.giftNm || (this._svcInfo.prodNm + Tw.MYT_JOIN.WIRE_GIFT);
      item.hasDlvUrl = false;
      if ( ['01', '05', '07'].indexOf(item.giftOpStCd) > -1 ) {
        item.isComp = false;
        // 01 배송접수, 05 반품 요청, 07 재배송 접수 건에 한해서 배송조회 버튼 노출 (기존)
        // 주소지 정보가 없는 경우 추가 (변경) [DV001-14262]
        // url이 없는 경우 노출 안함 DV001-15784
        if ( item.pdlvBasAddr && item.dlvUrl ) {
          item.hasDlvUrl = true;
        }
      } else {
        item.isComp = ('03' === item.giftOpStCd);
      }
      $listBox.append(this._tmplListItem(item));
    }

    this._list = this._list.concat(list);
    this._showOrHideMoreBtn();
  },


  /**
   * 다음 데이터 호출
   * @private
   */
  _requestNextData: function () {
    Tw.CommonHelper.startLoading('.container', 'grey');

    this._apiService.request(Tw.API_CMD.BFF_05_0159, { requestPage: String(this._nowPageNum + 1) })
      .done($.proxy(function (resp) {
        this._nowPageNum += 1;

        if ( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result ) {
          this._showErrorAlert(resp.code, resp.msg);
          return;
        }

        this._printList(resp.result.giftProvideList);
        Tw.CommonHelper.endLoading('.container');
      }, this))
      .fail($.proxy(this._requestFail, this));
    // 결과물 출력
  },

  _showErrorAlert: function (code, msg) {
    Tw.Error(code, msg).pop();
    Tw.CommonHelper.endLoading('.container');
  },
  _requestFail: function (err) {
    Tw.Error(err.status, err.statusText).pop();
    Tw.CommonHelper.endLoading('.container');
  },

  /**
   * '더 보기' 버튼 보이기/숨기기
   * @private
   */
  _showOrHideMoreBtn: function () {
    if ( this._listTotCnt > this._list.length ) {
      $('.btn-more').show().attr('aria-hidden', false);
    }
    else {
      $('.btn-more').hide().attr('aria-hidden', true);
    }
  },

  /**
   * 배송조회
   * @private
   */
  _goDelivPage: function (event) {
    var url = event.currentTarget.getAttribute('data-url');
    Tw.CommonHelper.openUrlExternal(url);
  }
};

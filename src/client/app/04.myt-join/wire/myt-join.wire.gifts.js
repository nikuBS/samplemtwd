/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 사은품 조회(MS_04_01_04)
 * @file myt-join.wire.gifts.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 사은품 내역 조회
 */
Tw.MyTJoinWireGifts = function (rootEl, strInitData, svcInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();
  // svcInfo 값 추가 [DV001-14262]
  this._svcInfo = JSON.parse(svcInfo);

  this._bindEvent();
  this._registerHelper();
  this._initListUi(JSON.parse(strInitData));
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
  _listContBox: null,
  _listMoreBtn: null,
  _listItemTmplt: null,

  /**
   * 초기화 데이터 ui로 변경
   * @private
   */
  _initListUi: function (initData) {
    // hasSKTWire:SK브로드밴드 가입여부(Y/N), resultValue:사은품 여부(Y/N)
    if ( 'Y' === initData.hasSKTWire ) {
      // sk브로드밴드인 경우 팝업 변경 (myt-join공통함수로 처리)
      (new Tw.MyTJoinCommon()).openSkbdAlertOnInit(this._historyService);
      //return;
    }

    // init templates
    this._listContBox = $('#list-cont-box-tmplt').html();
    this._listMoreBtn = $('.bt-more');
    this._listItemTmplt = Handlebars.compile($('#list-cont-item-tmplt').html());

    this._listTotCnt = initData.totalCnt;
    if ( this._listTotCnt <= 0 ) {
      $('#divListBox').hide().attr('aria-hidden', true);
      $('#divNoListBox').show().attr('aria-hidden', false);
    }
    else {
      $('#divListBox').show().attr('aria-hidden', false);
      $('#divNoListBox').hide().attr('aria-hidden', true);
      this._printList(initData.giftProvideList);
    }
  },

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {
    // 더보기 버튼 클릭시
    this.$container.on('click', '.bt-more', $.proxy(this._requestNextData, this));

    // 배송조회
    this.$container.on('click', '.bt-alone', $.proxy(this._goDelivPage, this));
  },

  /**
   * hbs register helper 등록
   * @private
   */
  _registerHelper: function () {
    Handlebars.registerHelper('shortDate', Tw.DateHelper.getShortDate);
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

    var $listBox = $('.history-list ul', this.$container);

    for ( var i = 0; i < list.length; i++ ) {
      list[i].giftNm = list[i].giftNm ? list[i].giftNm : (this._svcInfo.prodNm + Tw.MYT_JOIN.WIRE_GIFT);
      list[i].isComp = ('03' === list[i].giftOpStCd);
      list[i].hasDlvUrl = (['01', '05', '07'].indexOf(list[i].giftOpStCd) !== -1);
      if ( ['01', '05', '07'].indexOf(list[i].giftOpStCd) > -1 ) {
        // 01 배송접수, 05 반품 요청, 07 재배송 접수 건에 한해서 배송조회 버튼 노출 (기존)
        // 주소지 정보가 없는 경우 추가 (변경) [DV001-14262]
        // url이 없는 경우 노출 안함 DV001-15784
        if ( list[i].pdlvBasAddr && list[i].dlvUrl ) {
          list[i].hasDlvUrl = true;
        }
        else {
          list[i].hasDlvUrl = false;
        }
      }
      $listBox.append(this._listItemTmplt(list[i]));
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
    if ( parseInt(this._listTotCnt, 10) > this._list.length ) {
      $('.bt-more').show().attr('aria-hidden', false);
    }
    else {
      $('.bt-more').hide().attr('aria-hidden', true);
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
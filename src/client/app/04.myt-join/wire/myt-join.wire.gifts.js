/**
 * FileName: myt-join.wire.gifts.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
Tw.MyTJoinWireGifts = function (rootEl, strInitData) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

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
  _listContBox : null,
  _listMoreBtn : null,
  _listItemTmplt : null,

  /**
   * 초기화 데이터 ui로 변경
   * @private
   */
  _initListUi: function(initData) {
    // hasSKTWire:SK브로드밴드 가입여부(Y/N), resultValue:사은품 여부(Y/N)
    if('Y' !== initData.hasSKTWire || 'Y' !== initData.resultValue){
      //return;
    }

    // init templates
    this._listContBox = $('#list-cont-box-tmplt').html();
    this._listMoreBtn = $('.bt-more');
    this._listItemTmplt = Handlebars.compile($('#list-cont-item-tmplt').html());

    this._listTotCnt = initData.totalCnt;
    this._printList(initData.giftProvideList);
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
    Handlebars.registerHelper('shortDate', Tw.DateHelper.getShortDateNoDot);
  },

  /**
   * 목록 출력
   * @private
   */
  _printList: function (list) {
    if( !list || list.length === 0 ){
      this._showOrHideMoreBtn();
      return;
    }

    var $listBox = $('.history-list ul', this.$container);

    for( var i = 0; i < list.length; i++ ){
      list[i].isComp = ('03' === list[i].giftOpStCd);
      list[i].hasDlvUrl = (['01','05','07'].indexOf(list[i].giftOpStCd) !== -1);
      $listBox.append(this._listItemTmplt( list[i] ));
    }

    this._list = this._list.concat(list);
    this._showOrHideMoreBtn();
  },


  /**
   * 다음 데이터 호출
   * @private
   */
  _requestNextData: function () {
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_05_0159, { page: String(this._nowPageNum+1) })
      .done($.proxy(function (resp) {
        this._nowPageNum += 1;

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result){
          this._showErrorAlert(resp.code, resp.msg);
          return ;
        }

        this._printList(resp.result.giftProvideList);
        skt_landing.action.loading.off({ ta: '.container' });
      }, this))
      .fail($.proxy(this._requestFail, this));
    // 결과물 출력
  },

  _showErrorAlert: function(code, msg){
    Tw.Error(code, msg).pop();
    skt_landing.action.loading.off({ ta: '.container' });
  },
  _requestFail: function (err) {
    Tw.Error(err.status, err.statusText).pop();
    skt_landing.action.loading.off({ ta: '.container' });
  },

  /**
   * '더 보기' 버튼 보이기/숨기기
   * @private
   */
  _showOrHideMoreBtn: function () {
    if( parseInt(this._listTotCnt, 10) > this._list.length ) {
      $('.bt-more').show();
    } else {
      $('.bt-more').hide();
    }
  },

  /**
   * 배송조회
   * @private
   */
  _goDelivPage: function(event){
    var url = event.currentTarget.getAttribute('data-url');
    location.href = url;
  }
};
/**
 * FileName: myt-join.wire.as.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
Tw.MyTJoinWireAS = function (rootEl, strInitData) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._bindEvent();
  this._registerHelper();
  this._initListUi(JSON.parse(strInitData));
};

Tw.MyTJoinWireAS.prototype = {

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
   * 목록의 마지막 년도
   */
  _listLastYear: '',

  /**
   * templates
   */
  _listContBox : null,
  _listMoreBtn : null,
  _listItemTmplt : null,
  _listYearDivTmplt : null,

  /**
   * 초기화 데이터 ui로 변경
   * @private
   */
  _initListUi: function(initData) {

    // init templates
    this._listContBox = $('#list-cont-box-tmplt').html();
    this._listMoreBtn = $('#bt-more-tmplt').html();
    this._listItemTmplt = Handlebars.compile($('#list-cont-item-tmplt').html());
    this._listYearDivTmplt = Handlebars.compile($('#list-year-div-tmplt').html());

    this._listTotCnt = initData.totalCnt;
    this._printList(initData.history);
  },

  /**
   * 이벤트 바인딩
   * @private
   */
  _bindEvent: function () {

    // 목록 클릭시 - 화면이동
    this.$container.on('click', '.cont-box li', $.proxy(this._showListDetail, this));

    // 더보기 버튼 클릭시
    this.$container.on('click', '.bt-more', $.proxy(this._requestNextData, this));
  },

  /**
   * hbs register helper 등록
   * @private
   */
  _registerHelper: function () {
    Handlebars.registerHelper('noYearDate', Tw.DateHelper.getShortDateNoYear);
  },

  /**
   * 목록 출력
   * @private
   */
  _printList: function (list) {
    if( !list || list.length === 0 ){
      this._removeMoreBtn();
      //this._showOrHideMoreBtn();
      return;
    }
    var $contBoxes = $('#cont-boxes');
    var $lastBox = $('.cont-box ul', $contBoxes).last();

    for( var i = 0; i < list.length; i++ ){

      if( this._lastYear !== list[i]['troubleDt'].substr(0,4) ){
        // 연도 출력
        this._lastYear = list[i]['troubleDt'].substr(0,4);
        $contBoxes.append(this._listYearDivTmplt({year: this._lastYear}));
        $contBoxes.append(this._listContBox);
        $lastBox = $('.cont-box ul', $contBoxes).last();
      }

      $lastBox.append(this._listItemTmplt( list[i] ));
    }

    // 당년도인 경우 숨김
    var nowYear = new Date().getFullYear();
    $('.data-select-wrap').each(function(){
      if($(this).text().trim() === String(nowYear)){
        $(this).hide();
      }
    });

    this._list = this._list.concat(list);
    this._addMoreBtn();
    //this._showOrHideMoreBtn();
  },


  /**
   * 다음 데이터 호출
   * @private
   */
  _requestNextData: function () {
    this._removeMoreBtn();
    skt_landing.action.loading.on({ ta: '.container', co: 'grey', size: true });

    this._apiService.request(Tw.API_CMD.BFF_05_0156, { page: String(this._nowPageNum+1) })
      .done($.proxy(function (resp) {
        this._nowPageNum += 1;

        if( !resp || resp.code !== Tw.API_CODE.CODE_00 || !resp.result){
          this._showErrorAlert(resp.code, resp.msg);
          return ;
        }

        this._printList(resp.result.history);
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
   * 더보기버튼 삭제
   * @private
   */
  _removeMoreBtn: function(){
    $('.bt-more').remove();
  },
  /**
   * 더보기버튼 추가
   * @private
   */
  _addMoreBtn: function(){
    if( parseInt(this._listTotCnt) > this._list.length ) {
      $('.cont-box').last().append(this._listMoreBtn);
    }
  },

  /**
   * '더 보기' 버튼 출력
   * @private
   */
  _showOrHideMoreBtn: function () {
    if( parseInt(this._listTotCnt) > this._list.length ) {
      $('.bt-more').show();
    } else {
      $('.bt-more').hide();
    }
  },

  /**
   * 상세화면으로 이동
   * @private
   */
  _showListDetail: function(event) {
    var num = event.currentTarget.getAttribute('data-no');
    var item = null;
    for(var i = 0; i < this._list.length; i++){
      if(this._list[i].troubleNum === num.toString()){
        item = this._list[i];
        break;
      }
    }

    this._historyService.goLoad('./as/detail?troubleNum='+num+'&troubleDt='+item.troubleDt+'&svcNm='+item.svcNm+'&troubleDetail='+item.troubleDetail+'&stNm');
  }



};


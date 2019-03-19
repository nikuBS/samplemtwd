/**
 * FileName: myt-fare.bill.set.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * 요금 안내서 설정
 * Date: 2018. 9. 13
 */
Tw.MyTFareBillSet = function (rootEl, integrateList) {
  this.$container = rootEl;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._integrateList = integrateList;
  this._init();
};

Tw.MyTFareBillSet.prototype = {
  /**
   * 최초 실행
   * @private
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._initIntegrateList();
  },
  /**
   * 초기값 설정
   * @private
   */
  _initVariables: function () {
    this.$integrateListArea = this.$container.find('#fe-integrate-list'); // 통합청구 등록회선 리스트 영역
  },
  /**
   * 이벤트 설정
   * @private
   */
  _bindEvent: function () {
    this.$container.on('click', '#fe-app-down', $.proxy(this._onDownload, this));
  },

  /**
   * 통합청구 등록회선 리스트
   * @private
   */
  _initIntegrateList: function () {
    if (this._integrateList.length < 1) {
      return;
    }

    this._moreViewSvc.init({
      list: this._integrateList,
      btnMore: this.$container.find('.btn-more'),
      callBack: $.proxy(this._renderList, this),
      isOnMoreView: true
    });
  },

  /**
   * 통합청구 등록회선 리스트 render
   * @param res
   * @private
   */
  _renderList: function (res) {
    var source = $('#integrateList').html();

    var template = Handlebars.compile(source);
    var output = template({
      list: res.list
    });
    this.$integrateListArea.append(output);
  },

  /**
   * Bill Letter app 다운로드
   * @private
   */
  _onDownload: function (e) {
    e.preventDefault();
    var url = Tw.BrowserHelper.isAndroid() ? Tw.URL_PATH.BILL_LETTER_DOWNLOAD_PLAY_STORE : Tw.URL_PATH.BILL_LETTER_DOWNLOAD_APP_STORE;
    Tw.CommonHelper.openUrlExternal(url, '');
  },

  /**
   * API Fail
   * @param err
   * @private
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};

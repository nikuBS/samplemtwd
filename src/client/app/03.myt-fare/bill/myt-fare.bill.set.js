/**
 * @file myt-fare.bill.set.js
 * @author 양정규 (skt.P130715@partner.sk.com)
 * @since 2018-09-13
 */

/**
 * @class
 * @desc MyT > 나의요금 > 요금 안내서 설정
 * @param {Object} rootEl - dom 객체
 * @param {ArrayList} integrateList - 통합청구 등록회선 리스트
 */
Tw.MyTFareBillSet = function (rootEl, integrateList) {
  this.$container = rootEl;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._integrateList = integrateList;
  this._init();
};

Tw.MyTFareBillSet.prototype = {
  /**
   * @function
   * @desc 최초 실행
   */
  _init: function () {
    this._initVariables();
    this._bindEvent();
    this._initIntegrateList();
  },
  /**
   * @function
   * @desc 초기값 설정
   */
  _initVariables: function () {
    this.$integrateListArea = this.$container.find('#fe-integrate-list'); // 통합청구 등록회선 리스트 영역
  },
  /**
   * @function
   * @desc 이벤트 설정
   */
  _bindEvent: function () {
    this.$container.on('click', '#fe-app-down', $.proxy(this._onDownload, this));
  },

  /**
   * @function
   * @desc 통합청구 등록회선 리스트
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
   * @function
   * @cesc 통합청구 등록회선 리스트 render
   * @param {JSON} res
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
   * @function
   * @desc Bill Letter app 다운로드
   * @param {JSON} event
   */
  _onDownload: function (e) {
    e.preventDefault();
    var url = Tw.BrowserHelper.isAndroid() ? Tw.URL_PATH.BILL_LETTER_DOWNLOAD_PLAY_STORE : Tw.URL_PATH.BILL_LETTER_DOWNLOAD_APP_STORE;
    Tw.CommonHelper.openUrlExternal(url, '');
  },

  /**
   * @function
   * @desc API Fail
   * @param {JSON} err
   */
  _onFail: function (err) {
    Tw.Error(err.code, err.msg).pop();
  }
};

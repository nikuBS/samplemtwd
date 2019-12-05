/**
 * @file [유스캔전송]
 * @author Lee Kirim
 * @since 2019-03-28
*/

/**
 * @class 
 * @desc 이메일전송 파일첨부 필요시 호출, 유스캔 API 호출
 */
Tw.CustomerUscanService = function () {
  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService();
  this._init();
};

Tw.CustomerUscanService.prototype = {
  _init: function () {

  },

  requestUscan: function (option) {
    this.type = option.type; // 타입에 따라 보낼곳이 달라짐
    this.request = option.request; // 유스캔 전송 후 호출할 전송 함수
    this.files = option.files; // 전송할 파일
    this.$target = option.$target; // 포커스 돌아갈 버튼
    this.Upload = option.Upload; // 업로드 생성객체
    this.proMemo =option.proMemo; // 구분 메모

    // 파일 있음
    if ( Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
      this._requestUscan(_.compact(this.files));
    } else {
      this.Upload.uploadFile(this.files, $.proxy(this._requestUscan, this));
    }
  },

  /**
   * @member
   * @desc 보낼곳 
   */
  _getUscanNum: {
    CELL: 'skt257@sk.com',
    INTERNET: 'skt267@sk.com'
  },

  /*
  * params 
  * res {name: string, originalName: string, path: string, size: number}
  */
 _requestUscan: function (res) {
    var type = this.type;
    // 해당 케이스 아니면 전송 안됨 (핸드폰, 인터넷 케이스)
    var recvFaxNum = this._getUscanNum[type.toUpperCase()];
    if (!recvFaxNum || !res.result ) {
      this.Upload.initFiles(); // 결과가 없으면 업로드 중지 전송 
      return this.request(this.$target);
    }

    this._apiService.request(Tw.API_CMD.BFF_01_0046, {
        recvFaxNum: recvFaxNum,
        proMemo: this.proMemo, 
        scanFiles: this._getConvFileList(res.result)
      }).done($.proxy(this._onSuccessUscanUpload, this))
        .fail($.proxy(this._apiError, this.$target));
  },

  /**
   * @function
   * @desc 파일 형식 변환 API 형식에 맞도록 변경
   * @param {array} result 파일
   */
  _getConvFileList: function (result) {
    return result.length ? _.map(result, function(file){
      return {
        fileSize: file.size,
        fileName: file.name,
        filePath: file.path
      }
    }): [];
  },

  /**
   * @function
   * @desc 유스캔 업로드 성공 후 전송 실행
   * @param {JSON} res 
   */
  _onSuccessUscanUpload: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.request(this.$target);
    } else {
      this._apiError(this.$target, res);
    }
  },

  /**
   * @function
   * @desc API 에러 발생시 팡벙노출
   * @param {element} $target 에러 팝업 닫힌 후 포커스될 버튼
   * @param {JSON} res 에러정보
   */
  _apiError: function ($target, res) {
    Tw.Error(res.code, res.msg).pop(null, $target);
  },

  /**
   * @function
   * @desc 안드버전 4.4 이면 true 반환
   * @returns {boolean}
   */
  _isLowerVersionAndroid: function () {
    var androidVersion = Tw.BrowserHelper.getAndroidVersion();
    return androidVersion && androidVersion.indexOf('4.4') !== -1;
  },


}

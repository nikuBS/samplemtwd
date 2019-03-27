/**
 * FileName: customer.uscan.service.js
 * Author: Kirim Lee (kirim@sk.com)
 * Date: 2019. 03. 28
*/
Tw.CustomerUscanService = function () {
  this._popupService = Tw.PopupService;
  this._apiService = Tw.Api;
  this._history = new Tw.HistoryService();
  this._init();
}

Tw.CustomerUscanService.prototype = {
  _init: function () {

  },

  requestUscan: function (option) {
    this.type = option.type;
    this.request = option.request;
    this.files = option.files;
    this.$target = option.$target;
    this.Upload = option.Upload;

    // 파일 있음
    if ( Tw.BrowserHelper.isApp() && this._isLowerVersionAndroid() ) {
      this._requestUscan(_.compact(this.files));
    } else {
      this.Upload.uploadFile(this.files, $.proxy(this._requestUscan, this));
    }
  },

  // 보낼 곳
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
        proMemo: '', 
        scanFiles: this._getConvFileList(res.result)
      }).done($.proxy(this._onSuccessUscanUpload, this))
        .fail($.proxy(this._apiError, this.$target));
  },

  // 파일 형식 변환
  _getConvFileList: function (result) {
    return result.length ? _.map(result, function(file){
      return {
        fileSize: file.size,
        fileName: file.name,
        filePath: file.path
      }
    }): [];
  },

  // 유스캔 업로드 성공 후 전송 실행
  _onSuccessUscanUpload: function (res) {
    if ( res.code === Tw.API_CODE.CODE_00 ) {
      this.request(this.$target);
    } else {
      this._apiError(this.$target, res);
    }
  },

  _apiError: function ($target, res) {
    Tw.Error(res.code, res.msg).pop(null, $target);
  }


}
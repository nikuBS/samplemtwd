/**
 * FileName: customer.email.upload.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.08.14
 */

Tw.CustomerEmailUpload = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;

  this._cachedElement();
  this._bindEvent();
  this._init();

  this.$inputFile = null;
};

Tw.CustomerEmailUpload.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-upload-file', $.proxy(this._showUploadPopup, this));
  },

  _showUploadPopup: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.open({
      hbs: 'file',
      title: Tw.POPUP_TITLE.UPLOAD_FILE,
      inputfile_num: [
        { 'attr': 'name="file"' },
        { 'attr': 'name="file"' },
        { 'attr': 'name="file"' },
        { 'attr': 'name="file"' },
        { 'attr': 'name="file"' }
      ],
      warning_msg: [
        { 'txt': Tw.UPLOAD_FILE.WARNING_A01, 'point': '' },
        { 'txt': Tw.UPLOAD_FILE.WARNING_A02, 'point': '' },
        { 'txt': Tw.UPLOAD_FILE.WARNING_A03, 'point': 'bold' }
      ],
      bt_num: 'two',
      type: [{
        style_class: 'bt-white2 fe-upload-multi-cancel',
        txt: Tw.BUTTON_LABEL.CANCEL
      }, {
        style_class: 'bt-red1 fe-upload-multi-confirm',
        txt: Tw.BUTTON_LABEL.CONFIRM
      }]
    }, $.proxy(this._openUploadFile, this), $.proxy(this._closeUploadFile, this));
  },
  _openUploadFile: function ($popupContainer) {
    $popupContainer.on('click', '.fe-upload-multi-cancel', $.proxy(this._cancelUploadMulti, this));
    $popupContainer.on('click', '.fe-upload-multi-confirm', $.proxy(this._confirmUploadMulti, this));

    this.$inputFile = $popupContainer.find('input[name=file]');
  },
  _closeUploadFile: function () {

  },
  _cancelUploadMulti: function () {
    this._popupService.close();
  },

  _confirmUploadMulti: function () {
    //TODO UPLOAD FILELIST
    var formData = new FormData();
    _.map(this.$inputFile, $.proxy(function (file) {
      if ( file.files.length !== 0 ) {
        formData.append('file', file.files[0]);
      }
    }, this));

    this._apiService.requestForm(Tw.NODE_CMD.UPLOAD_FILE, formData)
      .done($.proxy(this._successUploadFile, this))
      .fail($.proxy(this._failUploadFile, this));
  },
  _successUploadFile: function (resp) {
    console.log('response', resp);
    this._popupService.close();
  },
  _failUploadFile: function (err) {
    console.log(err);
  }
};
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
};

Tw.CustomerEmailUpload.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-upload-file', $.proxy(this._showUploadPopup, this));
    this.$container.on('click', '.fe-upload-multi-cancel', $.proxy(this._cancelUploadMulti, this));
    this.$container.on('click', '.fe-upload-multi-confirm', $.proxy(this._confirmUploadMulti, this));
  },

  _showUploadPopup: function (e) {
    e.preventDefault();
    e.stopPropagation();

    this._popupService.open({
      hbs: 'file',
      title: Tw.POPUP_TITLE.UPLOAD_FILE,
      inputfile_num: [
        { 'attr': 'name="file1"' },
        { 'attr': 'name="file2"' },
        { 'attr': 'name="file3"' },
        { 'attr': 'name="file4"' },
        { 'attr': 'name="file5"' }
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
    });
  },

  _cancelUploadMulti: function () {
    this._popupService.close();
  },

  _confirmUploadMulti: function () {
    //TODO UPLOAD FILELIST
    this._popupService.close();
  }
};
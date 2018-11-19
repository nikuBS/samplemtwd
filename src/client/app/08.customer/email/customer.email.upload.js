/**
 * FileName: customer.email.upload.js
 * Author: Jiman Park (jiman.park@sk.com)
 * Date: 2018.11.16
 */

Tw.CustomerEmailUpload = function (rootEl) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._history = new Tw.HistoryService();

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerEmailUpload.prototype = {
  _init: function () {
  },

  _cachedElement: function () {
    this.$file_upload = $('.fe-upload-file');
    this.tpl_upload_file = Handlebars.compile($('#tpl_upload_file').html());
  },

  _bindEvent: function () {
    this.$container.on('click', '.fe-upload-file', $.proxy(this._showUploadPopup, this));
    this.$container.on('click', '.fe-close-upload', $.proxy(this._hideUploadPopup, this));
  },

  _showUploadPopup: function () {
  },

  _hideUploadPopup: function () {
    $('.fe-wrap-file-upload').remove();
  }
};


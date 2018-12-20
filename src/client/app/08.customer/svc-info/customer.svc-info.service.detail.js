/**
 * FileName: customer.svc-info.service.detail.js
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018. 12. 20
 */
Tw.CustomerSvcinfoServiceDetail = function (rootEl, data) {
  this.$container = rootEl;
  this.data = data ? JSON.parse(data) : '';
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService(rootEl);
  this._hash = Tw.Hash;

  this._cachedElement();
  this._bindEvent();

  this._init();
};

Tw.CustomerSvcinfoServiceDetail.prototype = {
  _cachedElement: function () {
    this.$selectBtn = this.$container.find('#fe-select-btn'); // type A
  },
  _init: function () {
    this.rootPathName = this._historyService.pathname;
    this.queryParams = Tw.UrlHelper.getQueryParams();
  },
  _bindEvent: function () {
    this.$selectBtn.on('click', $.proxy(this._typeActionSheetOpen, this));
  },

  _typeActionSheetOpen: function (e) {
    this._popupService.open({
      hbs: 'actionsheet01',// hbs의 파일명
      layer: true,
      title: null,
      data: this._getOptions(this.data.list),
      btnfloating: {
        txt: Tw.BUTTON_LABEL.CLOSE,
        class: 'tw-popup-closeBtn'
      }
    }, $.proxy(this._ActionSheetBindEvent, this), $.proxy(this._closeSelect, this));
  },

  _getOptions: function (obj) {
    return {
      data: {
        list: obj.map(function(el){
          return {
            txt: el.dep_title,
            // option: 'checked', 
            'radio-attr': 'name="selectType" value="'+ el.code +'"'
          }
        })
      }
    }
  },

  _ActionSheetBindEvent: function ($container) {
    this.$selectButtons = $container.find('.ac-list>li');
    
    // 현재 값 선택
    var code = this.queryParams.code;
    this.$selectButtons.find('input').filter(function(){
      return $(this).val() === code;
    }).prop('checked', true);
    
    // 이벤트 바인드
    this.$selectButtons.on('click', $.proxy(this._setActionSheetValue, this));
  },

  _closeSelect: function () {
    this._popupService.close();
  },

  _setActionSheetValue: function (e) {
    var listIndex = this.queryParams.listIndex, 
      subIndex = this.queryParams.subIndex;
    // check
    this.$selectButtons.find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true);

    // popup close
    this._popupService.close();

    // 
    this._moveDetailPage(
      listIndex,
      subIndex,
      $(e.currentTarget).find('input').val()
    );
  },

  _moveDetailPage: function (listIndex, subIndex, code) {
    // TODO code 값이 url 일때를 고려
    var targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    this._historyService.goLoad(targetURL + '?listIndex='+ listIndex +'&subIndex='+ subIndex +'&code=' + code);
  }
};
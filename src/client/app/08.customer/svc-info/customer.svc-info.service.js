/**
 * @file customer.svc-info.service.js
 * @author Lee Kirim (kirim@sk.com)
 * @since 2018. 12. 20
 */
Tw.CustomerSvcinfoService = function (rootEl, data) {
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

Tw.CustomerSvcinfoService.prototype = {
  _init : function() {
    this.rootPathName = this._historyService.pathname;
  },
  _cachedElement: function () {
    this.$selectBtn = this.$container.find('.fe-select-box'); // 셀렉트 박스 열기
    this.$selectConfirm = this.$container.find('.fe-select-btn'); // 셀렉트 확정
    this.$moveBtn = this.$container.find('.fe-move-btn'); // 바로 이동
  },
  _bindEvent: function () {
    this.$selectBtn.on('click', $.proxy(this._typeActionSheetOpen,this));
    this.$selectConfirm.on('click', $.proxy(this._moveEvent, this));
    this.$moveBtn.on('click', $.proxy(this._moveEvent, this));
  },

  _typeActionSheetOpen: function (e) {
    var selectIndex = $(e.currentTarget).data('selectIndex');
    var selectSubdex =  $(e.currentTarget).data('selectSubdex');
    
    if(Tw.FormatHelper.isEmpty(selectIndex) || Tw.FormatHelper.isEmpty(selectSubdex)) {
      return ;
    }
    this.$curConfirmBtn = this.$selectConfirm.filter(function(){
      return $(this).data('selectIndex') === selectIndex && $(this).data('selectSubdex') === selectSubdex;
    });
    this.$curSelectBtn = this.$selectBtn.filter(function(){
      return $(this).data('selectIndex') === selectIndex && $(this).data('selectSubdex') === selectSubdex;
    });
    this._popupService.open({
      hbs: 'actionsheet01',// hbs의 파일명
      layer: true,
      title: this.data.list[selectIndex].sub_list[selectSubdex].sub_title,
      data: this._getOptions(this.data.list[selectIndex].sub_list[selectSubdex].dep_list),
      btnfloating: {
        txt: Tw.BUTTON_LABEL.CLOSE,
        'class': 'tw-popup-closeBtn'
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
            'radio-attr': 'name="selectType" value="'+ el.code +'" id="radio'+el.code+'"',
            'label-attr': 'for="radio'+el.code+'"'
          };
        })
      }
    };
  },

  _ActionSheetBindEvent: function ($container) {
    this.$selectButtons = $container.find('.ac-list>li');

    // check 
    var code = this.$curConfirmBtn.data('listCode').toString();
    this.$selectButtons.find('input').filter(function(){
      return $(this).val() === code;
    }).prop('checked', true);

    // event
    this.$selectButtons.on('click', $.proxy(this._setActionSheetValue, this));
    $container.find('.ac-list>li label').on('click', $.proxy(this._noDefaultEvent, this));
  },
  
  _noDefaultEvent: function(e) {
    e.preventDefault();
  },

  _closeSelect: function () {
    this._popupService.close();
  },

  _setActionSheetValue: function (e) {
    // check
    this.$selectButtons.find('input').prop('checked', false);
    $(e.currentTarget).find('input').prop('checked', true);

    // text
    this.$curSelectBtn.text($(e.currentTarget).find('.txt').text().trim());

    // popup close
    this._popupService.close();

    // 
    this.$curConfirmBtn.data('listCode', $(e.currentTarget).find('input').val());
  },

  _moveEvent: function (e) {
    this._moveDetailPage( $(e.currentTarget).data('listCode') );
  },

  _moveDetailPage: function (code) {
    var targetURL = this.rootPathName.slice(-1) === '/' ? this.rootPathName.split('/').slice(0, -1).join('/') : this.rootPathName;
    if (code.indexOf('url:') >= 0) {
      this._historyService.goLoad(code.replace('url:', ''));
    } else {
      this._historyService.goLoad(targetURL + '/detail?code=' + code);
    }
  }
};

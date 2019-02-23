/**
 * FileName: customer.svc-info.notice.js
 * Author: Ji Hun Yang (jihun202@sk.com)
 * Date: 2018.10.23
 */

Tw.CustomerSvcInfoNotice = function(rootEl, category, ntcId, tworldChannel) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this._historyService = new Tw.HistoryService();

  this._template = Handlebars.compile($('#tpl_notice_list_item').html());
  this._category = category;
  this._ntcId = ntcId;
  this._tworldChannel = tworldChannel;
  this._setContentsList = [];
  this._page = 1;

  this._cachedElement();
  this._bindEvent();
  this._init();
};

Tw.CustomerSvcInfoNotice.prototype = {
  API_CMD: {
    tworld: 'BFF_08_0029',
    directshop: 'BFF_08_0039',
    membership: 'BFF_08_0031',
    roaming: 'BFF_08_0040'
  },

  _cachedElement: function() {
    this.$list = this.$container.find('.fe-list');
    this.$btnCategory = this.$container.find('.fe-btn_category');
    this.$btnMoreList = this.$container.find('.fe-btn_more_list');
  },

  _bindEvent: function() {
    this.$list.on('cssClassChanged', 'li.acco-box', $.proxy(this._setContentsReq, this));
    this.$btnCategory.on('click', $.proxy(this._openCategorySelectPopup, this));
    this.$btnMoreList.on('click', $.proxy(this._loadMoreList, this));

    var originalAddClassMethod = $.fn.addClass;

    $.fn.addClass = function() {
      $(this).trigger('cssClassChanged');

      return originalAddClassMethod.apply( this, arguments );
    };
  },

  _init: function() {
    if (Tw.FormatHelper.isEmpty(this._ntcId)) {
      return;
    }

    var item = this.$list.find('[data-ntc_id="' + this._ntcId  + '"]');
    if (item.length > 0) {
      setTimeout(function() {
        $.when(item.find('button').trigger('click'))
          .then(function() {
            $(window).scrollTop(item.offset().top - $('#header').height());
          });
      }, 100);
    }
  },

  _setContentsReq: function(e) {
    if (this._category !== 'tworld') {
      return;
    }

    var ntcId = parseInt($(e.currentTarget).data('ntc_id'), 10);
    if (this._setContentsList.indexOf(ntcId) !== -1) {
      return;
    }

    this._historyService.replacePathName(window.location.pathname + '?ntcId=' + ntcId);
    this._apiService.request(Tw.API_CMD.BFF_08_0029, { expsChnlCd: this._tworldChannel, ntcId: ntcId })
      .done($.proxy(this._setContentsRes, this));
  },

  _setContentsRes: function(resp) {
    if (resp.code !== Tw.API_CODE.CODE_00) {
      return Tw.Error(resp.code, resp.msg).pop();
    }

    this._setContentsList.push(parseInt(resp.result.ntcId, 10));
    this.$list.find('[data-ntc_id="' + resp.result.ntcId + '"] .notice-txt').html(this._fixHtml(resp.result.ntcCtt));
  },

  _getApi: function() {
    return Tw.API_CMD[this.API_CMD[this.$container.data('category')]];
  },

  _openCategorySelectPopup: function() {
    this._isCategoryMove = false;
    this._popupService.open({
      hbs:'actionsheet01',
      layer:true,
      data:[
        {
          'list':[
            { 'label-attr': 'id="ra1"', 'txt': Tw.NOTICE.TWORLD,
              'radio-attr':'id="ra1" data-category="tworld" ' + (this._category === 'tworld' ? 'checked' : '') },
            { 'label-attr': 'id="ra2"', 'txt': Tw.NOTICE.DIRECTSHOP,
              'radio-attr':'id="ra2" data-category="directshop" ' + (this._category === 'directshop' ? 'checked' : '') },
            { 'label-attr': 'id="ra3"', 'txt': Tw.NOTICE.MEMBERSHIP,
              'radio-attr':'id="ra3" data-category="membership" ' + (this._category === 'membership' ? 'checked' : '') },
            { 'label-attr': 'id="ra4"', 'txt': Tw.NOTICE.ROAMING,
              'radio-attr':'id="ra4" data-category="roaming" ' + (this._category === 'roaming' ? 'checked' : '') }
          ]
        }
      ],
      btnfloating : {'attr': 'type="button"', 'class': 'tw-popup-closeBtn', 'txt': Tw.BUTTON_LABEL.CLOSE}
    }, $.proxy(this._categoryPopupBindEvent, this), $.proxy(this._goCategory, this), 'notice_category');
  },

  _goCategory: function() {
    if (!this._isCategoryMove) {
      return;
    }

    this._historyService.goLoad('/customer/svc-info/notice?category=' + this._category);
  },

  _categoryPopupBindEvent: function($layer) {
    $layer.on('click', '[data-category]', $.proxy(this._applyCategory, this));
  },

  _applyCategory: function(e) {
    this._isCategoryMove = true;
    this._category = $(e.currentTarget).data('category');
    this._popupService.close();
  },

  _loadMoreList: function() {
    Tw.CommonHelper.startLoading('.container', 'grey', true);

    var customParams = {};
    if (this._category === 'tworld') {
      customParams.expsChnlCd = this._tworldChannel;
    }

    this._apiService.request(this._getApi(), $.extend(customParams, { page: this._page, size: 20 }))
      .done($.proxy(this._appendMoreList, this))
      .fail(Tw.CommonHelper.endLoading('.container'));
  },

  _getRemainCount: function(param) {
    var count = param.total - ((++this._page) * param.size);
    return count < 0 ? 0 : count;
  },

  _appendMoreList: function(res) {
    Tw.CommonHelper.endLoading('.container');
    if (res.code !== Tw.API_CODE.CODE_00) {
      return this._apiError(res);
    }

    this.$container.find('.acco-tit button').off();
    this.$list.append(this._template({
      list: _.map(res.result.content, $.proxy(this._convertItem, this))
    }));

    skt_landing.widgets.widget_init('.wrap');

    if (res.result.last) this.$btnMoreList.remove();
    else {
      this.$btnMoreList.find('span').text('(' + this._getRemainCount({
        total: res.result.totalElements,
        size: res.result.pageable.pageSize
      })  + ')');
    }
  },

  _convertItem: function(item) {
    return $.extend(item, {
      title: this._category === 'tworld' ? item.ntcTitNm : item.title,
      type: this._setItemType(item),
      date: this._setDate(item),
      itemClass: this._setItemClass(item),
      content: Tw.FormatHelper.isEmpty(item.content)? null : this._fixHtml(item.content)
    });
  },

  _setDate: function(item) {
    if (this._category === 'tworld') {
      return Tw.DateHelper.getShortDateWithFormat(item.auditDtm, 'YYYY.M.D.');
    }

    return Tw.DateHelper.getShortDateWithFormat(item.rgstDt, 'YYYY.M.D.');
  },

  _setItemType: function(item) {
    if (this._category === 'tworld') {
      return Tw.FormatHelper.isEmpty(Tw.CUSTOMER_NOTICE_CTG_CD[item.ntcCtgCd]) ? null : Tw.CUSTOMER_NOTICE_CTG_CD[item.ntcCtgCd];
    }

    return Tw.FormatHelper.isEmpty(item.ctgNm) ? '' : item.ctgNm;
  },

  _setItemClass: function(item) {
    if (this._category === 'tworld') {
      return (item.ntcTypCd === 'Y' ? 'impo ' : '') + (item['new'] ? 'new' : '');
    }

    return (item.isTop ? 'impo ' : '') + (item.isNew ? 'new' : '');
  },

  _fixHtml: function(html) {
    var doc = document.createElement('div');
    doc.innerHTML = html;

    return doc.innerHTML;
  },

  _apiError: function (res) {
    this._popupService.openAlert(res.code + ' ' + res.msg);
    return false;
  }

};

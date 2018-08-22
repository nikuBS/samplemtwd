/**
 * FileName: customer.faq.category.js (CI_11_02, CI_11_03)
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.08.21
 */

Tw.CustomerFaqCategory = function (rootEl, rootCat, depth1, depth2) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._depth1obj = depth1;
  this._depth2obj = depth2;

  // 1: typeA - has one depth, 2: typeB - has two depth
  this._type = depth2.length === 0 ? 1 : 2;

  this._rootCategoryCode = rootCat;
  this._depth1code = this._type === 1 ? '0' : depth1[0].ifaqGrpCd;
  this._depth2code = '0';

  this._title = this.$container.find('.header h1').text();

  this._currentPage = 0;

  this._faqItemTemplate = Handlebars.compile($('#tpl_faq_result_item').html());

  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerFaqCategory.prototype = {
  _cacheElements: function () {
    this.$btnDepth1 = this.$container.find('.fe-btn-depth1');
    this.$btnDepth2 = this.$container.find('.fe-btn-depth2');
    this.$result = this.$container.find('.fe-result');
    this.$btnMore = this.$container.find('.fe-more');
  },
  _bindEvents: function () {
    this.$container.on('click', '.bt-dropdown', $.proxy(this._onDropDown, this));
    this.$btnMore.on('click', $.proxy(this._loadData, this, false));
  },
  _onDropDown: function (evt) {
    var selectList = {
      title: ''
    };

    var popupTitle = this._title;
    var isDepth2 = false;

    if ($(evt.currentTarget).hasClass('fe-btn-depth1')) {
      selectList.options = _.map(this._depth1obj, function (item) {
        return { title: '', checked: false, value: item.ifaqGrpCd, text: item.ifaqGrpNm };
      });
      if (this._type === 1) {
        selectList.options.unshift({
          title: '', checked: false, value: '0', text: Tw.POPUP_PROPERTY.ALL
        });
      }
    } else {
      selectList.options = _.map(this._depth2obj, function (item) {
        return { title: '', checked: false, value: item.ifaqGrpCd, text: item.ifaqGrpNm };
      });
      selectList.options.unshift({
        title: '', checked: false, value: '0', text: Tw.POPUP_PROPERTY.ALL
      });
      popupTitle = this.$btnDepth1.text();
      isDepth2 = true;
    }
    this._popupService.open({
        hbs: 'select',
        title: popupTitle,
        multiplex: false,
        close_bt: false,
        select: [selectList],
        bt_num: 'one',
        type: [{
          style_class: 'bt-red1',
          txt: Tw.BUTTON_LABEL.CONFIRM
        }]
      }, $.proxy(this._onDepthPopupOpened, this, isDepth2));
  },
  _onDepthPopupOpened: function (isDepth2, container) {
    var codeToFind = isDepth2 ? this._depth2code : this._depth1code;
    container.find('input[type=radio][value=' + codeToFind + ']').click();

    var selected = {
      isDepth2: isDepth2,
      code: '',
      name: ''
    };

    container.on('change', 'input[type=radio]', $.proxy(function (evt) {
      selected.code = evt.currentTarget.value;
      selected.name = evt.currentTarget.nextSibling.data.trim();
    }, this));
    container.on('click', '.bt-red1 > button', $.proxy(function () {
      this._popupService.close();
      if (!Tw.FormatHelper.isEmpty(selected.code)) {
        this._reloadIfNeeded(selected);
      }
    }, this));
  },
  _reloadIfNeeded: function (selected) {
    // If selected values are not changed, just keep the current list
    if ((selected.isDepth2 && this._depth2code === selected.code) ||
         (!selected.isDepth2 && this._depth1code === selected.code)) {
      return;
    }

    if (selected.isDepth2) {
      this._depth2code = selected.code;
      this.$btnDepth2.text(selected.name);
    } else {
      this._depth1code = selected.code;
      this.$btnDepth1.text(selected.name);
    }

    this.$result.empty();
    if (!selected.isDepth2) {
      this._depth2code = '0';
      this._loadDepth2();
    }
    this._loadList(true);
  },
  _loadDepth2: function () {
    this._apiService.request(Tw.API_CMD.BFF_08_0051, { ifaqGrpCd: this._depth1code })
      .done($.proxy(function (res) {
        if (res.code === Tw.API_CODE.CODE_00) {
          this._depth2obj = res.result.faq1DepthGrp;
          this.$btnDepth2.text(Tw.POPUP_PROPERTY.ALL);
        } else {
          this._popupService.openAlert(res.code + ' ' + res.msg);
        }
      }, this))
      .fail($.proxy(function (err) {
        this._popupService.openAlert(err.code + ' ' + err.msg);
      }, this));
  },
  _loadList: function (isReload) {
    var code = this._rootCategoryCode;
    var depth = 2;

    if (this._type === 1) {
      if (this._depth1code !== '0') {
        code = this._depth1code;
        depth = 3;
      }
    } else {
      if (this._depth2code === '0') {
        code = this._depth1code;
      } else {
        code = this._depth2code;
        depth = 3;
      }
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0052, {
      faqDepthGrpCd: code,
      faqDepthCd: depth,
      page: isReload ? 0 : this._currentPage + 1,
      size: 20
    }).done($.proxy(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {
        if (!isReload) {
          this._currentPage++;
        }
        this._onDataReceived(res.result, isReload);
      } else {
        this._popupService.openAlert(res.code + ' ' + res.msg);
      }
    }, this)).fail($.proxy(function (err) {
      this._popupService.openAlert(err.code + ' ' + err.msg);
    }, this));
  },
  _onDataReceived: function (result, isReload) {
    if (result.last) {
      this.$btnMore.addClass('none');
    }

    this.$result.append(this._faqItemTemplate({
      list: result.content
    }));

    if (isReload) {
      this.$result.find('li').first().addClass('on');
    }
  }
};

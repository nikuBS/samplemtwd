/**
 * FileName: myt-fare.history.common.board.js
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018. 9. 27
 */
Tw.MyTFareHistoryCommonBoard = function (rootEl) {
  this.$container = rootEl;
};

Tw.MyTFareHistoryCommonBoard.prototype = {
  _init: function (data, wrapper, template, helper, keyword, perPage, viewMoreSelector, listWrapperSelector, callBack) {

    this.compiler = Handlebars.compile;

    this.data = data;
    this.wrapper = wrapper;

    this.template = template;
    this.helper = helper;
    this.particalKeyword = keyword.partial || 'list';
    this.listTemplateKeyword = keyword.list;
    this.restButtonTemplateKeyword = keyword.restButton;
    this.viewMoreSelector = viewMoreSelector;
    this.listWrapperSelector = listWrapperSelector;

    this.perPage = perPage;
    this.currentPage = 0;
    this.callBack = callBack;

    /*
    data
    wrapper : 리스트 삽입 wrapper
    template = {
      wrapper :
      list :
      empty :
    }
    helper = {
      wrapper :
      list :
      empty :
    }
    keyword = {
      handlebar template 매칭된 키워드
      ex) {{#each page}}
      list : page
      restCount : restCount
    }
    perPage : page 당 list 수
    callBack
    */

    if (!data || !_.isObject(data)) {
      Tw.Logger.error('[payment/point/common] template : data error');
      return false;
    }
    if (!template || !_.isObject(template)) {
      Tw.Logger.error('[payment/point/common] common/template : template error');
      return false;
    }

    this._setTemplate();

    if (!this._isEmptyList()) {
      this._setHelper();
      this._buildListUI();
    } else {
      this._buildEmptyUI();
    }
  },

  _setTemplate: function () {
    this.listWrapperTemplate = this.template.wrapper ? this.compiler(this.template.wrapper.html()) : null;
    this.listTemplate = this.template.list ? this.compiler(this.template.list.html()) : null;
    this.emptyTemplate = this.template.empty ? this.compiler(this.template.empty.html()) : null;
  },

  _setHelper: function () {
    if (this.helper && _.isObject(this.helper)) {
      _.mapObject(this.helper, function (f, key) {
        Handlebars.registerHelper(key, f);
      });
    }
  },

  _buildListUI: function () {
    this.updateNextPageData();
    Handlebars.registerPartial(this.particalKeyword, this.listTemplate(this.data));

    if (this.data.result.length > this.perPage) {
      this.data.initialMoreData = true;
      this.data[this.restButtonTemplateKeyword] = this.getRestCounter();
      this.wrapper.off().on('click', this.viewMoreSelector, $.proxy(this.viewMoreHandler, this));
    } else {
      this.data.initialMoreData = false;
    }

    this.wrapper.empty().append(this.listWrapperTemplate(this.data));

    if (this.callBack) this.callBack();
  },

  _appendNextListUI: function (target) {
    this.currentPage++;
    this.updateNextPageData();

    if (!this.listWrapperSelector) {
      $(this.listTemplate(this.data)).insertBefore(target.parent());
    } else {

      this.listWrapper = this.listWrapper || this.wrapper.find(this.listWrapperSelector);

      if (this.listWrapper.length) {
        this.isULOL = (this.listWrapper.get(0).nodeName === 'UL') || (this.listWrapper.get(0).nodeName === 'OL');
      }

      if (!this.isULOL)
        $(this.listTemplate(this.data)).insertBefore(this.$container.find(this.listWrapperSelector));
      else
        this.listWrapper.append(this.listTemplate(this.data));
    }

    if (this.data.result.length <= this.perPage * (this.currentPage + 1)) {
      target.hide();
    }

    if (this.callBack) this.callBack();

    this.updateRestCounter(target);
  },

  _isEmptyList: function () {
    return this.data.result !== undefined && !this.data.result.length;
  },

  _buildEmptyUI: function () {
    this.wrapper.empty().append(this.emptyTemplate(this.data));
  },

  viewMoreHandler: function (e) {
    e.preventDefault();
    this._appendNextListUI($(e.target));
  },

  updateNextPageData: function () {
    this.data[this.listTemplateKeyword] = this.data.result.slice(
        this.perPage * this.currentPage,
        !this.currentPage ? this.perPage : (this.currentPage + 1) * this.perPage);
  },

  getRestCounter: function () {
    return this.data.result.length - (this.currentPage + 1) * this.perPage;
  },

  updateRestCounter: function (target) {
    target.find('span em').text(this.getRestCounter());
  }
};
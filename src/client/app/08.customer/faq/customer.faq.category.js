/**
 * @file customer.faq.category.js
 * @author Hakjoon Sim (hakjoon.sim@sk.com)
 * @since 2018.12.02
 */

Tw.CustomerFaqCategory = function (rootEl, title, rootCat, depth1, depth2) {
  this.$container = rootEl;

  this._popupService = Tw.Popup;
  this._apiService = Tw.Api;

  this._depth1obj = JSON.parse(depth1);
  this._depth2obj = JSON.parse(depth2);

  // 1: typeA - has one depth, 2: typeB - has two depth
  this._type = Tw.FormatHelper.isEmpty(this._depth2obj) ? 1 : 2;

  this._ALL = '999';
  this._rootCategoryCode = rootCat;
  this._depth1code = this._type === 1 ? this._ALL : this._depth1obj[0].ifaqGrpCd;
  this._depth2code = this._ALL;

  this._title = title;

  this._currentPage = 0;

  this._faqItemTemplate = Handlebars.compile($('#tpl_faq_result_item').html());

  this._cacheElements();
  this._bindEvents();
};

Tw.CustomerFaqCategory.prototype = {
  _cacheElements: function () {
    this.$btnDepth1 = this.$container.find('#fe-btn-depth1');
    this.$btnDepth2 = this.$container.find('#fe-btn-depth2');
    this.$result = this.$container.find('#fe-result');
    this.$btnMore = this.$container.find('#fe-more');
  },
  _bindEvents: function () {
    this.$btnDepth1.on('click', $.proxy(this._onDropDownClicked, this, 1));
    this.$btnDepth2.on('click', $.proxy(this._onDropDownClicked, this, 2));
    this.$btnMore.on('click', $.proxy(this._loadList, this));
    this.$container.on('click', '.fe-link-external', $.proxy(this._onExternalLink, this));
  },
  _onDropDownClicked: function (depth) {
    var data = depth === 1 ? this._depth1obj : this._depth2obj;
    if (depth === 2) {
      data = _.filter(data, $.proxy(function (item) {
        return item.supIfaqGrpCd === this._depth1code;
      }, this));
    }
    var list = _.map(data, $.proxy(function (item) {
      var ret = {
        txt: item.ifaqGrpNm,
        'label-attr': 'id="' + item.ifaqGrpCd + '"',
        'radio-attr': 'id="' + item.ifaqGrpCd + '" name="r2" value="' + item.ifaqGrpCd +
          '" title="' + item.ifaqGrpNm + '"'
      };
      if (depth === 1 && this._depth1code === item.ifaqGrpCd) {
        ret['radio-attr'] += ' checked';
      } else if (depth === 2 && this._depth2code === item.ifaqGrpCd) {
        ret['radio-attr'] += ' checked';
      }
      return ret;
    }, this));

    if (this._type === 1 || depth === 2) {
      var all = {
        txt: Tw.COMMON_STRING.ALL,
        'label-attr': 'id=999',
        'radio-attr': 'id="999" name="r2" value="999" title="' + Tw.COMMON_STRING.ALL + '"'
      };
      if (depth === 1 && this._depth1code === this._ALL) {
        all['radio-attr'] += ' checked';
      }
      if (depth === 2 && this._depth2code === this._ALL) {
        all['radio-attr'] += ' checked';
      }

      list.splice(0, 0, all);
    }

    this._popupService.open({
      hbs: 'actionsheet01',
      layer: true,
      title: this._title,
      data: [{
        list: list
      }],
      btnfloating: { attr: 'type="button"', txt: Tw.BUTTON_LABEL.CLOSE }
    }, $.proxy(function ($root) {
      $root.on('click', '.btn-floating', $.proxy(function () {
        this._popupService.close();
      }, this));
      $root.on('click', 'input[type=radio]', $.proxy(function (e) {
        var $checked = $(e.currentTarget);
        this._onCategoryChanged(depth, $checked.attr('title'), $checked.val());
      }, this));
    }, this));
  },
  _onCategoryChanged: function (depth, title, value) {
    this._popupService.close();
    switch (depth) {
      case 1:
        if (value !== this._depth1code) {
          this._depth1code = value;
          this.$btnDepth1.text(title);
          this._depth2code = this._ALL;
          this.$btnDepth2.text(Tw.COMMON_STRING.ALL);
          this._currentPage = -1;
          var depth2list = _.filter(this._depth2obj, $.proxy(function (item) {
            return item.supIfaqGrpCd === this._depth1code;
          }, this));
          if (depth2list.length) {
            this.$btnDepth2.removeClass('none');
          } else {
            this.$btnDepth2.addClass('none');
          }
          this._loadList();
        }
        break;
      case 2:
      if (value !== this._depth2code) {
        this._depth2code = value;
        this.$btnDepth2.text(title);
        this._currentPage = -1;
        this._loadList();
      }
        break;
      default:
        break;
    }
  },
  _loadList: function () {
    var code, depth;

    if (this._type === 1) {
      if (this._depth1code !== this._ALL) {
        code = this._depth1code;
        depth = 3;
      } else {
        code = this._rootCategoryCode;
        depth = 2;
      }
    } else {
      if (this._depth2code !== this._ALL) {
        code = this._depth2code;
        depth = 3;
      } else {
        code = this._depth1code;
        depth = 2;
      }

      var depth2list = _.filter(this._depth2obj, $.proxy(function (item) {
        return item.supIfaqGrpCd === this._depth1code;
      }, this));
      if (depth2list.length === 0) {
        depth = 3;
      }
    }

    this._apiService.request(Tw.API_CMD.BFF_08_0052, {
      faqDepthGrpCd: code,
      faqDepthCd: depth,
      page: this._currentPage + 1,
      size: 20
    }).done($.proxy(function (res) {
      if (res.code === Tw.API_CODE.CODE_00) {
        this._currentPage++;
        this._onDataReceived(res.result);
      } else {
        Tw.Error(res.code, res.msg).pop();
      }
    }, this)).fail(function (err) {
      Tw.Error(err.code, err.msg).pop();
    });
  },
  _onDataReceived: function (result) {
    if (result.last) {
      this.$btnMore.addClass('none');
    } else {
      this.$btnMore.removeClass('none');
    }

    if (this._currentPage === 0) {
      this.$result.empty();
    }

    this.$result.append(this._faqItemTemplate({
      list: result.content
    }));
  },
  _onExternalLink: function (e) {
    var url = $(e.currentTarget).attr('href');
    Tw.CommonHelper.openUrlExternal(url);

    return false;
  }
};

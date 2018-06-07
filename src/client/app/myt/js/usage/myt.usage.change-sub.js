Tw.MytUsageChangeSub = function () {
  this._apiService = new Tw.ApiService();

  this._init();
  this._cachedElement();
  this._bindEvent();
}

Tw.MytUsageChangeSub.prototype = {
  _init: function () {
    this.originList   = [];
    this.selectList   = [];
    this.categoryList = [];
    this.sortType     = 'register';
    this.category     = 'all';
  },

  _cachedElement: function () {
    this.$popupContainer   = $('.pop-container');
    this.$container        = $('#usage_change_sub');
    this.$wrap_list        = this.$container.find('#sorted_list');
    this.$select_sort      = this.$container.find('#sort_type');
    this.$wrap_category    = this.$container.find('#wrap_category');
    this.$btn_previous     = this.$container.find('.btn_previous');
    this.tpl_line_items    = _.template($('#tpl_line_items').html());
    this.tpl_line_category = _.template($('#tpl_line_category').html());
  },

  _bindEvent: function () {
    this.$popupContainer.on('openSubView', $.proxy(this.openSubView, this));
    this.$popupContainer.on('hideSubView', $.proxy(this.hideSubView, this));
    this.$container.on('click', 'button', $.proxy(this.onChangeCategory, this));
    this.$container.on('click', '.row', $.proxy(this.choiceLine, this));
    this.$btn_previous.on('click', $.proxy(this.onClickPrevious, this));
    this.$select_sort.on('change', $.proxy(this.changeSort, this));
  },

  onLoadData: function () {
    this._apiService.request(Tw.API_CMD.BFF_03_0003, { svcCtg: this.groupType })
      .done($.proxy(this.onSuccessLoadData, this));
  },

  onSuccessLoadData: function (res) {
    this._init();
    this.originList = res.result;

    this.renderCategoryArea();
    this.render();
  },

  renderCategoryArea: function () {
    _.filter(this.originList, function (item) {
      if ( this.categoryList.indexOf(item.svcCd) == -1 ) {
        this.categoryList.push(item.svcCd);
      }
    }, this);

    var category_html = this.tpl_line_category({ list: this.categoryList });

    this.$wrap_category.html(category_html);
  },

  choiceLine: function (e) {
    var $elLine    = $(e.currentTarget);
    var svcMgmtNum = $elLine.data('svcmgmtnum');
debugger;
    this._apiService.request(Tw.API_CMD.BFF_03_0004, {}, { headers: { "svcMgmtNum": svcMgmtNum } })
      .done(function () {
        debugger;
        location.href = '/myt';
      });
  },

  changeSort: function (e) {
    var selectSortType = $(e.currentTarget).val();
    this.sortType      = selectSortType;

    this.render();
  },

  onChangeCategory: function (e) {
    var $category        = $(e.currentTarget);
    var $active_category = this.$wrap_category.find('.on');
    $active_category.removeClass('on');
    $category.addClass('on');

    this.category = $category.data('type');
    this.render();
  },

  onClickPrevious: function () {
    this.$popupContainer.trigger('hideSubView');
  },

  openSubView: function (e, params) {
    this.groupName = params.name;
    this.groupType = params.type;

    this.onLoadData();
    this.$container.show();
  },

  render: function () {
    this.sortByCategory();
    this.sortByDate();

    var list_html = this.tpl_line_items({ list: this.selectList });

    this.$wrap_list.html(list_html);

    $('#groupName').text(this.groupName);
    $('#groupName').append(' <span class="count">(' + this.selectList.length + ')</span>');
  },

  hideSubView: function () {
    this.$container.hide();
  },

  sortByCategory: function () {
    if ( this.category == 'all' ) {
      this.selectList = this.originList;
    }

    if ( this.category != 'all' ) {
      this.selectList = _.filter(this.originList, function (item) {
        return item.svcCd == this.category;
      }, this);
    }
  },

  sortByDate: function () {
    if ( this.sortType == 'register' ) {
      this.selectList = this.selectList.sort(function (prevItem, nextItem) {
        var prevDate = Number(prevItem.lastUpdDtm);
        var nextDate = Number(nextItem.lastUpdDtm);
        return prevDate - nextDate;
      });
    }

    if ( this.sortType == 'modified' ) {
      this.selectList = this.selectList.sort(function (prevItem, nextItem) {
        var prevDate = Number(prevItem.svcScrbDtm);
        var nextDate = Number(nextItem.svcScrbDtm);
        return prevDate - nextDate;
      });
    }
  }
}
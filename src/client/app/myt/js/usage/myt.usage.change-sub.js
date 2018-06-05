Tw.MytUsageChangeSub = function () {
  this._init();
  this._cachedElement();
  this._bindEvent();
}

Tw.MytUsageChangeSub.prototype = {
  _init: function () {
    this.originList = sampleList.result;
    this.selectList = [];
    this.sortType   = 'register';
    this.category   = 'all';
  },

  _cachedElement: function () {
    this.$popupContainer   = $('.pop-container');
    this.$container        = $('#usage_change_sub');
    this.$wrap_list        = this.$container.find('#sorted_list');
    this.$select_sort      = this.$container.find('#sort_type');
    this.$wrap_category    = this.$container.find('.toggle-case');
    this.$btn_previous     = this.$container.find('.btn_previous');
    this.tpl_line_items    = _.template($('#tpl_line_items').html());
    this.tpl_line_category = _.template($('#tpl_line_category').html());
  },

  _bindEvent: function () {
    this.$popupContainer.on('openSubView', $.proxy(this.openSubView, this));
    this.$popupContainer.on('hideSubView', $.proxy(this.hideSubView, this));
    this.$container.on('click', 'button', $.proxy(this.onChangeCategory, this));
    this.$btn_previous.on('click', $.proxy(this.onClickPrevious, this));
    this.$container.on('click', '.row', $.proxy(this.choiceLine, this));
    this.$select_sort.on('change', $.proxy(this.changeSort, this));
  },

  choiceLine: function (e) {
    var $elLine = $(e.currentTarget);
    // TODO: change-svc

    history.back();
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
    // TODO : restAPI
    this.render();

    this.$container.show();
  },

  render: function () {
    if ( this.category != 'all' ) {
      this.selectList = _.filter(this.originList, function (item) {
        console.log(this.category);
        console.log(item.svcCd);
        return item.svcCd == this.category;
      }.bind(this));
    } else {
      this.selectList = this.originList;
    }


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

    var html = this.tpl_line_items({ list: this.selectList });

    this.$wrap_list.html(html);
  },

  hideSubView: function () {
    this.$container.hide();
  }
}

var sampleList = {
  code: '00',
  msg: 'success',
  result: [
    {
      svcCd: 'C',
      svcNum: '010-12**-56**',
      svcMgmtNum: '7100000001',
      svcNickNm: '제임스폰',
      repSvcYn: 'Y',
      "svcScrbDtm": "20180605103000",
      "lastUpdDtm": "20180604103000"
    },
    {

      'svcCd': 'C',
      'svcNum': '010-12**-57**',
      'svcMgmtNum': '7100000001',
      'svcNickNm': '써니폰',
      'repSvcYn': 'N',
      "svcScrbDtm": "20180602103000",
      "lastUpdDtm": "20180609103000"
    },
    {
      'svcCd': 'C',
      'svcNum': '010-12**-58**',
      'svcMgmtNum': '7100000001',
      'svcNickNm': '내폰',
      'repSvcYn': 'N',
      "svcScrbDtm": "20180604103000",
      "lastUpdDtm": "20180607103000"
    },
    {
      'svcCd': 'L',
      'svcNum': '010-12**-58**',
      'svcMgmtNum': '7100000001',
      'svcNickNm': '내폰',
      'repSvcYn': 'N',
      "svcScrbDtm": "20180607103000",
      "lastUpdDtm": "20180608103000"
    },
    {
      'svcCd': 'W',
      'svcNum': '010-12**-58**',
      'svcMgmtNum': '7100000001',
      'svcNickNm': '내폰',
      'repSvcYn': 'N',
      "svcScrbDtm": "20180601103000",
      "lastUpdDtm": "20180601103000"
    },
    {
      'svcCd': 'F',
      'svcNum': '010-12**-58**',
      'svcMgmtNum': '7100000001',
      'svcNickNm': '내폰',
      'repSvcYn': 'N',
      "svcScrbDtm": "20180602103000",
      "lastUpdDtm": "20180602103000"
    },
    {
      'svcCd': 'W',
      'svcNum': '010-12**-58**',
      'svcMgmtNum': '7100000001',
      'svcNickNm': '내폰',
      'repSvcYn': 'N',
      "svcScrbDtm": "20180603103000",
      "lastUpdDtm": "20180606103000"
    },
    {
      'svcCd': 'P',
      'svcNum': '010-12**-58**',
      'svcMgmtNum': '7100000001',
      'svcNickNm': '내폰',
      'repSvcYn': 'N',
      "svcScrbDtm": "20180604203000",
      "lastUpdDtm": "20180607203000"
    },
    {
      'svcCd': 'S',
      'svcNum': '010-12**-58**',
      'svcMgmtNum': '7100000001',
      'svcNickNm': '내폰',
      'repSvcYn': 'N',
      "svcScrbDtm": "20180609103000",
      "lastUpdDtm": "20180601103000"
    }
  ]
};
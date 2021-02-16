/**
 * @file roaming.addons.js
 * @desc T로밍 > 로밍 부가서비스
 * @author 황장호
 * @since 2020-09-30
 */

Tw.RoamingAddons = function (rootEl, items, itemsUsing) {
  this.$container = rootEl;
  this.$items = items;
  this.$itemsUsing = itemsUsing;

  this.bindEvents();
  this.fillItems();

  new Tw.RoamingMenu(rootEl).install();
};

Tw.RoamingAddons.prototype = {
  /**
   * 이벤트 핸들러
   */
  bindEvents: function() {
    this.$container.find('.filters .tag').on('click', $.proxy(this._toggleFilter, this));
  },
  /**
   * 컨트롤러로부터 받은 this.$items, this.$itemsUsing 으로 부가서비스 데이터를 채운다.
   */
  fillItems: function () {
    // `activeIds` 에 선택된 필터 아이디들을 준비한다.
    var activeTags = this.$container.find('.filters span.active');
    var activeIds = [];
    var i;
    for (i = 0; i < activeTags.length; i++) {
      var filterId = activeTags[i].id.substring(3);
      activeIds.push(filterId);
    }

    // $items 기준으로 부가서비스 항목을 채운다.
    // 사용 중인 부가서비스들은 .using 속성에 boolean 값을 지정한다.
    var itemsDiv = this.$container.find('.items')[0];
    itemsDiv.innerHTML = '';
    var template = Handlebars.compile($('#tpl-addon-item').html());
    for (i = 0; i < this.$items.length; i++) {
      var item = this.$items[i];
      item.using = this.$itemsUsing.indexOf(item.prodId) !== -1;
      if (activeIds.length > 0) {
        // 태그 필터가 지정된 경우, 화면에 미표시하기 위해 activeIds 목록과 대조한다.
        for (var f = 0; f < item.filters.length; f++) {
          var filter = item.filters[f];
          if (activeIds.indexOf(filter.prodFltId) >= 0) {
            itemsDiv.innerHTML += template(item);
            break;
          }
        }
        continue;
      }
      itemsDiv.innerHTML += template(item);
    }
    // 부가서비스 항목내의 태그 클릭시 필터 선택 효과를 낸다.
    this.$container.find('.item .tag').on('click', $.proxy(this._showFilter, this));
  },
  /**
   * 화면 내에서 필터(태그)를 선택한 경우.
   *
   * @param filterId 부가서비스 필터 id
   */
  showFilter: function (filterId) {
    $('.filters .tag').removeClass('active');
    $('#tag' + filterId).addClass('active');
    this.fillItems();
  },
  /**
   * 화면 상단의 필터(태그)를 토글하는 케이스
   * @param filterId 부가서비스 필터 id
   */
  toggleFilter: function (filterId) {
    var dom = document.getElementById('tag' + filterId);
    var className = dom.className;
    if (className.indexOf('active') >= 0) {
      dom.className = 'tag';
    } else {
      dom.className = 'tag active';
    }
    this.fillItems();
  },
  /**
   * 이벤트 핸들러에서 호출되는 함수로, toggleFilter 의 프록시 함수.
   * @param e EventObject
   * @private
   */
  _toggleFilter: function(e) {
    // 필터 아이디 앞에 prefix로 붙여둔 `tag` 제거
    var filterId = e.target.id.substring(3);
    this.toggleFilter(filterId);
  },
  /**
   * 부가서비스 항목내의 태그(필터) 선택시 이벤트 핸들러, showFilter 프록시 함수.
   * @param e EventObject
   * @private
   */
  _showFilter: function(e) {
    var filterId = e.target.getAttribute('data-filter');
    this.showFilter(filterId);
  }
};

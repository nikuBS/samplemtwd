/**
 * FileName: more-view.component
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.08.09
 */
Tw.MoreViewComponent = function () {

};

Tw.MoreViewComponent.prototype = {

  // 최초 한번 전체 리스트를 셋 한다.
  init : function (data) {
    if ( !data ) {
      return;
    }

    this._data = $.extend({
      list : [],
      cnt : Tw.DEFAULT_LIST_COUNT,
      btnMore : {},
      callBack : {}
    }, data);

    this._moreList = _.chunk(this._data.list, this._data.cnt);
    this._moreViewEvent();
  },

  // 더보기 버튼 이벤트 유무
  _hasMoreEvent : function () {
    var _data = this._data;
    var format = Tw.FormatHelper;
    if ( format.isEmpty(_data) || format.isEmpty(_data.callBack) ) {
      return false;
    } else {
      if ( format.isEmpty(_data.btnMore) ) {
        _data.btnMore = $('.wrap').find('.bt-more');
      }
      return true;
    }
  },

  // 더보기 클릭 이벤트
  _moreViewEvent : function () {
    if ( !this._hasMoreEvent() ) {
      return;
    }
    this._data.btnMore.click($.proxy(this.onMoreView,this));
  },

  // 더보기
  onMoreView : function () {
    if( !this._hasMoreEvent() ){
      return;
    }
    var moreData = this.pop();
    var _data = this._data;

    if ( moreData.list.length > 0 ) {
      _data.callBack(moreData);
    }
    if ( moreData.nextCnt > 0 ) {
      _data.btnMore.find('span').text( '(0)'.replace('0',moreData.nextCnt) );
      _data.btnMore.removeClass('none');
    } else {
      _data.btnMore.addClass('none');
    }
  },

  // _MORE_CNT 만큼의 리스트 와 다음 리스트의 잔여 카운트를 리턴한다.
  pop : function () {
    if ( !this._moreList || !this._moreList.length ) {
      return {
        list : [],
        nextCnt : 0
      };
    }

    var list = this._moreList.shift();
    var next = _.first(this._moreList);
    var nextCnt = next ? next.length : 0;

    return {
      list : list,
      nextCnt : nextCnt
    };
  }

};

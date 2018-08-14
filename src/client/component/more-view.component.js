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
    var list = data.list;
    var cnt = data.cnt || Tw.DEFAULT_LIST_COUNT;
    this._moreList = _.chunk(list, cnt);
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

/**
 * FileName: more-view.component
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.08.09
 */
Tw.MoreViewComponent = function () {
  this._lastYear = '';
};

Tw.MoreViewComponent.prototype = {

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
      /*if (_data.btnMore.find('button').children('span').length === 0) {
        _data.btnMore.find('button').append('<span>(0)</span>');
      }*/
      return true;
    }
  },

  // 더보기 클릭 이벤트
  _moreViewEvent : function () {
    if ( !this._hasMoreEvent() ) {
      return;
    }
    this._data.btnMore.off().on('click', $.proxy(this.onMoreView,this));
  },

  /**
   * 타임라인 형식 리스트로 변환
   * @param list
   * @param groupDateKey : 년도, 일자 로 묶을 키명
   * @param subSortDateKey : 같은 일자일 경우 정렬할 키명
   * @returns {*[]}
   * @private
   */
  _convertData : function (list, groupDateKey) {
    if ( Tw.FormatHelper.isEmpty(list) || Tw.FormatHelper.isEmpty(groupDateKey) ) {
      return list;
    }
    // 년도별로 그룹바이
    var yearGroup = _.groupBy(list, function(o){
      return o[groupDateKey].substring(0, 4);
    });

    // 년도별 데이터를 일자별 데이터로 만든다.
    var data = _.map(yearGroup, function(o, k){
      // 일자별로 그룹바이
      var dateGroup = _.groupBy(o, function(objectOfYearGroup){
        return objectOfYearGroup[groupDateKey].substring(4);
      });

      // 일자별로 그룹바이
      var _data = _.map(dateGroup,function(objectOfDateGroup, k1){
        return {
          date : k1,
          subList : _.sortBy(objectOfDateGroup, groupDateKey).reverse()
        };
      });

      return {
        year : k,
        list : _.sortBy(_data, 'date').reverse()
      };
    });

    return _.sortBy(data, 'year').reverse();
  },

  // 최초 한번 전체 리스트를 셋 한다.
  init : function (data) {
    if ( !data ) {
      return;
    }
    this._lastYear = new Date().getFullYear().toString();
    this._data = $.extend({
      list : [],  // 더보기 리스트
      cnt : Tw.DEFAULT_LIST_COUNT,  // 보여줄 리스트 갯수 ( 기본 20개 )
      btnMore : {}, // 더보기 버튼 셀럭터
      callBack : {},  // 더보기 버튼 클릭 시 수행할 함수
      isOnMoreView : false,  // 더보기 수행여부
      listOption : {  // 타임라인 형식 리스트 일경우 설정해준다.
        groupDateKey : ''  // 그룹으로 묶을 날짜(YYYYMMDD) 키명
      }
    }, data);

    this._moreList = _.chunk(this._data.list, this._data.cnt);
    this._moreViewEvent();

    if (this._data.isOnMoreView) {
      this.onMoreView();
    }
  },

  // 더보기
  onMoreView : function () {
    if( !this._hasMoreEvent() ){
      return;
    }
    var moreData = this.shift();
    var _data = this._data;

    if ( moreData.list.length > 0 ) {
      if (_data.listOption.groupDateKey === '') {
        _data.callBack(moreData);
      } else {
        var convertData = this._convertData(moreData.list, _data.listOption.groupDateKey);
        var _this = this;
        _.forEach(convertData, function (o) {
          o.hasYear = _this._lastYear === o.year ? false:true;
          _this._lastYear = o.hasYear ? o.year : _this._lastYear;
          _data.callBack(o);
        });
      }

    }
    if ( moreData.nextCnt > 0 ) {
      // _data.btnMore.find('span').text( '(0)'.replace('0',moreData.nextCnt) );
      _data.btnMore.removeClass('none');
    } else {
      _data.btnMore.addClass('none');
    }
  },

  // _MORE_CNT 만큼의 리스트 와 다음 리스트의 잔여 카운트를 리턴한다.
  shift : function () {
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

/**
 * FileName: myt.benefit.membership.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018. 8. 16.
 */
Tw.MyTBenefitMembership = function (rootEl, data) {
  this.$container = rootEl;
  this._moreViewSvc = new Tw.MoreViewComponent();
  this._data = JSON.parse(data);
  this._init();
};

Tw.MyTBenefitMembership.prototype = {
  _init : function() {
    this._initVariables();
    this._bindEvent();
    this._initBenefitList();
    this._initAbleBenefitList();
  },

  _initVariables: function () {
    this._benefitList = this.$container.find('.benefits-list > ul');
    this._TxtMoreCnt = this.$container.find('#fe-more-cnt');
    this._recommBenefits = this.$container.find('.recomm-benefits');
  },

  _bindEvent: function () {
    this.$container.on('click','.fe-loc', $.proxy(this._onUseBenefits, this));
    this.$container.on('click','.fe-available-bene', $.proxy(this._onAvailableBenefits, this));
  },

  // 받고 있는 혜택 클릭 ( 상세보기로 이동 )
  _onUseBenefits : function (e) {
    var param = 'code='+$(e.currentTarget).data('code');
    // t class 인 경우
    if ( this._data.isTclassYn !== 'N' ) {
      param += '&plans=' + this._data.isTclassYn;
    }
    this._goDetail( param );
  },

  // 상세화면으로 이동
  _goDetail : function (param) {
    location.href = '/myt/benefit/membership/detail?' + param;
  },

  // 받고있는 혜택 리스트 초기 설정
  _initBenefitList : function () {
    this._benefitList.empty();
    var data = this._data;
    var list = $.extend(true, [], Tw.MSG_MYT.BENEFIT.MEMBERSHIP.LIST);
    list = _.filter(list, function(obj){
      if( data.mbrGrCd === 'V' && obj.CODE === 'VIP' ){
        return true;
      }
      else if( data.isTclassYn !== 'N' && obj.CODE === 'T_CLASS' ){
        return true;
      }
      else if( _.some(['CHOCOLATE','MELON','11ST','FREE'], function(item){ return item === obj.CODE; }) ){
        return true;
      }
      else if( data.mbrTypCd === '3' && obj.CODE === 'TPLE' ){
        return true;
      }
      else if( data.mbrTypCd === '4' && obj.CODE === 'COUPLE' ){
        return true;
      }
      else if( data.mbrTypCd === '0' && obj.CODE === 'LEADERS' ){
        return true;
      }
      else if( obj.CODE === 'PLUS' ){
        return true;
      }
    });

    this._moreViewSvc.init({
      list : list,
      callBack : $.proxy(this._renderList,this)
    });

    this._moreViewSvc.onMoreView();
  },

  // 받을 수 있는 혜택
  _initAbleBenefitList : function () {
    if( this._data.mbrGrCd === 'V' ){
      this._recommBenefits.hide();
    } else {
      this._recommBenefits.show();
    }
  },

  // 받고 있는 혜택 리스트 추가
  _renderList : function (res) {
    var source = $('#tmplList').html();
    var template = Handlebars.compile(source);
    var output = template({list : res.list});
    this._benefitList.append(output);
  },

  // 받을 수 있는 혜택 클릭 ( 상세 페이지로 이동 )
  _onAvailableBenefits : function () {
    this._goDetail( 'code=VIP-NON' );
  }

};
/**
 * FileName: myt.bill.guidechange.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
Tw.MyTBillGuidechange = function (rootEl, svcInfo) {
  this.$container = rootEl;
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.svcInfo = JSON.parse(svcInfo);
  this._bindEvent();
};

Tw.MyTBillGuidechange.prototype = {

  _bindEvent: function () {
    this.$container.on('click', '.swiper-slide', $.proxy(this._onClickFlicking, this));
    this.$container.on('click', '._sel-preview', $.proxy(this._openPreview, this, ''));
    this.$container.on('click', '._sel-join-bill', $.proxy(this._openJoinBill, this));
    // this.$container.on('click','._sel-preview', $.proxy(this._openPreview, this, {'test':'hello'}) );
  },

  _changePreview: function (e, $container) {
    var billType = $(e.currentTarget).data('billType');
    $container.find('._sel-desc').text(billType.desc);
    $container.find('._sel-nm').text(billType.chgBtnNm);
  },

  // 하단 안내서 플리킹 클릭 이벤트
  _onClickFlicking: function (e) {
    var billType = $(e.currentTarget).data('billType');
    this._changePreview(e, this.$container);
    this.$container.find('._sel-preview').data('selectBillType', billType.billType);
    Tw.Logger.info('## >> ', this.$container.find('._sel-preview').data('selectBillType'));
  },

  // 현재 접속 회선정보 리턴
  _getServiceType: function () {
    this.svcInfo = this.svcInfo.svcAttrCd || '';
    if (['S1', 'S2', 'S3'].includes(this.svcAttrCd)) {
      return 'S';
    } else {
      return this.svcAttrCd;
    }
  },

  // 미리보기 클릭 이벤트
  // _openPreview : function ( e) {
  _openPreview: function (currentBillType, e) {
    currentBillType = currentBillType || $(e.currentTarget).data('selectBillType');
    this.currentBillType = currentBillType; // 파라미터로 받을 안내서 유형
    var data = {};
    data.billTypeList = $.extend(true, [], Tw.MSG_MYT.BILLTYPE_LIST);
    var imsiList = [];

    // 회선에 따라 안내서 리스트를 만든다.
    for (var i = 0; i < data.billTypeList.length; i++) {
      var billType = data.billTypeList[i];
      // T wibro
      if (this._getServiceType() === 'M5') {
        if (',P,2,1'.indexOf(billType.billType) > 0) {
          imsiList.push(billType);
        }
      }
      // 인터넷/집전화/IPTV
      else if (this._getServiceType() === 'S') {
        if (',P,H,B,2,I,A,1'.indexOf(billType.billType) > 0) {
          imsiList.push(billType);
        }
      }
      // 핸드폰
      else {
        imsiList.push(billType);
      }
    }

    // 선택한 안내서가 제일 앞으로 가도록..
    var idx = 0;
    for (idx; idx < imsiList.length; idx++) {
      var billType2 = imsiList[idx];
      if (billType2.billType === this.currentBillType) {
        break;
      }
    }

    var sliceBillTypeList = imsiList.splice(0, idx);
    imsiList = imsiList.concat(sliceBillTypeList);
    this.previewBillInfo = $.extend(true, {}, imsiList[0]);
    data.billTypeList = imsiList;

    // toJSON 펑션 생성
    Handlebars.registerHelper('toJSON', function (object) {
      return JSON.stringify(object);
    });

    // 미리보기 공통 로드(나중에 별도 HBS 파일로 할지 확인필요. 일단 MY_03_03_01_L01 파일에다 만든다.)
    this._popupService.open({
      hbs: 'MY_03_03_01_L_COMMON',
      // hbs: 'MY_03_03_01_L01',
      data: data
    }, $.proxy(this._hbsLoadEvent, this));
  },

  // 통합청구 정보 set
  _setJoinBill : function( joinBillInfo ) {
    this.joinBillInfo = JSON.parse(joinBillInfo);
  },

  /*_setSvcInfo : function( svcInfo ) {
    Tw.Logger.info('### ', JSON.parse(svcInfo) );
    this.svcInfo = JSON.parse(svcInfo);
  },*/

  // 통합청구 팝업
  _openJoinBill : function() {
    /*var data = this.joinBillInfo.map( function( data ){
      data.isCeo = data.svcNum === this.svcInfo.svcNum ? true:false;
      data.haveAddr = data.svcType === 'IPTV' ? true:false;
    });*/

    var _svcNum = this.svcInfo.svcNum;
    var data = {
      svcNum : _svcNum
    };
    data.list = _.map(this.joinBillInfo, function( line ){
      line.isCeo = line.svcNum === _svcNum ? true:false;
      line.haveAddr = line.svcType === 'IPTV' ? true:false;
      return line;
    });
    data.svcCnt = data.list.length;

    this._popupService.open({
      hbs: 'MY_03_03_01_L16',
      data: data
    });
  },

  /*
      - 안내서유형별 휴대폰, 인터넷, 와이브로 탭 노출,비노출 전환
      - 하단에 안내서별 안내문구 변환
   */
  _changeTabAndBottomText: function ($layer, billType) {
    // Bill Letter + 문자(Q)
    if ('Q' === billType) {
      $layer.find('._contents-tab').hide();
      $layer.find('._contents-normal').show();
    } else {
      $layer.find('._contents-normal').hide();
      if (!['P', '2', '1'].includes(billType)) {
        $layer.find('#aria-tab3').hide();
      } else {
        $layer.find('#aria-tab3').show();
      }
      $layer.find('._contents-tab').show();
    }

    // 회선이 인터넷/집전화/IPTV 이면서 안내서가 Bill Letter 확인 일 때
    $layer.find('._bottom-text1').hide();
    $layer.find('._bottom-text2').hide();
    if ('S' === this._getServiceType() && 'H' === billType) {
      $layer.find('._bottom-text1').show();
    }
    // 회선이 휴대폰이면서 안내서가 안내서가 Bill Letter + 문자 일때
    else if ('M1' === this._getServiceType() && 'Q' === billType) {
      $layer.find('._bottom-text1').show();
    }
    // 회선이 인터넷/집전화/IPTV , T wibro 이면서 안내서가 T world 확인 일 때
    else if (['S', 'M5'].includes(this._getServiceType()) && 'P' === billType) {
      $layer.find('._bottom-text2').show();
    }
  },

  // HBS Load 후 이벤트
  _hbsLoadEvent: function ($layer) {
    $layer.find('._sel-desc').text(this.previewBillInfo.desc);
    $layer.find('._sel-nm').text(this.previewBillInfo.chgBtnNm);

    this._changeTabAndBottomText($layer, this.currentBillType);

    // 미리보기 안에 유형별 이미지 넣는 영역 append (유형에 따라 Tab 또는 일반으로 구성필요)
    $($layer).on('click', '.swiper-slide', $.proxy(this._previewOnClickFlicking, this, $layer));
    $($layer).on('click', '[role=tablist] li', $.proxy(this._previewOnClickTab, this, $layer));
  },

  // 미리보기 > 상단 플리킹 클릭 이벤트
  _previewOnClickFlicking: function ($layer, e) {
    this._changePreview(e, $layer);
    var billType = $(e.currentTarget).data('billType');
    this._changeTabAndBottomText($layer, billType.billType);
  },

  // 미리보기 > tab 클릭
  _previewOnClickTab: function ($layer, e) {
    e.preventDefault();
    var $_this = $(e.currentTarget);
    $_this.attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
    var currentId = '.' + $_this.attr('id');
    $layer.find(currentId, '.tab-contents').show().siblings().hide();
  }


};
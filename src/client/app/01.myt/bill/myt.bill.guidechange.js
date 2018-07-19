/**
 * FileName: myt.bill.guidechange.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
Tw.MyTBillGuidechange = function (rootEl, svcInfo) {
  this.$container = rootEl || $('#myt-bill-billguide');
  this._apiService = Tw.Api;
  this._popupService = Tw.Popup;
  this.svcInfo = svcInfo !== undefined ? JSON.parse( svcInfo ) : {};
  this._bindEvent();
};

Tw.MyTBillGuidechange.prototype = {

  _bindEvent: function () {
    this._popupService._popupClose();
    this.$container.on('click', '.swiper-slide', $.proxy(this._onClickFlicking, this));
    this.$container.on('click', '._sel-preview', $.proxy(this._openPreview, this, ''));
    this.$container.on('click', '._sel-join-bill', $.proxy(this._openJoinBill, this));
    this.$container.on('click', '#onModifyInfo', $.proxy(this._goModifyInfo,this) );
    this.$container.on('click', '._sel-nm', $.proxy(this._goModify,this) );
    this.$container.on('click', '.onReissue', $.proxy(this._goReissue,this) );
    this.$container.on('click', '#onReturnHistory', $.proxy(this._goReturnHistory,this) );
  },

  // set 서비스 속성
  _setSvcAttrCd : function( svcAttrCd ) {
    this.svcInfo.svcAttrCd = svcAttrCd;
  },

  // 안내서 정보변경 링크
  _goModifyInfo : function() {
    window.location.href='/myt/bill/guidechange/update';
  },

  // 안내서 변경 링크
  _goModify : function(e) {
    var billType = $(e.currentTarget).data('billType');
    this._popupService._popupClose();
    window.location.href='/myt/bill/guidechange/change?selectedBillGuideType='+billType;
  },

  // 재발행하기 링크
  _goReissue : function() {
    window.location.href='/myt/bill/guidechange/reissue';
  },

  // 반송내역 링크
  _goReturnHistory : function() {
    window.location.href='/myt/bill/billguide/returnhistory';
  },

  _changePreview: function (e, $container) {
    var billType = $(e.currentTarget).data('billType');
    $container.find('._sel-desc').text(billType.desc);
    $container.find('._sel-nm').data('billType', billType.billType).text(billType.chgBtnNm);
  },

  // 하단 안내서 플리킹 클릭 이벤트
  _onClickFlicking: function (e) {
    var billType = $(e.currentTarget).data('billType');
    this._changePreview(e, this.$container);
    this.$container.find('._sel-preview').data('selectBillType', billType.billType);
  },

  // 현재 접속 회선정보 리턴
  _getServiceType: function () {
    if (['S1', 'S2', 'S3'].includes(this.svcInfo.svcAttrCd)) {
      return 'S';
    } else {
      return this.svcInfo.svcAttrCd;
    }
  },

  // 외부에서 직접 호출시
  callOpenPreview : function( data ) {
    this._setSvcAttrCd( data.svcAttrCd );
    this._openPreview( data.billType );
  },

  // 미리보기 클릭 이벤트
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
          if ( billType.billType === 'H' ) {
            billType.billType = 'J';
          } else if ( billType.billType === 'I' ) {
            billType.billType = 'K';
          }
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

    // 미리보기 공통 로드
    this._popupService.open({
      hbs: 'MY_03_03_01_L_COMMON',
      data: data
    }, $.proxy(this._hbsLoadEvent, this));
  },

  // 통합청구 정보 set
  _setJoinBill : function( joinBillInfo ) {
    this.joinBillInfo = JSON.parse(joinBillInfo);
  },

  // 통합청구 팝업
  _openJoinBill : function() {
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
    var imgData = Tw.MSG_MYT.BILL_PREVIEW;
    // Bill Letter + 문자(Q) 일때는 탭이 없다.
    if ('Q' === billType) {
      $layer.find('._contents-tab').hide();
      var $contents = $layer.find('._contents-normal');

      var path = imgData.BILL_LETTER+imgData.SMS_HP;
      $contents.find('.pay_preview').html(path);
      $contents.show();
    } else {
      $layer.find('._contents-normal').hide();
      if (!['P', '2', '1'].includes(billType)) {
        $layer.find('#aria-tab3').hide();
      } else {
        $layer.find('#aria-tab3').show();
      }

      var $tabContents = $layer.find('.tab-contents');
      // 안내서에 해당하는 회선별 미리보기 셋팅
      switch (billType) {
        // T world 확인
        case 'P':
          $tabContents.find('.pay_preview').html( imgData.TWORLD );
          break;
        // Bell Letter
        case 'H' :
        case 'J' :
          $tabContents.find('.pay_preview').html( imgData.BILL_LETTER );
          break;
        // 문자
        case 'B' :
          $tabContents.find('.pay_preview').eq(0).html( imgData.SMS_HP );
          $tabContents.find('.pay_preview').eq(1).html( imgData.SMS_INT );
          break;
        //  이메일
        case '2' :
          $tabContents.find('.pay_preview').eq(0).html( imgData.EMAIL_HP );
          $tabContents.find('.pay_preview').eq(1).html( imgData.EMAIL_INT );
          $tabContents.find('.pay_preview').eq(2).html( imgData.EMAIL_INT );
          break;
        // Bll Letter + 이메일
        case 'I' :
        case 'K' :
          $tabContents.find('.pay_preview').eq(0).html( imgData.BILL_LETTER+imgData.EMAIL_HP );
          $tabContents.find('.pay_preview').eq(1).html( imgData.BILL_LETTER+imgData.EMAIL_INT );
          break;
        // 문자 + 이메일
        case 'A' :
          $tabContents.find('.pay_preview').eq(0).html( imgData.SMS_HP+imgData.EMAIL_HP );
          $tabContents.find('.pay_preview').eq(1).html( imgData.SMS_INT+imgData.EMAIL_INT );
          break;
        case '1' :
          $tabContents.find('.pay_preview').eq(0).html( imgData.ETC_HP );
          $tabContents.find('.pay_preview').eq(1).html( imgData.ETC_INT );
          $tabContents.find('.pay_preview').eq(2).html( imgData.ETC_INT );
          break;
        default : break;
      }

      // 첫번째 탭 활성화
      $layer.find('[role=tab]', '._contents-tab').eq(0).attr('aria-selected','true').siblings().attr('aria-selected','false');
      this._previewOnClickTab($layer);
      $layer.find('._contents-tab').show();
    }

    // 버튼 하단 안내문구 : 회선이 인터넷/집전화/IPTV 이면서 안내서가 Bill Letter 확인 일 때
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
    $layer.find('._sel-nm').data('billType', this.previewBillInfo.billType).text(this.previewBillInfo.chgBtnNm);
    this._changeTabAndBottomText($layer, this.currentBillType);

    $($layer).on('click', '.swiper-slide', $.proxy(this._previewOnClickFlicking, this, $layer));
    $($layer).on('click', '[role=tablist] li', $.proxy(this._previewOnClickTab, this, $layer));
    $($layer).on('click', '._sel-nm', $.proxy(this._goModify, this));
  },

  // 미리보기 > 상단 플리킹 클릭 이벤트
  _previewOnClickFlicking: function ($layer, e) {
    this._changePreview(e, $layer);
    var billType = $(e.currentTarget).data('billType');
    this._changeTabAndBottomText($layer, billType.billType);
  },

  // 미리보기 > tab 클릭
  _previewOnClickTab: function ($layer, e) {
    var $_this = null;
    if (e) {
      e.preventDefault();
      $_this = $(e.currentTarget);
    } else {
      $_this = $layer.find('[role=tab]', '._contents-tab').eq(0);
    }
    $_this.attr('aria-selected', 'true').siblings().attr('aria-selected', 'false');
    var currentId = '.' + $_this.attr('id');
    $layer.find(currentId, '.tab-contents').show().siblings().hide();
  }

};
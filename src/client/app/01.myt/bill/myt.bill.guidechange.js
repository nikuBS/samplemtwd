/**
 * FileName: myt.bill.guidechange.js
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
Tw.MyTBillGuidechange = function (rootEl) {
    this.$container = rootEl;
    this._apiService = Tw.Api;
    this._popupService = Tw.Popup;
    this._bindEvent();
};

Tw.MyTBillGuidechange.prototype = {

    _bindEvent: function () {
        this.$container.on('click','.swiper-slide', $.proxy(this._changeFlicking,this) );
        this.$container.on('click','._sel-preview', $.proxy(this._openPreview, this) );
        // this.$container.on('click','._sel-preview', $.proxy(this._openPreview, this, {'test':'hello'}) );
    },

    // 하단 안내서 플리킹 클릭 이벤트
    _changeFlicking : function(e){
        // Tw.Logger.log('[## TEST] ', '_changeFlicking call' );
        this.billType = $(e.currentTarget).data('billType');
        this.$container.find('._sel-desc').text(this.billType.desc);
        this.$container.find('._sel-nm').text(this.billType.chgBtnNm);
    },
  
    // 미리보기 클릭 이벤트
    _openPreview : function () {

        // Tw.Logger.log('[## TEST] ', 'preview call ', JSON.stringify(billList) );
        var data = {};
        var cBillType = '2'; // 파라미터로 받을 안내서 유형
        // var data = {'billTypeList' : []};
        data.billTypeList = $.extend(true, [], Tw.MSG_MYT.BILLTYPE_LIST);
        var svcAttrCd = 'S2'; // 로그인 회선정보 (휴대폰,T wibro, 인터넷.. )
        var imsiList =[];

        for (var i=0; i<data.billTypeList.length; i++) {
            var billType = data.billTypeList[i];
            // T wibro
            if ( svcAttrCd === 'M5' ) {
                if( ',P,2,1'.indexOf( billType.billType )  > 0 ) {
                    imsiList.push(billType);
                }
            }
            // 인터넷/집전화/IPTV
            else if ( ['S1','S2','S3'].includes( svcAttrCd ) ) {
                if( ',P,H,B,2,I,A,1'.indexOf( billType.billType ) > 0 ) {
                    imsiList.push(billType);
                }
            }else {
                imsiList.push(billType);
            }
        }

        Tw.Logger.log('[TEST] : >> ddd');
        // 선택한 안내서가 제일 앞으로 가도록..
        var idx=0;
        for( idx; idx < imsiList.length; idx++ ){
            var billType2 = imsiList[idx];

            if( billType2.billType === cBillType ){
                Tw.Logger.log('[TEST] : idx ', idx);
                break;
            }
        }

        var sliceBillTypeList = imsiList.splice(0,idx);
        imsiList = imsiList.concat(sliceBillTypeList);
        this.previewBillInfo = $.extend(true,{}, imsiList[0]);

        data.billTypeList = imsiList;
        this._popupService.open({
          hbs:'MY_03_03_01_L01',
          data : data
        // });
        }, $.proxy(this._hbsLoadEvent,this));
    },

    // HBS Load 후 이벤트
    _hbsLoadEvent : function ($layer) {
        $layer.find('._sel-desc').text(this.previewBillInfo.desc);
        $layer.find('._sel-nm').text(this.previewBillInfo.chgBtnNm);
        $($layer).on('click','.swiper-slide', $.proxy(this._previewFlicking,this));
    },

    // 상단 플리킹 카드
    _previewFlicking : function () {
        var hbsPath = '/hbs/MY_03_03_01_L01.hbs';   // 이건 플리킹 카드 영영에 Data로 넣어서 확인하기
        $.get(hbsPath, function (text) {
            var tmpl = Handlebars.compile(text);
            var html = tmpl();
            Tw.Logger.log('[## TEST] html ', $(html).find('.nogaps').html() );
        }).done(function (){
            Tw.Logger.log('[## TEST] ', 'done..');
        });
    },

    // tab 변경시
    _previewTabChange : function ($layer,e) {
        e.preventDefault();
        var $_this = $(e.currentTarget);
        // Tw.Logger.log('[## TEST] ', $layer);
        Tw.Logger.log('[## TEST] ', $_this.attr('id') );

        $_this.attr('aria-selected','true').siblings().attr('aria-selected','false');
        var currentId = '.'+$_this.attr('id');
        $layer.find(currentId,'.tab-contents').show().siblings().hide();
    }


};
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
        this.$container.on('click','.swiper-slide', $.proxy(this._onClickFlicking,this) );
        this.$container.on('click','._sel-preview', $.proxy(this._openPreview, this) );
        // this.$container.on('click','._sel-preview', $.proxy(this._openPreview, this, {'test':'hello'}) );
    },

    _onClickFlicking1 : function(e, $container){
        // Tw.Logger.log('[## TEST] ', '_changeFlicking call' );
        var billType = $(e.currentTarget).data('billType');
        $container.find('._sel-desc').text(billType.desc);
        $container.find('._sel-nm').text(billType.chgBtnNm);
    },

    // 하단 안내서 플리킹 클릭 이벤트
    _onClickFlicking : function(e){
        this._onClickFlicking1(e, this.$container);
        // Tw.Logger.log('[## TEST] ', '_changeFlicking call' );
        /*this.billType = $(e.currentTarget).data('billType');
        this.$container.find('._sel-desc').text(this.billType.desc);
        this.$container.find('._sel-nm').text(this.billType.chgBtnNm);*/
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
        // toJSON 펑션 생성
        Handlebars.registerHelper('toJSON', function(object){
            return JSON.stringify(object);
        });
        // 미리보기 공통 로드(나중에 별도 HBS 파일로 할지 확인필요. 일단 MY_03_03_01_L01 파일에다 만든다.)
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

        // 미리보기 안에 유형별 이미지 넣는 영역 append (유형에 따라 Tab 또는 일반으로 구성필요)
        var source = $('#tmplPreviewTabContents').html();
        var template = Handlebars.compile(source);
        var output = template({ data: 'hello' });
        $('#previewContents').append(output);

        $($layer).on('click','.swiper-slide', $.proxy(this._previewOnClickFlicking,this,$layer));
    },

    // 미리보기 > 상단 플리킹 클릭 이벤트
    _previewOnClickFlicking : function ($layer,e) {
        this._onClickFlicking1(e, $layer);
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
/**
 * FileName: myt.bill.reissue.js
 * Author: Kim Inhwan (skt.P132150@partner.sk.com)
 * Date: 2018.07.04
 */
Tw.MyTBillReissue = function ($element) {
    this.$container = $element;
    this._apiService = new Tw.ApiService();
    this._rendered();
    this._init();
    this._bindEvent();
};

Tw.MyTBillReissue.prototype = {
    //element event bind
    _bindEvent: function () {
        //기본
        this.$time.on('change', $.proxy(this._onTimeChanged, this));
        this.$month.on('change', $.proxy(this._onMonthChanged, this));
        //선택적으로 노출되는 아이템
        if (this.$reason) {
            this.$reason.on('change', $.proxy(this._onReasonChanged, this));
        }
        if (this.$type) {
            this.$type.on('change', $.proxy(this._onTypeChanged, this));
        }
        this.$okButton.on('change', $.proxy(this._onOkClicked, this));
    },

    //set selector
    _rendered: function () {
        //대표안내서
        this.$guide = this.$container.find('.txt-type');
        //시점
        this.$time = this.$container.find('[data-id=time]');
        //월
        this.$month = this.$container.find('[data-id=month]');
        //사유
        this.$reason = this.$container.find('[data-id=reason]');
        //유형
        this.$type = this.$container.find('[data-id=type]');
        //신청버튼
        this.$okButton = this.$container.find('.bt-red1');
    },

    _init: function () {
        //최초 진입시 설정 - 첫번째 아이템 선택
        this.$time.find(':radio').eq(0).trigger('change');
        this.$month.find(':radio').eq(0).trigger('change');
        //선택적으로 노출되는 아이템
        if (this.$reason) {
            this.$reason.find(':radio').eq(0).trigger('change');
        }
        if (this.$type) {
            this.$type.find(':radio').eq(0).trigger('change');
        }
    },

    _onTimeChanged: function (event) {
        console.log('time changed');
    },

    _onMonthChanged: function (event) {
        console.log('time changed');
    },

    _onReasonChanged: function (event) {
        console.log('time changed');
    },

    _onTypeChanged: function (event) {
        console.log('time changed');
    },

    _onOkClicked: function (event) {
        // 기본적으로 설정된 값으로 표시
        var selectedItem = this.$guide.text();
        if (this.$type) {
            //유형이 설정이 된다면 선택된 아이템에서 가져와 표시
            selectedItem = this.$type.find('[aria-checked=true]').text();
        }
        var title = Tw.MSG_MYT.BILL_GUIDE_00;
        var contents = selectedItem + Tw.MSG_MYT.REFILL_INFO_01;
        this._popupService.openConfirm(Tw.POPUP_TITLE.NOTIFY, title, contents, $.proxy(this._onSubmit(), this));
    },

    _onSubmit: function (event) {
        //재발행신청 API 호출
    }
};
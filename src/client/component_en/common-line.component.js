/**
 * @file common-line.component.js
 * @author 김기남 (skt.p161322@partner.sk.com)
 * @since 2020.11.20
 * Summary: 회선 선택에 관한 공통 자바스크립트
 */

Tw.CommonLineComponent = function (rootEl, svcMgmtNum) {
    this.$container = rootEl;
    this._svcMgmtNum = svcMgmtNum;

    this._historyService = new Tw.HistoryService();
    
    this._bindEvents();
}

Tw.CommonLineComponent.prototype = {

    /**
     * 이벤트 핸들러
     */
    _bindEvents: function() {
        this.$container.on('click', '#goto-main', $.proxy(this._onGotoMain, this));
        this.$container.on('click', '#goto-line', $.proxy(this._onGotoLine, this));
        this.$container.on('click', '#line-action', $.proxy(this._onLineAction, this));    
    },

    /**
     * 메인 화면으로 이동
     */
    _onGotoMain: function() {
        this._historyService.goLoad('/main/home');
    },

    /**
     * 회선 등록 페이지로 이동
     */
    _onGotoLine: function() {
        this._historyService.goLoad('/en/common/member/line');
    }, 

    /**
     * 회선 관리 이동
     * 무선회선이 1개이상 있다면 액션시트를 출력하고 무선회선이 1개일때 회선관리 페이지로 이동
     * 
     * @param {*} $event 
     */
    _onLineAction: function ($event) {
        var $target = $($event.currentTarget);
        
        if ( !this._lineComponent ) {
            this._lineComponent = new Tw.LineComponent(null, null, false, $target);
        }

        this._lineComponent.onClickLineView(this._svcMgmtNum, $target);
    },

};

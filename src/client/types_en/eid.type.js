/**
* @file eiid.type.js
* @author 김기남 (skt.P161322@partner.sk.com)
* @since 2020.10.18
* Summary: 트랙킹 코드 공통 파일
*/

Tw.EID_TYPES = {
    // CO_공통
    'MWMA_A10_B79-25' : { 'WEB' : 'MWMA_A10_B79-25', 'APP' : 'MWMA_A10_B79-25' },
    'MWMA_A10_B79-1' : { 'WEB' : 'MWMA_A10_B79-1', 'APP' : 'MWMA_A10_B79-1' },
    'MWMA_A10_B79-2' : { 'WEB' : 'MWMA_A10_B79-2', 'APP' : 'MWMA_A10_B79-2' },
    'MWMA_A10_B79-3' : { 'WEB' : 'MWMA_A10_B79-3', 'APP' : 'MWMA_A10_B79-3' },
    'MWMA_A10_B79-20' : { 'WEB' : 'MWMA_A10_B79-20', 'APP' : 'MWMA_A10_B79-20' },
    'MWMA_A10_B79-21' : { 'WEB' : 'MWMA_A10_B79-21', 'APP' : 'MWMA_A10_B79-21' },
    'MWMA_A10_B79-22' : { 'WEB' : 'MWMA_A10_B79-22', 'APP' : 'MWMA_A10_B79-22' },
    'MWMA_A10_B79-23' : { 'WEB' : 'MWMA_A10_B79-23', 'APP' : 'MWMA_A10_B79-23' },
    'MWMA_A10_B79-24' : { 'WEB' : 'MWMA_A10_B79-24', 'APP' : 'MWMA_A10_B79-24' },

    // MD_나의 데이터 통화
    'MWMA_A10_B81_C1200-1' : { 'WEB' : 'MWMA_A10_B81_C1200-1', 'APP' : 'CMMA_A10_B81_C1200-2' }, // 회선 번호 영역
    'MWMA_A10_B81_C1200-3' : { 'WEB' : 'MWMA_A10_B81_C1200-3', 'APP' : 'CMMA_A10_B81_C1200-4' }, // Select a Mobile Line
    'MWMA_A10_B81_C1200-5' : { 'WEB' : 'MWMA_A10_B81_C1200-5', 'APP' : 'CMMA_A10_B81_C1200-6' }, // Go to Tworld KOR

    // CC_나의 요금

    // MU_나의 가입정보
    'MWMA_A10_B81_C1198-1' : { 'WEB' : 'MWMA_A10_B81_C1198-1', 'APP' : 'CMMA_A10_B81_C1198-2' }, // 나의 가입정보
    'MWMA_A10_B81_C1198-3' : { 'WEB' : 'MWMA_A10_B81_C1198-3', 'APP' : 'CMMA_A10_B81_C1198-5' }, // Select a Mobile Line
    'MWMA_A10_B81_C1198-4' : { 'WEB' : 'MWMA_A10_B81_C1198-4', 'APP' : 'CMMA_A10_B81_C1198-6' }, // Go to Tworld KOR
    'MWMA_A10_B81_C1198-7' : { 'WEB' : 'MWMA_A10_B81_C1198-7', 'APP' : 'CMMA_A10_B81_C1198-9' }, // Register Line
    'MWMA_A10_B81_C1198-8' : { 'WEB' : 'MWMA_A10_B81_C1198-8', 'APP' : 'CMMA_A10_B81_C1198-10' }, // View another line

    
    // MP_요금제

    // SC_이용안내

    // OP_설정

    // OP_회선관리
    'MWMA_A10_B80_C1199_D4354_E399-1' : { 'WEB' : 'MWMA_A10_B80_C1199_D4354_E399-1', 'APP' : 'CMMA_A10_B80_C1199_D4354_E399-4' }, // User guide
    'MWMA_A10_B80_C1199_D4354_E399-3' : { 'WEB' : 'MWMA_A10_B80_C1199_D4354_E399-3', 'APP' : 'CMMA_A10_B80_C1199_D4354_E399-6' }, // Go to Tworld KOR (회선관리 메인화면)
    'MWMA_A10_B80_C1199_D4354_E399_F186-3' : { 'WEB' : 'MWMA_A10_B80_C1199_D4354_E399_F186-3', 'APP' : 'CMMA_A10_B80_C1199_D4354_E399_F186-2' }, // Go to Tworld KOR (Welcome to T World 화면)
    
    
    /**
     * 코드값을 쉽게 얻기 위해
     * @param {*} code 
     */
    getCode : function(code) {
        if ( code ) {
            return Tw.BrowserHelper.isApp() ? code.APP : code.WEB;
        }
        return null;
    },

    /**
     * Html(Element)의 코드 정보를 변경
     * @param {*} code 
     */
    replaceEidCode: function($element, code) {
        $element.data('xt_eid', code);
        $element.attr('data-xt_eid', code);
    },

    /**
     * Html(Element) 의 모든 코드정보를 변경
     * @param {*} $element 
     */
    replaceHtmlEidCode: function($element) {
        var $eidElement = $element.find('[data-xt_eid^="M"]');
        for(var i=0, len=$eidElement.length; i < len; i++) {
            var $element = $eidElement.eq(i);
            var eid = $element.data('xt_eid');
            var code = Tw.EID_TYPES.getCode(Tw.EID_TYPES[eid]);
            if( code ) {
                Tw.EID_TYPES.replaceEidCode($element, code);
            }
        }
    }
    // data-xt_eid=""
}

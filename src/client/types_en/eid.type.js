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
    'MWMA_A10_B82_C1202-1' : { 'WEB' : 'MWMA_A10_B82_C1202-1', 'APP' : 'MWMA_A10_B82_C1202-33' },//Miri
    'MWMA_A10_B82_C1202-2' : { 'WEB' : 'MWMA_A10_B82_C1202-2', 'APP' : 'MWMA_A10_B82_C1202-34' },//5GX Plan
    'MWMA_A10_B82_C1202-3' : { 'WEB' : 'MWMA_A10_B82_C1202-3', 'APP' : 'MWMA_A10_B82_C1202-35' },//5GX Platinum
    'MWMA_A10_B82_C1202-4' : { 'WEB' : 'MWMA_A10_B82_C1202-4', 'APP' : 'MWMA_A10_B82_C1202-36' },//5GX Prime
    'MWMA_A10_B82_C1202-5' : { 'WEB' : 'MWMA_A10_B82_C1202-5', 'APP' : 'MWMA_A10_B82_C1202-37' },//5GX Standard
    'MWMA_A10_B82_C1202-6' : { 'WEB' : 'MWMA_A10_B82_C1202-6', 'APP' : 'MWMA_A10_B82_C1202-38' },//Slim
    'MWMA_A10_B82_C1202-7' : { 'WEB' : 'MWMA_A10_B82_C1202-7', 'APP' : 'MWMA_A10_B82_C1202-39' },//5G 0 Teen
    'MWMA_A10_B82_C1202-8' : { 'WEB' : 'MWMA_A10_B82_C1202-8', 'APP' : 'MWMA_A10_B82_C1202-40' },//0 Teen 5G
    'MWMA_A10_B82_C1202-9' : { 'WEB' : 'MWMA_A10_B82_C1202-9', 'APP' : 'MWMA_A10_B82_C1202-41' },//T Plan
    'MWMA_A10_B82_C1202-10' : { 'WEB' : 'MWMA_A10_B82_C1202-10', 'APP' : 'MWMA_A10_B82_C1202-42' },//T Plan Max
    'MWMA_A10_B82_C1202-11' : { 'WEB' : 'MWMA_A10_B82_C1202-11', 'APP' : 'MWMA_A10_B82_C1202-43' },//T Plan Special
    'MWMA_A10_B82_C1202-12' : { 'WEB' : 'MWMA_A10_B82_C1202-12', 'APP' : 'MWMA_A10_B82_C1202-44' },//T Plan Essence
    'MWMA_A10_B82_C1202-13' : { 'WEB' : 'MWMA_A10_B82_C1202-13', 'APP' : 'MWMA_A10_B82_C1202-45' },//T Plan Safety 4G
    'MWMA_A10_B82_C1202-14' : { 'WEB' : 'MWMA_A10_B82_C1202-14', 'APP' : 'MWMA_A10_B82_C1202-46' },//T Plan Safety 2.5G
    'MWMA_A10_B82_C1202-15' : { 'WEB' : 'MWMA_A10_B82_C1202-15', 'APP' : 'MWMA_A10_B82_C1202-47' },//T Plan Save
    'MWMA_A10_B82_C1202-16' : { 'WEB' : 'MWMA_A10_B82_C1202-16', 'APP' : 'MWMA_A10_B82_C1202-48' },//0 Plan
    'MWMA_A10_B82_C1202-17' : { 'WEB' : 'MWMA_A10_B82_C1202-17', 'APP' : 'MWMA_A10_B82_C1202-49' },//0 Plan Large
    'MWMA_A10_B82_C1202-18' : { 'WEB' : 'MWMA_A10_B82_C1202-18', 'APP' : 'MWMA_A10_B82_C1202-50' },//0 Plan Medium
    'MWMA_A10_B82_C1202-19' : { 'WEB' : 'MWMA_A10_B82_C1202-19', 'APP' : 'MWMA_A10_B82_C1202-51' },//0 Plan Small
    'MWMA_A10_B82_C1202-20' : { 'WEB' : 'MWMA_A10_B82_C1202-20', 'APP' : 'MWMA_A10_B82_C1202-52' },//Ting On Weekends
    'MWMA_A10_B82_C1202-21' : { 'WEB' : 'MWMA_A10_B82_C1202-21', 'APP' : 'MWMA_A10_B82_C1202-53' },//Ting On Weekends 5.0G
    'MWMA_A10_B82_C1202-22' : { 'WEB' : 'MWMA_A10_B82_C1202-22', 'APP' : 'MWMA_A10_B82_C1202-54' },//Ting On Weekends 3.0G
    'MWMA_A10_B82_C1202-23' : { 'WEB' : 'MWMA_A10_B82_C1202-23', 'APP' : 'MWMA_A10_B82_C1202-55' },//Ting On Weekends Save
    'MWMA_A10_B82_C1202-24' : { 'WEB' : 'MWMA_A10_B82_C1202-24', 'APP' : 'MWMA_A10_B82_C1202-56' },//T Plan Senior
    'MWMA_A10_B82_C1202-25' : { 'WEB' : 'MWMA_A10_B82_C1202-25', 'APP' : 'MWMA_A10_B82_C1202-57' },//T Plan Senior Special
    'MWMA_A10_B82_C1202-26' : { 'WEB' : 'MWMA_A10_B82_C1202-26', 'APP' : 'MWMA_A10_B82_C1202-58' },//T Plan Senior Essence
    'MWMA_A10_B82_C1202-27' : { 'WEB' : 'MWMA_A10_B82_C1202-27', 'APP' : 'MWMA_A10_B82_C1202-59' },//T Plan Senior Safety 4.5G
    'MWMA_A10_B82_C1202-28' : { 'WEB' : 'MWMA_A10_B82_C1202-28', 'APP' : 'MWMA_A10_B82_C1202-60' },//T Plan Senior Safety 2.8G
    'MWMA_A10_B82_C1202-29' : { 'WEB' : 'MWMA_A10_B82_C1202-29', 'APP' : 'MWMA_A10_B82_C1202-61' },//T Plan Senior Save
    'MWMA_A10_B82_C1202-30' : { 'WEB' : 'MWMA_A10_B82_C1202-30', 'APP' : 'MWMA_A10_B82_C1202-62' },//5G Tab
    'MWMA_A10_B82_C1202-31' : { 'WEB' : 'MWMA_A10_B82_C1202-31', 'APP' : 'MWMA_A10_B82_C1202-63' },//5G Tab 4GB (Sharing)
    'MWMA_A10_B82_C1202-32' : { 'WEB' : 'MWMA_A10_B82_C1202-32', 'APP' : 'MWMA_A10_B82_C1202-64' },//5G Tab 4GB (Stand alone)

    // SC_이용안내

    // OP_설정

    // OP_회선관리
    'MWMA_A10_B80_C1199_D4354_E399-1' : { 'WEB' : 'MWMA_A10_B80_C1199_D4354_E399-1', 'APP' : 'CMMA_A10_B80_C1199_D4354_E399-4' }, // User guide
    'MWMA_A10_B80_C1199_D4354_E399-3' : { 'WEB' : 'MWMA_A10_B80_C1199_D4354_E399-3', 'APP' : 'CMMA_A10_B80_C1199_D4354_E399-6' }, // Go to Tworld KOR (회선관리 메인화면)
    'MWMA_A10_B80_C1199_D4354_E399_F186-3' : { 'WEB' : 'MWMA_A10_B80_C1199_D4354_E399_F186-3', 'APP' : 'CMMA_A10_B80_C1199_D4354_E399_F186-2' }, // Go to Tworld KOR (Welcome to T World 화면)
    
    // 홈
    'MWMA_A10_B79-25' : { 'WEB' : 'MWMA_A10_B79-25', 'APP' : 'CMMA_A10_B79-61' },
    'MWMA_A10_B79-1' : { 'WEB' : 'MWMA_A10_B79-1', 'APP' : 'CMMA_A10_B79-40' },
    'MWMA_A10_B79-2' : { 'WEB' : 'MWMA_A10_B79-2', 'APP' : 'CMMA_A10_B79-35' },
    'MWMA_A10_B79-3' : { 'WEB' : 'MWMA_A10_B79-3', 'APP' : 'CMMA_A10_B79-36' },
    'MWMA_A10_B79-20' : { 'WEB' : 'MWMA_A10_B79-20', 'APP' : 'CMMA_A10_B79-62' },
    'MWMA_A10_B79-21' : { 'WEB' : 'MWMA_A10_B79-21', 'APP' : 'CMMA_A10_B79-57' },
    'MWMA_A10_B79-22' : { 'WEB' : 'MWMA_A10_B79-22', 'APP' : 'CMMA_A10_B79-58' },
    'MWMA_A10_B79-23' : { 'WEB' : 'MWMA_A10_B79-23', 'APP' : 'CMMA_A10_B79-59' },
    'MWMA_A10_B79-24' : { 'WEB' : 'MWMA_A10_B79-24', 'APP' : 'CMMA_A10_B79-60' },
    'MWMA_A10_B79-26' : { 'WEB' : 'MWMA_A10_B79-26', 'APP' : 'CMMA_A10_B79-37' },
    'MWMA_A10_B79-27' : { 'WEB' : 'MWMA_A10_B79-27', 'APP' : 'CMMA_A10_B79-39' },
    'MWMA_A10_B79-28' : { 'WEB' : 'MWMA_A10_B79-28', 'APP' : 'CMMA_A10_B79-38' },
    'MWMA_A10_B79-29' : { 'WEB' : 'MWMA_A10_B79-29', 'APP' : 'CMMA_A10_B79-63' },
    'MWMA_A10_B79-30' : { 'WEB' : 'MWMA_A10_B79-30', 'APP' : 'CMMA_A10_B79-63' },
    'MWMA_A10_B79-31' : { 'WEB' : 'MWMA_A10_B79-31', 'APP' : 'CMMA_A10_B79-64' },
    'MWMA_A10_B79-32' : { 'WEB' : 'MWMA_A10_B79-32', 'APP' : 'CMMA_A10_B79-66' },
    'MWMA_A10_B79-33' : { 'WEB' : 'MWMA_A10_B79-33', 'APP' : 'CMMA_A10_B79-67' },
    'MWMA_A10_B79-71' : { 'WEB' : 'MWMA_A10_B79-71', 'APP' : 'CMMA_A10_B79-69' },
    'MWMA_A10_B79-72' : { 'WEB' : 'MWMA_A10_B79-72', 'APP' : 'CMMA_A10_B79-70' },
    'MWMA_A10_B79-34' : { 'WEB' : 'MWMA_A10_B79-34', 'APP' : 'CMMA_A10_B79-68' },
    'MWMA_A10_B79-73' : { 'WEB' : 'MWMA_A10_B79-73', 'APP' : 'CMMA_A10_B79-74' },

    //홈 노출 요금제
    'MWMA_A10_B79-4' : { 'WEB' : 'MWMA_A10_B79-4', 'APP' : 'CMMA_A10_B79-41' },//5GX Plan
    'MWMA_A10_B79-5' : { 'WEB' : 'MWMA_A10_B79-5', 'APP' : 'CMMA_A10_B79-42' },//5GX Platinum
    'MWMA_A10_B79-6' : { 'WEB' : 'MWMA_A10_B79-6', 'APP' : 'CMMA_A10_B79-43' },//5GX Prime
    'MWMA_A10_B79-7' : { 'WEB' : 'MWMA_A10_B79-7', 'APP' : 'CMMA_A10_B79-44' },//5GX Standard
    'MWMA_A10_B79-8' : { 'WEB' : 'MWMA_A10_B79-8', 'APP' : 'CMMA_A10_B79-45' },//Slim
    'MWMA_A10_B79-9' : { 'WEB' : 'MWMA_A10_B79-9', 'APP' : 'CMMA_A10_B79-46' },//T Plan
    'MWMA_A10_B79-10' : { 'WEB' : 'MWMA_A10_B79-10', 'APP' : 'CMMA_A10_B79-47' },//T Plan Max
    'MWMA_A10_B79-11' : { 'WEB' : 'MWMA_A10_B79-11', 'APP' : 'CMMA_A10_B79-48' },//T Plan Special
    'MWMA_A10_B79-12' : { 'WEB' : 'MWMA_A10_B79-12', 'APP' : 'CMMA_A10_B79-49' },//T Plan Essence
    'MWMA_A10_B79-13' : { 'WEB' : 'MWMA_A10_B79-13', 'APP' : 'CMMA_A10_B79-50' },//T Plan Safety 4G
    'MWMA_A10_B79-14' : { 'WEB' : 'MWMA_A10_B79-14', 'APP' : 'CMMA_A10_B79-51' },//T Plan Safety 2.5G
    'MWMA_A10_B79-15' : { 'WEB' : 'MWMA_A10_B79-15', 'APP' : 'CMMA_A10_B79-52' },//T Plan Save
    'MWMA_A10_B79-16' : { 'WEB' : 'MWMA_A10_B79-16', 'APP' : 'CMMA_A10_B79-53' },//0 Plan
    'MWMA_A10_B79-17' : { 'WEB' : 'MWMA_A10_B79-17', 'APP' : 'CMMA_A10_B79-54' },//0 Plan Large
    'MWMA_A10_B79-18' : { 'WEB' : 'MWMA_A10_B79-18', 'APP' : 'CMMA_A10_B79-55' },//0 Plan Medium
    'MWMA_A10_B79-19' : { 'WEB' : 'MWMA_A10_B79-19', 'APP' : 'CMMA_A10_B79-56' },//0 Plan Small

    //로그인
    'WMMA_A10_B80_C1197_D4347_E398-1' : { 'WEB' : 'WMMA_A10_B80_C1197_D4347_E398-1', 'APP' : 'CMMA_A10_B80_C1197_D4347_E398-2' },

    //전체메뉴
    'MWMA_A10_B80_C1199-2' : { 'WEB' : 'MWMA_A10_B80_C1199-2', 'APP' : 'CMMA_A10_B80_C1199-55' },
    'MWMA_A10_B80_C1199-56' : { 'WEB' : 'MWMA_A10_B80_C1199-56', 'APP' : 'CMMA_A10_B80_C1199-57' },
    'MWMA_A10_B80_C1199-27' : { 'WEB' : 'MWMA_A10_B80_C1199-27', 'APP' : 'CMMA_A10_B80_C1199-54' },


    'MWMA_A10_B80_C1199-1' : {'WEB' :'MWMA_A10_B80_C1199-1','APP' :'CMMA_A10_B80_C1199-29' },
    'MWMA_A10_B80_C1199-3' : {'WEB' :'MWMA_A10_B80_C1199-3','APP' :'CMMA_A10_B80_C1199-30' },
    'MWMA_A10_B80_C1199-4' : {'WEB' :'MWMA_A10_B80_C1199-4','APP' :'CMMA_A10_B80_C1199-31' },
    'MWMA_A10_B80_C1199-5' : {'WEB' :'MWMA_A10_B80_C1199-5','APP' :'CMMA_A10_B80_C1199-32' },
    'MWMA_A10_B80_C1199-6' : {'WEB' :'MWMA_A10_B80_C1199-6','APP' :'CMMA_A10_B80_C1199-33' },
    'MWMA_A10_B80_C1199-7' : {'WEB' :'MWMA_A10_B80_C1199-7','APP' :'CMMA_A10_B80_C1199-34' },
    'MWMA_A10_B80_C1199-8' : {'WEB' :'MWMA_A10_B80_C1199-8','APP' :'CMMA_A10_B80_C1199-35' },
    'MWMA_A10_B80_C1199-9' : {'WEB' :'MWMA_A10_B80_C1199-9','APP' :'CMMA_A10_B80_C1199-36' },
    'MWMA_A10_B80_C1199-10' : {'WEB' :'MWMA_A10_B80_C1199-10','APP' :'CMMA_A10_B80_C1199-37' },
    'MWMA_A10_B80_C1199-11' : {'WEB' :'MWMA_A10_B80_C1199-11','APP' :'CMMA_A10_B80_C1199-38' },
    'MWMA_A10_B80_C1199-12' : {'WEB' :'MWMA_A10_B80_C1199-12','APP' :'CMMA_A10_B80_C1199-39' },
    'MWMA_A10_B80_C1199-13' : {'WEB' :'MWMA_A10_B80_C1199-13','APP' :'CMMA_A10_B80_C1199-40' },
    'MWMA_A10_B80_C1199-14' : {'WEB' :'MWMA_A10_B80_C1199-14','APP' :'CMMA_A10_B80_C1199-41' },
    'MWMA_A10_B80_C1199-15' : {'WEB' :'MWMA_A10_B80_C1199-15','APP' :'CMMA_A10_B80_C1199-42' },
    'MWMA_A10_B80_C1199-16' : {'WEB' :'MWMA_A10_B80_C1199-16','APP' :'CMMA_A10_B80_C1199-43' },
    'MWMA_A10_B80_C1199-17' : {'WEB' :'MWMA_A10_B80_C1199-17','APP' :'CMMA_A10_B80_C1199-44' },
    'MWMA_A10_B80_C1199-18' : {'WEB' :'MWMA_A10_B80_C1199-18','APP' :'CMMA_A10_B80_C1199-45' },
    'MWMA_A10_B80_C1199-19' : {'WEB' :'MWMA_A10_B80_C1199-19','APP' :'CMMA_A10_B80_C1199-46' },
    'MWMA_A10_B80_C1199-20' : {'WEB' :'MWMA_A10_B80_C1199-20','APP' :'CMMA_A10_B80_C1199-47' },
    'MWMA_A10_B80_C1199-21' : {'WEB' :'MWMA_A10_B80_C1199-21','APP' :'CMMA_A10_B80_C1199-48' },
    'MWMA_A10_B80_C1199-22' : {'WEB' :'MWMA_A10_B80_C1199-22','APP' :'CMMA_A10_B80_C1199-49' },
    'MWMA_A10_B80_C1199-23' : {'WEB' :'MWMA_A10_B80_C1199-23','APP' :'CMMA_A10_B80_C1199-50' },
    'MWMA_A10_B80_C1199-28' : {'WEB' :'MWMA_A10_B80_C1199-28','APP' :'CMMA_A10_B80_C1199-58' },
    'MWMA_A10_B80_C1199-24' : {'WEB' :'MWMA_A10_B80_C1199-24','APP' :'CMMA_A10_B80_C1199-51' },
    'MWMA_A10_B80_C1199-25' : {'WEB' :'MWMA_A10_B80_C1199-25','APP' :'CMMA_A10_B80_C1199-52' },
    'MWMA_A10_B80_C1199-26' : {'WEB' :'MWMA_A10_B80_C1199-26','APP' :'CMMA_A10_B80_C1199-53' },


    'MWMA_A10_B81_C1201_D4351-1' : {'WEB' :'MWMA_A10_B81_C1201_D4351-1','APP' :'CMMA_A10_B81_C1201_D4351-2' },


    /**
     * Html(Element) 의 모든 코드정보를 변경
     * @param {*} $element 
     */
    replaceHtmlEidCode: function($element) {
        $element.find('[data-xt_eid^="M"]').each(function() {
            var eid = $(this).data('xt_eid');
            var type = Tw.BrowserHelper.isApp() ? 'APP' : 'WEB';
            var code = Tw.EID_TYPES[eid];
            if( code ) {
                $(this).data('xt_eid', code[type]);
                $(this).attr('data-xt_eid', code[type]);
            }
        })
    }
}
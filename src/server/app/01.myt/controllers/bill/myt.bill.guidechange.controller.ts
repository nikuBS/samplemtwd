/**
 * FileName: myt.bill.guidechange.controller.ts
 * Author: Jung kyu yang (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';

class MytBillGuidechange extends TwViewController {
  constructor() {
    super();
  }

    private getBillTypeInfo(): any {
      const data = {
          // 요금 안내서 설명
        billTypeDesc : {
            'P' : 'T world 홈페이지 또는 모바일 T world 에서 요금안내서를 <BR/> 확인할 수 있습니다.', //  T world 확인
            'H' : '스마트폰의 Bill Letter 앱으로 요금안내서를 받으실 수 있습니다.', // Bill Letter
            'B' : '휴대폰 MMS를 통해 요금안내서를 받으실 <BR/> 수 있습니다.', // 문자요금 안내서
            '2' : '설정하신 이메일로 요금안내서를 받으실 수 있습니다.', // 이메일
            'I' : '스마트폰의 Bill Letter 앱과 설정하신 이메일로 요금안내서를 받으실 수 있습니다.', // Bill Letter + 이메일
            'A' : '휴대폰 MMS와 설정하신 이메일로 요금안내서를 받으실 수 있습니다.', // 문자 + 이메일
            'Q' : '스마트폰의 Bill Letter 앱과 휴대폰 MMS를 통해 요금안내서를 받으실 수 있습니다.', // Bill Letter + 문자
            '1' : '설정하신 기타(우편) 주소로 요금안내서를 받으실 수 있습니다.' // 우편
        },
        // 플리킹 리스트
        billTypeList : [
            {
                'billType': 'P',
                'value': 'T world <BR/>확인',
                'desc': '언제 어디서나 PC와 모바일로 요금을 확인할 수 있는 요금안내서',
                'chgBtnNm' : '"T world 확인"으로 변경하기'
            },
            {
                'billType': 'H',
                'value': 'Bill Letter',
                'desc': '이번 달과 저번 달을 비교해서 알려주는 맞춤형 요금안내서 Bill Letter App',
                'chgBtnNm' : '"Bill Letter"로 변경하기'
            },
            {
                'billType': 'B',
                'value': '문자요금 안내서',
                'desc': '로그인이나 인증없이 휴대폰 MMS로 요금을 확인할 수 있는 서비스',
                'chgBtnNm' : '"문자"로 변경하기'
            },
            {
                'billType': '2',
                'value': '이메일',
                'desc': '설정한 이메일로 편리하게 안내서를 받아 보는 서비스',
                'chgBtnNm' : '"이메일"로 변경하기'
            },
            {
                'billType': 'I',
                'value': 'Bill Letter + 이메일',
                'desc': '스마트폰의 Bill Letter 앱과 설정하신 이메일로 요금안내서를 받으실 수 있습니다.',
                'chgBtnNm' : '"Bill Letter + 이메일"로 변경하기'
            },
            {
                'billType': 'A',
                'value': '문자 + 이메일',
                'desc': '휴대폰 MMS 안내서와 이메일 안내서를 모두 받아 보는 서비스',
                'chgBtnNm' : '"문자 + 이메일"로 변경하기'
            },
            {
                'billType': 'Q',
                'value': 'Bill Letter + 문자',
                'desc': 'Bill Letter 안내서와 휴대폰 MMS 안내서를 함께 받아 보는 서비스',
                'chgBtnNm' : '"Bill Letter + 문자"로 변경하기'
            },
            {
                'billType': '1',
                'value': '기타(우편)',
                'desc': '설정한 주소로 종이 안내서를 받아 보는 서비스',
                'chgBtnNm' : '"기타(우편)"로 변경하기'
            }
        ]
      };

      return data;
    }

  /* 안내서 유형조회(BFF_05_0025) 호출
     URL : /core-bill/v1/bill-types-list/
   */
  private reqBillType(): any {
      const res = {
          code : '00',
          msg: 'success',
          result : {
              curBillType : 'P',
              curBillTypeNm : 'Tworld 확인',
              ccurNotiYn : 'Y', // 법정 대리인 동시통보 유무
              ccurNotiSvcNum : '010-11**-22**', // 법정대리인 동시통보서비스 번호
              smsRecieveYN : 'Y' // SMS 수신불가 유무 ( 이건 아직 미정의 되어 임의생성함)
          }
      };
      return res;
  }

  /*
    요금안내서 플리킹 리스트
    현재 사용중인 요금안내서는 추가하지 않는다.
   */
  private getFlickingList(curBillType: any, flickingList: any): any {
      const billTypeList = flickingList.filter( (line) => {
          return line.billType !== curBillType;
      });
      return billTypeList;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
      // svcInfo.svcCnt = 2;
      const billTypeInfo = this.getBillTypeInfo();
      const billType = this.reqBillType().result;

      billType.curBillTypeText =  billTypeInfo.billTypeDesc[billType.curBillType];
      billType.billTypeList = this.getFlickingList( billType.curBillType, billTypeInfo.billTypeList );
      // billType.flickingTypeText = billType.billTypeList[0].desc;

      res.render('bill/myt.bill.guidechange.html', { svcInfo : svcInfo, billType : billType });
  }


}

export default MytBillGuidechange;

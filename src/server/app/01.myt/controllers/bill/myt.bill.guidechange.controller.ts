/**
 * FileName: myt.bill.guidechange.controller.ts
 * Author: Jung kyu yang (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { Request, Response, NextFunction } from 'express';
import { MYT_GUIDE_CHANGE_INIT_INFO } from '../../../../types/string.type';

class MytBillGuidechange extends TwViewController {
  constructor() {
    super();
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
      const billTypeInfo = MYT_GUIDE_CHANGE_INIT_INFO;
      const billType = this.reqBillType().result;

      billType.curBillTypeText =  billTypeInfo.billTypeDesc[billType.curBillType];
      billType.billTypeList = this.getFlickingList( billType.curBillType, billTypeInfo.billTypeList );

      res.render('bill/myt.bill.guidechange.html', { svcInfo : svcInfo, billType : billType });
  }

}

export default MytBillGuidechange;

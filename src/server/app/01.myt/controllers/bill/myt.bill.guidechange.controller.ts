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
    회선(핸드폰,Twibro, 인터넷/집전화/IPTV) 에 맞는 요금 안내서 리스트를 만든다.
   */
  private getFlickingList(flickingList: any, svcInfo: any): any {
      const billTypeList = flickingList.filter( (line) => {
          if ( svcInfo.svcAttrCd === 'M5' ) {
              // T wibro
              return ',P,2,1'.indexOf(line.billType) > 0 ? true : false;
          } else if ( ['S1', 'S2' , 'S3'].some( e => e === svcInfo.svcAttrCd ) ) {
              // 인터넷/집전화/IPTV
            return ['P', 'H', 'B', '2', 'I', 'A', '1'].some( e => e === line.billType );
          }
          return true;
      });
      return billTypeList;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
      const data = Object.assign(this.reqBillType(), MYT_GUIDE_CHANGE_INIT_INFO) ;

      // billType.curBillTypeText =  billTypeInfo.billTypeDesc[billType.curBillType];
      data.billTypeList = this.getFlickingList(  data.billTypeList, svcInfo );
      res.render('bill/myt.bill.guidechange.html', { svcInfo : svcInfo, data : data });
  }

}

export default MytBillGuidechange;

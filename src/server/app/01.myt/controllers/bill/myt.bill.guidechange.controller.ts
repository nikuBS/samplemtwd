/**
 * FileName: myt.bill.guidechange.controller.ts
 * Author: Jung kyu yang (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {MYT_GUIDE_CHANGE_INIT_INFO} from '../../../../types/string.type';
import {Observable} from 'rxjs/Observable';
import {API_CMD} from '../../../../types/api-command.type';
import {SVC_ATTR} from '../../../../types/bff-common.type';

class MytBillGuidechange extends TwViewController {
  constructor() {
    super();
  }

  /* 안내서 유형조회(BFF_05_0025) 호출
     URL : /core-bill/v1/bill-types-list/
   */
  private reqBillType(): any {
    const res = {
      code: '00',
      msg: 'success',
      result: {
        curBillType: 'P',
        curBillTypeNm: 'Tworld 확인',
        ccurNotiYn: 'Y', // 법정 대리인 동시통보 유무
        ccurNotiSvcNum: '010-11**-22**', // 법정대리인 동시통보서비스 번호
        smsRecieveYN: 'Y' // SMS 수신불가 유무 ( 이건 아직 미정의 되어 임의생성함)
      }
    };
    return res;
  }

  /*
    요금안내서 플리킹 리스트
    회선(핸드폰,Twibro, 인터넷/집전화/IPTV) 에 맞는 요금 안내서 리스트를 만든다.
   */
  private getFlickingList(flickingList: any, svcInfo: any): any {
    const billTypeList = flickingList.filter((line) => {
      if (svcInfo.svcAttrCd === 'M5') {
        // T wibro
        return ',P,2,1'.indexOf(line.billType) > 0 ? true : false;
      } else if (['S1', 'S2', 'S3'].some(e => e === svcInfo.svcAttrCd)) {
        // 인터넷/집전화/IPTV
        return ['P', 'H', 'B', '2', 'I', 'A', '1'].some(e => e === line.billType);
      }
      return true;
    });
    return billTypeList;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    // 현재 사용중인 요금안내서 조회
    const billTypeReq: Observable<any> = this.apiService.request(API_CMD.BFF_05_0025, {});
    // 통합청구회선 조회
    const itgSvcReq: Observable<any> =  this.apiService.request(API_CMD.BFF_05_0049, {});
    // 선택회선 조회
    const selectedSessionReq: Observable<any> =  this.apiService.request(API_CMD.BFF_01_0005, {});
    Observable.combineLatest(
      billTypeReq,
      itgSvcReq,
      selectedSessionReq
    ).subscribe(([billTypeInfo, integraionService, selectedSession]) => {
      if ( integraionService.code !== '00' ) {
        integraionService = {result : []};
      }

      svcInfo = Object.assign({}, selectedSession.result);
      const data = {
        billTypeDesc : MYT_GUIDE_CHANGE_INIT_INFO.billTypeDesc,
        billTypeList : this.getFlickingList(MYT_GUIDE_CHANGE_INIT_INFO.billTypeList, svcInfo),
        billTypeInfo : billTypeInfo.result,
        itgSvc : integraionService.result,
        representSvcNum : '', // 대표회선 번호
        representYN : 'Y',  // 대표회선 여부
        integYN : integraionService.result.length > 1 ? 'Y' : 'N', // 통합회선 여부
        lineType : SVC_ATTR[svcInfo.svcAttrCd]
      };

      let path = 'bill/myt.bill.guidechange.html';
      // 통합대표회선 대표회선 아닌경우 확인
      if ( data.integYN === 'Y') {
        const imsiArr = data.itgSvc.filter( (line) => {
          if ( line.acntRepYN === 'Y' ) {
            if ( svcInfo.svcMgmtNum !== line.svcMgmtNum ) {
              data.representSvcNum = line.svcNum;
              data.representYN = 'N';
              path = 'bill/myt.bill.guidechange.noRepresent.html';
            }
          }
        });
        this.logger.info('.', '>>>>>> ', JSON.stringify(data));
      } else {
        this.logger.info('.', '>>>>>> 개별 회선이다');
      }

      res.render(path, { svcInfo: svcInfo, data: data });
      // res.render('bill/myt.bill.guidechange.html', { svcInfo: svcInfo, data: data });
    });
  }
}

export default MytBillGuidechange;

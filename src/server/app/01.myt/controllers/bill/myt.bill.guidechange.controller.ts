/**
 * FileName: myt.bill.guidechange.controller.ts
 * Author: Jung kyu yang (skt.P130715@partner.sk.com)
 * Date: 2018.07.05
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {MYT_GUIDE_CHANGE_INIT_INFO} from '../../../../types/string.type';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {SVC_ATTR} from '../../../../types/bff-common.type';

class MytBillGuidechange extends TwViewController {
  constructor() {
    super();
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
        if ( ['P', 'H', 'B', '2', 'I', 'A', '1'].some(e => e === line.billType) ) {
          // 유선의 경우 코드가 다르기 때문에 변환해준다.
          if ( line.billType === 'H' ) {
            line.billType = 'J';
          } else if ( line.billType === 'I' ) {
            line.billType = 'K';
          }
          return true;
        } else {
          return false;
        }
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
    Observable.combineLatest(
      billTypeReq,
      itgSvcReq
    ).subscribe(([billTypeInfo, integInfo]) => {
      const data = this.getResult({}, billTypeInfo, integInfo, svcInfo);
      res.render( data.path, { data: data, svcInfo } );
    });
  }

  private getResult(data: any, billTypeInfo: any, integInfo: any, svcInfo: any): any {
    if ( integInfo.code !== API_CODE.CODE_00 ) {
      data = {
        representYN : 'N',
        path : 'bill/myt.bill.guidechange.noRepresent.html'
      };
      return data;
    }

    // 대표회선여부 확인
    integInfo.result.map( (line) => {
      // 현재 요소가 대표회선일 때
      if ( line.acntRepYN === 'Y' ) {
        // 현재 서비스 번호와 로그인회선의 서비스 번호가 다르면 현재 회선은 대표회선이 아니다.
        if ( svcInfo.svcMgmtNum !== line.svcMgmtNum ) {
          data = {
            representSvcNum : line.svcNum,
            representYN : 'N',
            path : 'bill/myt.bill.guidechange.noRepresent.html'
          };
        }
      }
    });

    // 대표회선이 아닌경우 다음 스텝 진행하지 않는다.
    if ( data.representYN === 'N' ) {
      return data;
    }

    // 성공
    if ( billTypeInfo.code === API_CODE.CODE_00 ) {
      data = {
        billTypeDesc : MYT_GUIDE_CHANGE_INIT_INFO.billTypeDesc,
        billTypeList : this.getFlickingList(MYT_GUIDE_CHANGE_INIT_INFO.billTypeList, svcInfo),
        billTypeInfo : billTypeInfo.result,
        itgSvc : integInfo.result,
        representSvcNum : '', // 대표회선 번호
        representYN : 'Y',  // 대표회선 여부
        integYN : integInfo.result.length > 1 ? 'Y' : 'N', // 통합회선 여부
        lineType : SVC_ATTR[svcInfo.svcAttrCd],
        path : 'bill/myt.bill.guidechange.html'
      };

    } else {
      if ( billTypeInfo.code !== '00' ) {
        this.logger.error(this, '[API CALL:BFF_05_0025 ERROR] : ', billTypeInfo);
      } else if ( integInfo.code !== '00' ) {
        this.logger.error(this, '[API CALL:BFF_05_0049 ERROR] : ', integInfo);
      }

      data = {
        path : 'bill/myt.bill.guidechange.noRepresent.html'
      };
    }

    return data;
  }
}

export default MytBillGuidechange;

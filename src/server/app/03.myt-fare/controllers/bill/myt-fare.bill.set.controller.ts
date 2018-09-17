/**
 * FileName: myt-fare.bill.set.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.09.12
 */
import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MYT_FARE_BILL_TYPE} from '../../../../types/string.type';
import {MyTBillSetData} from '../../../../mock/server/myt.fare.bill.set.mock';

class MyTFareBillSet extends TwViewController {
  private _svcInfo: any;
  constructor() {
    super();
  }
  get svcInfo() {
    return this._svcInfo;
  }
  set svcInfo( __svcInfo: any ) {
    this._svcInfo = __svcInfo;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, layerType: string) {
    this.svcInfo = svcInfo;
    Observable.combineLatest(
      this.reqBillType()
    ).subscribe(([resBillType]) => {
      if ( resBillType.code === API_CODE.CODE_00) {
        const data = this.getData(resBillType.result, svcInfo);
        res.render( 'bill/myt-fare.bill.set.html', data );
      } else {
        this.fail(res, resBillType, svcInfo);
      }
    });
  }

  private getData(data: any, svcInfo: any): any {

    const billType = this.getBillTypeName(data);

    return {
      svcInfo,
      data,
      billType
    };
  }

  // API Response fail
  private fail(res: Response, data: any, svcInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      svcInfo: svcInfo
    });
  }

  // 현재 회선 타입
  private getLinetype(): any {
    switch (this.svcInfo.svcAttrCd) {
      case 'M1':  // 휴대폰
      case 'M3':  // T pocket FI
      case 'M4':  // T Login
        return 'M'; // 모바일

      case 'M5':  // T Wibro
        return 'W'; // T Wibro

      case 'S1' :
      case 'S2' :
      case 'S3' :
        return 'S'; // 인터넷/집전화/IPTV

      case 'O1' :
        return 'O'; // 보안 솔루션

      default :
        return 'X'; // 현재 회선은 권한 없음.
    }
  }

  // 안내서 유형 조회
  private reqBillType(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0025, {});
  }

  // 안내서 유형 조회 목업
  private mockReqBillType(): Observable<any> {
    return Observable.create((observer) => {
      observer.next(MyTBillSetData);
      observer.complete();
    });
  }

  // 안내서 유형 이름 만들기
  private getBillTypeName(data: any): any {
    const curBillType = data.curBillType;
    const billType = {
      title : MYT_FARE_BILL_TYPE[curBillType],
      join : MYT_FARE_BILL_TYPE.X
    };
    // 요금안내서명 세팅
    // Bill Letter 를 포함한 복합 안내서 일경우
    if ( ['Q', 'I', 'K'].some( e => e === curBillType ) ) {
      billType.title = MYT_FARE_BILL_TYPE.H; // Bill Letter
      // Q ( Bill Letter + 문자 )
      if ( 'Q' === curBillType ) {
        billType.join = MYT_FARE_BILL_TYPE.B;
      } else if ( ['I', 'K'].some( e => e === curBillType ) ) { // Bill Letter + 이메일
        billType.join = MYT_FARE_BILL_TYPE['2'];
      }
    } else if ( 'A' === curBillType ) { // 문자 + 이메일
      billType.title = MYT_FARE_BILL_TYPE.B; // 문자
      billType.join = MYT_FARE_BILL_TYPE['2']; // 이메일
    }

    return billType;
  }

}

export default MyTFareBillSet;

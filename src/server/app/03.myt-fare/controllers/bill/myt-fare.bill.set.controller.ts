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

    // const billType = this.getBillTypeName(data);
    this.makeBillInfo(data);
    this.makeAnotherBillList(data);

    return {
      svcInfo,
      data
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

  /*
    안내서 유형 설정
    무선회선을 기본으로 하여, 유선일 경우 무선 유형으로 변경해준다.
    최종적으로 안내서 변경 요청시 다시 유선 코드로 변경해서 보낸다.
  */
  private convertCd(data: any): void {
    if ( 'M' === this.getLinetype() ) {
      return;
    }

    let curBillType = data.curBillType;

    // Bill Letter
    switch (curBillType) {
      case 'J' : curBillType = 'H'; break;  // Bill Letter
      case 'K' : curBillType = 'I'; break;  // Bill Letter + 이메일

      default : break;
    }
  }

  private pushBillInfo(billData: any, billType): void {
    billData.push({
      cd : billType,
      nm : MYT_FARE_BILL_TYPE[billType]
    });
  }

  // 안내서 유형 정보 세팅
  private makeBillInfo(data: any): void {
    this.convertCd(data);
    const curBillType = data.curBillType;
    const billArr = new Array();
    this.pushBillInfo(billArr, curBillType);
    switch (curBillType) {
      // Bill Letter + 문자
      case 'Q' :
        this.pushBillInfo(billArr, 'B');
        break;
      // Bill Letter + 이메일 or 문자 + 이메일
      case 'I' :
      // 문자 + 이메일
      case 'A' :
        this.pushBillInfo(billArr, '2');
        break;
      default :
        this.pushBillInfo(billArr, 'X');
        break;
    }

    data.billInfo = billArr;
  }

  // 하단 > "다른 요금안내서로 받기" 리스트
  private makeAnotherBillList(data: any): void {
    const billList = new Array();

    'P,H,B,2,1'.split(',').forEach( (cd) => {
      // 현재 안내서는 빼기
      if ( cd !== data.curBillType ) {
        this.pushBillInfo(billList, cd);
      }
    });

    data.billList = billList;
  }


}

export default MyTFareBillSet;

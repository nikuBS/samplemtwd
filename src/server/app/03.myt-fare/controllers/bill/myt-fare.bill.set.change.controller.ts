/**
 * FileName: myt-fare.bill.set.change.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.09.18
 * 나의요금 > 요금 안내서 설정 > 안내서 변경
 */
import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {MyTBillSetData} from '../../../../mock/server/myt.fare.bill.set.mock';

class MyTFareBillSetChange extends TwViewController {

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
    // res.render('bill/myt-fare.bill.set.change.html', {svcInfo});

    this.svcInfo = svcInfo;
    Observable.combineLatest(
      this.mockReqBillType()
    ).subscribe(([resBillType]) => {
      if ( resBillType.code === API_CODE.CODE_00) {
        const data = this.getData(resBillType.result, svcInfo);
        res.render( 'bill/myt-fare.bill.set.change.html', data );
      } else {
        this.fail(res, resBillType, svcInfo);
      }
    });
  }

  private getData(data: any, svcInfo: any): any {
    Object.assign(data, this.createBillType(data));
    return {
      svcInfo,
      data
    };
  }

  private createBillType (data: any): any {
    const curBillType = data.curBillType;
    const _data = {
      isMulti : false,
      billTypeTxt : ''
    };
    if ( 'P' === curBillType ) {
      _data.billTypeTxt = 'tWorld';
    } else if ( ['H', 'J', 'Q', 'I', 'K'].some( e => e === curBillType ) ) {
      _data.billTypeTxt = 'billLetter';
    } else if ( ['B', 'A'].some( e => e === curBillType ) ) {
      _data.billTypeTxt = 'sms';
    }
    _data.isMulti = _data.billTypeTxt !== '' ? true : false;

    return _data;
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

  // API Response fail
  private fail(res: Response, data: any, svcInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      svcInfo: svcInfo
    });
  }
}

export default MyTFareBillSetChange;

/**
 * FileName: myt-fare.bill.set.common.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.09.20
 */
import {NextFunction, Request, Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {MYT_FARE_BILL_TYPE} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD} from '../../../../types/api-command.type';
import {MyTBillSetData} from '../../../../mock/server/myt.fare.bill.set.mock';

abstract class MyTFareBillSetCommon extends TwViewController {

  protected _svcInfo: any;

  // 지역번호 앞자리 컨버팅
  private _tel1: any = {
    '0010' : '010',
    '0011' : '011',
    '0012' : '012',
    '0015' : '015',
    '0016' : '016',
    '0017' : '017',
    '0018' : '018',
    '0019' : '019',
    '0002' : '02',
    '0031' : '031',
    '0032' : '032',
    '0033' : '033',
    '0041' : '041',
    '0042' : '042',
    '0043' : '043',
    '0044' : '044',
    '0051' : '051',
    '0052' : '052',
    '0053' : '053',
    '0054' : '054',
    '0055' : '055',
    '0061' : '061',
    '0062' : '062',
    '0063' : '063',
    '0064' : '064',
    '0070' : '070',
    '0502' : '0502',
    '0504' : '0504',
    '0505' : '0505',
    '0506' : '0506'
  };

  private _getTel1(tel1: string): any {
    return this._tel1[tel1] || tel1;
  }


  constructor() {
    super();
  }
  protected get svcInfo() {
    return this._svcInfo;
  }
  protected set svcInfo( __svcInfo: any ) {
    this._svcInfo = __svcInfo;
  }

  // API Response fail
  protected fail(res: Response, data: any, svcInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      svcInfo: svcInfo
    });
  }

  // 현재 회선 타입
  protected getLinetype(): any {
    // return 'S';
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

  /*
    안내서 유형 설정
    무선회선을 기본으로 하여, 유선일 경우 무선 유형으로 변경해준다.
    최종적으로 안내서 변경 요청시 다시 유선 코드로 변경해서 보낸다.
  */
  protected convertCd(data: any): void {
    /*if ( 'M' === this.getLinetype() ) {
      return;
    }*/

    let curBillType = data.curBillType;

    // Bill Letter
    switch (curBillType) {
      case 'J' : curBillType = 'H'; break;  // Bill Letter
      case 'K' : curBillType = 'I'; break;  // Bill Letter + 이메일

      default : break;
    }
    data.curBillType = curBillType;
  }

  protected pushBillInfo(billData: any, billType: any): void {
    billData.push({
      cd : billType,
      nm : MYT_FARE_BILL_TYPE[billType]
    });
  }

  // 안내서 유형 정보 세팅
  protected makeBillInfo(data: any): void {
    this.convertCd(data);
    const curBillType = data.curBillType;
    let convertBillType = curBillType;
    const billArr = new Array();

    // Bell Letter 포함 안내서 는 'H' 로 통합
    convertBillType = ['Q', 'I'].some( e => e === convertBillType ) ? 'H' : convertBillType;

    // 문자 포함 안내서는 문자(B) 로 통합
    convertBillType = convertBillType === 'A' ? 'B' : convertBillType;

    this.pushBillInfo(billArr, convertBillType);
    switch (curBillType) {
      // T world 확인
      case 'P' :
        if (data.isusimchk === 'Y' && data.nreqGuidSmsSndYn === 'Y') {
          this.pushBillInfo(billArr, 'B');
          break;
        }
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

  protected parseData(data: any): void {
    this.parseTel(data);

    // 법정 대리인 동시 통보 번호
    if ( data.kidsYn === 'Y' && !FormatHelper.isEmpty(data.ccurNotiSvcNum) ) {
      data.ccurNotiSvcNum = FormatHelper.conTelFormatWithDash(data.ccurNotiSvcNum);
    }

    // Bill Letter >  휴대폰 번호
    if ( !FormatHelper.isEmpty(data.wireSmtBillSvcNum) ) {
      data.wireSmtBillSvcNum = FormatHelper.conTelFormatWithDash(data.wireSmtBillSvcNum);
    }

    // 문자 > 휴대폰 번호
    if ( !FormatHelper.isEmpty(data.wsmsBillSndNum) ) {
      data.wsmsBillSndNum = FormatHelper.conTelFormatWithDash(data.wsmsBillSndNum);
    }
  }

  // 기타(우편) 일 때 연락처 포맷팅
  protected parseTel(data: any): void {
    if ( data.curBillType !== '1' || FormatHelper.isEmpty(data.cntcNum1) || data.cntcNum1.length !== 12 ) {
      return;
    }

    const tel = data.cntcNum1;
    let tel1 = tel.substring(0, 4);
    tel1 = this._tel1[tel1] || tel1;
    const tel2 = FormatHelper.normalizeNumber(tel.substr(4, 4));
    data.cntcNum1 = `${tel1}-${tel2}-${tel.substring(8)}`;
  }

  // 안내서 유형 조회
  protected reqBillType(): Observable<any> {
    return this.apiService.request(API_CMD.BFF_05_0025, {});
  }

  // 안내서 유형 조회 목업
  protected mockReqBillType(): Observable<any> {
    return Observable.create((observer) => {
      observer.next(  FormatHelper.objectClone(MyTBillSetData) );
      observer.complete();
    });
  }

}

export default MyTFareBillSetCommon;

/**
 * FileName: myt-fare.bill.set.common.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.09.20
 */
import {Response} from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {MYT_FARE_BILL_TYPE} from '../../../../types/string.type';
import FormatHelper from '../../../../utils/format.helper';
import {Observable} from 'rxjs/Observable';
import {API_CMD} from '../../../../types/api-command.type';
import {MyTBillSetData} from '../../../../mock/server/myt.fare.bill.set.mock';
import StringHelper from '../../../../utils/string.helper';

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
  protected fail(res: Response, data: any, svcInfo: any, pageInfo: any): void {
    this.error.render(res, {
      code: data.code,
      msg: data.msg,
      svcInfo: svcInfo,
      pageInfo: pageInfo
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
    2019.01.19 구 코드(기타우편) 현 코드로 변경 추가
  */
  protected convertCd(data: any): void {
    let curBillType = data.curBillType;

    // Bill Letter
    switch (curBillType) {
      case 'J' : curBillType = 'H'; break;  // Bill Letter
      case 'K' : curBillType = 'I'; break;  // Bill Letter + 이메일
      default :
        if (['4', '5', '8', 'C'].indexOf(curBillType) > -1) {
          curBillType = '1';
        }
        break;
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

    // 현재 요금안내서 설정하기
    // 우편 + 전자추가발송 유형 추가
    /*
        U:우편+문자
        W:우편+Bill Letter
        T:우편+문자+Bill Letter
        Y:우편+이메일+Bill Letter
        X:우편+이메일+문자
     */
    if (['U', 'W', 'T', 'Y', 'X'].indexOf(convertBillType) !== -1) {
      this.pushBillInfo(billArr, 'ADD');
    } else {
      this.pushBillInfo(billArr, convertBillType);
    }

    // 함께 받는 요금안내서 설정
    // A:문자 + 이메일
    if (['A', 'I', 'K', 'Y', 'X'].indexOf(curBillType) !== -1) {
      this.pushBillInfo(billArr, '2');  // 이메일 추가
    }
    // Q:Bill Letter + 문자
    if (['Q', 'U', 'T', 'X'].indexOf(curBillType) !== -1) {
      this.pushBillInfo(billArr, 'B');  // "문자" 추가
    }
    if (['W', 'T', 'Y'].indexOf(curBillType) !== -1) {
      this.pushBillInfo(billArr, 'H');
    }

    // T월드 확인, 이메일, 우편은 함께 받는 안내서가 없다.
    if (billArr.length === 1 && ['P', '2', '1'].indexOf(curBillType) === -1) {
      this.pushBillInfo(billArr, 'X');
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
    if ( FormatHelper.isEmpty(data.cntcNum1) || data.cntcNum1.length < 9 || data.cntcNum1.length > 12 ) {
      return;
    }

    data.cntcNum1 = StringHelper.phoneStringToDash(data.cntcNum1);
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

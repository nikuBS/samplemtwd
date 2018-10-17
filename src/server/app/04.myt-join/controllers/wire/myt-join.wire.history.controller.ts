/**
 * FileName: myt-join.wire.history.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';


class MyTJoinWireHistory extends TwViewController {

  // BFF API TYPEs
  private _ATYPE_167: String = '167';  // 신규가입상세내역
  private _ATYPE_162: String = '162';  // 설치장소변경상세
  private _ATYPE_168: String = '168';  // 가입상품변경 상세내역
  private _ATYPE_143: String = '143';  // 유선 약정기간 상세내역
  private _ATYPE_153: String = '153';  // 요금상품변경 상세내역

  private _list: Array<Object> = [];

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    console.log('============ call 5 API commands ==============');
    this._list = [];

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0167, {}),
      this.apiService.request(API_CMD.BFF_05_0162, {}),
      this.apiService.request(API_CMD.BFF_05_0168, {}),
      this.apiService.request(API_CMD.BFF_05_0143, {}),
      this.apiService.request(API_CMD.BFF_05_0153, {}))
      .subscribe(([r0167newJoin, r0162chgAddr, r0168prodChg, r0143periChg, r0153prodChg]) => {

        r0167newJoin = {
          'code': '00',
          'msg': 'success',
          'result': [{
            'apiNm': '신규신청',
            'rcvSeq': '접수번호',
            'svcMgmtNum': '접수관련 서비스관리번호',
            'stNm': '기사배정상태',
            'rcvDt': '20180102',
            'custNm': '고객명',
            'svcPrefrDtm': '희망일시',
            'svcNm': '신청서비스명1',
            'svcNmDtl': '신청서비스명2',
            'addr': '설치장소',
            'wireRegistOss': {
              'adjPrefrSvsetDtm': '개통예정일시',
              'happyOperId': '행복기사 사진',
              'happyOperNm': '행복기사 이름',
              'happyOperPhonNum': '행복기사 전화번호',
              'happyOperCoNm': '행복기사 소속',
              'happyCoordiId': '행복코디 사진',
              'happyCoordiNm': '행복코디 이름',
              'happyCoordiPhonNum': '행복코디 전화번호'
            }
          }]
        };

        r0162chgAddr = {
          'code': '00',
          'msg': 'success',
          'result': {
            'contRsltClCd': 'TM신청처리상태코드',
            'occrDt': '20171125',
            'occrTm': '발생시각',
            'cntcPrefrPhonNum': '일반전화',
            'cntcPrefrMblPhonNum': '이동전화',
            'svcNm': '현재사용서비스명',
            'reqrNm': '신청인명',
            'mvDt': '이사일자',
            'basAddr': '설치장소 변경후 기본주소',
            'dtlAddr': '설치장소 변경후 상세주소',
            'stopPrefrDt': '중단희망일자',
            'setPrefrDt': '설치희망일자',
            'reqSiteClCd': '요청사이트구분',
            'bldTypNm': '건물유형명'
          }
        };
        r0168prodChg = {
          'code': '00',
          'msg': 'success',
          'result':
            [{
              'apiNm': '업무구분',
              'rcvDt': '20160602',
              'custNm': '고객명',
              'svcPrefrDtm': '희망일시',
              'svcNm': '신청서비스명1',
              'svcNmDtl': '신청서비스명2',
              'addr': '설치장소',
              'stNm': '진행상태',
              'ossOut': {
                'adjPrefrSvsetDtm' : '개통/변경 예정일',
                'happyOperNm' : '행복기사명',
                'happyOperPhonNum' : '행복기사전화번호',
                'happyCoordiNm' : '행복코디명',
                'happyCoordiPhonNum' : '행복코디 전화번호',
                'operCoNm' : '관리 고객센터명',
                'operCoPhonNum' : '관리 고객센터 전화번호',
                'happyOperCoNm' : '행복기사소속',
                'happyOperId' : '행복기사 사진ID',
                'happyCoordiId' : '행복코디 사진ID'
              }
            }]
        };
        r0143periChg = {
          'code': '00',
          'msg': 'success',
          'result': [
            {
              'apiNm': '약정기간 변경',
              'stNm': '미접촉',
              'rcvDt': '20181002',
              'beforeTerm': '무약정',
              'afterTerm': '1년',
              'normalNum': '01012**56**',
              'phoneNum': '01087**43**',
              'svcNm': '5서비스정기계약할인'
            },
            {
              'apiNm': '약정기간 변경',
              'stNm': '미접촉',
              'rcvDt': '20181001',
              'beforeTerm': '무약정',
              'afterTerm': '3년',
              'normalNum': '010**46***',
              'phoneNum': '01037**12**',
              'svcNm': '5서비스정기계약할인'
            },
            {
              'apiNm': '약정기간 변경',
              'stNm': '미접촉',
              'rcvDt': '20181001',
              'beforeTerm': '무약정',
              'afterTerm': '3년',
              'normalNum': '01011**22**',
              'phoneNum': '01088**99**',
              'svcNm': ''
            }
          ]
        };
        r0153prodChg = {
          'code': '00',
          'msg': 'success',
          'result': [
            {
              'apiNm': '요금상품 변경',
              'stNm': '미접촉',
              'rcvDt': '20180927',
              'mediaNm': '인터넷',
              'prodNm': '스마트요금제 광랜',
              'normalNum': '0255*54444',
              'phoneNum': '010666*7777',
              'svcNm': '인터넷(광랜FTTH(GB))'
            },
            {
              'apiNm': '요금상품 변경',
              'stNm': '미접촉',
              'rcvDt': '20180927',
              'mediaNm': '인터넷',
              'prodNm': '표준요금제 광랜',
              'normalNum': '0222*23333',
              'phoneNum': '010111*4444',
              'svcNm': '인터넷(광랜FTTH(GB))'
            }
          ]
        };




        this._resultHandler(r0167newJoin, this._ATYPE_167);
        this._resultHandler(r0162chgAddr, this._ATYPE_162);
        this._resultHandler(r0168prodChg, this._ATYPE_168);
        this._resultHandler(r0143periChg, this._ATYPE_143);
        this._resultHandler(r0153prodChg, this._ATYPE_153);

        console.log('all list ==>> ', this._list);
        const option = { svcInfo: svcInfo, list: this._list };
        res.render('wire/myt-join.wire.history.html', option);
      });
  }

  private _resultHandler( resp: any, apiType: String ): boolean {
    if ( resp.code === API_CODE.CODE_00 ) {

      const list: any = resp.result;
      if ( !Array.isArray(list) ) {
        console.log('r' + apiType + ' ok!! object');
        list['atype'] = apiType;
      } else {
        console.log('r' + apiType + ' ok!! size:' + list.length);
        for ( let i = 0; i < list.length; i++ ) {
          list[i]['atype'] = apiType;
        }
      }
      this._list = this._list.concat(list);
    } else {
      // log 남기기
      return false;
    }
    return true;
  }
}

export default MyTJoinWireHistory;


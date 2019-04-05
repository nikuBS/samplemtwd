/**
 * MenuName: 나의 가입정보 > 서브메인 > 인터넷/집전화/IPTV 신청현황(MS_04_01_01)
 * @file myt-join.wire.history.js
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.08
 * Summary: 인터넷/집전화/IPTV 신청현황 목록 조회
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { MYT_JOIN_WIRE } from '../../../../types/string.type';


class MyTJoinWireHistory extends TwViewController {

  constructor() {
    super();
  }

  // BFF API TYPEs
  static _ATYPE_167: String = '167';  // 신규가입상세내역
  static _ATYPE_162: String = '162';  // 설치장소변경상세
  static _ATYPE_168: String = '168';  // 가입상품변경 상세내역
  static _ATYPE_143: String = '143';  // 유선 약정기간 상세내역
  static _ATYPE_153: String = '153';  // 요금상품변경 상세내역

  private _list: Array<Object> = [];

  /**
   * api 조회시 키가 없으므로 값들을 조합해 key를 만들고 상세화면 조회시 데이터를 파악할 수 있도록 함.
   * @param obj
   * @param atype
   */
  static getDetailKey( obj: Object, atype: String ): String {

    if ( atype === MyTJoinWireHistory._ATYPE_167 ) {
      return obj['rcvDt'] + obj['rcvSeq'];
    } else if ( atype === MyTJoinWireHistory._ATYPE_162 ) {
      return obj['occrDt'] + obj['occrTm'];
    } else if ( atype === MyTJoinWireHistory._ATYPE_168 ) {
      return obj['rcvDt'] + obj['svcPrefrDtm'] + obj['svcNm'] + obj['svcNmDtl'];
    } else if ( atype === MyTJoinWireHistory._ATYPE_143 ) {
      return obj['rcvDt'] + obj['stNm'] + obj['svcNm'] + obj['beforeTerm'] + obj['afterTerm'];
    } else if ( atype === MyTJoinWireHistory._ATYPE_153 ) {
      return obj['rcvDt'] + obj['stNm'] + obj['svcNm'] + obj['mediaNm'] + obj['prodNm'];
    }
    return '';
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    // if ( svcInfo.svcAttrCd.indexOf('S') === -1 ) {
    //   return this.error.render(res, {
    //     title: MYT_JOIN_WIRE.HISTORY.TITLE,
    //     svcInfo: svcInfo
    //   });
    // }

    this._list = [];

    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_05_0167, {}),   // 신규가입상세내역
      this.apiService.request(API_CMD.BFF_05_0162, {}),   // 설치장소변경상세
      this.apiService.request(API_CMD.BFF_05_0168, {}),   // 가입상품변경 상세내역
      this.apiService.request(API_CMD.BFF_05_0143, {}),   // 유선 약정기간 상세내역
      this.apiService.request(API_CMD.BFF_05_0153, {}))   // 요금상품변경 상세내역
      .subscribe(([r0167newJoin, r0162chgAddr, r0168prodChg, r0143periChg, r0153prodChg]) => {

/*
        console.log('r0167newJoin  - ', r0167newJoin);
        console.log('r0162chgAddr  - ', r0162chgAddr);
        console.log('r0168prodChg  - ', r0168prodChg);
        console.log('r0143periChg  - ', r0143periChg);
        console.log('r0153prodChg  - ', r0153prodChg);

        r0167newJoin = {
          'code': '00',
          'msg': 'success',
          'result': [{
            'apiNm': '신규신청',
            'rcvSeq': '접수번호',
            'svcMgmtNum': '접수관련 서비스관리번호',
            'stCd': '1',    // 1접수중, 2처리요청중, F진행중, T기사배정, 3처리완료, 4접수취소, 5취소요청
            'stNm': '접수중',
            'rcvDt': '20180102',
            'custNm': '홍길동1',
            'svcPrefrDtm': '20180102125959',
            'svcNm': '(case1) 신청서비스명1',
            'svcNmDtl': '신청서비스명2',
            'addr': '설치장소1'
          }, {
            'apiNm': '신규신청',
            'rcvSeq': '접수번호',
            'svcMgmtNum': '접수관련 서비스관리번호',
            'stCd': 'T',    // 1접수중, 2처리요청중, F진행중, T기사배정, 3처리완료, 4접수취소, 5취소요청
            'stNm': '기사배정',
            'rcvDt': '20180102',
            'custNm': '홍길동1',
            'svcPrefrDtm': '20180102125959',
            'svcNm': '(case2) 신청서비스명1',
            'svcNmDtl': '신청서비스명2',
            'addr': '설치장소1',
            'wireRegistOss': {
              'adjPrefrSvsetDtm': '20180102125959',
              'happyOperId': '행복기사 사진id',
              'happyOperNm': '행복기사 이름',
              'happyOperPhonNum': '01011112222',
              'happyOperCoNm': '행복기사 소속',
              'happyCoordiId': '행복코디 사진',
              'happyCoordiNm': '행복코디 이름',
              'happyCoordiPhonNum': '01033334444'
            }
          }]
        };

        r0162chgAddr = {
          'code': '00',
          'msg': 'success',
          'result': [{
            'stNm': '접수중',
            'onOff': '02',
            'occrDt': '20171125',
            'occrTm': '141813',
            'cntcPrefrPhonNum': '021231574',
            'cntcPrefrMblPhonNum': '01012345678',
            'svcNm': '(case3) 인터넷(광랜FTTH)',
            'reqrNm': '심청이1',
            'mvDt': '20181008',
            'oldBasAddr': '03245 서울 여의도',
            'oldDtlAddr': '16-1번지',
            'basAddr': '07276 서울 영등포구 영등포로 1-8',
            'dtlAddr': '(영등포동2가) 101동',
            'stopPrefrDt': '20181008',
            'setPrefrDt': '20181008',
            'ossOut': {
              'adjPrefrSvsetDtm' : '개통/변경 예정일',
              'happyOperNm' : '행기사1',
              'happyOperPhonNum' : '01056567878',
              'happyCoordiNm' : '행코디1',
              'happyCoordiPhonNum' : '01033334444',
              'operCoNm' : null,
              'operCoPhonNum' : null,
              'happyOperCoNm' : '행복기사소속1',
              'happyOperId' : '행복기사 사진ID',
              'happyCoordiId' : '행복코디 사진ID'
            }
          }, {
            'stNm': '진행중',
            'onOff': '02',
            'occrDt': '20171125',
            'occrTm': '141813',
            'cntcPrefrPhonNum': '021231574',
            'cntcPrefrMblPhonNum': '01012345678',
            'svcNm': '(case4) 인터넷(광랜FTTH)',
            'reqrNm': '심청이1',
            'mvDt': '20181008',
            'oldBasAddr': '03245 서울 여의도',
            'oldDtlAddr': '16-1번지',
            'basAddr': '07276 서울 영등포구 영등포로 1-8',
            'dtlAddr': '(영등포동2가) 101동',
            'stopPrefrDt': '20181008',
            'setPrefrDt': '20181008',
            'ossOut': {
              'adjPrefrSvsetDtm' : '20181008125959',
              'happyOperNm' : '행기사1',
              'happyOperPhonNum' : '01011112222',
              'happyCoordiNm' : '행코디1',
              'happyCoordiPhonNum' : '01033334444',
              'operCoNm' : '관리 고객센터1',
              'operCoPhonNum' : '0290907878',
              'happyOperCoNm' : '행복기사소속1',
              'happyOperId' : '행복기사 사진ID',
              'happyCoordiId' : '행복코디 사진ID'
            }
          }, {
            'stNm': '접수중',
            'onOff': '01',
            'occrDt': '20171125',
            'occrTm': '141813',
            'cntcPrefrPhonNum': '021231574',
            'cntcPrefrMblPhonNum': '01012345678',
            'svcNm': '(case5) 인터넷(광랜FTTH)',
            'reqrNm': '심청이1',
            'mvDt': '20181008',
            'oldBasAddr': '03245 서울 여의도',
            'oldDtlAddr': '16-1번지',
            'basAddr': '07276 서울 영등포구 영등포로 1-8',
            'dtlAddr': '(영등포동2가) 101동',
            'stopPrefrDt': '20181008',
            'setPrefrDt': '20181008'
          }
          ]
        };
        r0168prodChg = {
          'code': '00',
          'msg': 'success',
          'result':
            [{
              'apiNm': '가입상품변경',
              'rcvDt': '20160602',
              'custNm': '고객명',
              'svcPrefrDtm': '20181008125959',
              'svcNm': '(case6) 신청서비스명1',
              'svcNmDtl': '신청서비스명2',
              'addr': '설치장소',
              'stNm': '접수중'
            }, {
              'apiNm': '업무구분',
              'rcvDt': '20160602',
              'custNm': '고객명',
              'svcPrefrDtm': '20181008125959',
              'svcNm': '(case7) 신청서비스명1',
              'svcNmDtl': '신청서비스명2',
              'addr': '설치장소',
              'stNm': '진행중',
              'ossOut': {
                'adjPrefrSvsetDtm' : '20181008125959',
                'happyOperNm' : '행기사1',
                'happyOperPhonNum' : '01011112222',
                'happyCoordiNm' : '행코디1',
                'happyCoordiPhonNum' : '01033334444',
                'operCoNm' : '관리 고객센터명1',
                'operCoPhonNum' : '0290907878',
                'happyOperCoNm' : '행복기사소속1',
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
              'svcNm': '(case8) 5서비스정기계약할인'
            },
            {
              'apiNm': '약정기간 변경',
              'stNm': '미접촉',
              'rcvDt': '20181001',
              'beforeTerm': '무약정',
              'afterTerm': '3년',
              'normalNum': '010**46***',
              'phoneNum': '01037**12**',
              'svcNm': '(case8) 5서비스정기계약할인'
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
              'svcNm': '(case9) 인터넷(광랜FTTH(GB))'
            },
            {
              'apiNm': '요금상품 변경',
              'stNm': '미접촉',
              'rcvDt': '20180927',
              'mediaNm': '인터넷',
              'prodNm': '표준요금제 광랜',
              'normalNum': '0222*23333',
              'phoneNum': '010111*4444',
              'svcNm': '(case9) 인터넷(광랜FTTH(GB))'
            }
          ]
        };*/


        this._resultHandler(r0167newJoin, MyTJoinWireHistory._ATYPE_167);
        this._resultHandler(r0162chgAddr, MyTJoinWireHistory._ATYPE_162);
        this._resultHandler(r0168prodChg, MyTJoinWireHistory._ATYPE_168);
        this._resultHandler(r0143periChg, MyTJoinWireHistory._ATYPE_143);
        this._resultHandler(r0153prodChg, MyTJoinWireHistory._ATYPE_153);

        const option = { svcInfo: svcInfo, pageInfo: pageInfo, list: this._list };
        res.render('wire/myt-join.wire.history.html', option);
      }, (resp) => {
        return this.error.render(res, {
          title: MYT_JOIN_WIRE.HISTORY.TITLE,
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      });
  }

  /**
   * 조회 결과 처리
   * atype (api type)를 생성하고 각 object에 추가
   * detailkey (상세보기 key)를 생성하고 각 object에 추가 (상세보기 화면에서 재조회 후 해당키로 data를 찾음)
   * @param resp
   * @param apiType
   * @private
   */
  private _resultHandler( resp: any, apiType: String ): boolean {
    const list: any = resp.result;

    if ( resp.code === API_CODE.CODE_00 && list ) {

      if ( Array.isArray(list) ) {

        for ( let i = list.length; i >= 0; i-- ) {
          if ( !list[i] || Object.keys(list[i]).length === 0 ) {
            // 빈값 삭제
            list.splice(i, 1);
          } else {
            list[i]['atype'] = apiType;
            list[i]['detailkey'] = MyTJoinWireHistory.getDetailKey(list[i], apiType);
          }
        }

      } else if ( typeof(list) === 'object' ) {

        if ( Object.keys(list).length === 0 ) {
          return false;
        }
        list['atype'] = apiType;
        list['detailkey'] = MyTJoinWireHistory.getDetailKey(list, apiType);
      } else {
        return false;
      }

      this._list = this._list.concat(list);

    } else {
      return false;
    }
    return true;
  }
}

export default MyTJoinWireHistory;


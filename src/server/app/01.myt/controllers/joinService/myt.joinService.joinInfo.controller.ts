/**
 * FileName: myt.joinService.joinInfo.controller.ts
 * Author: 양정규 (skt.P130715@partner.sk.com)
 * Date: 2018.07.25
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {DATE_FORMAT} from '../../../../types/string.type';
import {Observable} from 'rxjs/Observable';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';
import {SVC_ATTR} from '../../../../types/bff-common.type';
import StringHelper from '../../../../utils/string.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTJoinServiceJoinInfoController extends TwViewController {
  constructor() {
    super();
  }

  // 가입정보 Response 목업데이타
  private reqJoinInfoRes: any = {
    // 가입정보 : 대상 : 휴대폰, T Login, T Pocket-Fi
    joinInfo : {
      // 휴대폰
      mobile : {
        'code': '00',
        'msg': 'success',
        'result': {
          'svcNum': '01047488248',
          'pwdStCd': '',
          'isRsvYn': 'N',
          'svcStatNm': '사용중',
          'cmwsGrade': 'Y',
          'locCode': 'D00066',
          'svcEqpStcd': '1',
          'eqpMthdCd': 'L',
          'deviceType': '기타',
          'eqpMdlNm': 'SM-N920S_32GW',
          'mfactNm': '삼성전자(주)',
          'apprAmt': '20000',
          'payAmt': '20000',
          'invBamt': '0',
          'admFeeNm': '즉납'
        }
      }
    },
    // 개통 / 변경 이력조회
    history : {
      'code' : '00',
      'msg' : 'success',
      'result' : {
        'data' : [
          {
          'chgDt' : '********',
          'chgCd' : '신규 가입'
          },
          {
          'chgDt' : '********',
          'chgCd' : '기기 변경'
          }
        ]
      }
    }

  };

  // 휴대폰 / T Login / T Pocket-FI 정보 세팅
  private getMobileResult(data): any {

    const history = this.reqJoinInfoRes.history.result.data[this.reqJoinInfoRes.history.result.data.length - 1];
    let _chgDt = history.chgDt;
    _chgDt = _chgDt.replace(/'*'/g, '1');
    _chgDt = DateHelper.getShortDateWithFormat(_chgDt, DATE_FORMAT.YYYYMMDD_TYPE_0);
    _chgDt = _chgDt.replace(/'1'/g, '*');
    data = Object.assign(data, {

    })

  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {

    /*Observable.combineLatest(
      billTypeReq,
      itgSvcReq
    ).subscribe(([billTypeInfo, integInfo]) => {
      const data = this.getResult({}, billTypeInfo, integInfo, svcInfo);
      res.render( data.path, { data: data, svcInfo } );
    });*/


    /*let data = this.reqJoinInfoRes.joinInfo.mobile.result;
    const history = this.reqJoinInfoRes.history.result.data[this.reqJoinInfoRes.history.result.data.length - 1];
    const year = history.chgDt.substr(0, 4);
    const month = history.chgDt.substr(3, 2);
    const day = history.chgDt.substr(5, 2);
    history.chgDt = `${year}년 ${month}월 ${day}일`;
    data = Object.assign(data, history);

    let temp = '11111111';
    temp = DateHelper.getShortDateWithFormat(temp, 'YYYY년 MM월 DD일');
    temp = temp.replace(/1/g, '*');

    res.render( 'joinService/myt.joinService.joinInfo.html', { data: data, svcInfo } );*/
  }

  private getResult(data: any, svcInfo: any): any {
    return data;
  }
}

export default MyTJoinServiceJoinInfoController;

/**
 * FileName: myt-join.wire.history.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';


class MyTJoinWireHistory extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    console.log('============ call BFF_05_0153 ==============');
    Observable.combineLatest(this.apiService.request(API_CMD.BFF_05_0153, {}))
      .subscribe(([resp]) => {
        const resp1 = {
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


        if ( resp1.code === API_CODE.CODE_00 ) {
          console.log('============ resp BFF_05_0153 ==============');
          console.log( resp1 );
          const option = { svcInfo: svcInfo };

          res.render('wire/myt-join.wire.history.html', option);
        }
      });
  }
}

export default MyTJoinWireHistory;


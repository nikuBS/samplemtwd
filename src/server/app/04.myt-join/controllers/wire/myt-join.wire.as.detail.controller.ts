/**
 * FileName: myt-join.wire.as.detail.js
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { SVC_ATTR } from '../../../../types/bff.old.type';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';


class MyTJoinWireASDetail extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    console.log('============ call BFF_05_0157 ==============');
    // const trblNum = req.params['troubleNum'];
    const trblNum = '1';
    if ( !trblNum ) {
      // TODO throw error
      return;
    }
    this.apiService.request(API_CMD.BFF_05_0157, { troubleNum : trblNum })
      .subscribe((resp) => {
        const resp1 = {
            'code': '00',
            'msg': 'success',
            'result': {
              'custNm': '고객명',
              'cntcNum': '연락전화번호',
              'addrNm': '설치주소',
              'mvotOperCoId': '출동작업업체ID',
              'mvotOperCoNm': '출동작업업체명',
              'coPhonNum': '출동작업업체전화번호',
              'mvotCoFnshOpertrId': '행복기사사번',
              'mvotCoFnshOpertrNm': '행복기사명',
              'opertrPhonNum': '행복기사전화번호',
              'operSchdDtm': '방문예정일시'
            }
          };

        if ( resp1.code === API_CODE.CODE_00 ) {
          console.log('============ result ==============');
          const option = { svcInfo: svcInfo, data: resp1.result};

          res.render('wire/myt-join.wire.as.html', option);
        }
      });
  }
}

export default MyTJoinWireASDetail;


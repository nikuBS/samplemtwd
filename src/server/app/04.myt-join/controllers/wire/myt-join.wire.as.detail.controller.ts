/**
 * FileName: myt-join.wire.as.detail.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.08
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';


class MyTJoinWireASDetail extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    const troubleNum = req.query.troubleNum;
    const troubleDt = req.query.troubleDt;
    const svcNm = req.query.svcNm;
    const stNm = req.query.stNm;
    const troubleDetail = req.query.troubleDetail;

    if ( !troubleNum ) {
      console.log(' troubleNum is not defined');
      return;
    }

    this.apiService.request(API_CMD.BFF_05_0157, { troubleNum : troubleNum })
      .subscribe((resp) => {
        /*resp = {
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
            'operSchdDtm': '201810200506'
          }
        };*/

        if ( resp.code === API_CODE.CODE_00 ) {
          const data = resp.result;
          data['troubleNum'] = troubleNum;
          data['troubleDt'] = DateHelper.getShortDateNoDot(troubleDt);
          data['svcNm'] = svcNm;
          data['stNm'] = stNm;
          data['troubleDetail'] = troubleDetail;
          data['operSchdDtm'] = DateHelper.getFullDateAndTime(data['operSchdDtm']);

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: data};

          res.render('wire/myt-join.wire.as.detail.html', option);
        }
      });
  }
}

export default MyTJoinWireASDetail;


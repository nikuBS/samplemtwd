/**
 * FileName: myt-join.submain.phone.extalarm.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import StringHelper from '../../../../utils/string.helper';

class MyTJoinPhoneNumChgAlarmExt extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0180, {})
      .subscribe((resp) => {
    //     const resp = {
    //       'code': '00',
    //       'msg': '결과메세지',
    //       'result':
    //         {
    //           'oldSvcNum': '01056**78**',
    //           'newSvcNum': '01012**34**',
    //           'notiType': 'S',
    //           'freeOfrEndDt': '20191030',
    //           'notiStaDt': '20181031',
    //           'notiEndDt': '20181130',
    //           'extnsPsblYn': 'Y',
    //           'orglSktYn': 'Y'
    //         }
    //     };

        if ( resp.code === API_CODE.CODE_00 ) {
          const result = resp.result;
          result['oldSvcNum'] = StringHelper.phoneStringToDash(result['oldSvcNum']);
          result['newSvcNum'] = StringHelper.phoneStringToDash(result['newSvcNum']);
          result['notiStaDt'] = DateHelper.getShortDateNoDot(result['notiStaDt']);
          result['notiEndDt'] = DateHelper.getShortDateNoDot(result['notiEndDt']);
          result['freeOfrEndNextDt'] = DateHelper.getShortDateNoDot(DateHelper.getAddDay(result['freeOfrEndDt'] + '235959', 'YYYYMMDD'));
          result['freeOfrEndDt'] = DateHelper.getShortDateNoDot(result['freeOfrEndDt']);

          // 서비스 종료 후 면 신청으로 이동
          const today = DateHelper.getShortDateNoDot(new Date());
          if ( result['notiEndDt'] && result['notiEndDt'] < today ) {
            res.redirect('/myt-join/submain/phone/alarm');
          }

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: result };
          res.render('submain/myt-join.submain.phone.extalarm.html', option);
        } else {
          return this.error.render(res, {
            title: '번호변경 안내 서비스',
            code: resp.code,
            msg: resp.msg,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: '번호변경 안내 서비스',
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
        });
      });


  }
}

export default MyTJoinPhoneNumChgAlarmExt;


/**
 * FileName: myt-join.submain.phone.alarm.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import DateHelper from '../../../../utils/date.helper';

class MyTJoinPhoneNumChgAlarm extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

     this.apiService.request(API_CMD.BFF_05_0180, {})
       .subscribe((resp) => {
        // const resp = {
        //   'code': '00',
        //   'msg': '결과메세지',
        //   'result':
        //     {
        //       'oldSvcNum': '01056**78**',
        //       'newSvcNum': '01012**34**',
        //       'notiType': 'S',
        //       'freeOfrEndDt': '20191030',
        //       'notiStaDt': '20181031',
        //       'notiEndDt': '20181101',
        //       'extnsPsblYn': 'N',
        //       'orglSktYn': 'Y'
        //     }
        // };
        

        if ( resp.code === API_CODE.CODE_00 ) {
          const result = resp.result;
          result['oldSvcNum'] = StringHelper.phoneStringToDash(result['oldSvcNum']);
          result['newSvcNum'] = StringHelper.phoneStringToDash(result['newSvcNum']);

          // 서비스 이용중(서비스 종료일이 오늘날짜보다 크거나 같으면) 이라면 연장으로 이동
          const today = DateHelper.getShortDateNoDot(new Date());
          if ( result['notiEndDt'] && DateHelper.getShortDateNoDot(result['notiEndDt']) >= today ) {
            res.redirect('/myt-join/submain/phone/extalarm');
            return;
          }

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: result};
          res.render('submain/myt-join.submain.phone.alarm.html', option);
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

export default MyTJoinPhoneNumChgAlarm;


/**
 * FileName: myt-join.mgmt.numchg.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.19
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';

class MyTJoinPhoneNumChange extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_05_0186, {})
      .subscribe((resp) => {

        // const resp = {
        //   'code': '00',
        //   'msg': 'success',
        //   'result': {
        //     'svcNum' : '01194**18**',
        //     'coCd' : 'SKT',
        //     'objSvcNum' : '01094411895',
        //     'chgTyp' : '1',
        //     'npCd' : '',
        //     'numChgTarget' : true
        //   }
        // };

        if ( resp.code === API_CODE.CODE_00 ) {
          // numChgTarget : 010전환번호 대상자 여부
          if ( resp.result['numChgTarget'] ) {
            resp.result['svcNum'] = StringHelper.phoneStringToDash(resp.result['svcNum']);
            resp.result['objSvcNum'] = StringHelper.phoneStringToDash(resp.result['objSvcNum']);
            const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: resp.result };
            res.render('submain/myt-join.submain.numchange.html', option );

          } else {
            const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: false };
            res.render('submain/myt-join.submain.numchange.html', option );
          }


        } else {
          return this.error.render(res, {
            title: '010번호 전환변경',
            code: resp.code,
            msg: resp.msg,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: '010번호 전환변경',
          code: resp.code,
          msg: resp.msg,
          svcInfo: svcInfo
        });
      });

  }
}

export default MyTJoinPhoneNumChange;


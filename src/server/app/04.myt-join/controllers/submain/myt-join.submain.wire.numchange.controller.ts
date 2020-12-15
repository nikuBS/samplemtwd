/**
 * MenuName: 나의 가입정보 > 서브메인 > 전화 번호변경(MS_04_09)
 * @file myt-join.submain.wire.numchange.controller.ts
 * @author Hyeryoun Lee (skt.P130712@partner.sk.com)
 * @since 2019. 7. 11.
 * Summary: 전화 번호변경(MS_04_09)
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';
import { MYT_JOIN_WIRE_NUMBER_CHANGE } from '../../../../types/string.type';

class MyTJoinPhoneNumWireChange extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    if ( this._ifCompletePageMove(req, res, 'submain/myt-join.submain.complete.html') ) {
      return;
    }

    this.apiService.request(API_CMD.BFF_05_0209, {}, {})
      .subscribe((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          resp.result['svcNum'] = StringHelper.phoneStringToDash(svcInfo.svcNum);
          resp.result['svcMgmtNum'] = svcInfo.svcMgmtNum;
          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: resp.result };
          res.render('submain/myt-join.submain.wire.numchange.html', option);
        } else {
          return this.error.render(res, {
            title: MYT_JOIN_WIRE_NUMBER_CHANGE.TITLE,
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: MYT_JOIN_WIRE_NUMBER_CHANGE.TITLE,
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      });
  }

  /**
   * 완료 화면 이동 (url의 끝이 /complete인 경우)
   * @param req
   * @param res
   * @param compView - 완료html
   * @private
   */
  private _ifCompletePageMove(req: Request, res: Response, compView: string) {
    const compUrl = '/complete';
    const url = req.url.substr(0, req.url.indexOf('?'));
    const q = req.query || {};
    if ( url.lastIndexOf(compUrl) === url.length - compUrl.length ) {
      res.render(compView, {
        confirmMovPage: q.confirmMovPage || '',
        mainTxt: q.mainTxt || '',
        subTxt: q.subTxt || '',
        linkTxt: q.linkTxt || '',
        linkPage: q.linkPage || ''
      });
      return true;
    }
    return false;
  }
}

export default MyTJoinPhoneNumWireChange;

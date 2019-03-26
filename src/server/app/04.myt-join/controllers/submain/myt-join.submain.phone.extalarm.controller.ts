/**
 * MenuName: 나의 가입정보 > 서브메인 > 번호변경 안내서비스 연장/해지 신청(MS_03_01_04)
 * FileName: myt-join.submain.phone.extalarm.controller.ts
 * Author: Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * Date: 2018.10.19
 * Summary: 번호변경 안내서비스 연장/해지
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import DateHelper from '../../../../utils/date.helper';
import StringHelper from '../../../../utils/string.helper';

class MyTJoinPhoneNumChgAlarmExt extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    if ( this._ifCompletePageMove(req, res, 'submain/myt-join.submain.complete.html') ) {
      return ;
    }

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

          // 서비스 종료 후 면 신청으로 이동
          const today = DateHelper.getCurrentShortDate(new Date());
          if ( result['notiEndDt'] && result['notiEndDt'] < today ) {
            res.redirect('/myt-join/submain/phone/alarm');
          }

          result['oldSvcNum'] = StringHelper.phoneStringToDash(result['oldSvcNum']);
          result['newSvcNum'] = StringHelper.phoneStringToDash(result['newSvcNum']);
          result['notiStaDt'] = DateHelper.getShortDate(result['notiStaDt']);
          result['notiEndDt'] = DateHelper.getShortDate(result['notiEndDt']);
          result['freeOfrEndNextDt'] = DateHelper.getShortDate(DateHelper.getAddDay(result['freeOfrEndDt'] + '235959', 'YYYYMMDD'));
          result['freeOfrEndDt'] = DateHelper.getShortDate(result['freeOfrEndDt']);

          const option = { svcInfo: svcInfo, pageInfo: pageInfo, data: result };
          res.render('submain/myt-join.submain.phone.extalarm.html', option);
        } else {
          return this.error.render(res, {
            title: '번호변경 안내 서비스',
            code: resp.code,
            msg: resp.msg,
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: '번호변경 안내 서비스',
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
    if ( url.lastIndexOf(compUrl) === url.length - compUrl.length) {
      res.render(compView, {
        confirmMovPage : q.confirmMovPage || '',
        mainTxt : q.mainTxt || '',
        subTxt : q.subTxt || '',
        linkTxt : q.linkTxt || '',
        linkPage : q.linkPage || ''
      });
      return true;
    }
    return false;
  }
}

export default MyTJoinPhoneNumChgAlarmExt;


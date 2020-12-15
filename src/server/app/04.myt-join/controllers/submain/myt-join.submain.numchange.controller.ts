/**
 * MenuName: 나의 가입정보 > 서브메인 > 010 전환 번호변경(MS_03_02)
 * @file myt-join.mgmt.numchg.controller.ts
 * @author Lee Gyu-gwang (skt.P134910@partner.sk.com)
 * @since 2018.10.19
 * Summary: 010 전환 번호변경
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import StringHelper from '../../../../utils/string.helper';

class MyTJoinPhoneNumChange extends TwViewController {

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    if ( this._ifCompletePageMove(req, res, 'submain/myt-join.submain.complete.html') ) {
      return ;
    }

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
            pageInfo: pageInfo,
            svcInfo: svcInfo
          });
        }
      }, (resp) => {
        return this.error.render(res, {
          title: '010번호 전환변경',
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

export default MyTJoinPhoneNumChange;


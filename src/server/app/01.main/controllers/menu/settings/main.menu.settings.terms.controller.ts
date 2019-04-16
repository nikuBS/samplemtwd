/**
 * @file 약관 화면 관련 처리
 * @author Hakjoon Sim
 * @since 2018-10-08
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import FormatHelper from '../../../../../utils/format.helper';
import { TERM_STRING } from '../../../../../types/string.type';

export default class MainMenuSettingsTerms extends TwViewController {

  // 약관 번호 별 표기할 title 문구 정의
  private titleMap = {
    46: TERM_STRING.RESELL,
    49: TERM_STRING.RESELL,
    50: TERM_STRING.RESELL,
    101: TERM_STRING.MEMBERSHIP
  };

  // 101번 약관은 외부 url을 iframe으로 표기
  private urlMap = {
    101: 'https://www.sktmembership.co.kr/mobile/html/iframe/1.1_iframe1.html' // 멤버십 회원약관
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    if (req.query.id) {
      const id = req.query.id;
      if (id === '102') { // 초콜릿 이용약관
        res.render('menu/settings/main.menu.settings.terms.choco.html', {
          svcInfo, pageInfo
        });
      }
      const url = !!this.urlMap[id] ? this.urlMap[id] : undefined;
      const viewId = req.query.viewId;
      if (!!url) {
        const title = this.titleMap[id];
        const actionTitle = TERM_STRING.ACTION_TITLE[id];
        res.render(`menu/settings/main.menu.settings.term-type-${req.query.type}.html`, {
          svcInfo, pageInfo, id, title, url, actionTitle
        });
        return;
      }

      this.getTermContent(res, svcInfo, pageInfo, id).subscribe(
        (resp) => {
          if (!FormatHelper.isEmpty(resp)) {
            const title = !!this.titleMap[id] ? this.titleMap[id] : resp.title; // titleMap에 정의된 title 있는지 확인
            const actionTitle = resp.title.includes('_') ? resp.title.split('_')[1] : resp.title; // BFF에서 내려오는 약관의 title 정제
            res.render(`menu/settings/main.menu.settings.term-type-${req.query.type}.html`, {
              svcInfo, pageInfo, title, content: resp.content, viewId, id, actionTitle
            });
          }
        },
        (err) => {
          this.error.render(res, {
            code: err.code,
            msg: err.msg,
            pageInfo: pageInfo,
            svcInfo
          });
        }
      );
    } else {
      res.render('menu/settings/main.menu.settings.terms.html', { svcInfo, pageInfo });
    }
  }

  /**
   * @function
   * @desc 각 약관의 내용을 BFF로 부터 조회
   * @param  {Response} res  - Response
   * @param  {any} svcInfo - 사용자 정보
   * @param  {any} pageInfo - 페이지 정보
   * @param  {string} id - 약관 id
   * @returns Observable
   */
  private getTermContent(res: Response, svcInfo: any, pageInfo: any, id: string): Observable<any> {
    return this.apiService.request(API_CMD.BFF_08_0059, {
      svcType: 'MM',
      serNum: id
    }).map((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        return resp.result;
      }

      this.error.render(res, {
        code: resp.code,
        msg: resp.msg,
        pageInfo: pageInfo,
        svcInfo
      });

      return null;
    });
  }
}

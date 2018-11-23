/**
 * FileName: main.menu.settings.terms.controller.ts
 * Author: Hakjoon Sim (hakjoon.sim@sk.com)
 * Date: 2018.10.08
 */

import { Request, Response, NextFunction } from 'express-serve-static-core';
import TwViewController from '../../../../../common/controllers/tw.view.controller';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../../types/api-command.type';
import FormatHelper from '../../../../../utils/format.helper';
import { TERM_STRING } from '../../../../../types/string.type';

export default class MainMenuSettingsTerms extends TwViewController {

  private titleMap = {
    46: TERM_STRING.RESELL,
    49: TERM_STRING.RESELL,
    50: TERM_STRING.RESELL,
    101: TERM_STRING.MEMBERSHIP,
    102: TERM_STRING.CHOCO,
    103: TERM_STRING.CHOCO,
    104: TERM_STRING.CHOCO,
  };

  private urlMap = {
    101: 'http://www.sktmembership.co.kr:90/mobile/html/iframe/1.1_iframe1.html', // 멤버십 회원약관
    102: 'http://www.sktmembership.co.kr:90/terms/shoppingTerms.do', // 초콜릿 이용약관
    103: 'http://www.sktmembership.co.kr:90/terms/shoppingTermsPersonalNow.do', // 초콜릿 개인정보
    104: 'http://tmembership.tworld.co.kr/poc/html/policy/chocolate_agree3.html' // 초콜릿 개인정보 수집
  };

  render(req: Request, res: Response, next: NextFunction, svcInfo: any,
         allSvc: any, childInfo: any, pageInfo: any) {
    if (req.query.id) {
      const id = req.query.id;
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

      this.getTermContent(res, svcInfo, id).subscribe(
        (resp) => {
          if (!FormatHelper.isEmpty(resp)) {
            const title = !!this.titleMap[id] ? this.titleMap[id] : resp.title;
            const actionTitle = resp.title.includes('_') ? resp.title.split('_')[1] : resp.title;
            res.render(`menu/settings/main.menu.settings.term-type-${req.query.type}.html`, {
              svcInfo, pageInfo, title, content: resp.content, viewId, id, actionTitle
            });
          }
        },
        (err) => {
          this.error.render(res, {
            code: err.code,
            msg: err.msg,
            svcInfo
          });
        }
      );
    } else {
      res.render('menu/settings/main.menu.settings.terms.html', { svcInfo, pageInfo });
    }
  }

  private getTermContent(res: Response, svcInfo: any, id: string): Observable<any> {
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
        svcInfo
      });

      return null;
    });
  }
}

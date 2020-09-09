/**
 * 검색 메인 화면
 * @file common.search.in-result.controller.ts
 * @author Hyunkuk Lee (max5500@pineone.com)
 * @since 2018.12.11
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import express, { Application, NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import BrowserHelper from '../../../../utils/browser.helper';
import ApiRouter from '../../../../common/route/api.router';
import { REDIS_KEY } from '../../../../types/redis.type';


class CommonSearchMain extends TwViewController {
  public app: Application = express();

  constructor() {
    super();
    this.setApis();
  }

  private setApis() {
    this.app.use('/api', new ApiRouter().router);
  }

  /**
   * 홈화면 이럴땐 이렇게 하세요 데이터 파싱
   * @param {object} cicntsList
   * @return {object}
   */
  private parseHelpData(cicntsList: any): any {
    const resultArr = <any>[];
    const scrnTypCd = cicntsList[0].scrnTypCd || 'F';

    cicntsList.sort((prev, next) => {
      if (scrnTypCd === 'R') {
        return Math.floor(Math.random() * 3) - 1;
      } else {
        return prev.mainExpsSeq - next.mainExpsSeq;
      }
    });
    cicntsList[0].rollYn = cicntsList[0].rollYn || 'Y';
    for (let i = 0; i < cicntsList.length; i += 3) {
      resultArr.push(cicntsList.slice(i, i + 3));
    }
    return resultArr;
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const nowOsType = BrowserHelper.isApp(req) ? BrowserHelper.isAndroid(req) ? 'A' : 'I' : 'X';
    const step = req.query.step || 1;
    const sort = req.query.sort || 'shortcut-A.rate-A.service-A.tv_internet-A.troaming-A.direct-D';
    Observable.combineLatest(
      this.apiService.request(API_CMD.POPULAR_KEYWORD, { range: 'D' }, {}),
      this.apiService.request(API_CMD.BFF_08_0068, { mblOsTypCd: nowOsType }, {}),
      this.apiService.request(API_CMD.BFF_08_0069, { mblOsTypCd: nowOsType }, {}),
      this.redisService.getData(REDIS_KEY.HOME_HELP)
    ).subscribe(([popularKeyword, recommendKeyword, smartKeyword, doLikeThis]) => {
      if (popularKeyword.code !== 0) {
        return this.error.render(res, {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          code: popularKeyword.code,
          msg: popularKeyword.msg
        });
      }

      res.render('search/common.search-main.html', {
        pageInfo: pageInfo,
        popularKeyword: popularKeyword,
        recommendKeyword: recommendKeyword,
        smartKeyword: smartKeyword,
        doLikeThis: doLikeThis.code !== API_CODE.REDIS_SUCCESS ? null : this.parseHelpData(doLikeThis.result.cicntsList),
        step: step,
        sort: sort
      });
    });
  }
}

export default CommonSearchMain;

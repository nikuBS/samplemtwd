/**
 * @file tevent.detail.controller.ts
 * @author Jayoon Kong
 * @since 2018.11.21
 * @desc 이벤트 상세화면 조회 page
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';

/**
 * @class
 * @desc 이벤트 상세화면 조회
 */
class TeventDetail extends TwViewController {
  constructor() {
    super();
  }

  /**
   * @function
   * @desc render
   * @param {e.Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   * @param svcInfo
   * @param allSvc
   * @param childInfo
   * @param pageInfo
   */
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any): void {
    const id = req.query.id;
    const htmlId = req.query.htmlId;
    if (htmlId) {
      return res.render('tevent.static.html', {
        htmlId: htmlId,
        svcInfo: svcInfo
      });
    }

    this.apiService.request(API_CMD.BFF_09_0002, {}, {}, [id]).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        const result = this.parseData(resp.result);
        const tmp = [
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190128',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190125',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190111',
          'http://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190115',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190007',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190014',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190016',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190040',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190061',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190071',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190077',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190076',
          'https://m.tmembership.tworld.co.kr/mobileWeb/html/event/EventIngView.jsp?EVENT_BBS_SEQ=20190096',
          'https://app.tworld.co.kr/tevent/detail?htmlId=mTL1.1.41'
        ];
        const randomIdx = Math.floor(Math.random() * tmp.length);
        result.url = tmp[randomIdx];
        result.height = '400px';
        res.render('tevent.detail.html', {
          result,
          svcInfo: svcInfo,
          pageInfo: pageInfo
        });
      } else {
        this.error.render(res, {
          code: resp.code,
          msg: resp.msg,
          pageInfo: pageInfo,
          svcInfo: svcInfo
        });
      }
    });
  }

  /**
   * @function
   * @desc parsing data
   * @param result
   * @returns {any}
   */
  private parseData(result: any): any {
    if (!FormatHelper.isEmpty(result)) {
      result.startDate = DateHelper.getShortDate(result.prStaDt);
      result.endDate = DateHelper.getShortDate(result.prEndDt);
      result.height = result.prUrlHSize + 'px';
      result.url = result.prUrl.indexOf('https') === -1 ? result.prUrl.replace('http', 'https') : result.prUrl;
    }
    return result;
  }
}

export default TeventDetail;

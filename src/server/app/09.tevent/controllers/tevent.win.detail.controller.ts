/**
 * @file tevent.win.detail.controller.ts
 * @author Jayoon Kong
 * @since 2018.11.21
 * @desc 당첨자발표 상세화면 page
 */

import TwViewController from '../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../types/api-command.type';
import DateHelper from '../../../utils/date.helper';
import FormatHelper from '../../../utils/format.helper';

/**
 * @class
 * @desc 당첨자발표 상세화면
 */
class TeventWinDetail extends TwViewController {
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

    this.apiService.request(API_CMD.BFF_09_0005, {}, {}, [id]).subscribe((resp) => {
      if (resp.code === API_CODE.CODE_00) {
        res.render('tevent.win.detail.html', {
          result: this.parseData(resp.result),
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
      result.winDate = DateHelper.getShortDate(result.winDt);
      result.height = result.winUrlHSize + 'px';
      result.url = result.winUrl.indexOf('https') === -1 ? result.winUrl.replace('http', 'https') : result.winUrl;
    }
    return result;
  }
}

export default TeventWinDetail;

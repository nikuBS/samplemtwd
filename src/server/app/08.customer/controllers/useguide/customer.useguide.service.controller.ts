/**
 * FileName: customer.useguide.service.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
 * Date: 2018.10.25
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import {API_CMD, API_CODE} from '../../../../types/api-command.type';

import FormatHelper from '../../../../utils/format.helper';
import DateHelper from '../../../../utils/date.helper';

import {URL_APP_STORE} from '../../../../types/outlink.type';

interface Query {
  current: string;
  isQueryEmpty: boolean;
}

class CustomerUseguideService extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {


    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };


    if (query.current === 'service') {
      this.renderView(res, 'useguide/customer.useguide.service.html', svcInfo, pageInfo, {});
    } else {
      switch (query.current) {
        case 'detail':
          this.renderView(res, 'useguide/customer.useguide.service.detail.html', svcInfo, pageInfo, {});
          break;
        default:
          break;
      }
    }
  }

  private renderView(res: Response, view: string, svcInfo: any, pageInfo: any, data: any) {
    res.render(view, {svcInfo, pageInfo, data});
  }

  private getKeyWithQuery(queryString: string): any {
    return queryString.split('').filter((elem, idx, arr) => {
      if (elem === '-') {
        arr[idx + 1] = arr[idx + 1].toUpperCase();
        return '';
      }
      return elem;
    }).join('');
  }
}

export default CustomerUseguideService;

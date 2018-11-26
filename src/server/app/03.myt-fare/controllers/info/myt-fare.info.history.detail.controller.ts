/**
 * FileName: myt-fare.info.history.detail.controller.ts
 * Author: Lee Kirim (kirim@sk.com)
 * Date: 2018.09.17
 */

import TwViewController from '../../../../common/controllers/tw.view.controller';
import {Request, Response, NextFunction} from 'express';
import FormatHelper from '../../../../utils/format.helper';
import {MYT_PAYMENT_DETAIL_TITLE} from '../../../../types/string.type';

import {API_CMD} from '../../../../types/api-command.type';


interface Query {
  current: string;
  isQueryEmpty: boolean;
  // sortType: string;
}


class MyTFareInfoHistoryDetail extends TwViewController {

  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, pageInfo: any) {

    const query: Query = {
      isQueryEmpty: FormatHelper.isEmpty(req.query),
      current: req.path.split('/').splice(-1)[0] || req.path.split('/').splice(-2)[0]
    };
    let requestType;

    switch (req.query.type) {
      case 'DI':
        this.apiService.request(API_CMD.BFF_07_0091, {opDt: req.query.opDt, payOpTm: req.query.payOpTm}).subscribe((resp) => {
          res.render('info/myt-fare.info.history.detail.html', {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            data: {
              current: query.current,
              headerTitle: MYT_PAYMENT_DETAIL_TITLE.DI,
              data: resp.result
            }
          });

        });
        break;
      default:
        requestType = req.query.type;

        res.render('info/myt-fare.info.history.detail.html', {
          svcInfo: svcInfo,
          pageInfo: pageInfo,
          data: {
            current: query.current,
            headerTitle: MYT_PAYMENT_DETAIL_TITLE.DI // [requestType]
          }
        });
        break;
    }
  }
}

export default MyTFareInfoHistoryDetail;

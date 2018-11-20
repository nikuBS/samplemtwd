/**
 * FileName: myt-fare.payment.history.detail.controller.ts
 * Author: Lee Sanghyoung (silion@sk.com)
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
          switch (req.query.settleWayCd) {
            case '02':
              requestType = 'CARD';
              break;
            case '10':
              requestType = 'OCB';
              break;
            case '11':
              requestType = 'TPOINT';
              break;
            case '41':
              requestType = 'BANK';
              break;
            default:
              requestType = req.query.type;
              break;
          }
          res.render('info/myt-fare.info.history.detail.html', {
            svcInfo: svcInfo,
            pageInfo: pageInfo,
            data: {
              current: query.current,
              headerTitle: MYT_PAYMENT_DETAIL_TITLE[requestType],
              data: resp
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
            headerTitle: MYT_PAYMENT_DETAIL_TITLE[requestType]
          }
        });
        break;
    }
  }
}

export default MyTFareInfoHistoryDetail;

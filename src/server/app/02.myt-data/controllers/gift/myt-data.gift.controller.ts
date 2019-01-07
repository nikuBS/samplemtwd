/**
 * FileName: myt-data.gift.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.09.10
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import BrowserHelper from '../../../../utils/browser.helper';
import { Observable } from 'rxjs/Observable';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import FormatHelper from '../../../../utils/format.helper';
import { DATA_UNIT } from '../../../../types/string.type';
import ParamsHelper from '../../../../utils/params.helper';
import StringHelper from '../../../../utils/string.helper';

class MyTDataGift extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any) {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req),
      convertTDataSet: this.convertTDataSet,
      convertTelNumber: this.convertTelNumber
    };

    switch ( page ) {
      case 'sms':
        res.render('gift/myt-data.gift.sms.html', responseData);
        break;
      case 'auto-complete':
        const response = Object.assign({
          params: ParamsHelper.getQueryParams(req.url),
          convertMaskTelNumber: this.convertMaskTelNumber
        }, responseData);

        res.render('gift/myt-data.gift.auto-complete.html', response);
        break;
      case 'complete':
        Observable.combineLatest(
          this.getSenderInfo(),
          this.getRemainInfo()
        ).subscribe(([senderInfo, remainInfo]) => {
          const response = Object.assign({
            remainInfo: remainInfo,
            senderInfo: senderInfo,
            params: ParamsHelper.getQueryParams(req.url)
          }, responseData);

          res.render('gift/myt-data.gift.complete.html', response);
        });
        break;
      default:
        Observable.combineLatest(
          this.getGiftAutoList()
        ).subscribe(([autoList]) => {
          const response = Object.assign(
            { autoList: autoList },
            responseData
          );

          res.render('gift/myt-data.gift.html', response);
        });
    }
  }

  private getRemainInfo() {
    return this.apiService.request(API_CMD.BFF_06_0014, {})
      .map((res) => {
        if ( res.code === API_CODE.CODE_00 ) {
          return res.result;
        } else {
          return null;
        }
      });
  }

  private getSenderInfo() {
    return this.apiService.request(API_CMD.BFF_06_0015, {})
      .map((res) => {
        if ( res.code === API_CODE.CODE_00 ) {
          return res.result;
        } else {
          return null;
        }
      });
  }

  private getGiftAutoList() {
    return this.apiService.request(API_CMD.BFF_06_0006, {})
      .map((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          let result = resp.result;
          result = result.map(item => {
            item.svcNum = FormatHelper.conTelFormatWithDash(item.svcNum);
            return item;
          });

          return result;
        } else {
          return null;
        }
      });
  }

  public convertTDataSet = (sQty) => FormatHelper.convDataFormat(sQty, DATA_UNIT.MB);

  public convertTelNumber = (sNumber) => FormatHelper.conTelFormatWithDash(sNumber.replace(/-/g, ''));

  public convertMaskTelNumber = (sNumber) => StringHelper.maskPhoneNumber(sNumber);
}

export default MyTDataGift;

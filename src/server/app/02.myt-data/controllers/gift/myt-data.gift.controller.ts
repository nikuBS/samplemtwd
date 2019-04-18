/**
 * @file myt-data.gift.controller.ts
 * @author 박지만 (jiman.park@sk.com)
 * @since 2018.09.10
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

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const page = req.params.page;
    const responseData = {
      svcInfo: svcInfo,
      isApp: BrowserHelper.isApp(req),
      convertTDataSet: this.convertTDataSet,
      convertTelNumber: this.convertTelNumber,
      pageInfo: pageInfo
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
      case 'available':
        res.render('gift/myt-data.gift.available.html', responseData);
        break;
      case 'complete':
        Observable.combineLatest(
          this.getSenderInfo()
        ).subscribe(([senderInfo]) => {
          const respComplete = Object.assign({
            senderInfo: senderInfo,
            params: ParamsHelper.getQueryParams(req.url)
          }, responseData);

          res.render('gift/myt-data.gift.complete.html', respComplete);
        });
        break;
      default:
        Observable.combineLatest(
          this.getGiftAutoList()
        ).subscribe(([autoList]) => {
          const respDefault = Object.assign(
            { autoList: autoList },
            responseData
          );

          res.render('gift/myt-data.gift.html', respDefault);
        });
    }
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

/**
 * FileName: customer.main.controller.ts
 * Author: 박지만 (jiman.park@sk.com)
 * Date: 2018.07.23
 */

import { NextFunction, Request, Response } from 'express';
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { API_CMD } from '../../../../types/api-command.type';
import { combineLatest } from 'rxjs/observable/combineLatest';

class CustomerMainController extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo?: any, layerType?: string): void {
    combineLatest(
      this.getBanners(),
      // this.getNotice()
    ).subscribe(([banners]) => {
      res.render('main/customer.main.html', { svcInfo: svcInfo });
    });
  }

  private getBanners() {
    return this.apiService.request(API_CMD.BFF_08_0026, {});
  }

  private getResearch() {
    return this.apiService.request(API_CMD.BFF_08_0025, {});
  }

  private getNotice() {
    return this.apiService.request(API_CMD.BFF_08_0028, {});
  }
}

export default CustomerMainController;

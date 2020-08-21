import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { Observable } from 'rxjs/Observable';

export default class RoamingTariffsController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    res.render('roaming-next/roaming.tariffs.html', {
      svcInfo,
      pageInfo,
    });
  }

  protected get noUrlMeta(): boolean {
    return true;
  }
}

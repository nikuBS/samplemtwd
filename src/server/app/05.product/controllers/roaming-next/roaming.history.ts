import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';

export default class RoamingTariffOfferController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    // TODO: 최근 방문국가 w/ 사용요금제 목록 API 연동 필요

    res.render('roaming-next/roaming.history.html', {
      svcInfo,
      pageInfo,
      isLogin: isLogin,
      // country: {code: countryCode, name: countryName},
    });
  }

  protected get noUrlMeta(): boolean {
    return true;
  }
}

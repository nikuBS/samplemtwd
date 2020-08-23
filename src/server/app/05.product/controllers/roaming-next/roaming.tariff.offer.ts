import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import moment from 'moment';

export default class RoamingTariffOfferController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = FormatHelper.isEmpty(svcInfo);
    const countryCode = req.query.code;
    const countryName = req.query.name;

    const from = moment(req.query.from, 'YYYYMMDD');
    const to = moment(req.query.to, 'YYYYMMDD');
    const night = to.diff(from) / 86400 / 1000;

    // 로그인 여부에 따라 '지난 여행 이력보기' 표시
    res.render('roaming-next/roaming.tariff.offer.html', {
      svcInfo,
      pageInfo,
      isLogin: isLogin,
      country: {code: countryCode, name: countryName},
      night: night,
      days: night + 1,
    });
  }

  protected get noUrlMeta(): boolean {
    return true;
  }
}

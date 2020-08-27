import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import { API_CMD, API_CODE } from '../../../../types/api-command.type';
import { Observable } from 'rxjs/Observable';
import FormatHelper from '../../../../utils/format.helper';
import EnvHelper from '../../../../utils/env.helper';

export default class RoamingOnController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const isLogin: boolean = !FormatHelper.isEmpty(svcInfo);
    const CDN = EnvHelper.getEnvironment('CDN');
    res.render('roaming-next/roaming.on.html', {
      svcInfo,
      pageInfo,
      isLogin: isLogin,
      country: {
        code: 'AUS',
        name: '호주',
        timezoneOffset: -8,
        flagUrl: `${CDN}/img/product/roam/flag_aus.png`,
        backgroundUrl: `${CDN}/img/product/roam/background_aus.png`,
      }
    });
  }

  protected get noUrlMeta(): boolean {
    return true;
  }
}

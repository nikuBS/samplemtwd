import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import {API_CMD} from '../../../../types/api-command.type';
import RoamingHelper from './roaming.helper';

export default class RoamingTariffsController extends TwViewController {
  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {

    this.apiService.request(API_CMD.BFF_10_0198, {}).subscribe(groups => {
      // TODO: BFF0090 오류 핸들링
      console.log(groups);

      res.render('roaming-next/roaming.tariffs.html', {
        svcInfo,
        pageInfo,
        groups,
        groupsHardcoded: RoamingHelper.getTariffGroupsHardcoded(),
      });
    });
  }

  // protected get noUrlMeta(): boolean {
  //   return true;
  // }
}

/**
 * FileName: common.share.old-landing.controller.ts
 * Author: Ara Jo (araara.jo@sk.com)
 * Date: 2019.03.21
 */
import TwViewController from '../../../../common/controllers/tw.view.controller';
import { NextFunction, Request, Response } from 'express';
import FormatHelper from '../../../../utils/format.helper';
import { REDIS_KEY } from '../../../../types/redis.type';
import { API_CODE } from '../../../../types/api-command.type';

const mapping = require('../../mtwapp_op.json');

class CommonShareOldLanding extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    const url = decodeURIComponent(req.query.url);
    const findMapping = mapping.find((urlInfo) => urlInfo.old === url);

    if ( !FormatHelper.isEmpty(findMapping) ) {
      const menuId = findMapping.menuId;
      if ( menuId.indexOf('/product/callplan?prod_id=') !== -1 ) {
        res.redirect(menuId);
      } else {
        this.redisService.getData(REDIS_KEY.MENU_URL + menuId)
          .subscribe((resp) => {
            if ( resp.code === API_CODE.CODE_00 ) {
              res.redirect(resp.result.menuUrl);
            } else {
              res.redirect('/main/home');
            }
          });
      }

    } else {
      res.redirect('/main/home');
    }
  }
}

export default CommonShareOldLanding;

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
import BrowserHelper from '../../../../utils/browser.helper';

const mapping = require('../../mtwapp_op.json');

class CommonShareOldLanding extends TwViewController {
  constructor() {
    super();
  }

  render(req: Request, res: Response, next: NextFunction, svcInfo: any, allSvc: any, childInfo: any, pageInfo: any) {
    let url = req.query.url;
    const appUrl = req.query.app_url;

    if ( !FormatHelper.isEmpty(url) ) {
      url = decodeURIComponent(url);
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
    } else if ( !FormatHelper.isEmpty(appUrl) ) {
      this.landingAppUrl(req, res, appUrl);
    } else {
      res.redirect('/main/home');
    }
  }

  private landingAppUrl(req, res, appUrl: string) {
    switch ( appUrl ) {
      case 'A001':
        break;
      case 'A002':
        break;
      case 'A003':
        break;
      case 'A007':
        break;
      case 'A008':
        break;
      case 'A009':
        break;
      case 'A010':
        break;
      case 'A011':
        break;
      case 'A012':
        break;
      case 'A015':
        break;
      case 'A016':
        return res.render('error.login-block.html', { target: '/main/home' });
      case 'A017':
        if ( BrowserHelper.isApp(req) ) {
          if ( BrowserHelper.isAndroid(req) ) {
            return res.redirect('/common/member/slogin/aos');
          } else {
            return res.redirect('/common/member/slogin/ios');
          }
        } else {
          return res.redirect('/main/home');
        }
      case 'A020':
        return res.render('error.login-block.html', { target: '/main/home' });
      default:
        return res.redirect('/main/home');
    }
    return res.redirect('/main/home');
  }

}

export default CommonShareOldLanding;

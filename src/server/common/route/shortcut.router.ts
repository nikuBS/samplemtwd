/**
 * @file shortcut.router.ts
 * @author Ara Jo (araara.jo@sk.com)
 * @since 2018.05
 */

import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import RedisService from '../../services/redis.service';
import EnvHelper from '../../utils/env.helper';
import { REDIS_KEY } from '../../types/redis.type';
import { API_CODE } from '../../types/api-command.type';
import DateHelper from '../../utils/date.helper';
import { SHORTCUT_LOGIN_TYPE } from '../../types/bff.type';
import FormatHelper from '../../utils/format.helper';

const mapping = require('../mtwmweb_op.json');

class ShortcutRouter {
  public router: Router;
  private redisService: RedisService = RedisService.getInstance();
  private shortcutUrl = EnvHelper.getEnvironment('SHORTCUT');

  constructor() {
    this.router = express.Router();

    this.router.get('*', (req, res, next) => {
      const dns = req.headers.host;
      const path = req.path;

      if ( dns === this.shortcutUrl ) {
        this.redisService.getData(REDIS_KEY.SC_URL + path).subscribe((resp) => {
          if ( resp.code === API_CODE.CODE_00 ) {
            this.redirectTarget(req, res, next, resp.result);
          } else {
            // const menuUrl = path.replace('/', '');
            // this.redisService.getData(REDIS_KEY.MENU_URL + menuUrl).subscribe((menuResp) => {
            //   if ( menuResp.code === API_CODE.CODE_00 ) {
            //     if ( !FormatHelper.isEmpty(menuResp.result.menuUrl) ) {
            //       res.redirect('/common/share/bridge?' + 'target=' + encodeURIComponent(menuResp.result.menuUrl) + '&loginType=N');
            //     } else {
            //       next();
            //     }
            //   } else {
            //     next();
            //   }
            // });
            next();
          }
        });

      } else if ( req.path === '/' ) {
        res.redirect('/main/home');
      } else if ( req.path === '/s.jsp' ) {
        const encParam = req.query.p || '';
        res.redirect('/common/auto-sms/cert?p=' + encParam);
      } else {
        const findUrl = this.checkMapTable(req.url);
        if ( !FormatHelper.isEmpty(findUrl) ) {
          res.redirect(findUrl);
        } else {
          next();
        }
      }
    });
  }

  private redirectTarget(req, res, next, target) {
    const endDate = new Date(DateHelper.convDateCustomFormat(target.effEndDtm, 'YYYYMMDD')).getTime();
    const curDate = new Date().getTime();
    const menuUrl = target.trgtUrl;
    const loginType = SHORTCUT_LOGIN_TYPE[target.scutUrlAuthClCd];

    if ( endDate > curDate ) {
      res.redirect('/common/share/bridge?' + 'target=' + encodeURIComponent(menuUrl) + '&loginType=' + loginType);
    } else {
      next();
    }
  }

  private checkMapTable(path): string {
    const findMapping = mapping.find((urlInfo) => urlInfo.old === path);

    if ( !FormatHelper.isEmpty(findMapping) ) {
      return findMapping.new;
    }
    return '';
  }
}

export default ShortcutRouter;

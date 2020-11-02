import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import RedisService from '../../services/redis.service';
import EnvHelper from '../../utils/env.helper';
import { REDIS_KEY } from '../../types/redis.type';
import { API_CODE } from '../../types/api-command.type';
import DateHelper from '../../utils/date.helper';
import { SHORTCUT_LOGIN_TYPE } from '../../types/bff.type';
import FormatHelper from '../../utils/format.helper';
import BrowserHelper from '../../utils/browser.helper';
import { COOKIE_KEY } from '../../types_en/common.type';

const mapping = require('../mtwmweb_op.json');

/**
 * 정의되지 않은 URL 접근시 라우터
 */
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

        // 2020. 10. 28. 영문 페이지 => Menu => Settings => Set English T world as Default 가 설정되어있는 상태라면
        // '/' 로 접근하는 WEB의 페이지에 대해서 '/en/main/home' 으로 redirect 함. [김기남]
        if (!BrowserHelper.isApp(req)) {
          const isEng = req.cookies[COOKIE_KEY.GLOBAL_ENGLISH] || false;
          if ( isEng ) {
            res.redirect('/en/main/home');
            return;
          }
        }

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

  /**
   * 단축 URL 정보 파싱 및 redirect
   * @param req
   * @param res
   * @param next
   * @param target
   */
  private redirectTarget(req, res, next, target) {
    // target.effEndDtm가 1일이므로 +30일을 하려면 29를 더해야 함
    const endDate = DateHelper.getAddDays(DateHelper.convDateFormat(target.effEndDtm), 29, 'YYYYMMDD') || '00000000';
    const curDate = DateHelper.getCurrentShortDate(new Date());
    let menuUrl = target.trgtUrl;
    let loginType = SHORTCUT_LOGIN_TYPE[target.scutUrlAuthClCd];
    const referer = req.path;

    if ( Number(endDate) < Number(curDate) ) {
      menuUrl = '/main/home';
      loginType = 'N';
    }

    res.redirect('/common/share/bridge?' + 'target=' + encodeURIComponent(menuUrl) + '&loginType=' + loginType + '&referer=' + referer);
  }

  /**
   * As-is mweb 주소 json table 확인
   * @param path
   */
  private checkMapTable(path): string {
    const findMapping = mapping.find((urlInfo) => urlInfo.old === path);

    if ( !FormatHelper.isEmpty(findMapping) ) {
      return findMapping.new;
    }
    return '';
  }
}

export default ShortcutRouter;

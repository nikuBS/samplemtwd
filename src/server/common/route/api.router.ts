import express, { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { API_CMD, API_CODE, API_METHOD } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import * as path from 'path';
import RedisService from '../../services/redis.service';
import FormatHelper from '../../utils/format.helper';
import VERSION from '../../config/version.config';
import * as fs from 'fs';
import dateHelper from '../../utils/date.helper';
import environment from '../../config/environment.config';
import BrowserHelper from '../../utils/browser.helper';
import { NODE_API_ERROR } from '../../types/string.type';
import { COOKIE_KEY } from '../../types/common.type';
import { CHANNEL_CODE, MENU_CODE, REDIS_KEY, REDIS_TOS_KEY } from '../../types/redis.type';
import DateHelper from '../../utils/date.helper';
import EnvHelper from '../../utils/env.helper';
import CommonHelper from '../../utils/common.helper';

const os = require('os');

/**
 * @desc NODE API 구성 (JIRA 명세 확인)
 */
class ApiRouter {
  public router: Router;
  private logger: LoggerService = new LoggerService();
  private redisService: RedisService = RedisService.getInstance();

  constructor() {
    this.router = express.Router();
    this.setApi();
  }

  NODE_CMD = {
    CHECK_HEALTH: { path: '/health', method: API_METHOD.GET, target: this.checkHealth },
    GET_ENVIRONMENT: { path: '/environment', method: API_METHOD.GET, target: this.getEnvironment },
    GET_DOMAIN: { path: '/domain', method: API_METHOD.GET, target: this.getDomain },
    LOGIN_TID: { path: '/user/sessions', method: API_METHOD.POST, target: this.loginTid },                                      // BFF_03_0008
    LOGOUT_TID: { path: '/logout-tid', method: API_METHOD.POST, target: this.logoutTid },
    SESSION: { path: '/session', method: API_METHOD.POST, target: this.generateSession },
    EASY_LOGIN_AOS: { path: '/user/login/android', method: API_METHOD.POST, target: this.easyLoginAos },                        // BFF_03_0017
    EASY_LOGIN_IOS: { path: '/user/login/ios', method: API_METHOD.POST, target: this.easyLoginIos },                            // BFF_03_0018
    CHANGE_SESSION: { path: '/common/selected-sessions', method: API_METHOD.POST, target: this.changeSession },                  // BFF_01_0003
    LOGIN_SVC_PASSWORD: {
      path: '/user/service-password-sessions',
      method: API_METHOD.POST,
      target: this.loginSvcPassword
    },    // BFF_03_0009
    LOGIN_USER_LOCK: { path: '/user/locks', method: API_METHOD.DELETE, target: this.setUserLocks },                             // BFF_03_0010
    CHANGE_SVC_PASSWORD: {
      path: '/my-t/service-passwords',
      method: API_METHOD.POST,
      target: this.changeSvcPassword
    },  // BFF_03_0016
    CHANGE_LINE: { path: '/user/services', method: API_METHOD.POST, target: this.changeLine },                                   // BFF_03_0005
    CHANGE_NICKNAME: { path: '/user/nick-names', method: API_METHOD.POST, target: this.changeNickname },                         // BFF_03_0006
    UPDATE_SVC: { path: '/common/selected-sessions', method: API_METHOD.GET, target: this.updateSvcInfo },                       // BFF_01_0005

    UPLOAD_FILE: { path: '/uploads', method: API_METHOD.POST, target: this.uploadFile },
    GET_SVC_INFO: { path: '/svcInfo', method: API_METHOD.GET, target: this.getSvcInfo },
    GET_ALL_SVC: { path: '/allSvcInfo', method: API_METHOD.GET, target: this.getAllSvcInfo },
    GET_CHILD_INFO: { path: '/childInfo', method: API_METHOD.GET, target: this.getChildInfo },
    UPDATE_NOTICE_TYPE: { path: '/update/notice-type', method: API_METHOD.PUT, target: this.updateNoticeType },

    GET_VERSION: { path: '/app-version', method: API_METHOD.GET, target: this.getVersion },
    GET_SPLASH: { path: '/splash', method: API_METHOD.GET, target: this.getSplash },
    GET_APP_NOTICE: { path: '/app-notice', method: API_METHOD.GET, target: this.getAppNotice },
    GET_XTINFO: { path: '/xtractor-info', method: API_METHOD.GET, target: this.getXtInfo },
    GET_DOWNGRADE: { path: '/downgrade', method: API_METHOD.GET, target: this.getDowngrade },
    GET_CHANGEGUIDE: { path: '/changeGuide', method: API_METHOD.GET, target: this.getChangeGuide },

    GET_URL_META: { path: '/urlMeta', method: API_METHOD.GET, target: this.getUrlMeta },
    GET_MENU: { path: '/menu', method: API_METHOD.GET, target: this.getMenu },
    GET_MENU_RCMD: { path: '/menu-rcmd', method: API_METHOD.GET, target: this.getMenuRecommendation },
    GET_BANNER_ADMIN: { path: '/banner/admin', method: API_METHOD.GET, target: this.getBannerAdmin },
    GET_BANNER_TOS: { path: '/banner/tos', method: API_METHOD.GET, target: this.getBannerTos },
    GET_NEW_BANNER_TOS: { path: '/banner/newTos', method: API_METHOD.GET, target: this.getNewBannerTos },

    /*임시 API TOS배너확인후 삭제*/
    GET_BANNER_TOS_LNKG_INFO: { path: '/banner/bannerTosLnkgInfo', method: API_METHOD.GET, target: this.getBannerTosLnkgInfo  },
    GET_BANNER_TOS_KEY: { path: '/banner/bannerTosKey', method: API_METHOD.GET, target: this.getBannerTosKey },
    GET_BANNER_TOS_INFO: { path: '/banner/bannerTosInfo', method: API_METHOD.GET, target: this.getBannerTosInfo  },

    GET_MASKING_METHOD: { path: '/masking-method', method: API_METHOD.GET, target: this.getMaskingMethod },
    SET_MASKING_COMPLETE: { path: '/masking-complete', method: API_METHOD.POST, target: this.setMaskingComplete },
    DELETE_SESSION_STORE: { path: '/session-store', method: API_METHOD.DELETE, target: this.deleteSessionStore, },
    GET_HOME_WELCOME: { path: '/home/welcome', method: API_METHOD.GET, target: this.getHomeWelcome },
    GET_HOME_NOTICE: { path: '/home/notice', method: API_METHOD.GET, target: this.getHomeNotice },
    GET_HOME_HELP: { path: '/home/help', method: API_METHOD.GET, target: this.getHomeHelp },
    GET_TOOLTIP: { path: '/tooltip', method: API_METHOD.GET, target: this.getTooltip },
    GET_QUICK_MENU: { path: '/home/quick-menu', method: API_METHOD.GET, target: this.getQuickMenu },
    GET_QUICK_MENU_DEFAULT: {
      path: '/home/quick-menu/default',
      method: API_METHOD.GET,
      target: this.getDefaultQuickMenu
    },
    GET_PRODUCT_COMPARISON: { path: '/product/comparison', method: API_METHOD.GET, target: this.getProductComparison },
    GET_PRODUCT_INFO: { path: '/product/info', method: API_METHOD.GET, target: this.getProductInfo },
    GET_AUTH_METHOD_BLOCK: { path: '/auth-method/block', method: API_METHOD.GET, target: this.getAuthMethodsBlock },
  };

  /**
   * method에 따른 API router 구성
   */
  private setApi() {
    Object.keys(this.NODE_CMD).map((key) => {
      const cmd = this.NODE_CMD[key];
      switch ( cmd.method ) {
        case API_METHOD.GET:
          this.setGetApi(cmd);
          break;
        case API_METHOD.POST:
          this.setPostApi(cmd);
          break;
        case API_METHOD.PUT:
          this.setPutApi(cmd);
          break;
        case API_METHOD.DELETE:
          this.setDeleteApi(cmd);
          break;
      }
    });
  }

  /**
   * get API 처리
   * @param cmd
   */
  private setGetApi(cmd) {
    this.router.get(cmd.path, (req, res, next) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('expires', '0');
      res.set('pragma', 'no-cache');

      if ( this.sessionCheck(req, res, next) ) {
        cmd.target.call(this, req, res, next);
      }
    });
  }

  /**
   * post API 처리
   * @param cmd
   */
  private setPostApi(cmd) {
    this.router.post(cmd.path, (req, res, next) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('expires', '0');
      res.set('pragma', 'no-cache');

      if ( this.sessionCheck(req, res, next) ) {
        cmd.target.call(this, req, res, next);
      }
    });
  }

  /**
   * put API 처리
   * @param cmd
   */
  private setPutApi(cmd) {
    this.router.put(cmd.path, (req, res, next) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('expires', '0');
      res.set('pragma', 'no-cache');

      if ( this.sessionCheck(req, res, next) ) {
        cmd.target.call(this, req, res, next);
      }
    });
  }

  /**
   * delete API 처리
   * @param cmd
   */
  private setDeleteApi(cmd) {
    this.router.delete(cmd.path, (req, res, next) => {
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('expires', '0');
      res.set('pragma', 'no-cache');

      if ( this.sessionCheck(req, res, next) ) {
        cmd.target.call(this, req, res, next);
      }
    });
  }

  /**
   * 세션만료시 처리
   * @param req
   * @param res
   * @param next
   */
  private sessionCheck(req, res, next) {
    const loginService = new LoginService();
    const loginCookie = req.cookies[COOKIE_KEY.TWM_LOGIN];
    if ( FormatHelper.isEmpty(loginService.getSvcInfo(req)) && !FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
      res.clearCookie(COOKIE_KEY.TWM_LOGIN);
      CommonHelper.clearCookieWithPreFix(req, res, COOKIE_KEY.ON_SESSION_PREFIX);
      res.json({
        code: API_CODE.NODE_1004,
        msg: NODE_API_ERROR[API_CODE.NODE_1004]
      });
      return false;
    }
    return true;
  }

  /**
   * NODE 정상여부 확인 API
   * @param req
   * @param res
   * @param next
   */
  private checkHealth(req: Request, res: Response, next: NextFunction) {
    res.json({
      description: 'NODE Health Check',
      status: 'UP'
    });
  }

  /**
   * 환경변수 제공
   * @param req
   * @param res
   * @param next
   */
  private getEnvironment(req: Request, res: Response, next: NextFunction) {
    const env = String(process.env.NODE_ENV);
    const resp = {
      code: API_CODE.CODE_00,
      result: {
        environment: env,
        version: VERSION,
        cdn: environment[env].CDN,
        'tag-version': VERSION,
        'api-version': VERSION,
        'pod-name': os.hostname()
      }
    };
    res.json(resp);
  }

  /**
   * 도메인 주소 제공
   * @param req
   * @param res
   * @param next
   */
  private getDomain(req: Request, res: Response, next: NextFunction) {
    const resp = {
      code: API_CODE.CODE_00,
      result: {
        domain: req.protocol + '://' + req.headers.host
      }
    };

    res.json(resp);
  }

  /**
   * 버전 제공
   * @param req
   * @param res
   * @param next
   */
  private getVersion(req: Request, res: Response, next: NextFunction) {
    const env = String(process.env.NODE_ENV);
    this.redisService.getData(REDIS_KEY.APP_VERSION)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          resp.result = {
            ver: resp.result.ver,
            signGateGW: resp.result.signGateGW,
            cdn: environment[env].CDN,
            webView: resp.result.webview
          };
        }

        res.json(resp);
      });
  }

  /**
   * App Splash 정보 제공
   * @param req
   * @param res
   * @param next
   */
  private getSplash(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.APP_VERSION)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          resp.result = resp.result.splash;
        }

        res.json(resp);
      });
  }

  /**
   * App Notice 제공
   * @param req
   * @param res
   * @param next
   */
  private getAppNotice(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.APP_VERSION)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          resp.result = resp.result.notice;
        }

        res.json(resp);
      });
  }

  /**
   * xTractor 세션 값 전달
   * @param req
   * @param res
   * @param next
   */
  private getXtInfo(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService(),
      svcInfo = loginService.getSvcInfo(req);

    res.json({
      code: API_CODE.CODE_00,
      result: !svcInfo || FormatHelper.isEmpty(svcInfo.xtInfo) ? {} : Object.assign(svcInfo.xtInfo, {
        XTLOGINTYPE: svcInfo.loginType === 'S' ? 'Z' : 'A'
      })
    });
  }

  /**
   * 상품안내 팝업 레디스 조회
   * @param req
   * @param res
   * @param next
   */
  private getChangeGuide(req: Request, res: Response, next: NextFunction) {
    const value: any = req.query.value || null;
      // typeYn: any = req.query.type_yn || 'N';

    if (FormatHelper.isEmpty(value)) {
      return res.json({ code: '01' });
    }

    this.redisService.getData(REDIS_KEY.PRODUCT_CHANGEGUIDE + value)
      .subscribe((resp) => {
        if (resp.code !== API_CODE.CODE_00) {
          return res.json(resp);
        }

        res.json(Object.assign(resp, {
          result: Object.assign(resp.result, {
            guidMsgCtt: EnvHelper.replaceCdnUrl(resp.result.guidMsgCtt)
          })
        }));
      });
  }
  
  /**
   * DG방어 레디스 조회
   * @param req
   * @param res
   * @param next
   */
  private getDowngrade(req: Request, res: Response, next: NextFunction) {
    const value: any = req.query.value || null,
      typeYn: any = req.query.type_yn || 'N';

    if (FormatHelper.isEmpty(value)) {
      return res.json({ code: '01' });
    }

    this.redisService.getData((typeYn === 'Y' ? REDIS_KEY.PRODUCT_DOWNGRADE_TYPE : REDIS_KEY.PRODUCT_DOWNGRADE) + value)
      .subscribe((resp) => {
        if (resp.code !== API_CODE.CODE_00) {
          return res.json(resp);
        }

        res.json(Object.assign(resp, {
          result: Object.assign(resp.result, {
            guidMsgCtt: EnvHelper.replaceCdnUrl(resp.result.guidMsgCtt)
          })
        }));
      });
  }

  /**
   * 화면 URL Meta 정보 조회
   * @param req
   * @param res
   * @param next
   */
  private getUrlMeta(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const url = loginService.getPath(req);
    this.redisService.getData(REDIS_KEY.URL_META + url)
      .subscribe((resp) => {
        res.json(resp);
      });

  }

  /**
   * Menu List 조
   * @param req
   * @param res
   * @param next
   */
  private getMenu(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const code = BrowserHelper.isApp(req) ? MENU_CODE.MAPP : MENU_CODE.MWEB;

    const svcInfo = loginService.getSvcInfo(req);
    const allSvcInfo = loginService.getAllSvcInfo(req);

    this.logger.info(this, '[get menu]', req.cookies[COOKIE_KEY.TWM], loginService.getSessionId(req), svcInfo);
    this.redisService.getData(REDIS_KEY.MENU + code)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          resp.result.isLogin = !FormatHelper.isEmpty(svcInfo);
          if ( resp.result.isLogin ) {
            resp.result.userInfo = svcInfo;
            resp.result.userInfo.canSendFreeSMS = allSvcInfo.m.length > 0;
            resp.result.userInfo.canSendFreeSMS = svcInfo.loginType === 'T';
            resp.result.userInfo.pps = svcInfo.svcGr === 'P';
            // resp.result.userInfo.pps = false;
            // resp.result.userInfo.pps = allSvcInfo.m.reduce((memo, elem) => {
            // if ( elem.svcAttrCd.includes('M2') ) {
            // return true;
            // }
            // return memo;
            // }, false);
            if ( svcInfo.totalSvcCnt !== '0' && svcInfo.expsSvcCnt === '0' ) {
              resp.result.userInfo.canSendFreeSMS = true;
            }
          }
          res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.set('expires', '0');
          res.set('pragma', 'no-cache');
          res.json(resp);
        } else {
          res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.set('expires', '0');
          res.set('pragma', 'no-cache');
          res.json(resp);
        }
      });
  }

  /**
   * 메뉴 추천 정보 조회
   * @param req
   * @param res
   * @param next
   */
  private getMenuRecommendation(req: Request, res: Response, next: NextFunction) {
    const code = BrowserHelper.isApp(req) ? MENU_CODE.MAPP : MENU_CODE.MWEB;
    this.redisService.getData(REDIS_KEY.RCM_MENU + code)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          res.json(resp);
        }
      });
  }

  /**
   * Admin 배너 조회
   * @param req
   * @param res
   * @param next
   */
  private getBannerAdmin(req: Request, res: Response, next: NextFunction) {
    const menuId = req.query.menuId;
    this.redisService.getData(REDIS_KEY.BANNER_ADMIN + menuId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }



  /**
   * TOS 배너 조회
   * @param req
   * @param res
   * @param next
   */
  private getBannerTos(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const code = req.query.code;
    const svcInfo = loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return res.json({
        code: API_CODE.NODE_1001,
        msg: NODE_API_ERROR[API_CODE.NODE_1001]
      });
    }

    const svcMgmtNum = svcInfo.svcMgmtNum || 'null';
    const userId = svcInfo.userId;

    let bannerLink = null;
    let serialNums = '';
    let targetSerial = '';

    this.redisService.getData(REDIS_KEY.BANNER_TOS_LINK + code)
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          if ( resp.result.bltnYn === 'N' ) {
            throw resp;
          } else {
            resp.result.bltnYn = 'Y';
            if ( resp.result.tosLnkgYn === 'Y' ) {
              bannerLink = resp.result;
              return this.redisService.getStringTos(REDIS_TOS_KEY.BANNER_TOS_KEY + code + ':' + userId + ':' + svcMgmtNum);
            } else {
              throw resp;
            }
          }
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          serialNums = resp.result;
          targetSerial = serialNums;
          if ( serialNums.indexOf('R') !== -1 ) {
            targetSerial = serialNums.indexOf('|') !== -1 ? serialNums.split('|')[0] : serialNums;
          } else if (serialNums.indexOf('|') !== -1) {
            targetSerial = serialNums.split('|')[0];
          }
          return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + targetSerial);
        } else {
          return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
        }
      })
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          if ( targetSerial === '' ) {
            return Observable.of(resp);
          } else {
            const start = DateHelper.convDateCustomFormat(resp.result.summary.cmpgnStaDt + resp.result.summary.cmpgnStaHm, 'YYYYMMDDhhmm').getTime();
            const end = DateHelper.convDateCustomFormat(resp.result.summary.cmpgnEndDt + resp.result.summary.cmpgnEndHm, 'YYYYMMDDhhmm').getTime();
            const today = new Date().getTime();
            if ( start < today && end > today ) {
              targetSerial = '';
              return Observable.of(resp);
            } else {
              if ( targetSerial.indexOf('R') !== -1 && serialNums.indexOf('C') !== -1 ) {
                targetSerial = serialNums.indexOf('|') !== -1 ? serialNums.split('|')[1] : '';
                return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + targetSerial);
              } else {
                targetSerial = '';
                return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
              }
            }
          }
        } else {
          if ( targetSerial === '' ) {
            throw resp;
          } else if ( targetSerial.indexOf('R') !== -1 && serialNums.indexOf('C') !== -1 ) {
            targetSerial = serialNums.indexOf('|') !== -1 ? serialNums.split('|')[1] : '';
            return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + targetSerial);
          } else {
            return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
          }
        }
      })
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          if ( targetSerial === '' ) {
            return Observable.of(resp);
          } else {
            const start = DateHelper.convDateCustomFormat(resp.result.summary.cmpgnStaDt + resp.result.summary.cmpgnStaHm, 'YYYYMMDDhhmm').getTime();
            const end = DateHelper.convDateCustomFormat(resp.result.summary.cmpgnEndDt + resp.result.summary.cmpgnEndHm, 'YYYYMMDDhhmm').getTime();
            const today = new Date().getTime();
            if ( start < today && end > today ) {
              return Observable.of(resp);
            } else {
              targetSerial = '';
              return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
            }
          }
          return Observable.of(resp);
        } else {
          return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
        }
      })
      .subscribe((resp) => {
        Object.assign(resp.result, bannerLink);
        return res.json(resp);
      }, (err) => {
        return res.json(err);
      });
  }

  /**
   * TOS 배너 조회
   * @param req
   * @param res
   * @param next
   */
  private getNewBannerTos(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const code = req.query.code;
    const svcInfo = loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return res.json({
        code: API_CODE.NODE_1001,
        msg: NODE_API_ERROR[API_CODE.NODE_1001]
      });
    }

    const svcMgmtNum = svcInfo.svcMgmtNum || 'null';
    const userId = svcInfo.userId;

    let bannerLink = null;
    let serialNums = '';
    let realTimeBanner, campaignBanner;
    
    this.redisService.getData(REDIS_KEY.BANNER_TOS_LINK + code)
      .switchMap((resp) => {  //TOS 정보를 호출함
        if ( resp.code === API_CODE.CODE_00 ) {
          if ( resp.result.bltnYn === 'N' ) {
            throw resp;
          } else {
            resp.result.bltnYn = 'Y';
            if ( resp.result.tosLnkgYn === 'Y' ) {
              bannerLink = resp.result;
              return this.redisService.getStringTos(REDIS_TOS_KEY.BANNER_TOS_KEY + code + ':' + userId + ':' + svcMgmtNum);
            } else {
              throw resp;
            }
          }
        } else {
          throw resp;
        }
      })
      .switchMap((resp) => {//조회된 TOS정보 중 실시간배너(R)인것만 추출하여 배너를 조회함
        if ( resp.code === API_CODE.CODE_00 ) {
          serialNums = (resp.result||'').trim();
          realTimeBanner = serialNums.split('|').filter(e => e.indexOf('R') > -1);
          campaignBanner = serialNums.split('|').filter(e => e.indexOf('C') > -1);

          if(serialNums === ''){
            return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
          }else{
            return Observable.combineLatest(
              ...(realTimeBanner.map(e => this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + e))),
              ...(campaignBanner.map(e => this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + e)))
            ).switchMap(([...args ]:any[]) => {
              let imgList = args.filter(e => e.code === API_CODE.CODE_00)
                .filter(e => {
                  let start = DateHelper.convDateCustomFormat(e.result.summary.cmpgnStaDt + e.result.summary.cmpgnStaHm, 'YYYYMMDDhhmm').getTime();
                  let end = DateHelper.convDateCustomFormat(e.result.summary.cmpgnEndDt + e.result.summary.cmpgnEndHm, 'YYYYMMDDhhmm').getTime();
                  let today = new Date().getTime();
                  return start < today && end > today;
                }).reduce((p,n) => {
                  n.result.imgList.forEach(e => p.push(Object.assign({}, n.result.summary, e))); 
                  return p;
                }, []);
              
              //if(imgList.length > 0){ // 캠페인 대상군이지만 대상 캠페인이 없으면 디폴트 출력되지 않게 해달라고 하여 수정함
                return Observable.of({
                  code: API_CODE.CODE_00,
                  result: {
                    summary: {},
                    imgList: imgList
                  }
                });
              // }else{
              //   return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
              // }
            });
          }

        } else {
          return this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + 'D' + code);
        }
      })
      .subscribe((resp) => {
        if ( resp.code !== API_CODE.CODE_00 ){
          resp.code = API_CODE.CODE_00;
          resp.result = {};
        }
        Object.assign(resp.result, bannerLink);
        return res.json(resp);
      }, (err) => {
        return res.json(err);
      });
  }

  /**
   * BannerTosLnkgInfo 조회
   * @param req
   * @param res
   * @param next
   */
  private getBannerTosLnkgInfo(req: Request, res: Response, next: NextFunction) {
    const code = req.query.code;
    this.redisService.getData(REDIS_KEY.BANNER_TOS_LINK + code)
      .subscribe((resp) => {
        res.json(resp);
      });
  }
  
  /**
   * getBannerTosKey 조회
   * @param req
   * @param res
   * @param next
   */
  private getBannerTosKey(req: Request, res: Response, next: NextFunction) {
    const code = req.query.code;
    const uId = req.query.uId;
    this.redisService.getTosRedisKey(REDIS_TOS_KEY.BANNER_TOS_KEY + code + ":" + uId + ":*")
      .switchMap((resp) => {
        return this.redisService.getStringTos(resp.result); 
      })
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * bannerTosInfo 조회
   * @param req
   * @param res
   * @param next
   */
  private getBannerTosInfo(req: Request, res: Response, next: NextFunction) {
    const cId = req.query.cId;
    this.redisService.getData(REDIS_KEY.BANNER_TOS_INFO + cId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * Welcome Message 조회
   * @param req
   * @param res
   * @param next
   */
  private getHomeWelcome(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.HOME_NOTI)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * 홈화면 공지사항 조회
   * @param req
   * @param res
   * @param next
   */
  private getHomeNotice(req: Request, res: Response, next: NextFunction) {
    const code = !BrowserHelper.isApp(req) ? CHANNEL_CODE.MWEB :
      BrowserHelper.isIos(req) ? CHANNEL_CODE.IOS : CHANNEL_CODE.ANDROID;
    this.redisService.getData(REDIS_KEY.HOME_NOTICE + code)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * 홈화면 이럴땐 이렇게 하세요 조회
   * @param req
   * @param res
   * @param next
   */
  private getHomeHelp(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.HOME_HELP)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * 페이지별 Tooltip 조회
   * @param req
   * @param res
   * @param next
   */
  private getTooltip(req: Request, res: Response, next: NextFunction) {
    const menuId = req.query.menuId;
    this.redisService.getData(REDIS_KEY.TOOLTIP + menuId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * 등록된 바로가기 메뉴 조회
   * @param req
   * @param res
   * @param next
   */
  private getQuickMenu(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const svcInfo = loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) || svcInfo.expsSvcCnt === '0' ) {
      this.redisService.getData(REDIS_KEY.QUICK_DEFAULT + 'N')
        .subscribe((resp) => {
          if ( resp.code === API_CODE.CODE_00 ) {
            resp.result.enableEdit = 'N';
          }
          return res.json(resp);
        });
    } else {
      const svcMgmtNum = svcInfo.svcMgmtNum;
      const svcGr = svcInfo.svcGr;
      this.redisService.getDataTos(REDIS_TOS_KEY.QUICK_MENU + svcMgmtNum)
        .switchMap((resp) => {
          if ( resp.code === API_CODE.REDIS_SUCCESS ) {
            resp.result.enableEdit = 'Y';
            return Observable.of(resp);
          } else {
            return this.redisService.getData(REDIS_KEY.QUICK_DEFAULT + svcGr);
          }
        })
        .subscribe((resp) => {
          resp.result.enableEdit = 'Y';
          return res.json(resp);
        });
    }
  }

  /**
   * 바로가기 Default 값 조회
   * @param req
   * @param res
   * @param next
   */
  private getDefaultQuickMenu(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const apiService = new ApiService();
    apiService.setCurrentReq(req, res);
    const svcInfo = loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return res.json({
        code: API_CODE.NODE_1001,
        msg: NODE_API_ERROR[API_CODE.NODE_1001]
      });
    }
    const svcGr = svcInfo.svcGr;
    this.redisService.getData(REDIS_KEY.QUICK_DEFAULT + svcGr)
      .subscribe((resp) => {
        return res.json(resp);
      });
  }

  /**
   * 요금제 비교하기 컨텐츠 조
   * @param req
   * @param res
   * @param next
   */
  private getProductComparison(req: Request, res: Response, next: NextFunction) {
    const beforeId = req.query.beforeId;
    const afterId = req.query.afterId;
    this.redisService.getData(REDIS_KEY.PRODUCT_COMPARISON + beforeId + '/' + afterId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * 상품 메타정보 조회
   * @param req
   * @param res
   * @param next
   */
  private getProductInfo(req: Request, res: Response, next: NextFunction) {
    const prodId = req.query.prodId;
    this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * 인증 수단 점검내역 조회
   * @param req
   * @param res
   * @param next
   */
  private getAuthMethodsBlock(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.AUTH_METHOD_BLOCK)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * 마스킹 인증 수단 조회
   * @param req
   * @param res
   * @param next
   */
  private getMaskingMethod(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.MASKING_METHOD)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  /**
   * 마스킹 인증 완료 설정
   * @param req
   * @param res
   * @param next
   */
  private setMaskingComplete(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const apiService = new ApiService();
    apiService.setCurrentReq(req, res);

    const svcInfo = loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return res.json({
        code: API_CODE.NODE_1001,
        msg: NODE_API_ERROR[API_CODE.NODE_1001]
      });
    }
    const svcMgmtNum = req.body.svcMgmtNum;

    loginService.setMaskingCert(req, svcMgmtNum)
      .switchMap((resp) => loginService.clearSessionStore(req, svcMgmtNum))
      .switchMap((resp) => apiService.updateSvcInfo({}))
      .subscribe((resp) => {
        res.json({
          code: API_CODE.CODE_00
        });
      });
  }

  /**
   * 세션에 저장된 API 정보 삭제
   * @param req
   * @param res
   * @param next
   */
  private deleteSessionStore(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const apiService = new ApiService();
    apiService.setCurrentReq(req, res);

    const svcInfo = loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return res.json({
        code: API_CODE.NODE_1001,
        msg: NODE_API_ERROR[API_CODE.NODE_1001]
      });
    }
    const svcMgmtNum = svcInfo.svcMgmtNum;
    const apiId = req.body.apiId ? req.body.apiId.command : null;
    loginService.clearSessionStore(req, svcMgmtNum, apiId)
      .subscribe((resp) => {
        res.json({
          code: API_CODE.CODE_00
        });
      });
  }

  /**
   * 파일 업로드
   */
  private upload() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        let storagePath = path.resolve(__dirname, '../../../../', 'uploads/');

        if ( !FormatHelper.isEmpty(req.body.dest) ) {
          const dateFormat = dateHelper.getShortDateWithFormat(new Date(), 'YYMMDD');

          storagePath += '/' + req.body.dest + '/';
          if ( !fs.existsSync(storagePath) ) {
            fs.mkdirSync(storagePath);
          }

          storagePath += dateFormat + '/';
          if ( !fs.existsSync(storagePath) ) {
            fs.mkdirSync(storagePath);
          }
        }

        cb(null, storagePath);
      },
      filename: (req, file, cb) => {
        cb(null, new Date().valueOf() + '_' + Math.floor((Math.random() * 10000) + 1) + path.extname(file.originalname));
      },
      limits: { fileSize: 5 * 1024 * 1024 }
    });

    return multer({ storage: storage }).array('file');
  }

  /**
   * 파일 업로드 API
   * @param req
   * @param res
   * @param next
   */
  private uploadFile(req: Request, res: Response, next: NextFunction) {
    this.upload()(req, res, (err) => {
      if ( err ) {
        this.logger.error(this, err);
        res.json({ code: err.errno, msg: err.code });
        return;
      }

      this.logger.info(this, req['files']);
      const files = req['files'];

      const resp = {
        code: API_CODE.CODE_00,
        result: files.map((file) => {
          return {
            name: file.filename,
            size: file.size,
            path: file.destination.match(/uploads\/(.+)?/)[0],
            originalName: file.originalname
          };
        })
      };

      res.json(resp);
    });
  }

  /**
   * 현재 회선 정보 조회
   * @param req
   * @param res
   * @param next
   */
  private getSvcInfo(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    this.logger.info(this, '[get svcInfo]', req.cookies[COOKIE_KEY.TWM], loginService.getSessionId(req));
    res.json({
      code: API_CODE.CODE_00,
      result: loginService.getSvcInfo(req)
    });
  }

  /**
   * 전체 회선 정보 조회
   * @param req
   * @param res
   * @param next
   */
  private getAllSvcInfo(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    this.logger.info(this, '[get allSvcInfo]');
    res.json({
      code: API_CODE.CODE_00,
      result: loginService.getAllSvcInfo(req)
    });
  }

  /**
   * 자녀 회선 정보 조
   * @param req
   * @param res
   * @param next
   */
  private getChildInfo(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    this.logger.info(this, '[get childInfo]');
    res.json({
      code: API_CODE.CODE_00,
      result: loginService.getChildInfo(req)
    });
  }

  /**
   * NoticeType 변경
   * @param req
   * @param res
   * @param next
   */
  private updateNoticeType(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    this.logger.info(this, '[update noticeType]');
    loginService.setNoticeType(req, '').subscribe((resp) => {
      res.json(resp);
    });
  }

  /**
   * 선택 회선 변경
   * @param req
   * @param res
   * @param next
   */
  private changeSession(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body;
    this.logger.info(this, '[chagne session]', params);

    apiService.setCurrentReq(req, res);
    apiService.requestChangeSession(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * 고객비밀번호 로그인
   * @param req
   * @param res
   * @param next
   */
  private loginSvcPassword(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body;
    apiService.setCurrentReq(req, res);
    apiService.requestLoginSvcPassword(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * 로그인 요청
   * @param req
   * @param res
   * @param next
   */
  private loginTid(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body;
    apiService.setCurrentReq(req, res);
    apiService.requestLoginTid(params.tokenId, params.state).subscribe((resp) => {
      this.logger.info(this, '[TID login]', resp);
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * 로그아웃 요청
   * @param req
   * @param res
   * @param next
   */
  private logoutTid(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const apiService = new ApiService();
    apiService.setCurrentReq(req, res);

    const svcInfo = loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return res.json({
        code: API_CODE.NODE_1003,
        msg: NODE_API_ERROR[API_CODE.NODE_1003]
      });
    }

    apiService.request(API_CMD.BFF_03_0001, {})
      .switchMap((resp) => {
        return loginService.logoutSession(req, res);
      })
      .subscribe((resp) => {
        this.logger.info(this, '[TID logout]', loginService.getSvcInfo(req));
        res.json({ code: API_CODE.CODE_00 });
      });
  }

  /**
   * 신규 세션 생
   * @param req
   * @param res
   * @param next
   */
  private generateSession(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    loginService.sessionGenerate(req, res).subscribe(() => {
      this.logger.info(this, '[Session ID]', loginService.getSessionId(req));
      res.json({ code: API_CODE.CODE_00 });
    });
  }

  /**
   * 휴면 해제 요청
   * @param req
   * @param res
   * @param next
   */
  private setUserLocks(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body;
    apiService.setCurrentReq(req, res);
    apiService.requestUserLocks(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * 안드로이드 간편 로그인 요청
   * @param req
   * @param res
   * @param next
   */
  private easyLoginAos(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body;
    apiService.setCurrentReq(req, res);
    apiService.requestEasyLoginAos(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * IOS 간편 로그인 요
   * @param req
   * @param res
   * @param next
   */
  private easyLoginIos(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body;
    apiService.setCurrentReq(req, res);
    apiService.requestEasyLoginIos(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * 고객보호비밀번호 설정 요청
   * @param req
   * @param res
   * @param next
   */
  private changeSvcPassword(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body;
    apiService.setCurrentReq(req, res);
    apiService.requestChangeSvcPassword(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * 회선변경 요청
   * @param req
   * @param res
   * @param next
   */
  public changeLine(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body.params || {};
    const headers = req.body.headers || null;
    const pathParams = req.body.pathParams || [];
    const version = req.body.version || null;

    apiService.setCurrentReq(req, res);
    apiService.requestChangeLine(params, headers, pathParams, version).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * 닉네임 변경 요청
   * @param req
   * @param res
   * @param next
   */
  public changeNickname(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    const params = req.body.params || {};
    const headers = req.body.headers || null;
    const pathParams = req.body.pathParams || [];
    const version = req.body.version || null;

    apiService.setCurrentReq(req, res);
    apiService.requestChangeNickname(params, headers, pathParams, version).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  /**
   * 회선정보 업데이트 요청
   * @param req
   * @param res
   * @param next
   */
  public updateSvcInfo(req: Request, res: Response, next: NextFunction) {
    const apiService = new ApiService();
    apiService.setCurrentReq(req, res);
    apiService.updateSvcInfo({}).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

}

export default ApiRouter;

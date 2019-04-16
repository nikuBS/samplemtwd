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

const os = require('os');

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

    GET_URL_META: { path: '/urlMeta', method: API_METHOD.GET, target: this.getUrlMeta },
    GET_MENU: { path: '/menu', method: API_METHOD.GET, target: this.getMenu },
    GET_MENU_RCMD: { path: '/menu-rcmd', method: API_METHOD.GET, target: this.getMenuRecommendation },
    GET_BANNER_ADMIN: { path: '/banner/admin', method: API_METHOD.GET, target: this.getBannerAdmin },
    GET_BANNER_TOS: { path: '/banner/tos', method: API_METHOD.GET, target: this.getBannerTos },
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
    GET_AUTH_METHOD_BLOCK: { path: '/auth-method/block', method: API_METHOD.GET, target: this.getAuthMethosBlock },
  };

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

  private sessionCheck(req, res, next) {
    const loginService = new LoginService();
    const loginCookie = req.cookies[COOKIE_KEY.TWM_LOGIN];
    if ( FormatHelper.isEmpty(loginService.getSvcInfo(req)) && !FormatHelper.isEmpty(loginCookie) && loginCookie === 'Y' ) {
      res.clearCookie(COOKIE_KEY.TWM_LOGIN);
      res.json({
        code: API_CODE.NODE_1004,
        msg: NODE_API_ERROR[API_CODE.NODE_1004]
      });
      return false;
    }
    return true;
  }

  private checkHealth(req: Request, res: Response, next: NextFunction) {
    res.json({
      description: 'NODE Health Check',
      status: 'UP'
    });
  }

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

  private getDomain(req: Request, res: Response, next: NextFunction) {
    const resp = {
      code: API_CODE.CODE_00,
      result: {
        domain: req.protocol + '://' + req.headers.host
      }
    };

    res.json(resp);
  }

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

  private getSplash(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.APP_VERSION)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          resp.result = resp.result.splash;
        }

        res.json(resp);
      });
  }

  private getAppNotice(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.APP_VERSION)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          resp.result = resp.result.notice;
        }

        res.json(resp);
      });
  }

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

  private getUrlMeta(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    const url = loginService.getPath(req);
    this.redisService.getData(REDIS_KEY.URL_META + url)
      .subscribe((resp) => {
        res.json(resp);
      });

  }

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

  private getMenuRecommendation(req: Request, res: Response, next: NextFunction) {
    const code = BrowserHelper.isApp(req) ? MENU_CODE.MAPP : MENU_CODE.MWEB;
    this.redisService.getData(REDIS_KEY.RCM_MENU + code)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          res.json(resp);
        }
      });
  }

  private getBannerAdmin(req: Request, res: Response, next: NextFunction) {
    const menuId = req.query.menuId;
    this.redisService.getData(REDIS_KEY.BANNER_ADMIN + menuId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

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
            const start = DateHelper.convDateCustomFormat(resp.result.cmpgnStaDt + resp.result.cmpgnStaHm, 'YYYYMMDDhhmm').getTime();
            const end = DateHelper.convDateCustomFormat(resp.result.cmpgnEndDt + resp.result.cmpgnEndHm, 'YYYYMMDDhhmm').getTime();
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
            const start = DateHelper.convDateCustomFormat(resp.result.cmpgnStaDt + resp.result.cmpgnStaHm, 'YYYYMMDDhhmm').getTime();
            const end = DateHelper.convDateCustomFormat(resp.result.cmpgnEndDt + resp.result.cmpgnEndHm, 'YYYYMMDDhhmm').getTime();
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

  private getHomeWelcome(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.HOME_NOTI)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getHomeNotice(req: Request, res: Response, next: NextFunction) {
    const code = !BrowserHelper.isApp(req) ? CHANNEL_CODE.MWEB :
      BrowserHelper.isIos(req) ? CHANNEL_CODE.IOS : CHANNEL_CODE.ANDROID;
    this.redisService.getData(REDIS_KEY.HOME_NOTICE + code)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getHomeHelp(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.HOME_HELP)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getTooltip(req: Request, res: Response, next: NextFunction) {
    const menuId = req.query.menuId;
    this.redisService.getData(REDIS_KEY.TOOLTIP + menuId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

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
      this.redisService.getData(REDIS_KEY.QUICK_MENU + svcMgmtNum)
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

  private getProductComparison(req: Request, res: Response, next: NextFunction) {
    const beforeId = req.query.beforeId;
    const afterId = req.query.afterId;
    this.redisService.getData(REDIS_KEY.PRODUCT_COMPARISON + beforeId + '/' + afterId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getProductInfo(req: Request, res: Response, next: NextFunction) {
    const prodId = req.query.prodId;
    this.redisService.getData(REDIS_KEY.PRODUCT_INFO + prodId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getAuthMethosBlock(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.AUTH_METHOD_BLOCK)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getMaskingMethod(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.MASKING_METHOD)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

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
    loginService.clearSessionStore(req, svcMgmtNum)
      .subscribe((resp) => {
        res.json({
          code: API_CODE.CODE_00
        });
      });
  }

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

  private getSvcInfo(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    this.logger.info(this, '[get svcInfo]', req.cookies[COOKIE_KEY.TWM], loginService.getSessionId(req));
    res.json({
      code: API_CODE.CODE_00,
      result: loginService.getSvcInfo(req)
    });
  }

  private getAllSvcInfo(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    this.logger.info(this, '[get allSvcInfo]');
    res.json({
      code: API_CODE.CODE_00,
      result: loginService.getAllSvcInfo(req)
    });
  }

  private getChildInfo(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    this.logger.info(this, '[get childInfo]');
    res.json({
      code: API_CODE.CODE_00,
      result: loginService.getChildInfo(req)
    });
  }

  private updateNoticeType(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    this.logger.info(this, '[update noticeType]');
    loginService.setNoticeType(req, '').subscribe((resp) => {
      res.json(resp);
    });
  }

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

  private generateSession(req: Request, res: Response, next: NextFunction) {
    const loginService = new LoginService();
    loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, '[Session ID]', loginService.getSessionId(req));
      res.json({ code: API_CODE.CODE_00 });
    });
  }

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

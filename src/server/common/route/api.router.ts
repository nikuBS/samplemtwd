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
import { NODE_API_ERROR, WIDGET_REMAINS_CODE, UNLIMIT_NAME } from '../../types/string.type';
import { UNIT, UNIT_E, TPLAN_SHARE_LIST, WIDGET_ERROR } from '../../types/bff.type';
import { COOKIE_KEY } from '../../types/common.type';
import { CHANNEL_CODE, MENU_CODE, REDIS_KEY, REDIS_TOS_KEY } from '../../types/redis.type';
import DateHelper from '../../utils/date.helper';
import EnvHelper from '../../utils/env.helper';
import CommonHelper from '../../utils/common.helper';
import CryptoHelper from '../../utils/crypto.helper';
import { SSO_SERVICE_LIST } from '../../types/config.type';

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
    GET_SSO_URL: { path: '/common/sso-url', method: API_METHOD.GET, target: this.getSsoUrl },
    // OP002-6700 : [FE] Session 오류 디버깅을 위한 로그 추가-1
    GET_SESSION_INFO: { path: '/common/session/info', method: API_METHOD.GET, target: this.getSessionInfo },

    // 위젯 잔여량 조회
    GET_WIDGET_REMAINS: { path: '/widget/remains', method: API_METHOD.GET, target: this.getWidgetRemains }
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
            // null 객체 접근 방지
            if ( !!allSvcInfo && !!allSvcInfo.m ) {
              resp.result.userInfo.canSendFreeSMS = allSvcInfo.m.length > 0;
            }
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

    let bannerLink = {};
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

        // 오류가 발생하면 데이터가 없는 것이기 때문에, admin banner을 출력하도록 유도한다.
        if (!FormatHelper.isEmpty(bannerLink)) {
          bannerLink['tosLnkgYn'] = 'N';
        }

        Object.assign(err, {code: API_CODE.CODE_00, msg: 'success'});
        Object.assign(err.result, bannerLink);
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
          // 응답값 조회 실패한 svcGr 입력 탐지 로그
          if ( resp.code !== API_CODE.REDIS_SUCCESS ) {
            this.logger.error(this, 'Invalid svcGr :', svcGr + ', ' + resp.msg, '\n', svcInfo);
          }
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
      const loginService = new LoginService();
      loginService.printLoginErrorLog(this, '[TID login]', req, res, params, error);
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
   * 신규 세션 생성
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
      const loginService = new LoginService();
      // log
      loginService.printLoginErrorLog(this, '[AOS Easy login]', req, res, params, error);
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
      const loginService = new LoginService();
      // log
      loginService.printLoginErrorLog(this, '[IOS Easy login]', req, res, params, error);
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

  /**
   * SSO를 위한 URL 가져오기
   * @param req
   * @param res
   * @param next
   */
  private getSsoUrl(req: Request, res: Response, next: NextFunction) {

    let url: any = decodeURIComponent((req.query.url || ''));
    this.logger.info(this, '[getSsoUrl] original url', url);

    const serviceList: any = SSO_SERVICE_LIST.filter(function(item) {    
      return (url.indexOf(item.host) !== -1);
    });

    if (FormatHelper.isEmpty(serviceList) || serviceList.length < 1) {
      res.json({
        code: API_CODE.CODE_404
      });
      return;
    }

    const service = serviceList[0];
    const loginService = new LoginService();
    const svcInfo = loginService.getSvcInfo(req);

    if (FormatHelper.isEmpty(svcInfo)) {
      res.json({
        code: API_CODE.CODE_404
      });
      return;
    }

    let value = svcInfo[service.session_key];

    if (FormatHelper.isEmpty(value)) {
      res.json({
        code: API_CODE.CODE_404
      });
    } else {
      url = url.concat(
        url.indexOf('?') === -1 ? '?' : '&', 
        service.sso_param, 
        '=', 
        CryptoHelper.encrypt(value, service.encrpyt_key, service.encrpyt_algorigm, service.encrpyt_iv)
      );
      
      Object.keys(service.etc_params).map((param) => {
        value = svcInfo[service.etc_params[param]];
        url = url.concat('&', param, '=', CryptoHelper.encrypt(value, service.encrpyt_key, service.encrpyt_algorigm, service.encrpyt_iv));
      });

      this.logger.info(this, '[getSsoUrl] return url', url);
      res.json({
        code: API_CODE.CODE_00,
        result: encodeURIComponent(url)
      });
      return;
    }
  }

  /**
   * session 정보 확인
   * @param req
   */
  private getSessionInfo(req, res) {
    const twm = req.query.twm;
    const key = REDIS_KEY.SESSION + twm;
    const ret = {};

    // 임시로 kjh1234@gmail.com로 로그인 된 경우만 조회 가능하도록 추가
    if ( !FormatHelper.isEmpty(req.session.svcInfo) && req.session.svcInfo.userId === 'kjh1234@gmail.com') {
      this.redisService.getData(key)
        .switchMap((resp) => {
          ret['userId'] = resp.result.svcInfo.userId;
          ret['cookie'] = resp.result.cookie;
          ret['loginHst'] = resp.result.loginHst;
          return this.redisService.getTTL(key); 
        })
        .subscribe((resp) => {
          ret['ttl'] = resp.result;
          res.json(ret);
        });
    } else {
      res.status(404).render('error.page-not-found.html', { svcInfo: null, code: res.statusCode });
    }
  }
  
  /**
   * 위젯 잔여량 조회 및 정제
   * @param req
   * @param res
   * @param next
   */
  private getWidgetRemains(req: Request, res: Response, next: NextFunction) {
    // Console 테스트 용1 : $.ajax('http://localhost:3000/api/widget/remains?svcMgmtNum=7253819428&dataCode=DD3J5&voiceCode=DD3J8&smsCode=DD3IZ') 김강타 본회선
    // Console 테스트 용2 : $.ajax('http://localhost:3000/api/widget/remains?svcMgmtNum=7045659333&dataCode=DD3J5&voiceCode=DD3J8&smsCode=DD3IZ') 김강타 부회선
    // Console 테스트 용3 : $.ajax('http://localhost:3000/api/widget/remains?svcMgmtNum=7039762321&dataCode=DD3II&voiceCode=DD3IJ&smsCode=DD3IB') 전형득 수석님 1번 회선

    const apiService = new ApiService();
    apiService.setCurrentReq(req, res);

    // 조회대상 회선 및 공제코드 변수 생성
    // TODO: 상용 반영 시 Query들 Header로 입력받도록 수정 필요
    let svcMgmtNum: any = req.headers.svcMgmtNum || null;
    let dataCode: any = req.headers.dataCode || null;
    let voiceCode: any = req.headers.voiceCode || null;
    let smsCode: any = req.headers.smsCode || null;
    // let svcMgmtNum: any = req.headers.svcMgmtNum || req.query.svcMgmtNum || null;
    // let dataCode: any = req.headers.dataCode || req.query.dataCode || null;
    // let voiceCode: any = req.headers.voiceCode || req.query.voiceCode || null;
    // let smsCode: any = req.headers.smsCode || req.query.smsCode || null;

    // 회선정보 조회 API 호출해서 잔여량 조회할 서비스관리번호 유효성 체크
    apiService.request(API_CMD.BFF_01_0002, {}).subscribe((resp) => {
      if ( resp.code !== '00' ) {
        return res.json(resp);
      }

      // 서비스관리번호 입력되지 않은 경우 첫 번째 무선 회선으로 설정
      if ( svcMgmtNum === null ) {
        if ( resp.result && resp.result.m && resp.result.m.length > 0 ) {
          svcMgmtNum = resp.result.m[0].svcMgmtNum;
        }
      }

      // 서비스관리번호 유효성 체크 Flag
      let isValidSvcMgmtNum = false;

      // 모바일 회선 리스트에서 조회
      if ( resp.result && resp.result.m ) {
        resp.result.m.map((line) => {
          if ( line.svcMgmtNum === svcMgmtNum ) {
            isValidSvcMgmtNum = true;
          }
        });
      }

      // 서비스관리번호 조회되지 않을 경우 Error Return
      if ( !isValidSvcMgmtNum ) {
        return res.json(WIDGET_ERROR.SVCMGMTNUM_INVALID);
      }

      // 잔여량 조회 BFF 호출
      apiService.request(API_CMD.BFF_05_0001, {}, { 'T-svcMgmtNum': svcMgmtNum }).subscribe((resp) => {
      //apiService.request(API_CMD.BFF_01_0002, {}).subscribe((resp) => { // 잔여량 조회 횟수 제한으로 테스트 시 다른 BFF 호출
  
        // 목업 데이터 (전형득 수석님 1번 회선)
        // resp = {"code":"00","msg":"success","result":{"dataTopUp":"N","ting":"N","dataDiscount":"N","gnrlData":[{"prodId":"POT10","prodNm":"T가족모아데이터","skipId":"POT10","skipNm":"T가족모아데이터","unlimit":"0","total":"9999999","used":"0","remained":"5555555","unit":"140","rgstDtm":"","exprDtm":""},{"prodId":"NA00006536","prodNm":"T플랜 안심4G","skipId":"FD004","skipNm":"데이터리필","unlimit":"0","total":"4194304","used":"1327544","remained":"2866760","unit":"140","rgstDtm":"20191201070304","exprDtm":""},{"prodId":"NA00006536","prodNm":"T플랜 안심4G","skipId":"DD3II","skipNm":"데이터통화 4GB 무료","unlimit":"0","total":"4194304","used":"936","remained":"2254654","unit":"110","rgstDtm":"","exprDtm":""}],"spclData":[{"prodId":"NA00006536","prodNm":"T플랜 안심4G","skipId":"DD3IC","skipNm":"데이터서비스 이용 음성통화","unlimit":"0","total":"4194304","used":"15772","remained":"4178532","unit":"140","rgstDtm":"","exprDtm":""},{"prodId":"NA00006536","prodNm":"T플랜 안심4G","skipId":"DD3IK","skipNm":"한도초과후 데이터 무료","unlimit":"1","total":"무제한","used":"무제한","remained":"무제한","unit":"140","rgstDtm":"","exprDtm":""}],"voice":[{"prodId":"NA00006536","prodNm":"T플랜 안심4G","skipId":"DD3IJ","skipNm":"영상, 부가전화 300분","unlimit":"0","total":"18000","used":"53","remained":"17947","unit":"240","rgstDtm":"","exprDtm":""},{"prodId":"NA00006536","prodNm":"T플랜 안심4G","skipId":"DD3IG","skipNm":"SKT 고객간 음성 무제한","unlimit":"M","total":"무제한","used":"12460","remained":"무제한","unit":"240","rgstDtm":"","exprDtm":""},{"prodId":"NA00006536","prodNm":"T플랜 안심4G","skipId":"DD3IH","skipNm":"집전화·이동전화 음성 무제한","unlimit":"M","total":"무제한","used":"878","remained":"무제한","unit":"240","rgstDtm":"","exprDtm":""}],"sms":[{"prodId":"NA00006536","prodNm":"T플랜 안심4G","skipId":"DD3IB","skipNm":"SMS/MMS/ⓜ메신저 기본제공","unlimit":"B","total":"기본제공","used":"기본제공","remained":"기본제공","unit":"310","rgstDtm":"","exprDtm":""}],"etc":[]}};
  
        // 잔여량 조회 실패 시 Error return
        if ( resp.code !== '00' ) {
          return res.json(resp);
        }
  
        // 잔여 데이터 객체 생성
        const remainedData: any = {
          isEmpty: true,
          unlimit: false, // 무제한 여부
          unlimit_default: false, // 기본제공 여부 (무제한 표기의 일종, '무제한'을 우선으로 표기)
          total : 0, // 제공량
          remained: 0, // 잔여량
          sharedRemained: 0, // T가족모아데이터 잔여량
          unit: '' // 단위
        };
  
        // 요청받은 데이터 공제코드가 없을 경우 합산 데이터(기본값)로 설정
        if ( dataCode === null ) {
          if ( resp.result && resp.result.gnrlData && resp.result.gnrlData.length > 0 ) {
            dataCode = WIDGET_REMAINS_CODE.DATA_SUM;
          }
        } else { // 배열로 dataCode를 전달 받아도 공제 합산을 위해서 초기화 
          dataCode = WIDGET_REMAINS_CODE.DATA_SUM;
        }
  
        // 데이터에서 공제코드 검색
        // 요청받은 공제코드가 합산 데이터일 경우
        let dataCodes: string[] = [];
        if ( dataCode === WIDGET_REMAINS_CODE.DATA_SUM ) {
          if ( resp.result && resp.result.gnrlData ) {
            resp.result.gnrlData.map((data) => {
              dataCodes.push(data.skipId);
              // KB 단위 잔여량만 합산
              if ( data.unit === UNIT_E.DATA ) {
                remainedData.isEmpty = false;
  
                // 데이터 항목 중 무제한 또는 기본제공 있을 경우 Flag 설정
                switch (data.unlimit) {
                  // 무제한
                  case '1':
                  case 'M':
                    remainedData.unlimit = true;
                    return;
                  // 기본제공
                  case 'B':
                    remainedData.unlimit_default = true;
                    return;
                }
  
                // 각 항목 별 제공량 합산
                remainedData.total += +data.total;
                
                // 각 항목 별 잔여량 합산 (T가족모아데이터는 별도 표기하기 위해 따로 합산)
                if ( TPLAN_SHARE_LIST.indexOf(data.skipId) === -1 ) {
                  remainedData.remained += +data.remained;
                } else {
                  remainedData.sharedRemained += +data.remained;
                }
  
                // 단위 설정 (합산은 무조건 KB)
                remainedData.unit = UNIT_E.DATA;
              }
            });
          }
        } else { // 요청받은 공제코드가 합산 데이터가 아닐 경우
          // 범용 데이터에서 공제코드 검색
          if ( resp.result && resp.result.gnrlData ) {
            let dcs = dataCode.split(",") || dataCode;
            resp.result.gnrlData.map((data) => {
              for (let d in dcs) {
                  if (d === data.skipId) {
                    dataCodes.push(data.skipId);
                    // 요청한 공제코드가 있을 경우 잔여량 입력
                    if ( data.skipId === dataCode ) {
                      remainedData.isEmpty = false;
                      
                      // 데이터 항목이 무제한 또는 기본제공일 경우 Flag 설정
                      switch (data.unlimit) {
                        // 무제한
                        case '1':
                        case 'M':
                          remainedData.unlimit = true;
                          return;
                        // 기본제공
                        case 'B':
                          remainedData.unlimit_default = true;
                          return;
                      }
        
                      // 제공량 입력
                      remainedData.total = +data.total;
                      
                      // 잔여량 입력 (T가족모아데이터는 별도 표기하기 위해 따로 합산)
                      if ( TPLAN_SHARE_LIST.indexOf(data.skipId) === -1 ) {
                        remainedData.remained = +data.remained;
                      } else {
                        remainedData.sharedRemained = +data.remained;
                      }
        
                      // 단위 설정
                      remainedData.unit = data.unit;
                    }
                  }
              }
            });
          }
  
          // 범용 데이터에서 찾지 못했을 경우 특수 데이터에서 공제코드 검색
          if ( remainedData.isEmpty === true ) {
            if ( resp.result && resp.result.spclData ) {
              resp.result.spclData.map((data) => {
                dataCodes.push(data.skipId);
                // 요청한 공제코드가 있을 경우 잔여량 입력
                if ( data.skipId === dataCode ) {
                  remainedData.isEmpty = false;
                  
                  // 데이터 항목이 무제한 또는 기본제공일 경우 Flag 설정
                  switch (data.unlimit) {
                    // 무제한
                    case '1':
                    case 'M':
                      remainedData.unlimit = true;
                      return;
                    // 기본제공
                    case 'B':
                      remainedData.unlimit_default = true;
                      return;
                  }
  
                  // 제공량 입력
                  remainedData.total = +data.total;
                  
                  // 잔여량 입력 (T가족모아데이터는 별도 표기하기 위해 따로 합산)
                  if ( TPLAN_SHARE_LIST.indexOf(data.skipId) === -1 ) {
                    remainedData.remained = +data.remained;
                  } else {
                    remainedData.sharedRemained = +data.remained;
                  }
      
                  // 단위 설정
                  remainedData.unit = data.unit;
                }
              });
            }
          }
        }
        // 잔여 데이터 조회 및 객체(remainedData) 설정 완료
  
  
  
        // 잔여 음성 객체 생성
        const remainedVoice: any = {
          isEmpty: true,
          unlimit: false, // 무제한 여부
          unlimit_default: false, // 기본제공 여부 (무제한 표기의 일종, '무제한'을 우선으로 표기)
          total : 0, // 제공량
          remained: 0, // 잔여량
          unit: '' // 단위
        };
  
        // 미설정코드 처리 
        // 요청받은 음성 공제코드가 없을 경우 첫번째 항목으로 기본값 설정
        if ( voiceCode === null ) {
          if ( resp.result && resp.result.voice && resp.result.voice.length > 0 ) {
            voiceCode = resp.result.voice[0].skipId;
          }
        }
  
        // 음성에서 공제코드 검색
        if ( resp.result && resp.result.voice ) {
          resp.result.voice.map((voice) => {
            // 요청한 공제코드가 있을 경우 잔여량 입력
            if ( voice.skipId === voiceCode ) {
              remainedVoice.isEmpty = false;
              
              // 음성 항목이 무제한 또는 기본제공일 경우 Flag 설정
              switch (voice.unlimit) {
                // 무제한
                case '1':
                case 'M':
                  remainedVoice.unlimit = true;
                  return;
                // 기본제공
                case 'B':
                  remainedVoice.unlimit_default = true;
                  return;
              }
              
              // 제공량 및 잔여량 입력
              remainedVoice.total = +voice.total;
              remainedVoice.remained = +voice.remained;
  
              // 단위 설정
              remainedVoice.unit = voice.unit;
            }
          });
        }
        // 잔여 음성 조회 및 객체(remainedVoice) 설정 완료
  
  
  
        // 잔여 SMS 객체 생성
        const remainedSms: any = {
          isEmpty: true,
          unlimit: false, // 무제한 여부
          unlimit_default: false, // 기본제공 여부 (무제한 표기의 일종, '무제한'을 우선으로 표기)
          total : 0, // 제공량
          remained: 0, // 잔여량
          unit: '' // 단위
        };      
  
        // 미설정코드 처리 
        // 요청받은 SMS 공제코드가 없을 경우 첫번째 항목으로 기본값 설정
        if ( smsCode === null ) {
          if ( resp.result && resp.result.sms && resp.result.sms.length > 0 ) {
            smsCode = resp.result.sms[0].skipId;
          }
        }
        
        // SMS에서 공제코드 검색
        if ( resp.result && resp.result.sms ) {
          resp.result.sms.map((sms) => {
            // 요청한 공제코드가 있을 경우 잔여량 입력
            if ( sms.skipId === smsCode ) {
              remainedSms.isEmpty = false;
              
              // SMS 항목이 무제한 또는 기본제공일 경우 Flag 설정
              switch (sms.unlimit) {
                // 무제한
                case '1':
                case 'M':
                  remainedSms.unlimit = true;
                  return;
                // 기본제공
                case 'B':
                  remainedSms.unlimit_default = true;
                  return;
              }
  
              // 제공량 및 잔여량 입력
              remainedSms.total = +sms.total;
              remainedSms.remained = +sms.remained;
  
              // 단위 설정
              remainedSms.unit = sms.unit;
            }
          });
        }
        // 잔여 SMS 조회 및 객체(remainedSms) 설정 완료

        // 단위 변경 및 표기 양식 설정
        // 최종 Response 객체 선언 (Widget 표기용)
        const responseRemains = {
          svcMgmtNum: svcMgmtNum,
          data: {
            skipId: dataCodes.join(', '), // 조회한 데이터 공제코드
            isValid: false, // 해당 공제코드의 잔여량 조회 성공 여부
            remainedValue: '-', // 표기될 잔여량 숫자(또는 텍스트)
            remainedPercentage: 0, // 총 제공량 대비 잔여 데이터(T가족모아데이터 외)의 비율
            sharedRemainedPercentage: 0, // 총 제공량 대비 잔여 T가족모아데이터의 비율
          },
          voice: {
            skipId: voiceCode, // 조회한 음성 공제코드
            isValid: false, // 해당 공제코드의 잔여량 조회 성공 여부
            remainedValue: '-', // 표기될 잔여량 숫자(또는 텍스트)
            remainedPercentage: 0 // 총 제공량 대비 잔여 음성의 비율
          },
          sms: {
            skipId: smsCode, // 조회한 SMS 공제코드
            isValid: false, // 해당 공제코드의 잔여량 조회 성공 여부
            remainedValue: '-', // 표기될 잔여량 숫자(또는 텍스트)
            remainedPercentage: 0 // 총 제공량 대비 잔여 SMS의 비율
          }
         
        };

        if (voiceCode === 'NULL') {
          responseRemains.voice = 
          {
            skipId: voiceCode, // 조회한 음성 공제코드
            isValid: true, // 해당 공제코드의 잔여량 조회 성공 여부
            remainedValue: '미설정', // 표기될 잔여량 숫자(또는 텍스트)
            remainedPercentage: 0 // 총 제공량 대비 잔여 음성의 비율
          }
        }

        if (smsCode === 'NULL') {
          responseRemains.sms = {
            skipId: smsCode, // 조회한 SMS 공제코드
            isValid: true, // 해당 공제코드의 잔여량 조회 성공 여부
            remainedValue: '미설정', // 표기될 잔여량 숫자(또는 텍스트)
            remainedPercentage: 0 // 총 제공량 대비 잔여 SMS의 비율
          }
        }
        
        // 잔여 데이터 Response 양식 설정
        if ( remainedData.isEmpty === false ) {
          responseRemains.data.isValid = true;
          if ( remainedData.unlimit === true ) { // 잔여 데이터가 무제한인 경우
            responseRemains.data.remainedValue = UNLIMIT_NAME.WIDGET_UNLIMIT;
            responseRemains.data.remainedPercentage = 1;
          } else if ( remainedData.unlimit_default === true ) { // 잔여 데이터가 기본제공인 경우
            responseRemains.data.remainedValue = UNLIMIT_NAME.WIDGET_UNLIMIT_DEFAULT;
            responseRemains.data.remainedPercentage = 1;
          } else { // 잔여 데이터가 무제한이 아닌 경우
            if ( remainedData.unit === UNIT_E.DATA ) { // 잔여 데이터의 단위가 'KB'인 경우
              responseRemains.data.remainedValue = FormatHelper.convDataFormatWithUnit(remainedData.remained + remainedData.sharedRemained, UNIT[remainedData.unit]); // 용량 단위 변경 및 단위 텍스트 추가
              responseRemains.data.remainedPercentage = remainedData.total !== 0 ? remainedData.remained / remainedData.total : 0;
              responseRemains.data.sharedRemainedPercentage = remainedData.total !== 0 ? remainedData.sharedRemained / remainedData.total : 0;
            } else if ( remainedData.unit === UNIT_E.FEE ) { // 잔여 데이터의 단위가 '원'인 경우
              responseRemains.data.remainedValue = FormatHelper.getFeeContents(remainedData.remained + remainedData.sharedRemained) + UNIT[UNIT_E.FEE]; // 원 단위 변경 및 단위 텍스트 추가
              responseRemains.data.remainedPercentage = remainedData.total !== 0 ? remainedData.remained / remainedData.total : 0;
              responseRemains.data.sharedRemainedPercentage = remainedData.total !== 0 ? remainedData.sharedRemained / remainedData.total : 0;
            } else { // 잔여 데이터의 단위가 'KB' 또는 '원'이 아닌 경우
              responseRemains.data.isValid = false;
            }
          }
        }
  
        // 잔여 음성 Response 양식 설정
        if ( remainedVoice.isEmpty === false ) {
          responseRemains.voice.isValid = true;
          if ( remainedVoice.unlimit === true ) { // 잔여 음성이 무제한인 경우
            responseRemains.voice.remainedValue = UNLIMIT_NAME.WIDGET_UNLIMIT;
            responseRemains.voice.remainedPercentage = 1;
          } else if ( remainedVoice.unlimit_default === true ) { // 잔여 음성이 기본제공인 경우
            responseRemains.voice.remainedValue = UNLIMIT_NAME.WIDGET_UNLIMIT_DEFAULT;
            responseRemains.voice.remainedPercentage = 1;
          } else { // 잔여 음성이 무제한이 아닌 경우
            if ( remainedVoice.unit === UNIT_E.VOICE ) { // 잔여 음성의 단위가 '초'인 경우
              responseRemains.voice.remainedValue = FormatHelper.convVoiceMinFormatWithUnit( Math.floor(remainedVoice.remained / 60) ); // 시간 단위 변경 및 단위 텍스트 추가
              responseRemains.voice.remainedPercentage = remainedVoice.total !== 0 ? remainedVoice.remained / remainedVoice.total : 0;
            } else if ( remainedVoice.unit === UNIT_E.FEE ) { // 잔여 음성의 단위가 '원'인 경우
              responseRemains.voice.remainedValue = FormatHelper.getFeeContents(remainedVoice.remained) + UNIT[UNIT_E.FEE]; // 원 단위 변경 및 단위 텍스트 추가
              responseRemains.voice.remainedPercentage = remainedVoice.total !== 0 ? remainedVoice.remained / remainedVoice.total : 0;
            } else { // 잔여 음성의 단위가 '초' 또는 '원'이 아닌 경우
              responseRemains.voice.isValid = false;
            }
          }
        }
  
        // 잔여 SMS Response 양식 설정
        if ( remainedSms.isEmpty === false ) {
          responseRemains.sms.isValid = true;
          if ( remainedSms.unlimit === true ) { // 잔여 SMS가 무제한인 경우
            responseRemains.sms.remainedValue = UNLIMIT_NAME.WIDGET_UNLIMIT;
            responseRemains.sms.remainedPercentage = 1;
          } else if ( remainedSms.unlimit_default === true ) { // 잔여 SMS가 기본제공인 경우
            responseRemains.sms.remainedValue = UNLIMIT_NAME.WIDGET_UNLIMIT_DEFAULT;
            responseRemains.sms.remainedPercentage = 1;
          } else { // 잔여 SMS가 무제한이 아닌 경우
            if ( remainedSms.unit === UNIT_E.SMS || remainedSms.unit === UNIT_E.SMS_2 ) { // 잔여 SMS의 단위가 '건'인 경우
              responseRemains.sms.remainedValue = FormatHelper.convNumFormat(remainedSms.remained); // 3자리 콤마 및 단위 텍스트 추가
              responseRemains.sms.remainedPercentage = remainedSms.total !== 0 ? remainedSms.remained / remainedSms.total : 0;
            } else if ( remainedSms.unit === UNIT_E.FEE ) { // 잔여 SMS의 단위가 '원'인 경우
              responseRemains.sms.remainedValue = FormatHelper.getFeeContents(remainedSms.remained) + UNIT[UNIT_E.FEE]; // 원 단위 변경 및 단위 텍스트 추가
              responseRemains.sms.remainedPercentage = remainedSms.total !== 0 ? remainedSms.remained / remainedSms.total : 0;
            } else { // 잔여 SMS의 단위가 '건' 또는 '원'이 아닌 경우
              responseRemains.sms.isValid = false;
            }
          }
        }

        // 잔여량 백분율 변환(소수점 두자리)
        Object.keys(responseRemains).map((key) => {
          const keyObj = responseRemains[key];
          if (!FormatHelper.isEmpty(keyObj['remainedPercentage'])) {
            const value = keyObj['remainedPercentage'];
            keyObj['remainedPercentage'] = Number((value * 100).toFixed(2));
          }

          if (!FormatHelper.isEmpty(keyObj['sharedRemainedPercentage'])) {
            const value = keyObj['sharedRemainedPercentage'];
            keyObj['sharedRemainedPercentage'] = Number((value * 100).toFixed(2));
          }
        });
        resp.result = responseRemains;

        return res.json(resp);
      });
    });
  }
}

export default ApiRouter;

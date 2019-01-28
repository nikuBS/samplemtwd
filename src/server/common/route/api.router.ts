import express, { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { API_CMD, API_CODE } from '../../types/api-command.type';
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
import CryptoHelper from '../../utils/crypto.helper';
import { XTRACTOR_KEY } from '../../types/config.type';
import DateHelper from '../../utils/date.helper';

class ApiRouter {
  public router: Router;
  private logger: LoggerService = new LoggerService();
  private apiService: ApiService = new ApiService();
  private loginService: LoginService = new LoginService();
  private redisService: RedisService = RedisService.getInstance();

  constructor() {
    this.router = express.Router();
    this.setApi();
  }

  private setApi() {
    this.router.get('/health', this.checkHealth.bind(this));
    this.router.get('/environment', this.getEnvironment.bind(this));
    this.router.get('/domain', this.getDomain.bind(this));
    // this.router.post('/device', this.setDeviceInfo.bind(this));
    this.router.post('/user/sessions', this.loginTid.bind(this));   // BFF_03_0008
    this.router.post('/user/login/android', this.easyLoginAos.bind(this));    // BFF_03_0017
    this.router.post('/user/login/ios', this.easyLoginIos.bind(this));        // BFF_03_0018
    this.router.put('/common/selected-sessions', this.changeSession.bind(this));    // BFF_01_0003
    this.router.post('/user/service-password-sessions', this.loginSvcPassword.bind(this));    // BFF_03_0009
    this.router.delete('/user/locks', this.setUserLocks.bind(this));    // BFF_03_0010
    this.router.put('/core-auth/service-passwords', this.changeSvcPassword.bind(this));    // BFF_03_0016
    this.router.put('/user/services', this.changeLine.bind(this));    // BFF_03_0005
    this.router.put('/user/nick-names', this.changeNickname.bind(this));    // BFF_03_0006

    this.router.get('/common/selected-sessions', this.updateSvcInfo.bind(this));    // BFF_01_0005

    this.router.post('/logout-tid', this.logoutTid.bind(this));
    this.router.post('/session', this.generateSession.bind(this));

    this.router.post('/uploads', this.uploadFile.bind(this));
    this.router.get('/svcInfo', this.getSvcInfo.bind(this));
    this.router.get('/allSvcInfo', this.getAllSvcInfo.bind(this));
    this.router.get('/childInfo', this.getChildInfo.bind(this));
    // this.router.get('/serverSession', this.getServerSession.bind(this));
    this.router.put('/update/notice-type', this.updateNoticeType.bind(this));

    this.router.get('/app-version', this.getVersion.bind(this));
    this.router.get('/splash', this.getSplash.bind(this));
    this.router.get('/app-notice', this.getAppNotice.bind(this));
    this.router.get('/urlMeta', this.getUrlMeta.bind(this));
    this.router.get('/menu', this.getMenu.bind(this));
    this.router.get('/banner/admin', this.getBannerAdmin.bind(this));
    this.router.get('/banner/tos', this.getBannerTos.bind(this));
    this.router.get('/home/welcome', this.getHomeWelcome.bind(this));
    this.router.get('/home/notice', this.getHomeNotice.bind(this));
    this.router.get('/home/help', this.getHomeHelp.bind(this));
    this.router.get('/tooltip', this.getTooltip.bind(this));
    this.router.get('/home/quick-menu', this.getQuickMenu.bind(this));
    this.router.get('/home/quick-menu/default', this.getDefaultQuickMenu.bind(this));
    this.router.get('/product/comparison', this.getProductComparison.bind(this));
    this.router.get('/product/info', this.getProductInfo.bind(this));
    this.router.get('/masking-method', this.getMaskingMethod.bind(this));

    this.router.post('/masking-complete', this.setMaskingComplete.bind(this));
  }

  private checkHealth(req: Request, res: Response, next: NextFunction) {
    res.json({
      description: '',
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
        cdn: environment[env].CDN
      }
    };
    res.json(resp);
  }

  private getDomain(req: Request, res: Response, next: NextFunction) {
    const resp = {
      code: API_CODE.CODE_00,
      result: {
        domain: req.headers.host
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

  private getUrlMeta(req: Request, res: Response, next: NextFunction) {
    const url = this.loginService.getReferer(req);
    this.redisService.getData(REDIS_KEY.URL_META + url)
      .subscribe((resp) => {
        res.json(resp);
      });

  }

  private getMenu(req: Request, res: Response, next: NextFunction) {
    const code = BrowserHelper.isApp(req) ? MENU_CODE.MAPP : MENU_CODE.MWEB;

    const svcInfo = this.loginService.getSvcInfo(req);
    const allSvcInfo = this.loginService.getAllSvcInfo(req);
    this.logger.info(this, '[get menu]', req.cookies[COOKIE_KEY.TWM], this.loginService.getSessionId(req), svcInfo);
    this.redisService.getData(REDIS_KEY.MENU + code)
      .subscribe((resp) => {
        if ( resp.code === API_CODE.REDIS_SUCCESS ) {
          resp.result.isLogin = !FormatHelper.isEmpty(svcInfo);
          if ( resp.result.isLogin ) {
            resp.result.userInfo = svcInfo;
            resp.result.userInfo.canSendFreeSMS = allSvcInfo.m.reduce((memo, elem) => {
              if ( elem.svcAttrCd.includes('M1') || elem.svcAttrCd.includes('M3') ||
                elem.svcAttrCd.includes('M4') ) {
                return true;
              }
              return memo;
            }, false);
            if (svcInfo.totalSvcCnt !== '0' && svcInfo.expsSvcCnt === '0') {
              resp.result.userInfo.canSendFreeSMS = true;
            }
          }
          res.json(resp);
        } else {
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
    const code = req.query.code;
    const svcInfo = this.loginService.getSvcInfo(req);
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
    const svcInfo = this.loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) || FormatHelper.isEmpty(svcInfo.svcMgmtNum) ) {
      this.redisService.getData(REDIS_KEY.QUICK_DEFAULT + 'N')
        .subscribe((resp) => {
          if ( resp.code === API_CODE.CODE_00 ) {
            resp.result.enableEdit = 'N';
          }
          return res.json(resp);
        });
    } else {
      this.apiService.setCurrentReq(req, res);
      const svcMgmtNum = svcInfo.svcMgmtNum;
      this.redisService.getData(REDIS_KEY.QUICK_MENU + svcMgmtNum)
        .switchMap((resp) => {
          if ( resp.code === API_CODE.REDIS_SUCCESS ) {
            if ( resp.code === API_CODE.CODE_00 ) {
              resp.result.enableEdit = 'Y';
            }
            throw resp;
          } else {
            return this.apiService.request(API_CMD.BFF_04_0005, {});
          }
        })
        .switchMap((resp) => {
          if ( resp.code === API_CODE.CODE_00 ) {
            const defaultCode = resp.result;
            return this.redisService.getData(REDIS_KEY.QUICK_DEFAULT + defaultCode);
          } else {
            throw resp;
          }
        })
        .subscribe((resp) => {
          return res.json(resp);
        }, (err) => {
          return res.json(err);
        });
    }
  }

  private getDefaultQuickMenu(req: Request, res: Response, next: NextFunction) {
    const svcInfo = this.loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return res.json({
        code: API_CODE.NODE_1001,
        msg: NODE_API_ERROR[API_CODE.NODE_1001]
      });
    }

    this.apiService.request(API_CMD.BFF_04_0005, {})
      .switchMap((resp) => {
        if ( resp.code === API_CODE.CODE_00 ) {
          const defaultCode = resp.result;
          return this.redisService.getData(REDIS_KEY.QUICK_DEFAULT + defaultCode);
        } else {
          throw resp;
        }
      })
      .subscribe((resp) => {
        return res.json(resp);
      }, (err) => {
        return res.json(err);
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

  private getMaskingMethod(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_KEY.MASKING_METHOD)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private setMaskingComplete(req: Request, res: Response, next: NextFunction) {
    const svcInfo = this.loginService.getSvcInfo(req);
    if ( FormatHelper.isEmpty(svcInfo) ) {
      return res.json({
        code: API_CODE.NODE_1001,
        msg: NODE_API_ERROR[API_CODE.NODE_1001]
      });
    }
    const svcMgmtNum = req.body.svcMgmtNum;

    this.loginService.setCurrentReq(req, res);
    this.apiService.setCurrentReq(req, res);
    this.apiService.updateSvcInfo({})
      .switchMap((resp) => this.loginService.setMaskingCert(svcMgmtNum))
      .subscribe((resp) => {
        res.json({
          code: API_CODE.CODE_00
        });
      });
  }

  // private setDeviceInfo(req: Request, res: Response, next: NextFunction) {
  //   const deviceInfo = req.body;
  //   const deviceCookie = `osType:${deviceInfo.osType}|appVersion:${deviceInfo.appVersion}|osVersion:${deviceInfo.osVersion}`;
  //   this.logger.info(this, '[set cookie]', deviceCookie);
  //   res.cookie(COOKIE_KEY.DEVICE, deviceCookie);
  //   const resp = {
  //     code: API_CODE.CODE_00
  //   };
  //   res.json(resp);
  // }

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

  // private getServerSession(req: Request, res: Response, next: NextFunction) {
  //   this.logger.info(this, '[get serverSession]');
  //   this.apiService.setCurrentReq(req, res);
  //   this.loginService.setCurrentReq(req, res);
  //
  //   const svcInfo = this.loginService.getSvcInfo();
  //   let loginType = '';
  //   if ( !FormatHelper.isEmpty(svcInfo) ) {
  //     loginType = svcInfo.loginType;
  //   }
  //
  //   res.json({
  //     code: API_CODE.CODE_00,
  //     result: {
  //       serverSession: this.loginService.getServerSession(),
  //       loginType: loginType
  //     }
  //   });
  // }

  private getSvcInfo(req: Request, res: Response, next: NextFunction) {
    this.logger.info(this, '[get svcInfo]', req.cookies[COOKIE_KEY.TWM], this.loginService.getSessionId(req));
    // this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    res.json({
      code: API_CODE.CODE_00,
      result: this.loginService.getSvcInfo(req)
    });
  }

  private getAllSvcInfo(req: Request, res: Response, next: NextFunction) {
    this.logger.info(this, '[get allSvcInfo]');
    // this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    res.json({
      code: API_CODE.CODE_00,
      result: this.loginService.getAllSvcInfo(req)
    });
  }

  private getChildInfo(req: Request, res: Response, next: NextFunction) {
    this.logger.info(this, '[get childInfo]');
    // this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    res.json({
      code: API_CODE.CODE_00,
      result: this.loginService.getChildInfo(req)
    });
  }

  private updateNoticeType(req: Request, res: Response, next: NextFunction) {
    this.logger.info(this, '[update noticeType]');
    this.loginService.setCurrentReq(req, res);
    this.loginService.setSvcInfo({
      noticeType: ''
    }).subscribe((resp) => {
      res.json(resp);
    });
  }

  private changeSession(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.logger.info(this, '[chagne session]', params);

    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeSession(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private loginSvcPassword(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestLoginSvcPassword(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private loginTid(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestLoginTid(params.tokenId, params.state).subscribe((resp) => {
      this.logger.info(this, '[TID login]', resp);
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private logoutTid(req: Request, res: Response, next: NextFunction) {
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.request(API_CMD.BFF_03_0001, {})
      .switchMap((resp) => {
        return this.loginService.logoutSession();
      })
      .subscribe((resp) => {
        this.logger.info(this, '[TID logout]', this.loginService.getSvcInfo(req));
        res.json({ code: API_CODE.CODE_00 });
      });
  }

  private generateSession(req: Request, res: Response, next: NextFunction) {
    this.loginService.setCurrentReq(req, res);
    this.loginService.sessionGenerate(req).subscribe(() => {
      this.logger.info(this, '[Session ID]', this.loginService.getSessionId(req));
      res.json({ code: API_CODE.CODE_00 });
    });
  }

  private setUserLocks(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestUserLocks(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private easyLoginAos(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestEasyLoginAos(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private easyLoginIos(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestEasyLoginIos(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private changeSvcPassword(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeSvcPassword(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  public changeLine(req: Request, res: Response, next: NextFunction) {
    const params = req.body.params || {};
    const headers = req.body.headers || null;
    const pathParams = req.body.pathParams || [];
    const version = req.body.version || null;

    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeLine(params, headers, pathParams, version).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  public changeNickname(req: Request, res: Response, next: NextFunction) {
    const params = req.body.params || {};
    const headers = req.body.headers || null;
    const pathParams = req.body.pathParams || [];
    const version = req.body.version || null;

    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeNickname(params, headers, pathParams, version).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  public updateSvcInfo(req: Request, res: Response, next: NextFunction) {
    this.apiService.setCurrentReq(req, res);
    // this.loginService.setCurrentReq(req, res);
    this.apiService.updateSvcInfo({}).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

}

export default ApiRouter;

import express, { NextFunction, Request, Response, Router } from 'express';
import multer from 'multer';
import { API_CMD, API_CODE } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import {
  CHANNEL_CODE,
  MENU_CODE,
  REDIS_APP_VERSION,
  REDIS_BANNER_ADMIN,
  REDIS_CODE,
  REDIS_MASKING_METHOD,
  REDIS_MENU,
  REDIS_URL_META,
  REDIS_HOME_NOTICE,
  REDIS_HOME_HELP, REDIS_TOOLTIP, REDIS_HOME_NOTI
} from '../../types/redis.type';
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
    this.router.post('/logout-tid', this.logoutTid.bind(this));
    this.router.post('/user/login/android', this.easyLoginAos.bind(this));    // BFF_03_0017
    this.router.post('/user/login/ios', this.easyLoginIos.bind(this));        // BFF_03_0018
    this.router.put('/common/selected-sessions', this.changeSession.bind(this));    // BFF_01_0003
    this.router.post('/user/service-password-sessions', this.loginSvcPassword.bind(this));    // BFF_03_0009
    this.router.delete('/user/locks', this.setUserLocks.bind(this));    // BFF_03_0010
    this.router.put('/core-auth/v1/service-passwords', this.changeSvcPassword.bind(this));    // BFF_03_0016
    this.router.put('/user/services', this.changeLine.bind(this));    // BFF_03_0005
    this.router.get('/common/selected-sessions', this.updateSvcInfo.bind(this));    // BFF_01_0005
    this.router.post('/uploads', this.uploadFile.bind(this));
    this.router.get('/svcInfo', this.getSvcInfo.bind(this));
    this.router.get('/allSvcInfo', this.getAllSvcInfo.bind(this));
    this.router.get('/childInfo', this.getChildInfo.bind(this));
    this.router.get('/serverSession', this.getServerSession.bind(this));
    this.router.get('/app-version', this.getVersion.bind(this));
    this.router.get('/splash', this.getSplash.bind(this));
    this.router.get('/app-notice', this.getAppNotice.bind(this));

    this.router.get('/urlMeta', this.getUrlMeta.bind(this));
    this.router.get('/menu', this.getMenu.bind(this));
    this.router.get('/banner/admin', this.getBannerAdmin.bind(this));
    this.router.get('/home/welcome', this.getHomeWelcome.bind(this));
    this.router.get('/home/notice', this.getHomeNotice.bind(this));
    this.router.get('/home/help', this.getHomeHelp.bind(this));
    this.router.get('/tooltip', this.getTooltip.bind(this));
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
        domain: this.loginService.getDns()
      }
    };

    res.json(resp);
  }

  private getVersion(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_APP_VERSION)
      .subscribe((resp) => {
        if ( resp.code === REDIS_CODE.CODE_SUCCESS ) {
          resp.result = {
            ver: resp.result.ver,
            signGateGW: resp.result.signGateGW
          };
        }

        res.json(resp);
      });
  }

  private getSplash(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_APP_VERSION)
      .subscribe((resp) => {
        if ( resp.code === REDIS_CODE.CODE_SUCCESS ) {
          resp.result = resp.result.splash;
        }

        res.json(resp);
      });
  }

  private getAppNotice(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_APP_VERSION)
      .subscribe((resp) => {
        if ( resp.code === REDIS_CODE.CODE_SUCCESS ) {
          resp.result = resp.result.notice;
        }

        res.json(resp);
      });
  }

  private getUrlMeta(req: Request, res: Response, next: NextFunction) {
    const url = this.loginService.getReferer();
    this.redisService.getData(REDIS_URL_META + url)
      .subscribe((resp) => {
        res.json(resp);
      });

  }

  private getMenu(req: Request, res: Response, next: NextFunction) {
    const code = BrowserHelper.isApp(req) ? MENU_CODE.MAPP : MENU_CODE.MWEB;
    const svcInfo = this.loginService.getSvcInfo();
    this.redisService.getData(REDIS_MENU + code)
      .subscribe((resp) => {
        if ( resp.code === REDIS_CODE.CODE_SUCCESS ) {
          resp.result.isLogin = !FormatHelper.isEmpty(svcInfo);
          res.json(resp);
        } else {
          res.json(resp);
        }
      })
  }

  private getBannerAdmin(req: Request, res: Response, next: NextFunction) {
    const menuId = req.query.menuId;
    this.redisService.getData(REDIS_BANNER_ADMIN + menuId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getHomeWelcome(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_HOME_NOTI)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getHomeNotice(req: Request, res: Response, next: NextFunction) {
    const code = !BrowserHelper.isApp(req) ? CHANNEL_CODE.MWEB :
      BrowserHelper.isIos(req) ? CHANNEL_CODE.IOS : CHANNEL_CODE.ANDROID;
    this.redisService.getData(REDIS_HOME_NOTICE + code)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getHomeHelp(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_HOME_HELP)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getTooltip(req: Request, res: Response, next: NextFunction) {
    const menuId = req.query.menuId;
    this.redisService.getData(REDIS_TOOLTIP + menuId)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private getMaskingMethod(req: Request, res: Response, next: NextFunction) {
    this.redisService.getData(REDIS_MASKING_METHOD)
      .subscribe((resp) => {
        res.json(resp);
      });
  }

  private setMaskingComplete(req: Request, res: Response, next: NextFunction) {
    const svcMgmtNum = req.body.svcMgmtNum;
    this.loginService.setMaskingCert(svcMgmtNum).subscribe((resp) => {
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

  private getServerSession(req: Request, res: Response, next: NextFunction) {
    this.logger.info(this, '[get serverSession]');
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);

    const svcInfo = this.loginService.getSvcInfo();
    let loginType = '';
    if ( !FormatHelper.isEmpty(svcInfo) ) {
      loginType = svcInfo.loginType;
    }

    res.json({
      code: API_CODE.CODE_00,
      result: {
        serverSession: this.loginService.getServerSession(),
        loginType: loginType
      }
    });
  }

  private getSvcInfo(req: Request, res: Response, next: NextFunction) {
    this.logger.info(this, '[get svcInfo]');
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    res.json({
      code: API_CODE.CODE_00,
      result: this.loginService.getSvcInfo()
    });
  }

  private getAllSvcInfo(req: Request, res: Response, next: NextFunction) {
    this.logger.info(this, '[get allSvcInfo]');
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    res.json({
      code: API_CODE.CODE_00,
      result: this.loginService.getAllSvcInfo()
    });
  }

  private getChildInfo(req: Request, res: Response, next: NextFunction) {
    this.logger.info(this, '[get childInfo]');
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    res.json({
      code: API_CODE.CODE_00,
      result: this.loginService.getChildInfo()
    });
  }

  private changeSession(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.logger.info(this, '[chagne session]', params);
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeSession(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private loginSvcPassword(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestLoginSvcPassword(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private loginTid(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestLoginTid(params.tokenId, params.state).subscribe((resp) => {
      this.logger.info('[TID login]', resp);
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private logoutTid(req: Request, res: Response, next: NextFunction) {
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    Observable.combineLatest(
      this.apiService.request(API_CMD.BFF_03_0001, {}),
      this.loginService.logoutSession()
    ).subscribe((resp) => {
      res.json({ code: API_CODE.CODE_00 });
    });
  }

  private setUserLocks(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestUserLocks(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private easyLoginAos(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestEasyLoginAos(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private easyLoginIos(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestEasyLoginIos(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private changeSvcPassword(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeSvcPassword(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  public changeLine(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeLine(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  public updateSvcInfo(req: Request, res: Response, next: NextFunction) {
    this.apiService.setCurrentReq(req, res);
    this.loginService.setCurrentReq(req, res);
    this.apiService.updateSvcInfo().subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }
}

export default ApiRouter;

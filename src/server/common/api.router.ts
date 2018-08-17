import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { API_CMD, API_CODE } from '../types/api-command.type';
import LoggerService from '../services/logger.service';
import ApiService from '../services/api.service';
import LoginService from '../services/login.service';
import { COOKIE_KEY } from '../types/common.type';
import { Observable } from '../../../node_modules/rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import * as path from 'path';

class ApiRouter {
  public router: Router;
  private upload;
  private logger: LoggerService = new LoggerService();
  private apiService: ApiService = new ApiService();
  private loginService: LoginService = new LoginService();

  constructor() {
    this.router = express.Router();
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, __dirname + '../../../../uploads/');
      },
      filename: (req, file, cb) => {
        cb(null, new Date().valueOf() + path.extname(file.originalname));
      },
      limits: { fileSize: 5 * 1024 * 1024 }
    });
    this.upload = multer({ storage: storage }).array('file');

    this.setApi();
  }

  private setApi() {
    this.router.get('/environment', this.getEnvironment.bind(this));
    this.router.post('/device', this.setDeviceInfo.bind(this));
    this.router.post('/user/sessions', this.loginTid.bind(this));   // BFF_03_0008
    this.router.post('/logout-tid', this.logoutTid.bind(this));
    this.router.post('/user/login/android', this.easyLoginAos.bind(this));    // BFF_03_0017
    this.router.post('/user/login/ios', this.easyLoginIos.bind(this));        // BFF_03_0018
    this.router.put('/common/selected-sessions', this.changeSession.bind(this));    // BFF_01_0004
    this.router.post('/user/service-password-sessions', this.loginSvcPassword.bind(this));    // BFF_03_0009
    this.router.delete('/user/locks', this.setUserLocks.bind(this));    // BFF_03_0010
    this.router.put('/core-auth/v1/service-passwords', this.changeSvcPassword.bind(this));    // BFF_03_0016
    this.router.put('/user/services', this.changeLine.bind(this));    // BFF_03_0005

    this.router.post('/uploads', (req, res, next) => {
      this.upload(req, res, (err) => {
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
              originalName: file.originalname
            };
          })
        };
        res.json(resp);
      });
    });

  }

  private getEnvironment(req: Request, res: Response, next: NextFunction) {
    const resp = {
      code: API_CODE.CODE_00,
      result: {
        environment: process.env.NODE_ENV
      }
    };
    res.json(resp);
  }

  private setDeviceInfo(req: Request, res: Response, next: NextFunction) {
    const deviceInfo = req.body;
    const deviceCookie = `osType:${deviceInfo.osType}|appVersion:${deviceInfo.appVersion}|osVersion:${deviceInfo.osVersion}`;
    this.logger.info(this, '[set cookie]', deviceCookie);
    res.cookie(COOKIE_KEY.DEVICE, deviceCookie);
    const resp = {
      code: API_CODE.CODE_00
    };
    res.json(resp);
  }

  private changeSession(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.logger.info(this, '[chagne session]', params);
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeSession(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private loginSvcPassword(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestLoginSvcPassword(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private loginTid(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestLoginTid(params.tokenId, params.state).subscribe((resp) => {
      this.logger.info('[TID login]', resp);
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private logoutTid(req: Request, res: Response, next: NextFunction) {
    this.loginService.setCurrentReq(req, res);
    Observable.combineLatest(
      this.apiService.request(API_CMD.LOGOUT_BFF, {}),
      this.loginService.logoutSession()
    ).subscribe((resp) => {
      res.json({ code: API_CODE.CODE_00 });
    });
  }

  private setUserLocks(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestUserLocks(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private easyLoginAos(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestEasyLoginAos(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private easyLoginIos(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestEasyLoginIos(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private changeSvcPassword(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeSvcPassword(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  public changeLine(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.loginService.setCurrentReq(req, res);
    this.apiService.requestChangeLine(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    })
  }
}

export default ApiRouter;

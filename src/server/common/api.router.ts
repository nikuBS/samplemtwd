import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import { API_CODE } from '../types/api-command.type';
import LoggerService from '../services/logger.service';
import ApiService from '../services/api.service';
import LoginService from '../services/login.service';
import BrowserHelper from '../utils/browser.helper';
import { CHANNEL_TYPE, COOKIE_KEY } from '../types/bff-common.type';

class ApiRouter {
  public router: Router;
  private logger: LoggerService = new LoggerService();
  private apiService: ApiService = new ApiService();
  private loginService: LoginService = new LoginService();

  constructor() {
    this.router = express.Router();

    this.setApi();
  }

  private setApi() {
    this.router.get('/environment', this.getEnvironment.bind(this));
    this.router.post('/device', this.setDeviceInfo.bind(this));
    this.router.post('/channel', this.setChannel.bind(this));
    this.router.post('/change-session', this.changeSession.bind(this));
    this.router.post('/service-password-sessions/login', this.svcPasswordLogin.bind(this));
    this.router.post('/login-tid', this.loginTid.bind(this));
    this.router.post('/logout-tid', this.logoutTid.bind(this));
    this.router.post('/user-locks/login', this.setUserLocks.bind(this));
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
    const deviceCookie = `osType: ${deviceInfo.osType}; appVersion: ${deviceInfo.appVersion}; osVersion: ${deviceInfo.osVersion}`;
    this.logger.info(this, '[set cookie]', deviceCookie);
    res.cookie(COOKIE_KEY.DEVICE, deviceCookie);
    const resp = {
      code: API_CODE.CODE_00
    };
    res.json(resp);
  }

  private setChannel(req: Request, res: Response, next: NextFunction) {
    const channel = BrowserHelper.isApp(req) ? CHANNEL_TYPE.MOBILE_APP : CHANNEL_TYPE.MOBILE_WEB;
    res.cookie(COOKIE_KEY.CHANNEL, channel);
    const resp = {
      code: API_CODE.CODE_00
    };
    res.json(resp);
  }

  private changeSession(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.logger.info(this, '[chagne session]', params);
    this.apiService.requestChangeSession(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private svcPasswordLogin(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.requestSvcPasswordLogin(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private loginTid(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.requestLoginTid(params.tokenId, params.state).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }

  private logoutTid(req: Request, res: Response, next: NextFunction) {
    this.loginService.logoutSession();
    res.clearCookie('TWM');
    res.json({ code: API_CODE.CODE_00 });
  }

  private setUserLocks(req: Request, res: Response, next: NextFunction) {
    const params = req.body;
    this.apiService.requestUserLocks(params).subscribe((resp) => {
      res.json(resp);
    }, (error) => {
      res.json(error);
    });
  }
}

export default ApiRouter;

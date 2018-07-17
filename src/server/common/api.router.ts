import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import { API_CODE } from '../types/api-command.type';
import LoggerService from '../services/logger.service';
import ApiService from '../services/api.service';

class ApiRouter {
  public router: Router;
  private logger: LoggerService = new LoggerService();
  private apiService: ApiService = new ApiService();

  constructor() {
    this.router = express.Router();

    this.setApi();
  }

  private setApi() {
    this.router.get('/environment', this.getEnvironment.bind(this));
    this.router.post('/device', this.setDeviceInfo.bind(this));
    this.router.post('/change-session', this.changeSession.bind(this));
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
    res.cookie('device', deviceCookie);
    const resp = {
      code: API_CODE.CODE_00
    };
    res.json(resp);
  }

  private changeSession(req: Request, res: Response, next: NextFunction) {
    const svcMgmtNum = req.body;
    this.logger.info(this, '[chagne session]', svcMgmtNum);
    this.apiService.requestChangeSession(svcMgmtNum).subscribe((resp) => {
      res.json(resp);
    });
  }
}

export default ApiRouter;

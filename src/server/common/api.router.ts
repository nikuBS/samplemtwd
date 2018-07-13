import express from 'express';
import { Router, Request, Response, NextFunction } from 'express';
import { API_CODE } from '../types/api-command.type';
import LoggerService from '../services/logger.service';

class ApiRouter {
  public router: Router;
  private logger: LoggerService = new LoggerService();

  constructor() {
    this.router = express.Router();

    this.setApi();
  }

  private setApi() {
    this.router.get('/environment', this.getEnvironment.bind(this));
    this.router.post('/device', this.setDeviceInfo.bind(this));
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
}

export default ApiRouter;

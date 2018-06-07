import { Request, Response, NextFunction } from 'express';
import ApiService from '../../services/api.service';
import LoginService from '../../services/login.service';
import { API_CMD } from '../../types/api-command.type';
import LoggerService from '../../services/logger.service';

abstract class TwViewController {
  private _apiService;
  private _loginService;
  private _logger;

  constructor() {
    this._apiService = new ApiService();
    this._loginService = new LoginService();
    this._logger = new LoggerService();
  }

  abstract render(req: Request, res: Response, next: NextFunction, svcInfo?: any): void;

  protected get apiService(): any {
    return this._apiService;
  }

  protected get loginService(): LoginService {
    return this._loginService;
  }

  protected get logger(): LoggerService {
    return this._logger;
  }

  public checkLogin(req: any, res: any, next: any): void {
    const userId = req.query.userId;
    const defaultSvc = {
      custNm: '',
      svcCd: '',
      svcNum: '',
      svcNickNm: '',
      repSvcYn: '',
      svcCnt: '',
    };

    let loginCmd = API_CMD.BFF_03_0001;
    if ( userId === 'mock' ) {
      loginCmd = API_CMD.BFF_03_0001_mock;
    }

    if ( this._loginService.isLogin(userId) ) {
      this.render(req, res, next, this._loginService.getSvcInfo());
    } else {
      this._apiService.request(loginCmd, { userId }).subscribe((resp) => {
        this.render(req, res, next, resp.result || defaultSvc);
      });
    }
  }

}

export default TwViewController;
